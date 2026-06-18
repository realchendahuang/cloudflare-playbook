---
title: 免费额度大全
description: Cloudflare 免费额度、5 USD/month Workers Paid、付费入口和成本控制建议。
---

最后核对日期：2026-06-18。Cloudflare 的额度和价格变化很快，本页优先整理免费额度、`$5/month` Workers Paid 和容易误判的付费边界；最终数字以官方 pricing / limits 为准。账单类型、预算提醒、发票和 usage-based billing 见 [账单与预算](/platform/billing/)。

这页是本站的 Cloudflare 额度事实源，不是附录。首页负责快速判断，这里负责把 Free、`$5/month` Workers Paid、zone plan、add-on 和 Enterprise 边界放到同一套表格里。准备启用任何付费能力前，先回到这页核对对应产品的计量单位和最容易误判的收费点。

先回答读者最关心的三个问题：

1. 一个项目能不能先免费跑起来。
2. `$5/month` Workers Paid 到底买到什么。
3. 哪些东西不归 Workers Paid 管，必须看 zone plan、add-on 或 Enterprise。

读这页时不要按产品名背表。先看你要做的项目，再看免费额度、付费入口和成本控制建议。Cloudflare 最适合早期项目的地方，是让静态流量、轻量 API、数据、文件、搜索、安全和后台入口先组合起来，而不是一开始就买完整平台。

## 一屏看懂免费额度

这张表先放最能影响项目决策的免费额度。先按这些数字判断能不能零成本起步，再去看后面的产品级大全。

| 你要做什么 | 免费额度 / 免费边界 | 先用什么 | 什么时候再付费 |
| --- | --- | --- | --- |
| 文档站、官网、博客 | Workers Static Assets / Pages 静态资产请求免费且不限量。 | Workers Static Assets / Pages + Pagefind + Web Analytics。 | 构建次数、文件数、动态 Functions 或搜索体验成为瓶颈。 |
| 小 API、Webhook、评论、表单 | Workers Free 100,000 requests/day，10 ms CPU/invocation。 | Workers + D1 + Turnstile + 最小 WAF / Rate Limiting。 | 请求量接近上限、CPU 不够、日志留存不够，或 D1 / KV / Queues 进入付费口径。 |
| 关系数据 | D1 Free 5M rows read/day、100k rows written/day、5 GB total storage。 | D1。 | 写入量、存储、慢查询和索引问题已经真实出现。 |
| 配置和低频缓存 | KV Free 100k reads/day、1k writes/day、1 GB storage。 | KV。 | 写多、list 多或强一致需求出现时，换 D1 / Durable Objects。 |
| 文件、图片、附件、导出物 | R2 Standard 10 GB-month、1M Class A/month、10M Class B/month，egress 免费。 | R2 + CDN cache。 | 存储、读写操作或冷数据归档开始超过免费层。 |
| 搜索和 AI 试验 | Pagefind 本地索引不打后端；Workers AI 10,000 Neurons/day；AI Search 新实例 open beta 内免费。 | Pagefind -> AI Gateway -> Workers AI / AI Search。 | 自然语言搜索成为核心体验，且 Neurons、AI Gateway logs、AI Search queries 进入瓶颈。 |
| 后台和内网工具 | Zero Trust Free 50 users；Tunnel 可发布 public hostname。 | Access + Tunnel。 | 用户数、审计、Gateway、DLP、设备姿态或长期日志成为刚需。 |
| 异步任务和强一致状态 | Queues Free 10,000 operations/day；Durable Objects Free 100,000 requests/day、13,000 GB-s/day。 | Queues + Durable Objects。 | 重试、消息保留、WebSocket 状态或 DO duration 开始决定体验。 |
| 早期日志排障 | Workers Logs Free 200,000 events/day，保留 3 天。 | Workers Logs。 | 生产排障、长期留存、外部 SIEM 或日志量成为刚需。 |
| 成本观察 | Budget alerts 可按美元阈值发邮件提醒 usage-based spend。 | Budget alerts + usage dashboard + 产品侧限流。 | 需要更细产品通知、Logpush、长期审计或企业账单治理。 |

## All the fun：免费额度玩法大全

免费额度最值得用在“先把项目做出来”上，而不是把产品名堆满。下面这张表按项目目标整理，先判断能不能 0 元启动，再判断最可能撞到哪条线。

| 项目目标 | 免费组合 | 免费阶段能验证什么 | 最先撞到 |
| --- | --- | --- | --- |
| 开源文档站 | Workers Static Assets / Pages + Pagefind + Web Analytics | 内容组织、SEO、静态搜索、访问趋势。 | 构建次数、文件数、搜索体验。 |
| 教程站轻社区 | Static Assets + Twikoo Cloudflare + D1 + Turnstile | 评论互动、轻量审核、读者反馈。 | D1 写入、刷量、日志留存。 |
| 个人官网 / 博客 | DNS + CDN + Universal SSL + Cache + Static Assets | 域名接入、HTTPS、全球访问、缓存策略。 | 图片体积、构建次数、缓存误配。 |
| 小 API / Webhook | Workers Free + D1 / KV + WAF Rate Limiting | API 路由、鉴权、请求处理、数据写入。 | 100,000 requests/day、10 ms CPU、写入滥用。 |
| 表单 / 反馈箱 | Workers + D1 + Turnstile + Workers Logs | 公开写入口、反垃圾、后台查看。 | D1 rows written、日志 3 天留存。 |
| 文件上传 / 下载 | R2 + 签名链接 + CDN cache | 附件、导出文件、私有下载、对象权限。 | storage、Class A、Class B。 |
| 小团队后台 | Access + Tunnel + D1 | 身份边界、预览环境、内部工具。 | 50 users、审计日志、设备策略。 |
| AI 搜索原型 | Pagefind + AI Gateway + Workers AI / AI Search | 自然语言问答、模型观测、缓存和限流。 | Neurons、AI Search queries、Gateway logs。 |
| 实时小应用 | Durable Objects + 连接休眠 + Queues | 房间状态、实时连接、异步后处理。 | DO requests、GB-s、Queues operations。 |

## 免费额度先读规则

Cloudflare 的免费层很适合早期项目起步，但它不是“所有产品无限免费”。读数字之前，先把下面几条当成使用规则。

| 规则 | 直接影响 |
| --- | --- |
| 静态资产命中才免费且不限量。 | Workers Static Assets / Pages 的静态资产请求免费；SSR、Functions、整站先跑 Worker 或 API 路径进入 Worker 后，就按 Workers 请求和 CPU 计算。 |
| Free 多数是日额度，Paid 多数是月额度。 | Workers、D1、KV、Queues、Workers AI 等免费额度通常按 UTC 0 点重置；Workers Paid 的 included usage 按月度订阅周期计算。 |
| `$5/month` Workers Paid 只放大开发者平台。 | 它不是 Cloudflare Pro，不会自动提升 WAF、Bot、证书、Rules、Cache Rules、Load Balancing 或企业网络能力。 |
| Budget alerts 只是邮件提醒。 | 它不会暂停服务、不会阻止按量产品继续计费，也不是账单硬封顶。 |
| 存储产品要同时看容量和操作。 | R2 免 egress，但 storage、Class A、Class B 会计费；D1 读的是扫描行数，KV 写入和 list 很容易先撞限制。 |
| AI 免费额度适合验证，不适合无约束开放。 | Workers AI、AI Gateway、AI Search、Vectorize 都要配合限流、缓存、日志和模型选择。 |

## 先看四条

先别急着看所有数字。先按这四类额度判断：

| 优先级 | 额度类型 | 代表产品 | 实践判断 |
| --- | --- | --- | --- |
| 1 | 默认就该用的免费能力 | DNS、CDN、Universal SSL、DDoS、Workers Static Assets、Web Analytics。 | 这些是把项目放上 Cloudflare 的基础收益，能降低源站压力和运维复杂度。 |
| 2 | 能验证产品的免费能力 | Workers Free、D1、KV、R2、Queues、Durable Objects、Turnstile、Access、Workers AI、AI Gateway、AI Search。 | 适合把文档站、小 API、评论、表单、后台和 AI 试验先跑起来。 |
| 3 | 值得为 `$5/month` 升级的能力 | Workers Paid、Pages Functions、Workers Logs、Trace Events Logpush、Containers、Email Sending。 | 当请求、CPU、日志、后台任务或开发者平台限制成为真实瓶颈，再升级。 |
| 4 | 不能靠 Workers Paid 解决的能力 | Pro / Business / Enterprise zone plan、Images Paid、Stream、Load Balancing、Argo、Magic Transit、Logpush、Bot Management。 | 这些要按域名计划、add-on、媒体用量、网络合同或企业安全需求单独评估。 |

如果只记一条：**免费额度先服务架构顺序，不是用来堆产品名。** 静态内容留在静态层，文件进 R2，关系数据进 D1，配置缓存进 KV，强一致状态进 Durable Objects，耗时任务进 Queues，高风险写操作加 Turnstile。

## 免费阶段玩法矩阵

| 场景 | 零成本起步组合 | 撞墙信号 | 下一步 |
| --- | --- | --- | --- |
| 开源文档站 | Workers Static Assets / Pages + Pagefind + Web Analytics。 | 构建次数、文件数量、搜索体验或评论写入成为瓶颈。 | 先优化构建和静态资源；再考虑 D1 评论、AI Search 或 Workers Paid。 |
| 小型 SaaS API | Workers Free + D1 Free + KV cache + Turnstile。 | 100,000 requests/day、10 ms CPU、D1 写入或日志留存不够。 | 升 Workers Paid，拆静态和动态路径，给写操作做限流。 |
| 内容社区雏形 | Workers + D1 + Turnstile + WAF Rate Limiting。 | 写入、审核、恶意提交、日志追踪成为主要工作。 | 加 Workers Paid、队列、审核后台和更明确的安全规则。 |
| 文件服务 | R2 Standard Free + presigned URL + CDN cache。 | 超过 10 GB-month、Class A / B operations 增长、冷数据比例上升。 | 优化缓存和上传策略；冷数据再评估 Infrequent Access。 |
| 内部工具 | Access + Tunnel + Zero Trust Free。 | 超过 50 users、日志留存、设备姿态、Gateway、DLP 或审计要求上来。 | 看 Zero Trust Pay-as-you-go 或合同计划。 |
| AI 搜索试验 | Pagefind + Workers AI + AI Gateway + AI Search Free。 | 自然语言查询、向量维度、日志审计或模型调用成为核心体验。 | 再上 AI Search Paid、Vectorize 或更完整的 AI Gateway 日志策略。 |

## 核心额度速查

下面这张表先解决“一个项目到底能免费用多少、`$5 Workers Paid` 又买到多少”的问题。它只放最常用能力；更细的媒体、日志、网络、企业产品和低频产品边界看后面的产品级大全。

| 产品 / 能力 | Free / 免费边界 | Workers Paid / 付费边界 | 实践判断 |
| --- | --- | --- | --- |
| DNS | Free/Pro/Business 不对 DNS queries 收费；新 Free zone 为 200 records/zone，旧 Free zone 为 1,000。 | Workers Paid 不改变 DNS 配额；Enterprise 把 DNS queries 作为报价输入之一。 | 域名先接 Cloudflare，Web 记录代理，邮件、验证和第三方服务记录保持 DNS-only。 |
| CDN / Cache | CDN 可用于所有计划；Free 有 10 条 Cache Rules，最大可缓存文件 512 MB。 | Workers Paid 不提升 Cache Rules；更高规则数、Edge TTL 和 purge 能力看 zone plan。 | 静态 hash 资源长缓存，HTML 谨慎缓存；不要让静态资源进 Worker。 |
| SSL/TLS | Universal SSL、Origin CA、Always Use HTTPS、HSTS、TLS 1.3、Authenticated Origin Pulls 可在 Free 使用。 | Workers Paid 不提升证书能力；Advanced Certificate Manager、Custom Certificates、Keyless SSL 单独看计划。 | 默认 Full (strict)，边缘用 Universal SSL，源站用 Origin CA 或公开 CA。 |
| DDoS | 所有计划都有 standard, unmetered DDoS protection，HTTP DDoS 和 Network-layer DDoS 都覆盖。 | Workers Paid 不提升 DDoS 规则；Advanced DDoS、更多 overrides 和 Log action 看 Enterprise / add-on。 | 先把 Web 入口设为 Proxied，隐藏源站 IP；API 再叠 WAF、Rate Limiting、Turnstile。 |
| WAF / Rate Limiting | WAF all plans；Free 有 5 条 Custom Rules、1 条 Rate Limiting Rule、Free Managed Ruleset。 | Workers Paid 不提升 WAF 配额；更多规则、事件历史和高级检测看 Pro / Business / Enterprise。 | 登录、后台、评论、上传先写最小规则；先观察 Security Events，再逐步 block。 |
| Turnstile | Free 最多 20 widgets，每个 widget 10 hostnames；挑战和验证请求不限量。 | Enterprise widgets 不限量，每个 widget 最多 200 hostnames。 | 表单、登录、评论、注册都先用 Turnstile；服务端必须调用 Siteverify。 |
| Zero Trust / Access / Tunnel | Zero Trust Free 为 $0 forever，50 user limit；Tunnel 可发布 public hostname。 | Workers Paid 不提升 seats；Pay-as-you-go / Contract 看用户数、日志、Gateway 和设备策略。 | 50 人以内后台、预览环境、内网工具先用 Access + Tunnel；没有 Access policy 的 Tunnel public hostname 仍然公开。 |
| Web Analytics | 免费、隐私优先；代理站点不限，非代理站点 10 个。 | Workers Paid 不提升 Web Analytics rules；规则数量看 zone plan。 | 文档站和官网先开它，不急着自建复杂埋点。 |
| Workers 动态请求 | 100,000 requests/day，UTC 0 点重置。 | 每账号每月最低 `$5`；10M requests/month included，超出 `$0.30/million`。 | 评论、Webhook、小 API 免费可起步；公开 API 稳定有人用后再升。 |
| Workers CPU | 10 ms CPU/invocation。 | 30M CPU ms/month included，超出 `$0.02/million CPU ms`；单次默认 30s，可设到 5min。 | SSR、AI 前处理、批任务要看 CPU，不只看请求数。 |
| 静态资产请求 | Workers Static Assets / Pages 静态资产请求免费且不限量。 | 静态资产请求仍免费且不限量。 | 文档、官网、博客主流量要停在静态资产层。 |
| Static Assets 文件 | 20,000 files/Worker version，25 MiB/file。 | 100,000 files/Worker version，25 MiB/file。 | 大附件、图片原图和导出物放 R2。 |
| Pages | 500 builds/month、1 concurrent build、100 custom domains/project、20,000 files/site、25 MiB/file。 | Pro/Business 提升构建、并发和文件数；Functions 按 Workers 口径。 | 纯静态站和 PR 预览很顺；复杂 Worker 能力优先 Static Assets。 |
| D1 | 5M rows read/day、100k rows written/day、5 GB total storage。 | 25B rows read/month、50M rows written/month、5 GB included，超出按量。 | 评论、表单、小后台适合；索引比“换产品”更重要。 |
| KV | 100k reads/day、1k writes/day、1k deletes/day、1k lists/day、1 GB storage。 | 10M reads/month、1M writes/deletes/lists/month、1 GB included。 | 读多写少配置和缓存适合；不要当强一致数据库。 |
| R2 Standard | 每月 10 GB-month、1M Class A、10M Class B，egress 免费。 | 超出按 storage、Class A、Class B 计费；Infrequent Access 没有免费额度。 | 文件对象优先 R2，但公开下载热点要看 Class B。 |
| Queues | 10,000 operations/day，消息保留 24 小时。 | 1M operations/month included，超出 `$0.40/million`；默认保留 4 天，可配到 14 天。 | 邮件、通知、导入和后处理适合；简单同步接口不用先上队列。 |
| Durable Objects | 可用 SQLite-backed DO；100,000 requests/day、13,000 GB-s/day。 | 1M requests/month、400,000 GB-s/month included，超出按量。 | 只放强一致房间、会话、限流器；WebSocket 用 hibernation。 |
| Workers AI | Free / Paid 都有 10,000 Neurons/day 免费分配。 | 超过每日免费分配需要 Workers Paid，之后 `$0.011/1,000 Neurons`。 | AI 调用先接 AI Gateway，小模型和短输出优先。 |
| AI Gateway | 所有计划可用，核心功能免费；Persistent logs Free 为所有 gateway 合计 100,000 logs；Spend limits 可按模型、供应商或标签做成本预算并返回 `429`。 | Workers Paid 为 10M logs/gateway；Logpush 仅 Workers Paid。 | 外部模型、Workers AI、缓存、限流、日志和成本控制统一从网关进。 |
| AI Search | 新实例在 open beta 内免费；Free 有 100 instances/account、100,000 files/instance、20,000 queries/month、500 crawled pages/day；Workers AI 和 AI Gateway 另算。 | Paid 有 5,000 instances/account、1M files/instance 或 hybrid search 500K、unlimited queries、unlimited crawled pages/day。 | 文档站先 Pagefind；需要自然语言搜索或工具调用时再上。 |
| Vectorize | 30M queried vector dimensions/month、5M stored vector dimensions。 | 50M queried vector dimensions/month、10M stored vector dimensions included。 | 文档少时先 Pagefind；自然语言搜索确定有价值后再上。 |
| Budget alerts / Usage notifications | Budget alerts 面向 Pay-as-you-go，用邮件提醒 usage-based spend；usage notifications 按产品阈值提醒。 | Budget alerts 不是硬封顶；usage notifications 需要 Professional plans or higher。 | 付费前先开提醒，但真正的成本控制仍是静态优先、限流、队列、配额和权限。 |

## 先看 $5 Workers Paid

Workers Paid 是很多 Cloudflare 开发者项目的第一笔固定支出，官方价格页写的是每个账户每月最低 **$5 USD**。它不是 Cloudflare Pro，也不是 Pages Pro；它主要扩展 Workers、Pages Functions、KV、Hyperdrive、Durable Objects 等开发者平台能力。

这节的口径要看清楚：

- Workers Paid 是账号级订阅，included usage 按月计算。
- Pages Functions 按 Workers 计费，额度和 Workers 放在同一套口径里。
- Workers 平台不额外收 data transfer / throughput 费用。
- Workers Static Assets 的静态资产请求免费且不限量，只有进入 Worker 脚本的动态请求才按 Workers 计费。
- Workers Paid 包含月度 included usage，不是支出封顶；超过 included usage 后仍会按请求、CPU、日志、存储或操作量继续计费。

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
| Artifacts | 不可用。 | 10,000 operations/month 和 1 GB storage/month included；超出 `$0.15/1,000 operations`、`$0.50/GB-mo`。 |
| Email Sending | 向任意收件人发送不可用；verified destination addresses 免费。 | 3,000 outbound emails/month included，超出 `$0.35/1,000 emails`；Email Routing inbound unlimited。 |
| R2 SQL | 1 GB/month data scanned included。 | 10 GB/month data scanned included，超出 `$0.0025/GB`；R2 storage / operations 和 R2 Data Catalog 另算。 |
| Sandbox SDK | 生产能力受限；Containers 不可用。 | 生产部署需要 Workers Paid 或 Enterprise；费用继承 Containers，并叠加 Workers、Durable Objects、可选 Workers Logs。 |

## $5 Workers Paid 到底买什么

把 `$5/month` 当成“动态能力和工程化能力的底座”更准确。

| 它买到的东西 | 具体含义 | 实践判断 |
| --- | --- | --- |
| 动态请求月度包 | 10M Worker requests/month included，超出按百万请求计费。 | 评论、Webhook、API、搜索代理、后台接口开始稳定使用时再升。 |
| CPU 月度包 | 30M CPU milliseconds/month included，超出按 CPU ms 计费；单次 CPU 默认 30s，可配置到 5min。 | SSR、数据处理、签名上传、AI 代理和批任务要看 CPU，不只看请求数。 |
| 更大的平台限制 | Worker 数量、Cron Triggers、Subrequests、Worker bundle size、Static Asset 文件数等都提高。 | 多项目、多环境、多定时任务时价值明显。 |
| 开发者平台联动 | Pages Functions、KV、D1、Queues、Durable Objects、Hyperdrive 等按 Workers Paid 口径进入更高额度或付费能力。 | 一旦 Worker 不只是静态站旁边的小 API，就应该看这一层。 |
| 可观测性 | Workers Logs 月度 included usage、Trace Events Logpush 等。 | 生产排障需要日志留存、过滤、采样和外部目的地时再开。 |
| 新计算能力入口 | Containers、Artifacts、任意收件人 Email Sending、Sandbox SDK 生产能力等。 | 这些不是文档站默认需求，只有业务明确时才进来。 |

它没有买到的东西：

| 不包含 | 为什么要分开看 |
| --- | --- |
| Cloudflare Pro / Business 的 zone 权益 | WAF 规则数量、缓存规则、上传体积、部分安全能力跟 zone plan 相关。 |
| Enterprise 网络能力 | Magic Transit、BYOIP、Network Interconnect、很多日志和 Bot 能力仍然是 Enterprise 或合同产品。 |
| 媒体和对象存储全部成本 | R2、Images、Stream、Browser Run、Zaraz 等有自己的存储、操作、事件或播放计费维度。 |
| 预算硬封顶 | Budget alerts 只提醒，不会自动暂停服务或停止所有按量计费。 |

## 产品级免费额度大全

这一节是更完整的查表入口。它包含一些不会出现在首页核心表里的后置产品、企业能力、媒体产品、日志产品和低频工具；不用逐行背，只在准备启用某个产品前回来核对。

| 产品 | 免费额度 / 免费边界 | 付费入口 | 成本控制建议 |
| --- | --- | --- | --- |
| [DNS](/platform/dns/) | Free/Pro/Business 不对 DNS queries 收费，且不限制 DNS queries；新 Free zone 为 200 records/zone，旧 Free zone 为 1,000。 | Enterprise 把 monthly DNS queries 作为报价输入之一；record limit 可申请提高。 | 域名统一接入 Cloudflare，Web 入口代理，邮件和验证记录保持 DNS-only。 |
| [Cache / CDN](/platform/cache/) | Cache / CDN 可用于所有计划；Free 有 10 条 Cache Rules，Edge Cache TTL 最小 2 小时，最大可缓存文件 512 MB，Purge by URL 800 URLs/s。 | Pro/Business/Enterprise 提升规则数量、Edge TTL 最小值、purge 限制和企业拓扑；Cache Reserve 为 usage-based add-on，Storage $0.015/GB-month、Class A $4.50/million、Class B $0.36/million。 | 静态 hash 资源长缓存；HTML 谨慎缓存；用户态 bypass；大文件和媒体用 R2/Images/Stream。 |
| [流量调度与四层入口](/platform/traffic-routing/) | Health Checks Free 不可用，Pro 10、Business 50、Enterprise 1,000；Load Balancing first 500K DNS queries included；Argo first 1 GB included；Spectrum no free tier。 | Load Balancing paid add-on + DNS query overage；Spectrum data transfer；Argo data transfer；Spectrum custom TCP/UDP 需要 Enterprise paid add-on。 | 单源站先不用 LB；开启这些 usage-based 产品前设 budget / usage notifications。 |
| [源站保护与流量洪峰](/platform/origin-surge/) | Waiting Room Free/Pro 不可用，Business 有 1 个 basic room；Smart Shield 对所有客户 opt-in；APO Free 站点 `$5/month`、Pro/Business/Enterprise included。 | Waiting Room Advanced；Smart Shield + Argo starting at `$5/mo`；Smart Shield Advanced Enterprise；APO Free 站点付费。 | 只有合法峰值、源站回源压力或 WordPress 性能瓶颈明确时再启用。 |
| [公共网络能力](/platform/public-network-specialties/) | 1.1.1.1 available on all plans 且免费；Radar available on all plans，Radar API free；NTP public service；Google tag gateway free to use，gateway requests 不计入 CDN / WAF / Bot Management 用量或账单。 | Web3 是 add-on / usage-based，IPFS / Ethereum gateways 标注 paid add-on；China Network 是 Enterprise separate subscription；URL Scanner 和 Radar API 按访问凭证、可见性、留存和特定企业能力核对。 | 终端 DNS、趋势研究、时间同步、Web3、中国大陆网络、广告标签分别判断；没有对应场景时不要启用后置产品。 |
| [治理、合规与学习路径](/platform/governance-compliance-learning/) | DMARC Management available on all plans 且适用于 Cloudflare DNS；Registrar available on all plans，按 registry / ICANN 成本收费；Client-side security available on all plans，Free / Pro 有 script monitoring；Learning Paths / Use cases 免费阅读。 | Data Localization Suite 是 Enterprise-only paid add-on；Client-side security 的连接、浏览器标识、页面归因和告警从 Business 起，恶意检测、代码变更检测、内容安全规则和 Logpush jobs 需要 Advanced；Support case、chat、phone、SLA 跟随计划。 | 先配置 SPF / DKIM / DMARC、DNSSEC、域名续费和排障材料；合规与前端供应链高级能力按真实风险购买。 |
| [后置协议与工具](/platform/edge-protocols-utilities/) | Network Error Logging available to all plan types；Resource Tagging available on all plans、public beta、每账号最多 10,000 tags；Agent Memory private beta 当前暂不计费，变更前至少提前 30 天通知；Randomness Beacon / drand 是公开随机数基础设施入口。 | Workers Paid 不会解锁 Version Management、Privacy Gateway、Privacy Proxy 或 Tenant API；Version Management Enterprise-only；Privacy Gateway Enterprise closed beta；Privacy Proxy Enterprise managed service；Tenant API 需要 partner entitlement；MoQ 当前没有普通 self-serve 价格表。 | 默认不启用；资源多了再上 Resource Tagging，网络失败排查再看 NEL，Agent 产品拿到 beta access 后再看 Agent Memory。 |
| [后置开发者能力](/platform/developer-network-additions/) | Agent Lee 当前 Free plan beta；Network settings available on all plans；Network Flow free version 对所有账号开放，限制为 10 routers、25 rules、250 flows/sec/account；Email Routing inbound unlimited；R2 SQL Free 1 GB/month data scanned；Style Guide 免费阅读。 | Artifacts Workers Paid 起，10,000 operations/month 和 1 GB storage/month included；Email Sending 任意收件人需要 Workers Paid，3,000 outbound/month included；R2 SQL Paid 10 GB/month included 后 `$0.0025/GB`；Sandbox SDK 生产部署需要 Workers Paid / Enterprise；True-Client-IP Header Enterprise-only。 | 邮件、代码沙箱、Agent 工作区、R2 数据湖、灰度发布、网络流量观测出现明确需求后再启用；不要把这些产品当普通文档站默认栈。 |
| [SSL/TLS](/platform/ssl-tls/) | Universal SSL、Origin CA、Always Use HTTPS、Automatic HTTPS Rewrites、HSTS、TLS 1.3、Minimum TLS Version、Authenticated Origin Pulls 都可在 Free 使用。 | Advanced Certificate Manager 是付费 add-on；Custom Certificates 从 Business 起；Keyless SSL 是 Enterprise paid add-on；Strict (SSL-Only Origin Pull) 是 Enterprise-only。 | 默认 Full (strict)，Universal SSL 负责边缘，Origin CA 或公开 CA 负责源站。 |
| [DDoS Protection](/platform/ddos/) | 官方说明所有计划都有 standard, unmetered DDoS protection；HTTP DDoS 和 Network-layer DDoS 都覆盖所有计划。Free / Pro / Business 只有 1 个 override，不能自定义 expression。 | Enterprise 可用 Log action；Enterprise + Advanced DDoS 可到 10 个 overrides / rules，并支持 custom expressions、完整 Adaptive DDoS 和高级告警过滤。 | 先把 Web 记录设为 Proxied，隐藏源站 IP；写接口再结合 WAF、Rate Limiting 和 Turnstile。 |
| [Rules](/platform/rules/) | Rules 入口所有计划可用；Free 常见现代规则多为 10 条，Bulk Redirect Rules 15 条、Bulk Redirect Lists 5 个、URL redirects across lists 10,000 条；Snippets 和 Custom Errors 不在 Free。 | Pro/Business/Enterprise 多数现代规则为 25/50/300；Bulk Redirect URL 25,000/50,000/1,000,000；Snippets 和 Custom Errors 从 paid plans 起。 | 新配置优先现代 Rules，不再新写 Page Rules；上线前用 Trace 验证规则顺序。 |
| [WAF](/platform/waf/) | WAF available on all plans；Free 有 5 条 Custom Rules、1 条 Rate Limiting Rule、Free Managed Ruleset、1 个 Custom List / 10,000 items、sampled Security Events。 | Pro/Business/Enterprise 提升 Custom Rules、Rate Limiting、Managed Rules、Attack Score、Security Events 和高级检测能力；Workers Paid 不提升 WAF 配额。 | 登录、后台、API、评论和上传先加最小规则；先观察 Security Events，再逐步 block。 |
| Turnstile | Free 计划最多 20 个 widgets，每个 widget 10 个 hostnames；挑战和验证请求不限量；analytics 最多 7 天；可独立使用，不要求其他 Cloudflare 服务。 | Enterprise widgets 不限量，每个 widget 最多 200 个 hostnames，analytics 最多 30 天，并支持 Ephemeral IDs、Offlabel 和更高组织要求。 | 只放前端组件不够，必须服务端调用 Siteverify；验证结果有有效期且单次使用。 |
| Bots | Free customers 可用 Bot Fight Mode，面向简单 bot、云主机来源和 headless browsers；也包含 Block AI bots、AI Labyrinth、robots.txt 相关能力。 | Pro / Business 可用 Super Bot Fight Mode；Enterprise Bot Management 才有 bot score、JA3/JA4、bot tags、detection IDs、路径级控制等高级能力。 | 先用 WAF、Rate Limiting 和 Turnstile；只有 bot 成本明确时再升级。 |
| API Shield | Free 可用 Endpoint Management 和请求格式校验：100 saved endpoints、5 uploaded definitions、200 kB definition size，rule action 为 Block only。 | Pro 为 250 endpoints / 5 definitions / 500 kB；Business 为 500 / 10 / 2 MB；Enterprise without API Shield 为 500 / 10 / 5 MB 且支持 Log or Block；完整 API Shield 需要 Enterprise 订阅。 | 公开 API、移动端 API、客户数据 API 才优先上；早期先写请求格式、认证、限流和日志。 |
| Security Center / Security Insights | Security Insights 默认自动扫描所有账户和 zone；Free 每 7 天扫描一次，On-demand 表格标注为 Yes。 | Pro / Business 每 3 天，Enterprise 每天；官方同时提示 Business、Enterprise 或 Teams eligible accounts 可手动启动扫描。 | 把它当每周安全巡检，优先处理 DNS-only 暴露、SSL/TLS 弱配置、WAF 和 Access 缺口。 |
| [Zero Trust 与企业网络](/platform/zero-trust-networking/) | Zero Trust Free 为 $0 forever，50 user limit，标准日志最长 24 小时；Tunnel 发布 public hostname 不需要 paid Access plan；Cloudflare One setup 选择 Free plan 仍需 payment details，但不会收费。 | Pay-as-you-go 为 $7/user/month，paid annually，No user limit，标准日志最长 30 天；Contract 为 custom price，标准日志最长 6 个月并可 Logpush 到 SIEM / cloud storage。Cloudflare WAN 是 Enterprise-only。 | 50 人以内团队先用 Free 的 Access / Tunnel / Gateway；后台和内网工具不要裸露公网。没有 Access policy 的 Tunnel published application 仍然公开可访问。 |
| [自有网络与专线](/platform/private-networking/) | Workers VPC 在 Open Beta 期间免费，Available on Free and Paid Workers plans；VPC Services 每账号 1,000 个。Magic Transit、BYOIP、Network Interconnect 都是 Enterprise-only。 | Workers VPC 仍按标准 Workers 请求和 CPU 计费；CNI ports 当前对 Enterprise customers no charge 但无正式 SLA；Magic Transit / BYOIP / CNI 需要合同和网络工程预算。 | 不要把自有 IP、专线和 L3/L4 防护当默认栈；Worker 访问私有服务时才评估 Workers VPC。 |
| Cloudflare Tunnel / Access account limits | Access account limits 包含 500 applications、50 service credentials、50 身份提供方、每个 application 1,000 rules、每个 application 5 domains；Tunnel 每账号 1,000 tunnels、1,000 routes、每 tunnel 25 active replicas。 | Access policies 需要 Access seats；团队身份、设备 posture、Gateway、DLP、长期日志和企业策略按 Zero Trust 计划评估。 | 少建宽泛策略，多建清晰命名的后台、预览和运维入口策略。 |
| Secrets Store | Open beta，账号级密钥中心，兼容 Workers 和 AI Gateway；不同于 per-Worker Variables and Secrets；Cloudflare China Network 不可用。 | 官方当前页面未给出通用按量价格；多团队、多 Worker、多环境和 AI Gateway 自带 key 时再按 beta 状态核对。 | 单 Worker 先用 `wrangler secret`；多项目共享密钥再用 Secrets Store。 |
| [Pages 静态站](/platform/pages/) | 静态资产请求免费且不限量；Free 计划 500 builds/month、1 concurrent build、100 custom domains/project、20,000 files/site、25 MiB/file。 | Pro/Business 提升构建次数、并发构建和文件数；Paid 文件数可到 100,000，Pages Functions 按 Workers 计费。 | 纯静态站和 PR 预览可用 Pages；新 full-stack 项目优先 Workers Static Assets。 |
| [Workers Static Assets](/platform/static-assets/) | 静态资产请求免费且不限量，资产存储无额外费用；20,000 files/Worker version、25 MiB/file。 | 静态资产请求仍免费；Paid 为 100,000 files/Worker version、25 MiB/file；只有请求进入 Worker 脚本时才按 Workers 计费。 | 文档站、官网、SPA 默认走静态资产；API 单独走 Worker。 |
| Workers | 100,000 requests/day；10 ms CPU/invocation。 | Workers Paid 每月最低 $5，见上一节。 | 静态请求不要消耗 Worker；给 CPU 设置上限，避免 runaway bills。 |
| D1 | 5M rows read/day、100k rows written/day、5 GB total storage；Free 单库最大 500 MB，10 个数据库/account。 | Paid 每月 25B rows read、50M rows written、5 GB included，超出按量；Paid 单库最大 10 GB、总存储 1 TB。 | 常查字段建索引；评论、配置、小型 SaaS 很适合，高频计数和大分析不适合。 |
| [KV](/platform/kv/) | 100k reads/day、1k writes/day、1k deletes/day、1k lists/day、1 GB storage。 | Paid 每月 10M reads、1M writes/deletes/lists、1 GB storage included，超出按量。 | 读多写少、最终一致的配置和缓存才用 KV；同一个 key 仍然只有 1 次/秒写入。 |
| [R2](/platform/r2/) | Standard storage 每月 10 GB-month、Class A 1M、Class B 10M；egress 免费；Infrequent Access 不包含免费额度。 | Standard storage $0.015/GB-month，Class A $4.50/million，Class B $0.36/million；Infrequent Access 为 $0.01/GB-month、Class A $9.00/million、Class B $0.90/million、data retrieval $0.01/GB。 | 大文件走 R2，不走 Git、Pages bundle 或 D1；下载次数也是 Class B，冷数据再考虑 IA。 |
| [扩展计算与数据管道](/platform/extended-compute-data/) | Hyperdrive 100,000 database queries/day；Workflows Free 与 Workers 共享 100,000 requests/day、10 ms CPU/invocation、1 GB storage；Pipelines pricing 页列出 Free included usage；R2 Data Catalog 有 1M catalog operations/month、10 GB compaction data/month、1M compaction objects/month。 | Hyperdrive Paid unlimited；Workflows Paid 10M requests/month、30M CPU ms/month、1 GB storage included；Pipelines Paid transforms 50 GB/month、sinks 50 GB/month；Containers 仅 Workers Paid，包含 25 GiB-hours/month、375 vCPU-minutes/month、200 GB-hours/month；R2 Data Catalog Paid 超出后按 catalog operations 和 compaction 计费。 | 有外部数据库、长流程、事件数据湖、容器运行时补位时再上；新项目先用 D1、R2、Queues、Workers。 |
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
| Workers Logs / Real-time logs | Workers Logs 200k log events/day，保留 3 天；Real-time logs 可用 dashboard 或 `wrangler tail`。 | Workers Paid 20M log events/month included，超出 $0.60/million，保留 7 天。 | 生产日志要结构化并采样，不记录密钥、登录凭证和正文隐私。 |
| Workers Trace Events Logpush | Free 不可用。 | Workers Paid 10M requests/month included，超出 $0.05/million。 | 只把需要长期保存的 Worker trace event 推到目的地，并用过滤/采样控制量。 |
| Cloudflare Logpush | 常规 Logpush 在 Free/Pro/Business 不可用；每个 zone 最多 4 个 Logpush jobs。 | Enterprise；非 Enterprise 只有 Workers Trace Events Logpush 可随 Workers Paid 使用。 | Logpush 不能回填历史，job 失败期间日志会丢；必须配置健康告警。 |
| Log Explorer | 当前没有免费版本或试用。 | 作为 Application Services 或 Zero Trust 购买的付费 add-on，按 ingest 和 stored GB 计费；查询不额外计费。 | 需要历史取证和 Cloudflare 内部日志搜索时再买；合同客户可选最长 2 年留存，额外 $0.10/GB/month。 |
| Notifications | Available on all plans；Free 可配置 email-based notifications。 | Professional+ 支持 webhooks；Business+ 支持 PagerDuty。 | 只对 Proxied 域名工作；Budget alerts 和 usage alerts 是提醒，不是自动熔断。 |
| Workers AI | Free 和 Paid 都有 10,000 Neurons/day 免费分配。 | 超过 10,000 Neurons/day 需要 Workers Paid，超出按 $0.011 / 1,000 Neurons。 | 先小模型、小上下文、短输出；所有模型调用先接 AI Gateway。 |
| AI Gateway | 所有计划可用；核心功能免费，包含 dashboard analytics、caching、rate limiting；Persistent logs Free 为 100,000 total logs across all gateways；Spend limits 最多 20 条规则 / gateway。 | Workers Paid persistent logs 为 10M logs/gateway；Logpush 仅 Workers Paid，10M requests/month included，超出 $0.05/million。 | 外部模型、Workers AI、日志、缓存、备用模型和成本控制统一从网关进。 |
| [AI Search](/platform/ai/) | 新实例在 open beta 内免费；Free 有 100 instances/account、100,000 files/instance、20,000 queries/month、500 crawled pages/day。 | Paid 有 5,000 instances/account、1M files/instance 或 hybrid search 500K、unlimited queries、unlimited crawled pages/day。 | 文档站先 Pagefind；需要自然语言搜索或工具调用时再上。Workers AI 和 AI Gateway usage 单独计费。 |
| [媒体与性能](/platform/media-performance/) | Images Free 每月 5,000 unique transformations；Speed available on all plans；Zaraz 每账号每月 1,000,000 free events；Browser Run Free 有 10 minutes/day。 | Images Paid、Stream、Zaraz Paid、Browser Run Paid 都要按实际媒体和浏览器用量估算。 | 大图、附件、视频不要塞进静态包；媒体产品最容易低估操作、播放和转换成本。 |
| Images | Free 可做外部图片 transformations，每月 5,000 unique transformations；超出后新 transformation 返回 `9422`，不会直接收费。 | Paid 前 5,000 transformations included，超出 $0.50/1,000；Images storage $5/100k images/month，delivery $1/100k images。 | 原图放 R2，需要裁剪、格式转换、响应式图再接 Images。 |
| Stream | 没有适合普通文档站的免费存储额度；ingress 和 encoding 免费。 | 存储 $5/1,000 minutes stored，播放 $1/1,000 minutes delivered；Media Transformations 5,000 free operations/month 后 $0.50/1,000。 | 视频产品用 Stream；普通文档不要把视频硬塞进静态站。 |
| Browser Run | 10 minutes/day browser hours；Browser Sessions 3 concurrent browsers；Quick Actions 1 request/10s；`/crawl` Free 限制 5 jobs/day、100 pages/crawl。 | Workers Paid 10 hours/month included，超出 $0.09/hour；Browser Sessions 10 concurrent browsers averaged monthly included，超出 $2/browser；limits 页默认 120 concurrent browsers/account。 | 能用 HTTP fetch 就不用浏览器；截图、PDF、动态页面抓取才用，并且必须关闭 session。 |
| Zaraz | 所有 Cloudflare 用户可用；每个 account 每月 1,000,000 free Zaraz Events；所有 features and tools 可用于所有账号。 | 每额外 1,000,000 Zaraz Events 为 $5/month；未启用 paid 且超过免费额度时，Zaraz 会停用到下个 billing cycle。 | 第三方脚本变多、需要 consent 或 selective loading 时再上；先减少脚本数量。 |

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
- [Load Balancing](https://developers.cloudflare.com/load-balancing/)
- [Load Balancing limitations](https://developers.cloudflare.com/load-balancing/reference/limitations/)
- [Health Checks](https://developers.cloudflare.com/health-checks/)
- [Spectrum Protocols per plan](https://developers.cloudflare.com/spectrum/protocols-per-plan/)
- [Argo Smart Routing](https://developers.cloudflare.com/argo-smart-routing/)
- [Waiting Room plans](https://developers.cloudflare.com/waiting-room/plans/)
- [Smart Shield get started](https://developers.cloudflare.com/smart-shield/get-started/)
- [Automatic Platform Optimization](https://developers.cloudflare.com/automatic-platform-optimization/)
- [APO product page](https://www.cloudflare.com/products/automatic-platform-optimization/)
- [1.1.1.1 overview](https://developers.cloudflare.com/1.1.1.1/)
- [Cloudflare Radar](https://developers.cloudflare.com/radar/)
- [Time Services](https://developers.cloudflare.com/time-services/)
- [Web3](https://developers.cloudflare.com/web3/)
- [Web3 limits](https://developers.cloudflare.com/web3/reference/limits/)
- [Cloudflare China Network](https://developers.cloudflare.com/china-network/)
- [Google tag gateway for advertisers](https://developers.cloudflare.com/google-tag-gateway/)
- [Data Localization Suite](https://developers.cloudflare.com/data-localization/)
- [Data Localization Suite compatibility](https://developers.cloudflare.com/data-localization/compatibility/)
- [Client-side security](https://developers.cloudflare.com/client-side-security/)
- [DMARC Management](https://developers.cloudflare.com/dmarc-management/)
- [Cloudflare Registrar](https://developers.cloudflare.com/registrar/)
- [Contacting Cloudflare Support](https://developers.cloudflare.com/support/contacting-cloudflare-support/)
- [Learning Paths](https://developers.cloudflare.com/learning-paths/llms.txt)
- [Use cases](https://developers.cloudflare.com/use-cases/)
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
- [R2 Data Catalog pricing](https://developers.cloudflare.com/r2/data-catalog/platform/pricing/)
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
- [Web Analytics](https://developers.cloudflare.com/web-analytics/)
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
- [DNS records quota](https://developers.cloudflare.com/dns/manage-dns-records/)
- [Universal SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/)
- [Cache Rules](https://developers.cloudflare.com/cache/how-to/cache-rules/)
- [Default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)
- [DDoS Protection](https://developers.cloudflare.com/ddos-protection/)
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
- [WAF Custom rules](https://developers.cloudflare.com/waf/custom-rules/)
- [WAF Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
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
- [Magic Transit](https://developers.cloudflare.com/magic-transit/)
- [BYOIP](https://developers.cloudflare.com/byoip/)
- [Network Interconnect](https://developers.cloudflare.com/network-interconnect/)
- [Workers VPC Pricing](https://developers.cloudflare.com/workers-vpc/reference/pricing/)
- [Workers VPC Limits](https://developers.cloudflare.com/workers-vpc/reference/limits/)
- [Secrets Store](https://developers.cloudflare.com/secrets-store/)
- [Secrets Store Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)
- [Network Error Logging get started](https://developers.cloudflare.com/network-error-logging/get-started/)
- [Resource Tagging](https://developers.cloudflare.com/resource-tagging/)
- [Resource Tagging limits](https://developers.cloudflare.com/resource-tagging/reference/limits/)
- [Version Management](https://developers.cloudflare.com/version-management/)
- [Privacy Gateway](https://developers.cloudflare.com/privacy-gateway/)
- [Privacy Proxy](https://developers.cloudflare.com/privacy-proxy/)
- [Tenant API](https://developers.cloudflare.com/tenant/)
- [MoQ](https://developers.cloudflare.com/moq/)
- [Agent Memory pricing](https://developers.cloudflare.com/agent-memory/platform/pricing/)
- [Agent Memory limits](https://developers.cloudflare.com/agent-memory/platform/limits/)
- [Agent Lee](https://developers.cloudflare.com/agent-lee/)
- [Artifacts Pricing](https://developers.cloudflare.com/artifacts/platform/pricing/)
- [Artifacts Limits](https://developers.cloudflare.com/artifacts/platform/limits/)
- [Email Service Pricing](https://developers.cloudflare.com/email-service/platform/pricing/)
- [Email Service Limits](https://developers.cloudflare.com/email-service/platform/limits/)
- [Flagship Limits](https://developers.cloudflare.com/flagship/reference/limits/)
- [Network settings](https://developers.cloudflare.com/network/)
- [gRPC connections](https://developers.cloudflare.com/network/grpc-connections/)
- [True-Client-IP Header](https://developers.cloudflare.com/network/true-client-ip-header/)
- [Network Flow free version](https://developers.cloudflare.com/network-flow/network-flow-free/)
- [R2 SQL Pricing](https://developers.cloudflare.com/r2-sql/platform/pricing/)
- [R2 SQL limitations and best practices](https://developers.cloudflare.com/r2-sql/reference/limitations-best-practices/)
- [Sandbox SDK Pricing](https://developers.cloudflare.com/sandbox/platform/pricing/)
- [Sandbox SDK Limits](https://developers.cloudflare.com/sandbox/platform/limits/)
- [Cloudflare docs site stack](https://developers.cloudflare.com/style-guide/how-we-docs/our-site/)
