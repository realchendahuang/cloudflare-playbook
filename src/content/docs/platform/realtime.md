---
title: Realtime
description: Cloudflare RealtimeKit、Realtime SFU、TURN 和 Durable Objects WebSocket 的边界、价格与最佳实践。
---

最后核对日期：2026-06-18。

Cloudflare Realtime 是一组音视频实时通信能力：RealtimeKit、Realtime SFU 和 TURN。普通项目还会遇到另一类“实时”：聊天、协作、在线状态和 WebSocket，这部分优先看 [Durable Objects](/platform/durable-objects/)。

先记住一句：**文本实时和音视频实时是两类问题。**

## 先判断

| 需求 | 优先选择 | 原因 |
| --- | --- | --- |
| 会议、课堂、直播互动、语音房 | RealtimeKit | 高层 SDK 和 UI Kit，少处理 WebRTC 细节。 |
| 自己掌控 WebRTC 拓扑和媒体路由 | Realtime SFU | 底层能力，适合懂 WebRTC 的团队。 |
| 已有 WebRTC，只缺 NAT / 防火墙穿透 | TURN | 只做 relay，不管房间和用户状态。 |
| 聊天、协作文档、游戏房间、在线状态 | Durable Objects WebSocket | 不需要音视频媒体路由时，不要先上 SFU。 |

如果只是“评论实时刷新、在线人数、通知、聊天”，先用 Durable Objects。只有语音、视频、会议和媒体转发明确存在时，再看 RealtimeKit / SFU / TURN。

## 产品边界

| 产品 | 管什么 | 不管什么 |
| --- | --- | --- |
| RealtimeKit | 视频/语音会议、UI Kit、参与者、录制、转录、webhook。 | 不适合普通 WebSocket 状态服务。 |
| Realtime SFU | audio / video / data tracks 的转发。 | 不提供房间、权限、UI 和业务流程。 |
| TURN | NAT / firewall relay。 | 不做会议、媒体 fan-out、房间状态。 |
| Durable Objects WebSocket | 房间状态、连接协调、单实体一致性。 | 不转发音视频媒体。 |

## 免费和付费边界

| 能力 | 免费边界 | 付费入口 | 普通项目判断 |
| --- | --- | --- | --- |
| RealtimeKit | 当前 Beta 期间免费。 | GA 后按参与者分钟、导出分钟、转录等计费。 | Beta 免费不等于永久免费，上线前要按会议时长估算。 |
| Realtime SFU | Cloudflare 到客户端出站前 1,000 GB/month 免费。 | 超出后按 GB 计费。 | 自己维护 WebRTC 复杂度，别当低价 RealtimeKit。 |
| TURN | STUN 免费不限量；TURN 出站与 SFU 共用免费层。 | 超出后按 GB 计费。 | 已有 WebRTC 架构时再接。 |
| Durable Objects WebSocket | 见 DO 的 requests、duration、storage。 | Workers Paid 后扩大额度。 | WebSocket Hibernation 是成本关键。 |

## 普通项目路线

| 阶段 | 推荐 |
| --- | --- |
| 只是需要“实时感” | Workers + Durable Objects + WebSocket Hibernation。 |
| 需要语音或视频，不想维护 WebRTC 细节 | RealtimeKit UI Kit。 |
| 有 WebRTC 专家和特殊拓扑 | Realtime SFU + 自己的房间 / presence / track 协议。 |
| 已有 WebRTC，只缺稳定穿透 | TURN。 |
| 会议后处理 | Webhooks + Queues / Workflows + R2 / D1。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| 有 WebSocket 就该用 Realtime。 | WebSocket 房间先看 Durable Objects。 |
| RealtimeKit Beta 免费，所以生产无成本。 | Beta 免费要按 GA 价格预估。 |
| SFU 是 RealtimeKit 的低价替代。 | SFU 少了 UI、会议状态和业务流程，需要自己实现。 |
| TURN 会优化所有延迟。 | TURN 主要解决连接可靠性和 NAT 穿透。 |
| 免费 1,000 GB 是 SFU 和 TURN 各一份。 | SFU 和 TURN 共用同一个免费 tier。 |
| 录制、转录、会议结束处理放前端。 | 这些应该走 Webhooks 回后端，再异步处理。 |

## 事实来源

- [Cloudflare Realtime](https://developers.cloudflare.com/realtime/)
- [RealtimeKit](https://developers.cloudflare.com/realtime/realtimekit/)
- [RealtimeKit Pricing](https://developers.cloudflare.com/realtime/realtimekit/pricing/)
- [RealtimeKit SDK selection](https://developers.cloudflare.com/realtime/realtimekit/sdk-selection/)
- [RealtimeKit Webhooks](https://developers.cloudflare.com/realtime/realtimekit/webhooks/)
- [Realtime SFU](https://developers.cloudflare.com/realtime/sfu/)
- [Realtime SFU Pricing](https://developers.cloudflare.com/realtime/sfu/pricing/)
- [TURN Service](https://developers.cloudflare.com/realtime/turn/)
