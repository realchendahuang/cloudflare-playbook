---
title: Durable Objects
description: Cloudflare Durable Objects 的定位、适用场景和常见误区。
---

最后核对日期：2026-06-18。

Durable Objects 是 Cloudflare 的单实体强一致状态单元。它适合处理“同一个房间、用户、资源、租户或限流键必须按顺序决策”的问题。

先记住一句：**一个需要串行决策的实体一个对象；不要把 Durable Objects 当全站数据库。**

## 先判断

| 场景 | 建议 |
| --- | --- |
| 聊天房间、协作文档、多人房间 | 适合，一个房间一个对象。 |
| 座位、库存、预约、锁 | 适合，同一资源的写入需要串行判断。 |
| IP / 用户 / 访问凭证限流器 | 适合，每个键一个对象。 |
| WebSocket presence 和通知 | 适合，但要优先用 WebSocket Hibernation。 |
| 单用户 / 单租户小状态 | 可以，边界清楚时很好用。 |
| 全站评论、订单、文章列表 | 不优先，关系查询交给 D1。 |
| 大文件、图片、附件 | 不适合，文件进 R2。 |
| 全局搜索、分析、日志 | 不适合，交给专门产品。 |

## 成本和硬边界

Durable Objects 的成本不能只看请求数。实时连接、调用、定时任务、SQLite 读写、对象运行时长和存储都会影响免费层。Free 的每日限制是硬边界，超过后后续操作可能失败，不是预算提醒。

| 边界 | 判断 |
| --- | --- |
| Requests | 请求、调用、WebSocket 消息、定时任务都要看。 |
| Duration | 空闲连接要能休眠，长期常驻对象会放大成本。 |
| SQLite rows read | 查询形状和索引决定成本，不要在对象里做全站报表。 |
| SQLite rows written | 写入、删除、alarm 和状态更新都要纳入设计。 |
| Storage | 只放对象自己的状态，大 payload、文件和历史归档放 R2。 |
| 单对象边界 | 按房间、用户、租户、资源拆，不要全站一个对象。 |

完整数字见 [免费额度大全](/platform/free-paid/)。

## 最重要的坑

| 坑 | 做法 |
| --- | --- |
| 全站一个 Durable Object。 | 按房间、用户、租户、资源、限流键拆。 |
| WebSocket 不用 hibernation。 | 实时房间默认使用 WebSocket Hibernation。 |
| 把 DO 当关系数据库。 | 列表、筛选、报表放 D1 / Analytics Engine。 |
| 关键状态只放内存。 | 关键状态写 SQLite，内存只做热缓存。 |
| 初始化逻辑做重活。 | 初始化只做轻量恢复和必要准备。 |
| 迁移当普通配置改。 | 删除、重命名 class 前先审数据影响。 |
| 假设定时任务只执行一次。 | 处理逻辑必须幂等。 |

## 和其他产品怎么选

| 需求 | 优先产品 |
| --- | --- |
| 单实体强一致、房间、锁、限流器 | Durable Objects |
| 评论、订单、用户表、权限表 | D1 |
| 读多写少配置和缓存 | KV |
| 文件、图片、附件、导出物 | R2 |
| 异步任务、削峰、重试 | Queues |
| 长流程、等待、步骤状态 | Workflows |
| 音视频实时通信 | RealtimeKit / Realtime SFU / TURN |

官方核对入口：[Durable Objects](https://developers.cloudflare.com/durable-objects/)、[Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)、[Durable Objects Limits](https://developers.cloudflare.com/durable-objects/platform/limits/)。
