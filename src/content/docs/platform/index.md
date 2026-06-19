---
title: Cloudflare 产品索引
description: 按场景选择 Cloudflare 产品，先免费、再付费、最后看企业能力。
---

先从项目问题进入产品地图。具体额度看 [免费额度大全](/platform/free-paid/)，配置细节回官方文档。

## 先按问题读

| 现在的问题 | 先读 |
| --- | --- |
| 想知道 0 元能跑到哪里 | [免费额度大全](/platform/free-paid/) |
| 想把域名和 HTTPS 接好 | [Fundamentals](/platform/fundamentals/)、[DNS](/platform/dns/)、[SSL/TLS](/platform/ssl-tls/) |
| 想放文档站、官网、博客 | [Workers Static Assets](/platform/static-assets/) 或 [Pages](/platform/pages/) |
| 想写接口、评论、表单、回调 | [Workers](/platform/workers/) |
| 想选数据库、缓存、文件、队列 | [数据产品](/platform/data/)、[D1](/platform/d1/)、[KV](/platform/kv/)、[R2](/platform/r2/) |
| 想保护入口、后台和写接口 | [安全与网络](/platform/security-networking/) |
| 想做搜索或 AI | [AI 产品](/platform/ai/) |
| 想看访问、错误和成本 | [观测与日志](/platform/observability/)、[账单与预算](/platform/billing/) |

## 普通项目路线

| 层 | 默认选法 | 什么时候换 |
| --- | --- | --- |
| 网站入口 | DNS + SSL/TLS + CDN + DDoS | 多源站、专线、自有 IP、跨区域容灾。 |
| 静态内容 | Workers Static Assets / Pages | 需要大量动态接口或统一 Worker 工程。 |
| 动态接口 | Workers + D1 / KV / R2 | 请求、CPU、日志或数据产品进入生产瓶颈。 |
| 写入口 | Turnstile + WAF / 限流 | 垃圾提交、撞库、接口滥用明显增加。 |
| 后台入口 | Access + Tunnel | 团队设备、审计、DLP 或企业网络要求出现。 |
| 搜索 | Pagefind | 用户开始需要自然语言检索或权限召回。 |
| 观测与账单 | Web Analytics + Workers Logs + 预算提醒 | 需要长期留存、外部日志或审计报表。 |

一句话：静态内容停在静态层，文件进 R2，关系数据进 D1，配置缓存进 KV，强一致状态进 Durable Objects，慢任务进 Queues。

## 官方目录怎么读

| 官方大类 | 可以理解成 | 先读 |
| --- | --- | --- |
| Application performance | 域名、HTTPS、缓存、回源和调度 | DNS、SSL/TLS、Cache、Origin Surge |
| Application security | WAF、DDoS、Bot、Turnstile、API 保护 | 安全与网络、WAF、DDoS |
| Core platform | 账号、账单、规则、日志、通知和配置治理 | Fundamentals、Billing、Rules、Observability |
| Developer platform | Workers、Pages、存储、队列、AI、媒体 | Workers、Static Assets、Data、AI |
| Cloudflare One | Access、Tunnel、Gateway、设备和企业访问 | Zero Trust、Private Networking |
| Network security | 自有 IP、专线、网络层防护和网络流量 | Private Networking、Traffic Routing |

## 什么时候付费

| 触发信号 | 看什么 |
| --- | --- |
| Worker 请求、CPU、日志、队列或数据产品接近 Free 边界 | Workers Paid。 |
| WAF、Bot、缓存规则、证书、域名级安全能力不够 | 更高域名计划。 |
| 图片、视频、浏览器任务、第三方脚本事件成为主成本 | Images、Stream、Browser Run、Zaraz 的独立计费。 |
| 需要长期日志、合规留存、外部日志平台 | 长期日志和日志查询能力。 |
| 客户要绑定域名或运行自己的代码 | Cloudflare for SaaS、Workers for Platforms、Dynamic Workers。 |
| 有自有公网 IP、专线或企业网络团队 | Magic Transit、BYOIP、Network Interconnect、Cloudflare WAN。 |
