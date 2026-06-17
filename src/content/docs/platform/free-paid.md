---
title: 免费与付费边界
description: Cloudflare 常用产品的免费额度、付费入口和成本控制建议。
---

最后核对日期：2026-06-17。Cloudflare 的额度和价格变化很快，本页用于建立判断框架，最终以官方 pricing / limits 页面为准。

## 一句话判断

Cloudflare 最适合普通人的地方，不是“永远不要花钱”，而是：

1. 免费阶段能把项目跑起来。
2. 第一次付费通常是明确为请求、CPU、存储、构建、日志、安全或 AI 用量买单。
3. 静态资产请求、R2 egress、D1 数据访问 egress 等关键链路有很友好的边界。
4. 最容易浪费钱的地方，是把静态访问、搜索、图片、视频、后台任务都错误地打到动态计算里。

## 先看 $5 Workers Paid

Workers Paid 是很多 Cloudflare 开发者项目的第一笔固定支出，官方价格页写的是每个账户每月最低 **$5 USD**。它不是 Cloudflare Pro，也不是 Pages Pro；它主要扩展 Workers、Pages Functions、KV、Hyperdrive、Durable Objects 等开发者平台能力。

| 能力 | Free | Workers Paid / Standard |
| --- | --- | --- |
| Worker 请求 | 100,000 requests/day。 | 10M requests/month included，超出 $0.30/million。 |
| CPU | 10 ms CPU/invocation。 | 30M CPU milliseconds/month included，超出 $0.02/million CPU ms；单次默认 30s，可设到 5min。 |
| 静态资产请求 | 免费且不限量。 | 免费且不限量。 |
| 内存 | 128 MB。 | 128 MB。 |
| Subrequests | 50/request。 | 默认 10,000/request，可通过配置提高，最高可到 10M。 |
| Worker 数量 | 100。 | 500。 |
| Cron Triggers | 5/account。 | 250/account。 |
| Worker 压缩后大小 | 3 MB。 | 10 MB。 |
| Static Asset 文件数 | 20,000 files/Worker version。 | 100,000 files/Worker version。 |
| Static Asset 单文件 | 25 MiB。 | 25 MiB。 |
| Workers Logs | 200,000 log events/day，保留 3 天。 | 20M log events/month included，超出 $0.60/million，保留 7 天。 |
| Workers Builds | 3,000 build minutes/month，1 concurrent build。 | 6,000 build minutes/month，超出 $0.005/min，6 concurrent builds。 |
| Containers | 不可用。 | 包含 25 GiB-hours/month、375 vCPU-minutes/month、200 GB-hours/month，超出按量。 |

## 免费额度速查

| 产品 | 免费额度 / 免费边界 | 付费入口 | 成本控制建议 |
| --- | --- | --- | --- |
| [DNS](/platform/dns/) | Free/Pro/Business 不对 DNS queries 收费，且不限制 DNS queries；新 Free zone 为 200 records/zone，旧 Free zone 为 1,000。 | Enterprise 把 monthly DNS queries 作为报价输入之一；record limit 可申请提高。 | 域名统一接入 Cloudflare，Web 入口代理，邮件和验证记录保持 DNS-only。 |
| [Cache / CDN](/platform/cache/) | Cache / CDN 可用于所有计划；Free 有 10 条 Cache Rules，Edge Cache TTL 最小 2 小时，最大可缓存文件 512 MB，Purge by URL 800 URLs/s。 | Pro/Business/Enterprise 提升规则数量、Edge TTL 最小值、purge 限制和企业拓扑；Cache Reserve 为 usage-based add-on，Storage $0.015/GB-month、Class A $4.50/million、Class B $0.36/million。 | 静态 hash 资源长缓存；HTML 谨慎缓存；用户态 bypass；大文件和媒体用 R2/Images/Stream。 |
| [SSL/TLS](/platform/ssl-tls/) | Universal SSL、Origin CA、Always Use HTTPS、Automatic HTTPS Rewrites、HSTS、TLS 1.3、Minimum TLS Version、Authenticated Origin Pulls 都可在 Free 使用。 | Advanced Certificate Manager 是付费 add-on；Custom Certificates 从 Business 起；Keyless SSL 是 Enterprise paid add-on；Strict (SSL-Only Origin Pull) 是 Enterprise-only。 | 普通项目默认 Full (strict)，Universal SSL 负责边缘，Origin CA 或公开 CA 负责源站。 |
| DDoS Protection | 官方说明所有计划都提供自动 DDoS 防护，并且 DDoS 防护是 unmetered。 | 需要更细策略、告警、支持和 SLA 时升级。 | 普通项目先把域名接入，出问题再结合 WAF、限流和日志。 |
| [WAF](/platform/waf/) | WAF available on all plans；Free 有 5 条 Custom Rules、1 条 Rate Limiting Rule、Free Managed Ruleset、1 个 Custom List / 10,000 items、sampled Security Events。 | Pro/Business/Enterprise 提升 Custom Rules、Rate Limiting、Managed Rules、Attack Score、Security Events 和高级检测能力；Workers Paid 不提升 WAF 配额。 | 登录、后台、API、评论和上传先加最小规则；先观察 Security Events，再逐步 block。 |
| Turnstile | Free 计划适合个人站、博客、中小业务、开发测试和大多数生产应用；Free widget 最多 10 个 hostnames。 | Enterprise widget 最多 200 个 hostnames，并面向关键业务。 | 只放前端组件不够，必须服务端验证 token。 |
| [Pages 静态站](/platform/pages/) | 静态资产请求免费且不限量；Free 计划 500 builds/month、1 concurrent build、100 custom domains/project、20,000 files/site、25 MiB/file。 | Pro/Business 提升构建次数、并发构建和文件数；Paid 文件数可到 100,000，Pages Functions 按 Workers 计费。 | 纯静态站和 PR 预览可用 Pages；新 full-stack 项目优先 Workers Static Assets。 |
| [Workers Static Assets](/platform/static-assets/) | 静态资产请求免费且不限量，资产存储无额外费用；20,000 files/Worker version、25 MiB/file。 | 静态资产请求仍免费；Paid 为 100,000 files/Worker version、25 MiB/file；只有请求进入 Worker 脚本时才按 Workers 计费。 | 文档站、官网、SPA 默认走静态资产；API 单独走 Worker。 |
| Workers | 100,000 requests/day；10 ms CPU/invocation。 | Workers Paid 每月最低 $5，见上一节。 | 静态请求不要消耗 Worker；给 CPU 设置上限，避免 runaway bills。 |
| D1 | 5M rows read/day、100k rows written/day、5 GB total storage；Free 单库最大 500 MB，10 个数据库/account。 | Paid 每月 25B rows read、50M rows written、5 GB included，超出按量；Paid 单库最大 10 GB、总存储 1 TB。 | 常查字段建索引；评论、配置、小型 SaaS 很适合，高频计数和大分析不适合。 |
| [KV](/platform/kv/) | 100k reads/day、1k writes/day、1k deletes/day、1k lists/day、1 GB storage。 | Paid 每月 10M reads、1M writes/deletes/lists、1 GB storage included，超出按量。 | 读多写少、最终一致的配置和缓存才用 KV；同一个 key 仍然只有 1 次/秒写入。 |
| [R2](/platform/r2/) | Standard storage 10 GB-month/month、Class A 1M/month、Class B 10M/month；egress 免费；Infrequent Access 不包含免费额度。 | Standard storage $0.015/GB-month，Class A $4.50/million，Class B $0.36/million；Infrequent Access 为 $0.01/GB-month、Class A $9.00/million、Class B $0.90/million、data retrieval $0.01/GB。 | 大文件走 R2，不走 Git、Pages bundle 或 D1；下载次数也是 Class B，冷数据再考虑 IA。 |
| Hyperdrive | 100,000 database queries/day。 | Workers Paid 为 unlimited，仍要考虑外部数据库自身费用。 | 已有 Postgres/MySQL 再接；新小项目优先 D1。 |
| [Queues](/platform/queues/) | 10,000 operations/day included；消息保留 24 小时。 | Paid 1M operations/month included，超出 $0.40/million；保留期默认 4 天，可配到 14 天。 | 小消息成功处理通常是 3 次操作；邮件、转码、爬取、通知适合，简单同步接口不要先上队列。 |
| [Durable Objects](/platform/durable-objects/) | Free/Paid 都可用；Free 只支持 SQLite-backed DO；100,000 requests/day、13,000 GB-s/day。 | Paid 1M requests/month included，超出 $0.15/million；400,000 GB-s/month included，超出 $12.50/million GB-s。 | 只放必须强一致的房间、会话、限流器；WebSocket 要用 hibernation。 |
| [Durable Objects SQLite storage](/platform/durable-objects/) | Free 读 5M rows/day、写 100k rows/day、5 GB total。 | Paid 读 25B rows/month included、写 50M rows/month included、SQL stored data 5 GB-month included，超出按量。 | 新 DO class 优先 SQLite-backed；不要拿 DO 承担全站分析库。 |
| Vectorize | Pricing 页列出 30M queried vector dimensions/month、5M stored vector dimensions。 | Paid 50M queried vector dimensions/month included，10M stored vector dimensions included，超出按 dimensions 计费。 | 文档少时先 Pagefind；语义搜索确定有价值后再上。 |
| Analytics Engine | 100k data points/day、10k read queries/day；官方说明当前价格信息用于预估。 | Paid 10M data points/month included，超出 $0.25/million；1M read queries/month included，超出 $1/million。 | 记录高基数事件和指标；不要替代事务数据库。 |
| Web Analytics | 免费、隐私优先；Free 计划 Rules limit 为 0，默认注入范围受规则能力限制。 | Pro/Business/Enterprise 提供更多 rules。 | 文档站和官网先开它，不急着做复杂埋点。 |
| Workers AI | Free 和 Paid 都有 10,000 Neurons/day 免费分配。 | 超过 10,000 Neurons/day 需要 Workers Paid，超出按 $0.011 / 1,000 Neurons。 | 先小模型、小上下文、短输出；所有模型调用先接 AI Gateway。 |
| AI Gateway | 所有计划可用；核心功能免费，包含 dashboard analytics、caching、rate limiting；Persistent logs Free 为 100,000 total logs across all gateways。 | Workers Paid persistent logs 为 10M logs/gateway；Logpush 仅 Workers Paid，10M requests/month included，超出 $0.05/million。 | 外部模型、Workers AI、日志、缓存、fallback 统一从网关进。 |
| Images | Free 可做外部图片 transformations，每月 5,000 unique transformations。 | Paid 前 5,000 transformations included，超出 $0.50/1,000；Images storage $5/100k images/month，delivery $1/100k images。 | 原图放 R2，需要裁剪、格式转换、响应式图再接 Images。 |
| Stream | 没有适合普通文档站的免费存储额度；ingress 和 encoding 免费。 | 存储 $5/1,000 minutes stored，播放 $1/1,000 minutes delivered。 | 视频产品用 Stream；普通文档不要把视频硬塞进静态站。 |
| Browser Run | 10 minutes/day browser hours，Browser Sessions 3 concurrent browsers。 | Workers Paid 10 hours/month included，超出 $0.09/hour；Browser Sessions 10 concurrent browsers averaged monthly included，超出 $2/browser。 | 能用 HTTP fetch 就不用浏览器；截图、PDF、动态页面抓取才用。 |

## 本站的成本模型

本站是一个“Cloudflare 最佳实践仓库”，它自己也应该足够省：

| 模块 | 当前选择 | 为什么 |
| --- | --- | --- |
| 文档页面 | Astro + Starlight + [Workers Static Assets](/platform/static-assets/) | 静态资产请求免费不限量，部署到 Worker 还能带 API。 |
| 站内搜索 | Pagefind | 构建期索引，用户搜索不打后端。 |
| 评论 | Twikoo + twikoo-cloudflare | 复用成熟评论组件，评论服务托管在 Cloudflare Workers，数据进入 D1。 |
| 主题 | Starlight Theme Next + Cloudflare 主题变量 | 复用成熟 Starlight 主题，用橙色主题变量保持品牌识别。 |
| 未来 AI 搜索 | AI Search 或 Vectorize | 等内容足够多后再为自然语言搜索付费。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 所有请求都先经过 Worker。 | 静态资产直接服务，只让 API 进 Worker。 |
| KV 可以当数据库。 | KV 用于读多写少的配置和缓存；关系数据用 D1。 |
| R2 免 egress 就完全免费。 | R2 无 egress bandwidth charge，但存储和操作会计费。 |
| AI 一开始就做向量搜索。 | 先把内容结构化，Pagefind 能解决大部分早期搜索。 |
| 一开始自建评论组件。 | 文档社区优先用成熟评论系统，减少自维护 UI 和安全边界。 |
| 免费额度不用看。 | 免费额度不是无限额度；公开项目要知道硬限制在哪里。 |
| 以为 Workers Paid 等于 Cloudflare Pro。 | Workers Paid 是开发者平台账户级订阅；Cloudflare Pro 是 zone/domain 计划，二者不是一回事。 |
| 只看请求数，不看 CPU。 | Workers Paid 同时按请求和 CPU 计费；计算密集任务要单独估算。 |
| 看到“静态资产免费”就把所有文件塞进站点。 | 大文件、媒体和用户上传进入 R2/Stream，静态站只放构建产物。 |

## 事实来源

- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers Builds Limits & Pricing](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)
- [Workers Static Assets Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [D1 Limits](https://developers.cloudflare.com/d1/platform/limits/)
- [KV Pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- [KV Limits](https://developers.cloudflare.com/kv/platform/limits/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [R2 Limits](https://developers.cloudflare.com/r2/platform/limits/)
- [Queues Pricing](https://developers.cloudflare.com/queues/platform/pricing/)
- [Queues Limits](https://developers.cloudflare.com/queues/platform/limits/)
- [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- [Vectorize Pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)
- [Analytics Engine Pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)
- [Images Pricing](https://developers.cloudflare.com/images/pricing/)
- [Stream Pricing](https://developers.cloudflare.com/stream/pricing/)
- [Browser Run Pricing](https://developers.cloudflare.com/browser-run/pricing/)
- [DNS FAQ](https://developers.cloudflare.com/dns/faq/)
- [DDoS Protection About](https://developers.cloudflare.com/ddos-protection/about/)
- [WAF Managed Rules](https://developers.cloudflare.com/waf/managed-rules/)
- [Turnstile Plans](https://developers.cloudflare.com/turnstile/plans/)
