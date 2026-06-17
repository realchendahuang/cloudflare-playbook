---
title: 扩展计算与数据管道
description: Hyperdrive、Workflows、Pipelines、Containers 和 R2 Data Catalog 的普通项目取舍。
---

最后核对日期：2026-06-18。Hyperdrive、Workflows、Pipelines、Containers 和 R2 Data Catalog 的价格、beta 状态、可用计划和 limits 变化较快，最终以官方 pricing / limits 页面为准。

这组产品不是 Cloudflare 入门第一层。普通项目默认先用 Workers、D1、R2、KV、Queues、Durable Objects。只有当这些基础能力已经解释不了需求时，再看扩展计算、长流程、数据湖和容器。

## 一句话判断

有现成 Postgres / MySQL，再看 Hyperdrive；流程要跨分钟、小时、天并且需要恢复状态，再看 Workflows；事件流要进入 R2 数据湖，再看 Pipelines 和 R2 Data Catalog；Worker 原生运行时装不下依赖，再看 Containers。

## 先问五个问题

| 问题 | 如果答案是“否” |
| --- | --- |
| 已经有外部 Postgres / MySQL 主库吗？ | 先用 D1，不急着接 Hyperdrive。 |
| 任务真的需要多步骤、睡眠、等待外部事件和恢复状态吗？ | 先用 Queues 或普通 Worker。 |
| 事件数据已经大到需要数据湖、Parquet、Iceberg 或 BI 查询了吗？ | 先用 Workers Logs、Analytics Engine、D1 / R2 快照。 |
| R2 bucket 里的数据需要被 Spark、Snowflake、PyIceberg、DuckDB 这类引擎当表读吗？ | 不需要 R2 Data Catalog。 |
| 依赖必须跑在完整 Linux-like 环境、文件系统或现成镜像里吗？ | 不要为了“像传统后端”上 Containers。 |

## 免费与付费边界

| 产品 | Free / 免费边界 | Workers Paid / 付费边界 | 普通项目判断 |
| --- | --- | --- | --- |
| Hyperdrive | 包含在 Workers Free；100,000 database queries/day；最多 10 个 configured databases；每个配置约 20 个 origin database connections。 | Paid queries unlimited；最多 25 个 configured databases；每个配置约 100 个 origin database connections；连接池和查询缓存不额外收费。 | 只在已有 Postgres / MySQL 时使用；缓存命中也算 query。 |
| Workflows | 包含在 Workers Free；请求共享 100,000/day；10 ms CPU/invocation；1 GB storage；单实例状态 100 MB；最多 1,024 steps；completed state 保留 3 天。 | 与 Workers Standard 同口径：10M requests/month、30M CPU ms/month、1 GB storage included；超出按 Workers / storage 计费；单实例状态 1 GB；默认 10,000 steps，可配到 25,000；completed state 保留 30 天。 | 多步骤长流程才上；等待 `sleep`、外部事件和空闲时不消耗 CPU，但状态存储仍要算。 |
| Pipelines | 官方 overview 当前写明 open beta 且需要 Workers Paid；pricing 页保留 Free / Paid included usage 口径。 | 当前 beta 期间，除标准 R2 storage / operations 外，官方说明暂不对 Pipelines 本身计费；定价页口径是 ingress free，SQL transforms 和 sinks 按 GB，Paid 月含 50 GB。 | 面向日志、点击流、IoT、移动端事件进入 R2 数据湖；普通项目不要拿它替代日志系统。 |
| R2 Data Catalog | Public beta；需要 R2 subscription；当前 beta 期间，除标准 R2 storage / operations 外，官方说明暂不对 Data Catalog 本身计费。 | 定价页口径：catalog operations 每月含 1M，compaction data processed 每月含 10 GB，compaction objects processed 每月含 1M；Paid 超出后按量。 | 它是 Apache Iceberg catalog，不是文件索引，也不是事务数据库。 |
| Containers | Free 不可用。 | Workers Paid 包含 25 GiB-hours/month、375 vCPU-minutes/month、200 GB-hours/month；超出按内存、CPU、磁盘秒计费。Container egress、Workers、Durable Objects 和 Workers Logs 还要分别看。 | 只有 Worker 原生能力明显不够时再用；能不用容器就先不用。 |

## 产品怎么选

| 需求 | 优先选 | 不建议 |
| --- | --- | --- |
| 新项目需要关系数据 | D1 | 先建外部数据库再接 Hyperdrive。 |
| 已有外部 Postgres / MySQL，Worker 只是全球 API 层 | Hyperdrive | 让每个 Worker 直接长连数据库。 |
| 邮件、导入、通知、后处理 | Queues | 把简单异步任务做成 Workflows。 |
| 跨天流程、审批、可恢复批处理 | Workflows | 自己用 D1 + Cron + Queue 拼流程引擎。 |
| 高基数产品指标 | Analytics Engine | 用 Pipelines 做小项目埋点。 |
| 大量事件要进数据湖 | Pipelines + R2 | 把所有日志无目标地推成数据湖。 |
| R2 上的 Parquet / Iceberg 要给查询引擎读 | R2 Data Catalog | 把普通文件、图片、附件也纳入 catalog。 |
| 必须跑现成 CLI、Python 工具、浏览器外依赖或完整 runtime | Containers | 把普通 API 做成容器服务。 |

## 成本和风险

| 产品 | 先盯什么 |
| --- | --- |
| Hyperdrive | query 数、缓存命中、query latency、origin connection 等待。 |
| Workflows | instance 数、step 数、状态大小、completed state 保留期、重试次数。 |
| Pipelines | 输入 GB、SQL transforms GB、sink GB、R2 storage / operations。 |
| R2 Data Catalog | catalog operations、compaction 是否开启、R2 storage、旧 snapshot。 |
| Containers | 运行时长、provisioned memory / disk、active CPU、egress、DO 和日志叠加成本。 |

这里的核心不是背价格，而是避免把复杂度买早。越靠后的产品，越应该有明确的使用量、恢复策略和停用策略。

## 升级信号

| 信号 | 该看什么 |
| --- | --- |
| D1 已经不是主库，外部 Postgres / MySQL 才是事实源 | Hyperdrive。 |
| 一个任务要等待人工动作、第三方回调或跨天继续 | Workflows。 |
| 队列只能解决削峰，不能解释流程状态 | Workflows。 |
| 日志和事件要进入 BI / lakehouse，而不是只排障 | Pipelines。 |
| R2 上已有分析表，需要 Iceberg REST catalog | R2 Data Catalog。 |
| Worker 原生运行时无法承载依赖、镜像或文件系统需求 | Containers。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 新项目先上 Hyperdrive。 | 新小项目优先 D1；已有外部数据库再接 Hyperdrive。 |
| 有异步任务就上 Workflows。 | 简单削峰和后台任务先用 Queues。 |
| Workflows 是免费无限长任务。 | 等待不算 CPU，但请求、CPU、状态存储和保留期仍有边界。 |
| Pipelines 是日志默认路线。 | 小项目先用 Workers Logs、Analytics Engine 或业务表；数据湖需求明确后再上。 |
| R2 Data Catalog 可以管理所有 R2 文件。 | 它服务 Iceberg / lakehouse，不服务普通附件和图片。 |
| Containers 可以替代 Worker 学习成本。 | Containers 是运行时补位，还会叠加 Workers、Durable Objects、egress 和 logs。 |
| 只看 Containers 的 CPU 价格。 | 内存、磁盘、运行时长和出站流量通常更影响账单。 |

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [cloudflare/cloudflare-docs Hyperdrive source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/hyperdrive) | 官方 Hyperdrive 文档源文件，追踪 pricing、limits、connection pooling 和 query caching。 |
| [cloudflare/cloudflare-docs Workflows source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workflows) | 官方 Workflows 文档源文件，追踪 durable steps、pricing、limits 和 Workers API。 |
| [cloudflare/cloudflare-docs Pipelines source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/pipelines) | 官方 Pipelines 文档源文件，追踪 open beta、streams、SQL transforms、sinks、pricing 和 limits。 |
| [cloudflare/cloudflare-docs Containers source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/containers) | 官方 Containers 文档源文件，追踪 pricing、instance types、limits 和 Workers 连接方式。 |
| [cloudflare/cloudflare-docs R2 Data Catalog source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/r2/data-catalog) | 官方 R2 Data Catalog 文档源文件，追踪 Iceberg catalog、pricing、table maintenance 和 beta 状态。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Miniflare、C3 和 Workers SDK 源码，适合追踪命令和本地开发行为。 |
| [cloudflare/workerd](https://github.com/cloudflare/workerd) | Workers runtime 开源实现，适合理解 Worker 原生模型边界。 |

## 事实来源

- [Hyperdrive pricing](https://developers.cloudflare.com/hyperdrive/platform/pricing/)
- [Hyperdrive limits](https://developers.cloudflare.com/hyperdrive/platform/limits/)
- [Workflows pricing](https://developers.cloudflare.com/workflows/reference/pricing/)
- [Workflows limits](https://developers.cloudflare.com/workflows/reference/limits/)
- [Pipelines](https://developers.cloudflare.com/pipelines/)
- [Pipelines pricing](https://developers.cloudflare.com/pipelines/platform/pricing/)
- [Pipelines limits](https://developers.cloudflare.com/pipelines/platform/limits/)
- [R2 Data Catalog](https://developers.cloudflare.com/r2/data-catalog/)
- [R2 Data Catalog pricing](https://developers.cloudflare.com/r2/data-catalog/platform/pricing/)
- [Containers pricing](https://developers.cloudflare.com/containers/pricing/)
- [Containers limits and instance types](https://developers.cloudflare.com/containers/platform-details/limits/)
- [Lifecycle of a Container](https://developers.cloudflare.com/containers/platform-details/architecture/)
