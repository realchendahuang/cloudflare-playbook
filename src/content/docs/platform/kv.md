---
title: KV
description: Cloudflare Workers KV 的定位、免费额度、付费边界、一致性风险和普通项目取舍。
---

最后核对日期：2026-06-18。

KV 是 Cloudflare 的全球 key-value 存储，适合读多写少、可以接受短时间旧值的数据：公开配置、功能开关、API 缓存、公开索引、allow-list / deny-list、低频用户偏好。

先记住一句：**KV 是全球读缓存，不是数据库。** 需要关系查询、事务、写后立刻全球可见或频繁写同一个 key，优先看 D1 或 Durable Objects。

## 先判断

| 场景 | 建议 |
| --- | --- |
| 公开配置、功能开关 | 优先用 KV。 |
| API 响应缓存 | 可以用，前提是允许短时间旧数据。 |
| 公开目录、静态索引、manifest | 很适合，构建期或后台任务写入。 |
| 用户偏好 | 可以用；强撤销和权限校验要谨慎。 |
| 登录会话 | 不优先。 |
| 评论、订单、文章关系数据 | 不适合，交给 D1。 |
| 计数器、库存、排行榜 | 不适合，交给 Durable Objects 或 D1。 |
| 文件、图片、大对象 | 不适合，交给 R2。 |

## 免费与付费边界

| 能力 | Workers Free | Workers Paid | 实践判断 |
| --- | --- | --- | --- |
| Reads | 100,000/day | 10M/month included | 页面不要散读太多 key。 |
| Writes | 1,000/day | 1M/month included | 写比读贵，适合低频后台写入。 |
| Deletes / Lists | 1,000/day | 1M/month included | 用户请求路径不要扫 namespace。 |
| Stored data | 1 GB | 1 GB included，超出按量 | 大对象和附件去 R2。 |
| 同一个 key 写入 | 1 write/second | 1 write/second | 付费也不会放宽，这是核心边界。 |
| Key / value size | key 512 bytes；value 25 MiB | 相同 | key 要短，大文件不要进 KV。 |

## 最重要的坑

| 坑 | 为什么危险 | 怎么避开 |
| --- | --- | --- |
| 把 KV 当强一致数据库。 | 其他地区可能短时间读到旧值。 | 权限撤销、库存、订单确认用 D1 或 Durable Objects。 |
| 同一个 key 高频写入。 | 超出 1 write/second 会失败。 | 拆 key，或用 Durable Object 收敛写入。 |
| 每个请求读很多散 key。 | Free 读额度很快被打满。 | 合并配置，预生成 manifest。 |
| 用户请求里 `list()`。 | list 单独计费，也不适合业务分页。 | 查询和分页交给 D1。 |
| 把附件塞进 KV。 | 体积、成本和读取方式都不合适。 | R2 存文件，D1 / KV 存索引。 |
| 本地、预览、生产共用 namespace。 | 误写后排查困难。 | 按环境拆 namespace。 |

## 和其他产品怎么选

| 目标 | 更适合 |
| --- | --- |
| 读多写少配置、缓存、公开索引 | KV |
| 关系查询、排序、筛选、事务 | D1 |
| 文件、图片、附件、大对象 | R2 |
| 单实体强一致、写冲突、连接状态 | Durable Objects |
| 异步更新缓存、削峰、重试 | Queues |
| HTTP 层缓存 | Cache Rules / CDN Cache |

常见组合：D1 存关系数据，R2 存文件，KV 存公开配置和缓存，Durable Objects 收敛强一致写入，Queues 异步刷新 KV。

## 常见误区

| 误区 | 更好的理解 |
| --- | --- |
| KV 是最便宜的数据库。 | KV 是读缓存，不负责复杂查询和强一致。 |
| bulk read 可以省 KV 费用。 | 它省 Worker 外部操作数，不省按 key 计的读费用。 |
| 付费后同 key 写入会变快。 | 不会，Free 和 Paid 都是 1 write/second。 |
| 删除 key 后全球立刻不可读。 | 删除也要传播，其他地区可能短时间读到旧缓存。 |

## 事实来源

- [Workers KV](https://developers.cloudflare.com/kv/)
- [How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [KV Pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- [KV Limits](https://developers.cloudflare.com/kv/platform/limits/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
