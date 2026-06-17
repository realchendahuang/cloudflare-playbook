---
title: 实时应用
description: 用 Durable Objects 承载房间、协作和强一致状态的架构模式。
---

最后核对日期：2026-06-17。

实时应用不是一个单独产品选择，而是一组状态问题。普通项目里最常见的是聊天、在线状态、协作文档、多人白板、游戏房间、单资源限流和任务协调：它们都需要“某个房间、某个用户、某个资源”拥有强一致状态。[Durable Objects](/platform/durable-objects/) 很适合承载这种单对象协调逻辑。

如果实时需求是音频、视频或 WebRTC，请看 [Realtime](/platform/realtime/)；RealtimeKit、Realtime SFU 和 TURN 解决的是媒体传输问题，不是普通文本房间状态问题。不要因为需求里出现“实时”两个字，就把 WebRTC、SFU 和 WebSocket 混在一起。

## 先判断是哪种实时

| 需求 | 优先路线 | 不要先做什么 |
| --- | --- | --- |
| 聊天、通知、在线人数 | Worker + Durable Objects + WebSocket Hibernation。 | 不要把每条消息先写 D1 再轮询。 |
| 协作文档、白板、多人编辑 | 一个文档或房间一个 Durable Object，历史和索引另存。 | 不要用 KV 做锁或共享编辑状态。 |
| 轻量多人游戏 | 一个局或房间一个 Durable Object，消息批处理。 | 不要把所有房间塞进一个全局对象。 |
| 单资源限流、锁、顺序写入 | 一个资源 key 一个 Durable Object。 | 不要依赖普通 Worker 内存变量。 |
| 音视频会议、课堂、语音房 | RealtimeKit / Realtime SFU / TURN。 | 不要用 Durable Object WebSocket 转发媒体流。 |

## 架构

```text
浏览器 / App
  │
  ▼
Worker 边界层
  ├─ 鉴权
  ├─ 校验 roomId / docId / userId
  ├─ 限流
  └─ 路由到对象 stub
  │
  ▼
数据面 Durable Object
  ├─ WebSocket Hibernation
  ├─ 当前连接 / 在线成员
  ├─ 房间状态 / 文档状态
  ├─ SQLite-backed storage
  └─ 消息广播 / 顺序协调
      │
      ├─ Queues：通知、归档、Webhook、清理
      ├─ D1：列表、查询、报表、关系数据
      └─ R2：长历史、附件、快照、导出文件
```

官方 `Add real-time features` 用例把这类问题拆得很清楚：实时功能需要持久连接和强一致状态，Durable Objects 负责 WebSocket 连接与共享状态，Queues 负责后台事件处理。

官方 Durable Objects control/data plane 架构给了一个更关键的提醒：不要让所有请求都经过一个控制对象。控制面负责创建、删除、列出资源；数据面按房间、文档、用户或资源 ID 拆成很多 Durable Object 实例，用户读写直接命中对应的数据面对象。

## 三层平面

| 平面 | 放什么 | 不放什么 |
| --- | --- | --- |
| 边界层 Worker | 鉴权、参数校验、权限判断、CORS、路由、把请求转给对应 DO。 | 不放房间内强一致状态，也不存在线连接表。 |
| 控制面 DO / D1 | 创建房间、删除房间、列出资源、保存资源元数据。 | 不承接高频消息、编辑操作和广播。 |
| 数据面 DO | 单房间、单文档、单用户或单资源的实时状态、连接和顺序写入。 | 不做全局搜索、报表、长历史查询。 |

小项目可以没有独立控制面 DO，直接让 Worker + D1 管资源列表，再按资源 ID 路由到数据面 DO。只有当“创建、删除、列表、权限变更”本身也需要强一致协调时，才引入控制面 DO。

## 适合场景

- 协作文档或白板。
- 聊天房间。
- 多人游戏房间。
- 单资源限流器。
- 需要顺序处理的任务协调器。
- AI agent 会话、运行状态和实时日志。
- 工作流里某个资源的进度同步。

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

`workers-chat-demo` 的结构很适合学习：一个 `ChatRoom` DO 管一个聊天室；另一个 `RateLimiter` DO 按 IP 管限流。聊天历史只用于回放，实时消息直接在房间对象内广播，不让存储层参与每一次实时转发。

## 常见组合

| 场景 | 推荐组合 | 判断 |
| --- | --- | --- |
| 文本房间 / 协作 | Worker + Durable Objects + WebSocket Hibernation | DO 承载连接和共享状态，空闲时让连接休眠。 |
| 需要异步副作用 | Durable Objects + Queues | 广播和状态更新在 DO 内完成，邮件、通知、归档进 Queue。 |
| 需要长期查询 | Durable Objects + D1 / R2 | DO 管实时状态，D1/R2 存历史、索引和归档。 |
| 音视频房间 | RealtimeKit / Realtime SFU / TURN | 媒体传输不要用普通 Durable Object WebSocket 硬扛。 |

## 连接策略

Durable Objects 有两种 WebSocket API。新实时房间优先使用 Hibernation API，也就是在对象里用 `ctx.acceptWebSocket()`，不要用普通 `server.accept()` 把对象长期钉在内存里。

| 连接细节 | 推荐做法 |
| --- | --- |
| 空闲连接 | 使用 WebSocket Hibernation，空闲时对象可休眠，客户端连接仍保留在 Cloudflare 网络上。 |
| 连接元数据 | 用户 ID、房间角色、限流器 ID 等放进 WebSocket attachment，唤醒后用 `deserializeAttachment()` 恢复。 |
| 内存状态 | 只放可重建的热状态；对象休眠、部署或运行时调度后，构造函数会重新执行。 |
| 消息频率 | 高频小消息做批处理，减少单个 DO 的上下文切换压力。 |
| 心跳 | 依赖平台自动处理协议级 ping/pong；应用级心跳不要过密。 |
| 部署 | Worker 代码更新会导致连接重建，客户端必须有重连和状态恢复逻辑。 |

Hibernation 的成本价值很大：DO pricing 页面给的对比里，普通 WebSocket 长连接可能主要花在 duration；使用 Hibernation 后，duration 更接近“真正执行 JavaScript 的时间”。这也是实时应用能不能留在 Workers Paid 基础额度附近的分水岭。

## 状态归位

| 状态 | 放哪里 | 原因 |
| --- | --- | --- |
| 当前在线连接 | DO WebSocket 列表和 attachment。 | 连接天然属于房间或资源对象。 |
| 当前房间状态 | DO 内存 + SQLite-backed storage。 | 热状态读写快，关键状态可恢复。 |
| 最近消息 / 快照 | DO SQLite 或 D1。 | 重连时可以快速恢复上下文。 |
| 长历史 / 导出 | R2。 | 便宜、适合对象文件和归档。 |
| 列表、搜索、报表 | D1 / Vectorize / Analytics Engine。 | DO 不适合做全局扫描和复杂查询。 |
| 通知、Webhook、清理 | Queues / Workflows。 | 不阻塞实时主路径，可重试。 |

实时主路径要短：验证请求、命中对象、更新状态、广播结果。归档、通知、搜索索引、邮件和 Webhook 这些“慢副作用”不要塞在 WebSocket 消息处理里。

## 成本边界

| 成本项 | 免费边界 | Workers Paid / 超出后 | 实时应用判断 |
| --- | --- | --- | --- |
| Worker 请求 | Free 100,000 requests/day。 | Workers Paid 最低 `$5/month`，含 10 million requests/month，超出 `$0.30/million`；含 30 million CPU ms/month，超出 `$0.02/million CPU ms`。 | 边界层 Worker 要轻，静态资产请求免费且无限。 |
| DO requests | Free 100,000/day。 | Paid 含 1 million/month，超出 `$0.15/million`。 | WebSocket 建连、RPC、alarm、入站消息都会影响请求口径；入站 WebSocket 消息按 20:1 计入计费请求。 |
| DO duration | Free 13,000 GB-s/day。 | Paid 含 400,000 GB-s/month，超出 `$12.50/million GB-s`。 | Hibernation 是控制 duration 的关键；普通 WebSocket 长连会持续产生 duration。 |
| DO SQLite storage | Free 总计 5 GB。 | Paid 含 5 GB-month，超出 `$0.20/GB-month`；行读写按 D1 口径计费。 | 房间短历史可以放 DO，长历史不要无限堆。 |
| Queues | Free 10,000 operations/day。 | Paid 含 1,000,000 operations/month，超出 `$0.40/million operations`。 | 只把慢副作用放队列，消息体尽量小。 |

这些数字来自 Cloudflare 官方 pricing 页面；价格和额度会变，正式上线前以 [免费与付费边界](/platform/free-paid/) 和官方 pricing 为准。

## 风险清单

- 不要把所有用户塞到同一个 Durable Object。
- 需要设计对象划分方式，例如按房间、租户或资源 ID 分片。
- WebSocket 长连接优先使用 Hibernation API，避免空闲连接持续产生 duration 成本。
- Hibernation 会让 Durable Object 从内存里恢复，连接状态要用 attachment 或持久化数据重建。
- 控制面对象不要承担高频数据面读写，否则会变成架构瓶颈。
- 单个对象是单线程执行，不要让一个对象承担全站热点。
- 不要把 DO 当全局数据库；列表、搜索、报表应该落到专门的数据产品。
- 不要把音视频媒体流塞进普通 WebSocket，媒体传输走 Realtime 产品线。

## 验证方式

| 检查 | 怎么看 |
| --- | --- |
| 分片 | 同时创建多个房间或资源，确认请求能命中不同对象。 |
| 重连 | 刷新页面、断网重连、Worker 部署后，客户端能恢复到正确状态。 |
| 空闲成本 | 使用 Hibernation API，确认空闲连接不会让对象持续运行。 |
| 顺序 | 同一资源的并发写入按预期串行处理，不丢状态。 |
| 后台任务 | 归档、通知、清理任务可以失败重试，不影响实时主路径。 |
| 热点对象 | 压测单房间消息频率，确认延迟、CPU 和错误率没有异常。 |
| 历史恢复 | 新连接能拿到最近消息或快照，长期历史从 D1/R2 查询。 |
| 费用估算 | 按连接数、入站消息数、每条消息处理时间估算 DO requests 和 duration。 |

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

开源仓库适合看结构和边界，不适合直接照抄价格、限制和安全策略。生产判断仍然以 Cloudflare 官方 docs 和 pricing 页面为准。

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
