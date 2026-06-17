---
title: Billing
description: Cloudflare 账单、免费额度、Workers Paid、按量计费、预算提醒和发票的实践整理。
---

最后核对日期：2026-06-17。Billing 相关规则变化很快，价格、免费额度和账单口径以 Cloudflare 官方 Billing / Pricing / Limits 页面为准。

## 一句话判断

Cloudflare 账单不是“Free / Paid”一个开关，而是三层费用叠在一起：

```text
Cloudflare account
  ├─ Zone / domain plans: Free / Pro / Business / Enterprise
  ├─ Subscriptions / add-ons: Load Balancing / Argo / Cache Reserve 等
  └─ Usage-based products: Workers / R2 / D1 / Stream / Images / Vectorize 等
```

普通项目最重要的判断是：**Workers Paid 不是 Cloudflare Pro，预算提醒不是消费封顶，Billable Usage 只看 usage-based overage，不看固定订阅费。**

如果只想做文档站、官网、博客，优先把页面放在 [Workers Static Assets](/platform/static-assets/) 或 [Pages](/platform/pages/) 上，搜索用 Pagefind，只有 API、评论、上传、AI 和后台任务进入 Worker。免费额度和 Workers Paid 的详细数值，先看 [免费与付费边界](/platform/free-paid/)。

## 三种账单类型

| 类型 | 何时计费 | 官方例子 | 普通项目判断 |
| --- | --- | --- | --- |
| Domain plan | 按 domain / zone 收固定费用，通常预付；月付约每 30 天结算一次，年付按年结算。 | Free、Pro、Business、Enterprise。 | Pro 是单个域名的站点计划；Workers Paid 不是 Pro。子域名不算单独 billable domain。 |
| Subscription / add-on | 通常按月固定费用预付。 | Load Balancing、Argo Smart Routing、Images Stream Bundle、Cache Reserve 等。 | 先确认 add-on 是固定费、按量费，还是两者都有；不要只看开关按钮。 |
| Usage-based | 上一个 billing period 的实际用量后付；很多产品有 included usage，超出后按量。 | Workers、R2、Cache Reserve operations、Stream、Images、Vectorize、Analytics Engine 等。 | 这是最需要观察和告警的一层；Billable Usage dashboard 和 Budget alerts 主要看这里。 |

账单日期使用 UTC。首次购买付费计划或 add-on 的日期，通常会成为该产品的 billing date。升级通常立即生效，降级和取消一般在当前 billing period 结束时生效，未使用时间不退款。

## Workers Paid 的位置

Workers Paid / Standard 是账户级的开发者平台订阅，官方 Workers Pricing 当前写的是每个账户每月最低 **$5 USD**。它会扩展 Workers、Pages Functions、KV、Hyperdrive、Durable Objects、Workers Logs、Builds 等开发者平台能力，但不会自动提升某个域名的 WAF、DNS、Cache Rules、SSL/TLS 或 Pro 功能。

| 问题 | 判断 |
| --- | --- |
| 它是不是 Cloudflare Pro？ | 不是。Pro 是 zone / domain plan，Workers Paid 是 developer platform account subscription。 |
| 它解决什么？ | Workers 请求、CPU、subrequests、Cron、日志、构建、部分开发者平台产品的 included usage。 |
| 它不解决什么？ | 域名级 Pro / Business 功能、更多 WAF Managed Rules、更多 DNS / SSL / Cache 计划能力。 |
| 它会不会产生按量费用？ | 会。Workers Paid 包含一定 monthly included usage，超过后继续按量计费。 |
| 静态站一定要买吗？ | 不一定。静态资产请求在 Workers Static Assets / Pages 上仍然非常友好，只有请求进入 Worker 脚本才消耗 Workers 计费口径。 |

## 免费与 Paid 额度入口

免费额度不是统一写在 Billing 页里，而是散在各产品 pricing / limits 页面里。本站把普通项目最常见的额度整理在 [免费与付费边界](/platform/free-paid/)。

| 产品 | 免费边界速记 | Paid / 付费入口速记 |
| --- | --- | --- |
| Workers | 100,000 requests/day、10 ms CPU/invocation。 | Workers Paid 每月最低 $5，包含 10M requests/month、30M CPU milliseconds/month，超出按量。 |
| Workers Static Assets | 静态资产请求免费且不限量；Free 单版本 20,000 files，25 MiB/file。 | Paid 单版本 100,000 files，25 MiB/file；静态资产请求仍不单独收费。 |
| Pages | 静态资产请求免费且不限量；Free 500 builds/month、1 concurrent build、20,000 files/site。 | Pro/Business 提升构建、并发和文件数；Pages Functions 按 Workers 口径。 |
| D1 | 5M rows read/day、100k rows written/day、5 GB total storage。 | Paid 每月 25B rows read、50M rows written、5 GB included，超出按量。 |
| KV | 100k reads/day、1k writes/day、1k deletes/day、1k lists/day、1 GB storage。 | Paid 每月 10M reads、1M writes/deletes/lists、1 GB included，超出按量。 |
| R2 | Standard storage 10 GB-month/month、Class A 1M/month、Class B 10M/month；无 egress bandwidth charge。 | Standard storage、Class A、Class B 超出 included usage 后按量。 |
| Durable Objects | Free 只支持 SQLite-backed DO；100,000 requests/day、13,000 GB-s/day。 | Paid 包含 1M requests/month、400,000 GB-s/month 和 SQLite storage included usage，超出按量。 |
| Queues | 10,000 operations/day，消息保留 24 小时。 | Paid 1M operations/month included，超出按 operation 计费。 |
| Workers AI | Free / Paid 都有 10,000 Neurons/day 免费分配。 | 超过每日免费分配需要 Workers Paid，之后按 Neurons 计费。 |
| Images / Stream / Browser Run | 免费边界和 included usage 与产品形态强相关。 | 上线前单独核对各产品 pricing；媒体和浏览器自动化最容易低估成本。 |

这张表只放判断入口。要写进预算或报价单时，不要引用二手整理，直接回到官方 pricing / limits 页面逐项核对。

## Usage-based 产品怎么看

Cloudflare Billing 文档把 usage-based billing 解释为：部分服务按上一个 billing period 的实际用量收费，很多产品只对超过 included usage 的部分收费。

| 产品 | 计费维度 | Billing 文档列出的 included usage |
| --- | --- | --- |
| Workers | Requests、CPU time。 | 10M requests、30M CPU-ms。 |
| R2 | Storage、Class A operations、Class B operations。 | 10 GB storage、1M Class A、10M Class B。 |
| Argo Smart Routing | Data transfer。 | 1 GB。 |
| Load Balancing | DNS queries。 | 500k DNS queries。 |
| Cache Reserve | Reads、writes、storage。 | Billing 文档未列 included usage。 |
| Stream | Minutes stored、minutes viewed。 | 以 Stream pricing 为准。 |
| Images | Transformations、storage、delivery。 | 以 Images pricing 为准。 |
| Spectrum | Traffic、application count 等。 | 以 Spectrum pricing 为准。 |
| Vectorize | Queried / stored vector dimensions。 | 以 Vectorize pricing 为准。 |
| Analytics Engine | Data points、read queries。 | 以 Analytics Engine pricing 为准。 |
| Zero Trust | Seats、日志或功能相关用量。 | 以 Zero Trust pricing 为准。 |

Usage-based 的关键不是背价格，而是知道每个产品的“计量单位”是什么。R2 不是只看存储，还要看 Class A / Class B；Workers 不是只看请求，还要看 CPU；Stream 不是只看上传，还要看存储和播放分钟数。

## Billable Usage 和告警

| 工具 | 能看到什么 | 不能做什么 | 适合场景 |
| --- | --- | --- | --- |
| Billable Usage dashboard | 账户内 usage-based overage 的每日成本和产品维度用量；数据来自生成月度发票的同一系统。 | 不显示固定 plan / subscription 费用；不支持 Enterprise contract 账户。 | 每周查看 R2、Workers、Images、Stream、Vectorize 等是否异常增长。 |
| Product sidebar usage | 在部分产品侧边栏查看当前账期内的 billable usage，并提供创建 budget alert 的入口。 | 不是单产品硬预算；最终仍以 invoice 为准。 | 进入 Workers、D1、R2、KV、Queues、Vectorize 等产品页时快速检查。 |
| Budget alerts | 按账户级 usage-based spend 设置美元阈值，跨过阈值后发邮件。 | 不会暂停服务、不会封顶消费、通常每个 billing period 只发一次。 | 给所有按量产品加一层提醒。 |
| Usage notifications | 按产品和指标设置通知，通常用于 Professional plan 或更高计划。 | 信息性提醒，不能替代发票。 | 某个产品指标特别敏感时，比如 R2 operations 或 Workers CPU。 |
| Invoice emails / PDF | 账单文件、历史发票和实际扣款记录。 | 已开出的 invoice 不能重新生成；变更通常体现在后续账期。 | 月度复盘、报销、对账和成本归因。 |

Budget alerts 和 usage notifications 都只是提醒。它们不会自动停止 Worker、R2、Images、Stream 或其他产品的用量。如果需要硬限制，要在业务侧做限流、配额、队列削峰和权限控制。

## Threshold billing

Threshold billing 是 Cloudflare 针对 usage-based 产品的自动收款机制。自助账户使用按量产品时，如果当前 billing cycle 内所有 usage-based 产品累计费用达到 Cloudflare 设置的阈值，Cloudflare 可能生成一次 mid-cycle invoice 并扣款。

普通项目需要记住三点：

1. threshold 由 Cloudflare 自动设置，用户不能自行修改。
2. mid-cycle invoice 只是提前收取已经产生的 usage-based 费用，账期末剩余用量仍会进入月末发票，不会重复计费。
3. 它不是预算功能，也不是封顶功能；预算提醒仍要自己配置。

## 权限、支付和发票

| 主题 | 实践判断 |
| --- | --- |
| Billing role | Billing 角色可以查看账单、付款、管理付款信息和设置预算提醒，但不能变更或取消订阅。 |
| Super Admin / Admin | 变更 domain plan、升级、降级和取消订阅通常需要 Super Admin 或 Admin。 |
| Payment methods | 支持常见信用卡、PayPal、Apple Pay、Google Pay、Stripe Link、UnionPay 等；自助账户通常最多保留两个 payment methods。 |
| Additional payment method auto-retry | 订阅续费失败时会尝试额外付款方式；只用于 subscription renewal，不用于首次购买或一次性付款。 |
| Outstanding balance | 未付款余额会阻止购买产品、升级订阅或更新 billing profile；付款后可能需要最多 24 小时恢复。 |
| Failed renewal retry | 订阅续费失败后，Cloudflare 会在数天内重试默认付款方式；仍可手动支付。 |
| Invoice | Free plan 也可能出现 $0 invoice；很多 $0 line item 只是说明产品维度存在、没有产生超额费用。 |
| Sales tax | 税费依据 billing address / shipping address 等信息计算；美国免税需要按官方流程提交证明。 |

更改 DNS、把流量迁走或停止使用某个服务，不等于取消 Cloudflare 订阅。要停止付费，需要在 Dashboard 里取消相应 plan、subscription 或 add-on。

## 普通项目账单清单

| 阶段 | 检查项 |
| --- | --- |
| 开始使用 Cloudflare | 确认哪些是 domain plan，哪些是 Workers Paid，哪些是 usage-based 产品。 |
| 开启付费产品前 | 读对应 pricing / limits；确认 included usage、超额单价、是否有 add-on 固定费。 |
| 开启 Workers Paid 后 | 观察 Workers requests、CPU、Logs、Builds，以及 D1 / KV / Durable Objects / Queues 的 included usage。 |
| 开启 R2 / Images / Stream 后 | 单独观察存储、操作、转换、播放分钟数；媒体产品不要只看流量。 |
| 每个账期 | 查看 Billable Usage dashboard、预算提醒邮件和 invoice；把异常产品回到架构里排查。 |
| 降级或取消前 | 至少提前一天处理，移除多余 add-on、Page Rules、plan-only 功能和生产依赖。 |

## 常见误解

| 误解 | 更准确的说法 |
| --- | --- |
| Workers Paid 等于 Cloudflare Pro。 | Workers Paid 是账户级开发者平台订阅，Pro 是单个 zone / domain plan。 |
| Budget alert 会阻止继续消费。 | Budget alert 只发邮件，不暂停服务，也不封顶。 |
| Billable Usage dashboard 就是完整账单。 | 它主要显示 usage-based overage，不包含固定 plan / subscription 费用。 |
| Free plan 一定没有 invoice。 | Free plan 可能有 $0 invoice，用于列出活动产品维度。 |
| R2 免 egress 就永远免费。 | R2 不收 egress bandwidth charge，但 storage、Class A、Class B 会计费。 |
| 静态资产免费，所以所有请求都免费。 | 静态资产请求友好；进入 Worker 脚本、D1、R2、Images、Stream 后仍按对应产品口径计量。 |
| 取消 DNS 托管就是取消订阅。 | DNS 变更不取消 Cloudflare 付费服务，必须在 Dashboard 里取消。 |
| Threshold billing 是重复扣款。 | 它是 usage-based 产品达到阈值后的中途收款，月末只收剩余未覆盖用量。 |

## GitHub 开源参考

| 仓库 / 源文件 | 用途 |
| --- | --- |
| [cloudflare/cloudflare-docs Billing source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/billing) | 官方 Billing 文档源文件，适合追踪账单、预算、付款和发票规则变更。 |
| [usage-based-billing.mdx](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/billing/understand/usage-based-billing.mdx) | usage-based billing 的官方源文件，适合核对按量计费产品和 included usage。 |
| [billable-usage.mdx](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/billing/manage/billable-usage.mdx) | Billable Usage dashboard 的官方源文件，适合核对 dashboard 能看什么、不能看什么。 |
| [budget-alerts.mdx](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/billing/manage/budget-alerts.mdx) | Budget alerts 的官方源文件，适合核对提醒机制和限制。 |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，适合学习教程站的学习路线、资料索引和持续更新方式。 |

## 官方资料

- [Cloudflare Billing Docs](https://developers.cloudflare.com/billing/)
- [How Cloudflare billing works](https://developers.cloudflare.com/billing/understand/how-billing-works/)
- [Usage-based billing](https://developers.cloudflare.com/billing/understand/usage-based-billing/)
- [Monitor billable usage](https://developers.cloudflare.com/billing/manage/billable-usage/)
- [Budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/)
- [Threshold billing](https://developers.cloudflare.com/billing/threshold-billing/)
- [Billing policy](https://developers.cloudflare.com/billing/understand/billing-policy/)
- [Billing permissions](https://developers.cloudflare.com/billing/understand/billing-permissions/)
- [Invoices](https://developers.cloudflare.com/billing/manage/invoices/)
- [Change your plan](https://developers.cloudflare.com/billing/manage/change-plan/)
- [Cancel subscriptions](https://developers.cloudflare.com/billing/manage/cancel-subscription/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Static Assets Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
