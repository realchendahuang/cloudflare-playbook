---
title: 实时能力
---

## 适用场景

聊天、在线人数、通知、协作状态优先用 Durable Objects WebSocket。会议、课堂、语音房、直播互动优先看 RealtimeKit。已经有 WebRTC 团队和特殊媒体路由时看 Realtime SFU。已有 WebRTC、只缺连接穿透时看 TURN。

## 选型路线

只需要“实时感”时，用 Workers + Durable Objects + 连接休眠。需要视频会议又不想维护 WebRTC 细节时看 RealtimeKit；媒体路由要自己控制时看 Realtime SFU；只缺连接可靠性看 TURN。

## 成本指标

Durable Objects WebSocket 主要看请求数、运行时长和是否启用连接休眠。RealtimeKit 看参与者时长、录制、转录和导出。Realtime SFU / TURN 看 Cloudflare 到客户端的出站流量。会议后处理还要看回调次数、队列任务、R2 存储和日志。
