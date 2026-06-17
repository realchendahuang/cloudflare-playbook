---
title: KV
description: Cloudflare Workers KV 的定位、免费额度、付费边界、一致性风险和普通项目取舍。
---

最后核对日期：2026-06-18。

KV 是 Cloudflare 的全球 key-value 存储。它把数据写入少量中心数据中心，再在被读取后缓存到 Cloudflare 全球网络里，所以最适合读多写少、可以接受短时间旧值的数据：公开配置、功能开关、API 缓存、公开索引、allow-list / deny-list、低频更新的用户偏好。

先记住一句：**KV 是全球读缓存，不是数据库。** 如果你需要关系查询、强一致事务、写后立刻全球可见、频繁写同一个 key，优先看 D1 或 Durable Objects。

## 该不该用

| 场景 | 判断 |
| --- | --- |
| 公开配置、功能开关 | 优先用 KV，读多写少。 |
| API 响应缓存 | 可以用，前提是允许短时间旧数据。 |
| 公开目录、静态索引、manifest | 很适合，构建期或后台任务写入，前台高频读取。 |
| 用户偏好 | 可以用，但需要立刻撤销或强一致时要谨慎。 |
| 登录会话 | 不优先，强撤销和权限校验更适合 D1 或 Durable Objects。 |
| 评论、订单、文章关系数据 | 不适合，筛选、排序、事务交给 D1。 |
| 计数器、库存、排行榜 | 不适合，同一个 key 最高 1 write/second。 |
| 文件、图片、大对象 | 不适合，单 value 最大 25 MiB，文件放 R2。 |

## 免费与付费边界

KV 包含在 Workers Free 和 Workers Paid 里。Free 每天重置，时间是 00:00 UTC；超过某一类免费操作额度后，该类操作会失败。Dashboard 和 Wrangler 里的读、写、删、列操作也计费用量。

| 能力 | Workers Free | Workers Paid | 实践判断 |
| --- | --- | --- | --- |
| Keys read | 100,000/day | 10M/month included，超出 $0.50/million | 页面不要散读太多 key，missing key 也算 read。 |
| Keys written | 1,000/day | 1M/month included，超出 $5.00/million | 写比读贵，适合低频后台写入。 |
| Keys deleted | 1,000/day | 1M/month included，超出 $5.00/million | 批量清理也按 key 数算。 |
| List requests | 1,000/day | 1M/month included，超出 $5.00/million | 用户请求路径不要 `list()` namespace。 |
| Stored data | 1 GB | 1 GB included，超出 $0.50/GB-month | 大对象和附件去 R2。 |
| 同一个 key 写入 | 1 write/second | 1 write/second | 这是 KV 最重要的架构边界，付费也不会放宽。 |
| Operations/Worker invocation | 1,000 | 1,000 | bulk read 算 1 次外部操作，但计费仍按 key 数。 |
| Namespaces/account | 1,000 | 1,000 | 可以按环境和产品拆 namespace。 |
| Storage/account / namespace | 1 GB / 1 GB | Unlimited / Unlimited | 付费解除存储上限，但仍按超出存储计费。 |
| Key / metadata / value size | 512 bytes / 1,024 bytes / 25 MiB | 相同 | key 要短；小展示字段可放 metadata；大文件放 R2。 |
| Minimum `cacheTtl` | 30 seconds | 30 seconds | 默认 60 秒，读多写少数据可以调大。 |

## 最重要的坑

| 坑 | 为什么危险 | 怎么避开 |
| --- | --- | --- |
| 把 KV 当强一致数据库 | 其他地区可能 60 秒或更久才看到新值。 | 写后立刻读、撤销权限、库存、订单确认用 D1 或 Durable Objects。 |
| 同一个 key 高频写入 | 最高 1 write/second，超出会 429。 | 拆 key，或用 Durable Object 串行写入后再写 KV 快照。 |
| 每个请求都读很多散 key | Free 读额度只有 100,000/day，bulk read 也按 key 数计费。 | 合并冷 key，预生成 manifest，减少请求路径读数。 |
| 用户请求路径里跑 `list()` | `list()` 单独计费，且不适合分页扫 namespace。 | 构建期生成索引，或用 D1 做查询和分页。 |
| 读取不存在的 key 后马上创建 | negative lookup 也会被缓存。 | 经常新增的 key 不要依赖“创建后全球立刻可见”。 |
| 把附件塞进 KV | 单 value 最大 25 MiB，存储和读成本都不合适。 | R2 存文件，KV 或 D1 存索引。 |
| 本地和生产共用 namespace | 误写后 KV 的最终一致会让排查更麻烦。 | local、staging、production 分 namespace。 |

## 设计原则

| 原则 | 做法 |
| --- | --- |
| 只放读多写少数据 | 配置、manifest、公开索引、缓存最合适。 |
| 明确旧值容忍度 | 能接受 60 秒或 `cacheTtl` 级别旧值，才进 KV。 |
| 控制 key 数量 | 一个页面尽量少读 key；能合并的配置合并成 JSON。 |
| 避免请求路径 `list()` | `list()` 放后台、管理页、构建任务或迁移脚本。 |
| 用过期时间管理临时缓存 | 临时缓存用 `expirationTtl`，不要额外写清理任务。 |
| 强一致写入放到别处 | Durable Objects 负责串行写，KV 只做全球读快照。 |

## 和其他产品怎么选

| 目标 | 更适合的产品 |
| --- | --- |
| 读多写少的配置、缓存、公开索引 | KV |
| 关系查询、排序、筛选、事务 | D1 |
| 文件、图片、附件、大对象 | R2 |
| 单实体强一致、写冲突、连接状态 | Durable Objects |
| 异步更新缓存、削峰、重试 | Queues |
| CDN 层 HTTP 缓存 | Cache Rules / CDN Cache / Workers Cache API |

一个常见组合是：D1 存关系数据，R2 存文件，KV 存公开配置和缓存，Durable Objects 收敛强一致写入，Queues 异步刷新 KV。

## 常见误区

| 误区 | 更好的理解 |
| --- | --- |
| KV 是最便宜的数据库。 | KV 是读缓存，强查询和强一致不是它的工作。 |
| bulk read 可以省 KV 费用。 | 它省 Worker 外部操作数，不省按 key 计的 KV 读费用。 |
| 付费后同 key 写入会变快。 | 不会，Free 和 Paid 都是 1 write/second。 |
| 调大 `cacheTtl` 总是更好。 | 只适合低频更新数据；调大后旧值会停留更久。 |
| 删除 key 后全球立刻不可读。 | 删除也要传播，其他地区可能短时间读到旧缓存。 |
| key 自动过期就是实时事件。 | 过期后像不存在，但不是实时通知机制。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs KV source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/kv) | 官方 KV 文档源文件，适合追踪 pricing、limits、API 和 Wrangler 命令变化。 |
| [cloudflare/templates/to-do-list-kv-template](https://github.com/cloudflare/templates/tree/main/to-do-list-kv-template) | 官方 Remix + Workers Static Assets + KV 模板。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | 官方 Workers 模板集合，适合比较 KV、D1、R2、Durable Objects 的项目组织。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Miniflare 和本地 KV 测试能力。 |
| [cloudflare/workerskv.gui](https://github.com/cloudflare/workerskv.gui) | KV namespace 数据浏览器示例。 |
| [cloudflare/kv-worker-migrate](https://github.com/cloudflare/kv-worker-migrate) | 历史 KV 迁移工具，适合理解迁移时的 list/read/write 成本。 |

## 事实来源

- [Workers KV](https://developers.cloudflare.com/kv/)
- [How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [KV Pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- [KV Limits](https://developers.cloudflare.com/kv/platform/limits/)
- [Read key-value pairs](https://developers.cloudflare.com/kv/api/read-key-value-pairs/)
- [Write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs/)
- [List keys](https://developers.cloudflare.com/kv/api/list-keys/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
