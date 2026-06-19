---
title: 独立开发者推荐栈
---

## 默认组合

| 层级 | 推荐能力 | 使用方式 |
| --- | --- | --- |
| 入口 | DNS、CDN、Universal SSL、DDoS Protection | 域名接入 Cloudflare，网站记录开启代理，TLS 用 Full (strict)。 |
| 内容 | Workers Static Assets 或 Pages | 文档、官网、博客、前端页面优先静态化。 |
| 动态接口 | Workers | 接口、第三方回调、签名上传、评论、表单和轻量业务逻辑。 |
| 关系数据 | D1 | 用户、订单、配置、评论、表单、小后台数据。 |
| 文件对象 | R2 | 图片、附件、导出物、用户上传和日志归档。 |
| 配置缓存 | KV | 读多写少的配置、开关、会话和路由元数据。 |
| 异步任务 | Queues | 邮件、通知、导入、审核、AI 批处理和失败重试。 |
| 强一致状态 | Durable Objects | 聊天房间、协作状态、WebSocket、限流器、单用户状态。 |
| 安全 | Turnstile、WAF、限流、Access / Tunnel | 保护表单、评论、登录、上传、后台和内网工具。 |
| AI | AI Gateway、Workers AI、AI Search / Vectorize | 先统一 AI 请求和日志，再决定模型和自然语言搜索。 |

## MVP 骨架

MVP 阶段先把全栈原型、版本控制和部署流程跑通，不为早期项目搭复杂工程平台。写代码用 Codex + GitHub；应用前端选 TanStack Start，文档、官网、教程站优先 Astro / Starlight 静态化。

API 用 Hono + Workers，让 Worker 做入口、鉴权、签名、回调和轻业务逻辑。支付优先接 Stripe，不在 MVP 阶段自写支付系统。数据层用 D1 + R2 + KV：D1 放关系数据，R2 放文件，KV 放读多写少的配置和缓存。

邮件、爬取、AI 批处理、导入导出进 Queues / Workflows。已有 Postgres / MySQL 时再接 Hyperdrive。只有 Worker 原生运行时装不下依赖或工具时，再上 Containers。

## 按常见场景选

| 场景 | 推荐组合 |
| --- | --- |
| 文档站 / 博客 | Astro / Starlight + Workers Static Assets / Pages + Pagefind + Web Analytics |
| 文档社区 | Workers Static Assets + Twikoo Cloudflare + D1 + 后续 Turnstile |
| 小型 SaaS | Workers + D1 + KV + R2 + Turnstile + AI Gateway |
| AI 工具 | Workers + AI Gateway + D1 记录 + R2 文件 + 后续 Workers AI / Vectorize |
| 文件工具 | Workers + R2 + D1 元数据 + 签名链接 |
| 实时协作 | Workers + Durable Objects + D1 / R2 持久化 |
| 后台任务 | Workers + Queues + Cron Triggers + D1 / R2 |
| 私有管理台 | Workers Static Assets + Access / Tunnel + D1 |
| 多租户 SaaS | Workers + D1 / R2 + Access + Cloudflare for SaaS，必要时 Workers for Platforms |

## 升级信号

- 不要太早上 Kubernetes / VPS 集群。Workers + D1 / R2 / KV 可覆盖大多数早期场景。
- 不要太早自建对象存储。R2 可先解决文件与 egress 压力。
- 不要太早自写认证系统。Access、成熟认证库或清晰的外部身份服务优先。
- 内容量较少时不要急着上向量库，先用 Pagefind；有自然语言搜索场景后再评估 AI Search / Vectorize。
- 静态资产直接返回，只有动态路径交给 Worker，不要把所有请求都打进 Worker。
- 一次请求只做校验、入库或入队，慢任务交给 Queues / Workflows / Containers。
- 免费额度大，但上线后仍要看请求、CPU、D1 行读写、R2 操作和日志。
- 业务早期更重要的是低成本验证；R2 兼容 S3，迁移成本明确后再拆分。
- 技术栈只能降低交付成本，方向仍要先证明有人需要、愿意使用或付费。
- 评论系统优先复用成熟组件和后端，把精力放在内容与体验。
- 有客户自定义域名或用户代码运行场景后，再看 Cloudflare for SaaS / Workers for Platforms。
