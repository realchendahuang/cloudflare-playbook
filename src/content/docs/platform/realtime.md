---
title: 实时能力
description: 文本实时、音视频实时和 WebRTC 穿透怎么选。
---

最后核对日期：2026-06-18。Realtime 相关价格和 beta 状态变化快，具体数字统一看 [免费额度大全](/platform/free-paid/) 和官方页面。

先记住一句：**文本实时和音视频实时是两类问题。**

## 先判断

| 需求 | 优先选择 | 不要误用 |
| --- | --- | --- |
| 聊天、在线人数、通知、协作状态 | Durable Objects WebSocket。 | 不要为了 WebSocket 上音视频产品。 |
| 会议、课堂、语音房、直播互动 | RealtimeKit。 | 不要从底层 WebRTC 开始造。 |
| 已经有 WebRTC 团队和特殊媒体拓扑 | Realtime SFU。 | 不要把它当低价会议系统。 |
| 已有 WebRTC，只缺穿透 | TURN。 | 不要期待它管理房间、权限和 UI。 |

如果只是评论实时刷新、在线人数、通知或聊天室，先看 [Durable Objects](/platform/durable-objects/)。只有语音、视频、会议和媒体转发明确存在时，再看 RealtimeKit / SFU / TURN。

## 普通项目路线

| 阶段 | 推荐 |
| --- | --- |
| 只需要“实时感” | Workers + Durable Objects + WebSocket Hibernation。 |
| 需要视频会议，但团队不想维护 WebRTC 细节 | RealtimeKit UI Kit。 |
| 有复杂媒体路由 | Realtime SFU + 自己的房间、权限和 presence。 |
| 只缺连接可靠性 | TURN。 |
| 会议后处理 | Webhooks + Queues / Workflows + R2 / D1。 |

## 成本先看什么

| 能力 | 先盯住 |
| --- | --- |
| Durable Objects WebSocket | 请求数、duration、是否启用 hibernation。 |
| RealtimeKit | 参与者时长、录制、转录和导出。 |
| Realtime SFU / TURN | Cloudflare 到客户端的出站流量。 |
| 会议后处理 | Webhook 次数、队列任务、R2 存储和日志。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| 有 WebSocket 就该用 Realtime。 | 文本和状态同步先用 Durable Objects。 |
| RealtimeKit beta 免费，所以生产一定无成本。 | 上线前要按正式价格预估会议时长和录制。 |
| SFU 是 RealtimeKit 的低价替代。 | SFU 少了 UI、会议状态和业务流程。 |
| TURN 会让所有延迟变低。 | TURN 主要解决连接可靠性和 NAT 穿透。 |
| 录制、转录、会议结束处理放前端。 | 这些走 Webhooks 回后端，再异步处理。 |

## 事实来源

- [Cloudflare Realtime](https://developers.cloudflare.com/realtime/)
- [Cloudflare Realtime llms.txt](https://developers.cloudflare.com/realtime/llms.txt)
- [RealtimeKit](https://developers.cloudflare.com/realtime/realtimekit/)
- [RealtimeKit Pricing](https://developers.cloudflare.com/realtime/realtimekit/pricing/)
- [Realtime SFU](https://developers.cloudflare.com/realtime/sfu/)
- [Realtime SFU Pricing](https://developers.cloudflare.com/realtime/sfu/pricing/)
- [TURN Service](https://developers.cloudflare.com/realtime/turn/)
