---
title: 免费与付费边界
description: Cloudflare 常用产品的免费额度、付费入口和成本控制建议。
---

# 免费与付费边界

最后核对日期：2026-06-17。Cloudflare 的额度和价格变化很快，本页用于建立判断框架，最终以官方 pricing / limits 页面为准。

## 一句话判断

Cloudflare 最适合普通人的地方，不是“永远不要花钱”，而是：

1. 免费阶段能把项目跑起来。
2. 第一次付费通常是明确为流量、CPU、存储、构建次数或安全能力买单。
3. 很多产品不收 egress bandwidth，这对独立开发者非常友好。
4. 最容易浪费钱的地方，是把静态访问、搜索、图片、视频、后台任务都错误地打到动态计算里。

## 核心额度速查

| 产品 | Free / 免费边界 | Paid / 付费入口 | 成本控制建议 |
| --- | --- | --- | --- |
| Workers | 100,000 requests/day；10 ms CPU/invocation。 | Standard/Paid 每月最低 $5，包含 10M requests/month 和 CPU 额度，超出按量。 | 只让 API 进 Worker；静态资源走 Static Assets。 |
| Workers Static Assets | 静态资产请求免费不限量；资产存储无额外费用。 | 只有 Worker 脚本被调用时才按 Workers 计费。 | `run_worker_first` 只匹配 `/api/*`。 |
| Pages | Free 计划 500 builds/month、1 concurrent build；静态请求和带宽非常适合公开站。 | Pro/Business 提升构建次数、并发构建和项目能力。 | 纯静态用 Pages；带 API 的新项目优先 Workers Static Assets。 |
| D1 | 5M rows read/day、100k rows written/day、5 GB storage total。 | Paid 每月 25B rows read、50M rows written、5 GB included，超出按量。 | 建索引；别用 D1 做高频计数和大分析。 |
| KV | 100k reads/day、1k writes/day、1k deletes/day、1k lists/day、1 GB storage。 | Paid 每月包含 10M reads、1M writes/deletes/lists、1 GB storage，超出按量。 | 读多写少、最终一致的场景才用 KV。 |
| R2 | 标准存储 10 GB-month、Class A 1M/月、Class B 10M/月；无 egress bandwidth charge。 | 标准存储 $0.015/GB-month；Class A/B 按百万操作计费。 | 大文件走 R2，不走 Pages bundle；注意下载次数也是 Class B 操作。 |
| Durable Objects | Free/Paid 都可用；Free 只支持 SQLite-backed Durable Objects。 | Paid 提供更高用量和更多 storage backend 选择。 | 只放强一致对象状态，例如房间、会话、限流器。 |
| Queues | 10,000 operations/day；消息保留 24 小时。 | Paid 每月包含 1M operations，超出 $0.40/million operations；保留期可配更长。 | 异步任务再上；同步评论不需要。 |
| Workers AI | 每天 10,000 Neurons 免费。 | Paid 超出免费额度按 $0.011 / 1,000 Neurons。 | 先接 AI Gateway 观察成本，再扩大模型调用。 |
| AI Gateway | 所有计划可用；核心功能免费。 | 模型提供商成本、统一计费和高级能力按实际使用评估。 | 所有 AI 请求先过网关，保留日志、缓存、限流能力。 |
| AI Search | 官方标注 available on all plans。 | 具体 indexing/query 限制和价格看 AI Search limits/pricing。 | 文档少时先 Pagefind；内容多、要自然语言搜索再上。 |
| Vectorize | Free 可建少量索引；官方 limits 显示 Free 100 indexes、Paid 50,000 indexes。 | 按 queried/stored vector dimensions 计费。 | 原文放 R2/D1，向量放 Vectorize。 |
| Analytics Engine | 100k data points/day、10k read queries/day；官方说明价格用于预估。 | Paid 每月 10M data points、1M read queries included，超出按量。 | 产品事件和 Worker 指标适合；事务数据不适合。 |
| Web Analytics | Available on all plans，隐私优先。 | 复杂漏斗和业务分析另选 Analytics Engine/第三方。 | 文档站、官网先开它。 |
| DNS | Free/Pro/Business 不对 DNS queries 收费；记录数量有计划上限。 | Enterprise 以 DNS query 等作为报价输入。 | 域名统一放 Cloudflare，记录命名要规范。 |
| CDN / Cache | 基础 CDN/cache 能力免费可用。 | 高级缓存规则、限制、企业能力随计划升级。 | HTML 谨慎缓存，静态资源长缓存。 |
| DDoS Protection | 官方标注 available on all plans。 | 企业级策略、支持、SLA 和更细控制再升级。 | 先接入 Cloudflare；被打时组合 WAF 和限流。 |
| WAF | 官方标注 available on all plans，但功能随计划变化。 | 托管规则、更高级安全能力随计划升级。 | 后台、登录、API 先写最小规则。 |
| Turnstile | Free 计划适合个人站、博客、中小业务和大多数生产应用。 | Enterprise 面向核心业务。 | 表单刷屏严重再加；必须服务端验证 token。 |
| Images | Free 包含外部图片 transformation 能力；官方产品页提到 5,000 transformations included。 | Paid 支持更多 transformations、Images 存储和交付计费。 | 原图放 R2，转换交给 Images。 |
| Stream | 视频存储、编码和播放通常从付费入口开始，部分计划有赠送分钟。 | 视频业务按存储分钟和播放分钟评估。 | 不要把视频硬塞进静态站或普通对象下载。 |
| Browser Run | 官方介绍有 free tier，按 browser time 使用。 | 自动化浏览器规模化后按用量付费。 | 能用 HTTP 抓取就别开浏览器。 |

## 本站的成本模型

本站是一个“Cloudflare 最佳实践仓库”，它自己也应该足够省：

| 模块 | 当前选择 | 为什么 |
| --- | --- | --- |
| 文档页面 | Astro + Starlight + Workers Static Assets | 静态资产请求免费不限量，部署到 Worker 还能带 API。 |
| 站内搜索 | Pagefind | 构建期索引，用户搜索不打后端。 |
| 评论 | Worker API + D1 | 评论是结构化小数据，D1 免费额度足够早期使用。 |
| 防刷 | 蜜罐字段 + IP 哈希限流 | 保持自由评论，不引入登录和审核。 |
| 未来 AI 搜索 | AI Search 或 Vectorize | 等内容足够多后再为自然语言搜索付费。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 所有请求都先经过 Worker。 | 静态资产直接服务，只让 API 进 Worker。 |
| KV 可以当数据库。 | KV 用于读多写少的配置和缓存；关系数据用 D1。 |
| R2 免 egress 就完全免费。 | R2 无 egress bandwidth charge，但存储和操作会计费。 |
| AI 一开始就做向量搜索。 | 先把内容结构化，Pagefind 能解决大部分早期搜索。 |
| 评论必须登录和审核。 | 文档社区可以先自由评论，再用限流和 Turnstile 分层防刷。 |
| 免费额度不用看。 | 免费额度不是无限额度；公开项目要知道硬限制在哪里。 |

## 官方资料

- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Static Assets Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Queues Pricing](https://developers.cloudflare.com/queues/platform/pricing/)
- [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- [Vectorize Pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)
- [Analytics Engine Pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)
- [DNS FAQ](https://developers.cloudflare.com/dns/faq/)
- [Turnstile Plans](https://developers.cloudflare.com/turnstile/plans/)
