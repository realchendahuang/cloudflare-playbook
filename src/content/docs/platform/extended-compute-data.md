---
title: 扩展计算与数据管道
description: Hyperdrive、Workflows、Pipelines、Containers 和 R2 Data Catalog 什么时候才需要。
---

## 选择表

| 需求 | 看什么 | 边界 |
| --- | --- | --- |
| 已有 Postgres / MySQL 主库，Worker 需要稳定访问。 | Hyperdrive。 | 新项目先建外部数据库。 |
| 任务跨很长时间，并且失败后要恢复。 | Workflows。 | 简单邮件、通知、导入先用 Queues。 |
| 大量事件要进入 R2 做长期分析。 | Pipelines。 | 排障日志先用 Workers Logs 或外部日志。 |
| R2 里的分析数据要被查询工具当表读。 | R2 Data Catalog。 | 文件、图片、附件管理。 |
| Worker 原生运行时装不下依赖。 | Containers。 | 普通接口和后台任务先用 Worker 运行时。 |

## 产品定位

| 产品 | 适用条件 |
| --- | --- |
| Hyperdrive | 外部数据库已经是事实源。 |
| Workflows | 任务需要状态、恢复、等待和多步骤编排。 |
| Pipelines | 事件流已经有长期分析价值。 |
| R2 Data Catalog | R2 数据已经按分析表组织。 |
| Containers | 需要运行 Worker 原生运行时承载不了的依赖或工具。 |

## 升级信号

| 信号 | 下一步 |
| --- | --- |
| 外部数据库已经是事实源。 | 用 Hyperdrive 改善 Worker 访问。 |
| 队列只能削峰，无法表达流程状态。 | 看 Workflows。 |
| 事件量已经需要长期分析。 | 看 Pipelines + R2。 |
| R2 上的数据要被 BI 或查询工具读取。 | 看 R2 Data Catalog。 |
| 需要运行现成工具、脚本或完整运行环境。 | 看 Containers。 |
