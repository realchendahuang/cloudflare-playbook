---
title: Queues
description: Cloudflare Queues 的定位、免费额度、付费边界、适用场景和常见误区。
---

最后核对日期：2026-06-18。

Queues 是 Cloudflare 的托管消息队列。它适合把慢任务从用户请求里移出去：前台先返回，后台再处理邮件、通知、Webhook、文件后处理、外部 API 调用、爬取和批量写入。

先记住一句：**Queues 解决的是异步和削峰，不是 exactly-once，也不是长流程引擎。**

## 该不该用

| 场景 | 判断 |
| --- | --- |
| 用户提交后发邮件、通知、Webhook | 适合。前台只确认已接收，后台慢慢发。 |
| R2 上传后生成缩略图、解析文件、跑 OCR | 适合。队列里放 object key，不放文件本体。 |
| 调用有 rate limit 的外部 API | 适合。用批处理和并发限制保护下游。 |
| 爬虫、截图、Browser Run 任务 | 适合。慢任务不要堵在用户请求里。 |
| 批量写日志、事件、索引 | 可以。先入队，再批量写 D1、R2 或外部系统。 |
| 用户必须立刻拿到结果 | 不适合。保留同步请求，或做“提交任务 + 查询状态”。 |
| 多步骤、长时间、需要状态机的流程 | 不优先。看 Workflows。 |
| 单个房间、会话、计数器强一致状态 | 不适合。看 Durable Objects。 |

## 免费与付费边界

| 能力 | Workers Free | Workers Paid | 判断 |
| --- | --- | --- | --- |
| Standard operations | 10,000 operations/day | 1,000,000 operations/month included，超出 $0.40/million | 免费不是 10,000 条任务，而是 10,000 次操作。 |
| Message retention | 24 hours，不能配置 | 默认 4 days，可配置到 14 days | Free 阶段必须保证当天消费完。 |
| 消息大小 | 128 KB | 128 KB | 大文件放 R2，消息只放 key 和 metadata。 |
| 计费粒度 | 每 64 KB 计一次 write/read/delete operation | 同 Free | 小消息成功处理通常约 3 次操作。 |
| Egress / bandwidth | 不额外收费 | 不额外收费 | 成本核心是 operations。 |

免费阶段可以用这条粗算：**小于 64 KB 的消息，成功处理一次通常是 write、read、delete 三次操作。10,000 operations/day 大约对应 3,333 条成功小任务/day。**

实际可用量会被重试、死信队列、大消息、过期删除和空 pull 消耗掉。

## 最重要的坑

| 坑 | 影响 | 做法 |
| --- | --- | --- |
| 把 10,000 operations/day 当成 10,000 条任务 | 很快超免费额度。 | 按 `消息数 * 3` 起算。 |
| Free backlog 超过 24 小时 | 消息可能过期删除。 | 监控 backlog 和 oldest message。 |
| 以为消息只会执行一次 | 重复投递会导致重复写库、重复发邮件。 | 每条任务带 `jobId`，写入时做幂等。 |
| 没有 Dead Letter Queue | 超过重试次数后消息可能直接消失。 | 生产任务默认配 DLQ 和告警。 |
| 消息里塞大 payload | 触发 64 KB 分片计费和 128 KB 上限。 | 文件、正文、大对象放 R2 或 D1。 |
| Pull Consumer 高频空轮询 | 空队列 pull 也可能产生 read operation。 | 普通 Worker 任务优先 push consumer。 |

## 设计原则

| 原则 | 判断 |
| --- | --- |
| Producer 要薄 | 校验请求、生成任务 ID、写入队列，然后返回。 |
| Consumer 要幂等 | 重复执行是正常情况，不是异常情况。 |
| 消息要小 | 队列传任务引用，不传文件和大正文。 |
| 下游要限速 | 外部 API、邮件、数据库写入都要按承载能力控制并发。 |
| 失败要能看见 | 重试次数、DLQ、告警和人工处理路径要提前定。 |
| 长流程不要硬塞 | 多步骤审批、等待、人机交互和长事务优先看 Workflows。 |

## 和其他产品怎么选

| 需求 | 优先产品 |
| --- | --- |
| 异步任务、削峰、重试 | Queues |
| 长流程、步骤状态、睡眠等待 | Workflows |
| 单实体强一致、房间、限流器、WebSocket | Durable Objects |
| 定时触发 | Cron Triggers |
| 文件事件后处理 | R2 Event Notifications + Queues |
| 外部数据库连接池 | Hyperdrive，不是 Queues |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 所有后台任务都上 Queues | 简单同步任务直接放 Worker；长流程看 Workflows。 |
| 用 Queues 保证严格顺序 | 顺序和强一致交给 Durable Objects 或数据库状态。 |
| 消息里放完整文件内容 | 文件进 R2，队列里只放 key。 |
| 失败就无限重试 | 区分临时错误和永久错误，永久错误进 DLQ。 |
| 免费队列当长期积压池 | Free 保留期只有 24 小时。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/templates](https://github.com/cloudflare/templates) | 官方 Workers 模板集合。 |
| [cloudflare/templates/queues-starter-template](https://github.com/cloudflare/templates/tree/main/queues-starter-template) | Queues 入门项目结构。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Miniflare 和 Queues 本地开发相关实现。 |
| [cloudflare/cloudflare-docs Queues source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/queues) | 官方 Queues 文档源文件。 |

## 事实来源

- [Queues Pricing](https://developers.cloudflare.com/queues/platform/pricing/)
- [Queues Limits](https://developers.cloudflare.com/queues/platform/limits/)
- [How Queues works](https://developers.cloudflare.com/queues/reference/how-queues-works/)
- [Delivery guarantees](https://developers.cloudflare.com/queues/reference/delivery-guarantees/)
- [Batching, Retries and Delays](https://developers.cloudflare.com/queues/configuration/batching-retries/)
- [Dead Letter Queues](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/)
- [Pull Consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/)
- [Queues on Workers Free plan](https://developers.cloudflare.com/changelog/post/2026-02-04-queues-free-plan/)
