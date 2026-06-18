---
title: Cloudflare 产品索引
description: 按场景选择 Cloudflare 产品，先免费、再付费、最后看企业能力。
---

这页只做入口索引。不要从产品名开始学，先从你要解决的问题开始。

## 先读哪页

| 你现在要解决什么 | 先读 |
| --- | --- |
| 想知道 0 元能跑到哪里 | [免费额度大全](/platform/free-paid/) |
| 想把网站上线 | [Fundamentals](/platform/fundamentals/)、[DNS](/platform/dns/)、[SSL/TLS](/platform/ssl-tls/) |
| 想放文档站、官网、博客 | [Workers Static Assets](/platform/static-assets/) 或 [Pages](/platform/pages/) |
| 想写接口、评论、表单、回调 | [Workers](/platform/workers/) |
| 想选数据库、缓存、文件、队列 | [数据产品](/platform/data/) |
| 想保护入口、后台和写接口 | [安全与网络](/platform/security-networking/) |
| 想做搜索或 AI | [AI 产品](/platform/ai/) |
| 想看日志、访问和账单 | [观测与日志](/platform/observability/)、[账单与预算](/platform/billing/) |

## 默认路线

| 阶段 | 默认选法 | 后面再看 |
| --- | --- | --- |
| 入口 | DNS、Universal SSL、CDN、DDoS 默认防护 | 多源站、专线、自有 IP。 |
| 静态内容 | Workers Static Assets / Pages | 全站服务端渲染、所有请求先跑 Worker。 |
| 动态能力 | Workers Free + D1 / KV / R2 | Workers Paid、队列、长流程、容器。 |
| 写入口 | WAF 最小规则、限流、Turnstile | Bot、API Shield、企业日志。 |
| 后台 | Access + Tunnel | 设备管控、长期日志、企业网络。 |
| 搜索 | Pagefind | AI Search、Vectorize、Workers AI。 |
| 观测 | Web Analytics、Workers Logs、预算提醒 | Logpush、Log Explorer、外部日志平台。 |

一句话：静态内容留在静态层，文件进 R2，关系数据进 D1，配置缓存进 KV，强一致状态进 Durable Objects，慢任务进 Queues。

## 产品分组

| 分组 | 先看 | 用来解决 |
| --- | --- | --- |
| 基础入口 | Fundamentals、DNS、SSL/TLS、Cache | 域名、HTTPS、代理、缓存、源站保护。 |
| 开发者平台 | Workers、Static Assets、Pages | 静态站、接口、前端应用、轻后端。 |
| 数据和状态 | D1、KV、R2、Queues、Durable Objects | 关系数据、缓存、文件、异步任务、强一致状态。 |
| 安全和访问 | WAF、DDoS、Turnstile、Access、Tunnel | 攻击防护、反刷、后台保护。 |
| AI 和搜索 | Pagefind、AI Gateway、Workers AI、AI Search、Vectorize | 站内搜索、模型调用、自然语言检索。 |
| 观测和账单 | Web Analytics、Workers Logs、Notifications、Billing | 访问趋势、错误排查、预算提醒。 |
| 后置能力 | Images、Stream、Realtime、Hyperdrive、Workflows、Containers | 媒体、实时、外部数据库、长流程、完整运行环境。 |
| 企业网络 | Magic Transit、BYOIP、Network Interconnect、Cloudflare WAN | 自有 IP、专线、网络团队和合同场景。 |

## 什么时候付费

| 触发信号 | 先看什么 |
| --- | --- |
| Worker 请求、CPU、日志、队列或数据产品接近 Free 边界 | Workers Paid。 |
| WAF、Bot、缓存规则、证书、域名级安全能力不够 | Pro / Business / Enterprise 域名计划。 |
| 图片、视频、浏览器任务、第三方脚本事件开始成为主成本 | Images、Stream、Browser Run、Zaraz 的独立计费。 |
| 需要长期日志、合规留存、外部日志平台 | Logpush、Log Explorer、企业日志能力。 |
| 客户要绑定域名或运行自己的代码 | Cloudflare for SaaS、Workers for Platforms、Dynamic Workers。 |
| 有自有公网 IP、专线或企业网络团队 | Magic Transit、BYOIP、Network Interconnect、Cloudflare WAN。 |
