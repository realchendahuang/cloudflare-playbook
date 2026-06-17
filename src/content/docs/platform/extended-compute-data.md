---
title: 扩展计算与数据管道
description: Hyperdrive、Workflows、Pipelines、Containers 和 R2 Data Catalog 的普通项目取舍。
---

最后核对日期：2026-06-17。

这组产品不是 Cloudflare 入门第一层。它们通常出现在项目已经有明确瓶颈之后：已有外部数据库、流程跑得太久、事件数据要进数据湖、Worker 运行时装不下某些依赖。

## 先看全图

```text
已有 Worker 项目
  ├─ 外部数据库已经存在
  │    └─ Hyperdrive: Postgres / MySQL 连接池和查询缓存
  │
  ├─ 任务要跨分钟、小时、天
  │    └─ Workflows: durable steps、sleep、retry、waitForEvent
  │
  ├─ 日志、点击流、IoT、移动端事件要进 R2
  │    └─ Pipelines: streams -> SQL transforms -> sinks
  │          └─ R2 JSON / Parquet / R2 Data Catalog Iceberg
  │
  └─ Workers 运行时不够
       └─ Containers: 自定义 runtime、完整文件系统、并行 CPU、大内存/磁盘
```

普通项目的默认顺序仍然是 Workers、D1、R2、KV、Queues、Durable Objects。只有当这些基础能力已经解释不了需求时，再看这一页。

## 一句话判断

| 产品 | 解决什么 | 什么时候用 | 什么时候别用 |
| --- | --- | --- | --- |
| Hyperdrive | 让 Workers 更稳定、更快地访问已有 Postgres / MySQL。 | 已经有 Neon、Supabase、RDS、Cloud SQL、PlanetScale、CockroachDB、Timescale 等数据库。 | 新小项目没有外部数据库时，优先 D1。 |
| Workflows | 把多步骤、可重试、可暂停的长流程持久化。 | AI 批处理、审批、邮件生命周期、导入导出、跨系统同步。 | 只是削峰或后台异步任务时，先用 Queues。 |
| Pipelines | 把实时事件流写入 R2 / Iceberg / Parquet / JSON。 | 日志、点击流、IoT、移动端事件、数据湖。 | 没有分析团队、数据仓库或批量事件需求时，不要先上。 |
| Containers | 在 Workers 旁边跑容器镜像。 | 需要完整 Linux-like 环境、文件系统、并行 CPU、大内存、现成镜像。 | 能用 Worker 原生实现时，不要为了“像传统后端”上容器。 |
| R2 Data Catalog | 让 R2 bucket 变成 Apache Iceberg data catalog。 | R2 已经承载分析数据，需要 Spark、Snowflake、PyIceberg、DuckDB 等查询。 | 普通文件存储、图片、附件、备份不需要。 |

本站当前不需要这些产品。文档站、搜索和评论都能用 Workers Static Assets、Pagefind、Twikoo Worker、D1 解决；下一步真有长流程时才会看 Workflows。

## 二次精读结论

这组产品的共同点是：它们都不是“先手产品”，而是在 Workers / D1 / R2 / KV / Queues / Durable Objects 已经解释不了需求之后才进场。

| 产品 | 本次复核新增口径 | 普通项目判断 |
| --- | --- | --- |
| Hyperdrive | 官方文档强调 connection pooling、query caching、私有数据库通过 Workers VPC 连接、GraphQL 指标和支持数据库边界。 | 已有 Postgres / MySQL 才看；新小项目仍然优先 D1。 |
| Workflows | 官方规则页强调 step 幂等、粒度、确定性命名、不要把副作用放在 `step.do` 外、Hyperdrive 连接要在 step 内创建。 | 不是 Queues 的替代品；跨步骤、跨天、要恢复状态的流程才上。 |
| Pipelines | 新架构拆成 Streams、Pipelines、Sinks；overview 标注 open beta 且需要 Workers Paid；legacy pipelines 有迁移路径。 | 数据湖、遥测、日志流和 Iceberg / Parquet 需求明确后再用。 |
| R2 Data Catalog | 已有独立 pricing 页；catalog operations、compaction data processed、objects processed 都有月度 included usage。 | 它是 Iceberg catalog，不是普通文件索引，也不是事务数据库。 |
| Containers | 官方定位是 Workers 旁边的 serverless containers；所有入站请求先过 Worker，再到 Durable Object 控制的 container instance。 | 容器是运行时补位；能 Worker 原生实现就不要上容器。 |

## 上线前问题

| 问题 | 如果答案是“否” |
| --- | --- |
| 是否已经用 Workers / D1 / R2 / Queues / Durable Objects 试过更简单的解法？ | 先回到基础产品，避免把复杂度买早了。 |
| 是否知道这个产品的付费入口是 Workers Paid、R2 subscription、usage-based billing，还是 Enterprise / beta 权限？ | 先回到 pricing / limits，不要只看开关能不能点。 |
| 是否有明确的观测指标？ | Hyperdrive 看 query latency / cache status / pool waiting clients；Workflows 看 instance status / step duration；Pipelines 看 ingest / transform / sink errors；Containers 看 memory / CPU / disk / logs。 |
| 是否知道失败后如何恢复？ | Workflows 要有幂等和 rollback；Pipelines 要能重放或迁移 stream；Containers 要能处理 rolling rollout 和 ephemeral disk。 |
| 是否能把大对象和大状态放到 R2 / D1，只在流程里传引用？ | Workflows step return、Pipelines event、Container disk 都不该承载无限状态。 |

## Hyperdrive

Hyperdrive 的定位很窄：不是新数据库，而是让 Workers 连接现有 Postgres / MySQL 更舒服。它提供全局连接池和查询缓存，Workers 代码仍然使用熟悉的数据库 driver 或 ORM。

| 边界 | Free | Workers Paid |
| --- | ---: | ---: |
| Database queries | 100,000/day | Unlimited |
| Configured databases | 10/account | 25/account |
| Origin database connections / configuration | 约 20 | 约 100 |
| Initial connection timeout | 15 seconds | 15 seconds |
| Idle connection timeout | 10 minutes | 10 minutes |
| Maximum query duration | 60 seconds | 60 seconds |
| Maximum cached query response size | 50 MB | 50 MB |

几个实践判断：

- Hyperdrive query 包含 `SELECT`、`INSERT`、`UPDATE`、`DELETE`、`CREATE`、`ALTER`、`DROP` 等所有通过 Hyperdrive 发出的 database statement。
- 缓存命中的 query 也会计入 Hyperdrive query 限制。
- Hyperdrive 不额外收 data transfer / egress 费用。
- connection pooling 和 query caching 包含在 Workers Paid 里，不另收费。
- 长事务、长查询和连接长时间占用，仍然会把 origin database connection pool 打满。
- Hyperdrive 支持 PostgreSQL 9.0 到 17.x、MySQL 5.7 到 8.x，以及 MariaDB、Aurora、Timescale、Materialize、CockroachDB、PlanetScale 等兼容协议的数据库；SQL Server 和 MongoDB 当前不支持。
- 私有数据库的推荐路径是 Workers VPC：Worker -> Hyperdrive -> VPC Service -> Cloudflare Tunnel -> Private Database。
- Hyperdrive connection pooler 以 transaction mode 工作；不要依赖跨查询的 session state，也不要把 advisory locks 这类 unsupported feature 当作基础能力。
- 观测时重点看 cache status、query latency、connection latency、open connections、available slots 和 waiting clients。waiting clients 增长通常说明连接池争用。

普通项目如果还没有数据库，先用 D1。Hyperdrive 更适合“数据库已经在外部，Workers 只是全球 API 层”的项目。

## Workflows

Workflows 适合把长流程拆成 durable steps。它能自动重试、sleep、等待外部事件，并持久化实例状态。关键不是“能跑更久”，而是“流程状态不用自己拼 D1 表、队列和定时任务来维护”。

| 边界 | Workers Free | Workers Paid |
| --- | ---: | ---: |
| Requests / invocations | 100,000/day，和 Workers request 共享 | 10M/month included，超出 $0.30/million |
| CPU time | 10 ms/invocation | 30M CPU ms/month included，超出 $0.02/million CPU ms |
| Storage | 1 GB | 1 GB included，超出 $0.20/GB-month |
| Persisted state / instance | 100 MB | 1 GB |
| Maximum steps / Workflow | 1,024 | 默认 10,000，可配置到 25,000 |
| Concurrent running instances / account | 100 | 50,000 |
| Instance creation rate | 100/s | 300/s/account，100/s/workflow |
| Completed state retention | 3 days | 30 days |
| Maximum `step.sleep` | 365 days | 365 days |

Workflows 的几个关键事实：

- 等待 API 响应、`step.sleep`、等待外部事件时，不消耗 CPU time。
- `waiting` 状态的实例不计入 running concurrency limit。
- 单个 step 的 wall time 可以无限，但 CPU 仍受 Worker CPU limit 约束。
- Free 的 subrequests 仍受 Workers Free 限制；Paid 默认 10,000/request，可配置到 10M。
- Storage billing 已在 2025-09-15 生效，长期保留实例状态会进入成本模型。
- `step.sleep` 和 `step.sleepUntil` 不计入 maximum Workflow steps limit；`step.waitForEvent` 适合等待外部 webhook 或人工动作，默认 timeout 为 24 小时。
- 默认 retry 使用 exponential backoff；每个 step 可配置 retries、delay、backoff 和 timeout；永久错误应抛 `NonRetryableError`，不应该无限重试。
- `step.do` 的非 stream 返回值要保持在 1 MiB 以内；大文件或大结果应该写入 R2，再在 step state 里保存 key。
- Workflows 已有 Python SDK 和 DAG Workflows：可用参数依赖表达 step dependency，并支持 `concurrent=True` 并行依赖。普通 Worker 项目仍以 TypeScript / JavaScript WorkflowEntrypoint 为默认入口。

Workflows 的工程规则比 API 名字更重要：

| 规则 | 原因 |
| --- | --- |
| step 要尽量幂等。 | step 可能重试，多次执行不能重复扣款、重复发货或重复写不可逆状态。 |
| step 要小而清楚。 | 每个 step 可以单独 retry、timeout 和记录状态；整段逻辑塞进一个 step 会失去恢复粒度。 |
| 不要依赖 step 外的内存状态。 | Workflow 可能 hibernate 或重启，只有 step 返回值会作为持久状态继续使用。 |
| 不要在 `step.do` 外做副作用。 | 引擎重启可能让 step 外逻辑重复执行。日志可以重复，扣款、写库和发邮件不行。 |
| step name 要确定。 | step name 是恢复和缓存 step state 的 key；不要把 `Date.now()`、随机数放进名字。 |
| Hyperdrive 连接要在 step 内创建。 | 官方规则明确建议在每个 `step.do()` 内创建并使用连接，不要跨 step 复用连接。 |

选择顺序可以这样看：

| 需求 | 优先选 |
| --- | --- |
| 同步 API 请求 | Workers |
| 后台异步、削峰、重试队列 | Queues |
| 多步骤、等待审批、跨天状态、长生命周期 | Workflows |
| 单实体强一致、房间、WebSocket、限流器 | Durable Objects |

## Pipelines

Pipelines 是把事件流写进 R2 数据湖的产品。它的路径是：stream 收事件，pipeline 用 SQL 做过滤和转换，sink 写 R2 JSON / Parquet 或 R2 Data Catalog Iceberg。

官方概览页当前标注 Pipelines 为 open beta，并提示任意开发者需要 Workers Paid plan 才能开始使用。pricing 页面同时列出 Workers Free 和 Workers Paid 的 included usage；实际可用性以当前 Dashboard / Wrangler 为准。

| 计费项 | Workers Free | Workers Paid |
| --- | ---: | ---: |
| Streams ingress | 1 GB/month included | Unlimited |
| SQL transforms | 1 GB/month included | 50 GB/month included，超出 $0.04/GB |
| Sinks | 1 GB/month included | 50 GB/month included |
| R2 JSON sink | N/A | $0.03/GB |
| R2 Parquet / Iceberg sink | N/A | $0.06/GB |

Pipelines open beta 当前限制：

| 限制 | 值 |
| --- | ---: |
| Streams / account | 20 |
| Maximum payload size / ingestion request | 5 MB |
| Maximum ingest rate / stream | 5 MB/s |
| Sinks / account | 20 |
| Pipelines / account | 20 |

成本要同时看三层：

1. Pipelines 自身的 SQL transforms 和 sinks。
2. R2 standard storage 和 operations。
3. 写 Iceberg table 时的 R2 Data Catalog 费用或 beta 状态。

普通项目不要把 Pipelines 当日志系统的第一步。先用 Workers Logs、Logpush、Analytics Engine 或业务表；当你明确要把大量事件做成 lakehouse，再看 Pipelines。

几个实现边界：

- Streams 是 durable buffered queues，可通过 Worker binding 或 HTTP endpoint 写入。
- Wrangler 配置中的 `pipelines` binding 现在指向 `stream`；旧的 `pipeline` 字段仍可工作，但 Wrangler 会提示 deprecation warning。
- 结构化 stream 的事件必须匹配 schema；不匹配的事件会被接受但丢弃。要用 `wrangler types` 生成 typed pipeline bindings，并观察 user error metrics。
- R2 Data Catalog sink 会把数据写成 Apache Iceberg table，只支持 Parquet，不支持 JSON；最小写入间隔是 60 秒，避免和 compaction 冲突。
- 2025-09-25 之前通过 legacy API 创建的 legacy pipelines 已在迁移路径上。新架构把 streams、pipelines、sinks 分离，并支持 SQL transformations、JSON / Parquet / Iceberg、schema validation、rolling policies 和 partitioning。

## R2 Data Catalog

R2 Data Catalog 是内建在 R2 bucket 里的 Apache Iceberg catalog。它让 Spark、Snowflake、PyIceberg 等查询引擎通过标准 Iceberg REST catalog 接口访问 R2 上的数据。

当前官方页面标注为 public beta。R2 Data Catalog 有独立 pricing 页：除标准 R2 storage 和 operations 外，还要看 catalog operations，以及开启 automatic compaction 后的 data processed 和 objects processed。

| 计费项 | Free included | Paid included | Paid 超出 |
| --- | ---: | ---: | ---: |
| Catalog operations | 1M/month | 1M/month | $9.00 / million operations |
| Compaction data processed | 10 GB/month | 10 GB/month | $0.005 / GB processed |
| Compaction objects processed | 1M/month | 1M/month | $2.00 / million objects |

Snapshot expiration 当前不额外收费，但仍会产生标准 R2 storage 和 catalog operations 相关成本。compaction 只有开启后才产生 compaction charges。

适合它的场景：

- 日志分析、BI、数据管道和 lakehouse。
- 多个查询引擎需要一致读取 R2 上的表。
- 需要 Iceberg 的 ACID transactions、metadata、schema evolution。

不适合它的场景：

- 用户上传文件。
- 图片和附件托管。
- 小型导出文件。
- 文档站搜索索引。

运维时还要记住：

- 启用 catalog 后，bucket 会获得 Catalog URI 和 Warehouse name，Iceberg 客户端依赖这两个信息。
- Iceberg engine 需要同时具备 R2 Data Catalog 和 R2 storage 权限的 API token，因为 catalog 会给 engine 提供访问底层 R2 data files 的 SigV4 credential。
- Compaction 会合并小文件，提升查询性能；open beta 期间每张表每小时最多 compact 2 GB 文件，当前只支持 parquet data files。
- Snapshot expiration 默认按 `--older-than-days` 和 `--retain-last` 两个条件控制，适合控制 metadata 和旧 snapshot 的存储成本。

## Containers

Containers 是 Workers Paid 里的补位能力。它让 Worker 控制容器实例，适合完整 runtime、文件系统、现有镜像、并行 CPU、大内存或磁盘需求。

| 资源 | Workers Paid included | 超出价格 |
| --- | ---: | ---: |
| Memory | 25 GiB-hours/month | $0.0000025/GiB-second |
| CPU | 375 vCPU-minutes/month | $0.000020/vCPU-second |
| Disk | 200 GB-hours/month | $0.00000007/GB-second |

Container charges 在请求发送到 container 或手动启动实例时开始，实例 sleep 后停止。Memory 和 disk 按 provisioned resources 计算，CPU 按 active usage 计算。

运行模型要先看清楚：

- Containers 只在 Workers Paid plan 可用。
- 入站请求先到 Worker，再到背后的 Durable Object，最后由 Durable Object 控制 Container instance。
- 终端用户不能直接向 Container 发 non-HTTP TCP / UDP 请求；所有入站都要经 Worker。
- 新的 container ID 第一次启动会 cold start；官方生命周期页给出的常见冷启动量级是 1-3 秒，但会受 image size 和 entrypoint 影响。
- Container disk 是 ephemeral。实例 sleep 后再次启动会得到镜像定义的新磁盘；持久化文件要写 R2、外部对象存储，或谨慎评估 FUSE。
- Container 实例关闭时先收到 `SIGTERM`，15 分钟后还没停会收到 `SIGKILL`；清理逻辑要放在这段窗口内。

| Instance Type | vCPU | Memory | Disk |
| --- | ---: | ---: | ---: |
| lite | 1/16 | 256 MiB | 2 GB |
| basic | 1/4 | 1 GiB | 4 GB |
| standard-1 | 1/2 | 4 GiB | 8 GB |
| standard-2 | 1 | 6 GiB | 12 GB |
| standard-3 | 2 | 8 GiB | 16 GB |
| standard-4 | 4 | 12 GiB | 20 GB |

容器还有几类额外成本：

- Container egress：North America & Europe $0.025/GB 且每月包含 1 TB；Oceania / Korea / Taiwan $0.05/GB 且每月包含 500 GB；其他区域 $0.04/GB 且每月包含 500 GB。
- 请求仍由 Worker 处理，会产生 Workers 计费。
- 每个 container 有自己的 Durable Object，会产生 Durable Objects 计费。
- Containers logs 进入 Workers Logs 体系，按 Workers Logs 计费。

账户级限制：

| 限制 | 值 |
| --- | ---: |
| Concurrent memory | 6 TiB |
| Concurrent vCPU | 1,500 |
| Concurrent disk | 30 TB |
| Total image storage / account | 50 GB |

普通项目不要把 Containers 当默认后端。先问三个问题：

1. 能不能用 Worker 原生 API 写掉？
2. 能不能把重活拆成 Queues / Workflows / R2？
3. 这个依赖是不是必须完整 Linux-like 环境？

三个答案都指向容器时，再上 Containers。

容器上线时要补三类策略：

| 策略 | 要点 |
| --- | --- |
| Scaling / routing | 目前需要显式 ID 控制实例生命周期；stateless 场景可用 `getRandom` 在固定数量实例间随机路由，但它不是内建自动扩缩容。 |
| Outbound traffic | 默认可访问互联网；可用 `enableInternet = false`、`allowedHosts`、`deniedHosts` 和 outbound handlers 做 deny-by-default 出站控制。 |
| Rollout | `wrangler deploy` 会立即更新 Worker 代码，但 container instances 是 rolling deploy；默认先更新 10%，再更新剩余 90%。部署期间要保持 Worker 与旧/新容器版本兼容。 |

Container 访问 KV、R2、D1、Durable Objects 等 Workers bindings 时，不是在容器里直接拿 binding。官方路径是让容器向虚拟 hostname 发 HTTP 请求，由 Worker outbound handler 在 Workers runtime 里读取 binding 并返回结果。这个设计让密钥和 binding 留在 Worker 侧，容器只看到受控接口。

## 普通项目组合

| 场景 | 推荐组合 |
| --- | --- |
| 外部 Postgres 做主库，Workers 做 API | Workers + Hyperdrive + ORM |
| 用户注册后跨 14 天邮件流程 | Workers + Workflows + Email Service |
| 大文件导出，生成后存储 | Workers + Workflows + R2 + D1 状态 |
| 日志进入数据湖 | Workers / Logpush + Pipelines + R2 + R2 Data Catalog |
| 已有 CLI 或 Python 工具必须运行 | Workers + Containers + R2 |
| AI 批处理要等待人工审核 | Workflows + Workers AI / AI Gateway + R2 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 有数据库就接 Hyperdrive。 | 新项目优先 D1；已有外部 Postgres / MySQL 再接 Hyperdrive。 |
| 有异步任务就上 Workflows。 | 简单异步先 Queues；多步骤和跨天状态再 Workflows。 |
| 所有日志都进 Pipelines。 | 先明确分析目的和数据保留；小项目先用 Workers Logs / Analytics。 |
| Worker 不会写就上 Containers。 | Containers 是运行时补位，不是逃避 Worker 模型的默认后端。 |
| R2 Data Catalog 可以替代普通数据库。 | 它面向 Iceberg / lakehouse，不是事务数据库。 |
| 只看 Containers 的 CPU 价格。 | 还要看内存、磁盘、egress、Workers、Durable Objects 和 logs。 |

## 本站当前选择

| 模块 | 当前做法 | 是否需要本页产品 |
| --- | --- | --- |
| 文档页面 | Workers Static Assets | 不需要。 |
| 搜索 | Pagefind | 不需要 Pipelines / Data Catalog。 |
| 评论 | Twikoo Worker + D1 | 不需要 Hyperdrive。 |
| 部署流程 | pnpm build + wrangler deploy | 不需要 Workflows。 |
| 后续 AI 搜索 | AI Search 或 Vectorize | 内容规模足够后再评估，不先上 Pipelines。 |

这组产品很有价值，但它们应该在“需求已经长出来”后再引入。早期最好的架构不是全，而是少、准、能验证。

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [cloudflare/cloudflare-docs Hyperdrive source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/hyperdrive) | 官方 Hyperdrive 文档源文件，追踪 pricing、limits、connection pooling、query caching 和各数据库示例。 |
| [cloudflare/cloudflare-docs Workflows source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workflows) | 官方 Workflows 文档源文件，追踪 durable steps、limits、pricing、Wrangler commands 和 examples。 |
| [cloudflare/cloudflare-docs Pipelines source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/pipelines) | 官方 Pipelines 文档源文件，追踪 streams、sinks、SQL transforms、pricing 和 limits。 |
| [cloudflare/cloudflare-docs Containers source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/containers) | 官方 Containers 文档源文件，追踪 instance types、pricing、limits、routing 和 Worker 连接方式。 |
| [cloudflare/cloudflare-docs R2 Data Catalog source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/r2/data-catalog) | 官方 R2 Data Catalog 文档源文件，追踪 Iceberg catalog、配置和 beta 状态。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Miniflare、C3 和 Cloudflare Workers SDK 源码，适合追踪命令和本地开发行为。 |
| [cloudflare/workerd](https://github.com/cloudflare/workerd) | Workers runtime 开源实现，适合理解 Worker 模型边界。 |

## 事实来源

- [Hyperdrive](https://developers.cloudflare.com/hyperdrive/)
- [Hyperdrive pricing](https://developers.cloudflare.com/hyperdrive/platform/pricing/)
- [Hyperdrive limits](https://developers.cloudflare.com/hyperdrive/platform/limits/)
- [How Hyperdrive works](https://developers.cloudflare.com/hyperdrive/concepts/how-hyperdrive-works/)
- [Hyperdrive supported databases and features](https://developers.cloudflare.com/hyperdrive/reference/supported-databases-and-features/)
- [Connect Hyperdrive to a private database using Workers VPC](https://developers.cloudflare.com/hyperdrive/configuration/connect-to-private-database-vpc/)
- [Hyperdrive metrics and analytics](https://developers.cloudflare.com/hyperdrive/observability/metrics/)
- [Workflows](https://developers.cloudflare.com/workflows/)
- [Workflows pricing](https://developers.cloudflare.com/workflows/reference/pricing/)
- [Workflows limits](https://developers.cloudflare.com/workflows/reference/limits/)
- [Rules of Workflows](https://developers.cloudflare.com/workflows/build/rules-of-workflows/)
- [Workflows sleeping and retrying](https://developers.cloudflare.com/workflows/build/sleeping-and-retrying/)
- [Workflows Workers API](https://developers.cloudflare.com/workflows/build/workers-api/)
- [DAG Workflows](https://developers.cloudflare.com/workflows/python/dag/)
- [Pipelines](https://developers.cloudflare.com/pipelines/)
- [Pipelines pricing](https://developers.cloudflare.com/pipelines/platform/pricing/)
- [Pipelines limits](https://developers.cloudflare.com/pipelines/platform/limits/)
- [Writing to streams](https://developers.cloudflare.com/pipelines/streams/writing-to-streams/)
- [Pipelines R2 Data Catalog sink](https://developers.cloudflare.com/pipelines/sinks/available-sinks/r2-data-catalog/)
- [Pipelines legacy pipelines](https://developers.cloudflare.com/pipelines/reference/legacy-pipelines/)
- [R2 Data Catalog](https://developers.cloudflare.com/r2/data-catalog/)
- [R2 Data Catalog pricing](https://developers.cloudflare.com/r2/data-catalog/platform/pricing/)
- [R2 Data Catalog table maintenance](https://developers.cloudflare.com/r2/data-catalog/table-maintenance/)
- [Containers](https://developers.cloudflare.com/containers/)
- [Containers pricing](https://developers.cloudflare.com/containers/pricing/)
- [Containers limits and instance types](https://developers.cloudflare.com/containers/platform-details/limits/)
- [Lifecycle of a Container](https://developers.cloudflare.com/containers/platform-details/architecture/)
- [Container scaling and routing](https://developers.cloudflare.com/containers/platform-details/scaling-and-routing/)
- [Container outbound traffic](https://developers.cloudflare.com/containers/platform-details/outbound-traffic/)
- [Connect Containers to Workers and bindings](https://developers.cloudflare.com/containers/platform-details/workers-connections/)
- [Container rollouts](https://developers.cloudflare.com/containers/platform-details/rollouts/)
