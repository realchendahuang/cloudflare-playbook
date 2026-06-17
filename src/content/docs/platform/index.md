---
title: Cloudflare 产品大图谱
description: 面向独立开发者和小团队的 Cloudflare 产品入口、免费边界和选型路线。
---

最后核对日期：2026-06-18。

这页只做产品入口和选型判断。具体 API、配置字段、命令和限制细节，放到对应专题页里。

## 先看这个

| 你要解决什么 | 先读 |
| --- | --- |
| 不知道 Cloudflare 能不能免费跑项目 | [免费额度大全](/platform/free-paid/) |
| 想把网站上线 | [DNS](/platform/dns/)、[SSL/TLS](/platform/ssl-tls/)、[Workers Static Assets](/platform/static-assets/) 或 [Pages](/platform/pages/) |
| 想写 API 或后端逻辑 | [Workers](/platform/workers/) |
| 想存数据 | [数据产品](/platform/data/) |
| 想做安全防护 | [WAF](/platform/waf/)、[DDoS Protection](/platform/ddos/)、[安全与网络](/platform/security-networking/) |
| 想做搜索或 AI | [AI 产品](/platform/ai/) |
| 想看日志和访问数据 | [观测与日志](/platform/observability/) |
| 想用 Terraform / Pulumi 管配置 | [迁移与 IaC](/platform/iac-migration/) |

## 普通项目路线

| 阶段 | 默认选择 | 什么时候升级 |
| --- | --- | --- |
| 上线 | DNS、Universal SSL、CDN、Static Assets / Pages | 需要多源站、专线、企业证书或复杂缓存时再升级。 |
| 动态接口 | Workers | 请求、CPU、日志或后台任务接近 Free 边界时，考虑 Workers Paid。 |
| 数据 | D1、KV、R2 | 读写、存储、对象操作量成为真实瓶颈时再优化。 |
| 安全 | DDoS 默认防护、WAF 最小规则、Turnstile、Access | 出现刷量、攻击、审计或团队权限需求时再加规则和计划。 |
| 搜索 | Pagefind 起步 | 内容量大、需要自然语言搜索时再看 AI Search / Vectorize。 |
| 观测 | Web Analytics、Workers Logs、Budget alerts | 需要长期取证、外部 SIEM 或完整日志时再看 Logpush / Log Explorer。 |

核心原则：静态内容不要进 Worker，文件不要进数据库，强一致状态不要放 KV，后台任务不要堵在用户请求里。

## 产品怎么选

| 产品域 | 普通项目先看 | 适合解决 |
| --- | --- | --- |
| 基础入口 | [Fundamentals](/platform/fundamentals/)、[DNS](/platform/dns/)、[SSL/TLS](/platform/ssl-tls/) | 账号、域名、代理、HTTPS、源站保护。 |
| 静态站 | [Workers Static Assets](/platform/static-assets/)、[Pages](/platform/pages/) | 文档站、官网、博客、前端应用。 |
| 动态计算 | [Workers](/platform/workers/) | API、Webhook、鉴权、轻量后端。 |
| 数据与文件 | [D1](/platform/d1/)、[KV](/platform/kv/)、[R2](/platform/r2/)、[数据产品](/platform/data/) | SQL、配置缓存、对象存储、数据产品选型。 |
| 状态与异步 | [Durable Objects](/platform/durable-objects/)、[Queues](/platform/queues/) | 强一致房间、限流器、WebSocket、后台任务。 |
| 安全 | [WAF](/platform/waf/)、[DDoS Protection](/platform/ddos/)、[安全与网络](/platform/security-networking/) | 攻击防护、限流、验证码、后台保护。 |
| AI | [AI 产品](/platform/ai/) | AI Gateway、Workers AI、AI Search、Vectorize、Agents。 |
| 观测 | [观测与日志](/platform/observability/)、[Billing](/platform/billing/) | 访问分析、日志、告警、账单。 |
| 进阶计算 | [扩展计算与数据管道](/platform/extended-compute-data/) | Hyperdrive、Workflows、Pipelines、Containers。 |
| 多租户 | [平台化与多租户](/platform/platforms-saas/) | 客户自定义域名、用户代码运行、SaaS 平台能力。 |
| 企业网络 | [Zero Trust 与企业网络](/platform/zero-trust-networking/)、[自有网络与专线](/platform/private-networking/) | Access、Tunnel、Gateway、专线、自有 IP。 |

## 免费优先

| 免费阶段适合先用 | 不要一开始就上 |
| --- | --- |
| DNS、CDN、Universal SSL、DDoS 默认防护 | Load Balancing、Argo、Spectrum、专线。 |
| Workers Static Assets / Pages | 全站 SSR 或所有请求先跑 Worker。 |
| Workers Free、D1 Free、KV Free、R2 Free | 容器、复杂工作流、外部数据库加速。 |
| Turnstile、WAF 最小规则、Access + Tunnel | 高级 Bot、完整 API Shield、企业日志。 |
| Pagefind、Web Analytics、Budget alerts | 一开始就做完整 AI 搜索、SIEM、复杂埋点。 |

第一次付费通常从 Workers Paid 开始，因为它直接放大开发者平台的请求、CPU、KV、Durable Objects、日志和部分后台能力。但 Workers Paid 不是 Cloudflare Pro，也不会自动提升 WAF、Bot、Rules、证书或企业网络配额。

## 不要默认使用

| 产品 / 能力 | 为什么不默认 |
| --- | --- |
| Containers | 只有 Worker 运行时不适合时再用。 |
| Workflows | 普通异步任务先用 Queues；需要长流程和步骤状态再看 Workflows。 |
| Workers for Platforms / Dynamic Workers | 只有用户代码运行、多租户平台和低代码场景才需要。 |
| Magic Transit / BYOIP / Network Interconnect | 企业网络工程，不是普通网站默认栈。 |
| Stream / Images Paid | 媒体业务再上；普通站点先用 R2 和常规优化。 |
| Logpush / Log Explorer | 需要长期取证或合规日志时再买。 |

## 事实来源

- [Cloudflare Developer Documentation llms.txt](https://developers.cloudflare.com/llms.txt)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare Billing](https://developers.cloudflare.com/billing/)
