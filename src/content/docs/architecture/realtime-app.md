---
title: 实时应用
description: 用 Durable Objects 承载房间、协作和强一致状态的架构模式。
---

最后核对日期：2026-06-18。

实时应用先判断状态归属。聊天、在线状态、协作文档、多人白板、游戏房间和单资源限流，本质上都是“某个房间、某个用户、某个资源”需要强一致状态。[Durable Objects](/platform/durable-objects/) 适合承载这类单对象协调。

如果实时需求是音频、视频或 WebRTC，请看 [Realtime](/platform/realtime/)；RealtimeKit、Realtime SFU 和 TURN 解决的是媒体传输问题，不是普通文本房间状态问题。

## 先判断是哪种实时

| 需求 | 优先路线 | 不要先做什么 |
| --- | --- | --- |
| 聊天、通知、在线人数 | Worker + Durable Objects + WebSocket Hibernation。 | 不要把每条消息先写 D1 再轮询。 |
| 协作文档、白板、多人编辑 | 一个文档或房间一个 Durable Object，历史和索引另存。 | 不要用 KV 做锁或共享编辑状态。 |
| 轻量多人游戏 | 一个局或房间一个 Durable Object，消息批处理。 | 不要把所有房间塞进一个全局对象。 |
| 单资源限流、锁、顺序写入 | 一个资源 key 一个 Durable Object。 | 不要依赖普通 Worker 内存变量。 |
| 音视频会议、课堂、语音房 | RealtimeKit / Realtime SFU / TURN。 | 不要用 Durable Object WebSocket 转发媒体流。 |

## 状态放哪里

| 层 | 放什么 | 不放什么 |
| --- | --- | --- |
| 边界层 Worker | 鉴权、参数校验、权限判断、跨域边界、路由、把请求转给对应 DO。 | 房间内强一致状态、在线连接表。 |
| 列表和权限 | 创建房间、删除房间、列出资源、保存资源元数据。 | 高频消息、编辑操作和广播。 |
| 实时状态 | 单房间、单文档、单用户或单资源的实时状态、连接和顺序写入。 | 全局搜索、报表、长历史查询。 |

## 对象怎么切

最重要的规则是：**一个对象只负责一个协调原子**。聊天和协作通常一个房间一个对象；用户状态通常一个用户一个对象；文档、订单、限流桶和游戏局通常一个资源一个对象。需要列表、搜索和长期历史时，把索引和归档放到 D1 / R2，不要扫描 Durable Objects。

## 常见组合

| 场景 | 推荐组合 | 判断 |
| --- | --- | --- |
| 文本房间 / 协作 | Worker + Durable Objects + WebSocket Hibernation | DO 承载连接和共享状态，空闲时让连接休眠。 |
| 需要异步副作用 | Durable Objects + Queues | 广播和状态更新在 DO 内完成，邮件、通知、归档进 Queue。 |
| 需要长期查询 | Durable Objects + D1 / R2 | DO 管实时状态，D1/R2 存历史、索引和归档。 |
| 音视频房间 | RealtimeKit / Realtime SFU / TURN | 媒体传输不要用普通 Durable Object WebSocket 硬扛。 |

实时主路径要短：验证请求、命中对象、更新状态、广播结果。归档、通知、搜索索引、邮件和 Webhook 这些慢副作用不要塞在 WebSocket 消息处理里。

## 成本边界

实时应用最容易低估连接时长、对象常驻、消息广播和慢副作用。

| 成本项 | 实时应用判断 |
| --- | --- |
| Worker 请求 | 边界层 Worker 要轻，静态资产不要误进动态路径。 |
| Durable Objects duration | WebSocket Hibernation 是控制常驻成本的关键。 |
| Durable Objects storage | 房间短历史可以放 DO，长历史不要无限堆。 |
| Queues | 只把慢副作用放队列，消息体尽量小。 |

完整数字见 [免费额度大全](/platform/free-paid/)。

## 风险清单

| 风险 | 更好的做法 |
| --- | --- |
| 所有用户进同一个 Durable Object。 | 按房间、租户、资源 ID 或用户切对象。 |
| WebSocket 长连接持续产生 duration 成本。 | 新实时房间优先使用 WebSocket Hibernation。 |
| 列表和权限对象承担高频消息。 | 列表只做创建、删除、列表和权限，实时对象承接消息。 |
| 单个对象变成全站热点。 | 评估分片、只读副本、子房间或消息归档。 |
| DO 被当成全局数据库。 | 列表、搜索、报表落到 D1、R2、Vectorize 或 Analytics Engine。 |
| 音视频媒体流走普通 WebSocket。 | 媒体传输走 RealtimeKit、Realtime SFU 或 TURN。 |

## 不用这套架构的时候

静态评论、低频留言、全站搜索、大文件上传、音视频会议和大规模分析都不应该先套 Durable Objects 房间模型。评论和留言用 D1 + Worker API；搜索看 Pagefind / AI Search / Vectorize；上传走 R2 签名；音视频看 RealtimeKit / SFU；分析看 Analytics Engine、Logpush 或 R2 数据湖。

官方核对入口：[Add real-time features](https://developers.cloudflare.com/use-cases/web-apps/real-time/)、[Durable Objects WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)、[Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)。
