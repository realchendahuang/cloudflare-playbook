---
title: Cloudflare 文档地图
description: Cloudflare 官方文档的场景化阅读顺序。
---

Cloudflare 官方文档很大。先按场景缩小范围，再进入对应产品页。

## 官方目录怎么读

| 官方大类 | 先理解成什么 | 先读哪里 |
| --- | --- | --- |
| Application performance | 网站入口、缓存、证书、调度和源站压力。 | 先读 [DNS](/platform/dns/)、[SSL/TLS](/platform/ssl-tls/)、[缓存与 CDN](/platform/cache/)、[源站保护](/platform/origin-surge/)。 |
| Application security | WAF、DDoS、Turnstile、Bot、接口保护和邮件域名保护。 | 先读 [安全与网络](/platform/security-networking/)、[WAF](/platform/waf/)、[DDoS 防护](/platform/ddos/)。 |
| Core platform | 账号、账单、规则、日志、通知、域名治理和配置管理。 | 先读 [Fundamentals](/platform/fundamentals/)、[账单与预算](/platform/billing/)、[边缘规则](/platform/rules/)、[观测与日志](/platform/observability/)。 |
| Developer platform | Workers、Pages、D1、KV、R2、Queues、Durable Objects、AI、媒体和进阶计算。 | 先读 [Workers](/platform/workers/)、[数据产品](/platform/data/)、[AI 产品](/platform/ai/)。 |
| Cloudflare One | Access、Tunnel、Gateway、设备、企业网络和数据区域。 | 普通项目只先看 [Zero Trust](/platform/zero-trust-networking/) 的 Access + Tunnel。 |
| Network security | 自有 IP、专线、网络层防护和网络流量分析。 | 放到 [自有网络与专线](/platform/private-networking/)，默认最后读。 |
| Consumer services | 1.1.1.1、Radar、WARP。 | 放到 [公共网络能力](/platform/public-network-specialties/)，作为补充能力阅读。 |
| Docs collections / Other | Learning Paths、Use cases、Migration Guides、Docs for agents、Style Guide。 | 适合作为学习和迁移材料，不直接当选型清单。 |

## 先读顺序

| 顺序 | 读什么 | 目的 |
| --- | --- | --- |
| 1 | [免费额度大全](/platform/free-paid/) | 先知道 0 元能跑什么，5 美元/月买什么。 |
| 2 | [Cloudflare 产品索引](/platform/) | 把产品按场景放到正确位置。 |
| 3 | Fundamentals、DNS、SSL/TLS、Cache | 把域名、HTTPS、缓存和源站保护做对。 |
| 4 | Workers、Static Assets、Pages | 把静态内容和动态入口分开。 |
| 5 | D1、KV、R2、Queues、Durable Objects | 按数据形态选产品。 |
| 6 | WAF、DDoS、Turnstile、Access / Tunnel | 保护写入口、后台和源站。 |
| 7 | Web Analytics、Workers Logs、Billing | 能排障、能看访问、能看成本。 |
| 8 | AI、媒体、实时、平台化、企业网络 | 有明确业务需求后再读。 |

## 什么时候直接去官方文档

| 要查什么 | 官方入口 |
| --- | --- |
| 全量产品目录 | [Cloudflare llms.txt](https://developers.cloudflare.com/llms.txt) |
| 最近变化 | [Cloudflare Changelog](https://developers.cloudflare.com/changelog/) |
| 价格和限制 | 对应产品的 Pricing / Limits 页面 |
| 配置字段、命令、接口 | 对应产品文档的最新页面 |
| 示例和源码 | [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs)、[cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk)、[cloudflare/templates](https://github.com/cloudflare/templates) |
