---
title: Cloudflare 产品大图谱
description: 面向独立开发者和小团队的 Cloudflare 产品地图、免费额度、付费入口和最佳实践。
---

# Cloudflare 产品大图谱

最后核对日期：2026-06-17。

Cloudflare 很像赛博世界里一尊慷慨的“基础设施菩萨”：DNS、CDN、DDoS、Workers、D1、R2、AI Gateway、Turnstile 这些能力，能把独立开发者和小团队的早期运维成本压到很低。

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
| Workers Static Assets | 静态资产请求免费且不限量，资产存储无额外费用。 | 只有请求进入 Worker 脚本时才按 Workers 计费。 | 把静态站和 API 放进同一个 Worker 项目。 | 文档站、前端应用、少量 API 优先用它；配置 `run_worker_first` 只匹配 API。 |
| Pages | Free 计划包含静态请求和带宽，官方 Pages 页面列出 500 builds/月、100 custom domains/project。 | Pro/Business 增加并发构建、构建次数和项目能力。 | Git 驱动的静态站和前端部署。 | 纯静态站很好用；一旦 API、D1、R2、AI 组合变多，优先迁到 Workers Static Assets。 |
| Pages Functions | 计入 Workers/Pages Functions 额度。 | 随 Workers Paid 扩容。 | 给 Pages 项目加轻量 API。 | 适合已有 Pages 项目渐进加 API；新项目如果天然 full-stack，直接 Workers。 |
| Durable Objects | Free/Paid 都可用；Free 计划只支持 SQLite-backed Durable Objects。 | Paid 支持更多用量和 key-value storage backend。 | 单对象强一致状态、房间、限流器、协作会话。 | 只把“必须强一致”的状态放进去，不要拿它当全局大数据库。 |
| Queues | Free 计划 10,000 operations/day；消息保留 24 小时。 | Paid 每月包含 1,000,000 operations，超出按量；保留期默认 4 天，可配到 14 天。 | 异步任务、削峰、后台处理、跨 Worker 消息。 | 评论这种要自由实时发布的场景不用队列；邮件、转码、爬取、通知再上。 |
| Workflows | 适合长流程编排，具体额度随官方页面变动。 | 超出免费/包含额度后按平台规则计费。 | 多步骤、可重试、可观察的业务流程。 | 支付后开通、批量导入、AI 处理流水线适合；简单请求别上。 |
| Cron Triggers | 随 Workers 使用。 | 主要受 Workers 计划和调用成本影响。 | 定时任务。 | 适合定时清理、同步、刷新索引；每次任务要可重入。 |
| Workers for Platforms | 面向多租户代码运行，通常不是个人项目第一步。 | 生产多租户平台再评估付费。 | 让用户上传/运行自己的 Worker。 | 只有做开发者平台、插件平台、低代码平台时再看。 |
| Containers | 面向需要容器运行时的场景，价格和可用性要看官方当前状态。 | 通常用于 Workers 无法覆盖的运行时需求。 | 跑不能轻易改成 Worker 的服务。 | 先问能不能 Worker 化；容器是补位，不是默认选项。 |

## 数据与存储

| 产品 | 免费边界 | 付费入口 | 作用 | 最佳实践 |
| --- | --- | --- | --- | --- |
| D1 | Free 计划读 5,000,000 rows/day、写 100,000 rows/day、总存储 5 GB。 | Paid 每月前 25B rows read、50M rows written 和 5 GB 包含，超出按量。 | Serverless SQL，适合评论、文章元数据、配置后台、小型 SaaS。 | 常查字段建索引；不要把高频计数和超大分析表硬塞进去。 |
| KV | Free 计划读 100,000/day、写 1,000/day、删 1,000/day、列 1,000/day、存储 1 GB。 | Paid 每月包含更高读写和 1 GB 存储，超出按 key/容量计费。 | 全局 key-value，适合配置、缓存、低频更新索引。 | 读多写少才舒服；不要依赖强一致，不要把它当 SQL。 |
| R2 | 标准存储 10 GB-month、Class A 1M/月、Class B 10M/月；无 egress bandwidth charge。 | 标准存储 $0.015/GB-month，Class A/B 按百万操作计费；低频访问存储另计。 | S3 兼容对象存储，放图片、附件、备份、导出文件。 | 大文件和媒体不要塞进 Git 或 Pages bundle；公开下载注意操作次数。 |
| Hyperdrive | Workers Free/Paid 都包含一定使用。 | 访问外部数据库量大时看 Workers Paid/Hyperdrive 额度。 | 给外部 Postgres/MySQL 做连接池和加速。 | 已有数据库时用它；新小项目优先 D1，少维护一套外部 DB。 |
| Vectorize | Free 计划可创建少量索引；官方限制页显示 Free 100 indexes、Paid 50,000 indexes。 | 按 queried/stored vector dimensions 计费。 | 向量数据库，做 RAG、语义搜索、相似推荐。 | 文档站早期先 Pagefind；需要语义检索时再上 Vectorize 或 AI Search。 |
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
| DNS | Free/Pro/Business 不对 DNS query 收费；新建 Free zone 的 DNS record 数量有官方上限。 | Enterprise 以 DNS query 等作为报价输入。 | 域名解析和流量入口。 | 个人和小团队所有域名都先接 Cloudflare DNS；记录命名保持清晰。 |
| CDN Cache | Free 计划可用 CDN/cache，部分高级缓存能力按计划开放。 | Pro/Business/Enterprise 解锁更高限制和高级能力。 | 缓存静态内容，减少源站压力。 | 静态资源用长缓存；HTML 谨慎缓存；用 Cache Rules 替代到处写代码。 |
| SSL/TLS | Free 计划提供基础 HTTPS。 | 高级证书、更多控制和企业需求再升级。 | 给站点加 HTTPS。 | 默认全站 HTTPS；源站也保持 TLS，别只在边缘加密。 |
| DDoS Protection | DDoS Protection 官方标注 available on all plans。 | 企业场景需要更细策略、支持和 SLA 时升级。 | 自动检测和缓解 DDoS。 | 普通项目先接入即可；被打时再组合 WAF、Rate Limiting、规则和日志排查。 |
| WAF | 官方 WAF 标注 available on all plans，不同计划能力不同。 | 托管规则、Bot、更多安全能力随计划增强。 | 拦常见攻击、写自定义规则。 | 登录、API、后台先加规则；不要一开始就写过度复杂的拦截策略。 |
| Turnstile | Free 计划适合个人站、博客、中小业务、开发测试和大多数生产应用。 | Enterprise 面向核心业务和更高要求。 | 免费 CAPTCHA 替代，防表单刷。 | 只放前端组件不够，必须服务端验证 token；本站当前先用蜜罐和限流。 |
| Rate Limiting | 基础限流能力随计划变化。 | 高级规则和更大规模流量再升级。 | 防刷、防撞库、防 API 滥用。 | 对登录、评论、验证码、搜索 API 先做最小限流。 |
| Bot Management | 高级 Bot 能力通常面向付费/企业。 | 业务受爬虫、撞库、黄牛影响时升级。 | 识别和处理自动化流量。 | 先用 Turnstile、WAF、限流；明确 bot 成本后再买更高级能力。 |
| API Shield | 多为 API 保护能力集合。 | 生产 API、有客户数据、有移动端时评估。 | mTLS、schema validation、API 安全。 | 公开 API 先定义 schema 和认证边界，再加 Shield 能力。 |
| Tunnel | 基础 Tunnel 可用于把内网服务安全暴露。 | Zero Trust 团队场景按 Access/Gateway 计划评估。 | 不开公网端口暴露内网服务。 | 个人后台、内网面板优先 Tunnel + Access，不要裸奔公网。 |
| Zero Trust | Free 计划适合小规模团队入门，具体 seat/功能看官方。 | 团队、日志、策略、SLA 要求提升后付费。 | Access、Gateway、设备和身份安全。 | 管理后台优先用 Access 保护，比自己写登录更稳。 |

## 媒体、观测与开发工具

| 产品 | 免费边界 | 付费入口 | 作用 | 最佳实践 |
| --- | --- | --- | --- | --- |
| Web Analytics | 官方标注 available on all plans；Pages 文档称它是免费、隐私优先分析。 | 更复杂产品分析用 Analytics Engine 或第三方。 | 站点访问和性能统计。 | 文档站和官网先开它，不急着上复杂埋点。 |
| Workers Logs / Tail | 随 Workers 提供开发和排障能力。 | 更长留存、Logpush、企业日志再付费。 | 查看 Worker 日志和错误。 | 生产只记录必要上下文，别把 token/隐私数据写日志。 |
| GraphQL Analytics API | Cloudflare 多产品指标查询。 | 大规模分析、企业报表时评估。 | 查询 DNS、HTTP、Workers 等指标。 | 先用 Dashboard；需要自动报表再接 API。 |
| Images | Free 计划包含外部图片 transformations；Paid 解锁 Images 存储等能力。 | 官方 Images pricing 按 transformation、stored images、delivered images 等计费。 | 图片优化、变换、存储和分发。 | 图片原文件优先 R2；需要动态裁剪和格式转换再接 Images。 |
| Stream | 视频存储、转码、播放，官方 Plans 页列出付费入口和部分计划赠送分钟。 | 视频产品或课程站再评估。 | 视频托管和播放。 | 不要用 Pages/R2 裸扛完整视频产品；视频业务用 Stream 或专门服务。 |
| Browser Run | 付费按 browser time；官方介绍有 generous free tier。 | 自动化浏览器、截图、抓取、PDF 生成规模化时付费。 | 云端无头浏览器。 | 能用普通 fetch 就别开浏览器；浏览器时间贵，任务要短。 |
| Zaraz | 第三方脚本管理。 | 高级需求看计划。 | 把分析、广告、营销脚本迁到边缘管理。 | 前端性能敏感站点再引入；先减少脚本数量。 |
| Wrangler | 免费 CLI。 | 无。 | 管理 Workers、D1、R2、KV、部署。 | `wrangler.jsonc` 作为配置真源，生产变更走 Git。 |

## 独立开发者推荐组合

| 场景 | 推荐组合 |
| --- | --- |
| 文档站 / 公开知识库 | Astro/Starlight + Workers Static Assets + Pagefind + Web Analytics |
| 有评论的文档社区 | Workers Static Assets + D1 + 轻量限流 + 后续 Turnstile |
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
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Queues Pricing](https://developers.cloudflare.com/queues/platform/pricing/)
- [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- [AI Search](https://developers.cloudflare.com/ai-search/)
- [DNS FAQ](https://developers.cloudflare.com/dns/faq/)
- [WAF Docs](https://developers.cloudflare.com/waf/)
- [DDoS Protection Docs](https://developers.cloudflare.com/ddos-protection/)
- [Turnstile Plans](https://developers.cloudflare.com/turnstile/plans/)
