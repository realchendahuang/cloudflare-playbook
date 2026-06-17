---
title: Durable Objects
description: Cloudflare Durable Objects 的定位、免费额度、付费边界、适用场景和常见误区。
---

最后核对日期：2026-06-18。Context7 当前返回配额超限，本页数字已回到 Cloudflare 官方 Durable Objects Pricing / Limits 页面核对。

Durable Objects 是 Cloudflare 的单实体强一致状态单元。它适合处理“同一个房间、用户、资源、租户或限流 key 必须按顺序决策”的问题。

先记住一句：**一个需要串行决策的实体一个对象；不要把 Durable Objects 当全站数据库。**

## 该不该用

| 场景 | 判断 |
| --- | --- |
| 聊天房间、协作文档、多人房间 | 适合。一个房间一个对象，负责成员状态、广播和顺序事件。 |
| 单资源库存、座位、预约、锁 | 适合。同一个资源的写入需要串行判断。 |
| IP / 用户 / token 限流器 | 适合。每个 key 一个对象，短窗口状态很清楚。 |
| WebSocket presence 和实时通知 | 适合，但必须优先用 WebSocket Hibernation。 |
| per-user / per-tenant 小状态 | 可以。边界清楚、状态不大时很好用。 |
| 全站评论、文章、订单列表 | 不优先。关系数据、排序、分页和筛选放 D1。 |
| 大文件、图片、附件 | 不适合。文件本体放 R2，DO 只存协调状态。 |
| 全局搜索、分析、日志 | 不适合。搜索看 Pagefind / AI Search / Vectorize，分析看 Analytics Engine。 |
| 高吞吐独立写入 | 谨慎。按实体拆对象，必要时再分片。 |

## 免费与付费边界

| 能力 | Workers Free | Workers Paid / Standard | 判断 |
| --- | --- | --- | --- |
| 可用 backend | 只支持 SQLite-backed Durable Objects | SQLite-backed 和 legacy key-value backend | 新项目默认 SQLite-backed；不要为新项目选 legacy backend。 |
| Requests | 100,000/day | 1M/month included，超出 $0.15/million | HTTP request、RPC session、WebSocket message、alarm invocation 都会进入这条线。 |
| Duration | 13,000 GB-s/day | 400,000 GB-s/month included，超出 $12.50/million GB-s | active 或不能休眠的 idle 对象会计 duration。 |
| SQLite rows read | 5M/day | 25B/month included，超出 $0.001/million rows | 和 D1 一样，索引和查询形状决定成本。 |
| SQLite rows written | 100k/day | 50M/month included，超出 $1.00/million rows | 写入、删除、`setAlarm()` 都要算。 |
| SQL stored data | 5 GB total | 5 GB-month included，超出 $0.20/GB-month | Free 足够小型房间、会话和限流器，不适合全站大数据。 |
| Durable Object classes | 100/account | 500/account | class 是类型，不是对象实例；普通项目通常不会先撞这里。 |
| 单对象存储 | Free 写入失败边界按 1 GB/object 保守设计；Paid SQLite-backed 为 10 GB/object | 10 GB/object | 大 payload 放 R2，不要塞进单对象。 |

Free 计划的每日限制在 00:00 UTC 重置。超过某一类免费限制后，对应类型的后续操作会失败；这不是预算提醒，而是硬边界。

## 最重要的坑

| 坑 | 影响 | 做法 |
| --- | --- | --- |
| 全站一个 Durable Object | 单对象变热点，吞吐和成本都集中。 | 按 room、user、tenant、resource、rateLimitKey 拆。 |
| 普通 WebSocket 长连不用 hibernation | 连接期间可能持续计 duration。 | 实时房间默认使用 WebSocket Hibernation。 |
| 把 DO 当关系数据库 | 全局列表、搜索、报表会很难做。 | 关系数据放 D1，DO 只管单实体决策。 |
| 关键状态只放内存 | 休眠、部署、重启后会丢。 | 关键状态写 SQLite；内存只做热缓存。 |
| constructor 做重活 | 冷启动和休眠唤醒都会重新执行。 | constructor 只做轻量恢复和必要初始化。 |
| 直接删除 class migration | 会删除对应 class 的对象和数据。 | 删除前先迁移或导出数据。 |
| 假设 alarm exactly-once | 重试会造成重复执行。 | alarm handler 必须幂等。 |

## 设计原则

| 原则 | 判断 |
| --- | --- |
| 对象 ID 来自业务实体 | 用 `roomId`、`userId`、`tenantId`、`resourceId`，不要用全局 `GLOBAL`。 |
| DO 负责协调，不负责全站查询 | 单实体状态留在 DO，列表、筛选、报表放 D1 / Analytics Engine。 |
| 大对象只存引用 | 文件、图片、导出物进 R2，DO 只存 key、状态和小索引。 |
| 实时默认休眠 | 有 WebSocket 就先问：空闲时能不能 hibernate。 |
| 写路径保持短 | 外部慢 API、批处理和重任务不要塞进同一个对象请求。 |
| 迁移当数据操作 | `new_sqlite_classes`、`renamed_classes`、`deleted_classes` 都要按生产数据变更审。 |
| 热点要分片 | 官方 FAQ 提到单对象约 1,000 requests/second 软限制，更高吞吐要拆对象或分片。 |

## 和其他产品怎么选

| 需求 | 优先产品 |
| --- | --- |
| 单实体强一致、房间、锁、限流器 | Durable Objects |
| 评论、订单、用户表、权限表 | D1 |
| 读多写少配置和缓存 | KV |
| 文件、图片、附件、导出物 | R2 |
| 异步任务、削峰、重试 | Queues |
| 长流程、等待、步骤状态 | Workflows |
| 文本实时房间 | Durable Objects + WebSocket Hibernation |
| 音视频实时通信 | RealtimeKit / Realtime SFU / TURN |
| Agent 状态 | Agents SDK / Actors，底层仍要理解 Durable Objects 成本线。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| Durable Objects 比 D1 更高级，所以都用 DO。 | D1 管关系数据，DO 管单实体强一致协调。 |
| 免费额度只看 requests。 | 同时看 requests、GB-s、rows read、rows written、stored data。 |
| WebSocket 能连上就行。 | 能休眠才适合低成本长期连接。 |
| 一个对象里保存所有用户状态。 | 每个用户、房间、资源拆成独立对象。 |
| 用 DO 做日志和分析。 | 日志和指标看 Workers Logs、Analytics Engine、Logpush。 |
| 迁移失败再回滚就好。 | DO migration 牵涉对象数据，删除和重命名必须提前审。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs Durable Objects source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/durable-objects) | 官方 Durable Objects 文档源文件。 |
| [cloudflare/workers-sdk C3 Durable Object template](https://github.com/cloudflare/workers-sdk/tree/main/packages/create-cloudflare/templates/hello-world-durable-object/ts) | 官方最小模板和 Wrangler 结构。 |
| [cloudflare/workers-chat-demo](https://github.com/cloudflare/workers-chat-demo) | 一个 chat room 一个 Durable Object 的示例。 |
| [cloudflare/websocket-template](https://github.com/cloudflare/websocket-template) | Workers WebSocket 模板。 |
| [cloudflare/actors](https://github.com/cloudflare/actors) | 基于 Durable Objects 的 Actors 抽象。 |
| [lambrospetrou/durable-utils](https://github.com/lambrospetrou/durable-utils) | Durable Objects 分片和 SQLite migration 工具思路。 |

## 事实来源

- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Durable Objects Limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
- [Lifecycle of a Durable Object](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/)
- [Use WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- [Durable Objects migrations](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/)
- [Durable Objects FAQs](https://developers.cloudflare.com/durable-objects/reference/faq/)
