---
title: Queues
description: Cloudflare Queues 的定位、免费额度、付费边界、适用场景和常见误区。
---

最后核对日期：2026-06-18。

Queues 是 Cloudflare 的托管消息队列。它适合把慢任务从用户请求里移出去：前台先返回，后台再处理邮件、通知、Webhook、文件后处理、外部 API 调用、爬取和批量写入。

先记住一句：**Queues 解决异步和削峰，不保证 exactly-once，也不是长流程引擎。**

## 先判断

| 场景 | 建议 |
| --- | --- |
| 用户提交后发邮件、通知、Webhook | 适合。 |
| R2 上传后生成缩略图、解析文件 | 适合，消息里放 object key。 |
| 调用有 rate limit 的外部 API | 适合，用并发限制保护下游。 |
| 爬虫、截图、Browser Run 任务 | 适合，慢任务不要堵用户请求。 |
| 批量写日志、事件、索引 | 可以，先入队再批量写。 |
| 用户必须立刻拿到结果 | 不适合，保留同步请求或做任务状态查询。 |
| 多步骤、长时间、需要状态机 | 看 Workflows。 |
| 强一致房间、计数器、锁 | 看 Durable Objects。 |

## 免费与付费边界

| 能力 | Free | Workers Paid | 判断 |
| --- | --- | --- | --- |
| Standard operations | 10,000/day | 1M/month included | 免费不是 10,000 条任务，而是 10,000 次操作。 |
| Message retention | 24 hours | 默认 4 days，可配到 14 days | Free 阶段必须保证当天消费完。 |
| 消息大小 | 128 KB | 128 KB | 大文件放 R2，消息只放 key 和 metadata。 |
| 计费粒度 | 每 64 KB 计一次操作 | 同 Free | 小消息成功处理通常约 3 次操作。 |

免费阶段可以粗算：小于 64 KB 的消息，成功处理一次通常是 write、read、delete 三次操作。`10,000 operations/day` 大约对应 `3,333` 条成功小任务/day。重试、死信、大消息和空 pull 都会吃额度。

## 最重要的坑

| 坑 | 做法 |
| --- | --- |
| 把 10,000 operations/day 当 10,000 条任务。 | 按 `消息数 * 3` 起算。 |
| Free backlog 超过 24 小时。 | 监控 backlog 和 oldest message。 |
| 以为消息只会执行一次。 | 每条任务带 `jobId`，写入时做幂等。 |
| 没有 Dead Letter Queue。 | 生产任务默认配 DLQ 和告警。 |
| 消息里塞大 payload。 | 文件、正文、大对象放 R2 或 D1。 |
| Pull Consumer 高频空轮询。 | 普通 Worker 任务优先 push consumer。 |

## 设计原则

| 原则 | 判断 |
| --- | --- |
| Producer 要薄 | 校验请求、生成任务 ID、写入队列，然后返回。 |
| Consumer 要幂等 | 重复执行是正常情况。 |
| 消息要小 | 队列传任务引用，不传文件和大正文。 |
| 下游要限速 | 外部 API、邮件、数据库写入都要按承载能力控制并发。 |
| 失败要能看见 | 重试次数、DLQ、告警和人工处理路径要提前定。 |
| 长流程不要硬塞 | 多步骤审批、等待、人机交互优先看 Workflows。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 所有后台任务都上 Queues。 | 简单同步任务直接放 Worker；长流程看 Workflows。 |
| 用 Queues 保证严格顺序。 | 顺序和强一致交给 Durable Objects 或数据库状态。 |
| 消息里放完整文件内容。 | 文件进 R2，队列里只放 key。 |
| 失败就无限重试。 | 区分临时错误和永久错误，永久错误进 DLQ。 |
| 免费队列当长期积压池。 | Free 保留期只有 24 小时。 |

## 事实来源

- [Queues Pricing](https://developers.cloudflare.com/queues/platform/pricing/)
- [Queues Limits](https://developers.cloudflare.com/queues/platform/limits/)
- [How Queues works](https://developers.cloudflare.com/queues/reference/how-queues-works/)
- [Delivery guarantees](https://developers.cloudflare.com/queues/reference/delivery-guarantees/)
- [Batching, Retries and Delays](https://developers.cloudflare.com/queues/configuration/batching-retries/)
- [Dead Letter Queues](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/)
- [Queues on Workers Free plan](https://developers.cloudflare.com/changelog/post/2026-02-04-queues-free-plan/)
