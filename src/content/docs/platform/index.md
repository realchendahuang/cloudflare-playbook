---
title: Cloudflare 能力清单
---

## 按需求阅读

评估免费阶段适用范围，先读 [免费额度大全](/platform/free-paid/)。

接入域名和 HTTPS，读 [Fundamentals](/platform/fundamentals/)、[DNS](/platform/dns/) 和 [SSL/TLS](/platform/ssl-tls/)。

部署文档站、官网、博客，读 [Workers Static Assets](/platform/static-assets/) 或 [Pages](/platform/pages/)。

构建接口、评论、表单、回调，读 [Workers](/platform/workers/)。

处理数据库、缓存、文件、队列，读 [数据能力](/platform/data/)、[D1](/platform/d1/)、[KV](/platform/kv/) 和 [R2](/platform/r2/)。

保护入口、后台和写接口，读 [安全与网络](/platform/security-networking/)。

构建搜索或 AI 能力，读 [AI 能力](/platform/ai/)。

查看访问、错误和成本，读 [观测与日志](/platform/observability/) 和 [账单与预算](/platform/billing/)。

## 独立开发者项目路线

| 层级 | 默认方案 | 切换条件 |
| --- | --- | --- |
| 网站入口 | DNS + SSL/TLS + CDN + DDoS | 多源站、专线、自有 IP、跨区域容灾。 |
| 静态内容 | Workers Static Assets / Pages | 需要大量动态接口或统一 Worker 工程。 |
| 动态接口 | Workers + D1 / KV / R2 | 请求、CPU、日志或数据能力进入生产瓶颈。 |
| 写入口 | Turnstile + WAF / 限流 | 垃圾提交、凭证填充攻击、接口滥用明显增加。 |
| 后台入口 | Access + Tunnel | 团队设备、审计、DLP 或企业网络要求出现。 |
| 搜索 | Pagefind | 用户开始需要自然语言检索或权限召回。 |
| 观测与账单 | Web Analytics + Workers Logs + 预算提醒 | 需要长期留存、外部日志或审计报表。 |

## 付费条件

Worker 请求、CPU、日志、队列或数据能力接近 Free 限制时，看 Workers Paid。

WAF、Bot、缓存规则、证书、域名级安全能力不够时，看更高域名计划。

图片、视频、浏览器任务、第三方脚本事件成为主要成本时，看 Images、Stream、Browser Run、Zaraz 的独立计费。

需要长期日志、合规留存、外部日志平台时，看长期日志和日志查询。

客户要绑定域名或运行自己的代码时，看 Cloudflare for SaaS、Workers for Platforms、Dynamic Workers。

已经有自有公网 IP、专线或企业网络团队时，再看 Magic Transit、BYOIP、Network Interconnect、Cloudflare WAN。
