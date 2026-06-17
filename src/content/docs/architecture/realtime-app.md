---
title: 实时应用
description: 用 Durable Objects 承载房间、协作和强一致状态的架构模式。
---

最后核对日期：2026-06-17。

实时应用通常需要“某个房间、某个用户、某个资源”拥有强一致状态。[Durable Objects](/platform/durable-objects/) 很适合承载这种单对象协调逻辑。

如果实时需求是音频、视频或 WebRTC，请看 [Realtime](/platform/realtime/)；RealtimeKit、Realtime SFU 和 TURN 解决的是媒体传输问题，不是普通文本房间状态问题。

## 架构

```text
客户端
  │
  ▼
Worker 路由
  │
  ▼
Durable Object
  ├─ 房间状态
  ├─ 在线成员
  ├─ 消息广播
  └─ 持久化存储
```

官方 Durable Objects control/data plane 架构给了一个很重要的提醒：不要让所有请求都经过一个控制对象。控制面负责创建、删除、列出资源；数据面按房间、文档、用户或资源 ID 拆成很多 Durable Object 实例，用户读写直接命中对应的数据面对象。

## 适合场景

- 协作文档或白板。
- 聊天房间。
- 多人游戏房间。
- 单资源限流器。
- 需要顺序处理的任务协调器。

## 对象怎么切

| 切法 | 适合 | 风险 |
| --- | --- | --- |
| 一个房间一个对象 | 聊天、协作、多人编辑。 | 超大房间要设计分片、只读副本或消息归档。 |
| 一个用户一个对象 | 用户状态、会话、个人任务队列。 | 用户跨设备同步要明确权限和恢复逻辑。 |
| 一个资源一个对象 | 文档、订单、限流桶、游戏局。 | 资源 ID 要稳定，迁移和删除要可追踪。 |
| 一个租户一个对象 | 小租户管理面、配置控制面。 | 大租户容易变成单点瓶颈。 |

## 常见组合

| 场景 | 推荐组合 | 判断 |
| --- | --- | --- |
| 文本房间 / 协作 | Worker + Durable Objects + WebSocket Hibernation | DO 承载连接和共享状态，空闲时让连接休眠。 |
| 需要异步副作用 | Durable Objects + Queues | 广播和状态更新在 DO 内完成，邮件、通知、归档进 Queue。 |
| 需要长期查询 | Durable Objects + D1 / R2 | DO 管实时状态，D1/R2 存历史、索引和归档。 |
| 音视频房间 | RealtimeKit / Realtime SFU / TURN | 媒体传输不要用普通 Durable Object WebSocket 硬扛。 |

## 风险

- 不要把所有用户塞到同一个 Durable Object。
- 需要设计对象划分方式，例如按房间、租户或资源 ID 分片。
- WebSocket 长连接优先使用 Hibernation API，避免空闲连接持续产生 duration 成本。
- Hibernation 会让 Durable Object 从内存里恢复，连接状态要用 attachment 或持久化数据重建。
- 控制面对象不要承担高频数据面读写，否则会变成架构瓶颈。

## 验证方式

| 检查 | 怎么看 |
| --- | --- |
| 分片 | 同时创建多个房间或资源，确认请求能命中不同对象。 |
| 重连 | 刷新页面、断网重连、Worker 部署后，客户端能恢复到正确状态。 |
| 空闲成本 | 使用 Hibernation API，确认空闲连接不会让对象持续运行。 |
| 顺序 | 同一资源的并发写入按预期串行处理，不丢状态。 |
| 后台任务 | 归档、通知、清理任务可以失败重试，不影响实时主路径。 |

## 官方资料

- [Add real-time features](https://developers.cloudflare.com/use-cases/web-apps/real-time/)
- [Durable Object control/data plane pattern](https://developers.cloudflare.com/reference-architecture/diagrams/storage/durable-object-control-data-plane-pattern/)
- [Durable Objects WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- [Durable Objects lifecycle](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/)
- [Durable Objects source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/durable-objects)
- [workers-chat-demo](https://github.com/cloudflare/workers-chat-demo)
