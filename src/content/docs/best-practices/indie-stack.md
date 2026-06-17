---
title: 独立开发者推荐栈
description: 面向个人项目、开源项目和早期 SaaS 的 Cloudflare 产品组合建议。
---

最后核对日期：2026-06-18。

独立开发者用 Cloudflare，核心不是把所有产品都用上，而是把域名入口、静态内容、动态接口、数据、文件、安全和观测放到正确位置。这样免费阶段能跑起来，第一次付费也能知道自己买的是请求、CPU、存储、日志、安全还是 AI 用量。

## 默认组合

| 层 | 推荐产品 | 用法 |
| --- | --- | --- |
| 入口 | DNS、CDN、Universal SSL、DDoS Protection | 域名接入 Cloudflare，Web 记录走 Proxied，TLS 用 Full (strict)。 |
| 内容 | Workers Static Assets 或 Pages | 文档、官网、博客、前端页面优先静态化。 |
| 动态接口 | Workers | API、Webhook、签名上传、评论、表单和轻量业务逻辑。 |
| 关系数据 | D1 | 用户、订单、配置、评论、表单、小后台数据。 |
| 文件对象 | R2 | 图片、附件、导出物、用户上传和日志归档。 |
| 配置缓存 | KV | 读多写少的配置、开关、会话和路由元数据。 |
| 异步任务 | Queues | 邮件、通知、导入、审核、AI 批处理和失败重试。 |
| 强一致状态 | Durable Objects | 聊天房间、协作状态、WebSocket、限流器、单用户状态。 |
| 安全 | Turnstile、WAF、Rate Limiting、Access / Tunnel | 表单、评论、登录、上传、后台和内网工具的边界。 |
| AI | AI Gateway、Workers AI、AI Search / Vectorize | 先统一 AI 请求和日志，再决定模型、RAG 和向量库。 |

这套栈的重点是顺序：**先静态、再动态；先 D1 / R2 / KV，后 Durable Objects / Queues；先 Pagefind / AI Gateway，后 AI Search / Vectorize。**

## 免费跑起来

| 场景 | Free 起步组合 | 先盯哪个数字 |
| --- | --- | --- |
| 开源文档站 | Workers Static Assets / Pages + Pagefind + Web Analytics | 构建次数、文件数、静态资产是否误进 Worker。 |
| 个人官网 / 博客 | DNS + CDN + Universal SSL + Static Assets | 缓存命中、图片体积、构建次数。 |
| 小 API / Webhook | Workers Free + D1 + KV + Turnstile | requests/day、CPU、D1 写入、KV 写入。 |
| 评论 / 反馈系统 | Workers + D1 + Turnstile + WAF Rate Limiting | D1 写入、刷量、日志留存。 |
| 文件上传 / 下载 | R2 Standard + 签名上传 + CDN cache | storage、Class A、Class B。 |
| 小团队后台 | Access + Tunnel + Zero Trust Free | 50 users、Access policy、审计需求。 |
| AI 搜索试验 | Pagefind + AI Gateway + Workers AI / AI Search | Neurons、queries、Gateway logs。 |
| 实时小应用 | Durable Objects + WebSocket hibernation + Queues | DO requests、GB-s、Queues operations。 |

完整数字见 [免费额度大全](/platform/free-paid/)。这篇文章只保留决策口径，避免在多个页面维护同一组价格。

## 按项目类型选

| 项目 | 推荐组合 | 暂时不要上 |
| --- | --- | --- |
| 文档站 / 博客 | Astro / Starlight + Workers Static Assets / Pages + Pagefind + Web Analytics | D1、AI Search、Queues，除非有评论、表单或问答。 |
| 文档社区 | Workers Static Assets + Twikoo Cloudflare + D1 + 后续 Turnstile | 自写评论组件和复杂管理端。 |
| 小型 SaaS | Workers + D1 + KV + R2 + Turnstile + AI Gateway | 微服务、Kubernetes、自建对象存储、自建认证系统。 |
| AI 工具 | Workers + AI Gateway + D1 记录 + R2 文件 + 后续 Workers AI / Vectorize | 一开始就做多 Agent 编排、长期记忆和复杂 RAG。 |
| 文件工具 | Workers + R2 + D1 metadata + Signed URL | 把文件放进 Git、Pages bundle、KV 或 D1。 |
| 实时协作 | Workers + Durable Objects + D1 / R2 持久化 | 用 KV 做强一致房间状态。 |
| 后台任务 | Workers + Queues + Cron Triggers + D1 / R2 | 在用户请求里同步跑邮件、转码、爬取和批处理。 |
| 私有管理台 | Workers Static Assets + Access / Tunnel + D1 | 裸露公网后台、自写弱登录、把管理接口混在公共接口里。 |
| 多租户 SaaS | Workers + D1 / R2 + Access + Cloudflare for SaaS，必要时 Workers for Platforms | 没有客户自定义域名或用户代码运行需求时，先不上平台化产品。 |

## 三阶段路线

| 阶段 | 做什么 | 目标 |
| --- | --- | --- |
| 免费验证 | 静态站、Workers Free、D1、R2、KV、Pagefind、Web Analytics、Turnstile。 | 先证明项目有人用，不先证明账单能力。 |
| 有人使用 | 补限流、日志、索引、队列、Access、备份、R2 生命周期。 | 把可观察性和风险边界补齐。 |
| 产品化 | Workers Paid、Workers Logs、AI Search / Vectorize、API Shield、Analytics Engine、Cloudflare for SaaS。 | 只为真实瓶颈和真实用户需求付复杂度。 |

## 什么时候付 5 USD/month

Workers Paid 每月最低 5 USD，更准确地说是“动态能力和工程化能力的底座”，不是 Cloudflare Pro，也不是预算封顶。

值得付的信号：

- Worker 请求接近 Free 的每日边界。
- 单次 CPU 明显超过 Free 的 10 ms。
- 需要更多 Cron Triggers、Worker 数量、subrequests 或更大的 bundle。
- 需要 Workers Logs 更高额度、更长留存或 Trace Events Logpush。
- D1、KV、Queues、Durable Objects、Workers AI、Browser Run 已经是产品主路径。
- 希望把 Pages Functions、Workers、存储和后台任务放在同一套 Workers Paid 口径下。

不急着付的信号：

- 项目只是静态文档站、官网、博客或作品集。
- 搜索用 Pagefind 就能解决。
- 评论、表单、API、AI 搜索还没有真实用户。
- 只是想“看起来更专业”，但没有请求、CPU、日志或存储压力。

## 数据产品选择

| 数据形态 | 产品 | 判断 |
| --- | --- | --- |
| 关系数据 | D1 | 用户、订单、评论、表单、配置、业务实体，能写 SQL，读多写少。 |
| 文件对象 | R2 | 图片、附件、导入导出、音视频原始文件、模型数据、日志归档。 |
| 读多写少配置 | KV | 开关、session、路由元数据、个性化配置；不要拿来做强一致事务。 |
| 强一致状态 | Durable Objects | 聊天房间、协作状态、WebSocket、限流器、单用户或单租户状态。 |
| 后台任务 | Queues | 邮件、通知、webhook、导入、审核、AI 批处理和失败重试。 |
| 外部 SQL 加速 | Hyperdrive | 已经有 Postgres / MySQL，不想迁移，但要从 Worker 低延迟访问。 |
| 语义搜索 | Vectorize | 需要 embedding、RAG、相似度搜索和元数据过滤。 |
| 指标分析 | Analytics Engine | 高基数事件、用量计费、服务指标和客户级 telemetry。 |

错误用法往往不是产品不行，而是数据形态放错了：文件进 D1、强一致状态进 KV、后台任务卡在请求里、AI 搜索在内容还很少时提前上向量库。

## 安全最小集

| 入口 | 最小边界 |
| --- | --- |
| 域名 | Web 记录 Proxied，源站 IP 不公开，TLS 用 Full (strict)。 |
| 表单 / 评论 | Turnstile 必须服务端 Siteverify；写入还要有速率限制和日志。 |
| 登录 / 后台 | Access 优先于临时自写登录；Tunnel 入口要配 Access policy。 |
| API | 认证、限流、请求体大小、幂等键、错误日志和 OpenAPI schema。 |
| 文件上传 | 短期签名、大小限制、MIME 校验、R2 metadata、必要时异步扫描。 |
| AI 调用 | AI Gateway 限流、缓存、日志和 provider 隔离；不要把模型 key 放前端。 |
| 密钥 | Cloudflare Secrets 或 Secrets Store，不写入仓库、Markdown、前端包和日志。 |

## 不要提前买的复杂度

| 暂缓项 | 更好的起步方式 |
| --- | --- |
| Kubernetes / VPS 集群 | Workers + D1 / R2 / KV 先覆盖大多数早期需求。 |
| 自建对象存储 | R2 先解决文件与 egress 压力。 |
| 自写认证系统 | Access、成熟认证库或清晰的外部身份服务优先。 |
| 一开始上向量库 | 内容少时先 Pagefind；有自然语言搜索需求再看 AI Search / Vectorize。 |
| 所有请求都进 Worker | 静态资产直接服务，只有动态路径进 Worker。 |
| 自写评论系统 | 成熟组件和后端优先，把精力放在内容与产品。 |
| 过早平台化 | 没有客户自定义域名或用户代码运行需求时，不急着上 Cloudflare for SaaS / Workers for Platforms。 |

## 事实来源

- [Deploy frontend applications](https://developers.cloudflare.com/use-cases/web-apps/deploy-frontend/)
- [APIs and microservices](https://developers.cloudflare.com/use-cases/apis/)
- [Solution guides](https://developers.cloudflare.com/use-cases/solutions/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers Static Assets Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Choose a data or storage product](https://developers.cloudflare.com/workers/platform/storage-options/)
- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- [Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare Zero Trust setup](https://developers.cloudflare.com/cloudflare-one/setup/)
