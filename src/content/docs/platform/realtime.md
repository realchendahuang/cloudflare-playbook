---
title: 实时能力
description: 文本实时、音视频实时和浏览器实时连接怎么选。
---

文本实时和音视频实时是两类问题，先分清要同步的是状态还是媒体。

## 先判断

| 需求 | 优先选择 | 不要误用 |
| --- | --- | --- |
| 聊天、在线人数、通知、协作状态 | Durable Objects WebSocket。 | 不要为了实时刷新去上音视频产品。 |
| 会议、课堂、语音房、直播互动 | RealtimeKit。 | 不要从底层 WebRTC 开始造。 |
| 已经有 WebRTC 团队和特殊媒体路由 | Realtime SFU。 | 不要把它当低价会议系统。 |
| 已有 WebRTC，只缺连接穿透 | TURN。 | 不要期待它管理房间、权限和界面。 |

如果只是评论实时刷新、在线人数、通知或聊天室，先看 [Durable Objects](/platform/durable-objects/)。只有语音、视频、会议和媒体转发明确存在时，再看 RealtimeKit / SFU / TURN。

## 简单路线

只需要“实时感”时，用 Workers + Durable Objects + 连接休眠。需要视频会议又不想维护 WebRTC 细节时看 RealtimeKit；复杂媒体路由看 Realtime SFU；只缺连接可靠性看 TURN。

会议后的录制、转录、通知和归档走回调、Queues / Workflows、R2 和 D1。

## 成本先看什么

| 能力 | 先盯住 |
| --- | --- |
| Durable Objects WebSocket | 请求数、运行时长、是否启用连接休眠。 |
| RealtimeKit | 参与者时长、录制、转录和导出。 |
| Realtime SFU / TURN | Cloudflare 到客户端的出站流量。 |
| 会议后处理 | 回调次数、队列任务、R2 存储和日志。 |
