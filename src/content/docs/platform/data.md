---
title: 数据能力
---

## 按数据类型选

| 数据类型 | 推荐能力 |
| --- | --- |
| 评论、表单、用户资料、小后台、订单 | [D1](/platform/d1/) |
| 图片、附件、导出文件、备份 | [R2](/platform/r2/) |
| 配置、功能开关、公开索引、低频缓存 | [KV](/platform/kv/) |
| 房间、会话、限流器、WebSocket 状态 | [Durable Objects](/platform/durable-objects/) |
| 邮件、通知、导入、审核、后处理 | [Queues](/platform/queues/) |
| 已有 Postgres / MySQL | [Hyperdrive](/platform/extended-compute-data/) |
| 文档语义搜索 | [AI Search](/platform/ai/) / Vectorize |
| 产品指标、用量统计 | [观测与日志](/platform/observability/) |

## 判断顺序

先问这是不是文件本体。是的话放 R2，归属、权限和索引再放 D1。

需要 SQL、筛选、排序、关联和迁移时，选 D1。

读远多于写，并且可以接受短时间旧值时，选 KV。

同一个实体需要全局顺序写入时，选 Durable Objects。

这件事可以晚点做、失败重试或批量处理时，选 Queues。

已经有外部数据库，不想迁移主库时，用 Hyperdrive。

自然语言搜索先从 Pagefind 开始；确实需要语义理解，再看 AI Search / Vectorize。

持续涌入的事件和指标，不要硬塞进业务库，按指标分析、数据管道或 R2 处理。

## 迁移条件

| 当前做法 | 触发信号 | 后续操作 |
| --- | --- | --- |
| D1 里塞大段内容、图片或附件 | 数据库变慢，备份和查询都难受 | 文件本体迁到 R2，D1 只留元数据。 |
| KV 存会话、库存、计数器 | 需要强撤销、强一致或高频写同一个 key | 写路径迁到 D1 或 Durable Objects。 |
| 请求里同步处理慢任务 | 邮件、AI、导入、审核拖慢响应 | 放入 Queues，用户请求只返回状态。 |
| R2 里只有文件，没有索引 | 需要按用户、标签、状态、时间分页 | D1 建元数据表。 |
| 单个 D1 库持续变大 | 容量或读写压力上升 | 按租户、项目、用户或区域拆库。 |
| Pagefind 不足 | 用户开始问自然语言问题 | 评估 AI Search 或 Vectorize。 |
