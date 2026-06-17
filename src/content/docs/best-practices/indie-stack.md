---
title: 独立开发者推荐栈
description: 面向个人项目、开源项目和早期 SaaS 的 Cloudflare 产品组合建议。
---

最后核对日期：2026-06-17。

独立开发者用 Cloudflare，核心不是把所有产品都用上，而是把域名入口、静态内容、动态接口、数据、文件、安全和观测放到正确位置。这样免费阶段能跑起来，第一次付费也能知道自己买的是请求、CPU、存储、日志、安全还是 AI 用量。

## 一句话判断

默认从这套组合起步：

```text
入口层
  ├─ DNS
  ├─ CDN / Cache
  ├─ Universal SSL / Full (strict)
  └─ DDoS Protection

应用层
  ├─ Workers Static Assets / Pages: 文档、官网、前端页面
  ├─ Workers: API、Webhook、签名、轻量业务逻辑
  └─ Pagefind / Web Analytics: 静态搜索和基础访问分析

数据层
  ├─ D1: 关系数据
  ├─ R2: 文件、图片、导出物、用户上传
  ├─ KV: 配置、会话、读多写少缓存
  ├─ Queues: 邮件、通知、导入、后处理
  └─ Durable Objects: 房间、协作、强一致状态

增强层
  ├─ Turnstile / WAF: 表单、评论、登录、上传防滥用
  ├─ AI Gateway: AI 调用、缓存、限流、日志
  ├─ AI Search / Vectorize: 内容变多后的自然语言搜索
  └─ Access / Tunnel: 管理后台和内网工具
```

这套栈的重点是顺序：**先静态、再动态；先 D1 / R2 / KV，后 Durable Objects / Queues；先 AI Gateway，后向量库和复杂 Agent。**

## 起步组合

| 能力 | 推荐产品 | 起步理由 |
| --- | --- | --- |
| 域名入口 | DNS + Proxied records | 让 Cloudflare 接管入口，后续 SSL/TLS、缓存、WAF、DDoS、Rules 才能工作。 |
| HTTPS | Universal SSL + Full (strict) | 边缘到源站都加密，避免 Flexible SSL 这类半截链路。 |
| 静态页面 | Workers Static Assets 或 Pages | 文档、博客、官网、SPA 主流量停在静态资产层，减少动态请求成本。 |
| API | Workers | 全球边缘运行，适合 webhook、表单、评论、签名上传和轻量业务接口。 |
| 关系数据 | D1 | 用户、订单、配置、评论、表单这类结构化数据先用 SQL。 |
| 文件对象 | R2 | 图片、附件、导出物和用户上传不要进 Git、D1 或静态包。 |
| 配置缓存 | KV | 适合读多写少、最终一致的配置、会话和路由元数据。 |
| 基础分析 | Web Analytics | 免费、隐私友好，适合先知道页面有没有人看。 |
| AI 入口 | AI Gateway | 先统一 AI 请求、缓存、限流和日志，再决定模型与向量库。 |
| 防滥用 | Turnstile + WAF / Rate Limiting | 登录、评论、表单、上传和 AI 调用先有边界。 |

## 按项目类型选

| 项目 | 推荐组合 | 暂时不要上 |
| --- | --- | --- |
| 文档站 / 博客 | Astro / Starlight + [Workers Static Assets](/platform/static-assets/) + Pagefind + Web Analytics | D1、AI Search、Queues，除非有评论、表单或问答。 |
| 文档社区 | Workers Static Assets + Twikoo Cloudflare + D1 + 后续 Turnstile | 一开始就维护自定义评论组件和复杂管理端。 |
| 小型 SaaS | Workers + D1 + KV + R2 + Turnstile + AI Gateway | 微服务、Kubernetes、自建对象存储、自建认证系统。 |
| AI 工具 | Workers + AI Gateway + D1 记录 + R2 文件 + 后续 Workers AI / Vectorize | 一开始就做多 Agent 编排、长期记忆和复杂 RAG。 |
| 文件工具 | Workers + R2 + D1 metadata + Signed URL | 把文件放进 Git、Pages bundle、KV 或 D1。 |
| 实时协作 | Workers + Durable Objects + D1 / R2 持久化 | 用 KV 做强一致房间状态。 |
| 后台任务 | Workers + Queues + Cron Triggers + D1 / R2 | 在用户请求里同步跑邮件、转码、爬取和批处理。 |
| 私有管理台 | Workers Static Assets + Access / Tunnel + D1 | 裸露公网后台、自写弱登录、把管理接口混在公共接口里。 |
| 多租户 SaaS | Workers + D1 / R2 + Access + Cloudflare for SaaS，必要时 Workers for Platforms | 没有客户自定义域名或用户代码运行需求时，先不上平台化产品。 |

## 三阶段路线

### 第一阶段：免费跑起来

目标是验证项目，而不是验证账单极限。

- 域名接入 Cloudflare，Web 记录走 Proxied。
- TLS 用 Full (strict)，源站证书用 Origin CA 或公开 CA。
- 静态页面优先 Workers Static Assets 或 Pages。
- API 用 Workers，少量关系数据用 D1。
- 文件、图片、导出和上传进 R2。
- 配置、开关、会话和读多写少缓存进 KV。
- 搜索先用 Pagefind，分析先用 Web Analytics。
- AI 调用先走 AI Gateway，先看请求数、缓存、错误和日志。
- 表单、评论、上传、登录和 AI 接口先接 Turnstile 或最小限流。

### 第二阶段：有人用了再补

项目有真实用户以后，优先补可观察和边界。

| 信号 | 先做什么 |
| --- | --- |
| 表单、评论或注册被刷 | Turnstile 服务端验证、WAF / Rate Limiting、最小审核流程。 |
| API 变慢 | 看 Worker CPU、外部 API 延迟、D1 查询计划和索引。 |
| 文件变多 | R2 分桶、生命周期、CORS、短期签名 URL 和下载热点观察。 |
| AI 成本不清楚 | 所有模型调用进 AI Gateway，打开缓存、限流和日志。 |
| 后台任务拖慢请求 | 引入 Queues，把邮件、导入、通知、审核和 AI 批处理拆出去。 |
| 用户需要实时状态 | 用 Durable Objects 管房间、会话、限流器或 WebSocket 状态。 |
| 管理后台需要保护 | 用 Access / Tunnel，而不是自写一套临时登录。 |

### 第三阶段：产品化以后再买复杂度

产品化阶段再考虑这些能力：

| 能力 | 什么时候值得上 |
| --- | --- |
| Workers Paid | 动态请求、CPU、Cron、日志、D1 / KV / Queues / Durable Objects 等额度成为真实约束。 |
| Analytics Engine | 需要高基数业务指标、用量计费、客户级指标或服务健康数据。 |
| AI Search / Vectorize | 内容量和搜索需求足够大，关键词搜索已经不能回答自然语言问题。 |
| API Shield | API 已经有清晰 OpenAPI schema，且有客户数据、移动端或第三方调用风险。 |
| Cloudflare for SaaS | 真实需要客户自定义域名和 SaaS hostname 管理。 |
| Workers for Platforms | 真实需要让客户上传或运行自己的 Worker 代码。 |
| Containers / Sandbox SDK | 需要运行非 Worker 运行时、浏览器、代码执行或隔离任务。 |

## 什么时候付 $5

Workers Paid 每月最低 `$5 USD`，更准确地说是“动态能力和工程化能力的底座”，不是 Cloudflare Pro，也不是预算封顶。

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

完整数字见 [免费与付费边界](/platform/free-paid/)。这篇文章只保留决策口径，避免在多个页面维护同一组价格。

## 数据产品选择

Cloudflare 官方的 storage options 文档把产品按数据形态分得很清楚。独立开发者可以这样记：

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

独立项目的安全不需要一开始企业化，但边界要早建。

| 入口 | 最小边界 |
| --- | --- |
| 域名 | Web 记录 Proxied，源站 IP 不公开，TLS 用 Full (strict)。 |
| 表单 / 评论 | Turnstile 必须服务端 Siteverify；token 5 分钟有效且单次使用。 |
| 登录 / 后台 | Access 优先于临时自写登录；Tunnel 入口要配 Access policy。 |
| API | 认证、限流、请求体大小、幂等键、错误日志和 OpenAPI schema。 |
| 文件上传 | 短期签名、大小限制、MIME 校验、R2 metadata、必要时异步扫描。 |
| AI 调用 | AI Gateway 限流、缓存、日志和 provider 隔离；不要把模型 key 放前端。 |
| 密钥 | `wrangler secret` 或 Secrets Store，不写入源码、Markdown、前端包和日志。 |

## 常见组合

| 组合 | 适合项目 | 备注 |
| --- | --- | --- |
| Static Assets + Pagefind + Web Analytics | 文档、博客、官网 | 成本最低，读路径完全静态。 |
| Workers + D1 + R2 | 表单、文件工具、小型 SaaS | 最常见的动态项目起点。 |
| Workers + AI Gateway + D1 | AI 工具、LLM wrapper、问答记录 | 先看日志与缓存，再决定是否上 Workers AI 或外部模型。 |
| Workers + Queues + R2 | 导入、转码、通知、异步处理 | 请求只负责入队，耗时任务后台处理。 |
| Workers + Durable Objects + D1 | 聊天、协作、实时状态 | DO 管实时状态，D1 做历史和配置。 |
| Access + Tunnel + Workers | 私有管理台、内部工具 | 后台不要裸奔在公网。 |

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

## 本站为什么这么搭

Cloudflare Playbook 当前选择：

| 能力 | 产品 | 原因 |
| --- | --- | --- |
| 文档 | Astro + Starlight | Markdown 友好，开源协作成本低。 |
| 搜索 | Pagefind | 免费、静态、低复杂度。 |
| 部署 | [Workers Static Assets](/platform/static-assets/) | 静态站和未来 API 可以放在同一个 Worker-first 模型里。 |
| 评论 | Twikoo + twikoo-cloudflare + D1 | 复用成熟评论组件，并把服务托管在 Cloudflare。 |
| 主题 | Starlight Theme Next + Cloudflare 主题变量 | 复用成熟文档主题，只通过主题变量收敛品牌色。 |
| 未来增强 | Turnstile、AI Gateway、AI Search | 等评论量、搜索需求和内容规模真实出现后再加。 |

## GitHub 开源参考

| 仓库 / 目录 | 值得参考的点 |
| --- | --- |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，学习路线和教程分层值得借鉴。 |
| [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs) | 价格、limits、Use cases、Solution guides 和产品文档源文件。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | 官方模板集合，覆盖 Astro、D1、R2、KV、Durable Objects、Workflows、SaaS Admin、React Router + Hono 等场景。 |
| [cloudflare/templates astro-blog-starter-template](https://github.com/cloudflare/templates/tree/main/astro-blog-starter-template) | Astro 内容站和 Workers 部署参考。 |
| [cloudflare/templates d1-template](https://github.com/cloudflare/templates/tree/main/d1-template) | D1 起步结构和绑定方式。 |
| [cloudflare/templates r2-explorer-template](https://github.com/cloudflare/templates/tree/main/r2-explorer-template) | R2 文件浏览和对象存储项目参考。 |
| [cloudflare/templates to-do-list-kv-template](https://github.com/cloudflare/templates/tree/main/to-do-list-kv-template) | KV 读写和轻量状态参考。 |
| [cloudflare/templates durable-chat-template](https://github.com/cloudflare/templates/tree/main/durable-chat-template) | Durable Objects 实时聊天参考。 |
| [cloudflare/templates saas-admin-template](https://github.com/cloudflare/templates/tree/main/saas-admin-template) | 早期 SaaS 管理台结构参考。 |
| [cloudflare/skills](https://github.com/cloudflare/skills) | Cloudflare 官方 Agent Skills，适合给 Codex 固化产品边界。 |
| [cloudflare/mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare) | 后续把平台操作、日志和资源读取接入 MCP 的参考。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Miniflare 和 Workers SDK 源头。 |

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
