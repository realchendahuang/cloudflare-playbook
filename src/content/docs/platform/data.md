---
title: 数据产品
description: D1、KV、R2、Durable Objects 和 Queues 的选择方式。
---

Cloudflare 的数据产品不要只按“数据库”理解，应该按访问模式选择。

## 选择表

| 产品 | 更适合 | 不适合 |
| --- | --- | --- |
| [D1](/platform/d1/) | SQL、关系型数据、小型应用数据 | 超大数据库、复杂 OLAP |
| [KV](/platform/kv/) | 高读低写、配置、缓存、公开索引 | 强一致写入、频繁更新 |
| [R2](/platform/r2/) | 文件、图片、导出物、备份 | 小粒度高频结构化查询 |
| [Durable Objects](/platform/durable-objects/) | 单对象强一致状态、房间、限流器、WebSocket | 全局大表扫描、关系查询、报表 |
| [Queues](/platform/queues/) | 异步任务、削峰、后台处理 | 需要立即同步返回的流程 |

## 判断顺序

1. 先问数据是不是文件：是就看 R2。
2. 再问是否需要 SQL：是就看 D1。
3. 再问是否需要单对象强一致：是就看 Durable Objects。
4. 再问是否是异步任务：是就看 Queues。
5. 最后才考虑 KV 做配置、缓存和低频更新数据。

## 写作提醒

涉及容量、价格、并发和一致性的结论必须回到 Cloudflare 官方文档核对，并写明最后核对日期。

## 已精读产品

- [D1](/platform/d1/)：Serverless SQL、rows read/write 计费、索引、迁移、Time Travel 和 Read Replication。
- [KV](/platform/kv/)：读多写少、最终一致、cacheTtl、同 key 写入限制、批量操作和开源参考。
- [R2](/platform/r2/)：对象存储、免费额度、Class A/B 操作、一致性、公开访问、签名 URL 和开源参考。
- [Durable Objects](/platform/durable-objects/)：单实体强一致状态、免费/付费边界、SQLite storage、WebSocket Hibernation、Alarms、迁移和开源参考。
- [Queues](/platform/queues/)：异步任务、操作计费、at least once、批处理、重试、死信队列、Pull Consumer 和开源参考。
