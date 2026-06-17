---
title: 成本控制
description: Cloudflare 项目中常见成本来源、免费额度边界和控制方式。
---

最后核对日期：2026-06-18。

成本控制不是把项目省到不能用，而是知道什么行为触发计费，并在架构、配置和代码里留下边界。普通项目最该盯的是：静态请求有没有误进 Worker，写接口有没有被刷，R2 / D1 / KV 是否放对数据，AI 和日志有没有上限。

Cloudflare 账单要分成 domain plan、Workers Paid、add-on 和 usage-based 四条线看。具体账单口径、Budget alerts、Billable Usage dashboard 和 invoice 规则见 [Billing](/platform/billing/)；完整数字见 [免费额度大全](/platform/free-paid/)。

## 免费额度优先级

| 优先级 | 先盯什么 | 为什么 |
| --- | --- | --- |
| 1 | 静态资产请求 | Workers Static Assets / Pages 静态资产请求免费且不限量，读文档、官网、博客不应该消耗 Worker 请求。 |
| 2 | Worker 请求和 CPU | Workers Free 是 100,000 requests/day、10 ms CPU/invocation；动态接口先看这里。 |
| 3 | 数据读写 | D1 看 rows read / written，KV 看 reads / writes / lists，R2 看 storage、Class A、Class B。 |
| 4 | 写接口滥用 | 评论、表单、上传、搜索、Webhook、AI 调用都要有身份、Turnstile、限流或配额。 |
| 5 | 日志和 AI | Workers Logs、AI Gateway、Workers AI、AI Search、Vectorize 都适合先验证，再扩大。 |
| 6 | 固定订阅和 add-on | Workers Paid、Pro / Business、Images Paid、Stream、Log Explorer、Load Balancing 等要按产品单独判断。 |

## 成本来源

| 成本类型 | 常见产品 | 判断问题 |
| --- | --- | --- |
| 请求 | Workers、Pages Functions、Durable Objects、Queues、R2 operations | 这次访问有没有打到动态代码、对象存储或队列？ |
| CPU | Workers、Cron、Queue Consumer | 代码是在算东西，还是在等外部 I/O？ |
| 存储 | D1、R2、KV、Durable Objects、Stream、Images | 数据是否应该长期保留，是否可以过期、压缩或归档？ |
| 构建 | Workers Builds、Pages Builds | 每次 push 是否都需要完整构建？ |
| 日志 | Workers Logs、Logpush、AI Gateway logs | 日志是否记录了必要上下文，是否需要长期保留？ |
| AI | Workers AI、AI Gateway、Vectorize、AI Search | 模型、上下文、输出长度、缓存命中率和查询次数是否可观察？ |
| 安全 | WAF、Bot、Access、API Shield、Turnstile | 付费是在买更高配额、更细规则，还是买人工可维护性？ |
| 固定订阅 | Domain plan、Workers Paid、add-on | 这是按月固定费用，还是会叠加 usage-based overage？ |
| 账单观察 | Billable Usage dashboard、Budget alerts、Invoices | 当前看到的是按量超额，还是完整发票？预算提醒有没有设置？ |

## 免费友好的架构规则

| 规则 | 做法 |
| --- | --- |
| 静态优先 | 文档、官网、前端 bundle 走 Workers Static Assets 或 Pages；只有 API 进 Worker。 |
| 数据归位 | 关系数据进 D1，文件进 R2，配置和缓存进 KV，强一致房间状态进 Durable Objects。 |
| 后台异步 | 邮件、通知、导入、转码、爬取、AI 批处理放 Queues 或 Cron，不要卡住用户请求。 |
| AI 先网关 | 模型调用先过 AI Gateway，观察请求数、token、缓存和错误，再决定是否扩大。 |
| 大文件离站点 | 图片原图、附件、导出、视频不要进静态站 bundle；图片进 R2 / Images，视频进 Stream。 |
| 限流在边界 | 登录、评论、搜索、上传、Webhook 先做最小限流和 Turnstile，再讨论更复杂安全产品。 |
| 日志克制 | 生产日志记录 request id、路径、状态、耗时和错误类型；不记录密钥、token、cookie 和正文隐私。 |

## 什么时候付 5 USD/month

Workers Paid 的每月最低 5 USD 值得付的典型信号：

- Worker 请求接近或超过 100,000/day。
- 单次 CPU 明显超过 Free 的 10 ms。
- 需要更多 subrequests、Cron Triggers、Worker 数量或更大的 Worker bundle。
- 需要更高 Workers Logs 额度和留存。
- D1、KV、Queues、Durable Objects、Hyperdrive 或 Browser Run 已经成为产品主路径。
- Workers AI 每天 10,000 Neurons 不够用。

不急着付的典型信号：

- 只是静态文档站、博客或官网。
- 搜索可以用 Pagefind。
- 评论、表单、后台功能还没有真实用户。
- AI 搜索还只是设想，内容规模也不大。

## 5 USD 买不到什么

| 不包含 | 正确理解 |
| --- | --- |
| Cloudflare Pro / Business 的 zone 权益 | WAF 规则数量、Cache Rules、证书高级能力、部分 Bot 能力跟域名计划相关。 |
| 预算硬封顶 | Budget alerts 只发邮件，不会自动暂停服务或阻止继续计费。 |
| R2 全免费 | R2 没有 egress 费用，但 storage、Class A、Class B 仍然要看。 |
| AI 无限用 | Workers AI、AI Gateway、AI Search、Vectorize 都有自己的查询、日志、token 或维度边界。 |
| 企业日志能力 | Workers Paid 解锁 Workers Trace Events Logpush；常规 Logpush 和 Log Explorer 仍要单独看计划。 |

## 观察清单

| 模块 | 先看什么 |
| --- | --- |
| Workers | 请求数、CPU time、错误率、subrequests、bundle size。 |
| Static Assets / Pages | 静态资产命中、文件数、单文件大小、构建次数。 |
| D1 | rows read、rows written、慢查询、是否缺索引。 |
| R2 | storage、Class A、Class B、公开下载热点。 |
| KV | reads / writes / list / delete 是否符合读多写少。 |
| Queues | operations、失败重试、Dead Letter Queue、消息保留时间。 |
| Durable Objects | requests、GB-s、WebSocket 是否 hibernation。 |
| AI Gateway | 请求数、provider、模型、token、缓存命中、错误。 |
| Workers AI | Neurons/day、模型单价、输入输出长度。 |
| Browser Run | browser hours、并发浏览器、单任务耗时。 |
| Logs | 日志量、保留期、是否能定位错误。 |
| Billing | Billable Usage dashboard、Budget alerts、invoice line items、fixed subscription。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 所有请求都先经过 Worker。 | 静态资产直接服务，只让动态路径进入 Worker。 |
| KV 可以当数据库。 | KV 用于读多写少的配置和缓存；关系数据用 D1。 |
| R2 egress 免费就完全免费。 | R2 无 egress bandwidth charge，但存储和操作会计费。 |
| AI 一开始就做向量搜索。 | 先把内容结构化，Pagefind 能解决大部分早期搜索。 |
| 免费额度不用看。 | 免费额度不是无限额度；公开项目要知道硬限制在哪里。 |
| Workers Paid 等于 Cloudflare Pro。 | Workers Paid 是开发者平台账户级订阅；Pro 是 zone / domain 计划。 |
| 只看请求数，不看 CPU。 | Workers 同时要看请求和 CPU；计算密集任务要单独估算。 |
| 预算提醒会自动封顶。 | Budget alerts 只提醒，不暂停服务，也不停止按量计费产品。 |

## 事实来源

- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers Static Assets Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Cloudflare Billing Docs](https://developers.cloudflare.com/billing/)
- [How Cloudflare billing works](https://developers.cloudflare.com/billing/understand/how-billing-works/)
- [Usage-based billing](https://developers.cloudflare.com/billing/understand/usage-based-billing/)
- [Monitor billable usage](https://developers.cloudflare.com/billing/manage/billable-usage/)
- [Budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/)
- [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Queues Pricing](https://developers.cloudflare.com/queues/platform/pricing/)
- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [AI Search Limits & Pricing](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)
- [Browser Run Pricing](https://developers.cloudflare.com/browser-run/pricing/)
