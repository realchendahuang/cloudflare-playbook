---
title: Cloudflare 产品大图谱
description: 面向独立开发者和小团队的 Cloudflare 产品地图、免费额度、付费入口和最佳实践。
---

最后核对日期：2026-06-17。

Cloudflare 把 DNS、CDN、DDoS、Workers、D1、R2、AI Gateway、Turnstile 等能力放在同一个平台里。对独立开发者和小团队来说，这些产品能把早期项目的基础设施成本和维护成本压到很低。

但它不是魔法。真正的关键是知道每个产品解决什么问题、免费边界在哪里、什么时候该付费、什么时候别乱上。

## 总体心法

```text
访问入口
  ├─ DNS / CDN / SSL / DDoS / WAF
  │
  ├─ 静态内容
  │    ├─ Pages
  │    └─ Workers Static Assets
  │
  ├─ 动态计算
  │    ├─ Workers
  │    ├─ Durable Objects
  │    ├─ Queues
  │    └─ Workflows
  │
  ├─ 数据存储
  │    ├─ D1 / KV / R2
  │    ├─ Vectorize / Hyperdrive
  │    └─ Analytics Engine
  │
  ├─ AI 能力
  │    ├─ Workers AI / AI Gateway
  │    ├─ AI Search / Vectorize
  │    └─ Agents SDK
  │
  └─ 观测与安全
       ├─ Web Analytics / Logs / GraphQL Analytics
       └─ Turnstile / WAF / Bot / API Shield
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
| Workflows | 适合长流程编排，具体额度随官方页面变动。 | 超出免费/包含额度后按平台规则计费。 | 多步骤、可重试、可观察的业务流程。 | 支付后开通、批量导入、AI 处理流水线适合；简单请求别上。 |
| Cron Triggers | 随 Workers 使用。 | 主要受 Workers 计划和调用成本影响。 | 定时任务。 | 适合定时清理、同步、刷新索引；每次任务要可重入。 |
| Workers for Platforms | 面向多租户代码运行，通常不是个人项目第一步。 | 生产多租户平台再评估付费。 | 让用户上传/运行自己的 Worker。 | 只有做开发者平台、插件平台、低代码平台时再看。 |
| Containers | 面向需要容器运行时的场景，价格和可用性要看官方当前状态。 | 通常用于 Workers 无法覆盖的运行时需求。 | 跑不能轻易改成 Worker 的服务。 | 先问能不能 Worker 化；容器是补位，不是默认选项。 |

## 数据与存储

| 产品 | 免费边界 | 付费入口 | 作用 | 最佳实践 |
| --- | --- | --- | --- | --- |
| [D1](/platform/d1/) | Free 计划读 5,000,000 rows/day、写 100,000 rows/day、总存储 5 GB。 | Paid 每月前 25B rows read、50M rows written 和 5 GB 包含，超出按量。 | Serverless SQL，适合评论、文章元数据、配置后台、小型 SaaS。 | 常查字段建索引；不要把高频计数和超大分析表硬塞进去。 |
| [KV](/platform/kv/) | Free 计划读 100,000/day、写 1,000/day、删 1,000/day、列 1,000/day、存储 1 GB。 | Paid 每月包含 10M reads、1M writes/deletes/lists 和 1 GB 存储，超出按 key/容量计费。 | 全局 key-value，适合配置、缓存、低频更新索引。 | 读多写少才舒服；同一个 key 仍然只有 1 次/秒写入，不要依赖强一致。 |
| [R2](/platform/r2/) | Standard storage 10 GB-month/month、Class A 1M/month、Class B 10M/month；无 egress bandwidth charge。 | Standard storage $0.015/GB-month，Class A $4.50/million，Class B $0.36/million；Infrequent Access 不包含免费额度。 | S3 兼容对象存储，放图片、附件、备份、导出文件。 | 大文件和媒体不要塞进 Git 或 Pages bundle；公开下载注意 Class B 次数。 |
| Hyperdrive | Workers Free/Paid 都包含一定使用。 | 访问外部数据库量大时看 Workers Paid/Hyperdrive 额度。 | 给外部 Postgres/MySQL 做连接池和加速。 | 已有数据库时用它；新小项目优先 D1，少维护一套外部 DB。 |
| Vectorize | Pricing 页列出 Free 的 queried/stored vector dimensions 额度，但可用性变化较快。 | Paid 包含更高 queried/stored vector dimensions，超出按量。 | 向量数据库，做 RAG、语义搜索、相似推荐。 | 文档站早期先 Pagefind；需要语义检索时再上 Vectorize 或 AI Search，上线前再核对 dashboard 和官方 limits。 |
| Analytics Engine | Free 计划 100,000 data points/day、10,000 read queries/day；官方说明当前价格信息用于预估。 | Paid 每月包含更高写入和查询额度，之后按量。 | 高基数事件、指标和自定义分析。 | 用来记录产品事件、Worker 业务指标；不要替代事务数据库。 |
| Secrets Store | 适合集中管理密钥，具体可用性看官方当前状态。 | 生产多项目、多环境密钥管理时评估。 | 管理 API key、数据库密码、第三方 token。 | 本地 `.env` 只用于开发；生产密钥放 Cloudflare secret/binding。 |

## AI 与搜索

| 产品 | 免费边界 | 付费入口 | 作用 | 最佳实践 |
| --- | --- | --- | --- | --- |
| Pagefind | 不是 Cloudflare 产品；构建期生成索引，运行时不消耗 Worker API。 | 无额外后端成本。 | 普通文档站关键词搜索。 | 本站当前默认使用 Pagefind，因为开源文档最划算。 |
| AI Search | 官方标注可用于所有计划；新实例包含托管存储、向量索引和网页抓取能力。 | 具体限制和费用看 AI Search limits/pricing。 | 自然语言知识库搜索、Agent 工具、混合检索。 | 内容足够多后再上；先让 Markdown 结构、标题和标签干净。 |
| Workers AI | Free/Paid 都包含；每天 10,000 Neurons 免费。 | Paid 超过免费额度后按 $0.011 / 1,000 Neurons。 | 在 Cloudflare 上跑模型推理。 | 适合低延迟边缘推理；复杂生成任务要先估算 token/模型成本。 |
| AI Gateway | 所有计划可用，核心功能免费。 | 可能结合日志、统一计费、模型提供商成本使用。 | AI 请求网关、缓存、日志、限流、fallback。 | 只要调用外部模型，优先接 AI Gateway 做观测和成本控制。 |
| Vectorize | 见数据与存储。 | 见数据与存储。 | RAG 和语义搜索的向量层。 | 文本原文仍放 D1/R2，Vectorize 放 embedding 和 metadata。 |
| Agents SDK | 构建有状态 Agent。 | 依赖 Workers、Durable Objects、AI 等组合成本。 | Agent 状态、工具调用、长任务编排。 | 先把普通 Worker API 写清楚，再把真正需要状态和工具的流程升级为 Agent。 |

## 安全、网络与入口

| 产品 | 免费边界 | 付费入口 | 作用 | 最佳实践 |
| --- | --- | --- | --- | --- |
| [DNS](/platform/dns/) | Free/Pro/Business 不对 DNS query 收费且不限制查询；新 Free zone 为 200 records/zone，旧 Free zone 为 1,000，Pro/Business 为 3,500。 | Enterprise 以 DNS query 等作为报价输入，records/zone 可申请提高。 | 域名解析、代理状态和流量入口。 | Web 入口用 Proxied，邮件和验证记录 DNS-only；迁移前导出旧 zone 并处理 DNSSEC。 |
| [Cache / CDN](/platform/cache/) | Cache / CDN、Cache Rules、Purge、Tiered Cache 基础能力在 Free 可用。 | Cache Rules 数量、Edge TTL 最小值、Cache Reserve、企业拓扑和高级 cache key 随计划或 add-on 提升。 | 缓存静态内容，减少源站压力。 | 静态 hash 资源长缓存；HTML 短缓存；用户态默认 bypass；用版本化 URL 少 purge。 |
| [SSL/TLS](/platform/ssl-tls/) | Universal SSL、Origin CA、Always Use HTTPS、HSTS、TLS 1.3 等基础能力在 Free 可用。 | Advanced Certificate Manager、Custom Certificates、Keyless SSL、Enterprise-only 模式按需求升级。 | 给站点建立完整 HTTPS 链路。 | 默认目标是 Full (strict)；源站也要有有效证书，别停在 Flexible。 |
| [DDoS Protection](/platform/ddos/) | 官方说明所有计划都有 standard, unmetered DDoS protection，HTTP DDoS 和 Network-layer DDoS 也覆盖所有计划。 | Enterprise / Advanced DDoS 提供更多 override、Log action、Adaptive / Advanced DDoS、告警过滤和支持。 | 自动检测和缓解 L3/L4 与 L7 DDoS。 | Web 入口先保持 Proxied，隐藏源站 IP；被打时再结合 WAF、Rate Limiting、Under Attack 和日志排查。 |
| [WAF](/platform/waf/) | WAF 可用于所有计划；Free 有 5 条 Custom Rules、1 条 Rate Limiting Rule、Free Managed Ruleset 和 sampled Security Events。 | Pro/Business/Enterprise 提升规则数量、Managed Rules、Attack Score、Security Events 和高级检测能力。 | 拦常见攻击、写自定义规则、限速高风险入口。 | 登录、API、后台、评论和上传先加最小规则；先看 Security Events，再逐步收紧。 |
| Turnstile | Free 计划适合个人站、博客、中小业务、开发测试和大多数生产应用。 | Enterprise 面向核心业务和更高要求。 | 免费 CAPTCHA 替代，降低表单滥用。 | 只放前端组件不够，必须服务端验证 token；适合接入表单、登录和高频提交入口。 |
| Rate Limiting | WAF Rate Limiting 在 Free 有 1 条规则。 | Pro 2 条、Business 5 条、Enterprise 100 条，更多高级特征随计划提升。 | 防刷、防撞库、防 API 滥用。 | 对登录、评论、验证码、搜索 API 先做最小限流；注意 NAT 用户误伤。 |
| Bot Management | 高级 Bot 能力通常面向付费/企业。 | 业务受爬虫、撞库、黄牛影响时升级。 | 识别和处理自动化流量。 | 先用 Turnstile、WAF、限流；明确 bot 成本后再买更高级能力。 |
| API Shield | 多为 API 保护能力集合。 | 生产 API、有客户数据、有移动端时评估。 | mTLS、schema validation、API 安全。 | 公开 API 先定义 schema 和认证边界，再加 Shield 能力。 |
| Tunnel | 基础 Tunnel 可用于把内网服务安全暴露。 | Zero Trust 团队场景按 Access/Gateway 计划评估。 | 不开公网端口暴露内网服务。 | 个人后台、内网面板优先 Tunnel + Access，不要裸奔公网。 |
| Zero Trust | Free 计划适合小规模团队入门，具体 seat/功能看官方。 | 团队、日志、策略、SLA 要求提升后付费。 | Access、Gateway、设备和身份安全。 | 管理后台优先用 Access 保护，比自己写登录更稳。 |

## 媒体、观测与开发工具

| 产品 | 免费边界 | 付费入口 | 作用 | 最佳实践 |
| --- | --- | --- | --- | --- |
| [Billing](/platform/billing/) | Billable Usage dashboard、Budget alerts、invoice 和 billing policy 可用于理解账单。 | usage-based overage、subscription 和 add-on 都要按产品核对。 | 把免费额度、固定订阅、按量费用和发票串起来。 | 开启付费产品前先看 pricing / limits；开启后看 Billable Usage 和 budget alerts。 |
| Web Analytics | 官方标注 available on all plans；Pages 文档称它是免费、隐私优先分析。 | 更复杂产品分析用 Analytics Engine 或第三方。 | 站点访问和性能统计。 | 文档站和官网先开它，不急着上复杂埋点。 |
| Workers Logs / Tail | 随 Workers 提供开发和排障能力。 | 更长留存、Logpush、企业日志再付费。 | 查看 Worker 日志和错误。 | 生产只记录必要上下文，别把 token/隐私数据写日志。 |
| GraphQL Analytics API | Cloudflare 多产品指标查询。 | 大规模分析、企业报表时评估。 | 查询 DNS、HTTP、Workers 等指标。 | 先用 Dashboard；需要自动报表再接 API。 |
| Images | Free 计划包含 5,000 unique transformations/month。 | Paid 前 5,000 transformations included，超出按 transformation、stored images、delivered images 计费。 | 图片优化、变换、存储和分发。 | 图片原文件优先 R2；需要动态裁剪和格式转换再接 Images。 |
| Stream | ingress 和 encoding 免费；存储与播放按视频分钟计费。 | 存储 $5/1,000 minutes stored，播放 $1/1,000 minutes delivered。 | 视频托管和播放。 | 不要用 Pages/R2 裸扛完整视频产品；视频业务用 Stream 或专门服务。 |
| Browser Run | Workers Free 有 10 minutes/day browser hours。 | Workers Paid 有 10 hours/month included，超出按 browser hours 和并发浏览器计费。 | 云端无头浏览器。 | 能用普通 fetch 就别开浏览器；浏览器时间贵，任务要短。 |
| Zaraz | 第三方脚本管理。 | 高级需求看计划。 | 把分析、广告、营销脚本迁到边缘管理。 | 前端性能敏感站点再引入；先减少脚本数量。 |
| Wrangler | 免费 CLI。 | 无。 | 管理 Workers、D1、R2、KV、部署。 | `wrangler.jsonc` 作为配置真源，生产变更走 Git。 |

## 独立开发者推荐组合

| 场景 | 推荐组合 |
| --- | --- |
| 文档站 / 公开知识库 | Astro/Starlight + [Workers Static Assets](/platform/static-assets/) + Pagefind + Web Analytics |
| 有评论的文档社区 | Workers Static Assets + Twikoo Cloudflare + 后续 Turnstile |
| 小型 SaaS | Workers + D1 + KV + R2 + AI Gateway |
| 文件上传和下载 | Workers + R2 + Signed URL + D1 metadata |
| AI 问答知识库 | Workers + AI Search 或 Vectorize + R2/D1 + AI Gateway |
| 实时协作 | Workers + Durable Objects + D1/R2 持久化 |
| 后台任务 | Workers + Queues + Cron Triggers + D1/R2 |
| 管理后台 | Workers Static Assets + Access/Tunnel + D1 |

## 官方资料

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
- [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- [AI Search](https://developers.cloudflare.com/ai-search/)
- [Cloudflare Billing Docs](https://developers.cloudflare.com/billing/)
- [Usage-based billing](https://developers.cloudflare.com/billing/understand/usage-based-billing/)
- [Budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/)
- [DNS FAQ](https://developers.cloudflare.com/dns/faq/)
- [WAF Docs](https://developers.cloudflare.com/waf/)
- [DDoS Protection Docs](https://developers.cloudflare.com/ddos-protection/)
- [DDoS Protection About](https://developers.cloudflare.com/ddos-protection/about/)
- [Turnstile Plans](https://developers.cloudflare.com/turnstile/plans/)
