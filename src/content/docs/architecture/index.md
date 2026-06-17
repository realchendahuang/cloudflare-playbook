---
title: 架构模式
description: 常见 Cloudflare 架构组合、判断顺序、官方对照和开源参考。
---

最后核对日期：2026-06-17。

架构页关注“产品如何组合”，不是重复产品手册。Cloudflare 官方 Reference Architecture 用来理解高层设计、架构图、设计指南和实施指南；Use cases 用来从“我要做什么”反推产品组合。本站把这两类资料降维成普通项目最常遇到的架构入口。

```text
需求
  ├─ 主要读内容 -> 静态内容站
  ├─ 主要处理请求 -> API 网关
  ├─ 需要同一资源强一致状态 -> 实时应用
  ├─ 需要 AI / RAG / 模型网关 -> AI 应用路线
  ├─ 需要客户域名 / 多租户 / 用户代码 -> SaaS 平台路线
  └─ 需要图片 / 视频 / 媒体分发 -> 媒体路线
```

## 当前收录

| 模式 | 适合项目 | 核心产品 |
| --- | --- | --- |
| [静态内容站](/architecture/static-site/) | 文档站、官网、博客、作品集、知识库 | Workers Static Assets、Pages、Cache / CDN、Pagefind、R2、Web Analytics |
| [API 网关](/architecture/api-gateway/) | 代理、鉴权、Webhook、客户 API、轻量后端 | Workers、WAF、Rate Limiting、API Shield、Service Bindings、D1、KV、Queues |
| [实时应用](/architecture/realtime-app/) | 协作、房间、状态同步、限流 | Workers、Durable Objects、WebSocket Hibernation、Queues |

这三条不是完整的 Cloudflare 宇宙，而是普通项目最该先掌握的骨架。静态内容站决定你的阅读流量是否免费、稳定；API 网关决定动态请求是否有安全和成本边界；实时应用决定强一致状态是否放在正确的位置。

## 官方资料怎么读

| 官方资料 | 官方定位 | 本站怎么用 |
| --- | --- | --- |
| Reference architectures | 高层概念、架构图、企业集成方式。 | 提取产品组合和边界，不照搬企业复杂度。 |
| Reference architecture diagrams | 针对具体场景给一张或多张架构图。 | 反推普通项目的最小版本，比如 API、R2、Durable Objects、AI。 |
| Design guides | 面向架构师和工程团队的设计原则。 | 提炼“什么时候该用、什么时候不该用”。 |
| Implementation guides | 具体目标的部署步骤。 | 只在本站案例需要落地命令时引用。 |
| Use cases | 从场景入口查产品组合。 | 作为本站架构分类的第一层目录。 |

官方 Reference Architecture 更偏“组织如何把 Cloudflare 接进现有基础设施”。本站的任务是把它变成个人项目、开源项目和早期 SaaS 能执行的判断顺序。

## 判断顺序

| 先问什么 | 走哪条架构 | 不要急着加什么 |
| --- | --- | --- |
| 主要是读内容吗？ | [静态内容站](/architecture/static-site/)。 | 不要先上数据库、SSR 和 AI 搜索。 |
| 主要是请求处理和业务 API 吗？ | [API 网关](/architecture/api-gateway/)。 | 不要把所有逻辑塞进一个巨大 Worker。 |
| 需要同一个资源的强一致状态吗？ | [实时应用](/architecture/realtime-app/)。 | 不要用 KV 模拟锁、房间状态或严格计数器。 |
| 需要视频、音频、WebRTC 媒体传输吗？ | 先读 [Realtime](/platform/realtime/) 和 [媒体与性能](/platform/media-performance/)。 | 不要把媒体传输误判成普通 WebSocket。 |
| 需要自然语言搜索、RAG 或模型代理吗？ | 先读 [AI 产品](/platform/ai/)。 | 不要在内容还少时先上向量库。 |
| 需要客户自定义域名、租户隔离或用户代码吗？ | 先读 [平台化与多租户](/platform/platforms-saas/)。 | 不要把普通 SaaS 过早做成平台产品。 |
| 需要内部后台和私有网络吗？ | 先读 [Zero Trust 与企业网络](/platform/zero-trust-networking/) 和 [自有网络与专线](/platform/private-networking/)。 | 不要自写弱登录或把后台裸露公网。 |

## 从 Use cases 到本站架构

| Cloudflare Use case | 本站入口 | 普通项目落地 |
| --- | --- | --- |
| Web sites and web apps | [静态内容站](/architecture/static-site/)、[API 网关](/architecture/api-gateway/) | 前端静态化，动态路径交给 Worker。 |
| APIs and microservices | [API 网关](/architecture/api-gateway/) | 入口安全、路由、D1/R2/Queues、Service Bindings。 |
| AI applications | [AI 产品](/platform/ai/) | AI Gateway 先做观测和限流，再评估 Workers AI、AI Search、Vectorize。 |
| SaaS platforms | [平台化与多租户](/platform/platforms-saas/) | 客户域名、租户隔离、Workers for Platforms、Dynamic Workers。 |
| Media and streaming | [媒体与性能](/platform/media-performance/) | Images、Stream、R2、Cache，不把大媒体塞进静态包。 |
| Application security | [安全边界](/best-practices/security/)、[WAF](/platform/waf/) | 登录、评论、表单、API、上传先有最小防护。 |
| Performance | [Cache / CDN](/platform/cache/)、[静态内容站](/architecture/static-site/) | 静态资源长缓存，动态路径谨慎缓存。 |
| Company security | [Zero Trust 与企业网络](/platform/zero-trust-networking/) | Access / Tunnel 保护后台、预览和内部工具。 |
| E-commerce | [源站保护与流量洪峰](/platform/origin-surge/)、[流量调度与四层入口](/platform/traffic-routing/) | 真实流量峰值、支付和库存风险明确后再上排队和调度能力。 |

## 架构页写作标准

每个架构页都应该回答这些问题：

| 维度 | 必须写清楚 |
| --- | --- |
| 适用场景 | 这个架构解决什么问题，不解决什么问题。 |
| 产品组合 | 哪些产品是主路径，哪些只是可选增强。 |
| 请求路径 | 用户请求、静态资产、API、后台任务和数据访问分别走哪里。 |
| 最小落地步骤 | 普通项目先做哪几步，什么时候再升级。 |
| 验证方式 | 本地构建、线上 URL、日志、curl、Dashboard 指标怎么确认。 |
| 成本边界 | Free、Workers Paid、usage-based、zone plan、add-on 分别在哪里触发。 |
| 安全风险 | 鉴权、限流、CORS、密钥、日志、后台、上传和滥用边界。 |
| 官方来源 | 对应的 Use cases、Reference Architecture、产品文档和 GitHub 源目录。 |

## 架构路线图

| 优先级 | 架构方向 | 为什么重要 | 当前承接 |
| --- | --- | --- | --- |
| P0 | 静态内容站 | 最常见、成本最友好，也是本站自身架构。 | 已收录。 |
| P0 | API 网关 | 所有评论、表单、Webhook、小后台和代理都会遇到。 | 已收录。 |
| P0 | 实时应用 | Durable Objects 的正确用法需要从架构上先讲清楚。 | 已收录。 |
| P1 | AI 应用 / RAG | Cloudflare 正在把 AI Gateway、Workers AI、AI Search、Vectorize、Agents 串成完整路线。 | 已在 [AI 产品](/platform/ai/) 承接。 |
| P1 | 媒体与用户生成内容 | 图片、视频、附件和 R2 是普通项目最容易低估成本的地方。 | 已在 [媒体与性能](/platform/media-performance/) 和 [R2](/platform/r2/) 承接。 |
| P1 | SaaS 平台化 | 客户域名、租户隔离、用户代码运行会显著改变架构。 | 已在 [平台化与多租户](/platform/platforms-saas/) 承接。 |
| P2 | Zero Trust 后台与私有服务 | 后台、预览环境和内部服务应该先有身份边界。 | 已在 [Zero Trust 与企业网络](/platform/zero-trust-networking/) 承接。 |
| P2 | 事件驱动与数据管道 | Queues、Workflows、Pipelines、R2 Data Catalog 适合增长后拆出来。 | 已在 [扩展计算与数据管道](/platform/extended-compute-data/) 承接。 |

## 常见误判

| 误判 | 更好的判断 |
| --- | --- |
| 架构图越复杂越专业。 | 普通项目先把静态、动态、数据、文件、后台任务分清楚。 |
| Workers 能跑代码，所以所有请求都进 Worker。 | 静态内容直接走 Static Assets / Pages，只有动态路径进入 Worker。 |
| KV 是全局存储，所以可以做锁和房间状态。 | KV 是最终一致；强一致状态用 Durable Objects 或 D1 事务。 |
| R2 免 egress，所以大文件完全免费。 | R2 仍有 storage、Class A、Class B 操作成本。 |
| AI 搜索是文档站标配。 | 内容少时先 Pagefind；自然语言问题明显后再上 AI Search / Vectorize。 |
| Access / Tunnel 是企业才需要。 | 个人和小团队的后台、预览、管理工具同样应该先用身份边界保护。 |
| Workers Paid 解决所有配额。 | Workers Paid 只扩展开发者平台，不等于 Pro、Business 或 Enterprise。 |

## GitHub 开源参考

| 仓库 / 源目录 | 用途 |
| --- | --- |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，适合学习教程站的信息架构和学习路径。 |
| [cloudflare/cloudflare-docs Reference Architecture source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/reference-architecture) | 官方 Reference Architecture 源目录，适合追踪架构图、设计指南和实施指南。 |
| [cloudflare/cloudflare-docs Use cases source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/use-cases) | 官方 Use cases 源目录，适合追踪场景分类和跨产品 solution guides。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | 官方 Workers 模板集合，适合把架构图落到真实 `wrangler.jsonc` 和项目目录。 |
| [cloudflare/docs-examples](https://github.com/cloudflare/docs-examples) | 官方文档示例代码，适合核对 Workers、D1、R2、Queues、Durable Objects 等产品的最小实现。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Miniflare、create-cloudflare 模板和本地开发行为的源头。 |
| [cloudflare/workers-chat-demo](https://github.com/cloudflare/workers-chat-demo) | Durable Objects 聊天和实时状态示例。 |

## 官方资料

- [Reference Architecture](https://developers.cloudflare.com/reference-architecture/)
- [Reference Architecture how to use](https://developers.cloudflare.com/reference-architecture/how-to-use/)
- [Reference Architecture by solution](https://developers.cloudflare.com/reference-architecture/by-solution/)
- [Use cases](https://developers.cloudflare.com/use-cases/)
- [Web sites and web apps](https://developers.cloudflare.com/use-cases/web-apps/)
- [APIs and microservices](https://developers.cloudflare.com/use-cases/apis/)
- [AI applications](https://developers.cloudflare.com/use-cases/ai/)
- [SaaS platforms](https://developers.cloudflare.com/use-cases/saas/)
- [Media and streaming](https://developers.cloudflare.com/use-cases/media-streaming/)
- [Serverless global APIs](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/serverless-global-apis/)
- [Fullstack applications](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/fullstack-application/)
- [Durable Object control/data plane pattern](https://developers.cloudflare.com/reference-architecture/diagrams/storage/durable-object-control-data-plane-pattern/)
