---
title: 数据产品
description: D1、KV、R2、Durable Objects 和 Queues 的选择方式。
---

最后核对日期：2026-06-17。

Cloudflare 的数据产品不要只按“数据库”理解，应该按访问模式选择。

## 选择表

| 产品 | 更适合 | 不适合 |
| --- | --- | --- |
| [D1](/platform/d1/) | SQL、关系型数据、小型应用数据 | 超大数据库、复杂 OLAP |
| [KV](/platform/kv/) | 高读低写、配置、缓存、公开索引 | 强一致写入、频繁更新 |
| [R2](/platform/r2/) | 文件、图片、导出物、备份 | 小粒度高频结构化查询 |
| [Durable Objects](/platform/durable-objects/) | 单对象强一致状态、房间、限流器、WebSocket | 全局大表扫描、关系查询、报表 |
| [Queues](/platform/queues/) | 异步任务、削峰、后台处理 | 需要立即同步返回的流程 |

官方 storage-options 文档还把 Hyperdrive、Vectorize、Pipelines、Analytics Engine 放在同一张数据产品图里。本站把它们拆到 [扩展计算与数据管道](/platform/extended-compute-data/)、[AI 产品](/platform/ai/) 和 [观测与日志](/platform/observability/)，避免一篇入口页变成产品清单。

## 判断顺序

1. 先问数据是不是文件：是就看 R2。
2. 再问是否需要 SQL：是就看 D1。
3. 再问是否需要单对象强一致：是就看 Durable Objects。
4. 再问是否是异步任务：是就看 Queues。
5. 最后才考虑 KV 做配置、缓存和低频更新数据。

## 核心差异

| 问题 | D1 | KV | R2 | Durable Objects | Queues |
| --- | --- | --- | --- | --- | --- |
| 数据形态 | 表、行、SQL 查询。 | key-value、配置、索引、会话。 | 文件、对象、备份、数据集。 | 某个对象自己的状态和 SQLite。 | 消息、任务、事件。 |
| 一致性心智 | 关系型数据库，适合读多写少应用数据。 | 最终一致，适合高读低写。 | 对象级强一致，适合大文件和公开资产。 | 单对象强一致，适合全局协调。 | at-least-once，业务要能幂等。 |
| 访问方式 | Worker binding、REST API、Wrangler。 | Worker binding、REST API、Wrangler。 | Worker binding、S3 API、REST API、Wrangler。 | Worker 通过 stub / RPC / fetch 调用。 | Producer / Consumer binding、Pull consumer、REST API。 |
| 常见组合 | Worker API + D1 + R2 附件。 | Worker + KV 缓存配置或热点读。 | R2 + Worker 签名上传 + Queues 后处理。 | Durable Objects + WebSocket / Alarms。 | Queues + D1 去重 + R2 存档。 |

最容易选错的是 KV 和 Durable Objects。KV 很快，但它不是强一致数据库；Durable Objects 很稳，但它不是全局大表。需要 SQL 查询时先看 D1；需要“同一个房间、同一个用户、同一个限流桶”的全局顺序时，再看 Durable Objects。

## 常见组合

| 场景 | 推荐组合 | 原因 |
| --- | --- | --- |
| 评论、表单、轻量后台 | Workers + D1 + Queues | D1 存业务状态，Queues 处理邮件、审核、通知和外部 API。 |
| 图片、文件、导出物 | R2 + Worker 签名 URL + D1 metadata | R2 存对象，D1 存归属、权限和展示索引。 |
| 文档站搜索索引 | 静态 Pagefind 起步，内容量上来再看 AI Search / Vectorize | 普通文档站不要一开始就自建向量管道。 |
| 实时房间或协作 | Durable Objects + WebSocket Hibernation + D1/R2 持久化摘要 | DO 管实时状态，长期数据单独落库或归档。 |
| 批量导入、异步任务 | Queues + D1 幂等表 + R2 原始输入 | 任务可重试，输入和结果可追溯。 |

## 写作提醒

涉及容量、价格、并发和一致性的结论必须回到 Cloudflare 官方文档核对，并写明最后核对日期。

## 已精读产品

- [D1](/platform/d1/)：Serverless SQL、rows read/write 计费、索引、迁移、Time Travel 和 Read Replication。
- [KV](/platform/kv/)：读多写少、最终一致、cacheTtl、同 key 写入限制、批量操作和开源参考。
- [R2](/platform/r2/)：对象存储、免费额度、Class A/B 操作、一致性、公开访问、签名 URL 和开源参考。
- [Durable Objects](/platform/durable-objects/)：单实体强一致状态、免费/付费边界、SQLite storage、WebSocket Hibernation、Alarms、迁移和开源参考。
- [Queues](/platform/queues/)：异步任务、操作计费、at least once、批处理、重试、死信队列、Pull Consumer 和开源参考。

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [cloudflare/cloudflare-docs D1 source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/d1) | 官方 D1 文档源文件，追踪 SQL API、best practices、pricing、limits、Time Travel 和 Read Replication。 |
| [cloudflare/cloudflare-docs KV source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/kv) | 官方 KV 文档源文件，追踪最终一致、API、limits、pricing、event subscriptions 和 Wrangler 命令。 |
| [cloudflare/cloudflare-docs R2 source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/r2) | 官方 R2 文档源文件，追踪 buckets、objects、S3 API、Data Catalog、pricing、limits 和 migration。 |
| [cloudflare/cloudflare-docs Durable Objects source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/durable-objects) | 官方 Durable Objects 文档源文件，追踪 SQLite storage、RPC、WebSocket、Alarms、migrations 和 limits。 |
| [cloudflare/cloudflare-docs Queues source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/queues) | 官方 Queues 文档源文件，追踪 batching、retries、DLQ、event subscriptions、Pull consumers、pricing 和 limits。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | Cloudflare 官方模板集合，适合看 D1、KV、Workers Static Assets 等最小项目结构。 |
| [cloudflare/workers-chat-demo](https://github.com/cloudflare/workers-chat-demo) | Durable Objects + WebSocket 的官方示例，适合理解“一个房间一个对象”的状态模型。 |
| [cloudflare/queues-web-crawler](https://github.com/cloudflare/queues-web-crawler) | Queues + Browser Rendering + KV 的官方示例，适合看异步抓取和任务削峰。 |

## 官方资料

- [Choose a data or storage product](https://developers.cloudflare.com/workers/platform/storage-options/)
- [D1 llms.txt](https://developers.cloudflare.com/d1/llms.txt)
- [KV llms.txt](https://developers.cloudflare.com/kv/llms.txt)
- [R2 llms.txt](https://developers.cloudflare.com/r2/llms.txt)
- [Durable Objects llms.txt](https://developers.cloudflare.com/durable-objects/llms.txt)
- [Queues llms.txt](https://developers.cloudflare.com/queues/llms.txt)
- [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [KV pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- [R2 pricing](https://developers.cloudflare.com/r2/pricing/)
- [Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Queues pricing](https://developers.cloudflare.com/queues/platform/pricing/)
