---
title: 实时应用
description: 用 Durable Objects 承载房间、协作和强一致状态的架构模式。
---

最后核对日期：2026-06-18。

实时应用不是一个单独产品选择，而是一组状态问题。普通项目最常见的是聊天、在线状态、协作文档、多人白板、游戏房间、单资源限流和任务协调：它们都需要“某个房间、某个用户、某个资源”拥有强一致状态。[Durable Objects](/platform/durable-objects/) 很适合承载这种单对象协调逻辑。

如果实时需求是音频、视频或 WebRTC，请看 [Realtime](/platform/realtime/)；RealtimeKit、Realtime SFU 和 TURN 解决的是媒体传输问题，不是普通文本房间状态问题。

## 先判断是哪种实时

| 需求 | 优先路线 | 不要先做什么 |
| --- | --- | --- |
| 聊天、通知、在线人数 | Worker + Durable Objects + WebSocket Hibernation。 | 不要把每条消息先写 D1 再轮询。 |
| 协作文档、白板、多人编辑 | 一个文档或房间一个 Durable Object，历史和索引另存。 | 不要用 KV 做锁或共享编辑状态。 |
| 轻量多人游戏 | 一个局或房间一个 Durable Object，消息批处理。 | 不要把所有房间塞进一个全局对象。 |
| 单资源限流、锁、顺序写入 | 一个资源 key 一个 Durable Object。 | 不要依赖普通 Worker 内存变量。 |
| 音视频会议、课堂、语音房 | RealtimeKit / Realtime SFU / TURN。 | 不要用 Durable Object WebSocket 转发媒体流。 |

## 三层责任

| 层 | 放什么 | 不放什么 |
| --- | --- | --- |
| 边界层 Worker | 鉴权、参数校验、权限判断、CORS、路由、把请求转给对应 DO。 | 房间内强一致状态、在线连接表。 |
| 控制面 D1 / DO | 创建房间、删除房间、列出资源、保存资源元数据。 | 高频消息、编辑操作和广播。 |
| 数据面 DO | 单房间、单文档、单用户或单资源的实时状态、连接和顺序写入。 | 全局搜索、报表、长历史查询。 |

小项目可以没有独立控制面 DO，直接让 Worker + D1 管资源列表，再按资源 ID 路由到数据面 DO。只有当“创建、删除、列表、权限变更”本身也需要强一致协调时，才引入控制面 DO。

## 对象怎么切

| 切法 | 适合 | 风险 |
| --- | --- | --- |
| 一个房间一个对象 | 聊天、协作、多人编辑。 | 超大房间要设计分片、只读副本或消息归档。 |
| 一个用户一个对象 | 用户状态、会话、个人任务队列。 | 用户跨设备同步要明确权限和恢复逻辑。 |
| 一个资源一个对象 | 文档、订单、限流桶、游戏局。 | 资源 ID 要稳定，迁移和删除要可追踪。 |
| 一个租户一个对象 | 小租户管理面、配置控制面。 | 大租户容易变成单点瓶颈。 |

最重要的规则是：**一个对象只负责一个协调原子**。如果两个事件必须严格按顺序处理，它们应该进同一个对象；如果两个事件没有顺序关系，就应该拆到不同对象。

| 判断问题 | 架构动作 |
| --- | --- |
| 同一个资源内的并发写入必须串行吗？ | 这个资源需要自己的 DO。 |
| 这个资源会不会增长到很多用户同时在线？ | 先用一个 DO，保留按子房间、分片或只读副本拆分的边界。 |
| 是否需要列出全部资源？ | 列表和索引放 D1，别扫描 DO。 |
| 是否需要长期检索历史消息？ | 历史进入 D1/R2，DO 只保热状态和短历史。 |
| 是否需要跨房间全局限流？ | 限流 key 独立成 DO，例如一个 IP 或一个 userId 一个对象。 |

## 常见组合

| 场景 | 推荐组合 | 判断 |
| --- | --- | --- |
| 文本房间 / 协作 | Worker + Durable Objects + WebSocket Hibernation | DO 承载连接和共享状态，空闲时让连接休眠。 |
| 需要异步副作用 | Durable Objects + Queues | 广播和状态更新在 DO 内完成，邮件、通知、归档进 Queue。 |
| 需要长期查询 | Durable Objects + D1 / R2 | DO 管实时状态，D1/R2 存历史、索引和归档。 |
| 音视频房间 | RealtimeKit / Realtime SFU / TURN | 媒体传输不要用普通 Durable Object WebSocket 硬扛。 |

## 状态归位

| 状态 | 放哪里 | 原因 |
| --- | --- | --- |
| 当前在线连接 | DO WebSocket 列表和 attachment。 | 连接天然属于房间或资源对象。 |
| 当前房间状态 | DO 内存 + SQLite-backed storage。 | 热状态读写快，关键状态可恢复。 |
| 最近消息 / 快照 | DO SQLite 或 D1。 | 重连时可以快速恢复上下文。 |
| 长历史 / 导出 | R2。 | 便宜、适合对象文件和归档。 |
| 列表、搜索、报表 | D1 / Vectorize / Analytics Engine。 | DO 不适合做全局扫描和复杂查询。 |
| 通知、Webhook、清理 | Queues / Workflows。 | 不阻塞实时主路径，可重试。 |

实时主路径要短：验证请求、命中对象、更新状态、广播结果。归档、通知、搜索索引、邮件和 Webhook 这些慢副作用不要塞在 WebSocket 消息处理里。

## 成本边界

| 成本项 | 免费边界 | Workers Paid / 超出后 | 实时应用判断 |
| --- | --- | --- | --- |
| Worker 请求 | Free 100,000 requests/day。 | Workers Paid 最低 `$5/month`，含 10M requests/month。 | 边界层 Worker 要轻，静态资产请求免费且不限量。 |
| DO requests | Free 100,000/day。 | Paid 含 1M/month，超出按量。 | 建连、RPC、alarm、入站消息都会影响请求口径。 |
| DO duration | Free 13,000 GB-s/day。 | Paid 含 400,000 GB-s/month，超出按量。 | Hibernation 是控制 duration 的关键。 |
| DO SQLite storage | Free 总计 5 GB。 | Paid 含 5 GB-month，超出按量；行读写按 D1 口径计费。 | 房间短历史可以放 DO，长历史不要无限堆。 |
| Queues | Free 10,000 operations/day。 | Paid 含 1M operations/month，超出按量。 | 只把慢副作用放队列，消息体尽量小。 |

这些数字来自 Cloudflare 官方 pricing 页面；价格和额度会变，正式上线前以 [免费额度大全](/platform/free-paid/) 和官方 pricing 为准。

## 风险清单

| 风险 | 更好的做法 |
| --- | --- |
| 所有用户进同一个 Durable Object。 | 按房间、租户、资源 ID 或用户切对象。 |
| WebSocket 长连接持续产生 duration 成本。 | 新实时房间优先使用 WebSocket Hibernation。 |
| 控制面对象承担高频消息。 | 控制面只做创建、删除、列表和权限，数据面 DO 承接实时消息。 |
| 单个对象变成全站热点。 | 评估分片、只读副本、子房间或消息归档。 |
| DO 被当成全局数据库。 | 列表、搜索、报表落到 D1、R2、Vectorize 或 Analytics Engine。 |
| 音视频媒体流走普通 WebSocket。 | 媒体传输走 RealtimeKit、Realtime SFU 或 TURN。 |

## 上线前检查

| 检查 | 判断 |
| --- | --- |
| 对象划分 | 同时创建多个房间或资源，确认请求能命中不同对象。 |
| 重连 | 刷新页面、断网重连、Worker 部署后，客户端能恢复到正确状态。 |
| 空闲成本 | 使用 Hibernation API，避免空闲连接让对象持续运行。 |
| 顺序 | 同一资源的并发写入按预期串行处理。 |
| 后台任务 | 归档、通知、清理任务可以失败重试，不影响实时主路径。 |
| 热点对象 | 单房间高频消息下延迟、CPU 和错误率没有异常。 |
| 历史恢复 | 新连接能拿到最近消息或快照，长期历史从 D1/R2 查询。 |

## 什么时候不用这套架构

| 场景 | 更合适的路线 |
| --- | --- |
| 静态评论、低频留言 | D1 + 普通 Worker API，必要时前端轮询或增量刷新。 |
| 全站搜索 | AI Search / Vectorize / D1 / 外部搜索服务。 |
| 大文件协作上传 | R2 直传 + Worker 签名，DO 只协调上传状态。 |
| 音视频会议 | RealtimeKit 起步；需要自定义媒体拓扑再看 Realtime SFU。 |
| 大规模分析看板 | Analytics Engine / Logpush / R2 数据湖。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/workers-chat-demo](https://github.com/cloudflare/workers-chat-demo) | 一个聊天室一个 DO、WebSocket Hibernation、历史消息、按 IP 限流器。 |
| [cloudflare/cloudflare-docs Durable Objects source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/durable-objects) | Durable Objects 官方文档源文件，可追踪 pricing、limits、WebSocket、lifecycle。 |
| [cloudflare/cloudflare-docs control/data plane source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/reference-architecture/diagrams/storage/durable-object-control-data-plane-pattern.mdx) | 官方 control/data plane 架构源文件，适合核对对象拆分原则。 |
| [cloudflare/realtime-examples](https://github.com/cloudflare/realtime-examples) | Realtime SFU、TURN、DataChannels、WHIP/WHEP 示例，用来区分媒体实时和状态实时。 |
| [cloudflare/realtimekit-web-examples](https://github.com/cloudflare/realtimekit-web-examples) | RealtimeKit Web 集成样例，适合需要音视频 UI 的项目。 |

## 事实来源

- [Add real-time features](https://developers.cloudflare.com/use-cases/web-apps/real-time/)
- [Durable Object control/data plane pattern](https://developers.cloudflare.com/reference-architecture/diagrams/storage/durable-object-control-data-plane-pattern/)
- [Durable Objects WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- [Durable Objects lifecycle](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/)
- [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Durable Objects Limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Durable Objects source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/durable-objects)
- [workers-chat-demo](https://github.com/cloudflare/workers-chat-demo)
