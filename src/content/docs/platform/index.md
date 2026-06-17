---
title: Cloudflare 产品大图谱
description: 面向独立开发者和小团队的 Cloudflare 产品地图、免费额度、付费入口和最佳实践。
---

最后核对日期：2026-06-17。

Cloudflare 把 Account、Zone、DNS、CDN、DDoS、Workers、D1、R2、AI Gateway、Turnstile 等能力放在同一个平台里。对独立开发者和小团队来说，这些产品能把早期项目的基础设施成本和维护成本压到很低。

但它不是魔法。真正的关键是知道每个产品解决什么问题、免费边界在哪里、什么时候该付费、什么时候别乱上。

## 总体心法

```text
访问入口
  ├─ Fundamentals
  │    ├─ Account / Zone / Members / API Token
  │    └─ Proxied / DNS-only / Origin
  │
  ├─ DNS / CDN / SSL / DDoS / WAF
  │    ├─ DNS / SSL / Cache / Rules
  │    └─ Load Balancing / Health Checks / Spectrum / Argo
  │
  ├─ 静态内容
  │    ├─ Pages
  │    └─ Workers Static Assets
  │
  ├─ 动态计算
  │    ├─ Workers
  │    ├─ Durable Objects
  │    ├─ Queues
  │    ├─ Workflows / Containers
  │    └─ Realtime / WebSocket
  │
  ├─ 平台化
  │    ├─ Cloudflare for SaaS / Custom Hostnames
  │    ├─ Workers for Platforms
  │    └─ Dynamic Workers
  │
  ├─ 数据存储
  │    ├─ D1 / KV / R2
  │    ├─ Vectorize / Hyperdrive
  │    └─ Analytics Engine / Pipelines / R2 Data Catalog
  │
  ├─ AI 能力
  │    ├─ Workers AI / AI Gateway
  │    ├─ AI Search / Vectorize
  │    └─ Agents SDK
  │
  ├─ 媒体与性能
  │    ├─ Images / Stream / Speed
  │    ├─ Zaraz / Browser Run
  │    └─ R2 / Cache / Web Analytics
  │
  ├─ 治理与迁移
  │    ├─ Terraform / Pulumi / Wrangler
  │    ├─ cf-terraforming / R2 backend
  │    └─ Reference Architecture / Migration Guides
  │
  └─ 观测与安全
       ├─ Web Analytics / Logs / GraphQL Analytics / Notifications
       ├─ Turnstile / WAF / Bot / API Shield
       └─ Zero Trust / Access / Tunnel / Gateway / Cloudflare WAN / Magic Transit
```

先从免费能力起步，等产品真的被用户使用，再为明确的瓶颈付费。不要为了“架构漂亮”提前买复杂度。

## 计算与部署

| 产品 | 免费边界 | 付费入口 | 作用 | 最佳实践 |
| --- | --- | --- | --- | --- |
| Workers | Free 计划 100,000 次请求/天，每次 10 ms CPU。 | Workers Paid/Standard 每月最低 $5，包含更高请求和 CPU 额度，超出按量计费。 | 写边缘 API、Webhook、代理、鉴权、轻量后端。 | 静态资产不要都打进 Worker；只让 `/api/*` 触发 Worker。CPU 留给业务逻辑，等待外部 I/O 不要做无意义轮询。 |
| [Workers Static Assets](/platform/static-assets/) | 静态资产请求免费且不限量，资产存储无额外费用；Free/Paid 单文件都是 25 MiB，文件数分别为 20,000 / 100,000。 | 只有请求进入 Worker 脚本时才按 Workers 计费。 | 把静态站和 Worker 项目放在同一套部署配置里。 | 文档站和前端应用优先用它；只让 `/api/*` 等动态路径触发 Worker。 |
| [Pages](/platform/pages/) | 静态资产请求免费且不限量；Free 计划 500 builds/month、1 concurrent build、100 custom domains/project、20,000 files/site、25 MiB/file。 | Pro/Business 增加并发构建、构建次数和文件数；Paid 文件数可到 100,000。 | Git 驱动的静态站和前端部署。 | 纯静态站和 PR 预览很好用；一旦 API、D1、R2、AI 组合变多，优先迁到 Workers Static Assets。 |
| Pages Functions | 请求计入 Workers 额度；Free 与 Workers 共享 100,000 requests/day。 | 随 Workers Paid / Standard 扩容。 | 给 Pages 项目加轻量 API。 | 适合已有 Pages 项目渐进加 API；加 Functions 后要用 `_routes.json` 排除静态资产。 |
| [Durable Objects](/platform/durable-objects/) | Free 只支持 SQLite-backed DO；100,000 requests/day、13,000 GB-s/day，SQLite storage 读 5M rows/day、写 100k rows/day、5 GB total。 | Workers Paid 每月包含 1M requests、400,000 GB-s、25B rows read、50M rows written、5 GB-month SQL stored data，超出按量。 | 单对象强一致状态、房间、限流器、协作会话、WebSocket。 | 只把“必须强一致”的状态放进去；WebSocket 用 hibernation；不要拿它当全局大数据库。 |
| [Queues](/platform/queues/) | Free 计划 10,000 operations/day；消息保留 24 小时。 | Paid 每月包含 1,000,000 operations，超出 $0.40/million；保留期默认 4 天，可配到 14 天。 | 异步任务、削峰、后台处理、跨 Worker 消息。 | 小消息成功处理通常是 write、read、delete 3 次操作；需要幂等和 DLQ。 |
| [Realtime](/platform/realtime/) | RealtimeKit 当前 Beta 免费；Realtime SFU / TURN 共用 1,000 GB/month 免费出站额度。 | RealtimeKit GA 后按参与者分钟和导出分钟计费；SFU / TURN 超出后 `$0.05/GB` egress。 | 音视频、WebRTC、TURN relay；文本实时仍优先 Durable Objects。 | 会议/课堂优先 RealtimeKit；自定义 WebRTC 才看 SFU；只做 NAT 穿透才用 TURN。 |
| [扩展计算与数据管道](/platform/extended-compute-data/) | Hyperdrive Free 100,000 database queries/day；Workflows Free 与 Workers request / CPU 共享；Pipelines pricing 页列出 Free included usage；Containers 仅 Workers Paid。 | Hyperdrive Paid unlimited；Workflows 按 Workers 请求、CPU 和 storage；Pipelines 按 transforms / sinks；Containers 按 memory、vCPU、disk、egress、Workers、DO 和 logs。 | 已有外部数据库、长流程、事件数据湖、容器运行时补位。 | 新项目先用 Workers / D1 / R2 / Queues；需求长出来后再上 Hyperdrive / Workflows / Pipelines / Containers。 |
| Cron Triggers | 随 Workers 使用。 | 主要受 Workers 计划和调用成本影响。 | 定时任务。 | 适合定时清理、同步、刷新索引；每次任务要可重入。 |
| [平台化与多租户](/platform/platforms-saas/) | Cloudflare for SaaS 在 Free/Pro/Business 包含 100 custom hostnames；Workers for Platforms 为 `$25/month` 起；Dynamic Workers 需要 Workers Paid。 | custom hostnames、WFP scripts、Dynamic Workers created daily、请求和 CPU 都可能计费。 | 客户自定义域名、用户代码运行、AI 生成应用、低代码/插件平台。 | 普通 SaaS 先用 tenant_id + D1/R2/KV；客户要自定义域名再用 Cloudflare for SaaS；客户代码运行再用 WFP。 |
| Containers | 见 [扩展计算与数据管道](/platform/extended-compute-data/)。 | Workers Paid 里包含一定 memory、vCPU 和 disk 用量，超出按量。 | 跑不能轻易改成 Worker 的服务。 | 先问能不能 Worker 化；容器是补位，不是默认选项。 |

## 数据与存储

| 产品 | 免费边界 | 付费入口 | 作用 | 最佳实践 |
| --- | --- | --- | --- | --- |
| [D1](/platform/d1/) | Free 计划读 5,000,000 rows/day、写 100,000 rows/day、总存储 5 GB。 | Paid 每月前 25B rows read、50M rows written 和 5 GB 包含，超出按量。 | Serverless SQL，适合评论、文章元数据、配置后台、小型 SaaS。 | 常查字段建索引；不要把高频计数和超大分析表硬塞进去。 |
| [KV](/platform/kv/) | Free 计划读 100,000/day、写 1,000/day、删 1,000/day、列 1,000/day、存储 1 GB。 | Paid 每月包含 10M reads、1M writes/deletes/lists 和 1 GB 存储，超出按 key/容量计费。 | 全局 key-value，适合配置、缓存、低频更新索引。 | 读多写少才舒服；同一个 key 仍然只有 1 次/秒写入，不要依赖强一致。 |
| [R2](/platform/r2/) | Standard storage 10 GB-month/month、Class A 1M/month、Class B 10M/month；无 egress bandwidth charge。 | Standard storage $0.015/GB-month，Class A $4.50/million，Class B $0.36/million；Infrequent Access 不包含免费额度。 | S3 兼容对象存储，放图片、附件、备份、导出文件。 | 大文件和媒体不要塞进 Git 或 Pages bundle；公开下载注意 Class B 次数。 |
| Hyperdrive | 见 [扩展计算与数据管道](/platform/extended-compute-data/)；Free 为 100,000 database queries/day。 | Workers Paid 为 unlimited。 | 给外部 Postgres/MySQL 做连接池和加速。 | 已有数据库时用它；新小项目优先 D1，少维护一套外部 DB。 |
| Vectorize | 30M queried vector dimensions/month、5M stored vector dimensions。 | Paid 包含 50M queried vector dimensions/month、10M stored vector dimensions，超出按 dimensions 计费。 | 向量数据库，做 RAG、语义搜索、相似推荐。 | 文档站早期先 Pagefind；需要自定义召回、metadata、namespace 和 rerank 时再上。 |
| Analytics Engine | Free 计划 100,000 data points/day、10,000 read queries/day；官方说明当前价格信息用于预估。 | Paid 每月包含更高写入和查询额度，之后按量。 | 高基数事件、指标和自定义分析。 | 用来记录产品事件、Worker 业务指标；不要替代事务数据库。 |
| Secrets Store | Open beta，账号级密钥中心，兼容 Workers 和 AI Gateway。 | 多 Worker、多环境、多团队共享密钥时评估。 | 管理 API key、数据库密码、第三方 token。 | 单 Worker 先用 `wrangler secret`；多项目共享再用 Secrets Store + binding。 |

## AI 与搜索

| 产品 | 免费边界 | 付费入口 | 作用 | 最佳实践 |
| --- | --- | --- | --- | --- |
| Pagefind | 不是 Cloudflare 产品；构建期生成索引，运行时不消耗 Worker API。 | 无额外后端成本。 | 普通文档站关键词搜索。 | 本站当前默认使用 Pagefind，因为开源文档最划算。 |
| [AI Search](/platform/ai/) | Available on all plans；2026-04-16 后新实例 open beta 内免费，Free 有 100 instances/account、20,000 queries/month、500 crawled pages/day。 | Paid 有 5,000 instances/account、unlimited queries、unlimited crawled pages/day；正式计费前官方会提前沟通。 | 自然语言知识库搜索、Agent 工具、混合检索、MCP endpoint。 | 内容足够多后再上；技术文档优先 hybrid search。 |
| Workers AI | Free/Paid 都包含；每天 10,000 Neurons 免费。 | Paid 超过免费额度后按 $0.011 / 1,000 Neurons。 | 在 Cloudflare 上跑模型推理。 | 适合低延迟边缘推理；复杂生成任务要先估算 token/模型成本。 |
| AI Gateway | 所有计划可用，核心功能免费。 | 可能结合日志、统一计费、模型提供商成本使用。 | AI 请求网关、缓存、日志、限流、fallback。 | 只要调用外部模型，优先接 AI Gateway 做观测和成本控制。 |
| Vectorize | 见数据与存储。 | 见数据与存储。 | RAG 和语义搜索的向量层。 | 文本原文仍放 D1/R2，Vectorize 放 embedding 和 metadata。 |
| Agents SDK | 构建有状态 Agent。 | 依赖 Workers、Durable Objects、AI 等组合成本。 | Agent 状态、工具调用、长任务编排。 | 先把普通 Worker API 写清楚，再把真正需要状态和工具的流程升级为 Agent。 |

## 安全、网络与入口

| 产品 | 免费边界 | 付费入口 | 作用 | 最佳实践 |
| --- | --- | --- | --- | --- |
| [Fundamentals](/platform/fundamentals/) | 核心概念和基础操作本身不额外计费；具体能力看对应产品和计划。 | Organizations 是 Enterprise-only public beta；自定义错误、日志、角色能力等按具体产品计划提升。 | 理解 Account、Zone、Proxy、Origin、API Token、Ray ID 和请求头。 | 先确认资源 scope 和代理状态，再开 WAF、Cache、Workers、Rules；自动化只用最小权限 token。 |
| [DNS](/platform/dns/) | Free/Pro/Business 不对 DNS query 收费且不限制查询；新 Free zone 为 200 records/zone，旧 Free zone 为 1,000，Pro/Business 为 3,500。 | Enterprise 以 DNS query 等作为报价输入，records/zone 可申请提高。 | 域名解析、代理状态和流量入口。 | Web 入口用 Proxied，邮件和验证记录 DNS-only；迁移前导出旧 zone 并处理 DNSSEC。 |
| [Cache / CDN](/platform/cache/) | Cache / CDN、Cache Rules、Purge、Tiered Cache 基础能力在 Free 可用。 | Cache Rules 数量、Edge TTL 最小值、Cache Reserve、企业拓扑和高级 cache key 随计划或 add-on 提升。 | 缓存静态内容，减少源站压力。 | 静态 hash 资源长缓存；HTML 短缓存；用户态默认 bypass；用版本化 URL 少 purge。 |
| [流量调度与四层入口](/platform/traffic-routing/) | Health Checks Free 不可用，Pro 10、Business 50、Enterprise 1,000；Load Balancing first 500K DNS queries included；Argo first 1 GB included；Spectrum no free tier。 | Load Balancing、Spectrum、Argo 都是 paid add-on 或 usage-based；Spectrum 自定义 TCP/UDP 通常是 Enterprise paid add-on。 | 多源站故障切换、源站健康监控、TCP/UDP 代理、回源路径优化。 | 单源站先不用；多源站上 Load Balancing；非 HTTP 用 Spectrum；缓存做好后再看 Argo。 |
| [SSL/TLS](/platform/ssl-tls/) | Universal SSL、Origin CA、Always Use HTTPS、HSTS、TLS 1.3 等基础能力在 Free 可用。 | Advanced Certificate Manager、Custom Certificates、Keyless SSL、Enterprise-only 模式按需求升级。 | 给站点建立完整 HTTPS 链路。 | 默认目标是 Full (strict)；源站也要有有效证书，别停在 Flexible。 |
| [DDoS Protection](/platform/ddos/) | 官方说明所有计划都有 standard, unmetered DDoS protection，HTTP DDoS 和 Network-layer DDoS 也覆盖所有计划。 | Enterprise / Advanced DDoS 提供更多 override、Log action、Adaptive / Advanced DDoS、告警过滤和支持。 | 自动检测和缓解 L3/L4 与 L7 DDoS。 | Web 入口先保持 Proxied，隐藏源站 IP；被打时再结合 WAF、Rate Limiting、Under Attack 和日志排查。 |
| [Rules](/platform/rules/) | Rules available on all plans；Free 有 10 条常见现代规则、15 条 Bulk Redirect Rules、10,000 条 Bulk Redirect URL。 | Pro/Business/Enterprise 提升多数现代规则到 25/50/300；Snippets 和 Custom Errors 从 paid plans 起。 | 管理跳转、重写、回源、配置、压缩、错误页和轻量边缘逻辑。 | 新项目优先现代 Rules，不再新写 Page Rules；用 Trace 验证执行顺序。 |
| [WAF](/platform/waf/) | WAF 可用于所有计划；Free 有 5 条 Custom Rules、1 条 Rate Limiting Rule、Free Managed Ruleset 和 sampled Security Events。 | Pro/Business/Enterprise 提升规则数量、Managed Rules、Attack Score、Security Events 和高级检测能力。 | 拦常见攻击、写自定义规则、限速高风险入口。 | 登录、API、后台、评论和上传先加最小规则；先看 Security Events，再逐步收紧。 |
| Turnstile | Free 最多 20 个 widgets，每个 widget 10 个 hostnames；挑战和验证请求不限量。 | Enterprise 提升 hostname、analytics、Ephemeral IDs、Offlabel 和组织支持。 | 免费 CAPTCHA 替代，降低表单滥用。 | 只放前端组件不够，必须服务端验证 token；适合表单、登录和高频提交入口。 |
| Rate Limiting | WAF Rate Limiting 在 Free 有 1 条规则。 | Pro 2 条、Business 5 条、Enterprise 100 条，更多高级特征随计划提升。 | 防刷、防撞库、防 API 滥用。 | 对登录、评论、验证码、搜索 API 先做最小限流；注意 NAT 用户误伤。 |
| Bots | Free 有 Bot Fight Mode、Block AI bots、AI Labyrinth 和 robots.txt 相关能力。 | Pro/Business 为 Super Bot Fight Mode；Enterprise Bot Management 才有 bot score、JA3/JA4 和路径级控制。 | 识别和处理自动化流量。 | 先用 Turnstile、WAF、限流；明确 bot 成本后再买更高级能力。 |
| API Shield | Free 可用 Endpoint Management 和 Schema validation：100 endpoints、5 schemas、200 kB schema size。 | 完整 API Shield 需要 Enterprise 订阅。 | mTLS、schema validation、JWT、API 安全。 | 公开 API 先定义 schema、认证和限流，再加 Shield 能力。 |
| [Zero Trust 与企业网络](/platform/zero-trust-networking/) | Zero Trust Free 为 $0 forever，50 user limit，标准日志最长 24 小时；Tunnel 发布 public hostname 不需要 paid Access plan。 | Pay-as-you-go 为 $7/user/month paid annually；Contract 是自定义价格，面向完整 SSE / SASE、长日志、支持和网络服务。 | Access、Gateway、Tunnel、Cloudflare One Client、Cloudflare WAN 和 Network Firewall 的组合。 | 普通项目先用 Tunnel + Access 保护后台；Cloudflare WAN / Network Firewall 属于企业网络，不是个人项目默认项。 |
| [自有网络与专线](/platform/private-networking/) | Workers VPC 在 Open Beta 期间对 Free / Paid Workers plans 免费；Magic Transit、BYOIP、Network Interconnect 都是 Enterprise-only。 | Workers VPC 仍按标准 Workers 请求和 CPU 计费；Magic Transit / BYOIP / CNI 走企业合同和网络工程预算。 | 自有 IP 段保护、BYOIP、私有专线、Worker 访问私有 API / 数据库。 | 普通站点先用 Proxied DNS + WAF + DDoS；Worker 访问内网才看 Workers VPC；自有 IP 和专线属于企业阶段。 |
| Security Center / Security Insights | 默认自动扫描所有账户和 zone；Free 每 7 天，Pro/Business 每 3 天，Enterprise 每天。 | Brand Protection、Threat Intelligence、Security Reports、手动扫描资格按当前计划看。 | 发现 DNS、SSL/TLS、WAF、Access 等配置风险。 | 把它当安全巡检入口，先处理 Critical / High findings。 |

## 媒体、观测与开发工具

| 产品 | 免费边界 | 付费入口 | 作用 | 最佳实践 |
| --- | --- | --- | --- | --- |
| [Billing](/platform/billing/) | Billable Usage dashboard、Budget alerts、invoice 和 billing policy 可用于理解账单。 | usage-based overage、subscription 和 add-on 都要按产品核对。 | 把免费额度、固定订阅、按量费用和发票串起来。 | 开启付费产品前先看 pricing / limits；开启后看 Billable Usage 和 budget alerts。 |
| [观测与日志](/platform/observability/) | Web Analytics、Dashboard Analytics、Workers Real-time logs、Workers Logs 和 Notifications 覆盖小项目早期观测。 | Analytics Engine、Workers Logpush、Log Explorer、Enterprise Logpush 和外部 SIEM 是更明确的付费入口。 | 把站点体验、Worker 错误、Cloudflare 边缘日志、业务指标和告警串起来。 | 先用 Web Analytics + Workers Logs + Budget alerts；需要长期取证再上 Log Explorer / Logpush。 |
| Web Analytics | 官方标注 available on all plans；Pages 文档称它是免费、隐私优先分析。 | 更复杂产品分析用 Analytics Engine 或第三方。 | 站点访问和性能统计。 | 文档站和官网先开它，不急着上复杂埋点。 |
| Workers Logs / Tail | 随 Workers 提供开发和排障能力。 | 更长留存、Logpush、企业日志再付费。 | 查看 Worker 日志和错误。 | 生产只记录必要上下文，别把 token/隐私数据写日志。 |
| GraphQL Analytics API | Cloudflare 多产品指标查询。 | 大规模分析、企业报表时评估。 | 查询 DNS、HTTP、Workers 等指标。 | 先用 Dashboard；需要自动报表再接 API。 |
| [媒体与性能](/platform/media-performance/) | Images Free 每月 5,000 unique transformations；Speed available on all plans；Zaraz 每账号每月 1,000,000 free events；Browser Run Free 有 10 minutes/day。 | Images Paid、Stream、Zaraz Paid、Browser Run Paid 都是明确用量后再上。 | 图片、视频、前端性能、第三方脚本和浏览器自动化。 | 大图、附件、视频不要塞进静态包；图片看 Images，视频看 Stream，第三方脚本看 Zaraz，截图/PDF/爬虫看 Browser Run。 |
| Images | Free 计划包含 5,000 unique transformations/month，超出后新 transformation 返回 `9422`，不会直接收费。 | Paid 前 5,000 transformations included，超出 $0.50/1,000；Images storage $5/100k images/month，delivery $1/100k images。 | 图片优化、变换、存储和分发。 | 图片原文件优先 R2；需要动态裁剪和格式转换再接 Images。 |
| Stream | ingress 和 encoding 免费；存储与播放按视频分钟计费。 | 存储 $5/1,000 minutes stored，播放 $1/1,000 minutes delivered；Media Transformations 5,000 free operations/month 后 $0.50/1,000。 | 视频托管、编码、播放、直播和分析。 | 不要用 Pages/R2 裸扛完整视频产品；视频业务用 Stream 或专门服务。 |
| Browser Run | Workers Free 有 10 minutes/day browser hours、Browser Sessions 3 concurrent browsers。 | Workers Paid 有 10 hours/month included，超出 $0.09/hour；并发浏览器 included 10 averaged monthly，超出 $2/browser。 | 云端无头浏览器。 | 能用普通 fetch 就别开浏览器；浏览器时间贵，任务要短，并且必须关闭 session。 |
| Zaraz | 每个 Cloudflare account 每月 1,000,000 free Zaraz Events；所有功能和工具可用于所有账号。 | 每额外 1,000,000 Zaraz Events 为 $5/month。 | 把分析、广告、营销和聊天脚本迁到边缘管理。 | 前端脚本变多、需要 consent 或 selective loading 时再引入；先减少脚本数量。 |
| [迁移与 IaC](/platform/iac-migration/) | Terraform、Pulumi、Wrangler、cf-terraforming 和 Reference Architecture 本身是工具和资料入口；Cloudflare 费用来自被管理的具体产品。 | Terraform Cloud、Pulumi Cloud、R2 remote state、企业账号隔离等会带来各自成本。 | 把 DNS、Rules、WAF、Access、存储资源和迁移过程纳入可 review 的配置。 | 同一个资源只能有一个真源；Worker 开发和 D1 migrations 仍优先用 Wrangler。 |
| Wrangler | 免费 CLI。 | 无。 | 管理 Workers、D1、R2、KV、部署。 | `wrangler.jsonc` 作为配置真源，生产变更走 Git。 |

## 独立开发者推荐组合

| 场景 | 推荐组合 |
| --- | --- |
| 文档站 / 公开知识库 | Astro/Starlight + [Workers Static Assets](/platform/static-assets/) + Pagefind + Web Analytics |
| 有评论的文档社区 | Workers Static Assets + Twikoo Cloudflare + 后续 Turnstile |
| 小型 SaaS | Workers + D1 + KV + R2 + AI Gateway |
| 多租户 SaaS 自定义域名 | Cloudflare for SaaS + Worker as origin + D1 tenant mapping |
| 用户代码 / AI 生成应用平台 | Workers for Platforms 或 Dynamic Workers + Durable Objects + R2 / D1 |
| 文件上传和下载 | Workers + R2 + Signed URL + D1 metadata |
| AI 问答知识库 | Workers + AI Search 或 Vectorize + R2/D1 + AI Gateway |
| 实时协作 | Workers + Durable Objects + D1/R2 持久化 |
| 实时音视频 | RealtimeKit；高自定义 WebRTC 再用 Realtime SFU + TURN |
| 后台任务 | Workers + Queues + Cron Triggers + D1/R2 |
| 长流程和数据管道 | Workflows + R2 / D1；Pipelines + R2 Data Catalog |
| 管理后台 | Workers Static Assets + Access/Tunnel + D1 |
| 多源站高可用 | [Load Balancing + Health Checks](/platform/traffic-routing/) + WAF / Cache |
| 非 HTTP 公开服务 | [Spectrum + Load Balancing](/platform/traffic-routing/) |
| 小团队内网和运维入口 | Tunnel + Access + Cloudflare One Client + Gateway |
| Worker 访问私有后端 | Workers VPC + Cloudflare Tunnel / Mesh + Hyperdrive |
| 企业自有 IP 和专线 | Magic Transit + BYOIP + Network Interconnect + Network Firewall |

## 官方资料

- [Cloudflare Fundamentals](https://developers.cloudflare.com/fundamentals/)
- [How Cloudflare works](https://developers.cloudflare.com/fundamentals/concepts/how-cloudflare-works/)
- [Accounts, zones, and user profiles](https://developers.cloudflare.com/fundamentals/concepts/accounts-and-zones/)
- [Cloudflare IP addresses](https://developers.cloudflare.com/fundamentals/concepts/cloudflare-ip-addresses/)
- [Protect your origin server](https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Static Assets Billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
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
- [Workers AI Limits](https://developers.cloudflare.com/workers-ai/platform/limits/)
- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- [AI Gateway Limits](https://developers.cloudflare.com/ai-gateway/reference/limits/)
- [AI Search](https://developers.cloudflare.com/ai-search/)
- [AI Search Limits & pricing](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)
- [Vectorize Pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)
- [Vectorize Limits](https://developers.cloudflare.com/vectorize/platform/limits/)
- [Agents](https://developers.cloudflare.com/agents/)
- [Agents Limits](https://developers.cloudflare.com/agents/platform/limits/)
- [Images Pricing](https://developers.cloudflare.com/images/pricing/)
- [Images Limits and formats](https://developers.cloudflare.com/images/get-started/limits/)
- [Stream Pricing](https://developers.cloudflare.com/stream/pricing/)
- [Stream FAQ](https://developers.cloudflare.com/stream/faq/)
- [Speed](https://developers.cloudflare.com/speed/)
- [Observatory](https://developers.cloudflare.com/speed/observatory/)
- [Zaraz Pricing](https://developers.cloudflare.com/zaraz/pricing-info/)
- [Browser Run Pricing](https://developers.cloudflare.com/browser-run/pricing/)
- [Browser Run Limits](https://developers.cloudflare.com/browser-run/limits/)
- [Cloudflare Terraform provider](https://developers.cloudflare.com/terraform/)
- [Terraform Best practices](https://developers.cloudflare.com/terraform/advanced-topics/best-practices/)
- [Import Cloudflare resources](https://developers.cloudflare.com/terraform/advanced-topics/import-cloudflare-resources/)
- [Terraform Remote R2 backend](https://developers.cloudflare.com/terraform/advanced-topics/remote-backend/)
- [Workers Infrastructure as Code](https://developers.cloudflare.com/workers/platform/infrastructure-as-code/)
- [Pulumi](https://developers.cloudflare.com/pulumi/)
- [Reference Architectures](https://developers.cloudflare.com/reference-architecture/)
- [Migration Guides](https://developers.cloudflare.com/migration-guides/)
- [Web Analytics Docs](https://developers.cloudflare.com/web-analytics/)
- [Web Analytics Limits](https://developers.cloudflare.com/web-analytics/limits/)
- [Cloudflare Analytics](https://developers.cloudflare.com/analytics/)
- [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/)
- [Analytics Engine Pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)
- [Cloudflare Logs](https://developers.cloudflare.com/logs/)
- [Logpush](https://developers.cloudflare.com/logs/logpush/)
- [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
- [Log Explorer](https://developers.cloudflare.com/log-explorer/)
- [Notifications](https://developers.cloudflare.com/notifications/)
- [Cloudflare Billing Docs](https://developers.cloudflare.com/billing/)
- [Usage-based billing](https://developers.cloudflare.com/billing/understand/usage-based-billing/)
- [Budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/)
- [Load Balancing](https://developers.cloudflare.com/load-balancing/)
- [Load Balancing limitations](https://developers.cloudflare.com/load-balancing/reference/limitations/)
- [Health Checks](https://developers.cloudflare.com/health-checks/)
- [Spectrum Protocols per plan](https://developers.cloudflare.com/spectrum/protocols-per-plan/)
- [Argo Smart Routing](https://developers.cloudflare.com/argo-smart-routing/)
- [DNS FAQ](https://developers.cloudflare.com/dns/faq/)
- [WAF Docs](https://developers.cloudflare.com/waf/)
- [DDoS Protection Docs](https://developers.cloudflare.com/ddos-protection/)
- [DDoS Protection About](https://developers.cloudflare.com/ddos-protection/about/)
- [Cloudflare Rules](https://developers.cloudflare.com/rules/)
- [Ruleset Engine](https://developers.cloudflare.com/ruleset-engine/)
- [Turnstile Plans](https://developers.cloudflare.com/turnstile/plans/)
- [Turnstile Server-side Validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [API Shield Plans](https://developers.cloudflare.com/api-shield/plans/)
- [Bot solutions Free plan](https://developers.cloudflare.com/bots/plans/free/)
- [Security Insights how it works](https://developers.cloudflare.com/security/security-insights/how-it-works/)
- [Cloudflare One account limits](https://developers.cloudflare.com/cloudflare-one/account-limits/)
- [Cloudflare Access product and pricing](https://www.cloudflare.com/sase/products/access/)
- [Cloudflare One setup](https://developers.cloudflare.com/cloudflare-one/setup/)
- [Gateway traffic policies](https://developers.cloudflare.com/cloudflare-one/traffic-policies/)
- [Published applications with Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/)
- [Private networks with Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/private-net/)
- [Cloudflare WAN](https://developers.cloudflare.com/cloudflare-wan/)
- [Cloudflare Network Firewall plans](https://developers.cloudflare.com/cloudflare-network-firewall/plans/)
- [Magic Transit](https://developers.cloudflare.com/magic-transit/)
- [BYOIP](https://developers.cloudflare.com/byoip/)
- [Network Interconnect](https://developers.cloudflare.com/network-interconnect/)
- [Workers VPC](https://developers.cloudflare.com/workers-vpc/)
- [Workers VPC Pricing](https://developers.cloudflare.com/workers-vpc/reference/pricing/)
- [Workers VPC Limits](https://developers.cloudflare.com/workers-vpc/reference/limits/)
- [Secrets Store](https://developers.cloudflare.com/secrets-store/)
