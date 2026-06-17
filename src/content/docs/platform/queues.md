---
title: Queues
description: Cloudflare Queues 的定位、免费额度、付费边界、交付语义、批处理、重试、死信队列、Pull Consumer 和开源参考。
---

最后核对日期：2026-06-18。

Queues 是 Cloudflare 的托管消息队列。它适合把用户请求里的慢任务、外部 API 调用、文件后处理、通知、爬取、批量写入等流程移出同步链路，让前台先返回，后台再由 Worker 消费消息。

Queues 的重点不是“更高级”，而是“把时间错开”。它提供的是至少一次投递、批处理、重试、延迟消息和死信队列，不提供严格顺序，也不承诺 exactly-once。只要任务会改变数据库、对象存储或第三方系统，就要按可能重复执行来设计。

## 一句话判断

| 场景 | 是否优先用 Queues | 判断 |
| --- | --- | --- |
| 用户提交后发送邮件、通知、Webhook | 是 | 前台只确认已接收，后台慢慢发。 |
| R2 上传后生成缩略图、解析 PDF、跑 OCR | 是 | R2 Event Notifications 可以把对象事件送进队列。 |
| 调用有 rate limit 的外部 API | 是 | 用 batch、`max_concurrency` 和 retry delay 控制速率。 |
| 爬虫、截图、Browser Run 任务 | 是 | 浏览器任务慢且容易抖动，适合异步化。 |
| 批量写日志、事件、索引 | 可以 | 小任务先进入队列，再批量写 D1、R2 或外部系统。 |
| 用户必须立刻拿到处理结果 | 否 | 仍然放在同步 Worker 请求里，或拆成“提交任务 + 查询状态”。 |
| 长时间多步骤业务流程 | 不优先 | 更适合 Workflows；Queues 更像任务缓冲层。 |
| 单个房间、会话、计数器强一致状态 | 否 | Durable Objects 更合适。 |
| 大文件或大 payload | 否 | 消息最大 128 KB；文件本体放 R2，队列里只放 key 和 metadata。 |

## 二次精读结论

Queues 最适合普通项目解决两件事：削峰和异步。它不是“便宜版长流程引擎”，也不是 exactly-once 任务系统。免费阶段要先把它当成一个 24 小时内必须被消费掉的短期缓冲层。

| 判断维度 | 结论 | 免费额度里的玩法 |
| --- | --- | --- |
| 定位 | 异步任务缓冲和批处理通道。 | 表单后处理、邮件、通知、R2 后处理、爬虫、外部 API 限速都适合。 |
| 费用 | 以 64 KB chunk 为单位统计 write/read/delete operations。 | 小于 64 KB 的成功消息通常约 3 次操作；Free 10,000 operations/day 大约可支撑 3,333 条成功小消息/day。 |
| 保留期 | Free 固定 24 小时。 | Free 阶段必须保证 consumer 当天能追上 backlog。 |
| 交付语义 | at least once，不保证严格顺序。 | 每条消息都要有 `jobId`，D1 唯一键或外部 idempotency key 才是幂等边界。 |
| 批处理 | batch 降低 Worker invocation 和外部写入次数。 | 批量越大，单条失败影响越大；关键任务逐条 `ack()` / `retry()`。 |
| 并发 | push consumer 默认自动扩展，最高 250 concurrent invocations。 | 不要为了“快”限制太低；下游扛不住时再设 `max_concurrency`。 |
| Pull Consumer | 给 Cloudflare 外部系统主动拉取。 | 普通 Worker 任务默认用 push；外部容器、服务器、GPU worker pool 才考虑 pull。 |

## 上线前问题

| 问题 | 为什么重要 | 推荐答案 |
| --- | --- | --- |
| Free 额度够不够 | 10,000 operations/day 不是 10,000 条完整任务。 | 先按 `消息数 * 3` 粗算，再加 retries、DLQ、过期删除和大消息倍数。 |
| backlog 能否 24 小时内消费完 | Free retention 不能配置，过期消息会删除。 | 用 `oldestMessageTimestamp` 和 backlog count 做告警。 |
| 消息是否幂等 | at least once 下重复处理是正常情况。 | Producer 生成 `jobId`，consumer 写 D1 状态或调用外部 idempotency key。 |
| 是否需要 DLQ | 没有 DLQ 时，超过 `max_retries` 的消息会被永久删除。 | 生产任务默认配置 DLQ，并给 DLQ 单独的处理或告警。 |
| batch 失败会影响什么 | 未显式 ack 的消息会一起重投。 | 写数据库、发邮件、扣额度、调外部 API 时逐条 try/catch。 |
| 投递失败是否会被吞掉 | `ctx.waitUntil(env.QUEUE.send(...))` 不阻塞响应，send 错误可能被忽略。 | 用户关键任务先 `await send()`；非关键日志再用 `waitUntil()`。 |
| Pull Consumer 是否真需要 | Pull 要 API token read+write，短轮询空队列也会产生 read operation。 | 只有外部系统必须主动拉取时使用。 |

## 运行模型

普通项目最常见的 Queues 架构是：入口 Worker 只校验请求并写入消息，真正的慢任务交给 consumer Worker。

```text
用户请求 / R2 事件 / Cron / Durable Object
  │
  ├─ Producer Worker
  │    └─ env.JOB_QUEUE.send(message)
  │
  ▼
Queues
  ├─ 保存消息
  ├─ 按 batch 投递
  ├─ 失败后重试
  └─ 超过重试次数后进入 DLQ
        │
        ▼
Consumer Worker
  ├─ 写 D1 状态
  ├─ 读写 R2 对象
  ├─ 调用外部 API
  └─ 记录可观测指标
```

一个 queue 通常只有一个活跃 consumer 类型：要么是 push-based Worker consumer，要么是 HTTP pull consumer。同一个 Worker 可以消费多个 queue，处理时通过 `batch.queue` 区分来源。

## 免费与付费边界

Queues 已经进入 Workers Free 计划。免费阶段可以做真实的小型异步任务，但要特别看两条边界：每天 10,000 operations，以及消息最多保留 24 小时。

| 能力 | Workers Free | Workers Paid / Standard | 实践判断 |
| --- | --- | --- | --- |
| Standard operations | 10,000 operations/day included。 | 1,000,000 operations/month included，超出 $0.40/million operations。 | 一条成功处理的小消息通常是 3 次操作：write、read、delete。 |
| Message retention | 24 hours，不能配置。 | 默认 4 days，可配置到 14 days。 | 免费队列不能当长时间积压池；消费端坏一天后消息可能过期。 |
| Egress / bandwidth | 无数据传输或吞吐带宽费用。 | 无数据传输或吞吐带宽费用。 | 成本核心是操作数，不是队列出站流量。 |
| 计费粒度 | 每 64 KB 计一次操作。 | 每 64 KB 计一次操作。 | 65 KB 和 127 KB 消息都会按 2 个 64 KB chunk 计。 |
| 重试 | 每次重试会产生 read operation。 | 每次重试会产生 read operation。 | 失败任务不是免费重跑；重试策略也要算钱。 |
| DLQ 写入 | 写入 DLQ 会产生 write operation。 | 写入 DLQ 会产生 write operation。 | DLQ 是可靠性工具，不是免费垃圾桶。 |
| Purge | 一次 purge 算 1 个 billable operation。 | 一次 purge 算 1 个 billable operation。 | 清空队列不可恢复，生产环境慎用。 |

官方给出的估算公式是：

```text
((Number of Messages * 3) - 1,000,000) / 1,000,000 * $0.40
```

这个公式只适合“小于 64 KB、成功写入、读取、删除一次”的普通消息。真实项目还要加上重试、DLQ、过期删除和消息大小放大。

## 计费证据怎么看

Queues 的免费额度最容易误读成“每天 10,000 条消息”。官方 pricing 口径其实是 operations：每 64 KB 的写入、读取、删除都分别计数。

| 行为 | 计费口径 | 成本判断 |
| --- | --- | --- |
| `send()` / `sendBatch()` 写入消息 | 每个消息每 64 KB 计一次 write operation。 | 100 条小消息不是 1 次 batch operation，而是 100 次 write。 |
| consumer 读取消息 | 每个消息每 64 KB 计一次 read operation。 | 成功处理前至少会读一次。 |
| `ack()` / 自动确认成功 | 每个消息每 64 KB 计一次 delete operation。 | 成功小消息通常是 write + read + delete 三次操作。 |
| retry | 每次重投会增加 read operation。 | 错误率高时，费用和延迟一起上升。 |
| 写入 DLQ | 每个消息每 64 KB 计一次 write operation。 | DLQ 是可靠性工具，也会计费。 |
| 消息过期 | 已写入但过期未读，通常是 write + delete。 | Free 阶段 backlog 超过 24 小时会丢消息。 |
| Pull empty queue | 空队列 pull 也会产生 read operation。 | Pull consumer 不能高频空轮询。 |
| Purge queue | 一次 purge 算 1 个 billable operation。 | 便宜但不可恢复，生产慎用。 |

免费阶段可以用这条保守估算：**每天 3,000 条以内的小型成功任务比较舒服；一旦有重试、DLQ、空 pull 或大消息，实际可处理任务数会明显下降。**

## 关键限制

| 限制 | 当前值 | 实践判断 |
| --- | --- | --- |
| Queues 数量 | 10,000/account。 | 可以按环境和业务拆 queue，但不要为每个用户创建 queue。 |
| Message size | 128 KB。 | 大对象放 R2，消息里只放 object key。 |
| 内部 metadata | 约 100 bytes 计入消息大小。 | payload 不要卡着 128 KB 写。 |
| Message retries | 100。 | 大多数项目不要把重试次数调得太高。 |
| 最大 consumer batch size | 100 messages。 | 批处理写外部系统时有用。 |
| `sendBatch` | 最多 100 messages，或总计 256 KB。 | 批量生产消息时也有大小上限。 |
| 最大 batch wait | 60 seconds。 | 延迟敏感任务不要只追求大 batch。 |
| 单 queue 吞吐 | 5,000 messages/second。 | 超过后 `send()` / `sendBatch()` 会抛 Too Many Requests。 |
| Per-queue backlog | 25 GB。 | 积压太多会让 producer 收到 Storage Limit Exceeded。 |
| 并发 consumer invocations | 250，仅 push-based consumer。 | 默认自动扩展；只在下游扛不住时限制。 |
| Consumer wall clock | 15 minutes。 | 单条任务不要无限跑，长流程看 Workflows。 |
| Consumer CPU time | 默认 30 seconds，可配置到 5 minutes。 | CPU 密集任务要明确配置 `limits.cpu_ms`。 |
| Pull `visibilityTimeout` | 12 hours。 | Pull consumer 必须在可见性超时前 ack 或 retry。 |
| `delaySeconds` | 24 hours。 | 适合退避和延迟任务，不适合长期调度。 |

Cloudflare 官方 limits 页说明这些限制基本同时适用于 Free 和 Paid，除了 Free 的 message retention 固定为 24 小时。

## 交付语义

Queues 默认是 at least once delivery。实践上要记住三件事：

| 语义 | 实践判断 |
| --- | --- |
| 消息可能被投递多次。 | consumer 必须幂等。 |
| 不保证严格顺序。 | 需要按用户、房间、订单串行处理时，用 Durable Objects 或 D1 状态兜住。 |
| consumer 抛错时，未确认消息会重试。 | 单条消息失败可能拖着整个 batch 一起重投。 |

## 消息生命周期

理解生命周期，才能知道钱花在哪里、消息在哪里丢、为什么会重复处理。

```text
Producer send()
  │  write operation
  ▼
Queue backlog
  │  read operation
  ▼
Consumer batch
  ├─ ack / handler 成功：delete operation
  ├─ retry / handler 失败：重新进入 backlog，下一次再 read
  ├─ 超过 max_retries：写入 DLQ 或永久删除
  └─ 超过 retention：过期删除
```

| 阶段 | 要检查什么 |
| --- | --- |
| Producer | `send()` 是否被 `await`，消息大小是否接近 128 KB，`contentType` 是否适合 consumer。 |
| Backlog | backlog count 是否持续上升，oldest message 是否越来越老。 |
| Consumer | batch size、timeout、错误率、`ack()` / `retry()` 是否逐条处理。 |
| Retry | 重试是否带退避，是否区分 429 / timeout 和永久性数据错误。 |
| DLQ | 是否有人消费、告警、归档或人工处理。 |

幂等设计不要只写在注释里，要落到数据结构上。常见做法是：

| 目标 | 做法 |
| --- | --- |
| 避免同一个任务重复写 D1 | D1 表加唯一 `job_id`，先插入任务状态，再处理。 |
| 避免重复调用外部 API | 使用外部服务支持的 idempotency key。 |
| 避免重复处理 R2 对象 | 消息里带 object key + version / etag，处理结果按版本写。 |
| 短期去重 | 可以用 KV TTL，但不要依赖 KV 做强一致去重。 |

## 配置习惯

最小可用配置通常包含 producer、consumer、batch、retry 和 dead letter queue。

```jsonc
{
	"queues": {
		"producers": [
			{
				// binding 是 Worker 代码里访问队列的变量名。
				"binding": "JOB_QUEUE",
				// queue 是 Cloudflare 账户里的真实队列名称。
				"queue": "jobs"
			}
		],
		"consumers": [
			{
				// consumer 订阅同一个队列后，Cloudflare 会把消息推给 queue() handler。
				"queue": "jobs",
				// batch size 越大，调用次数越少，但单批失败影响越大。
				"max_batch_size": 10,
				// batch timeout 用来平衡延迟和批量效率。
				"max_batch_timeout": 5,
				// 超过重试次数后，消息会进入 dead_letter_queue。
				"max_retries": 3,
				"dead_letter_queue": "jobs-dlq"
			}
		]
	},
	"limits": {
		// Queue consumer 默认 CPU 上限是 30 秒；CPU 密集任务再调高。
		"cpu_ms": 300000
	}
}
```

如果没有配置 DLQ，达到最大重试次数的消息会被删除。生产环境只要任务会影响用户数据、订单、通知或外部系统，就应该配置 DLQ，并给 DLQ 单独安排消费、告警或人工处理流程。

## Producer API 习惯

Producer Worker 的职责越薄越好：校验输入、生成幂等键、写入队列、返回任务 ID。

```ts
type JobMessage = {
	jobId: string;
	objectKey: string;
	action: 'extract_text' | 'thumbnail';
};

interface Env {
	JOB_QUEUE: Queue<JobMessage>;
}

export default {
	// fetch 校验入口请求，并把后台任务写入 Queues。
	async fetch(request, env) {
		if (request.method !== 'POST') {
			return new Response('Method not allowed', {
				status: 405,
				headers: { allow: 'POST' },
			});
		}

		const body = await request.json();

		// jobId 是后续 D1 去重、状态查询和外部 API 幂等的共同标识。
		const jobId = crypto.randomUUID();
		await env.JOB_QUEUE.send(
			{
				jobId,
				objectKey: String(body.objectKey),
				action: 'extract_text',
			},
			{
				// JSON 可在 Dashboard 和 Pull Consumer 中更容易预览。
				contentType: 'json',
			},
		);

		return Response.json({ jobId }, { status: 202 });
	},
} satisfies ExportedHandler<Env>;
```

`send()` 的 promise 在消息写入磁盘后 resolve。`sendBatch()` 最多发送 100 条消息，且总大小不能超过 256 KB。内容类型建议默认用 `json`；`v8` 只适合 push-based Worker consumer，不能被 Dashboard 和 pull consumer 正常解码。

Producer 的一个取舍：

| 写法 | 适合场景 | 风险 |
| --- | --- | --- |
| `await env.QUEUE.send(message)` | 用户关键任务、需要明确知道消息已落盘。 | 前台响应会等一次队列写入。 |
| `ctx.waitUntil(env.QUEUE.send(message))` | 非关键日志、统计、可丢弃事件。 | 官方说明 send 错误会被隐式忽略，不能用于关键任务确认。 |

## Consumer API 习惯

Consumer 里不要用 `forEach(async () => {})`。它不会等待每个异步任务完成，容易让 handler 提前返回。用 `for...of` 做顺序处理，或者用 `Promise.all()` 明确并发。

```ts
type JobMessage = {
	jobId: string;
	objectKey: string;
	action: 'extract_text' | 'thumbnail';
};

interface Env {
	DB: D1Database;
	BUCKET: R2Bucket;
}

export default {
	// queue 逐条处理消息，避免单条失败导致整批重复执行。
	async queue(batch, env) {
		for (const message of batch.messages) {
			try {
				const job = message.body;
				const existingJob = await env.DB.prepare('SELECT status FROM jobs WHERE id = ?')
					.bind(job.jobId)
					.first<{ status: string }>();

				// 已完成的 job 直接 ack，避免重复投递造成重复处理。
				if (existingJob?.status === 'done') {
					message.ack();
					continue;
				}

				// 首次看到 jobId 时写入状态，D1 唯一键是真正的幂等边界。
				if (existingJob === null) {
					await env.DB.prepare(
						'INSERT INTO jobs (id, object_key, status) VALUES (?, ?, ?)',
					)
						.bind(job.jobId, job.objectKey, 'processing')
						.run();
				}

				const object = await env.BUCKET.get(job.objectKey);
				if (object === null) {
					await env.DB.prepare('UPDATE jobs SET status = ? WHERE id = ?')
						.bind('missing_object', job.jobId)
						.run();
					message.ack();
					continue;
				}

				// 这里放真正的后台处理逻辑，例如解析、生成缩略图或调用外部 API。
				await env.DB.prepare('UPDATE jobs SET status = ? WHERE id = ?')
					.bind('done', job.jobId)
					.run();

				message.ack();
			} catch (error) {
				// 可恢复错误延迟重试，避免立刻打爆下游服务。
				if (isRetryableError(error)) {
					message.retry({ delaySeconds: 60 });
					continue;
				}

				// 不可恢复错误也显式 retry，让它按 max_retries 进入 DLQ。
				message.retry();
			}
		}
	},
} satisfies ExportedHandler<Env, JobMessage>;

// isRetryableError 判断错误是否适合延迟重试。
function isRetryableError(error: unknown): boolean {
	return error instanceof Error && /429|timeout|rate limit/i.test(error.message);
}
```

`ack()` / `retry()` 的第一次调用生效，后续再调用不会改变结果。`queue()` 正常返回且没有显式处理的消息，会在 batch 级别被确认；`queue()` 抛错时，未确认消息会重试。对会写数据库、发邮件、扣额度、调用外部 API 的任务，优先逐条 `ack()`，不要让第 8 条失败把前 7 条一起重投。

## 批处理、重试和延迟

| 能力 | 默认 | 可配置范围 | 实践判断 |
| --- | --- | --- | --- |
| `max_batch_size` | 10 messages。 | 1 到 100。 | 批量写外部系统时调大；单条任务很重时调小。 |
| `max_batch_timeout` | 5 seconds。 | 0 到 60 seconds。 | 延迟敏感任务用小 timeout；成本敏感任务可接受等待。 |
| `max_retries` | 3。 | 最高 100。 | 不是越大越好；重试越多，读操作和积压越多。 |
| `delaySeconds` | 默认无延迟。 | 0 到 86,400 seconds。 | 适合退避；长期定时用 Cron 或 Workflows。 |

单条消息失败时，默认会让整个 batch 重试，除非你已经显式 `ack()` 了其他消息。这个细节很重要：batch 是成本优化工具，不是事务边界。

## Dead Letter Queue

DLQ 是普通 queue，只是被用来接住“超过重试次数仍失败”的消息。

```text
jobs
  ├─ 正常消费成功：ack 后删除
  ├─ 可恢复失败：retry 后重新投递
  └─ 超过 max_retries：写入 jobs-dlq
        └─ DLQ consumer / Dashboard / 人工排查
```

DLQ 的实践建议：

| 建议 | 原因 |
| --- | --- |
| 生产任务配置 DLQ。 | 否则超过重试次数的消息会被永久删除。 |
| DLQ 也要有保留期和告警。 | DLQ 不是终点，只是失败隔离区。 |
| DLQ consumer 不要无脑重投原队列。 | 先判断失败原因，否则会形成失败循环。 |
| 给消息放 `jobId`、`source`、`attemptContext`。 | 排查时要知道消息来自哪里，处理到哪一步。 |

没有活跃 consumer 的 DLQ 消息会按队列保留期保存；Paid 默认 4 天，Free 固定 24 小时。

## Pull Consumer

Push-based Worker consumer 是默认选择。Pull consumer 适合你已经有外部系统、容器、服务器，想主动从 Cloudflare Queue 拉取消息。

| Pull Consumer 特点 | 实践判断 |
| --- | --- |
| 使用 Cloudflare API 拉取消息。 | API token 需要 Queues read 和 write，因为 ack/retry 会改变队列状态。 |
| 短轮询。 | 空队列会立即返回，不是 long polling。 |
| `batch_size` 默认 5，最大 100。 | 外部消费者自己控制吞吐。 |
| `visibility_timeout` 默认 30 秒，最大 12 小时。 | 超时前未 ack/retry，消息会重新可见。 |
| 多个 HTTP client 可以并发 pull。 | 适合已有 worker pool。 |
| 不能消费 `v8` content type。 | Pull consumer 用 `json`、`text` 或 `bytes`。 |

Pull consumer 不应该只是因为“看起来更自由”就使用。只要任务能在 Cloudflare Worker 内完成，push-based consumer 更省配置和鉴权面。

还有一个配置变化要注意：官方 Pull Consumer 页面已经说明，不再支持通过 Wrangler 配置文件启用 `type = "http_pull"`。HTTP pull 通过 Wrangler CLI 或 Dashboard 启用；如果之前配置里有 `type = "http_pull"`，需要移除并重新部署。

## 并发和背压

Queues push consumer 会根据 backlog 和错误率自动扩展并发，最高 250 个 concurrent consumer invocations。Cloudflare 官方建议一般不要设置 `max_concurrency`，除非下游系统确实有硬限制。

| 场景 | 做法 |
| --- | --- |
| 下游 API 每秒只允许 2 次请求。 | 降低 `max_concurrency`，并用 `retry({ delaySeconds })` 退避。 |
| D1 写入有热点或锁竞争。 | batch 内按实体拆分，必要时把强一致部分交给 Durable Objects。 |
| R2 后处理任务积压。 | 增加 batch、检查 consumer 错误率，必要时拆多个 queue。 |
| 免费计划积压超过 24 小时。 | 先修 consumer，再考虑 Workers Paid；不要让 Free 队列承担长 backlog。 |

并发提高不一定增加总费用，但会把 Workers 请求和 CPU 更快地消耗掉。外部系统扛不住时，盲目并发只会让失败和重试更贵。

## 暂停、清空和观测

| 能力 | 用途 | 注意 |
| --- | --- | --- |
| Pause delivery | 暂停给 consumer 投递消息。 | producer 仍然可以写入；消息仍会按 retention 过期。 |
| Resume delivery | 恢复投递。 | 先确认 consumer 已修好。 |
| Purge queue | 永久删除队列里的消息。 | 不可恢复；in-flight 消息可能仍在处理。 |
| Realtime metrics | 读取 backlog count、backlog bytes、oldest message timestamp。 | 适合在 producer 写入后判断积压。 |
| GraphQL Analytics | 查 message operations、retry count、lag time、consumer concurrency。 | 适合做报表和告警。 |

生产环境至少要看三类指标：backlog 是否持续增长、retry count 是否升高、oldest message timestamp 是否越来越老。只看成功日志会漏掉队列积压。

## 错误码与排障

Queues JavaScript API 会抛异常，错误码通常在 `message` 末尾；REST API 会返回 `errors[].code`。排障时先按错误类型分流，不要一律重试。

| 错误 | 含义 | 处理 |
| --- | --- | --- |
| `10104 QueueNotFound` | 队列不存在。 | 检查环境、queue 名称和 binding。 |
| `10106 Unauthorized` | 权限不足。 | 检查 API token 或 Worker binding 权限。 |
| `10203 MessageMetadataInvalid` | content type 或 delay 无效。 | 只用 `text`、`bytes`、`json`、`v8`；delay 不超过 24 小时。 |
| `10204 MessageSizeOutOfBounds` | 消息大小超过 128 KB。 | 大内容放 R2，消息只传 key。 |
| `10250 QueueOverloaded` | 队列过载。 | producer 退避，必要时拆 queue。 |
| `10251 QueueStorageLimitExceeded` | backlog 达到 25 GB。 | 修 consumer、暂停 producer、必要时 purge。 |
| `10252 QueueDisabled` | 队列暂停。 | 检查 pause-delivery 状态并恢复。 |
| `10253 FreeTierLimitExceeded` | Free operations 达上限。 | 降低写入、重试、空 pull，或升级 Workers Paid。 |

## Event subscriptions

Queues 不只接收业务 Worker 写入的消息，也可以订阅 Cloudflare 账户里的结构化事件。官方 Event subscriptions 覆盖 R2、Workers AI、Workers Builds、Workflows 等事件源，适合做自动化流程。

| 场景 | 判断 |
| --- | --- |
| R2 上传后处理 | R2 Event Notifications 进入 Queues，再由 Worker 做缩略图、解析、索引。 |
| Workers AI batch / 模型相关事件 | 适合做审计、回调和后处理。 |
| Worker build 完成 | 适合触发通知、验收或发布后任务。 |
| Workflows 事件 | 适合把流程状态变成下游异步处理。 |

Event subscriptions 在 Free 计划也可用，但最终进入队列的消息仍然消耗 Queues operations，并受 24 小时 retention 影响。

## 适合的组合

| 目标 | 组合 |
| --- | --- |
| 上传后处理 | R2 Event Notifications + Queues + Worker + D1 状态表 |
| 邮件和通知 | Worker API + Queues + 外部邮件服务 + DLQ |
| 轻量搜索索引 | Worker + Queues + R2 cached index + Cache |
| 爬虫和截图 | Pages/Worker + Queues + Browser Run + KV/R2 |
| 限速外部 API | Worker + Queues + `max_concurrency` + retry delay |
| 长流程编排 | Queues 做入口缓冲，Workflows 做多步骤状态机 |
| 强一致串行任务 | Queues 做削峰，Durable Objects 按实体串行处理 |

## 不要这样用

| 误区 | 更好的做法 |
| --- | --- |
| 把 Queues 当 exactly-once 系统。 | 用 D1 唯一键、外部 idempotency key 和状态机做幂等。 |
| 假设消息严格按发送顺序处理。 | 需要顺序时引入 Durable Objects 或状态版本。 |
| 往消息里塞文件、HTML、图片或大 JSON。 | 大内容放 R2，消息只传 key、etag 和任务参数。 |
| 不配置 DLQ。 | 生产任务至少有 DLQ 和排查路径。 |
| consumer 里用 `forEach(async ...)`。 | 用 `for...of` 或 `Promise.all()`。 |
| 为了“快”无脑拉满 `max_concurrency`。 | 先看下游 API、D1、R2 和外部服务的承受能力。 |
| 免费计划上让 backlog 积压几天。 | Free retention 只有 24 小时。 |
| Pull consumer 使用 `v8` 消息类型。 | Pull consumer 用 `json`、`text` 或 `bytes`。 |

## GitHub 开源参考

| 仓库 | 适合学习什么 |
| --- | --- |
| [cloudflare/cloudflare-docs Queues source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/queues) | 官方 Queues 文档源文件，适合追踪 pricing、limits、Pull Consumer、metrics 和 event subscriptions 的原始 Markdown。 |
| [cloudflare/workers-sdk Queues template](https://github.com/cloudflare/workers-sdk/tree/main/packages/create-cloudflare/templates/queues/ts) | 官方 C3 队列模板，同一个 Worker 里同时包含 producer 和 consumer，适合看最小配置。 |
| [cloudflare/queues-web-crawler](https://github.com/cloudflare/queues-web-crawler) | Cloudflare 官方 crawler 示例，展示 Pages Functions、Queues、Browser Rendering 和 KV 怎么组合。 |
| [Rheosoph/serverless-cloudflare-search](https://github.com/Rheosoph/serverless-cloudflare-search) | 用 Worker、Queues、R2 和 Cache 做小规模 serverless search，适合看“搜索索引异步写入”的思路。 |
| [ntsd/cloudflare-queues-example](https://github.com/ntsd/cloudflare-queues-example) | 一个更小的 producer 到 consumer 示例，适合只想看异步任务骨架时参考。 |

这些仓库不是都适合直接复制。更重要的是看它们怎么拆同步入口、异步任务、存储状态和重试边界。

## 下一步一起读

1. R2：文件本体和上传后处理事件。
2. Durable Objects：按用户、房间、订单做强一致串行。
3. Workflows：长时间、多步骤、有状态业务流程。
4. Browser Run：截图、PDF、动态网页抓取。
5. Analytics Engine：高基数事件和任务指标。

## 事实来源

- [Queues Docs](https://developers.cloudflare.com/queues/)
- [Queues Pricing](https://developers.cloudflare.com/queues/platform/pricing/)
- [Queues Limits](https://developers.cloudflare.com/queues/platform/limits/)
- [How Queues works](https://developers.cloudflare.com/queues/reference/how-queues-works/)
- [JavaScript APIs](https://developers.cloudflare.com/queues/configuration/javascript-apis/)
- [Batching, Retries and Delays](https://developers.cloudflare.com/queues/configuration/batching-retries/)
- [Dead Letter Queues](https://developers.cloudflare.com/queues/configuration/dead-letter-queues/)
- [Consumer concurrency](https://developers.cloudflare.com/queues/configuration/consumer-concurrency/)
- [Pull consumers](https://developers.cloudflare.com/queues/configuration/pull-consumers/)
- [Delivery guarantees](https://developers.cloudflare.com/queues/reference/delivery-guarantees/)
- [Pause, resume and purge](https://developers.cloudflare.com/queues/configuration/pause-purge/)
- [Queues metrics](https://developers.cloudflare.com/queues/observability/metrics/)
- [Wrangler Queues commands](https://developers.cloudflare.com/queues/reference/wrangler-commands/)
- [Queues Error codes](https://developers.cloudflare.com/queues/reference/error-codes/)
- [Queues Event subscriptions](https://developers.cloudflare.com/queues/event-subscriptions/)
- [Queues now available on Workers Free plan](https://developers.cloudflare.com/changelog/post/2026-02-04-queues-free-plan/)
