---
title: 观测与日志
description: 怎么先看访问、错误和成本，什么时候再做长期日志。
---

最后核对日期：2026-06-18。额度和保留期会变化，具体数字统一回到 [免费额度大全](/platform/free-paid/) 和官方页面核对。

观测的目标不是把所有东西都存下来，而是在出问题时知道三件事：有没有人访问，哪里失败了，会不会超预算。

## 先看这个

| 项目阶段 | 先做什么 | 先别做什么 |
| --- | --- | --- |
| 只有文档站、官网、博客 | 开 Web Analytics，看访问趋势和页面表现。 | 自建复杂埋点。 |
| 有 Worker API | 用 Workers Logs 和实时日志排查错误。 | 记录密钥、登录凭证、邮箱、正文。 |
| 有评论、表单、上传 | 同时看应用日志和 Security Events。 | 只看业务错误，忽略刷量和拦截。 |
| 有产品指标 | 把业务事实写进 D1 / R2，指标再进 Analytics Engine。 | 用日志当数据库。 |
| 需要长期追溯 | 再看 Logpush、Log Explorer 或外部日志平台。 | 一开始就搭完整日志管道。 |

## 最小日志字段

先把日志压到能排障的最小集合。

| 字段 | 用途 |
| --- | --- |
| `event` | 稳定事件名，例如 `api_error`、`comment_created`。 |
| `request_id` | 串起前端、Worker、D1、R2 和队列任务。 |
| `ray_id` | 回查 Cloudflare 边缘请求和安全事件。 |
| `path` | 记录路由类型，不保存完整敏感 query。 |
| `status` | HTTP 状态码或业务错误码。 |
| `duration_ms` | 判断慢请求和外部依赖耗时。 |
| `error_type` | 稳定错误类别。 |

不要记录：登录凭证、API 访问凭证、密钥、评论全文、邮件正文、完整查询参数、完整请求正文。

## 升级信号

| 信号 | 下一步 |
| --- | --- |
| 几天前的问题已经查不到。 | 看 Workers Paid 的日志留存，或把关键日志导出。 |
| 客户支持需要按用户、租户、订单追溯。 | 设计业务事件表，不只依赖请求日志。 |
| 安全事件需要长期取证。 | 看 Logpush、Log Explorer 或企业日志能力。 |
| 日志量开始接近免费额度。 | 先采样、减少字段、脱敏，再考虑付费。 |
| AI、上传、评论有开放入口。 | 给入口加限流、Turnstile、WAF，再看日志。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| 能 tail 到日志就等于有日志系统。 | tail 适合现场排障，长期追溯要看留存和导出。 |
| 日志越全越安全。 | 只记录能定位问题的字段，敏感内容不要进日志。 |
| Workers Paid 等于全平台日志能力。 | 它主要改善 Workers 侧日志，不等于所有产品日志都可长期导出。 |
| Budget alerts 会阻止扣费。 | 它只提醒，不会暂停服务。 |
| 访问统计可以替代账单。 | 访问看 Analytics，费用看 Billing 和产品用量。 |

## 事实来源

- [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)
- [Workers Real-time logs](https://developers.cloudflare.com/workers/observability/logs/real-time-logs/)
- [Workers Logpush](https://developers.cloudflare.com/workers/observability/logs/logpush/)
- [Web Analytics Limits](https://developers.cloudflare.com/web-analytics/limits/)
- [Analytics Engine Pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)
- [Budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/)
