---
title: 免费额度大全
description: Cloudflare 免费额度、5 美元/月 Workers Paid 和付费边界怎么分。
---

额度和价格会变化，付费前再做一次核对。

## 0 元起步

| 你要做什么 | 先用什么 | 免费阶段最该盯什么 |
| --- | --- | --- |
| 开源文档站 / 官网 / 博客 | Workers Static Assets 或 Pages + Pagefind + Web Analytics | 静态资产请求免费且不限量；Pages Free 每月 500 次构建。 |
| 教程站轻社区 | 静态资产层 + Twikoo Cloudflare + D1 + Turnstile | D1 每天 100k 行写入；公开写入口要防刷。 |
| 小接口 / 第三方回调 | Workers Free + D1 / KV + WAF / 限流 | Workers 每天 100,000 次请求，10 ms CPU/次调用。 |
| 表单 / 反馈箱 | Workers + D1 + Turnstile + Workers Logs | D1 写入、垃圾提交、日志 3 天留存。 |
| 文件上传 / 下载 | R2 + 签名链接 + CDN 缓存 | R2 每月 10 GB 标准存储、1M 写入类操作、10M 读取类操作。 |
| 小团队后台 | Access + Tunnel | Zero Trust Free 50 个用户；后台入口先有身份边界。 |
| AI 搜索原型 | Pagefind + AI Gateway + Workers AI / AI Search | 先用静态搜索；AI 调用要限流、缓存和记录用量。 |
| 实时小应用 | Durable Objects + Queues | DO 请求、运行时长、队列操作。 |

## 免费额度大全表

| 层 / 产品 | 免费额度 / 免费边界 | 5 美元或付费后怎么变 | 起步最佳实践 |
| --- | --- | --- | --- |
| DNS | 新 Free zone 每个域名 200 条记录；2024-09-01 前创建的 Free zone 默认 1,000 条。 | DNS 记录数跟域名计划走，Workers Paid 不影响。 | Web 记录代理；邮件、验证和特殊服务记录保持 DNS only。 |
| CDN / Cache | CDN 可用；Free 有 10 条缓存规则。 | 更多缓存规则和高级缓存能力跟域名计划走。 | 静态资源长缓存，HTML 谨慎缓存。 |
| SSL/TLS | Universal SSL、Origin CA、Always Use HTTPS、HSTS、TLS 1.3 可在 Free 使用。 | 高级证书、mTLS、证书治理按域名计划或企业能力看。 | 源站证书配好，优先用 Full (strict)。 |
| DDoS | 所有计划都有标准且不限量的 DDoS 防护。 | 自有 IP、专线和网络层 SLA 走企业网络产品。 | 确保入口经过 Cloudflare，源站不能被直连。 |
| WAF 自定义规则 | Free 有 5 条自定义规则。 | Pro 20 条，Business 100 条，Enterprise 1,000 条。 | 保护后台、登录、评论、上传、回调等高风险入口。 |
| WAF 限流规则 | Free 有 1 条限流规则，统计和封禁周期最短 10 秒。 | Pro 2 条，Business 5 条，Enterprise 通常更高；字段和统计维度随计划增加。 | 先给登录、评论、表单或搜索入口限流。 |
| Turnstile | Free 每账号 20 个 widget，每个 widget 10 个域名，挑战和验证请求不限量。 | Enterprise 可增加 widget、域名和高级风控。 | 公开写入口先加，服务端校验 token。 |
| Zero Trust / Access / Tunnel | Zero Trust Free 50 个用户；Tunnel 可发布公开主机名。 | 团队人数、设备策略、审计、DLP 和更复杂网络能力走 Zero Trust 计划。 | 后台、预览环境、内网工具先用 Access + Tunnel。 |
| Web Analytics | 代理站点不限；非代理站点 10 个。 | Web Analytics 规则数量跟域名计划走。 | 文档站和官网先开它，先看页面趋势。 |
| Workers Static Assets | 静态资产请求免费且不限量，资产存储无额外费用。 | 静态资产直接返回仍免费；动态 Worker 请求按 Workers 计费。 | 能提前构建出来的内容优先停在静态层。 |
| Pages | Free 每月 500 次构建、1 个并发构建、每项目 100 个自定义域名、每站 20,000 个文件、单文件 25 MiB。 | Pro/Business 构建次数、并发和文件数更高；Pages Functions 按 Workers 计费。 | 纯静态站、Git 预览部署很适合。 |
| Workers Builds | Free 每月 3,000 分钟构建、1 个并发构建、20 分钟超时。 | Paid 每月 6,000 分钟、6 个并发，超出按分钟计费。 | 用 Workers 平台构建前端项目时先用免费层。 |
| Workers | Free 100,000 次请求/天，10 ms CPU/次调用。 | Workers Paid 最低 5 美元/月，含 10M 请求/月、30M CPU ms/月，超出按量。 | 只让接口、评论、表单、回调、鉴权等动态路径交给 Worker。 |
| Worker 平台限制 | Free 有 100 个 Worker、50 次子请求/调用、5 个 Cron、3 MB Worker 包。 | Paid 有 500 个 Worker、10,000 次子请求/调用、250 个 Cron、10 MB Worker 包。 | 免费阶段项目少而清晰，复杂拆分留到实际需要出现后。 |
| Workers Logs | Free 每天 200,000 条日志事件，保留 3 天。 | Paid 每月 20M 条日志事件，保留 7 天，超出按量。 | 记录请求编号、路径、状态、耗时和错误类型。 |
| KV | Free 每天 100k 读取、1k 写入、1k 删除、1k 列举，1 GB 存储。 | Paid 每月 10M 读取、1M 写入、1M 删除、1M 列举，1 GB 存储，超出按量。 | 只放读多写少的配置、公开索引和缓存。 |
| D1 | Free 5M 行读取/天、100k 行写入/天、5 GB 总存储。 | Paid 每月 25B 行读取、50M 行写入、5 GB 存储，超出按量。 | 评论、反馈、小后台适合；常查字段先建索引。 |
| R2 Standard | 每月 10 GB-month 存储、1M Class A 操作、10M Class B 操作；出站带宽免费。 | 超出后按存储和操作计费；Infrequent Access 不适用免费层。 | 文件、附件、图片原图、导出物放 R2，公开读取配 CDN 缓存。 |
| Queues | Free 10,000 次操作/天，消息保留 24 小时。 | Paid 每月 1M 次操作，默认保留 4 天，可配置到 14 天，超出按量。 | 邮件、通知、导入、重试、后处理适合。 |
| Durable Objects | Free 可用 SQLite-backed DO，100,000 次请求/天、13,000 GB-s/天。 | Paid 每月 1M 请求、400k GB-s；SQLite 存储和读写进入月度包含量。 | 房间、会话、限流器和强一致状态才放 DO。 |
| Hyperdrive | Free 100,000 次数据库查询/天。 | Paid 查询量不设固定包含上限。 | 少量接口连接既有 Postgres/MySQL。 |
| Workers AI | Free 和 Paid 都有每天 10,000 Neurons 免费分配。 | Paid 超出免费分配后按 Neurons 计费。 | 小模型、短输出、缓存和限流先上。 |
| AI Gateway | 基础功能免费；Workers Free 持久日志为所有网关合计 100,000 条。 | Workers Paid 每个网关 10M 条持久日志，Logpush 另按请求计费。 | 外部模型和 Workers AI 都先过网关观察。 |
| AI Search | 2026-04-16 后新实例公开测试期内免费；Free 每月 20,000 次查询、每天 500 个爬取页面。 | Workers Paid 查询和爬取页数不限，实例与文件上限更高；Workers AI / AI Gateway 另计。 | 文档搜索先 Pagefind；自然语言搜索确认有价值后再上。 |
| Vectorize | Free 每月 30M 查询向量维度、5M 存储向量维度。 | Paid 每月 50M 查询向量维度、10M 存储向量维度，超出按量。 | 文档少时先用 Pagefind；向量库只放明确搜索需求。 |
| Browser Run | Free 每天 10 分钟浏览器时间，Browser Sessions 3 个并发浏览器。 | Paid 每月 10 小时浏览器时间、10 个并发浏览器，超出按量。 | 能用普通请求就不用浏览器；截图、PDF、动态页面抓取才看。 |
| Images | Free 每月 5,000 次独立图片转换，超出后新转换返回错误且不计费。 | Paid 含 5,000 次转换，超出按 1,000 次计费；Images 存储和交付另计。 | 原图进 R2，需要多尺寸和格式转换时再看。 |
| Zaraz | 每账号每月 1,000,000 个免费事件；未启用付费且超出会暂停到下个账单周期。 | Paid 每额外 1,000,000 个事件 5 美元/月。 | 第三方脚本变多时再看；先保留必要脚本。 |
| Stream | 上传和编码入口免费；普通文档站没有实用的免费视频存储层。 | 按视频存储、观看和交付等计量。 | 视频是主要内容时再看；普通附件优先放 R2。 |
| Containers | Free 不可用。 | Workers Paid 含 25 GiB-hours、375 vCPU-minutes、200 GB-hours，超出按量。 | 只有 Worker 运行时不够承载时再看。 |
| 预算提醒 | 可按美元阈值发邮件提醒按量费用。 | 仍然只是提醒。 | 启用提醒；硬边界靠限流、配额、队列熔断和产品开关。 |

## All the fun

| 项目目标 | 免费组合 | 先证明什么 |
| --- | --- | --- |
| 文档站 | 静态资产层 + Pagefind + Web Analytics | 内容结构、搜索、访问趋势。 |
| 轻社区 | 静态资产层 + Twikoo Cloudflare + D1 + Turnstile | 留言、反馈、轻审核。 |
| 小工具 | Workers + D1 / KV + R2 | 接口、配置、文件下载。 |
| 小团队后台 | Tunnel + Access + D1 | 身份边界和内部入口。 |
| AI 原型 | Pagefind + AI Gateway + Workers AI | 搜索体验和模型成本。 |
| 实时原型 | Durable Objects + Queues | 房间状态、连接和后台任务。 |

## 5 美元 Workers Paid

| 能力 | Workers Paid 包含量 | 超出后的方向 | 实际意义 |
| --- | --- | --- | --- |
| Worker 请求 | 10M 次/月 | +$0.30 / 额外 1M 请求 | 评论、表单、接口、回调和搜索代理稳定使用后更安心。 |
| CPU 时间 | 30M CPU ms/月 | +$0.02 / 额外 1M CPU ms | 服务端渲染、数据处理、签名上传、AI 代理和后台任务要看 CPU。 |
| 单次 CPU 上限 | 默认 30 秒，可提高到 5 分钟 | 仍需自己设置合理上限 | 复杂任务可以跑，但要避免单请求无限放大。 |
| Workers Logs | 20M 条日志事件/月，保留 7 天 | +$0.60 / 额外 1M 日志事件 | 生产排障比 Free 的 3 天留存更实用。 |
| KV | 10M 读、1M 写、1M 删除、1M 列举/月，1 GB 存储 | 读写删列举和存储分别按量 | 配置、低频缓存、公开索引进入生产后更稳。 |
| D1 | 25B 行读、50M 行写、5 GB 存储/月 | 行读、行写、存储分别按量 | 评论、反馈、小后台和轻业务表可以继续放大。 |
| Queues | 1M 操作/月，默认保留 4 天，可配置到 14 天 | +$0.40 / 额外 1M 操作 | 邮件、通知、导入和重试更像生产队列。 |
| Durable Objects | 1M 请求/月、400k GB-s/月 | 请求、运行时长和存储分别按量 | 房间、会话、限流器和实时状态有更清晰的生产边界。 |
| Hyperdrive | 数据库查询不设固定日额度 | 外部数据库本身仍另算 | 连接既有 Postgres/MySQL 时，不再被 Free 日查询卡住。 |
| Browser Run | 10 小时/月、10 个并发浏览器 | 浏览器小时和并发数按量 | 少量截图、PDF、动态页面验证可以进入生产。 |
| Containers | 25 GiB-hours、375 vCPU-minutes、200 GB-hours/月 | 内存、CPU、磁盘按秒计费 | Worker 运行时不够用时再考虑。 |
| Static Assets | 静态资产请求仍免费且不限量 | 只有动态 Worker 才进计费 | 静态主流量继续停在资产层。 |

| 不包含 | 为什么要分开看 |
| --- | --- |
| Cloudflare Pro / Business 的域名权益 | WAF、缓存规则、证书、Bot、部分安全能力跟域名计划走。 |
| 媒体和对象存储全部成本 | R2、Images、Stream、Browser Run、Zaraz 都有自己的计量单位。 |
| 企业网络能力 | Magic Transit、BYOIP、Network Interconnect、很多日志和 Bot 能力仍然是企业能力。 |
| 账单硬封顶 | 预算提醒只提醒，不会自动暂停服务或停止按量计费。 |

## 5 美元该不该花

| 场景 | 判断 |
| --- | --- |
| 只是文档站、官网、博客、作品集 | 通常先不付。静态资产请求免费且不限量，搜索用 Pagefind。 |
| 小接口每天稳定几千到几万次 | 可以继续 Free，但要看 CPU、日志和公开入口滥用。 |
| Worker 请求接近 100,000 次/天 | 该认真考虑 Workers Paid。 |
| D1、KV、Queues、Durable Objects 已经是主要功能 | 该认真考虑 Workers Paid。 |
| 需要 7 天日志、更多 Cron、更多子请求、更大包或更多 Worker | 该认真考虑 Workers Paid。 |
| 想加强 WAF、Bot、证书、缓存规则 | 看域名计划。 |

## 后续评估

| 产品 / 能力 | 什么时候评估 |
| --- | --- |
| Load Balancing、Health Checks、Argo、Spectrum | 多源站、故障切换、非 HTTP 入口或缓存做好后仍然回源慢。 |
| Waiting Room、Smart Shield、APO | 合法峰值、WordPress 性能瓶颈或源站洪峰已经明确。 |
| Bot 治理、接口防护、安全中心 | bot 成本、接口资产、移动端接口或安全审计已经明确。 |
| 长期日志、日志查询、分析报表 | 需要长期取证、外部日志平台、审计留存或自动报表。 |
| Hyperdrive、Workflows、Pipelines、Containers、R2 Data Catalog | 已有外部数据库、长流程、数据湖或完整运行环境需求。 |
| Cloudflare for SaaS、Workers for Platforms、Dynamic Workers | 客户要绑定自己的域名，或要上传、运行自己的代码。 |
| Magic Transit、BYOIP、Network Interconnect、Cloudflare WAN | 已经有自有 IP、专线、网络团队和合同预算。 |
| Data Localization Suite、客户端脚本安全高级能力、企业支持 | 客户、监管、合同或企业风控明确要求。 |
| Web3、Time Services、Randomness Beacon、Privacy Gateway、Tenant API | 有对应专业场景时再评估。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 所有请求都先交给 Worker。 | 静态资产直接返回，只让动态路径交给 Worker。 |
| KV 可以当数据库。 | KV 用于读多写少；关系数据用 D1。 |
| R2 出站带宽免费就完全免费。 | R2 不收出站带宽费，但存储和操作会计费。 |
| AI 一开始就做向量搜索。 | 先整理内容结构，Pagefind 能解决大部分早期搜索。 |
| Workers Paid 等于 Cloudflare Pro。 | Workers Paid 是账号级开发者平台订阅；Pro / Business 是域名计划。 |
| 预算提醒会自动封顶。 | 它只发邮件，不暂停服务，也不停止按量计费。 |
| 日志越多越安全。 | 日志要能定位问题，也要控制采样、留存和敏感字段。 |
