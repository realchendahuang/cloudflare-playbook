---
title: 观测与日志
description: Cloudflare Web Analytics、Workers Logs、Logpush、Log Explorer、Notifications 和 Analytics Engine 的实践路线。
---

最后核对日期：2026-06-18。日志、分析、告警和计费口径变化快；价格、保留期、采样、可用计划和 API 限制以官方 pricing / limits 页面为准。

观测不是把所有数据都存下来。普通项目先回答三个问题：免费阶段能看到什么，`$5/month` Workers Paid 多买到什么，什么时候才需要长期日志。

## 一句话判断

| 项目阶段 | 先用什么 | 先别做什么 |
| --- | --- | --- |
| 文档站、官网、博客 | Web Analytics + Budget alerts | 自建埋点和长期日志管道。 |
| 有 Worker API | Real-time logs + Workers Logs | 把请求体、token、cookie、邮箱写进日志。 |
| 有评论、表单、上传 | Workers Logs + Security Events | 只看应用日志，忽略 WAF / Rate Limiting。 |
| 有产品指标 | Analytics Engine；业务事实仍写 D1 / R2 | 用日志当数据库。 |
| 需要长期取证 | Log Explorer 或 Logpush | 只靠 3 到 7 天 Workers Logs。 |

## 免费与付费边界

| 能力 | 免费阶段 | 付费或升级信号 |
| --- | --- | --- |
| Web Analytics | 所有计划可用；适合看页面趋势。 | 需要更复杂规则和归因时再看更高计划。 |
| Real-time logs | 临时排障够用，不负责长期存储。 | 生产问题要追溯时看 Workers Logs。 |
| Workers Logs | Free 有每日额度和短留存。 | 日志量、留存和排障窗口不够时看 Workers Paid。 |
| Workers Trace Events Logpush | Free 不可用。 | 需要把 Worker trace 长期推到 R2 或日志平台时再用。 |
| Cloudflare Logpush / Log Explorer | 普通项目通常先不用。 | 安全取证、合规审计、客户支持要求明确后再买。 |
| Analytics Engine | 适合产品指标和高基数事件。 | 不要替代事务数据库。 |
| Budget alerts | 付费前就该开。 | 它只提醒，不会自动封顶。 |

完整数字见 [免费额度大全](/platform/free-paid/)。

## 先看什么

| 要回答的问题 | 优先事实源 |
| --- | --- |
| 用户是不是访问变慢了？ | Web Analytics、Dashboard Analytics、Speed / Observatory。 |
| 某个请求为什么失败？ | Ray ID、Workers Logs、Real-time logs、源站日志。 |
| 是不是被 WAF 或 Rate Limiting 拦了？ | Security Events。 |
| 某个功能是否被真实使用？ | Analytics Engine、D1 业务表或产品事件表。 |
| 会不会超预算？ | Billing、Billable Usage、Budget alerts、产品 pricing。 |

## 日志只记这些

| 字段 | 用途 |
| --- | --- |
| `event` | 稳定事件名，例如 `api_error`、`comment_created`。 |
| `request_id` | 串联前端、Worker、D1、R2 和队列任务。 |
| `ray_id` | 回查 Cloudflare 边缘请求和安全事件。 |
| `path` | 记录路由类型，避免完整敏感 query。 |
| `status` | HTTP 状态码或业务错误码。 |
| `duration_ms` | 判断慢请求和外部依赖耗时。 |
| `error_type` | 稳定错误类别。 |

不要记录：`authorization`、cookie、API token、secret、评论全文、邮件正文、完整 query string、完整 request body。日志要能定位问题，也要能控制成本和隐私风险。

## 升级信号

| 信号 | 该看什么 |
| --- | --- |
| 3 天日志不够排查问题 | Workers Paid 的 Workers Logs，或外部日志出口。 |
| 需要长期留存 Worker trace events | Workers Trace Events Logpush。 |
| 需要多产品安全取证和内部搜索 | Log Explorer 或 Enterprise Logpush。 |
| 需要按用户、租户、功能统计高基数事件 | Analytics Engine。 |
| 日志量开始接近免费额度 | 先采样、减少字段、脱敏，再考虑付费。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| Real-time logs 就是日志存储。 | 它适合临时排障；存储和过滤看 Workers Logs。 |
| 免费日志可以全量记录所有内容。 | 高流量要采样，敏感字段要脱敏。 |
| Workers Paid 等于企业日志能力。 | 它主要改善 Workers 侧日志，不等于全平台 Logpush。 |
| Budget alerts 能阻止扣费。 | 它只发邮件，不暂停服务。 |
| GraphQL Analytics API 可以算账单。 | 分析看 GraphQL，账单看 Billing。 |

## 事实来源

| 来源 | 用途 |
| --- | --- |
| [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/) | Workers 日志。 |
| [Workers Real-time logs](https://developers.cloudflare.com/workers/observability/logs/real-time-logs/) | 临时排障。 |
| [Workers Logpush](https://developers.cloudflare.com/workers/observability/logs/logpush/) | Worker trace 导出。 |
| [Web Analytics Limits](https://developers.cloudflare.com/web-analytics/limits/) | Web Analytics 限制。 |
| [GraphQL Analytics API Limits](https://developers.cloudflare.com/analytics/graphql-api/limits/) | GraphQL Analytics API。 |
| [Analytics Engine Pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/) | Analytics Engine 成本。 |
| [Budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/) | 预算提醒。 |
