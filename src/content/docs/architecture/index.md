---
title: 架构模式
description: 常见 Cloudflare 架构组合、判断顺序和官方对照。
---

架构页只回答一个问题：**一个项目应该怎么组合 Cloudflare 产品。** 这里保留普通项目常用的判断顺序。

## 快速分流

| 需求 | 先读 | 默认组合 |
| --- | --- | --- |
| 文档站、官网、博客、知识库 | [静态内容站](/architecture/static-site/) | Workers Static Assets / Pages、Cache、Pagefind、Web Analytics。 |
| 接口、第三方回调、表单、评论、小后端 | [接口入口](/architecture/api-gateway/) | Workers、WAF、限流、D1、KV、R2、Queues。 |
| 聊天、协作、房间、强一致状态 | [实时应用](/architecture/realtime-app/) | Workers、Durable Objects、连接休眠、Queues。 |
| AI 搜索、自然语言问答、模型代理 | [AI 产品](/platform/ai/) | AI Gateway、Workers AI、AI Search、Vectorize。 |
| 客户域名、多租户、用户代码运行 | [平台化与多租户](/platform/platforms-saas/) | Cloudflare for SaaS、Workers for Platforms、Dynamic Workers。 |
| 图片、视频、附件、媒体分发 | [媒体与性能](/platform/media-performance/) | R2、Images、Stream、Cache。 |

最先分清三件事：静态阅读路径、动态写入路径、数据和文件路径。三条边界清楚后，再加安全、搜索、AI、实时和观测。

## 判断顺序

| 先问什么 | 推荐路线 | 边界 |
| --- | --- | --- |
| 主要是读内容吗？ | 静态内容站。 | 数据库、服务端渲染和 AI 搜索放到明确需求后。 |
| 主要是请求处理和业务接口吗？ | 接口入口。 | Worker 负责入口，状态和文件交给对应产品。 |
| 需要同一个资源的强一致状态吗？ | 实时应用。 | KV 不适合锁、房间状态或严格计数器。 |
| 需要音视频或 WebRTC 吗？ | Realtime / 媒体产品。 | 媒体传输和普通 WebSocket 是两类问题。 |
| 需要自然语言搜索或模型代理吗？ | AI 产品。 | 内容少时先用结构化目录和 Pagefind。 |
| 需要后台和私有服务吗？ | Zero Trust / Access / Tunnel。 | 后台入口先有身份边界。 |

## 取舍原则

| 原则 | 直接含义 |
| --- | --- |
| 静态优先 | 阅读流量留在 Static Assets / Pages，不进入 Worker。 |
| 动态分层 | Worker 负责入口和轻逻辑，D1 / R2 / KV / Queues / DO 各管各的状态。 |
| 文件离库 | 文件本体进 R2，D1 只存元数据、权限和索引。 |
| 强一致靠 DO | 房间、限流桶、单资源顺序写入用 Durable Objects，不用 KV。 |
| 慢任务异步 | 邮件、审核、导入、AI 后处理进 Queues / Workflows。 |
| 免费边界先算 | 先看静态请求、Workers 请求、CPU、D1 读写行数、R2 操作，再谈升级。 |
| 安全前置 | 写入口先有 Turnstile、限流、WAF 或身份边界。 |

官方架构入口：[Reference Architecture](https://developers.cloudflare.com/reference-architecture/) 和 [Use cases](https://developers.cloudflare.com/use-cases/)；本站只保留独立开发者更常用的判断顺序。
