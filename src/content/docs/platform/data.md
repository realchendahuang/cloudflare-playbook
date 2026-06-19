---
title: 数据能力
description: D1、KV、R2、Durable Objects、Queues 和后续数据能力怎么选。
---

## 按数据形态选

| 你手里的数据 | 先看 | 边界 |
| --- | --- | --- |
| 评论、表单、用户资料、小后台、订单 | [D1](/platform/d1/) | R2、KV、Durable Objects。 |
| 图片、附件、导出文件、备份 | [R2](/platform/r2/) | D1 存文件本体。 |
| 配置、功能开关、公开索引、低频缓存 | [KV](/platform/kv/) | 强一致数据库。 |
| 房间、会话、限流器、WebSocket 状态 | [Durable Objects](/platform/durable-objects/) | 全站大表或分析库。 |
| 邮件、通知、导入、审核、后处理 | [Queues](/platform/queues/) | 用户请求里同步跑慢任务。 |
| 已有 Postgres / MySQL | [Hyperdrive](/platform/extended-compute-data/) | 新项目先建外部数据库。 |
| 文档语义搜索 | [AI Search](/platform/ai/) / Vectorize | 文档很少时直接上向量库。 |
| 产品指标、用量统计 | [观测与日志](/platform/observability/) | D1 记录海量事件。 |

## 判断顺序

| 问题 | 选择 |
| --- | --- |
| 这是文件本体吗？ | R2；归属、权限和索引再放 D1。 |
| 需要 SQL、筛选、排序、关联和迁移吗？ | D1。 |
| 读远多于写，且可以接受短时间旧值吗？ | KV。 |
| 同一个实体需要全局顺序写入吗？ | Durable Objects。 |
| 这件事可以晚点做、失败重试或批量处理吗？ | Queues。 |
| 已经有外部数据库，不想迁移主库吗？ | Hyperdrive。 |
| 是自然语言搜索吗？ | 先 Pagefind；需要语义理解再看 AI Search / Vectorize。 |
| 是持续涌入的事件和指标吗？ | 指标分析、数据管道或 R2。 |

## 什么时候迁移

| 当前做法 | 出现信号 | 下一步 |
| --- | --- | --- |
| D1 里塞大段内容、图片或附件 | 数据库变慢，备份和查询都难受 | 文件本体迁到 R2，D1 只留元数据。 |
| KV 存会话、库存、计数器 | 需要强撤销、强一致或高频写同一个 key | 写路径迁到 D1 或 Durable Objects。 |
| 请求里同步处理慢任务 | 邮件、AI、导入、审核拖慢响应 | 放入 Queues，用户请求只返回状态。 |
| R2 里只有文件，没有索引 | 需要按用户、标签、状态、时间分页 | D1 建元数据表。 |
| 单个 D1 库持续变大 | 接近边界 | 按租户、项目、用户或区域拆库。 |
| Pagefind 不够 | 用户开始问自然语言问题 | 评估 AI Search 或 Vectorize。 |
