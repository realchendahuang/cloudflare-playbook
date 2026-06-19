---
title: 独立开发者推荐栈
description: 面向个人项目、开源项目和早期 SaaS 的 Cloudflare 产品组合。
---

独立开发者用 Cloudflare，先把域名入口、静态内容、动态接口、数据、文件、安全和观测放到正确位置。这样免费阶段能跑起来，第一次付费也能知道自己买的是请求、CPU、存储、日志还是 AI 用量。

## 默认组合

| 层 | 推荐产品 | 用法 |
| --- | --- | --- |
| 入口 | DNS、CDN、Universal SSL、DDoS Protection | 域名接入 Cloudflare，网站记录开启代理，TLS 用 Full (strict)。 |
| 内容 | Workers Static Assets 或 Pages | 文档、官网、博客、前端页面优先静态化。 |
| 动态接口 | Workers | 接口、第三方回调、签名上传、评论、表单和轻量业务逻辑。 |
| 关系数据 | D1 | 用户、订单、配置、评论、表单、小后台数据。 |
| 文件对象 | R2 | 图片、附件、导出物、用户上传和日志归档。 |
| 配置缓存 | KV | 读多写少的配置、开关、会话和路由元数据。 |
| 异步任务 | Queues | 邮件、通知、导入、审核、AI 批处理和失败重试。 |
| 强一致状态 | Durable Objects | 聊天房间、协作状态、WebSocket、限流器、单用户状态。 |
| 安全 | Turnstile、WAF、限流、Access / Tunnel | 表单、评论、登录、上传、后台和内网工具的边界。 |
| AI | AI Gateway、Workers AI、AI Search / Vectorize | 先统一 AI 请求和日志，再决定模型和自然语言搜索。 |

这套栈最看重顺序：先把主路径跑通，再把强一致、异步任务和自然语言搜索放到明确需求后。

## 按项目类型选

| 项目 | 推荐组合 | 边界 |
| --- | --- | --- |
| 文档站 / 博客 | Astro / Starlight + Workers Static Assets / Pages + Pagefind + Web Analytics | D1、AI Search、Queues，除非有评论、表单或问答。 |
| 文档社区 | Workers Static Assets + Twikoo Cloudflare + D1 + 后续 Turnstile | 自写评论组件和完整管理端。 |
| 小型 SaaS | Workers + D1 + KV + R2 + Turnstile + AI Gateway | 微服务、Kubernetes、自建对象存储、自建认证系统。 |
| AI 工具 | Workers + AI Gateway + D1 记录 + R2 文件 + 后续 Workers AI / Vectorize | 一开始就做多助手编排、长期记忆和完整检索链路。 |
| 文件工具 | Workers + R2 + D1 元数据 + 签名链接 | 把文件放进 Git、Pages bundle、KV 或 D1。 |
| 实时协作 | Workers + Durable Objects + D1 / R2 持久化 | 用 KV 做强一致房间状态。 |
| 后台任务 | Workers + Queues + Cron Triggers + D1 / R2 | 在用户请求里同步跑邮件、转码、爬取和批处理。 |
| 私有管理台 | Workers Static Assets + Access / Tunnel + D1 | 后台直接暴露公网、自写弱登录、把管理接口混在公共接口里。 |
| 多租户 SaaS | Workers + D1 / R2 + Access + Cloudflare for SaaS，必要时 Workers for Platforms | 没有客户自定义域名或用户代码运行需求时，先不上平台化产品。 |

## 升级边界

| 能力 | 起步方式 |
| --- | --- |
| Kubernetes / VPS 集群 | Workers + D1 / R2 / KV 先覆盖大多数早期需求。 |
| 自建对象存储 | R2 先解决文件与 egress 压力。 |
| 自写认证系统 | Access、成熟认证库或清晰的外部身份服务优先。 |
| 一开始上向量库 | 内容少时先 Pagefind；有自然语言搜索需求再看 AI Search / Vectorize。 |
| 所有请求都进 Worker | 静态资产直接服务，只有动态路径进 Worker。 |
| 自写评论系统 | 优先复用成熟组件和后端，把精力放在内容与产品。 |
| 平台化 | 有客户自定义域名或用户代码运行需求后，再看 Cloudflare for SaaS / Workers for Platforms。 |

具体额度见 [免费额度大全](/platform/free-paid/)。
