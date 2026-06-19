---
title: 扩展计算与数据管道
---

## 选择

已有 Postgres / MySQL 主库，Worker 需要稳定访问时，看 Hyperdrive。长时间任务失败后要恢复时，看 Workflows。大量事件要进入 R2 做长期分析时，看 Pipelines。R2 里的分析数据要被查询工具当表读时，看 R2 Data Catalog。Worker 原生运行时装不下依赖时，看 Containers。

## 产品定位

Hyperdrive 适合外部数据库已经是事实源的项目。Workflows 适合需要状态、恢复、等待和多步骤编排的任务。Pipelines 适合已经有长期分析价值的事件流。R2 Data Catalog 适合已经按分析表组织的 R2 数据。Containers 适合 Worker 原生运行时承载不了的依赖、工具或现成后端。

## 取舍细节

Worker 直接连单区域 Postgres / MySQL 时，全球边缘节点可能遇到跨区域延迟和连接数压力，Hyperdrive 用在这里。新项目还没有主库时，D1 覆盖轻量关系数据；外部主库留给既有系统或明确的数据库团队。

Go / Python / 带系统依赖的现成后端，可以看 Containers。它是付费运行环境，适合承载 Worker 装不下的依赖。轻接口如果可以重写，Hono + Workers 可以直接接部署、日志和数据绑定。慢任务流程简单时用 Queues；需要等待、恢复、多步骤状态时再上 Workflows。

## 升级信号

- 外部数据库已经是事实源时，用 Hyperdrive 改善 Worker 访问。
- 队列只能削峰、无法表达流程状态时，看 Workflows。
- 事件量已经需要长期分析时，看 Pipelines + R2。
- R2 上的数据要被 BI 或查询工具读取时，看 R2 Data Catalog。
- 需要运行现成工具、脚本或完整运行环境时，看 Containers。
