---
title: 观测与日志
description: Cloudflare Web Analytics、Analytics、Workers Logs、Logpush、Log Explorer、Notifications 和 Analytics Engine 的选择边界。
---

最后核对日期：2026-06-17。Cloudflare 的日志、分析和告警产品变化很快，价格、保留期、采样、可用计划和 API 限制以官方页面为准。

观测不是“把所有东西都打日志”。对普通项目来说，最重要的是先分清三件事：用户体验有没有变差、请求到底在哪里失败、日志留存值不值得付费。

```text
一次线上问题
  ├─ 先看实时状态
  │    ├─ Workers Real-time logs / wrangler tail
  │    └─ Dashboard Analytics / Web Analytics
  │
  ├─ 再定位单个请求
  │    ├─ Ray ID
  │    ├─ Workers Logs
  │    └─ Security Events / Log Explorer / Logpush
  │
  └─ 最后沉淀长期指标
       ├─ GraphQL Analytics API
       ├─ Workers Analytics Engine
       └─ Notifications / Budget alerts
```

## 一句话判断

普通项目的 Cloudflare 观测最佳实践是：**文档站和官网先开 Web Analytics；Worker API 先用 Real-time logs 和 Workers Logs；需要自定义产品指标再用 Analytics Engine；需要长期取证或外部 SIEM 再考虑 Log Explorer / Logpush；告警先从 Notifications 和 Budget alerts 开始。**

不要一上来就做一套日志平台。早期真正要解决的是：报错时能看到请求、能知道是否被规则拦截、能控制日志量、能发现账单异常。

## 产品定位

| 产品 | 解决的问题 | 普通项目什么时候用 |
| --- | --- | --- |
| Web Analytics | 站点访问、页面性能和真实用户体验。 | 文档站、官网、博客、落地页默认开启。 |
| Dashboard Analytics | Cloudflare 各产品在仪表盘里的指标汇总。 | 日常看流量、缓存、WAF、安全事件、Workers 使用量。 |
| GraphQL Analytics API | 用 API 查询 Cloudflare 多产品聚合指标。 | 需要自动报表、外部 dashboard、周期性巡检时。 |
| Workers Real-time logs | 近实时看 Worker 请求、日志、异常。 | 部署后验证、临时排障、本地终端 `wrangler tail`。 |
| Workers Logs | 存储、过滤和分析 Worker 日志。 | Worker 已经是生产入口，需要按字段查询错误和请求。 |
| Workers Analytics Engine | 从 Worker 写入自定义高基数事件并用 SQL 查询。 | 需要按用户、租户、功能、路径统计产品指标。 |
| Cloudflare Logs / Logpush | 把 Cloudflare 产品日志推到 R2、SIEM 或日志服务。 | 需要长期留存、合规、外部安全分析或统一日志平台。 |
| Log Explorer | 在 Cloudflare 内部存储并搜索日志。 | 不想维护外部日志管道，但需要取证和历史查询。 |
| Notifications | 账号、域名、流量、源站、安全、用量相关告警。 | 任何正式项目都应该至少配置邮箱告警。 |

## 免费与付费边界

| 能力 | 免费 / 免费边界 | 付费入口 | 成本提醒 |
| --- | --- | --- | --- |
| Web Analytics | Available on all plans；非 Cloudflare 代理站点最多 10 个；Cloudflare 代理站点不限数量；Free 计划 Web Analytics rules 为 0。 | Pro / Business / Enterprise 分别提供 5 / 20 / 100 条 rules。 | 它是站点 RUM 和页面体验，不是后端业务事件库。 |
| Dashboard Analytics | 随产品提供；具体数据范围、保留期和字段随产品与计划变化。 | 更长时间范围、更细字段或企业数据通常跟随对应产品计划。 | Dashboard 指标可能采样，适合趋势判断，不适合作为唯一账单依据。 |
| GraphQL Analytics API | 官方默认用户限制为 5 分钟 300 个 GraphQL queries；zone 查询最多 10 个 zones，account 查询 1 个 account。 | 节点级数据可用性、回溯时间和字段随 zone / account 计划变化。 | GraphQL 用于聚合分析，不应用来精确复算 Cloudflare 账单。 |
| Workers Real-time logs | 可在 dashboard 或 `wrangler tail` 查看近实时日志。 | 高流量时可能采样；长期留存要用 Workers Logs、Logpush 或 Tail Workers。 | 最多 10 个客户端同时查看同一个 Worker 的实时日志。 |
| Workers Logs | Workers Free：200,000 log events/day，保留 3 天。 | Workers Paid：20M log events/month included，超出 $0.60/million，保留 7 天。 | 每个请求至少可能有 invocation log；高流量 Worker 要设置 `head_sampling_rate`。 |
| Workers Logs 平台限制 | 最大日志保留期 7 天；单条日志最大 256 KB；账号每天最多 5B logs，超过后当天剩余部分应用 1% head-based sample。 | 不同留存和外部目的地走 Logpush、Tail Workers 或第三方。 | 结构化 JSON 日志更好查，但不要记录 token、cookie、密钥和正文隐私。 |
| Workers Trace Events Logpush | Free 不可用。 | Workers Paid 可用：10M requests/month included，超出 $0.05/million。 | 只计入最终到达目的地的 request logs，可通过过滤和采样控制量。 |
| Cloudflare Logpush | 常规 Logpush 在 Free / Pro / Business 不可用，Enterprise 可用；每个 zone 最多 4 个 Logpush jobs。 | Enterprise；Workers Trace Events Logpush 是 Workers Paid 例外。 | Logpush 不存储、不搜索、不能回填历史；job 失败期间日志永久丢失。 |
| Log Explorer | 目前没有免费版本或试用。 | 作为 Application Services 或 Zero Trust 购买的付费 add-on，按 ingest 和 stored GB 计费。 | 查询次数不额外计费；合同客户可选最长 2 年留存，额外 $0.10/GB/month。 |
| Workers Analytics Engine | Workers Free：100,000 data points/day，10,000 read queries/day；数据保留 3 个月。 | Workers Paid：10M data points/month included，超出 $0.25/million；1M read queries/month included，超出 $1/million。 | 官方当前说明暂未开始收费，价格用于预估未来成本。 |
| Notifications | Available on all plans；Free 可配置 email-based notifications。 | Professional+ 可用 webhooks；Business+ 可用 PagerDuty。 | Notifications 只对 Proxied 域名工作；Budget alerts 只提醒，不会自动停服。 |

## 先选哪一套

| 场景 | 推荐组合 | 不建议一开始做什么 |
| --- | --- | --- |
| 纯文档站 / 官网 | Web Analytics + Dashboard Analytics + Budget alerts。 | 自建埋点、接外部日志平台、为搜索请求写后端日志。 |
| 有 Worker API | Real-time logs + Workers Logs + 结构化错误日志。 | 把请求体、token、cookie、邮箱正文写进日志。 |
| 有评论 / 表单 / 上传 | Workers Logs + WAF Security Events + Turnstile / Rate Limiting。 | 只看应用日志，不看是否被边缘规则拦截。 |
| 有客户或租户指标 | Analytics Engine。 | 用 D1 记录高频埋点，或用 KV 做计数器。 |
| 有自动报表 | GraphQL Analytics API + 定时 Worker。 | 用 GraphQL Analytics API 反推账单。 |
| 有安全取证要求 | Log Explorer 或 Logpush 到 R2 / SIEM。 | 只靠 3 到 7 天 Worker 日志留存。 |
| 有外部可观测平台 | Logpush / Tail Workers / OpenTelemetry 导出。 | 同时接多个日志目的地但没有采样策略。 |

## 排障路径与事实源

Cloudflare 的观测产品有不同事实口径。小项目最容易犯的错误，是把趋势图、日志、账单和业务事实混在一起。更稳妥的判断顺序如下：

| 要回答的问题 | 优先事实源 | 不要依赖什么 |
| --- | --- | --- |
| 用户是不是访问变慢了？ | Web Analytics、Dashboard Analytics、Speed / Observatory。 | 单条 Worker 日志；它只能解释某个请求，不代表整体体验。 |
| 某个请求为什么失败？ | Ray ID、Workers Logs、Security Events、源站日志。 | Dashboard 趋势图；采样后的趋势不能替代单请求证据。 |
| Worker 是否抛错？ | Workers Logs、Real-time logs、部署版本和异常栈。 | 只看前端报错；边缘异常可能没有完整传回浏览器。 |
| 是不是被 WAF、Bot 或 Rate Limiting 拦了？ | Security Events、Log Explorer / Logpush 里的安全数据集。 | 应用层日志；被边缘拦截的请求可能根本没有到 Worker 或源站。 |
| 某个功能是否被真实使用？ | Analytics Engine、D1 业务表或产品自己的事件表。 | Web Analytics；页面访问不能等同于业务事件。 |
| 账单会不会超？ | Billing、Billable Usage、Budget alerts、产品 pricing。 | GraphQL Analytics API；它是分析口径，不是账单口径。 |
| 需要长期取证吗？ | Log Explorer 或 Logpush 到 R2 / SIEM。 | Workers Logs 默认留存；Free 只有 3 天，Paid 也只有 7 天。 |

所以普通项目可以先定一条很朴素的链路：**趋势看 Analytics，单请求看 Ray ID 和 Logs，安全拦截看 Security Events，业务指标写 Analytics Engine 或 D1，账单只看 Billing。**

## 数据出口选择

| 出口 | 适合什么 | 关键边界 |
| --- | --- | --- |
| Workers Logs | Worker 生产排障、结构化错误、短期查询。 | Free 200,000 log events/day、3 天留存；Paid 20M log events/month、7 天留存。 |
| Workers Real-time logs | 部署后验证、临时排障、`wrangler tail`。 | 是在线调试工具，不是长期存储。 |
| Workers Trace Events Logpush | Workers Paid 项目把请求日志推到 R2、SIEM 或外部日志平台。 | Free 不可用；只推送到达目的地的 request logs，要配过滤和采样。 |
| 常规 Logpush | Enterprise 把多产品日志推到外部目的地。 | Free / Pro / Business 不可用；每个 zone 最多 4 个 jobs；不能回填历史。 |
| Log Explorer | 不想维护外部日志系统，但需要 Cloudflare 内部存储、SQL 查询和取证。 | 没有免费版或试用；按 ingest 和 stored GB 计费，查询不额外计费。 |
| Analytics Engine | Worker 写高基数业务事件，用 SQL 查询。 | 数据点和读查询计费；数据留存 3 个月，不是事务数据库。 |
| GraphQL Analytics API | 自动报表、巡检、跨产品聚合查询。 | 默认 5 分钟 300 个 GraphQL queries；结果可能受采样和节点限制影响。 |

## 日志怎么写

Workers Logs 官方建议使用结构化 JSON，因为字段会被提取并用于过滤。普通项目可以先把日志压成这几个字段：

| 字段 | 建议 |
| --- | --- |
| `event` | 稳定事件名，例如 `api_error`、`comment_created`、`upload_failed`。 |
| `request_id` | 自己生成的请求 ID，便于跨 Worker、D1、R2 和前端串联。 |
| `ray_id` | 从 `cf-ray` 或响应头记录 Cloudflare Ray ID，便于回查边缘请求。 |
| `path` | 只记录路径和必要查询分类，不记录完整敏感 query。 |
| `status` | HTTP 状态码或业务错误码。 |
| `duration_ms` | 业务处理耗时。 |
| `user_or_tenant_hash` | 需要按用户或租户排查时存 hash，不直接写邮箱和 token。 |
| `error_type` | 稳定错误类别，避免每次都靠全文检索。 |

## 采样和留存

Cloudflare Analytics 使用 Adaptive Bit Rate sampling。它会在 100%、10%、1% 等分辨率之间选择合适的数据层级，让大查询不会拖慢整个系统。这个设计适合看趋势、异常、排行和比例，但极低频事件可能被采样漏掉。

所以排障时要分层：

1. 看趋势：Dashboard Analytics、Web Analytics、GraphQL Analytics API。
2. 看单个请求：Ray ID、Workers Logs、Security Events、Log Explorer。
3. 看业务指标：Analytics Engine 或自己的 D1 事务数据。
4. 看长期取证：Log Explorer 或 Logpush 到 R2 / SIEM。

## 小项目默认配置

```text
文档站
  ├─ Web Analytics
  ├─ Pagefind 搜索
  └─ Budget alerts

动态 API
  ├─ Workers Logs
  │    ├─ JSON 结构化日志
  │    └─ 生产采样策略
  ├─ Real-time logs / wrangler tail
  └─ Notifications

增长后
  ├─ Analytics Engine
  ├─ GraphQL Analytics API
  └─ Log Explorer / Logpush
```

本站当前是静态文档站加少量评论服务，所以默认不需要外部日志平台。更合理的顺序是先把 Cloudflare 的免费和 Workers Paid 观测能力用好，等评论、搜索、API 或 AI 功能有真实使用量，再为长期日志和自然语言分析付费。

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 只要 `console.log` 就够了。 | 生产日志要结构化，至少能按事件、状态、路径和 request id 查。 |
| 把日志当数据库。 | 日志用于排障和取证，业务事实仍然写 D1、R2 或 Analytics Engine。 |
| 所有日志永久保留。 | 先定义排障窗口；超出 3 到 7 天才考虑 Log Explorer / Logpush。 |
| 忽略采样。 | 趋势图可采样，单请求取证要找 Ray ID、日志和安全事件。 |
| 看到 Cloudflare 免费就不设预算。 | Budget alerts 仍然要开；它提醒账单风险，但不会自动停止服务。 |
| 认为 Logpush 会帮你补历史。 | Logpush 只推送可用后产生的日志，失败期间不能回填。 |
| 用 GraphQL Analytics API 算账单。 | GraphQL 是分析口径，不是账单口径；账单看 Billing 和产品 pricing。 |

## GitHub 开源参考

| 仓库 | 值得参考的点 |
| --- | --- |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，适合学习开源教程站如何组织学习路线、资料索引和实践文章。 |
| [cloudflare/cloudflare-docs Analytics source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/analytics) | Analytics、GraphQL Analytics API、sampling、Workers Analytics Engine 官方文档源文件。 |
| [cloudflare/cloudflare-docs Workers observability source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workers/observability) | Workers Logs、Real-time logs、Tail Workers、Logpush、traces 和导出集成源文件。 |
| [cloudflare/cloudflare-docs Logs source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/logs) | Logpush、Instant Logs、Logpull、日志字段和目的地配置源文件。 |
| [cloudflare/cloudflare-docs Log Explorer source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/log-explorer) | Log Explorer、Log Search、SQL queries、API、pricing 和 dataset 管理源文件。 |
| [cloudflare/cloudflare-docs Web Analytics source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/web-analytics) | Web Analytics、RUM、rules、limits 和指标说明源文件。 |
| [cloudflare/cloudflare-docs Notifications source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/notifications) | Notifications、webhooks、PagerDuty、traffic alerts 和 payload schema 源文件。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Miniflare 和 Workers SDK；排查 `wrangler tail`、deploy、types 和本地开发行为时优先看。 |
| [cloudflare/cloudflare-prometheus-exporter](https://github.com/cloudflare/cloudflare-prometheus-exporter) | Cloudflare 指标导出到 Prometheus 的官方开源参考，基于 Workers 和 Durable Objects。 |
| [cloudflare/workers-honeycomb-logger](https://github.com/cloudflare/workers-honeycomb-logger) | Workers 请求事件和 traces 发送到 Honeycomb 的开源库，适合看外部可观测平台接入方式。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 团队化管理 Logpush、rulesets、DNS、zone 设置等资源的 IaC 参考。 |

## 官方资料

- [Analytics](https://developers.cloudflare.com/analytics/)
- [Understanding sampling in Cloudflare Analytics](https://developers.cloudflare.com/analytics/sampling/)
- [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/)
- [GraphQL Analytics API Limits](https://developers.cloudflare.com/analytics/graphql-api/limits/)
- [Workers Analytics Engine Pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)
- [Workers Analytics Engine Limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/)
- [Cloudflare Logs](https://developers.cloudflare.com/logs/)
- [Logpush](https://developers.cloudflare.com/logs/logpush/)
- [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
- [Workers Real-time logs](https://developers.cloudflare.com/workers/observability/logs/real-time-logs/)
- [Workers Logpush](https://developers.cloudflare.com/workers/observability/logs/logpush/)
- [Log Explorer](https://developers.cloudflare.com/log-explorer/)
- [Log Explorer Pricing and managing usage](https://developers.cloudflare.com/log-explorer/pricing/)
- [Web Analytics](https://developers.cloudflare.com/web-analytics/)
- [Web Analytics Limits](https://developers.cloudflare.com/web-analytics/limits/)
- [Notifications](https://developers.cloudflare.com/notifications/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
