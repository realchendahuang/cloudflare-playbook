---
title: 免费与付费边界
description: 普通项目使用 Cloudflare 时最容易踩到的免费额度、付费入口和成本判断。
---

# 免费与付费边界

最后核对日期：2026-06-17。Cloudflare 的价格、额度和产品状态变化很快，本页只做实践判断，最终以官方定价页为准。

## 先看本站这类项目

Cloudflare Playbook 这种“文档站 + 站内搜索 + 自由评论”的组合，当前最省心的成本模型是：

| 模块 | 用什么 | 免费边界 | 什么时候付费 |
| --- | --- | --- | --- |
| 文档页面 | Workers Static Assets | 静态资产请求免费且不限量，资产存储没有额外费用。 | 静态页面本身通常不是付费压力。 |
| 评论 API | Workers | Free 计划动态 Worker 请求 100,000 次/天。 | 评论、接口或 SSR 请求量明显超过免费额度。 |
| 评论数据 | D1 | 读 5,000,000 行/天、写 100,000 行/天、总存储 5 GB。 | 数据或访问量超过免费额度，或需要更稳定的大规模生产余量。 |
| 普通搜索 | Pagefind | 构建期生成静态索引，不走 Cloudflare 数据产品。 | 不需要为普通搜索付费。 |
| 自然语言搜索 | AI Search | 官方标注可用于所有计划，但具体限制看 AI Search 定价页。 | 需要问答式搜索、混合检索、Agent 接入时。 |

## Workers

| 计划 | 适合谁 | 核心边界 |
| --- | --- | --- |
| Free | 文档站、小工具、低频 API、个人项目 | 100,000 次 Worker 请求/天，每次 10 ms CPU。 |
| Standard / Paid | 正式产品、较高 API 流量、更多 CPU 时间 | 每月包含 10,000,000 次请求，超出按量计费；CPU 也有包含额度和超额计费。 |

实践判断：

- 静态页面尽量让 Static Assets 直接服务。
- 只有 `/api/*` 这类动态接口先进入 Worker。
- 不要让所有页面请求都 `run_worker_first`，否则静态访问也会消耗 Worker 请求额度。

## Workers Static Assets

Workers Static Assets 是本站推荐的部署方式，因为它把静态文档和动态 API 放进同一个 Worker 项目。

适合：

- 文档站带少量 API。
- 静态页面带评论、反馈、订阅、Webhook。
- 未来可能接 D1、R2、AI Search、Queues 的项目。

不适合：

- 完全不需要 API 的纯静态站，Pages 也很好。
- 需要传统服务器长连接、后台常驻进程的应用。

## D1

| 指标 | Free | Paid |
| --- | --- | --- |
| Rows read | 5,000,000 / day | 每月前 25,000,000,000 行包含，超出 $0.001 / million rows |
| Rows written | 100,000 / day | 每月前 50,000,000 行包含，超出 $1.00 / million rows |
| Storage | 5 GB total | 前 5 GB 包含，超出 $0.75 / GB-month |

实践判断：

- 评论、收藏、轻量反馈、配置后台都适合 D1。
- 高频计数、排行榜、强实时协作不要一上来就塞 D1。
- 给常查字段建索引，因为 D1 按扫描行数计算读量，索引能减少 rows read。

## KV、R2、Durable Objects

| 产品 | 免费阶段怎么用 | 付费前要想清楚 |
| --- | --- | --- |
| KV | 配置、公开索引、低频更新缓存。 | KV 是最终一致，不要拿它做强一致状态。 |
| R2 | 文件、图片、导出物、备份。 | R2 没有出站带宽费，但存储和操作会计费。 |
| Durable Objects | 房间、限流器、单对象强一致状态。 | Free 计划只支持 SQLite-backed Durable Objects。 |

## 本仓库的成本策略

1. 文档、搜索索引、CSS、JS 都走静态资产。
2. 评论接口只在 `/api/comments` 调用 Worker。
3. 评论查询按 `page_path` 建索引，避免全表扫描。
4. 评论写入先做蜜罐和限流，不引入队列。
5. AI Search 作为第二阶段能力，不影响当前免费部署。

## 官方资料

- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Static Assets Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [AI Search](https://developers.cloudflare.com/ai-search/)
