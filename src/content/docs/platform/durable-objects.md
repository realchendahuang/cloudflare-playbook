---
title: Durable Objects
description: Cloudflare Durable Objects 的定位、免费额度、付费边界、适用场景和常见误区。
---

最后核对日期：2026-06-18。

Durable Objects 是 Cloudflare 的单实体强一致状态单元。它适合处理“同一个房间、用户、资源、租户或限流 key 必须按顺序决策”的问题。

先记住一句：**一个需要串行决策的实体一个对象；不要把 Durable Objects 当全站数据库。**

## 先判断

| 场景 | 建议 |
| --- | --- |
| 聊天房间、协作文档、多人房间 | 适合，一个房间一个对象。 |
| 座位、库存、预约、锁 | 适合，同一资源的写入需要串行判断。 |
| IP / 用户 / token 限流器 | 适合，每个 key 一个对象。 |
| WebSocket presence 和通知 | 适合，但要优先用 WebSocket Hibernation。 |
| per-user / per-tenant 小状态 | 可以，边界清楚时很好用。 |
| 全站评论、订单、文章列表 | 不优先，关系查询交给 D1。 |
| 大文件、图片、附件 | 不适合，文件进 R2。 |
| 全局搜索、分析、日志 | 不适合，交给专门产品。 |

## 免费与付费边界

| 能力 | Free | Workers Paid | 判断 |
| --- | --- | --- | --- |
| Requests | 100,000/day | 1M/month included | 请求、RPC、WebSocket message、alarm 都要看。 |
| Duration | 13,000 GB-s/day | 400,000 GB-s/month included | 空闲连接要能 hibernate。 |
| SQLite rows read | 5M/day | 25B/month included | 查询形状和索引决定成本。 |
| SQLite rows written | 100k/day | 50M/month included | 写入、删除、alarm 都会影响。 |
| SQL stored data | 5 GB total | 5 GB-month included | 小房间、会话和限流器够起步。 |
| 单对象存储 | Free 保守按 1 GB/object 设计 | SQLite-backed 可到 10 GB/object | 大 payload 放 R2。 |

Free 每日限制按 UTC 重置；超过对应限制后，后续操作可能失败。这是硬边界，不是预算提醒。

## 最重要的坑

| 坑 | 做法 |
| --- | --- |
| 全站一个 Durable Object。 | 按 room、user、tenant、resource、rateLimitKey 拆。 |
| WebSocket 不用 hibernation。 | 实时房间默认使用 WebSocket Hibernation。 |
| 把 DO 当关系数据库。 | 列表、筛选、报表放 D1 / Analytics Engine。 |
| 关键状态只放内存。 | 关键状态写 SQLite，内存只做热缓存。 |
| 初始化逻辑做重活。 | 初始化只做轻量恢复和必要准备。 |
| 迁移当普通配置改。 | 删除、重命名 class 前先审数据影响。 |
| 假设 alarm 只执行一次。 | alarm handler 必须幂等。 |

## 和其他产品怎么选

| 需求 | 优先产品 |
| --- | --- |
| 单实体强一致、房间、锁、限流器 | Durable Objects |
| 评论、订单、用户表、权限表 | D1 |
| 读多写少配置和缓存 | KV |
| 文件、图片、附件、导出物 | R2 |
| 异步任务、削峰、重试 | Queues |
| 长流程、等待、步骤状态 | Workflows |
| 音视频实时通信 | RealtimeKit / Realtime SFU / TURN |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| Durable Objects 比 D1 高级，所以都用 DO。 | D1 管关系数据，DO 管单实体协调。 |
| 免费额度只看 requests。 | 同时看 requests、GB-s、rows read、rows written、stored data。 |
| WebSocket 能连上就行。 | 能休眠才适合低成本长期连接。 |
| 一个对象保存所有用户状态。 | 每个用户、房间、资源拆成独立对象。 |
| 用 DO 做日志和分析。 | 日志和指标看 Workers Logs、Analytics Engine、Logpush。 |

## 事实来源

- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Durable Objects Limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
- [Lifecycle of a Durable Object](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/)
- [Use WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- [Durable Objects migrations](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/)
