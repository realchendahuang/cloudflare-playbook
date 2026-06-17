---
title: Realtime
description: Cloudflare RealtimeKit、Realtime SFU、TURN 和 Durable Objects WebSocket 的边界、价格与最佳实践。
---

最后核对日期：2026-06-18。

Cloudflare Realtime 不是一个单独产品，而是一组实时通信能力：RealtimeKit、Realtime SFU 和 TURN。普通项目还会同时遇到另一类“实时”：聊天、协作、房间状态和 WebSocket，这部分通常应该优先看 [Durable Objects](/platform/durable-objects/)。

## 一句话判断

| 需求 | 优先选择 | 原因 |
| --- | --- | --- |
| 会议、课堂、直播互动、语音房 | RealtimeKit | 高层 SDK 和 UI Kit，少处理 WebRTC 细节。 |
| 自己掌控 WebRTC 拓扑、track、presence、媒体路由 | Realtime SFU | 底层 SFU，适合懂 WebRTC 的团队。 |
| 已有 WebRTC 应用，只需要 NAT / 防火墙穿透 | TURN | 只做 relay，不负责房间、用户、媒体编排。 |
| 聊天、协作文档、游戏房间、在线状态 | Durable Objects WebSocket | 不需要音视频媒体路由时，不要为了“实时”上 SFU。 |

如果目标只是“页面里有实时评论、通知、聊天、在线人数”，不要先看 RealtimeKit。先用 Durable Objects；它解决的是状态一致性和连接管理，不承担音视频带宽。

## 产品边界

| 产品 | 它是什么 | 它不是什么 | 适合谁 |
| --- | --- | --- | --- |
| RealtimeKit | 面向 Web / Mobile 的视频和语音 SDK，包含 UI Kit、Core SDK、会议、参与者、预设、录制、转录、Webhooks。 | 不是最低层 WebRTC primitive，也不是普通 WebSocket 状态服务。 | 想快速加会议、课堂、语音房和直播互动的产品。 |
| Realtime SFU | Cloudflare 全球网络上的 Selective Forwarding Unit，转发 audio / video / data tracks。 | 不提供房间、presence、业务权限和 UI；这些要自己做。 | 有 WebRTC 经验，需要完整控制媒体拓扑的团队。 |
| TURN | WebRTC NAT / firewall relay 服务，提供 `stun.cloudflare.com` 和 `turn.cloudflare.com`。 | 不做媒体 fan-out，不做会议，不做用户状态。 | 已有 WebRTC 架构，需要更稳定连接路径的应用。 |
| Durable Objects WebSocket | 单对象强一致状态和 WebSocket 连接协调。 | 不转发音视频媒体，不替代 SFU / TURN。 | 聊天、白板、房间、限流、协作状态和轻量实时 UI。 |

## 免费和付费边界

| 能力 | 免费边界 | 付费入口 | 备注 |
| --- | --- | --- | --- |
| RealtimeKit | 官方 pricing 页写明当前 Beta 期间免费。 | GA 后官方给出的模型为 Audio/Video Participant `$0.002/min`，Audio-Only Participant `$0.0005/min`，Export `$0.010/min`，Audio-only export `$0.003/min`，Raw RTP into R2 `$0.0005/min`，实时转录按 Workers AI 标准模型价格。 | Beta 免费不等于永久免费；上线前要按 GA 模型估算。 |
| Realtime SFU | Cloudflare 到客户端的数据传输出站每月前 1,000 GB 免费；客户端到 Cloudflare 免费。 | 超出后 `$0.05/GB` egress。 | 免费额度和 TURN 共用，不是 SFU 1,000 GB + TURN 1,000 GB。 |
| TURN | Cloudflare 到 TURN client 的出站流量每月前 1,000 GB 免费；STUN 服务免费且不限量。 | 单独 TURN 使用超出后 `$0.05/GB` egress。 | TURN 与 SFU 或 Stream WHIP/WHEP 同时使用时，不会对中间链路重复计费。 |
| Durable Objects WebSocket | 见 [Durable Objects](/platform/durable-objects/) 的 Free / Paid 请求、duration 和 SQLite storage 额度。 | Workers Paid 后按 DO requests、duration 和 storage 扩容。 | WebSocket Hibernation 可以显著降低空闲连接成本。 |

## RealtimeKit：快速做音视频产品

普通项目如果要做视频会议，优先选 UI Kit，而不是从 Core SDK 或 SFU 开始。官方 SDK selection 页给出的判断也很直接：UI Kit 出货更快，Core SDK 给你更多控制但维护更多代码。

推荐路线：

1. 后端负责创建 Meeting、Participant 和 Preset。
2. 前端只拿 participant `authToken` 加入会议。
3. 录制、转录、会议结束、参会人进出，通过 RealtimeKit Webhooks 回写自己的 D1 / R2 / 队列。
4. 生产环境按 App 拆 staging / production，不共用 token、preset 和 webhook endpoint。

## Realtime SFU：自己负责媒体拓扑

Realtime SFU 是底层能力。它适合已经懂 WebRTC、并且需要自己掌控媒体拓扑的团队。普通开发者不要把 SFU 当成“更便宜的 RealtimeKit”：它给的是控制权，同时把 presence、权限、重连、房间状态、录制和管理后台都交还给你。

用 SFU 前先确认三件事：团队是否真的需要自定义媒体路由，是否能维护房间和参与者状态，是否能按带宽和出站流量估算成本。否则优先 RealtimeKit。

## TURN：只解决连接穿透

TURN 适合已有 WebRTC 应用。它的价值是让受 NAT、防火墙、企业网络限制的客户端仍能连接。它不负责房间、权限、录制、会议 UI 或媒体 fan-out。

普通项目只需要记住：STUN 免费且不限量，TURN 和 SFU 共用 1,000 GB/month 免费出站额度，超出后按 egress 计费。具体协议、端口和 credential 细节上线前再读官方 TURN 文档。

## 普通项目的落地顺序

| 阶段 | 推荐 |
| --- | --- |
| 只是需要“实时感” | Workers + Durable Objects + WebSocket Hibernation。 |
| 需要语音或视频，但不想维护 WebRTC 细节 | RealtimeKit UI Kit。 |
| 有自己的 WebRTC 专家和特殊拓扑 | Realtime SFU + 自己的房间 / presence / track 协议。 |
| 已有 WebRTC，只缺稳定 NAT 穿透 | TURN，必要时和 SFU 组合。 |
| 会议后处理 | RealtimeKit Webhooks + Queues / Workflows + R2 / D1。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| 有 WebSocket 就该用 Realtime。 | 文本实时和音视频实时是两类问题。WebSocket 房间先看 Durable Objects。 |
| RealtimeKit Beta 免费，所以可以无成本上生产。 | Beta 期免费要按 GA 价格预估，特别是参与者分钟数、录制和转录。 |
| SFU 是 RealtimeKit 的低价替代。 | SFU 少了抽象，也少了 UI、会议状态、参与者和业务流程，需要自己实现。 |
| TURN 会优化所有延迟。 | TURN 主要解决连接可靠性和 NAT 穿透；是否降延迟取决于拓扑和路径。 |
| 免费 1,000 GB 是 SFU 和 TURN 各一份。 | 官方 pricing 页写明 SFU 和 TURN 共用同一个免费 tier。 |
| 录制、转录、会议结束后处理可以放前端做。 | 这些应该走 Webhooks 回到后端，再用 Queues / Workflows 做异步处理。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/realtimekit-web-examples](https://github.com/cloudflare/realtimekit-web-examples) | RealtimeKit 在 React、Angular、HTML / Web Components 中的集成样例。 |
| [cloudflare/realtime-examples](https://github.com/cloudflare/realtime-examples) | Realtime SFU / TURN / DataChannels / WHIP-WHEP / AI 相关的底层示例。 |
| [cloudflare/meet](https://github.com/cloudflare/meet) | Cloudflare Meet，原 Orange Meets，基于 Realtime SFU 的完整 demo 应用。 |
| [cloudflare/cloudflare-docs realtime 源码](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/realtime) | Realtime 官方文档源码，可追踪 RealtimeKit、SFU、TURN 文档变更。 |

开源 demo 的价值是看产品边界和调用方式，不是直接复制生产架构。生产环境还要补鉴权、限流、日志、房间生命周期、计费估算、合规和故障处理。

## 事实来源

- [Cloudflare Realtime](https://developers.cloudflare.com/realtime/)
- [Realtime llms.txt](https://developers.cloudflare.com/realtime/llms.txt)
- [RealtimeKit](https://developers.cloudflare.com/realtime/realtimekit/)
- [RealtimeKit Pricing](https://developers.cloudflare.com/realtime/realtimekit/pricing/)
- [RealtimeKit Concepts](https://developers.cloudflare.com/realtime/realtimekit/concepts/)
- [RealtimeKit SDK selection](https://developers.cloudflare.com/realtime/realtimekit/sdk-selection/)
- [RealtimeKit Webhooks](https://developers.cloudflare.com/realtime/realtimekit/webhooks/)
- [Realtime SFU](https://developers.cloudflare.com/realtime/sfu/)
- [Realtime SFU Introduction](https://developers.cloudflare.com/realtime/sfu/introduction/)
- [Realtime SFU Pricing](https://developers.cloudflare.com/realtime/sfu/pricing/)
- [Realtime SFU Limits](https://developers.cloudflare.com/realtime/sfu/limits/)
- [Realtime SFU Example architecture](https://developers.cloudflare.com/realtime/sfu/example-architecture/)
- [TURN Service](https://developers.cloudflare.com/realtime/turn/)
- [TURN FAQ](https://developers.cloudflare.com/realtime/turn/faq/)
