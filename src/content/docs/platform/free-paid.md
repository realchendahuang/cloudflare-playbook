---
title: 免费与付费边界
description: Cloudflare 常用产品的免费额度、付费入口和成本控制建议。
---

最后核对日期：2026-06-17。Cloudflare 的额度和价格变化很快，本页用于建立判断框架，最终以官方 pricing / limits 页面为准。账单类型、预算提醒、发票和 usage-based billing 见 [Billing](/platform/billing/)。

## 一句话判断

Cloudflare 最适合普通人的地方，不是“永远不要花钱”，而是：

1. 免费阶段能把项目跑起来。
2. 第一次付费通常是明确为请求、CPU、存储、构建、日志、安全或 AI 用量买单。
3. 静态资产请求、R2 egress、D1 数据访问 egress 等关键链路有很友好的边界。
4. 最容易浪费钱的地方，是把静态访问、搜索、图片、视频、后台任务都错误地打到动态计算里。

## 先看 $5 Workers Paid

Workers Paid 是很多 Cloudflare 开发者项目的第一笔固定支出，官方价格页写的是每个账户每月最低 **$5 USD**。它不是 Cloudflare Pro，也不是 Pages Pro；它主要扩展 Workers、Pages Functions、KV、Hyperdrive、Durable Objects 等开发者平台能力。

这节的口径要看清楚：

- Workers Paid 是账号级订阅，included usage 按月计算。
- Pages Functions 按 Workers 计费，额度和 Workers 放在同一套口径里。
- Workers 平台不额外收 data transfer / throughput 费用。
- Workers Static Assets 的静态资产请求免费且不限量，只有进入 Worker 脚本的动态请求才按 Workers 计费。

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
| Workers Trace Events Logpush | 不可用。 | 10M requests/month included，超出 $0.05/million。 |
| Analytics Engine | 100,000 data points/day、10,000 read queries/day。 | 10M data points/month included，超出 $0.25/million；1M read queries/month included，超出 $1/million。 |
| Workers Builds | 3,000 build minutes/month，1 concurrent build。 | 6,000 build minutes/month，超出 $0.005/min，6 concurrent builds。 |
| [Containers](/platform/extended-compute-data/) | 不可用。 | 包含 25 GiB-hours/month、375 vCPU-minutes/month、200 GB-hours/month，超出按量。 |

## 免费额度速查

| 产品 | 免费额度 / 免费边界 | 付费入口 | 成本控制建议 |
| --- | --- | --- | --- |
| [DNS](/platform/dns/) | Free/Pro/Business 不对 DNS queries 收费，且不限制 DNS queries；新 Free zone 为 200 records/zone，旧 Free zone 为 1,000。 | Enterprise 把 monthly DNS queries 作为报价输入之一；record limit 可申请提高。 | 域名统一接入 Cloudflare，Web 入口代理，邮件和验证记录保持 DNS-only。 |
| [Cache / CDN](/platform/cache/) | Cache / CDN 可用于所有计划；Free 有 10 条 Cache Rules，Edge Cache TTL 最小 2 小时，最大可缓存文件 512 MB，Purge by URL 800 URLs/s。 | Pro/Business/Enterprise 提升规则数量、Edge TTL 最小值、purge 限制和企业拓扑；Cache Reserve 为 usage-based add-on，Storage $0.015/GB-month、Class A $4.50/million、Class B $0.36/million。 | 静态 hash 资源长缓存；HTML 谨慎缓存；用户态 bypass；大文件和媒体用 R2/Images/Stream。 |
| [SSL/TLS](/platform/ssl-tls/) | Universal SSL、Origin CA、Always Use HTTPS、Automatic HTTPS Rewrites、HSTS、TLS 1.3、Minimum TLS Version、Authenticated Origin Pulls 都可在 Free 使用。 | Advanced Certificate Manager 是付费 add-on；Custom Certificates 从 Business 起；Keyless SSL 是 Enterprise paid add-on；Strict (SSL-Only Origin Pull) 是 Enterprise-only。 | 普通项目默认 Full (strict)，Universal SSL 负责边缘，Origin CA 或公开 CA 负责源站。 |
| [DDoS Protection](/platform/ddos/) | 官方说明所有计划都有 standard, unmetered DDoS protection；HTTP DDoS 和 Network-layer DDoS 都覆盖所有计划。Free / Pro / Business 只有 1 个 override，不能自定义 expression。 | Enterprise 可用 Log action；Enterprise + Advanced DDoS 可到 10 个 overrides / rules，并支持 custom expressions、完整 Adaptive DDoS 和高级告警过滤。 | 普通项目先把 Web 记录设为 Proxied，隐藏源站 IP；写接口再结合 WAF、Rate Limiting 和 Turnstile。 |
| [Rules](/platform/rules/) | Rules 入口所有计划可用；Free 常见现代规则多为 10 条，Bulk Redirect Rules 15 条、Bulk Redirect Lists 5 个、URL redirects across lists 10,000 条；Snippets 和 Custom Errors 不在 Free。 | Pro/Business/Enterprise 多数现代规则为 25/50/300；Bulk Redirect URL 25,000/50,000/1,000,000；Snippets 和 Custom Errors 从 paid plans 起。 | 新配置优先现代 Rules，不再新写 Page Rules；上线前用 Trace 验证规则顺序。 |
| [WAF](/platform/waf/) | WAF available on all plans；Free 有 5 条 Custom Rules、1 条 Rate Limiting Rule、Free Managed Ruleset、1 个 Custom List / 10,000 items、sampled Security Events。 | Pro/Business/Enterprise 提升 Custom Rules、Rate Limiting、Managed Rules、Attack Score、Security Events 和高级检测能力；Workers Paid 不提升 WAF 配额。 | 登录、后台、API、评论和上传先加最小规则；先观察 Security Events，再逐步 block。 |
| Turnstile | Free 计划最多 20 个 widgets，每个 widget 10 个 hostnames；挑战和验证请求不限量；analytics 最多 7 天；可独立使用，不要求其他 Cloudflare 服务。 | Enterprise widgets 不限量，每个 widget 最多 200 个 hostnames，analytics 最多 30 天，并支持 Ephemeral IDs、Offlabel 和更高组织要求。 | 只放前端组件不够，必须服务端调用 Siteverify；token 5 分钟有效且单次使用。 |
| Bots | Free customers 可用 Bot Fight Mode，面向简单 bot、云主机来源和 headless browsers；也包含 Block AI bots、AI Labyrinth、robots.txt 相关能力。 | Pro / Business 可用 Super Bot Fight Mode；Enterprise Bot Management 才有 bot score、JA3/JA4、bot tags、detection IDs、路径级控制等高级能力。 | 先用 WAF、Rate Limiting 和 Turnstile；只有 bot 成本明确时再升级。 |
| API Shield | Free 可用 Endpoint Management 和 Schema validation：100 saved endpoints、5 uploaded schemas、200 kB schema size，rule action 为 Block only。 | Pro 为 250 endpoints / 5 schemas / 500 kB；Business 为 500 / 10 / 2 MB；Enterprise without API Shield 为 500 / 10 / 5 MB 且支持 Log or Block；完整 API Shield 需要 Enterprise 订阅。 | 公开 API、移动端 API、客户数据 API 才优先上；早期先写 schema、认证、限流和日志。 |
| Security Center / Security Insights | Security Insights 默认自动扫描所有账户和 zone；Free 每 7 天扫描一次，On-demand 表格标注为 Yes。 | Pro / Business 每 3 天，Enterprise 每天；官方同时提示 Business、Enterprise 或 Teams eligible accounts 可手动启动扫描。 | 把它当每周安全巡检，优先处理 DNS-only 暴露、SSL/TLS 弱配置、WAF 和 Access 缺口。 |
| [Zero Trust 与企业网络](/platform/zero-trust-networking/) | Zero Trust Free 为 $0 forever，50 user limit，标准日志最长 24 小时；Tunnel 发布 public hostname 不需要 paid Access plan；Cloudflare One setup 选择 Free plan 仍需 payment details，但不会收费。 | Pay-as-you-go 为 $7/user/month，paid annually，No user limit，标准日志最长 30 天；Contract 为 custom price，标准日志最长 6 个月并可 Logpush 到 SIEM / cloud storage。Cloudflare WAN 是 Enterprise-only。 | 50 人以内团队先用 Free 的 Access / Tunnel / Gateway；后台和内网工具不要裸露公网。没有 Access policy 的 Tunnel published application 仍然公开可访问。 |
| Cloudflare Tunnel / Access account limits | Access account limits 包含 500 applications、50 service tokens、50 identity providers、每个 application 1,000 rules、每个 application 5 domains；Tunnel 每账号 1,000 tunnels、1,000 routes、每 tunnel 25 active replicas。 | Access policies 需要 Access seats；团队身份、设备 posture、Gateway、DLP、长期日志和企业策略按 Zero Trust 计划评估。 | 普通项目要少建宽泛策略，多建清晰命名的后台、预览和运维入口策略。 |
| Secrets Store | Open beta，账号级密钥中心，兼容 Workers 和 AI Gateway；不同于 per-Worker Variables and Secrets；Cloudflare China Network 不可用。 | 官方当前页面未给出通用按量价格；多团队、多 Worker、多环境和 AI Gateway 自带 key 时再按 beta 状态核对。 | 单 Worker 先用 `wrangler secret`；多项目共享密钥再用 Secrets Store + binding。 |
| [Pages 静态站](/platform/pages/) | 静态资产请求免费且不限量；Free 计划 500 builds/month、1 concurrent build、100 custom domains/project、20,000 files/site、25 MiB/file。 | Pro/Business 提升构建次数、并发构建和文件数；Paid 文件数可到 100,000，Pages Functions 按 Workers 计费。 | 纯静态站和 PR 预览可用 Pages；新 full-stack 项目优先 Workers Static Assets。 |
| [Workers Static Assets](/platform/static-assets/) | 静态资产请求免费且不限量，资产存储无额外费用；20,000 files/Worker version、25 MiB/file。 | 静态资产请求仍免费；Paid 为 100,000 files/Worker version、25 MiB/file；只有请求进入 Worker 脚本时才按 Workers 计费。 | 文档站、官网、SPA 默认走静态资产；API 单独走 Worker。 |
| Workers | 100,000 requests/day；10 ms CPU/invocation。 | Workers Paid 每月最低 $5，见上一节。 | 静态请求不要消耗 Worker；给 CPU 设置上限，避免 runaway bills。 |
| D1 | 5M rows read/day、100k rows written/day、5 GB total storage；Free 单库最大 500 MB，10 个数据库/account。 | Paid 每月 25B rows read、50M rows written、5 GB included，超出按量；Paid 单库最大 10 GB、总存储 1 TB。 | 常查字段建索引；评论、配置、小型 SaaS 很适合，高频计数和大分析不适合。 |
| [KV](/platform/kv/) | 100k reads/day、1k writes/day、1k deletes/day、1k lists/day、1 GB storage。 | Paid 每月 10M reads、1M writes/deletes/lists、1 GB storage included，超出按量。 | 读多写少、最终一致的配置和缓存才用 KV；同一个 key 仍然只有 1 次/秒写入。 |
| [R2](/platform/r2/) | Standard storage 10 GB-month/month、Class A 1M/month、Class B 10M/month；egress 免费；Infrequent Access 不包含免费额度。 | Standard storage $0.015/GB-month，Class A $4.50/million，Class B $0.36/million；Infrequent Access 为 $0.01/GB-month、Class A $9.00/million、Class B $0.90/million、data retrieval $0.01/GB。 | 大文件走 R2，不走 Git、Pages bundle 或 D1；下载次数也是 Class B，冷数据再考虑 IA。 |
| [扩展计算与数据管道](/platform/extended-compute-data/) | Hyperdrive 100,000 database queries/day；Workflows Free 与 Workers 共享 100,000 requests/day、10 ms CPU/invocation、1 GB storage；Pipelines pricing 页列出 Free included usage；R2 Data Catalog public beta 当前除 R2 storage / operations 外不额外计费。 | Hyperdrive Paid unlimited；Workflows Paid 10M requests/month、30M CPU ms/month、1 GB storage included；Pipelines Paid transforms 50 GB/month、sinks 50 GB/month；Containers 仅 Workers Paid，包含 25 GiB-hours/month、375 vCPU-minutes/month、200 GB-hours/month。 | 有外部数据库、长流程、事件数据湖、容器运行时补位时再上；新项目先用 D1、R2、Queues、Workers。 |
| Hyperdrive account limits | Free 最多 10 个 configured databases、origin connections 约 20/config；Paid 最多 25 个 configured databases、origin connections 约 100/config；query duration 60 seconds，cached query response size 50 MB。 | limit increase 需要按官方表单或支持渠道申请。 | 查询缓存命中也计入 query；长事务和慢查询仍会压垮源数据库。 |
| [Queues](/platform/queues/) | 10,000 operations/day included；消息保留 24 小时。 | Paid 1M operations/month included，超出 $0.40/million；保留期默认 4 天，可配到 14 天。 | 小消息成功处理通常是 3 次操作；邮件、转码、爬取、通知适合，简单同步接口不要先上队列。 |
| [Durable Objects](/platform/durable-objects/) | Free/Paid 都可用；Free 只支持 SQLite-backed DO；100,000 requests/day、13,000 GB-s/day。 | Paid 1M requests/month included，超出 $0.15/million；400,000 GB-s/month included，超出 $12.50/million GB-s。 | 只放必须强一致的房间、会话、限流器；WebSocket 要用 hibernation。 |
| [Durable Objects SQLite storage](/platform/durable-objects/) | Free 读 5M rows/day、写 100k rows/day、5 GB total。 | Paid 读 25B rows/month included、写 50M rows/month included、SQL stored data 5 GB-month included，超出按量。 | 新 DO class 优先 SQLite-backed；不要拿 DO 承担全站分析库。 |
| [Realtime](/platform/realtime/) | RealtimeKit 当前 Beta 免费；Realtime SFU / TURN 共用 1,000 GB/month 免费出站额度；客户端到 Cloudflare 免费，STUN 免费且不限量。 | RealtimeKit GA 后按参与者分钟和导出分钟计费；Realtime SFU / TURN 超出后 `$0.05/GB` egress。 | 文本实时先 Durable Objects；音视频会议优先 RealtimeKit；自定义 WebRTC 才看 SFU。 |
| [平台化与多租户](/platform/platforms-saas/) | Cloudflare for SaaS 在 Free/Pro/Business 包含 100 custom hostnames，最高 50,000；Dynamic Workers 仅 Workers Paid 可用。 | Cloudflare for SaaS 额外 hostname `$0.10`；Workers for Platforms `$25/month` 起；Dynamic Workers 超出 unique worker、请求和 CPU 后按量。 | 先确认是真“客户域名”或“用户代码运行”，不要把普通多租户 SaaS 提前升级成平台产品。 |
| Vectorize | Pricing 页列出 30M queried vector dimensions/month、5M stored vector dimensions。 | Paid 50M queried vector dimensions/month included，10M stored vector dimensions included，超出按 dimensions 计费。 | 文档少时先 Pagefind；语义搜索确定有价值后再上。 |
| Analytics Engine | 100k data points/day、10k read queries/day；官方说明当前价格信息用于预估。 | Paid 10M data points/month included，超出 $0.25/million；1M read queries/month included，超出 $1/million。 | 记录高基数事件和指标；不要替代事务数据库。 |
| GraphQL Analytics API | 默认用户限制为 5 分钟 300 个 GraphQL queries；zone-scoped query 最多 10 个 zones，account-scoped query 只能 1 个 account。 | 节点级可用字段、历史范围和数据集跟随具体 zone / account 计划。 | 自动报表可以用它；不要用 GraphQL Analytics API 复算账单。 |
| Web Analytics | 免费、隐私优先；available on all plans；非代理站点 10 个，代理站点不限；Free 计划 Rules limit 为 0。 | Pro/Business/Enterprise 的 Web Analytics rules 分别为 5/20/100。 | 文档站和官网先开它，不急着做复杂埋点。 |
| Workers Logs / Real-time logs | Workers Logs 200k log events/day，保留 3 天；Real-time logs 可用 dashboard 或 `wrangler tail`。 | Workers Paid 20M log events/month included，超出 $0.60/million，保留 7 天。 | 生产日志要结构化并采样，不记录 token、cookie、密钥和正文隐私。 |
| Workers Trace Events Logpush | Free 不可用。 | Workers Paid 10M requests/month included，超出 $0.05/million。 | 只把需要长期保存的 Worker trace event 推到目的地，并用过滤/采样控制量。 |
| Cloudflare Logpush | 常规 Logpush 在 Free/Pro/Business 不可用；每个 zone 最多 4 个 Logpush jobs。 | Enterprise；非 Enterprise 只有 Workers Trace Events Logpush 可随 Workers Paid 使用。 | Logpush 不能回填历史，job 失败期间日志会丢；必须配置健康告警。 |
| Log Explorer | 当前没有免费版本或试用。 | 作为 Application Services 或 Zero Trust 购买的付费 add-on，按 ingest 和 stored GB 计费；查询不额外计费。 | 需要历史取证和 Cloudflare 内部日志搜索时再买；合同客户可选最长 2 年留存，额外 $0.10/GB/month。 |
| Notifications | Available on all plans；Free 可配置 email-based notifications。 | Professional+ 支持 webhooks；Business+ 支持 PagerDuty。 | 只对 Proxied 域名工作；Budget alerts 和 usage alerts 是提醒，不是自动熔断。 |
| Workers AI | Free 和 Paid 都有 10,000 Neurons/day 免费分配。 | 超过 10,000 Neurons/day 需要 Workers Paid，超出按 $0.011 / 1,000 Neurons。 | 先小模型、小上下文、短输出；所有模型调用先接 AI Gateway。 |
| AI Gateway | 所有计划可用；核心功能免费，包含 dashboard analytics、caching、rate limiting；Persistent logs Free 为 100,000 total logs across all gateways。 | Workers Paid persistent logs 为 10M logs/gateway；Logpush 仅 Workers Paid，10M requests/month included，超出 $0.05/million。 | 外部模型、Workers AI、日志、缓存、fallback 统一从网关进。 |
| [AI Search](/platform/ai/) | Available on all plans；2026-04-16 后新实例 open beta 内免费，Free 有 100 instances/account、100,000 files/instance、20,000 queries/month、500 crawled pages/day。 | Paid 有 5,000 instances/account、1M files/instance 或 hybrid search 500K、unlimited queries、unlimited crawled pages/day。 | 文档站先 Pagefind；需要自然语言搜索、MCP endpoint 或 Agent 检索时再上。Workers AI 和 AI Gateway usage 单独计费。 |
| [媒体与性能](/platform/media-performance/) | Images Free 每月 5,000 unique transformations；Speed available on all plans；Zaraz 每账号每月 1,000,000 free events；Browser Run Free 有 10 minutes/day。 | Images Paid、Stream、Zaraz Paid、Browser Run Paid 都要按实际媒体和浏览器用量估算。 | 大图、附件、视频不要塞进静态包；媒体产品最容易低估操作、播放和转换成本。 |
| Images | Free 可做外部图片 transformations，每月 5,000 unique transformations；超出后新 transformation 返回 `9422`，不会直接收费。 | Paid 前 5,000 transformations included，超出 $0.50/1,000；Images storage $5/100k images/month，delivery $1/100k images。 | 原图放 R2，需要裁剪、格式转换、响应式图再接 Images。 |
| Stream | 没有适合普通文档站的免费存储额度；ingress 和 encoding 免费。 | 存储 $5/1,000 minutes stored，播放 $1/1,000 minutes delivered；Media Transformations 5,000 free operations/month 后 $0.50/1,000。 | 视频产品用 Stream；普通文档不要把视频硬塞进静态站。 |
| Browser Run | 10 minutes/day browser hours；Browser Sessions 3 concurrent browsers；Quick Actions 1 request/10s；`/crawl` Free 限制 5 jobs/day、100 pages/crawl。 | Workers Paid 10 hours/month included，超出 $0.09/hour；Browser Sessions 10 concurrent browsers averaged monthly included，超出 $2/browser；limits 页默认 120 concurrent browsers/account。 | 能用 HTTP fetch 就不用浏览器；截图、PDF、动态页面抓取才用，并且必须关闭 session。 |
| Zaraz | 所有 Cloudflare 用户可用；每个 account 每月 1,000,000 free Zaraz Events；所有 features and tools 可用于所有账号。 | 每额外 1,000,000 Zaraz Events 为 $5/month；未启用 paid 且超过免费额度时，Zaraz 会停用到下个 billing cycle。 | 第三方脚本变多、需要 consent 或 selective loading 时再上；先减少脚本数量。 |

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
| 以为预算提醒会自动封顶。 | Budget alerts 只发邮件，不暂停服务，也不停止按量计费产品。 |
| 只看 Billable Usage dashboard 就等于看完整账单。 | Billable Usage dashboard 主要看 usage-based overage，不包含固定 plan / subscription 费用。 |
| 以为日志越多越安全。 | 日志要能定位问题，也要控制采样、留存和敏感字段；长期取证再上 Log Explorer / Logpush。 |

## 事实来源

- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers Builds Limits & Pricing](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)
- [Workers Static Assets Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Cloudflare Billing Docs](https://developers.cloudflare.com/billing/)
- [How Cloudflare billing works](https://developers.cloudflare.com/billing/understand/how-billing-works/)
- [Usage-based billing](https://developers.cloudflare.com/billing/understand/usage-based-billing/)
- [Monitor billable usage](https://developers.cloudflare.com/billing/manage/billable-usage/)
- [Budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/)
- [Threshold billing](https://developers.cloudflare.com/billing/threshold-billing/)
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
- [Hyperdrive Pricing](https://developers.cloudflare.com/hyperdrive/platform/pricing/)
- [Hyperdrive Limits](https://developers.cloudflare.com/hyperdrive/platform/limits/)
- [Workflows Pricing](https://developers.cloudflare.com/workflows/reference/pricing/)
- [Workflows Limits](https://developers.cloudflare.com/workflows/reference/limits/)
- [Pipelines Pricing](https://developers.cloudflare.com/pipelines/platform/pricing/)
- [Pipelines Limits](https://developers.cloudflare.com/pipelines/platform/limits/)
- [R2 Data Catalog](https://developers.cloudflare.com/r2/data-catalog/)
- [Containers Pricing](https://developers.cloudflare.com/containers/pricing/)
- [Containers Limits and Instance Types](https://developers.cloudflare.com/containers/platform-details/limits/)
- [Cloudflare Realtime](https://developers.cloudflare.com/realtime/)
- [RealtimeKit Pricing](https://developers.cloudflare.com/realtime/realtimekit/pricing/)
- [Realtime SFU Pricing](https://developers.cloudflare.com/realtime/sfu/pricing/)
- [Realtime SFU Limits](https://developers.cloudflare.com/realtime/sfu/limits/)
- [TURN Service](https://developers.cloudflare.com/realtime/turn/)
- [TURN FAQ](https://developers.cloudflare.com/realtime/turn/faq/)
- [Cloudflare for Platforms](https://developers.cloudflare.com/cloudflare-for-platforms/)
- [Workers for Platforms Pricing](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/pricing/)
- [Workers for Platforms Limits](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/limits/)
- [Cloudflare for SaaS Plans](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/)
- [Dynamic Workers Pricing](https://developers.cloudflare.com/dynamic-workers/pricing/)
- [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- [AI Gateway Limits](https://developers.cloudflare.com/ai-gateway/reference/limits/)
- [AI Search Limits & pricing](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)
- [Vectorize Pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)
- [Vectorize Limits](https://developers.cloudflare.com/vectorize/platform/limits/)
- [Analytics Engine Pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)
- [Analytics Engine Limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/)
- [GraphQL Analytics API Limits](https://developers.cloudflare.com/analytics/graphql-api/limits/)
- [Web Analytics Limits](https://developers.cloudflare.com/web-analytics/limits/)
- [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
- [Workers Real-time logs](https://developers.cloudflare.com/workers/observability/logs/real-time-logs/)
- [Workers Logpush](https://developers.cloudflare.com/workers/observability/logs/logpush/)
- [Cloudflare Logpush](https://developers.cloudflare.com/logs/logpush/)
- [Log Explorer Pricing](https://developers.cloudflare.com/log-explorer/pricing/)
- [Notifications](https://developers.cloudflare.com/notifications/)
- [Images Pricing](https://developers.cloudflare.com/images/pricing/)
- [Images Limits and formats](https://developers.cloudflare.com/images/get-started/limits/)
- [Stream Pricing](https://developers.cloudflare.com/stream/pricing/)
- [Stream FAQ](https://developers.cloudflare.com/stream/faq/)
- [Zaraz Pricing](https://developers.cloudflare.com/zaraz/pricing-info/)
- [Browser Run Pricing](https://developers.cloudflare.com/browser-run/pricing/)
- [Browser Run Limits](https://developers.cloudflare.com/browser-run/limits/)
- [DNS FAQ](https://developers.cloudflare.com/dns/faq/)
- [DDoS Protection About](https://developers.cloudflare.com/ddos-protection/about/)
- [HTTP DDoS Attack Protection](https://developers.cloudflare.com/ddos-protection/managed-rulesets/http/)
- [Network-layer DDoS Attack Protection](https://developers.cloudflare.com/ddos-protection/managed-rulesets/network/)
- [Cloudflare Rules](https://developers.cloudflare.com/rules/)
- [Redirects](https://developers.cloudflare.com/rules/url-forwarding/)
- [Transform Rules](https://developers.cloudflare.com/rules/transform/)
- [Configuration Rules](https://developers.cloudflare.com/rules/configuration-rules/)
- [Origin Rules](https://developers.cloudflare.com/rules/origin-rules/)
- [Cloudflare Snippets](https://developers.cloudflare.com/rules/snippets/)
- [Custom Errors](https://developers.cloudflare.com/rules/custom-errors/)
- [Trace a request](https://developers.cloudflare.com/rules/trace-request/)
- [WAF Managed Rules](https://developers.cloudflare.com/waf/managed-rules/)
- [Turnstile Plans](https://developers.cloudflare.com/turnstile/plans/)
- [Turnstile Server-side Validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [API Shield Plans](https://developers.cloudflare.com/api-shield/plans/)
- [Bot solutions Free plan](https://developers.cloudflare.com/bots/plans/free/)
- [Bot solutions Pro plan](https://developers.cloudflare.com/bots/plans/pro/)
- [Bot solutions Business and Enterprise plans](https://developers.cloudflare.com/bots/plans/biz-and-ent/)
- [Bot Management for Enterprise](https://developers.cloudflare.com/bots/plans/bm-subscription/)
- [Security Insights how it works](https://developers.cloudflare.com/security/security-insights/how-it-works/)
- [Zero Trust & SASE Plans & Pricing](https://www.cloudflare.com/plans/zero-trust-services/)
- [Cloudflare Access product and pricing](https://www.cloudflare.com/sase/products/access/)
- [Cloudflare One](https://developers.cloudflare.com/cloudflare-one/)
- [Cloudflare One setup](https://developers.cloudflare.com/cloudflare-one/setup/)
- [Cloudflare One account limits](https://developers.cloudflare.com/cloudflare-one/account-limits/)
- [Access policies](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/)
- [Gateway traffic policies](https://developers.cloudflare.com/cloudflare-one/traffic-policies/)
- [Published applications with Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/)
- [Private networks with Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/private-net/)
- [Publish a self-hosted application to the Internet](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/)
- [Cloudflare WAN](https://developers.cloudflare.com/cloudflare-wan/)
- [Cloudflare Network Firewall plans](https://developers.cloudflare.com/cloudflare-network-firewall/plans/)
- [Secrets Store](https://developers.cloudflare.com/secrets-store/)
- [Secrets Store Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)
