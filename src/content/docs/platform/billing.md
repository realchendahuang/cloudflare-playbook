---
title: 账单与预算
description: Cloudflare 账单、免费额度、Workers Paid、按量计费和预算提醒的普通项目判断。
---

最后核对日期：2026-06-18。账单、价格、免费额度和计划边界会变化；涉及金额、发票和取消订阅时，以 Cloudflare 官方 Billing / Pricing / Limits 页面为准。

这页只解决普通项目最常见的账单判断：哪些能免费跑，`$5/month` Workers Paid 买到什么，哪些付费和 Workers Paid 没关系，什么时候要看用量。

## 先记住

| 判断 | 结论 |
| --- | --- |
| Workers Paid 是不是 Cloudflare Pro？ | 不是。Workers Paid 是账号级开发者平台订阅；Pro / Business 是单个 domain / zone 的站点计划。 |
| 静态站一定要付费吗？ | 不一定。Workers Static Assets / Pages 的静态资产请求免费且不限量，只有动态请求才进入 Workers 计费口径。 |
| Budget alerts 会不会自动封顶？ | 不会。它只发邮件提醒，不能暂停 Worker、R2、Images、Stream 或其他按量产品。 |
| Billable Usage 是不是完整账单？ | 不是。它主要看 usage-based overage，不覆盖固定订阅和大部分 plan 费用。 |
| R2 免 egress 是不是完全免费？ | 不是。R2 不收 egress bandwidth charge，但 storage、Class A、Class B 仍要看。 |

## 四类费用

| 类型 | 常见产品 | 普通项目怎么判断 |
| --- | --- | --- |
| Domain plan | Free、Pro、Business、Enterprise | 影响单个域名的 WAF、Cache、Rules、证书和安全能力。 |
| Workers Paid | Workers、Pages Functions、KV、D1、Queues、Durable Objects、Logs 等 | 每账号最低 `$5/month`，主要买动态请求、CPU、日志和开发者平台额度。 |
| Add-on | Load Balancing、Argo、Images Paid、Stream、Log Explorer 等 | 不要看到开关就买；先确认固定费、按量费和是否真的需要。 |
| Usage-based | Workers overage、R2 operations、Images、Stream、Vectorize、Analytics Engine 等 | 付费前先开预算提醒，再做限流、缓存和配额。 |

## Workers Paid 放在哪里

Workers Paid 值得付费的信号很具体：

| 信号 | 为什么 |
| --- | --- |
| Worker 请求接近 100,000/day。 | Free 是日额度；Paid 变成月度额度，并允许继续按量扩展。 |
| CPU 经常超过 10 ms。 | SSR、AI 前处理、批量解析和复杂代理会先撞 CPU。 |
| Workers Logs 3 天留存不够。 | Paid 的日志额度和留存更适合生产排障。 |
| D1、KV、Queues、Durable Objects 已经成为核心路径。 | 这些产品在 Paid 下会进入更高额度或更完整能力。 |
| 需要更多 Cron、Worker 数量、Subrequests 或更大 bundle。 | 这是开发者平台工程化能力，不是域名计划能力。 |

Workers Paid 不会提升 WAF、Bot、Cache Rules、SSL/TLS、DNS 记录数、Load Balancing 或企业网络能力。完整数字见 [免费额度大全](/platform/free-paid/)。

## 付费前检查

| 要开的能力 | 先问什么 |
| --- | --- |
| Workers Paid | 动态请求和 CPU 是否真实撞线，还是静态资源误进 Worker？ |
| R2 | 免费的 10 GB-month、1M Class A、10M Class B 是否够用？热点下载有没有缓存？ |
| Images / Stream | 图片转换、图片交付、视频存储和播放分钟数是否估过？ |
| Load Balancing / Argo | 现在的问题是可用性、路由还是源站性能？有没有更简单的缓存和回源优化？ |
| Log Explorer / Logpush | 是真的需要长期审计，还是 Workers Logs 已经够排障？ |
| Pro / Business | 需要的是域名计划能力，还是开发者平台能力？不要把 Pro 和 Workers Paid 混在一起买。 |

## 账单怎么盯

| 工具 | 看什么 | 别误会 |
| --- | --- | --- |
| Billable Usage | usage-based 产品的每日成本和产品维度用量。 | 不是完整账单，不显示所有固定订阅费。 |
| Product usage | Workers、D1、R2、KV、Queues 等产品侧用量。 | 只是辅助观察，最终以 invoice 为准。 |
| Budget alerts | account-wide usage-based spend 的美元阈值邮件。 | 不是硬封顶，不会自动停服务。 |
| Invoice / Subscriptions | 实际发票、续费日期、订阅和取消入口。 | 改 DNS 或迁走流量不等于取消订阅。 |

最低做法：启用付费前开 Budget alerts；每周看一次 Billable Usage；每个账期看 invoice；异常增长先回到架构里找动态请求、CPU、R2 operations、媒体播放和 AI 调用。

## 降级和取消

| 操作 | 先检查 |
| --- | --- |
| 取消 Workers Paid | Worker 请求、CPU、D1、KV、Queues、Durable Objects、Workers Logs、Containers、Email Sending 是否依赖 Paid。 |
| Pro / Business 降到 Free | WAF、Cache、Rules、证书、上传体积和其他 plan-only 配置是否超出 Free。 |
| 停用 R2 / Images / Stream | 数据是否迁走或删除，存储、转换、播放、operations 是否停止增长。 |
| 域名迁出 Cloudflare | DNS 迁出不取消订阅，仍要在 Billing / Subscriptions 里处理。 |
| 取消 add-on | 先关功能，再取消订阅；不要只删配置文件。 |

## 常见误区

| 误区 | 更准确的说法 |
| --- | --- |
| 免费额度够大，所以不用看账单。 | 免费额度不是无限额度，公开项目要知道最先撞哪条线。 |
| Workers Paid 可以解决所有 Cloudflare 配额。 | 它只覆盖开发者平台，不覆盖 zone plan、add-on、Enterprise 和媒体产品。 |
| 预算提醒会保护我不超支。 | 它只是提醒；真正的保护是静态优先、限流、队列、配额和权限。 |
| 所有请求都进 Worker 方便统计。 | 静态资产应该直接命中 Assets / Pages，动态路径才进 Worker。 |
| R2 / Images / Stream 只看流量。 | 它们还要看存储、操作、转换、播放分钟数或交付次数。 |

## 事实来源

| 来源 | 用途 |
| --- | --- |
| [Cloudflare Billing Docs](https://developers.cloudflare.com/billing/) | 账单、发票、订阅、付款和预算提醒入口。 |
| [Usage-based billing](https://developers.cloudflare.com/billing/understand/usage-based-billing/) | 哪些产品按用量计费，以及已包含用量的判断方式。 |
| [Monitor billable usage](https://developers.cloudflare.com/billing/manage/billable-usage/) | Billable Usage dashboard 能看什么、不能看什么。 |
| [Budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/) | 预算提醒的触发方式和限制。 |
| [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/) | Workers Paid、请求、CPU、日志和开发者平台额度。 |
