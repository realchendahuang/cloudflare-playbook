---
title: 扩展计算与数据管道
description: Hyperdrive、Workflows、Pipelines、Containers 和 R2 Data Catalog 的普通项目取舍。
---

最后核对日期：2026-06-18。这里的产品变化快，价格、beta 状态、可用计划和 limits 以上线前官方页面为准。

这组产品不是 Cloudflare 入门第一层。普通项目默认先用 Workers、D1、R2、KV、Queues、Durable Objects。只有基础能力已经解释不了需求时，再看这一页。

## 一句话判断

| 需求 | 先看什么 | 先别看什么 |
| --- | --- | --- |
| 已经有 Postgres / MySQL 主库，只想让 Worker 更好访问 | Hyperdrive | 新项目先建外部数据库。 |
| 一个任务要跨分钟、小时、天，并且失败后能恢复 | Workflows | 简单邮件、通知、导入直接上复杂流程。 |
| 大量事件要进入 R2 做后续分析 | Pipelines | 小项目把所有日志都做成数据湖。 |
| R2 里的分析数据要被外部查询工具当表读 | R2 Data Catalog | 普通文件、图片、附件管理。 |
| Worker 原生运行时装不下依赖，必须跑容器 | Containers | 普通 API、普通后台任务。 |

## 默认先不用

| 产品 | 为什么先不用 |
| --- | --- |
| Hyperdrive | 新项目用 D1 更简单；只有已有外部数据库时才有价值。 |
| Workflows | 多数异步任务用 Queues 就够；Workflows 适合更长、更有状态的流程。 |
| Pipelines | 它服务事件流和数据湖；普通排障先用 Workers Logs / Analytics Engine。 |
| R2 Data Catalog | 它服务分析表和查询工具，不是 R2 文件索引。 |
| Containers | 容器会叠加内存、CPU、磁盘、日志和出站流量成本；能不用就先不用。 |

## 什么时候升级

| 信号 | 该看什么 |
| --- | --- |
| D1 不是主库，外部 Postgres / MySQL 才是事实源 | Hyperdrive。 |
| 队列只能削峰，但解释不了流程状态和恢复 | Workflows。 |
| 事件量已经大到需要长期分析，而不是临时排障 | Pipelines + R2。 |
| R2 上已有分析数据，需要被外部工具稳定读取 | R2 Data Catalog。 |
| 现成 CLI、Python 工具或完整运行环境无法放进 Worker | Containers。 |

## 成本先看什么

| 产品 | 先盯 |
| --- | --- |
| Hyperdrive | 查询次数、缓存命中、外部数据库本身的慢查询。 |
| Workflows | 实例数、步骤数、状态大小、重试次数。 |
| Pipelines | 输入量、转换量、写入量，以及 R2 后续存储。 |
| R2 Data Catalog | catalog 操作、压缩维护、R2 存储。 |
| Containers | 运行时长、内存、CPU、磁盘、日志和出站流量。 |

核心原则：越靠后的产品，越应该有明确的使用量、恢复策略和停用策略。不要为了“架构完整”提前购买复杂度。

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 新项目先上 Hyperdrive。 | 新小项目优先 D1；已有外部数据库再接 Hyperdrive。 |
| 有异步任务就上 Workflows。 | 简单削峰和后台任务先用 Queues。 |
| Pipelines 是日志默认路线。 | 小项目先用 Workers Logs、Analytics Engine 或业务表。 |
| R2 Data Catalog 能管理所有 R2 文件。 | 普通附件、图片和导出物仍按 R2 对象管理。 |
| Containers 可以替代 Worker 学习成本。 | Containers 是运行时补位，不是默认后端形态。 |

## 事实来源

| 来源 | 用途 |
| --- | --- |
| [Hyperdrive pricing](https://developers.cloudflare.com/hyperdrive/platform/pricing/) | Hyperdrive 价格和额度。 |
| [Workflows pricing](https://developers.cloudflare.com/workflows/reference/pricing/) | Workflows 计费入口。 |
| [Pipelines](https://developers.cloudflare.com/pipelines/) | Pipelines 产品和 beta 状态。 |
| [R2 Data Catalog](https://developers.cloudflare.com/r2/data-catalog/) | R2 Data Catalog 定位。 |
| [Containers pricing](https://developers.cloudflare.com/containers/pricing/) | Containers 计费入口。 |
| [cloudflare/cloudflare-docs developer platform source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs) | 官方 Markdown 源文件。 |
