---
title: 观测与日志
description: Cloudflare Web Analytics、Workers Logs、Logpush、Log Explorer、Notifications 和 Analytics Engine 的免费边界与实践路线。
---

最后核对日期：2026-06-18。Cloudflare 的日志、分析、告警和计费口径变化很快，价格、保留期、采样、可用计划和 API 限制以官方 pricing / limits 页面为准。

观测不是把所有数据都存下来。普通项目最关心的是三件事：免费阶段能看到什么，`$5/month` Workers Paid 多买到什么，什么时候才需要 Logpush、Log Explorer 或外部 SIEM。

## 一句话判断

文档站、官网和博客先开 Web Analytics 与 Budget alerts；有 Worker API 后再看 Real-time logs 和 Workers Logs；需要产品指标再用 Analytics Engine；需要长期取证、合规审计或外部安全分析时，再考虑 Log Explorer / Logpush。

## 免费额度先看

这张表先解决“日志和分析到底能免费用多少”的问题。真正要花钱的地方不是“看图表”，而是长期保存、外部导出、高流量日志和自定义指标。

| 能力 | Free / 免费边界 | Workers Paid / 付费边界 | 普通项目判断 |
| --- | --- | --- | --- |
| Web Analytics | 所有计划可用；代理站点不限，非代理站点最多 10 个；Free 的 Web Analytics rules 为 0。 | Pro / Business / Enterprise 的 rules 分别为 5 / 20 / 100。 | 文档站、官网、博客默认开启，用来看访问趋势和页面体验。 |
| Real-time logs | 可近实时查看 Worker 日志、异常和请求事件；不负责存储。 | 高流量可能采样；长期保存要转 Workers Logs、Workers Logpush 或 Tail Workers。 | 部署后验证和临时排障够用，不要当日志库。 |
| Workers Logs | 200,000 log events/day，保留 3 天。 | 20M log events/month included，超出 $0.60/million，保留 7 天。 | 免费阶段能查近期问题；生产流量变大后要采样和脱敏。 |
| Workers Trace Events Logpush | Free 不可用。 | Workers Paid 可用；10M requests/month included，超出 $0.05/million。 | 只有需要把 Worker trace events 长期推到 R2、SIEM 或日志平台时再用。 |
| Cloudflare Logpush | 常规 Logpush 在 Free / Pro / Business 不可用；每个 zone 最多 4 个 Logpush jobs。 | Enterprise；Workers Trace Events Logpush 是 Workers Paid 的例外。 | 普通项目不要一开始规划企业日志管道。 |
| Log Explorer | 当前没有免费版本或试用。 | Application Services 或 Zero Trust 的 paid add-on，按 ingest 和 stored GB 计费，查询不额外计费。 | 需要历史取证和 Cloudflare 内部日志搜索时再买。 |
| GraphQL Analytics API | 默认用户限制为 5 分钟 300 个 GraphQL queries；zone-scoped query 最多 10 个 zones，account-scoped query 只能 1 个 account。 | 字段、数据集、历史范围和节点限制跟随具体 zone / account 计划。 | 适合自动报表和巡检，不适合复算账单。 |
| Analytics Engine | 100,000 data points/day、10,000 read queries/day；数据保留 3 个月。 | 10M data points/month included，超出 $0.25/million；1M read queries/month included，超出 $1/million。 | 适合高基数产品指标，不是事务数据库。 |
| Notifications | 所有计划可用；Free 可配置 email-based notifications。 | Professional+ 支持 webhooks；Business+ 支持 PagerDuty。 | 正式项目至少配置邮箱通知。 |
| Budget alerts | Pay-as-you-go 账号可按美元阈值发邮件提醒 account-wide usage-based spend。 | 它不是消费硬封顶；usage notifications 另按产品阈值配置。 | 付费前先开，但真正的成本控制仍靠限流、缓存、队列和配额。 |

## 普通项目路线

| 项目阶段 | 先用什么 | 暂时不要做什么 |
| --- | --- | --- |
| 纯静态文档站 / 官网 | Web Analytics + Budget alerts。 | 自建埋点、长期日志、外部 SIEM。 |
| 有 Worker API | Real-time logs + Workers Logs + request id / Ray ID。 | 把请求体、token、cookie、邮箱和评论全文写进日志。 |
| 有评论、表单、上传 | Workers Logs + Security Events + Turnstile / Rate Limiting。 | 只看应用日志，忽略边缘规则拦截。 |
| 有产品指标 | Analytics Engine；关键业务事实仍写 D1 / R2。 | 用日志当数据库，或用 D1 记录高频埋点。 |
| 有自动报表 | GraphQL Analytics API + 定时任务。 | 用 GraphQL Analytics API 反推账单。 |
| 有安全取证或客户支持要求 | Log Explorer 或 Logpush 到 R2 / SIEM。 | 只靠 3 到 7 天 Workers Logs 留存。 |

## 先看什么

| 要回答的问题 | 优先事实源 | 边界 |
| --- | --- | --- |
| 用户是不是访问变慢了？ | Web Analytics、Dashboard Analytics、Speed / Observatory。 | 趋势图适合看整体，不解释单个请求。 |
| 某个请求为什么失败？ | Ray ID、Workers Logs、Real-time logs、源站日志。 | 临时日志可能采样，长期查询看 Workers Logs 或日志出口。 |
| 是不是被 WAF、Bot 或 Rate Limiting 拦了？ | Security Events、Log Explorer / Logpush 里的安全数据集。 | 被边缘拦截的请求可能不到 Worker。 |
| 某个功能是否被真实使用？ | Analytics Engine、D1 业务表或产品自己的事件表。 | Web Analytics 的页面访问不等于业务事件。 |
| 会不会超预算？ | Billing、Billable Usage、Budget alerts、产品 pricing。 | Budget alerts 只提醒，不暂停服务。 |

## 日志边界

生产日志要能定位问题，也要能控制成本。普通项目先记录这些字段就够了：

| 字段 | 用途 |
| --- | --- |
| `event` | 稳定事件名，例如 `api_error`、`comment_created`、`upload_failed`。 |
| `request_id` | 串联前端、Worker、D1、R2 和队列任务。 |
| `ray_id` | 回查 Cloudflare 边缘请求和安全事件。 |
| `path` | 记录路径或路由类型，避免完整敏感 query。 |
| `status` | HTTP 状态码或业务错误码。 |
| `duration_ms` | 判断慢请求和外部依赖耗时。 |
| `error_type` | 稳定错误类别，避免每次靠全文搜索。 |

不要写进日志：

| 内容 | 原因 | 替代做法 |
| --- | --- | --- |
| `authorization` / cookie | 凭证泄露风险最高。 | 只记录认证方式和 hash 后的主体。 |
| API token / secret | 这些值只应该存在于服务端 secret。 | 记录 secret 名称或调用结果。 |
| 评论全文、私信、邮件正文 | 隐私和合规风险高。 | 记录长度、审核状态、错误类型。 |
| 完整 query string / request body | 可能包含 token、邮箱和搜索隐私，也会增加日志体积。 | 记录白名单字段、object key 和 size。 |

## 升级信号

| 信号 | 该看什么 |
| --- | --- |
| 3 天日志不够排查问题 | Workers Paid 的 7 天 Workers Logs，或外部日志出口。 |
| 需要长期留存 Worker trace events | Workers Trace Events Logpush。 |
| 需要多产品安全取证和内部搜索 | Log Explorer 或 Enterprise Logpush。 |
| 需要按用户、租户、功能统计高基数事件 | Analytics Engine。 |
| 需要把指标自动发给团队 | GraphQL Analytics API + Notifications。 |
| 日志量开始接近免费额度 | 先采样、减少字段、脱敏，再考虑付费。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| Real-time logs 就是日志存储。 | 它适合临时排障；存储、过滤和分析看 Workers Logs。 |
| Workers Logs 免费就可以全量记录所有内容。 | Free 有 200,000 log events/day 和 3 天留存；高流量要采样，敏感字段要脱敏。 |
| Workers Paid 等于企业日志能力。 | Workers Paid 只解锁 Workers Trace Events Logpush；常规 Logpush 仍是 Enterprise。 |
| Budget alerts 能阻止扣费。 | 它只发邮件提醒，不暂停服务，也不停止按量产品。 |
| GraphQL Analytics API 可以算账单。 | GraphQL 是分析口径；账单看 Billing、Billable Usage 和产品 pricing。 |
| 日志越多越安全。 | 先定义排障窗口、敏感字段边界和采样策略；长期取证再买日志产品。 |

## GitHub 开源参考

| 仓库 | 值得参考的点 |
| --- | --- |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，适合学习教程站如何组织学习路线、资料索引和实践文章。 |
| [cloudflare/cloudflare-docs Analytics source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/analytics) | Web Analytics、GraphQL Analytics API、sampling、Workers Analytics Engine 官方文档源文件。 |
| [cloudflare/cloudflare-docs Workers observability source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workers/observability) | Workers Logs、Real-time logs、Tail Workers、Workers Logpush、traces 和导出集成源文件。 |
| [cloudflare/cloudflare-docs Logs source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/logs) | Logpush、日志字段、目的地和可用计划源文件。 |
| [cloudflare/cloudflare-docs Log Explorer source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/log-explorer) | Log Explorer、Log Search、SQL queries、API、pricing 和 dataset 管理源文件。 |
| [cloudflare/cloudflare-docs Notifications source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/notifications) | Notifications、webhooks、PagerDuty、traffic alerts 和 payload schema 源文件。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Miniflare 和 Workers SDK；排查部署、tail、types 和本地开发行为时优先看。 |

## 事实来源

- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
- [Workers Real-time logs](https://developers.cloudflare.com/workers/observability/logs/real-time-logs/)
- [Workers Logpush](https://developers.cloudflare.com/workers/observability/logs/logpush/)
- [Logpush](https://developers.cloudflare.com/logs/logpush/)
- [Log Explorer Pricing and managing usage](https://developers.cloudflare.com/log-explorer/pricing/)
- [Web Analytics Limits](https://developers.cloudflare.com/web-analytics/limits/)
- [GraphQL Analytics API Limits](https://developers.cloudflare.com/analytics/graphql-api/limits/)
- [Workers Analytics Engine Pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)
- [Workers Analytics Engine Limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/)
- [Notifications](https://developers.cloudflare.com/notifications/)
- [Budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/)
- [Usage-based billing](https://developers.cloudflare.com/billing/understand/usage-based-billing/)
