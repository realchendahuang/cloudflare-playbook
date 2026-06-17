---
title: 架构模式
description: 常见 Cloudflare 架构组合的入口。
---

最后核对日期：2026-06-17。

架构页关注“产品如何组合”，不是重复产品手册。

Cloudflare 官方 Reference Architecture 和 Use cases 更偏企业或跨产品方案。本站这里把它们降维成普通项目最常见的三条路径：内容站、API、实时状态。

## 当前收录

| 模式 | 适合项目 | 核心产品 |
| --- | --- | --- |
| [静态内容站](/architecture/static-site/) | 文档站、官网、博客、作品集、知识库 | Workers Static Assets、Pages、Cache / CDN、Pagefind、R2、Web Analytics |
| [API 网关](/architecture/api-gateway/) | 代理、鉴权、Webhook、客户 API、轻量后端 | Workers、WAF、Rate Limiting、API Shield、Service Bindings、D1、KV、Queues |
| [实时应用](/architecture/realtime-app/) | 协作、房间、状态同步、限流 | Workers、Durable Objects、WebSocket Hibernation、Queues |

## 判断顺序

| 先问什么 | 走哪条架构 | 不要急着加什么 |
| --- | --- | --- |
| 主要是读内容吗？ | 静态内容站。 | 不要先上数据库和 SSR。 |
| 主要是请求处理和业务 API 吗？ | API 网关。 | 不要把所有逻辑塞进一个巨大 Worker。 |
| 需要同一个资源的强一致状态吗？ | 实时应用。 | 不要用 KV 模拟锁和房间状态。 |
| 需要视频、音频、WebRTC 媒体传输吗？ | 先读 [Realtime](/platform/realtime/)。 | 不要把媒体传输问题误判成普通 WebSocket。 |

## 每个架构页应包含

- 适用场景。
- 产品组合。
- 请求路径。
- 最小落地步骤。
- 验证方式。
- 成本和安全风险。

## 官方对照

| 本站架构 | 官方对照 |
| --- | --- |
| 静态内容站 | [Deploy frontend applications](https://developers.cloudflare.com/use-cases/web-apps/deploy-frontend/)、[Static Assets](https://developers.cloudflare.com/workers/static-assets/)。 |
| API 网关 | [Serverless global APIs](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/serverless-global-apis/)、[Deploy APIs at the edge](https://developers.cloudflare.com/use-cases/apis/deploy-apis/)。 |
| 实时应用 | [Add real-time features](https://developers.cloudflare.com/use-cases/web-apps/real-time/)、[Durable Object control/data plane](https://developers.cloudflare.com/reference-architecture/diagrams/storage/durable-object-control-data-plane-pattern/)。 |
