---
title: 扩展计算与数据管道
---

## 选择表

| 场景 | 推荐能力 |
| --- | --- |
| 已有 Postgres / MySQL 主库，Worker 需要稳定访问。 | Hyperdrive。 |
| 长时间任务，并且失败后要恢复。 | Workflows。 |
| 大量事件要进入 R2 做长期分析。 | Pipelines。 |
| R2 里的分析数据要被查询工具当表读。 | R2 Data Catalog。 |
| Worker 原生运行时装不下依赖。 | Containers。 |

## 产品定位

| 产品 | 适用条件 |
| --- | --- |
| Hyperdrive | 外部数据库已经是事实源。 |
| Workflows | 任务需要状态、恢复、等待和多步骤编排。 |
| Pipelines | 事件流已经有长期分析价值。 |
| R2 Data Catalog | R2 数据已经按分析表组织。 |
| Containers | 需要运行 Worker 原生运行时承载不了的依赖、工具或现成后端。 |

## 取舍细节

| 场景 | 判断依据 |
| --- | --- |
| Worker 连单区域 Postgres / MySQL | 全球边缘节点直接连单一区域数据库，可能遇到跨区域延迟和连接数压力；Hyperdrive 用在这里。 |
| 新项目还没有主库 | D1 覆盖轻量关系数据；外部主库留给既有系统或明确的数据库团队。 |
| Go / Python / 带系统依赖的现成后端 | Containers 是付费运行环境，适合承载 Worker 装不下的依赖。 |
| 轻接口可以重写 | Hono + Workers 可以直接接部署、日志和数据绑定。 |
| 慢任务，流程简单 | 用 Queues；需要等待、恢复、多步骤状态时再上 Workflows。 |

## 升级信号

| 触发信号 | 后续操作 |
| --- | --- |
| 外部数据库已经是事实源。 | 用 Hyperdrive 改善 Worker 访问。 |
| 队列只能削峰，无法表达流程状态。 | 看 Workflows。 |
| 事件量已经需要长期分析。 | 看 Pipelines + R2。 |
| R2 上的数据要被 BI 或查询工具读取。 | 看 R2 Data Catalog。 |
| 需要运行现成工具、脚本或完整运行环境。 | 看 Containers。 |
