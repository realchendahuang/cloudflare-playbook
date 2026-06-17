---
title: 数据产品
description: D1、KV、R2、Durable Objects、Queues、Hyperdrive、Vectorize、Pipelines 和 Analytics Engine 的选择方式。
---

最后核对日期：2026-06-18。

Cloudflare 的数据产品不要只按“数据库”理解，应该按数据形态、访问模式、一致性、成本维度和生命周期选择。大多数项目最后会组合多个产品：D1 存关系数据，R2 存文件本体，KV 存读多写少配置，Durable Objects 管单对象强一致状态，Queues 把慢任务拆到后台。

## 一句话判断

不要先问“哪个数据库最强”。先问“这份数据是什么、怎么读、怎么写、要不要事务、是不是文件、是不是异步、能不能接受旧值”。

## 选择表

| 数据形态 | 推荐产品 | 更适合 | 不适合 |
| --- | --- | --- | --- |
| 关系数据 | [D1](/platform/d1/) | SQL、关系型数据、评论、表单、小型 SaaS 业务表 | 大型 OLAP、超大单库、二进制文件 |
| 读多写少 key-value | [KV](/platform/kv/) | 配置、功能开关、公开索引、会话、缓存 | 强一致事务、同 key 高频写入、库存和计数器 |
| 文件 / 对象 | [R2](/platform/r2/) | 图片、附件、导出、备份、数据湖原始对象 | 小粒度关系查询、排序筛选、会话状态 |
| 单对象强一致 | [Durable Objects](/platform/durable-objects/) | 房间、协作状态、限流器、WebSocket、单租户状态 | 全局大表扫描、跨对象 SQL、报表分析 |
| 异步消息 | [Queues](/platform/queues/) | 邮件、通知、导入、削峰、后台处理、失败重试 | 必须立即同步返回的用户流程 |
| 现有 SQL 数据库 | [Hyperdrive](/platform/extended-compute-data/) | 已有 Postgres / MySQL、连接池、查询缓存 | 新小项目从零开始建库 |
| 向量检索 | [Vectorize](/platform/ai/) / AI Search | embedding、语义搜索、RAG、自然语言检索 | 文档很少、Pagefind 足够的站点搜索 |
| 流式摄取 | [Pipelines](/platform/extended-compute-data/) | 点击流、日志、遥测、批量写入 R2 | 小型 CRUD 表单 |
| 高基数指标 | [Analytics Engine](/platform/observability/) | 用量计费、客户级指标、服务 telemetry | 事务型业务数据 |

官方 storage-options 文档把这些都归在 Workers 的 storage & database products 下。本站把 Hyperdrive、Pipelines、Analytics Engine、Vectorize 分别拆到 [扩展计算与数据管道](/platform/extended-compute-data/)、[观测与日志](/platform/observability/) 和 [AI 产品](/platform/ai/)，是为了让入口页先讲判断，不变成产品清单。

## 判断顺序

| 判断问题 | 先看产品 |
| --- | --- |
| 这是文件本体吗？ | R2，metadata 再放 D1。 |
| 需要 SQL 查询、排序、筛选、关联、迁移和备份吗？ | D1。 |
| 读远多于写，且可以接受最终一致吗？ | KV。 |
| 需要同一个实体的全局顺序、强一致写入或 WebSocket 状态吗？ | Durable Objects。 |
| 这件事可以晚点做、失败重试、批量处理吗？ | Queues。 |
| 已经有外部 Postgres / MySQL，不想迁移数据吗？ | Hyperdrive。 |
| 数据是 embedding 或自然语言搜索索引吗？ | 少量内容先 Pagefind；确定需要语义检索后再看 AI Search / Vectorize。 |
| 数据是持续涌入的事件流或指标吗？ | Pipelines、R2 或 Analytics Engine，不要塞进 D1。 |

## 核心差异

| 问题 | D1 | KV | R2 | Durable Objects | Queues |
| --- | --- | --- | --- | --- | --- |
| 数据形态 | 表、行、SQL 查询。 | key-value、配置、索引、会话。 | 文件、对象、备份、数据集。 | 某个对象自己的状态和 SQLite。 | 消息、任务、事件。 |
| 一致性心智 | 关系型数据库，适合读多写少应用数据。 | 最终一致，适合高读低写。 | 对象级强一致，适合文件和公开资产。 | 单对象强一致，适合全局协调。 | at-least-once，业务要能幂等。 |
| 成本维度 | rows read、rows written、storage。 | read/write/delete/list、storage。 | storage、Class A、Class B、IA retrieval。 | requests、GB-s、storage、WebSocket 模型。 | operations、retention、重试和 DLQ。 |
| 常见组合 | Worker API + D1 + R2 附件。 | Worker + KV 缓存配置或热点读。 | R2 + Worker 签名上传 + Queues 后处理。 | Durable Objects + WebSocket / Alarms。 | Queues + D1 去重 + R2 存档。 |

最容易选错的是 KV、D1 和 Durable Objects。KV 很快，但它不是强一致数据库；D1 好写 SQL，但不是文件系统和大分析库；Durable Objects 很稳，但它不是全局大表。需要“同一个房间、同一个用户、同一个限流桶”的全局顺序时，才优先看 Durable Objects。

## 常见组合

| 场景 | 推荐组合 | 原因 |
| --- | --- | --- |
| 评论、表单、轻量后台 | Workers + D1 + Queues | D1 存业务状态，Queues 处理邮件、审核、通知和外部 API。 |
| 图片、文件、导出物 | R2 + Worker 签名 URL + D1 metadata | R2 存对象，D1 存归属、权限、状态和展示索引。 |
| 文档站搜索 | Pagefind 起步，内容量上来再看 AI Search / Vectorize | 普通文档站不要一开始就自建向量管道。 |
| 实时房间或协作 | Durable Objects + WebSocket Hibernation + D1 / R2 持久化摘要 | DO 管实时状态，长期数据单独落库或归档。 |
| 批量导入、异步任务 | Queues + D1 幂等表 + R2 原始输入 | 任务可重试，输入和结果可追溯。 |
| 现有 Postgres / MySQL | Workers + Hyperdrive + 原数据库 | 先减少连接开销和跨区域延迟，再评估是否迁移到 D1。 |
| AI 知识库 | R2 原始文档 + D1 metadata + AI Search / Vectorize + AI Gateway | 原文、索引、检索和模型调用分开，成本更可观察。 |
| 用量计费或客户指标 | Workers + Analytics Engine + D1 账单快照 | 高基数事件进 Analytics Engine，结算结果再进 D1。 |

## 迁移信号

| 当前做法 | 出现什么信号 | 下一步 |
| --- | --- | --- |
| 只用 D1 | 表里开始塞大 JSON、图片、附件或导出物 | 文件本体迁到 R2，D1 只留 metadata。 |
| 只用 KV | 需要强一致撤销、库存、计数器、同 key 高频写入 | 写路径迁到 Durable Objects 或 D1，KV 只做缓存快照。 |
| 请求里同步处理 | 邮件、审核、导入、AI 批处理拖慢响应 | 慢任务入 Queues，用户请求只返回任务状态。 |
| 只用 R2 | 需要按用户、状态、标签、时间分页检索文件 | D1 建 metadata 表，R2 只保对象。 |
| 单个 D1 库变大 | 单库接近大小或吞吐边界 | 按租户、用户、项目或区域拆库。 |
| Pagefind 不够用 | 用户开始问自然语言问题，且内容规模足够 | 评估 AI Search 或 Vectorize。 |
| 外部数据库跨区慢 | Worker 到现有 Postgres / MySQL 延迟高或连接数难控 | 接 Hyperdrive。 |

## 成本心智

不要把“免费额度”理解成“无限使用”。每个数据产品的账单维度不一样：

| 产品 | 主要看什么 |
| --- | --- |
| D1 | 查询扫描了多少行、写了多少行、索引和表占多少存储。 |
| KV | 读写删列操作次数、同 key 写入频率、value 大小和缓存 TTL。 |
| R2 | 存储容量、Class A、Class B、公开下载热点和 Infrequent Access 读取。 |
| Durable Objects | 请求数、内存时间、SQLite storage、WebSocket 是否 hibernation。 |
| Queues | 消息大小、写读删操作、重试次数、DLQ 和保留期。 |
| Vectorize | queried vector dimensions、stored vector dimensions、metadata 过滤。 |
| Analytics Engine | data points、read queries、查询范围和高基数字段设计。 |
| Pipelines | 摄取量、transform、sink 写入、R2 后续存储和查询成本。 |

完整数字见 [免费与付费边界](/platform/free-paid/)。本页只保留选择逻辑；价格、limits 和 included usage 以官方 pricing / limits 为准。

## 不要这么用

| 误用 | 更好的做法 |
| --- | --- |
| KV 当强一致数据库 | D1 做关系数据，Durable Objects 串行化同一实体写入。 |
| D1 存文件本体 | R2 存对象，D1 存对象 key、权限、状态和索引。 |
| R2 当查询数据库 | D1 / Analytics Engine / R2 SQL 负责查询，R2 保留原始对象。 |
| Durable Objects 当全站大表 | DO 管单实体状态，跨实体查询落到 D1 或分析系统。 |
| Queues 当同步 RPC | Queues 做异步和重试；必须同步返回的流程留在 Worker。 |
| Vectorize 代替内容结构化 | 先把标题、标签、产品、更新时间和来源写清楚，再做语义搜索。 |
| Analytics Engine 存业务事实 | 业务最终状态进 D1；Analytics Engine 记录事件和指标。 |

## GitHub 开源参考

| 仓库 / 目录 | 用途 |
| --- | --- |
| [cloudflare/cloudflare-docs storage options source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/platform/storage-options.mdx) | 官方数据产品选择表源文件，适合追踪 D1、KV、R2、Durable Objects、Queues、Hyperdrive、Vectorize、Pipelines、Analytics Engine 的定位。 |
| [cloudflare/cloudflare-docs D1 source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/d1) | 官方 D1 文档源文件，追踪 SQL API、best practices、pricing、limits、Time Travel 和 Read Replication。 |
| [cloudflare/cloudflare-docs KV source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/kv) | 官方 KV 文档源文件，追踪最终一致、API、limits、pricing、event subscriptions 和 Wrangler 命令。 |
| [cloudflare/cloudflare-docs R2 source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/r2) | 官方 R2 文档源文件，追踪 buckets、objects、S3 API、Data Catalog、pricing、limits 和 migration。 |
| [cloudflare/cloudflare-docs Durable Objects source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/durable-objects) | 官方 Durable Objects 文档源文件，追踪 SQLite storage、RPC、WebSocket、Alarms、migrations 和 limits。 |
| [cloudflare/cloudflare-docs Queues source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/queues) | 官方 Queues 文档源文件，追踪 batching、retries、DLQ、event subscriptions、Pull consumers、pricing 和 limits。 |
| [cloudflare/templates d1-template](https://github.com/cloudflare/templates/tree/main/d1-template) | D1 最小项目结构。 |
| [cloudflare/templates r2-explorer-template](https://github.com/cloudflare/templates/tree/main/r2-explorer-template) | R2 文件浏览和对象存储项目参考。 |
| [cloudflare/templates to-do-list-kv-template](https://github.com/cloudflare/templates/tree/main/to-do-list-kv-template) | KV 读写和轻量状态参考。 |
| [cloudflare/templates durable-chat-template](https://github.com/cloudflare/templates/tree/main/durable-chat-template) | Durable Objects 实时聊天参考。 |
| [cloudflare/templates workflows-starter-template](https://github.com/cloudflare/templates/tree/main/workflows-starter-template) | 后台流程和长任务参考。 |
| [cloudflare/templates mysql-hyperdrive-template](https://github.com/cloudflare/templates/tree/main/mysql-hyperdrive-template) | Hyperdrive 连接 MySQL 参考。 |
| [cloudflare/templates postgres-hyperdrive-template](https://github.com/cloudflare/templates/tree/main/postgres-hyperdrive-template) | Hyperdrive 连接 Postgres 参考。 |

## 官方资料

- [Choose a data or storage product](https://developers.cloudflare.com/workers/platform/storage-options/)
- [D1](https://developers.cloudflare.com/d1/)
- [KV: How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [R2](https://developers.cloudflare.com/r2/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Queues](https://developers.cloudflare.com/queues/)
- [Hyperdrive](https://developers.cloudflare.com/hyperdrive/)
- [Vectorize](https://developers.cloudflare.com/vectorize/)
- [Pipelines](https://developers.cloudflare.com/pipelines/)
- [Analytics Engine](https://developers.cloudflare.com/analytics/analytics-engine/)
