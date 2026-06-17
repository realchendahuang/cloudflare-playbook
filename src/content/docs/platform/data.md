---
title: 数据产品
description: D1、KV、R2、Durable Objects、Queues、Hyperdrive、Vectorize、Pipelines 和 Analytics Engine 的选择方式。
---

最后核对日期：2026-06-18。

Cloudflare 的数据产品不要按“哪个数据库最强”来选。普通项目先按数据形态选：关系数据进 D1，文件进 R2，读多写少配置进 KV，单对象强一致进 Durable Objects，慢任务进 Queues。

## 一句话判断

| 你手里的数据 | 先看什么 | 不要先看什么 |
| --- | --- | --- |
| 评论、表单、用户资料、小后台、订单 | [D1](/platform/d1/) | R2、KV、Durable Objects。 |
| 图片、附件、导出文件、备份 | [R2](/platform/r2/) | D1 存文件本体。 |
| 配置、功能开关、公开索引、低频缓存 | [KV](/platform/kv/) | 强一致数据库。 |
| 房间、会话、限流器、WebSocket 状态 | [Durable Objects](/platform/durable-objects/) | 全站大表或分析库。 |
| 邮件、通知、导入、审核、后处理 | [Queues](/platform/queues/) | 用户请求里同步跑慢任务。 |
| 已有 Postgres / MySQL | [Hyperdrive](/platform/extended-compute-data/) | 新项目先建外部数据库。 |
| 文档语义搜索、RAG | [AI Search](/platform/ai/) / Vectorize | 文档很少时直接上向量库。 |
| 产品指标、用量统计 | [Analytics Engine](/platform/observability/) | D1 记录海量事件。 |

完整免费额度见 [免费额度大全](/platform/free-paid/)。这页只讲选择顺序。

## 判断顺序

| 问题 | 选择 |
| --- | --- |
| 这是文件本体吗？ | R2；归属、权限和索引再放 D1。 |
| 需要 SQL、筛选、排序、关联和迁移吗？ | D1。 |
| 读远多于写，且可以接受短时间旧值吗？ | KV。 |
| 同一个实体必须全局顺序写入吗？ | Durable Objects。 |
| 这件事可以晚点做、失败重试或批量处理吗？ | Queues。 |
| 已经有外部数据库，不想迁移主库吗？ | Hyperdrive。 |
| 是自然语言搜索吗？ | 先 Pagefind；需要语义理解再看 AI Search / Vectorize。 |
| 是持续涌入的事件和指标吗？ | Analytics Engine、Pipelines 或 R2，不要塞进 D1。 |

## 常见组合

| 场景 | 推荐组合 | 原因 |
| --- | --- | --- |
| 评论 / 表单 / 轻后台 | Workers + D1 + Turnstile + Queues | D1 存业务状态，Queues 做通知和审核。 |
| 文件上传 / 下载 | R2 + Worker 签名 URL + D1 metadata | R2 存对象，D1 存权限和展示索引。 |
| 文档站搜索 | Pagefind -> AI Search / Vectorize | 先用静态搜索，需求成立后再加 AI。 |
| 实时房间 / 协作 | Durable Objects + WebSocket Hibernation + D1 / R2 | DO 管实时状态，长期数据单独落库。 |
| 批量导入 / 后台任务 | Queues + D1 幂等表 + R2 原始输入 | 任务可重试，输入和结果可追溯。 |
| 现有数据库加速 | Workers + Hyperdrive + 原数据库 | 先减少连接开销，再评估是否迁移。 |

## 什么时候迁移

| 当前做法 | 出现信号 | 下一步 |
| --- | --- | --- |
| D1 里塞大 JSON、图片或附件 | 数据库变慢，备份和查询都难受 | 文件本体迁到 R2，D1 只留 metadata。 |
| KV 存会话、库存、计数器 | 需要强撤销、强一致或高频写同一个 key | 写路径迁到 D1 或 Durable Objects。 |
| 请求里同步处理慢任务 | 邮件、AI、导入、审核拖慢响应 | 放入 Queues，用户请求只返回状态。 |
| R2 里只有文件，没有索引 | 需要按用户、标签、状态、时间分页 | D1 建 metadata 表。 |
| 单个 D1 库持续变大 | 接近单库或吞吐边界 | 按租户、项目、用户或区域拆库。 |
| Pagefind 不够 | 用户开始问自然语言问题 | 评估 AI Search 或 Vectorize。 |

## 成本心智

| 产品 | 先看什么 |
| --- | --- |
| D1 | rows read、rows written、storage；索引比换产品更重要。 |
| KV | reads、writes、lists、同 key 写入频率；写多别用 KV。 |
| R2 | storage、Class A、Class B；egress 免费不等于完全免费。 |
| Durable Objects | requests、duration、storage；WebSocket 要用 hibernation。 |
| Queues | operations、消息大小、重试、DLQ 和保留期。 |
| AI Search / Vectorize | 查询量、向量维度、索引规模、AI Gateway 和 Workers AI 叠加成本。 |

## 不要这么用

| 误用 | 更好的做法 |
| --- | --- |
| KV 当数据库 | KV 只做读多写少缓存和配置。 |
| D1 存文件本体 | R2 存文件，D1 存 key、权限和索引。 |
| R2 当查询数据库 | D1 / Analytics Engine / R2 SQL 负责查询，R2 保留对象。 |
| Durable Objects 当全站大表 | DO 管单实体状态，跨实体查询落到 D1 或分析系统。 |
| Queues 当同步 RPC | Queues 做异步和重试；同步流程留在 Worker。 |
| 一开始就上向量库 | 先整理标题、标签、来源、更新时间和站内搜索。 |

## 事实来源

| 来源 | 用途 |
| --- | --- |
| [Choose a data or storage product](https://developers.cloudflare.com/workers/platform/storage-options/) | Cloudflare 官方数据产品选择入口。 |
| [D1](https://developers.cloudflare.com/d1/) | 关系数据、SQL、pricing 和 limits。 |
| [KV](https://developers.cloudflare.com/kv/) | 读多写少 key-value、最终一致和 limits。 |
| [R2](https://developers.cloudflare.com/r2/) | 对象存储、pricing、limits 和 S3 API。 |
| [Durable Objects](https://developers.cloudflare.com/durable-objects/) | 单对象强一致状态和 WebSocket。 |
| [Queues](https://developers.cloudflare.com/queues/) | 异步任务、重试和 operations。 |
