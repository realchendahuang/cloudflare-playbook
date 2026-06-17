---
title: Workers
description: Cloudflare Workers 的普通项目取舍、架构分工和升级判断。
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

## 什么时候升级

Workers 的成本先看动态请求、CPU、日志和绑定产品。静态资产命中不该消耗 Worker 请求，SSR、API、评论、搜索代理、AI 前处理才进入动态口径。

| 升级信号 | 判断 |
| --- | --- |
| 动态请求稳定接近 Free 边界。 | 公开 API、评论、搜索代理或 SSR 已经有人持续使用。 |
| CPU 经常不够。 | 解析大 payload、SSR、加密、AI 前处理和批量数据处理都要单独看 CPU。 |
| 日志留存不够排障。 | 生产问题需要更长留存、Trace Events 或外部日志目的地。 |
| D1、KV、Queues、Durable Objects 成为核心路径。 | 这些产品的免费层也会一起决定是否进入 Workers Paid。 |
| 需要更多 Cron、Worker 数量、Subrequests 或更大 bundle。 | 这是工程化能力升级，不是单纯流量问题。 |

完整数字见 [免费额度大全](/platform/free-paid/)。

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
