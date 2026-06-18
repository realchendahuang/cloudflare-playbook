---
title: 免费额度大全
description: Cloudflare 免费额度、5 USD/month Workers Paid、付费入口和成本控制建议。
---

最后核对日期：2026-06-18。Cloudflare 的额度和价格变化很快，本页优先整理免费额度、`$5/month` Workers Paid 和容易误判的付费边界；最终数字以官方价格和限制页面为准。账单类型、预算提醒、发票和按量计费见 [账单与预算](/platform/billing/)。

这页是本站的 Cloudflare 额度事实源，不是附录。首页负责快速判断，这里负责把免费层、`$5/month` Workers Paid、域名计划、单独付费能力和企业能力放到同一套表格里。准备启用任何付费能力前，先回到这页核对对应产品的计量单位和最容易误判的收费点。

先回答读者最关心的三个问题：

1. 一个项目能不能先免费跑起来。
2. `$5/month` Workers Paid 到底买到什么。
3. 哪些东西不归 Workers Paid 管，必须看域名计划、单独付费能力或企业能力。

读这页时不要按产品名背表。先看你要做的项目，再看免费额度、付费入口和成本控制建议。Cloudflare 最适合早期项目的地方，是让静态流量、轻量 API、数据、文件、搜索、安全和后台入口先组合起来，而不是一开始就买完整平台。

如果只想先记一句话：**免费额度不是试用装，它是一套可以组合的起步架构。** 文档站、教程站、小 API、评论、表单、反馈箱、文件下载、小团队后台、AI 搜索原型，都可以先从免费层开始做判断。

## 一屏看懂免费额度

这张表先放最能影响项目决策的免费额度。先按这些数字判断能不能零成本起步，再去看后面的产品级大全。

| 你要做什么 | 免费额度 / 免费边界 | 先用什么 | 什么时候再付费 |
| --- | --- | --- | --- |
| 文档站、官网、博客 | Workers Static Assets / Pages 静态资产请求免费且不限量。 | Workers Static Assets / Pages + Pagefind + Web Analytics。 | 构建次数、文件数、动态接口或搜索体验成为瓶颈。 |
| 小 API、Webhook、评论、表单 | Workers Free 100,000 次动态请求/天，10 ms CPU/次调用。 | Workers + D1 + Turnstile + 最小 WAF / 限流。 | 请求量接近上限、CPU 不够、日志留存不够，或 D1 / KV / Queues 进入付费口径。 |
| 关系数据 | D1 Free 5M 行读取/天、100k 行写入/天、5 GB 总存储。 | D1。 | 写入量、存储、慢查询和索引问题已经真实出现。 |
| 配置和低频缓存 | KV Free 每天 100k 次读取、1k 次写入、1 GB 存储。 | KV。 | 写多、列举多或强一致需求出现时，换 D1 / Durable Objects。 |
| 文件、图片、附件、导出物 | R2 Standard 每月 10 GB 标准存储、100 万次写入类操作、1000 万次读取类操作，出站带宽免费。 | R2 + CDN 缓存。 | 存储、读写操作或冷数据归档开始超过免费层。 |
| 搜索和 AI 试验 | Pagefind 本地索引不打后端；Workers AI 每天 10,000 Neurons；AI Search 新实例公开测试期内免费。 | Pagefind -> AI Gateway -> Workers AI / AI Search。 | 自然语言搜索成为核心体验，且模型用量、网关日志、搜索次数进入瓶颈。 |
| 后台和内网工具 | Zero Trust Free 50 users；Tunnel 可发布公开主机名。 | Access + Tunnel。 | 用户数、审计、网关、数据防泄漏、设备姿态或长期日志成为刚需。 |
| 异步任务和强一致状态 | Queues Free 10,000 次操作/天；Durable Objects Free 100,000 次请求/天、13,000 GB-s/天。 | Queues + Durable Objects。 | 重试、消息保留、实时状态或 DO 运行时长开始决定体验。 |
| 早期日志排障 | Workers Logs Free 每天 200,000 条日志事件，保留 3 天。 | Workers Logs。 | 生产排障、长期留存、外部日志平台或日志量成为刚需。 |
| 成本观察 | Budget alerts 可按美元阈值发邮件提醒按量费用。 | Budget alerts + 用量面板 + 产品侧限流。 | 需要更细产品通知、日志推送、长期审计或企业账单治理。 |

## All the fun：免费额度玩法大全

免费额度最值得用在“先把项目做出来”上，而不是把产品名堆满。下面这张表按项目目标整理，先判断能不能 0 元启动，再判断最可能撞到哪条线。

| 项目目标 | 免费组合 | 免费阶段能验证什么 | 最先撞到 |
| --- | --- | --- | --- |
| 开源文档站 | 静态资产层或 Pages + Pagefind + Web Analytics | 内容组织、SEO、静态搜索、访问趋势。 | 构建次数、文件数、搜索体验。 |
| 教程站轻社区 | 静态资产层 + Twikoo Cloudflare + D1 + Turnstile | 评论互动、轻量审核、读者反馈。 | D1 写入、刷量、日志留存。 |
| 个人官网 / 博客 | DNS + CDN + Universal SSL + Cache + 静态资产层 | 域名接入、HTTPS、全球访问、缓存策略。 | 图片体积、构建次数、缓存误配。 |
| 小 API / Webhook | Workers Free + D1 / KV + WAF 限流 | 接口路由、鉴权、请求处理、数据写入。 | 100,000 次请求/天、10 ms CPU、写入滥用。 |
| 表单 / 反馈箱 | Workers + D1 + Turnstile + Workers Logs | 公开写入口、反垃圾、后台查看。 | D1 写入行数、日志 3 天留存。 |
| 文件上传 / 下载 | R2 + 签名链接 + CDN 缓存 | 附件、导出文件、私有下载、对象权限。 | 存储量、写入类操作、读取类操作。 |
| 小团队后台 | Access + Tunnel + D1 | 身份边界、预览环境、内部工具。 | 50 users、审计日志、设备策略。 |
| AI 搜索原型 | Pagefind + AI Gateway + Workers AI / AI Search | 自然语言问答、模型观测、缓存和限流。 | 模型用量、搜索次数、网关日志。 |
| 实时小应用 | Durable Objects + 连接休眠 + Queues | 房间状态、实时连接、异步后处理。 | DO 请求、运行时长、队列操作。 |

## 免费额度的使用顺序

真正省钱的顺序不是“能免费就都用”，而是先把流量放到最便宜、最稳定的位置。

| 顺序 | 放在哪里 | 为什么 |
| --- | --- | --- |
| 1 | 静态内容进 Workers Static Assets / Pages。 | 静态资产请求免费且不限量，文档站、官网、博客和前端 bundle 应该优先停在这里。 |
| 2 | 动态入口只保留 API、Webhook、评论、表单。 | Free Workers 有请求和 CPU 边界，别让图片、CSS、JS、HTML 都消耗动态额度。 |
| 3 | 关系数据进 D1，配置缓存进 KV。 | D1 适合结构化数据和查询，KV 适合读多写少的缓存和配置。 |
| 4 | 文件、附件、导出物进 R2。 | R2 免出站带宽费，但要看存储量、写入类操作和读取类操作。 |
| 5 | 强一致状态进 Durable Objects，慢任务进 Queues。 | 房间、会话、限流器和后台任务不要塞进普通请求路径。 |
| 6 | 公开写入口加 Turnstile、WAF、限流。 | 免费额度最怕被刷，安全边界要和功能一起上线。 |
| 7 | AI 先用 Pagefind、AI Gateway、Workers AI 小模型验证。 | 先证明搜索体验有价值，再扩到 AI Search、Vectorize 或更贵模型。 |

## 免费额度先读规则

Cloudflare 的免费层很适合早期项目起步，但它不是“所有产品无限免费”。读数字之前，先把下面几条当成使用规则。

| 规则 | 直接影响 |
| --- | --- |
| 静态资产命中才免费且不限量。 | Workers Static Assets / Pages 的静态资产请求免费；SSR、Functions、整站先跑 Worker 或 API 路径进入 Worker 后，就按 Workers 请求和 CPU 计算。 |
| Free 多数是日额度，Paid 多数是月额度。 | Workers、D1、KV、Queues、Workers AI 等免费额度通常按 UTC 0 点重置；Workers Paid 的已包含用量按月度订阅周期计算。 |
| `$5/month` Workers Paid 只放大开发者平台。 | 它不是 Cloudflare Pro，不会自动提升 WAF、Bot、证书、规则、缓存规则、负载均衡或企业网络能力。 |
| Budget alerts 只是邮件提醒。 | 它不会暂停服务、不会阻止按量产品继续计费，也不是账单硬封顶。 |
| 存储产品要同时看容量和操作。 | R2 免出站带宽费，但存储量、写入类操作和读取类操作会计费；D1 读的是扫描行数，KV 写入和列举很容易先撞限制。 |
| AI 免费额度适合验证，不适合无约束开放。 | Workers AI、AI Gateway、AI Search、Vectorize 都要配合限流、缓存、日志和模型选择。 |

## 先看四条

先别急着看所有数字。先按这四类额度判断：

| 优先级 | 额度类型 | 代表产品 | 实践判断 |
| --- | --- | --- | --- |
| 1 | 默认就该用的免费能力 | DNS、CDN、Universal SSL、DDoS、Workers Static Assets、Web Analytics。 | 这些是把项目放上 Cloudflare 的基础收益，能降低源站压力和运维复杂度。 |
| 2 | 能验证产品的免费能力 | Workers Free、D1、KV、R2、Queues、Durable Objects、Turnstile、Access、Workers AI、AI Gateway、AI Search。 | 适合把文档站、小 API、评论、表单、后台和 AI 试验先跑起来。 |
| 3 | 值得为 `$5/month` 升级的能力 | Workers Paid、Pages Functions、Workers Logs、Trace Events Logpush、Containers、Email Sending。 | 当请求、CPU、日志、后台任务或开发者平台限制成为真实瓶颈，再升级。 |
| 4 | 不能靠 Workers Paid 解决的能力 | Pro / Business / Enterprise 域名计划、Images Paid、Stream、Load Balancing、Argo、Magic Transit、Logpush、Bot Management。 | 这些要按域名计划、单独付费能力、媒体用量、网络合同或企业安全需求单独评估。 |

如果只记一条：**免费额度先服务架构顺序，不是用来堆产品名。** 静态内容留在静态层，文件进 R2，关系数据进 D1，配置缓存进 KV，强一致状态进 Durable Objects，耗时任务进 Queues，高风险写操作加 Turnstile。

## 核心额度速查

下面这张表先解决“一个项目到底能免费用多少、`$5 Workers Paid` 又买到多少”的问题。它只放最常用能力；更细的媒体、日志、网络、企业产品和低频产品边界看后面的产品级大全。

| 产品 / 能力 | Free / 免费边界 | Workers Paid / 付费边界 | 实践判断 |
| --- | --- | --- | --- |
| DNS | Free/Pro/Business 不对 DNS 查询收费；新 Free zone 为 200 条记录/域名，旧 Free zone 为 1,000 条。 | Workers Paid 不改变 DNS 配额；Enterprise 把 DNS 查询量作为报价输入之一。 | 域名先接 Cloudflare，Web 记录代理，邮件、验证和第三方服务记录保持不代理。 |
| CDN / Cache | CDN 可用于所有计划；Free 有 10 条缓存规则，最大可缓存文件 512 MB。 | Workers Paid 不提升缓存规则；更高规则数、边缘缓存时间和清缓存能力看域名计划。 | 静态 hash 资源长缓存，HTML 谨慎缓存；不要让静态资源进 Worker。 |
| SSL/TLS | Universal SSL、Origin CA、Always Use HTTPS、HSTS、TLS 1.3、Authenticated Origin Pulls 可在 Free 使用。 | Workers Paid 不提升证书能力；Advanced Certificate Manager、Custom Certificates、Keyless SSL 单独看计划。 | 默认 Full (strict)，边缘用 Universal SSL，源站用 Origin CA 或公开 CA。 |
| DDoS | 所有计划都有标准且不限量的 DDoS 防护，HTTP DDoS 和网络层 DDoS 都覆盖。 | Workers Paid 不提升 DDoS 规则；高级 DDoS、更多覆写和仅记录动作看企业能力或单独付费能力。 | 先把 Web 入口设为代理，隐藏源站 IP；API 再叠 WAF、限流、Turnstile。 |
| WAF / 限流 | WAF 可用于所有计划；Free 有 5 条自定义规则、1 条限流规则和免费托管规则集。 | Workers Paid 不提升 WAF 配额；更多规则、事件历史和高级检测看 Pro / Business / Enterprise。 | 登录、后台、评论、上传先写最小规则；先观察安全事件，再逐步拦截。 |
| Turnstile | Free 最多 20 个小组件，每个小组件 10 个域名；挑战和验证请求不限量。 | Enterprise 小组件不限量，每个小组件最多 200 个域名。 | 表单、登录、评论、注册都先用 Turnstile；服务端必须调用 Siteverify。 |
| Zero Trust / Access / Tunnel | Zero Trust Free 为永久 $0，50 个用户限制；Tunnel 可发布公开主机名。 | Workers Paid 不提升用户席位；按用户付费或合同计划看用户数、日志、网关和设备策略。 | 50 人以内后台、预览环境、内网工具先用 Access + Tunnel；没有 Access policy 的 Tunnel 公开主机名仍然公开。 |
| Web Analytics | 免费、隐私优先；代理站点不限，非代理站点 10 个。 | Workers Paid 不提升 Web Analytics 规则；规则数量看域名计划。 | 文档站和官网先开它，不急着自建复杂埋点。 |
| Workers 动态请求 | 100,000 次/天，UTC 0 点重置。 | 每账号每月最低 `$5`；含每月 1000 万次请求，超出 `$0.30/million`。 | 评论、Webhook、小 API 免费可起步；公开 API 稳定有人用后再升。 |
| Workers CPU | 10 ms/次调用。 | 含每月 3000 万 CPU 毫秒，超出 `$0.02/million CPU ms`；单次默认 30s，可设到 5min。 | SSR、AI 前处理、批任务要看 CPU，不只看请求数。 |
| 静态资产请求 | Workers Static Assets / Pages 静态资产请求免费且不限量。 | 静态资产请求仍免费且不限量。 | 文档、官网、博客主流量要停在静态资产层。 |
| 静态资产文件 | 每个 Worker version 20,000 个文件，单文件 25 MiB。 | 每个 Worker version 100,000 个文件，单文件 25 MiB。 | 大附件、图片原图和导出物放 R2。 |
| Pages | 每月 500 次构建、1 个并发构建、每项目 100 个自定义域名、每站 20,000 个文件、单文件 25 MiB。 | Pro/Business 提升构建、并发和文件数；Functions 按 Workers 口径。 | 纯静态站和 PR 预览很顺；复杂 Worker 能力优先 Static Assets。 |
| D1 | 5M 行读取/天、100k 行写入/天、5 GB 总存储。 | 含 25B 行读取/月、50M 行写入/月、5 GB，超出按量。 | 评论、表单、小后台适合；索引比“换产品”更重要。 |
| KV | 每天 100k 次读取、1k 次写入、1k 次删除、1k 次列举，1 GB 存储。 | 每月 10M 次读取、1M 次写入/删除/列举、1 GB 已包含。 | 读多写少配置和缓存适合；不要当强一致数据库。 |
| R2 Standard | 每月 10 GB 标准存储、1M 写入类操作、10M 读取类操作，出站带宽免费。 | 超出按存储量、写入类操作和读取类操作计费；低频访问存储没有免费额度。 | 文件对象优先 R2，但公开下载热点要看读取类操作。 |
| Queues | 10,000 次操作/天，消息保留 24 小时。 | 含 1M 次操作/月，超出 `$0.40/million`；默认保留 4 天，可配到 14 天。 | 邮件、通知、导入和后处理适合；简单同步接口不用先上队列。 |
| Durable Objects | 可用 SQLite-backed DO；100,000 次请求/天、13,000 GB-s/天。 | 含 1M 次请求/月、400,000 GB-s/月，超出按量。 | 只放强一致房间、会话、限流器；实时连接要能休眠。 |
| Workers AI | Free 和 Paid 都有每天 10,000 Neurons 免费分配。 | 超过每日免费分配需要 Workers Paid，之后 `$0.011/1,000 Neurons`。 | AI 调用先接 AI Gateway，小模型和短输出优先。 |
| AI Gateway | 所有计划可用，核心功能免费；Free 持久日志为所有网关合计 100,000 条；Spend limits 可按模型、供应商或标签做成本预算并返回 `429`。 | Workers Paid 为每个网关 10M 条日志；Logpush 仅 Workers Paid。 | 外部模型、Workers AI、缓存、限流、日志和成本控制统一从网关进。 |
| AI Search | 新实例在公开测试期内免费；Free 有每账号 100 个实例、每实例 100,000 个文件、每月 20,000 次查询、每天 500 个爬取页面；Workers AI 和 AI Gateway 另算。 | Paid 有每账号 5,000 个实例、每实例 1M 个文件或混合搜索 500K、查询不限量、每天爬取页面不限量。 | 文档站先 Pagefind；需要自然语言搜索或工具调用时再上。 |
| Vectorize | 每月 30M 查询向量维度、5M 存储向量维度。 | 每月 50M 查询向量维度、10M 存储向量维度已包含。 | 文档少时先 Pagefind；自然语言搜索确定有价值后再上。 |
| Budget alerts / Usage notifications | Budget alerts 面向按量付费账号，用邮件提醒按量费用；usage notifications 按产品阈值提醒。 | Budget alerts 不是硬封顶；usage notifications 需要 Professional plans or higher。 | 付费前先开提醒，但真正的成本控制仍是静态优先、限流、队列、配额和权限。 |

## 先看 $5 Workers Paid

Workers Paid 是很多 Cloudflare 开发者项目的第一笔固定支出，官方价格页写的是每个账户每月最低 **$5 USD**。它不是 Cloudflare Pro，也不是 Pages Pro；它主要扩展 Workers、Pages Functions、KV、Hyperdrive、Durable Objects 等开发者平台能力。

这节的口径要看清楚：

- Workers Paid 是账号级订阅，已包含用量按月计算。
- Pages Functions 按 Workers 计费，额度和 Workers 放在同一套口径里。
- Workers 平台不额外收数据传输或吞吐费用。
- Workers Static Assets 的静态资产请求免费且不限量，只有进入 Worker 脚本的动态请求才按 Workers 计费。
- Workers Paid 包含月度已包含用量，不是支出封顶；超过已包含用量后仍会按请求、CPU、日志、存储或操作量继续计费。

| 能力 | Free | Workers Paid / Standard |
| --- | --- | --- |
| Worker 请求 | 100,000 次/天。 | 含每月 1000 万次请求，超出 $0.30/million。 |
| CPU | 10 ms/次调用。 | 含每月 3000 万 CPU 毫秒，超出 $0.02/million CPU ms；单次默认 30s，可设到 5min。 |
| 静态资产请求 | 免费且不限量。 | 免费且不限量。 |
| 内存 | 128 MB。 | 128 MB。 |
| 子请求 | 每个请求 50 次。 | 默认每个请求 10,000 次，可通过配置提高，最高可到 10M。 |
| Worker 数量 | 100。 | 500。 |
| 定时任务触发器 | 每账号 5 个。 | 每账号 250 个。 |
| Worker 压缩后大小 | 3 MB。 | 10 MB。 |
| 静态资产文件数 | 每个 Worker version 20,000 个文件。 | 每个 Worker version 100,000 个文件。 |
| Static Asset 单文件 | 25 MiB。 | 25 MiB。 |
| Workers Logs | 每天 200,000 条日志事件，保留 3 天。 | 每月 20M 条日志事件已包含，超出 $0.60/million，保留 7 天。 |
| Workers Trace Events Logpush | 不可用。 | 每月 10M 次请求已包含，超出 $0.05/million。 |
| Analytics Engine | 每天 100,000 个数据点、10,000 次读取查询。 | 每月 10M 个数据点已包含，超出 $0.25/million；每月 1M 次读取查询已包含，超出 $1/million。 |
| Workers Builds | 每月 3,000 构建分钟，1 个并发构建。 | 每月 6,000 构建分钟，超出 $0.005/min，6 个并发构建。 |
| [Containers](/platform/extended-compute-data/) | 不可用。 | 包含 25 GiB-hours/month、375 vCPU-minutes/month、200 GB-hours/month，超出按量。 |
| Artifacts | 不可用。 | 含每月 10,000 次操作和 1 GB 存储；超出 `$0.15/1,000 次操作`、`$0.50/GB-mo`。 |
| Email Sending | 向任意收件人发送不可用；已验证收件地址免费。 | 每月 3,000 封出站邮件已包含，超出 `$0.35/1,000 emails`；Email Routing 入站不限量。 |
| R2 SQL | 每月 1 GB 扫描数据量已包含。 | 每月 10 GB 扫描数据量已包含，超出 `$0.0025/GB`；R2 存储、R2 操作和 R2 Data Catalog 另算。 |
| Sandbox SDK | 生产能力受限；Containers 不可用。 | 生产部署需要 Workers Paid 或 Enterprise；费用继承 Containers，并叠加 Workers、Durable Objects、可选 Workers Logs。 |

## $5 Workers Paid 到底买什么

把 `$5/month` 当成“动态能力和工程化能力的底座”更准确。

| 它买到的东西 | 具体含义 | 实践判断 |
| --- | --- | --- |
| 动态请求月度包 | 每月 1000 万次 Worker 请求已包含，超出按百万请求计费。 | 评论、Webhook、API、搜索代理、后台接口开始稳定使用时再升。 |
| CPU 月度包 | 每月 3000 万 CPU 毫秒已包含，超出按 CPU ms 计费；单次 CPU 默认 30s，可配置到 5min。 | SSR、数据处理、签名上传、AI 代理和批任务要看 CPU，不只看请求数。 |
| 更大的平台限制 | Worker 数量、定时任务触发器、子请求、Worker 包大小、静态资产文件数等都提高。 | 多项目、多环境、多定时任务时价值明显。 |
| 开发者平台联动 | Pages Functions、KV、D1、Queues、Durable Objects、Hyperdrive 等按 Workers Paid 口径进入更高额度或付费能力。 | 一旦 Worker 不只是静态站旁边的小 API，就应该看这一层。 |
| 可观测性 | Workers Logs 月度已包含用量、Trace Events Logpush 等。 | 生产排障需要日志留存、过滤、采样和外部目的地时再开。 |
| 新计算能力入口 | Containers、Artifacts、任意收件人 Email Sending、Sandbox SDK 生产能力等。 | 这些不是文档站默认需求，只有业务明确时才进来。 |

它没有买到的东西：

| 不包含 | 为什么要分开看 |
| --- | --- |
| Cloudflare Pro / Business 的域名权益 | WAF 规则数量、缓存规则、上传体积、部分安全能力跟域名计划相关。 |
| Enterprise 网络能力 | Magic Transit、BYOIP、Network Interconnect、很多日志和 Bot 能力仍然是 Enterprise 或合同产品。 |
| 媒体和对象存储全部成本 | R2、Images、Stream、Browser Run、Zaraz 等有自己的存储、操作、事件或播放计费维度。 |
| 预算硬封顶 | Budget alerts 只提醒，不会自动暂停服务或停止所有按量计费。 |

## 产品级免费额度大全

这一节是更完整的查表入口。它包含一些不会出现在首页核心表里的后置产品、企业能力、媒体产品、日志产品和低频工具；不用逐行背，只在准备启用某个产品前回来核对。

| 产品 | 免费额度 / 免费边界 | 付费入口 | 成本控制建议 |
| --- | --- | --- | --- |
| [DNS](/platform/dns/) | Free/Pro/Business 不对 DNS 查询收费，且不限制 DNS 查询；新 Free zone 为每个域名 200 条记录，旧 Free zone 为 1,000 条。 | Enterprise 把每月 DNS 查询量作为报价输入之一；记录数量上限可申请提高。 | 域名统一接入 Cloudflare，Web 入口代理，邮件和验证记录保持不代理。 |
| [Cache / CDN](/platform/cache/) | Cache / CDN 可用于所有计划；Free 有 10 条缓存规则，边缘缓存时间最小 2 小时，最大可缓存文件 512 MB，按 URL 清缓存 800 URLs/s。 | Pro/Business/Enterprise 提升规则数量、边缘缓存时间最小值、清缓存限制和企业拓扑；Cache Reserve 是按量付费能力，存储 $0.015/GB-month、写入类操作 $4.50/million、读取类操作 $0.36/million。 | 静态 hash 资源长缓存；HTML 谨慎缓存；用户态绕过；大文件和媒体用 R2/Images/Stream。 |
| [流量调度与四层入口](/platform/traffic-routing/) | 健康检查 Free 不可用，Pro 10 个、Business 50 个、Enterprise 1,000 个；Load Balancing 已包含前 500K 次 DNS 查询；Argo 已包含前 1 GB；Spectrum 没有免费层。 | Load Balancing 是单独付费能力并可能产生 DNS 查询超额；Spectrum 和 Argo 按流量计费；Spectrum 自定义 TCP/UDP 需要 Enterprise 单独付费能力。 | 单源站先不用负载均衡；开启这些按量产品前设预算和用量提醒。 |
| [源站保护与流量洪峰](/platform/origin-surge/) | Waiting Room Free/Pro 不可用，Business 有 1 个基础等待室；Smart Shield 对所有客户可选择启用；APO 在 Free 站点为 `$5/month`，Pro/Business/Enterprise 已包含。 | Waiting Room Advanced；Smart Shield + Argo 从 `$5/mo` 起；Smart Shield Advanced 看 Enterprise；APO Free 站点付费。 | 只有合法峰值、源站回源压力或 WordPress 性能瓶颈明确时再启用。 |
| [公共网络能力](/platform/public-network-specialties/) | 1.1.1.1 所有计划可用且免费；Radar 所有计划可用，Radar API 免费；NTP 是公开时间服务；Google tag gateway 免费使用，gateway 请求不计入 CDN / WAF / Bot Management 用量或账单。 | Web3 是单独付费或按量付费能力，IPFS / Ethereum gateways 标注为付费附加能力；China Network 是 Enterprise 单独订阅；URL Scanner 和 Radar API 按访问凭证、可见性、留存和特定企业能力核对。 | 终端 DNS、趋势研究、时间同步、Web3、中国大陆网络、广告标签分别判断；没有对应场景时不要启用后置产品。 |
| [治理、合规与学习路径](/platform/governance-compliance-learning/) | DMARC Management 所有计划可用且适用于 Cloudflare DNS；Registrar 所有计划可用，按 registry / ICANN 成本收费；客户端脚本安全所有计划可用，Free / Pro 有脚本监控；Learning Paths / Use cases 免费阅读。 | Data Localization Suite 是 Enterprise-only 付费附加能力；客户端脚本安全的连接、浏览器标识、页面归因和告警从 Business 起，恶意检测、代码变更检测、内容安全规则和 Logpush jobs 需要 Advanced；Support case、chat、phone、SLA 跟随计划。 | 先配置 SPF / DKIM / DMARC、DNSSEC、域名续费和排障材料；合规与前端供应链高级能力按真实风险购买。 |
| [后置协议与工具](/platform/edge-protocols-utilities/) | Network Error Logging 所有计划可用；Resource Tagging 所有计划可用、公开测试期、每账号最多 10,000 个标签；Agent Memory 私有测试期当前暂不计费，变更前至少提前 30 天通知；Randomness Beacon / drand 是公开随机数基础设施入口。 | Workers Paid 不会解锁 Version Management、Privacy Gateway、Privacy Proxy 或 Tenant API；Version Management Enterprise-only；Privacy Gateway 企业闭测；Privacy Proxy 企业托管服务；Tenant API 需要 partner entitlement；MoQ 当前没有普通自助价格表。 | 默认不启用；资源多了再上 Resource Tagging，网络失败排查再看 NEL，Agent 产品拿到测试资格后再看 Agent Memory。 |
| [后置开发者能力](/platform/developer-network-additions/) | Agent Lee 当前 Free plan beta；Network settings 所有计划可用；Network Flow 免费版对所有账号开放，限制为 10 个路由器、25 条规则、每账号每秒 250 个流；Email Routing 入站不限量；R2 SQL Free 每月 1 GB 扫描数据量；Style Guide 免费阅读。 | Artifacts 从 Workers Paid 起，含每月 10,000 次操作和 1 GB 存储；Email Sending 向任意收件人发送需要 Workers Paid，含每月 3,000 封出站邮件；R2 SQL Paid 每月 10 GB 已包含，超出 `$0.0025/GB`；Sandbox SDK 生产部署需要 Workers Paid / Enterprise；True-Client-IP Header Enterprise-only。 | 邮件、代码沙箱、构建产物管理、R2 数据湖、灰度发布、网络流量观测出现明确需求后再启用；不要把这些产品当普通文档站默认栈。 |
| [SSL/TLS](/platform/ssl-tls/) | Universal SSL、Origin CA、Always Use HTTPS、Automatic HTTPS Rewrites、HSTS、TLS 1.3、Minimum TLS Version、Authenticated Origin Pulls 都可在 Free 使用。 | Advanced Certificate Manager 是付费附加能力；Custom Certificates 从 Business 起；Keyless SSL 是 Enterprise 付费附加能力；Strict (SSL-Only Origin Pull) 是 Enterprise-only。 | 默认 Full (strict)，Universal SSL 负责边缘，Origin CA 或公开 CA 负责源站。 |
| [DDoS Protection](/platform/ddos/) | 官方说明所有计划都有标准且不限量的 DDoS 防护；HTTP DDoS 和网络层 DDoS 都覆盖所有计划。Free / Pro / Business 只有 1 个覆写，不能自定义表达式。 | Enterprise 可用仅记录动作；Enterprise + Advanced DDoS 可到 10 个覆写 / 规则，并支持自定义表达式、完整 Adaptive DDoS 和高级告警过滤。 | 先把 Web 记录设为代理，隐藏源站 IP；写接口再结合 WAF、限流和 Turnstile。 |
| [Rules](/platform/rules/) | Rules 入口所有计划可用；Free 常见现代规则多为 10 条，批量跳转规则 15 条、批量跳转列表 5 个、跨列表 URL 跳转 10,000 条；Snippets 和 Custom Errors 不在 Free。 | Pro/Business/Enterprise 多数现代规则为 25/50/300；Bulk Redirect URL 25,000/50,000/1,000,000；Snippets 和 Custom Errors 从 paid plans 起。 | 新配置优先现代 Rules，不再新写 Page Rules；上线前用 Trace 验证规则顺序。 |
| [WAF](/platform/waf/) | WAF 所有计划可用；Free 有 5 条自定义规则、1 条限流规则、免费托管规则集、1 个自定义列表 / 10,000 项、抽样安全事件。 | Pro/Business/Enterprise 提升自定义规则、限流、托管规则、攻击评分、安全事件和高级检测能力；Workers Paid 不提升 WAF 配额。 | 登录、后台、API、评论和上传先加最小规则；先观察安全事件，再逐步拦截。 |
| Turnstile | Free 计划最多 20 个小组件，每个小组件 10 个域名；挑战和验证请求不限量；统计最多 7 天；可独立使用，不要求其他 Cloudflare 服务。 | Enterprise 小组件不限量，每个小组件最多 200 个域名，统计最多 30 天，并支持 Ephemeral IDs、Offlabel 和更高组织要求。 | 只放前端组件不够，必须服务端调用 Siteverify；验证结果有有效期且单次使用。 |
| Bots | Free customers 可用 Bot Fight Mode，面向简单 bot、云主机来源和 headless browsers；也包含 Block AI bots、AI Labyrinth、robots.txt 相关能力。 | Pro / Business 可用 Super Bot Fight Mode；Enterprise Bot Management 才有 bot score、JA3/JA4、bot tags、detection IDs、路径级控制等高级能力。 | 先用 WAF、限流和 Turnstile；只有 bot 成本明确时再升级。 |
| API Shield | Free 可用 API 端点管理和请求格式校验：100 个已保存端点、5 个已上传定义、200 kB 定义大小，规则动作为 Block only。 | Pro 为 250 个端点 / 5 个定义 / 500 kB；Business 为 500 / 10 / 2 MB；Enterprise without API Shield 为 500 / 10 / 5 MB 且支持 Log or Block；完整 API Shield 需要 Enterprise 订阅。 | 公开 API、移动端 API、客户数据 API 才优先上；早期先写请求格式、认证、限流和日志。 |
| Security Center / Security Insights | Security Insights 默认自动扫描所有账户和 zone；Free 每 7 天扫描一次，On-demand 表格标注为 Yes。 | Pro / Business 每 3 天，Enterprise 每天；官方同时提示 Business、Enterprise 或 Teams eligible accounts 可手动启动扫描。 | 把它当每周安全巡检，优先处理 DNS-only 暴露、SSL/TLS 弱配置、WAF 和 Access 缺口。 |
| [Zero Trust 与企业网络](/platform/zero-trust-networking/) | Zero Trust Free 为永久 $0，50 个用户限制，标准日志最长 24 小时；Tunnel 发布公开主机名不需要 paid Access plan；Cloudflare One setup 选择 Free plan 仍需 payment details，但不会收费。 | Pay-as-you-go 为 $7/user/month，按年付费，用户数不设上限，标准日志最长 30 天；合同价为自定义价格，标准日志最长 6 个月并可 Logpush 到外部日志平台或云存储。Cloudflare WAN 是 Enterprise-only。 | 50 人以内团队先用 Free 的 Access / Tunnel / Gateway；后台和内网工具不要裸露公网。没有 Access policy 的 Tunnel published application 仍然公开可访问。 |
| [自有网络与专线](/platform/private-networking/) | Workers VPC 在公开测试期内免费，可用于 Free 和 Paid Workers plans；VPC Services 每账号 1,000 个。Magic Transit、BYOIP、Network Interconnect 都是 Enterprise-only。 | Workers VPC 仍按标准 Workers 请求和 CPU 计费；CNI ports 当前对 Enterprise customers no charge 但无正式 SLA；Magic Transit / BYOIP / CNI 需要合同和网络工程预算。 | 不要把自有 IP、专线和 L3/L4 防护当默认栈；Worker 访问私有服务时才评估 Workers VPC。 |
| Cloudflare Tunnel / Access account limits | Access 账号限制包含 500 个应用、50 个服务凭证、50 个身份提供方、每个应用 1,000 条规则、每个应用 5 个域名；Tunnel 每账号 1,000 个 tunnel、1,000 条路由、每个 tunnel 25 个活跃副本。 | Access policies 需要 Access seats；团队身份、设备姿态、Gateway、数据防泄漏、长期日志和企业策略按 Zero Trust 计划评估。 | 少建宽泛策略，多建清晰命名的后台、预览和运维入口策略。 |
| Secrets Store | 公开测试期，账号级密钥中心，兼容 Workers 和 AI Gateway；不同于每个 Worker 单独配置的 Variables and Secrets；Cloudflare China Network 不可用。 | 官方当前页面未给出通用按量价格；多团队、多 Worker、多环境和 AI Gateway 自带 key 时再按测试状态核对。 | 单 Worker 先用 `wrangler secret`；多项目共享密钥再用 Secrets Store。 |
| [Pages 静态站](/platform/pages/) | 静态资产请求免费且不限量；Free 计划每月 500 次构建、1 个并发构建、每项目 100 个自定义域名、每站 20,000 个文件、单文件 25 MiB。 | Pro/Business 提升构建次数、并发构建和文件数；Paid 文件数可到 100,000，Pages Functions 按 Workers 计费。 | 纯静态站和 PR 预览可用 Pages；新 full-stack 项目优先 Workers Static Assets。 |
| [Workers Static Assets](/platform/static-assets/) | 静态资产请求免费且不限量，资产存储无额外费用；每个 Worker version 20,000 个文件、单文件 25 MiB。 | 静态资产请求仍免费；Paid 为每个 Worker version 100,000 个文件、单文件 25 MiB；只有请求进入 Worker 脚本时才按 Workers 计费。 | 文档站、官网、SPA 默认走静态资产；API 单独走 Worker。 |
| Workers | 100,000 次请求/天；10 ms CPU/次调用。 | Workers Paid 每月最低 $5，见上一节。 | 静态请求不要消耗 Worker；给 CPU 设置上限，避免意外账单。 |
| D1 | 5M 行读取/天、100k 行写入/天、5 GB 总存储；Free 单库最大 500 MB，10 个数据库/account。 | Paid 每月含 25B 行读取、50M 行写入、5 GB，超出按量；Paid 单库最大 10 GB、总存储 1 TB。 | 常查字段建索引；评论、配置、小型 SaaS 很适合，高频计数和大分析不适合。 |
| [KV](/platform/kv/) | 每天 100k 次读取、1k 次写入、1k 次删除、1k 次列举，1 GB 存储。 | Paid 每月 10M 次读取、1M 次写入/删除/列举、1 GB 存储已包含，超出按量。 | 读多写少、最终一致的配置和缓存才用 KV；同一个 key 仍然只有 1 次/秒写入。 |
| [R2](/platform/r2/) | 标准存储每月 10 GB、写入类操作 1M、读取类操作 10M；出站带宽免费；低频访问存储不包含免费额度。 | 标准存储 $0.015/GB-month，写入类操作 $4.50/million，读取类操作 $0.36/million；低频访问存储为 $0.01/GB-month、写入类操作 $9.00/million、读取类操作 $0.90/million、数据取回 $0.01/GB。 | 大文件走 R2，不走 Git、Pages bundle 或 D1；下载次数也会计入读取类操作，冷数据再考虑低频访问存储。 |
| [扩展计算与数据管道](/platform/extended-compute-data/) | Hyperdrive 每天 100,000 次数据库查询；Workflows Free 与 Workers 共享 100,000 次请求/天、10 ms CPU/次调用、1 GB 存储；Pipelines pricing 页列出免费已包含用量；R2 Data Catalog 有每月 1M 目录操作、10 GB 压缩数据、1M 压缩对象。 | Hyperdrive Paid 查询不限量；Workflows Paid 含每月 10M 次请求、30M CPU ms、1 GB 存储；Pipelines Paid transforms 50 GB/month、sinks 50 GB/month；Containers 仅 Workers Paid，包含 25 GiB-hours/month、375 vCPU-minutes/month、200 GB-hours/month；R2 Data Catalog Paid 超出后按目录操作和压缩计费。 | 有外部数据库、长流程、事件数据湖、容器运行时补位时再上；新项目先用 D1、R2、Queues、Workers。 |
| Hyperdrive account limits | Free 最多 10 个数据库配置、每个配置约 20 个源站连接；Paid 最多 25 个数据库配置、每个配置约 100 个源站连接；查询最长 60 秒，缓存查询响应最大 50 MB。 | limit increase 需要按官方表单或支持渠道申请。 | 查询缓存命中也计入 query；长事务和慢查询仍会压垮源数据库。 |
| [Queues](/platform/queues/) | 含 10,000 次操作/天；消息保留 24 小时。 | Paid 含 1M 次操作/月，超出 $0.40/million；保留期默认 4 天，可配到 14 天。 | 小消息成功处理通常是 3 次操作；邮件、转码、爬取、通知适合，简单同步接口不要先上队列。 |
| [Durable Objects](/platform/durable-objects/) | Free/Paid 都可用；Free 只支持 SQLite-backed DO；100,000 次请求/天、13,000 GB-s/天。 | Paid 含 1M 次请求/月，超出 $0.15/million；含 400,000 GB-s/月，超出 $12.50/million GB-s。 | 只放必须强一致的房间、会话、限流器；实时连接要能休眠。 |
| [Durable Objects SQLite storage](/platform/durable-objects/) | Free 每天读 5M 行、写 100k 行、总存储 5 GB。 | Paid 每月读 25B 行已包含、写 50M 行已包含、SQL 存储数据 5 GB 存储量已包含，超出按量。 | 新 DO class 优先 SQLite-backed；不要拿 DO 承担全站分析库。 |
| [Realtime](/platform/realtime/) | RealtimeKit 当前 Beta 免费；Realtime SFU / TURN 共用每月 1,000 GB 免费出站额度；客户端到 Cloudflare 免费，STUN 免费且不限量。 | RealtimeKit GA 后按参与者分钟和导出分钟计费；Realtime SFU / TURN 超出后 `$0.05/GB` 出站流量。 | 文本实时先 Durable Objects；音视频会议优先 RealtimeKit；自定义 WebRTC 才看 SFU。 |
| [平台化与多租户](/platform/platforms-saas/) | Cloudflare for SaaS 在 Free/Pro/Business 包含 100 个客户自定义主机名，最高 50,000；Dynamic Workers 仅 Workers Paid 可用。 | Cloudflare for SaaS 额外 hostname `$0.10`；Workers for Platforms `$25/month` 起；Dynamic Workers 超出 unique worker、请求和 CPU 后按量。 | 先确认是真“客户域名”或“用户代码运行”，不要把普通多租户 SaaS 提前升级成平台产品。 |
| Vectorize | Pricing 页列出每月 30M 查询向量维度、5M 存储向量维度。 | Paid 每月 50M 查询向量维度已包含，10M 存储向量维度已包含，超出按维度计费。 | 文档少时先 Pagefind；语义搜索确定有价值后再上。 |
| Analytics Engine | 每天 100k 个数据点、10k 次读取查询；官方说明当前价格信息用于预估。 | Paid 每月 10M 个数据点已包含，超出 $0.25/million；每月 1M 次读取查询已包含，超出 $1/million。 | 记录高基数事件和指标；不要替代事务数据库。 |
| GraphQL Analytics API | 默认用户限制为 5 分钟 300 个 GraphQL 查询；zone-scoped query 最多 10 个 zones，account-scoped query 只能 1 个 account。 | 节点级可用字段、历史范围和数据集跟随具体 zone / account 计划。 | 自动报表可以用它；不要用 GraphQL Analytics API 复算账单。 |
| Web Analytics | 免费、隐私优先；所有计划可用；非代理站点 10 个，代理站点不限；Free 计划规则数量为 0。 | Pro/Business/Enterprise 的 Web Analytics 规则分别为 5/20/100。 | 文档站和官网先开它，不急着做复杂埋点。 |
| Workers Logs / Real-time logs | Workers Logs 每天 200k 条日志事件，保留 3 天；实时日志可用 dashboard 或 `wrangler tail`。 | Workers Paid 每月 20M 条日志事件已包含，超出 $0.60/million，保留 7 天。 | 生产日志要结构化并采样，不记录密钥、登录凭证和正文隐私。 |
| Workers Trace Events Logpush | Free 不可用。 | Workers Paid 每月 10M 次请求已包含，超出 $0.05/million。 | 只把需要长期保存的 Worker trace event 推到目的地，并用过滤/采样控制量。 |
| Cloudflare Logpush | 常规 Logpush 在 Free/Pro/Business 不可用；每个 zone 最多 4 个 Logpush jobs。 | Enterprise；非 Enterprise 只有 Workers Trace Events Logpush 可随 Workers Paid 使用。 | Logpush 不能回填历史，job 失败期间日志会丢；必须配置健康告警。 |
| Log Explorer | 当前没有免费版本或试用。 | 作为 Application Services 或 Zero Trust 购买的付费附加能力，按接入数据量和存储数据量计费；查询不额外计费。 | 需要历史取证和 Cloudflare 内部日志搜索时再买；合同客户可选最长 2 年留存，额外 $0.10/GB/month。 |
| Notifications | 所有计划可用；Free 可配置邮件通知。 | Professional+ 支持 webhooks；Business+ 支持 PagerDuty。 | 只对代理域名工作；Budget alerts 和 usage alerts 是提醒，不是自动熔断。 |
| Workers AI | Free 和 Paid 都有每天 10,000 Neurons 免费分配。 | 超过每天 10,000 Neurons 需要 Workers Paid，超出按 $0.011 / 1,000 Neurons。 | 先小模型、小上下文、短输出；所有模型调用先接 AI Gateway。 |
| AI Gateway | 所有计划可用；核心功能免费，包含 dashboard analytics、caching、rate limiting；Free 持久日志为所有网关合计 100,000 条；Spend limits 每个网关最多 20 条规则。 | Workers Paid 每个网关 10M 条持久日志；Logpush 仅 Workers Paid，每月 10M 次请求已包含，超出 $0.05/million。 | 外部模型、Workers AI、日志、缓存、备用模型和成本控制统一从网关进。 |
| [AI Search](/platform/ai/) | 新实例在公开测试期内免费；Free 有每账号 100 个实例、每实例 100,000 个文件、每月 20,000 次查询、每天 500 个爬取页面。 | Paid 有每账号 5,000 个实例、每实例 1M 个文件或混合搜索 500K、查询不限量、每天爬取页面不限量。 | 文档站先 Pagefind；需要自然语言搜索或工具调用时再上。Workers AI 和 AI Gateway 用量单独计费。 |
| [媒体与性能](/platform/media-performance/) | Images Free 每月 5,000 个独立图片转换；Speed 所有计划可用；Zaraz 每账号每月 1,000,000 个免费事件；Browser Run Free 每天 10 分钟。 | Images Paid、Stream、Zaraz Paid、Browser Run Paid 都要按实际媒体和浏览器用量估算。 | 大图、附件、视频不要塞进静态包；媒体产品最容易低估操作、播放和转换成本。 |
| Images | Free 可做外部图片转换，每月 5,000 个独立转换；超出后新转换返回 `9422`，不会直接收费。 | Paid 前 5,000 个转换已包含，超出 $0.50/1,000；Images 存储 $5/100k images/month，交付 $1/100k images。 | 原图放 R2，需要裁剪、格式转换、响应式图再接 Images。 |
| Stream | 没有适合普通文档站的免费存储额度；入口上传和编码免费。 | 存储 $5/1,000 minutes stored，播放 $1/1,000 minutes delivered；Media Transformations 含每月 5,000 次免费操作，之后 $0.50/1,000。 | 视频产品用 Stream；普通文档不要把视频硬塞进静态站。 |
| Browser Run | 每天 10 分钟浏览器时间；Browser Sessions 3 个并发浏览器；Quick Actions 每 10 秒 1 个请求；`/crawl` Free 限制每天 5 个任务、每次爬取 100 页。 | Workers Paid 每月 10 小时已包含，超出 $0.09/hour；Browser Sessions 每月平均 10 个并发浏览器已包含，超出 $2/browser；limits 页默认每账号 120 个并发浏览器。 | 能用 HTTP fetch 就不用浏览器；截图、PDF、动态页面抓取才用，并且必须关闭 session。 |
| Zaraz | 所有 Cloudflare 用户可用；每个账号每月 1,000,000 个免费 Zaraz Events；所有 features and tools 可用于所有账号。 | 每额外 1,000,000 个 Zaraz Events 为 $5/month；未启用 paid 且超过免费额度时，Zaraz 会停用到下个 billing cycle。 | 第三方脚本变多、需要 consent 或 selective loading 时再上；先减少脚本数量。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 所有请求都先经过 Worker。 | 静态资产直接服务，只让 API 进 Worker。 |
| KV 可以当数据库。 | KV 用于读多写少的配置和缓存；关系数据用 D1。 |
| R2 出站带宽免费就完全免费。 | R2 无出站带宽费，但存储和操作会计费。 |
| AI 一开始就做向量搜索。 | 先把内容结构化，Pagefind 能解决大部分早期搜索。 |
| 一开始自建评论组件。 | 文档社区优先用成熟评论系统，减少自维护 UI 和安全边界。 |
| 免费额度不用看。 | 免费额度不是无限额度；公开项目要知道硬限制在哪里。 |
| 以为 Workers Paid 等于 Cloudflare Pro。 | Workers Paid 是开发者平台账户级订阅；Cloudflare Pro 是 zone/domain 计划，二者不是一回事。 |
| 只看请求数，不看 CPU。 | Workers Paid 同时按请求和 CPU 计费；计算密集任务要单独估算。 |
| 看到“静态资产免费”就把所有文件塞进站点。 | 大文件、媒体和用户上传进入 R2/Stream，静态站只放构建产物。 |
| 以为预算提醒会自动封顶。 | Budget alerts 只发邮件，不暂停服务，也不停止按量计费产品。 |
| 只看 Billable Usage dashboard 就等于看完整账单。 | Billable Usage dashboard 主要看按量超额费用，不包含固定计划或订阅费用。 |
| 以为日志越多越安全。 | 日志要能定位问题，也要控制采样、留存和敏感字段；长期取证再上 Log Explorer / Logpush。 |

## 事实来源

这张表只放最常被核对的官方入口。低频产品保留在对应平台页，不在这里堆成链接墙。开源仓库用于看源码、示例和文档变更历史；额度和价格仍以官方价格和限制页面为准。

| 主题 | 官方入口 |
| --- | --- |
| Workers、Static Assets、Builds、Logs | [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)、[Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)、[Workers Static Assets Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)、[Workers Builds Limits & Pricing](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/) |
| 账单与预算 | [Cloudflare Billing Docs](https://developers.cloudflare.com/billing/)、[Usage-based billing](https://developers.cloudflare.com/billing/understand/usage-based-billing/)、[Budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/) |
| 静态站、数据与队列 | [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)、[D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)、[D1 Limits](https://developers.cloudflare.com/d1/platform/limits/)、[KV Pricing](https://developers.cloudflare.com/kv/platform/pricing/)、[R2 Pricing](https://developers.cloudflare.com/r2/pricing/)、[Queues Pricing](https://developers.cloudflare.com/queues/platform/pricing/)、[Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/) |
| 安全与访问 | [DNS records quota](https://developers.cloudflare.com/dns/manage-dns-records/)、[WAF Custom rules](https://developers.cloudflare.com/waf/custom-rules/)、[WAF Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)、[Turnstile Plans](https://developers.cloudflare.com/turnstile/plans/)、[Cloudflare Access pricing](https://www.cloudflare.com/sase/products/access/)、[Cloudflare One account limits](https://developers.cloudflare.com/cloudflare-one/account-limits/) |
| AI 与搜索 | [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)、[AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)、[AI Gateway Limits](https://developers.cloudflare.com/ai-gateway/reference/limits/)、[AI Search Limits & pricing](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)、[Vectorize Pricing](https://developers.cloudflare.com/vectorize/platform/pricing/) |
| 媒体、实时与浏览器 | [Images Pricing](https://developers.cloudflare.com/images/pricing/)、[Stream Pricing](https://developers.cloudflare.com/stream/pricing/)、[Realtime SFU Pricing](https://developers.cloudflare.com/realtime/sfu/pricing/)、[TURN Service](https://developers.cloudflare.com/realtime/turn/)、[Browser Run Pricing](https://developers.cloudflare.com/browser-run/pricing/)、[Zaraz Pricing](https://developers.cloudflare.com/zaraz/pricing-info/) |
| 开源源码与示例 | [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs)、[cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk)、[cloudflare/templates](https://github.com/cloudflare/templates)、[withastro/starlight](https://github.com/withastro/starlight)、[Pagefind/pagefind](https://github.com/Pagefind/pagefind)、[twikoojs/twikoo-cloudflare](https://github.com/twikoojs/twikoo-cloudflare) |
