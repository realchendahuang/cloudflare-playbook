---
title: 扩展计算与数据管道
description: 什么时候才需要 Hyperdrive、Workflows、Pipelines、Containers 和 R2 Data Catalog。
---

这组产品不是 Cloudflare 入门第一层。默认先用 Workers、D1、R2、KV、Queues 和 Durable Objects。只有基础能力解释不了需求时，再看这一页。

## 先判断

| 需求 | 先看什么 | 先别看什么 |
| --- | --- | --- |
| 已有 Postgres / MySQL 主库，Worker 需要稳定访问。 | Hyperdrive。 | 新项目先建外部数据库。 |
| 任务跨很长时间，并且失败后要恢复。 | Workflows。 | 简单邮件、通知、导入直接上复杂流程。 |
| 大量事件要进入 R2 做长期分析。 | Pipelines。 | 早期把所有日志做成数据湖。 |
| R2 里的分析数据要被查询工具当表读。 | R2 Data Catalog。 | 文件、图片、附件管理。 |
| Worker 原生运行时装不下依赖。 | Containers。 | 接口和后台任务。 |

## 默认先不用

| 产品 | 原因 |
| --- | --- |
| Hyperdrive | 只有已有外部数据库时才有价值；新小项目用 D1 更简单。 |
| Workflows | 多数异步任务用 Queues 就够。 |
| Pipelines | 它服务事件流和数据湖，排障先用日志或业务表。 |
| R2 Data Catalog | 它服务分析表，不是 R2 文件索引。 |
| Containers | 会叠加运行时、日志和出站成本，能不用就先不用。 |

## 升级信号

| 信号 | 下一步 |
| --- | --- |
| 外部数据库已经是事实源。 | 用 Hyperdrive 改善 Worker 访问。 |
| 队列只能削峰，无法表达流程状态。 | 看 Workflows。 |
| 事件量已经需要长期分析。 | 看 Pipelines + R2。 |
| R2 上的数据要被 BI 或查询工具读取。 | 看 R2 Data Catalog。 |
| 必须运行现成工具、脚本或完整运行环境。 | 看 Containers。 |

核心原则：越靠后的产品，越应该先有明确用量、恢复策略和停用策略。
