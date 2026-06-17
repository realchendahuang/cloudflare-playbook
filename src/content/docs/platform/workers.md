---
title: Workers
description: Cloudflare Workers 的普通项目取舍、免费额度、付费边界和架构分工。
---

最后核对日期：2026-06-18。

Workers 是 Cloudflare 的请求级计算层，不是一台长期运行的小服务器。普通项目先记三句话：静态内容不要进 Worker；动态接口才用 Worker；状态、文件和后台任务交给对应产品。

## 先判断

| 你要做什么 | 建议 | 搭配 |
| --- | --- | --- |
| 文档站、官网、博客 | 静态优先，Worker 只做少量 API。 | Static Assets + `/api/*` |
| 评论、表单、Webhook、小 API | 适合。 | Workers + D1 / KV / Turnstile |
| 鉴权、代理、API 网关 | 适合。 | Workers + WAF / Rate Limiting |
| 文件上传下载 | Worker 只做权限和签名。 | Workers + R2 |
| 房间、会话、协作状态 | Worker 只做入口。 | Workers + Durable Objects |
| 邮件、导入、重试、后处理 | 不要靠请求硬撑。 | Workers + Queues / Workflows |
| SSR、复杂搜索、AI 前处理 | 谨慎。 | 先估 CPU，再决定 Paid |

## 免费与付费边界

| 能力 | Free | Workers Paid | 普通项目判断 |
| --- | --- | --- | --- |
| 动态请求 | 100,000 requests/day。 | 10M requests/month included，超出按量。 | 早期 API 足够；公开接口要限流和缓存。 |
| CPU | 10 ms/invocation。 | 30M CPU ms/month included，单次默认 30s。 | 代理和轻 API 省；SSR、解析大文件、AI 前处理要小心。 |
| 静态资产请求 | 免费且不限量。 | 免费且不限量。 | 前端、文档、图片索引能静态化就别进 Worker。 |
| Static Assets 文件 | 20,000 files/version，25 MiB/file。 | 100,000 files/version，25 MiB/file。 | 大附件和媒体进 R2 / Stream。 |
| Workers Logs | 200,000 events/day，保留 3 天。 | 20M events/month included，保留 7 天。 | 排障够用；长期审计另看日志产品。 |
| 固定月费 | 无。 | 最低 5 USD/month。 | 请求、CPU、日志或 DO 进入生产后再买。 |

## 架构分工

| 需求 | 放哪里 | 原因 |
| --- | --- | --- |
| 静态页面和前端资源 | Static Assets / Pages | 免费不限量，缓存友好。 |
| 路由、鉴权、轻 API | Worker | 请求级逻辑最合适。 |
| 评论、订单、业务表 | D1 | 有查询、排序和事务需求。 |
| 公开配置、缓存、索引 | KV | 读多写少，可接受短时间旧值。 |
| 图片、附件、导出包 | R2 | Worker 不存大对象。 |
| 房间、会话、限流器 | Durable Objects | 单实体强一致。 |
| 慢任务、通知、重试 | Queues / Workflows | 不绑在一次请求生命周期里。 |

## 最容易踩坑

| 误区 | 更好的做法 |
| --- | --- |
| 所有访问都先进 Worker。 | 只让 `/api/*`、鉴权、后台等动态路径进 Worker。 |
| 只看请求数，不看 CPU。 | Workers Paid 同时看请求和 CPU。 |
| 把 KV 当数据库。 | 关系数据用 D1，强一致单实体用 Durable Objects。 |
| 上传文件先读完整内容。 | Worker 做入口控制，文件流向 R2。 |
| 把评论、搜索、AI、后台任务塞进一个 Worker。 | 先按路径、数据和成本拆清楚。 |
| 密钥写进仓库或普通变量。 | 非敏感配置用 vars，密钥用 secrets。 |
| 日志记录 token、cookie、请求正文。 | 只记 request id、Ray ID、状态、耗时和匿名化标识。 |

## 普通项目路线

1. 前端和文档先用 Static Assets / Pages。
2. 只有动态路径进入 Worker。
3. 数据按类型放到 D1、KV、R2、Durable Objects。
4. 写入口加 Turnstile、Rate Limiting 和最少日志。
5. 后台和内部工具用 Access 保护。
6. 慢任务进入 Queues / Workflows。
7. 请求、CPU、日志或 DO 稳定进入生产后，再开 Workers Paid。

## 事实来源

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers Static Assets billing and limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
