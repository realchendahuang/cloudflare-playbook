---
title: Durable Objects
description: Cloudflare Durable Objects 的定位、免费额度、付费边界、强一致模型、SQLite storage、WebSocket Hibernation、Alarms、迁移和开源参考。
---

最后核对日期：2026-06-18。

Durable Objects 是 Cloudflare 的“单实体有状态计算单元”：每一个对象都有一个全局唯一身份、一段可以保留在内存里的状态，以及一份和对象绑定在一起的强一致存储。它最适合解决普通 Worker 天然不擅长的事情：同一个房间、同一个用户、同一个资源，需要按顺序协调多方请求。

不要把 Durable Objects 理解成“更高级的数据库”。它更像是每个房间、会话、租户或资源旁边的一小段有状态 Worker。需要关系查询、列表、报表和全局检索时，优先看 D1、R2、Analytics Engine 或 Vectorize；只有当同一个实体必须串行决策时，才把它放进 Durable Objects。

## 一句话判断

| 场景 | 是否优先用 Durable Objects | 判断 |
| --- | --- | --- |
| 聊天房间、协作文档、多人游戏房间 | 是 | 一个房间一个对象，天然适合广播、成员状态和顺序事件。 |
| 单资源库存、座位、预约、锁 | 是 | 同一个资源的写入需要串行决策。 |
| IP / 用户 / token 维度限流器 | 是 | 每个 key 一个对象，可以在内存里做短窗口协调。 |
| WebSocket presence 和实时通知 | 是 | 用 WebSocket Hibernation 降低空闲连接的 duration 成本。 |
| per-user / per-tenant 小型强一致状态 | 可以 | 每个用户或租户一个对象，边界清楚时很好用。 |
| 全站评论、文章、订单列表 | 不优先 | 关系数据、排序、分页和筛选优先 D1。 |
| 大文件、图片、附件 | 否 | 文件本体放 R2，Durable Objects 只放协调状态或索引。 |
| 全局搜索、分析、日志 | 否 | 搜索看 Pagefind / AI Search / Vectorize，分析看 Analytics Engine。 |
| 高吞吐独立写入 | 谨慎 | 不要把所有请求塞进一个对象，需要按实体拆分或分片。 |

## 二次精读结论

Durable Objects 对普通项目最有价值的地方，是把“同一个实体必须按顺序决策”的问题放到 Cloudflare 边缘解决。它不是免费数据库大全里的万能选手，而是一个非常明确的工具：**每个房间、会话、资源、租户或限流 key 一个对象**。

| 判断维度 | 结论 | 免费额度里的玩法 |
| --- | --- | --- |
| 定位 | 单实体强一致协调单元。 | 免费阶段只放房间、会话、限流器、锁和小型状态。 |
| 费用 | requests、duration、SQLite rows read / written、stored data 一起看。 | 先让空闲连接休眠，减少 duration；再优化 SQL 查询和写入次数。 |
| 存储 | 新项目默认 SQLite-backed Durable Objects。 | Free 只支持 SQLite-backed；不要创建 key-value backend。 |
| 切分 | 对象 ID 就是成本和吞吐边界。 | 不要全站一个 `GLOBAL`；按 room/user/resource/shard 拆。 |
| 实时 | WebSocket Hibernation 是实时项目的成本底线。 | 普通 WebSocket 长连会持续计 duration；Hibernation 才适合免费起步。 |
| 生命周期 | constructor 会在冷启动和休眠唤醒后重新执行。 | constructor 只做轻量 schema 和必要恢复，关键状态写 SQLite。 |
| 迁移 | migration 是数据边界，不只是配置。 | `deleted_classes` 会删除对应 class 的对象和数据，上线前必须复核。 |

## 上线前问题

| 问题 | 为什么重要 | 推荐答案 |
| --- | --- | --- |
| 对象 ID 是什么 | 决定单对象热点、强一致边界和未来分片方式。 | 用业务实体 ID，例如 `room:${roomId}`、`user:${userId}`、`resource:${id}`。 |
| Free 额度会先撞哪里 | Durable Objects Free 是多维硬限制。 | 同时看 100,000 requests/day、13,000 GB-s/day、5M rows read/day、100k rows written/day、5 GB total storage。 |
| 有没有普通 WebSocket 长连 | 普通 `accept()` 会让对象在连接期间持续计 duration。 | 实时房间默认 `ctx.acceptWebSocket()`，用 hibernation。 |
| 状态是否需要全局列表、搜索或报表 | DO 存储私有于单个对象，不适合全局查询。 | 列表和报表放 D1 / Analytics Engine，文件和归档放 R2。 |
| alarm 能不能重复执行 | alarm 是 at least once，失败最多自动重试 6 次。 | handler 幂等，处理成功后再清理事件表。 |
| 超过单对象吞吐怎么办 | 官方 FAQ 提到单对象约 1,000 requests/second 软限制。 | 按实体拆对象；再用 hash shard 或上游队列分摊。 |
| 如何证明成本可控 | 账单来自请求、duration、行读写和存储。 | Dashboard / GraphQL 看 invocations、periodic、storage、subrequests，结合应用日志定位热点对象。 |

## 运行模型

Durable Objects 不直接接收公网请求。外部请求先进入 Worker，再由 Worker 通过 binding 找到某个对象的 stub，并调用它的 RPC 方法或 `fetch()`。

```text
Client
  │
  ▼
Worker
  ├─ env.ROOM.getByName(roomId)
  └─ stub.addMessage(...)
        │
        ▼
Room Durable Object
  ├─ 内存状态
  ├─ SQLite-backed storage
  ├─ WebSocket Hibernation
  └─ Alarms
```

只创建 stub 不会启动对象。官方 lifecycle 文档说明，只有调用 stub 上的方法时，请求才会发到远端 Durable Object，对象才会从 inactive 进入 active 状态。

## 免费与付费边界

Durable Objects 已经可以在 Workers Free 计划中使用，但 Free 只支持 SQLite-backed Durable Objects。新项目也应该默认用 SQLite backend，key-value backend 主要是历史兼容路径。

| 能力 | Workers Free | Workers Paid / Standard | 实践判断 |
| --- | --- | --- | --- |
| 可用 backend | 仅 SQLite-backed Durable Objects。 | SQLite-backed 和 key-value backend 都可用。 | 新 class 直接用 SQLite；不要为兼容旧 backend 设计新项目。 |
| Requests | 100,000/day。 | 1M/month included，超出 $0.15/million。 | HTTP request、RPC session、WebSocket message、alarm invocation 都会计入。 |
| Duration | 13,000 GB-s/day。 | 400,000 GB-s/month included，超出 $12.50/million GB-s。 | 只有 active 或 idle non-hibernateable 才计 duration。 |
| SQLite rows read | 5M/day。 | 25B/month included，超出 $0.001/million rows。 | 和 D1 一样，索引和查询形状决定成本。 |
| SQLite rows written | 100k/day。 | 50M/month included，超出 $1.00/million rows。 | `setAlarm()` 算 1 row written，delete 也按 rows written 计。 |
| SQL stored data | 5 GB total。 | 5 GB-month included，超出 $0.20/GB-month。 | Free 足够小型房间、限流、会话状态；不要把全站大数据塞进单对象。 |
| Daily reset | 00:00 UTC。 | 按月包含额度。 | Free 超过任一免费限制后，该类型操作会失败。 |

WebSocket 计费最容易被误解。使用普通 `ws.accept()` 会让对象在连接期间持续消耗 duration；使用 Durable Objects Hibernation API 后，客户端仍保持连接，但对象空闲时可以从内存中休眠，duration 不再因空闲连接持续累积。官方 pricing 示例里，同样的实时房间模型，是否使用 hibernation 会把月成本从高 duration 模型拉到接近请求和短时处理成本的模型。

## 计费证据怎么看

Durable Objects 的免费额度不是一个总开关，而是五条独立的成本线。免费阶段排查账单或失败，先按这个顺序看：

| 成本线 | 免费边界 | 看什么证据 | 常见优化 |
| --- | --- | --- | --- |
| Requests | 100,000/day。 | HTTP request、RPC session、WebSocket message、alarm invocation。 | 合并小请求，批量处理消息，避免无意义轮询。 |
| Duration | 13,000 GB-s/day。 | 对象 active 或 idle non-hibernateable 的 wall-clock duration。 | WebSocket 用 hibernation，移除长时间 `setTimeout` / `setInterval`，外部 I/O 不要卡在对象里。 |
| SQLite rows read | 5M/day。 | SQL cursor 的 `rowsRead`、Dashboard storage metrics。 | 建索引，限制分页，避免无条件 `list()` 或全表扫。 |
| SQLite rows written | 100k/day。 | SQL cursor 的 `rowsWritten`、`setAlarm()`、delete 计数。 | 合并写入，减少索引数量，把大批量日志放 Analytics Engine / R2。 |
| SQL stored data | 5 GB total。 | `ctx.storage.sql.databaseSize`、Durable Objects storage metrics。 | 只保存当前实体状态，归档和文件放 D1 / R2。 |

最容易烧 duration 的不是请求数，而是“对象一直不能休眠”：普通 WebSocket API、未完成的事件处理、待执行的 timer、正在等待的外部 `fetch()` 都可能让对象留在 non-hibernateable 状态。

## 关键限制

| 限制 | 当前值 | 实践判断 |
| --- | --- | --- |
| Objects 数量 | Unlimited，按账户或 class 维度。 | 可以按 room/user/resource 创建对象。 |
| Durable Object classes | Paid 500/account，Free 100/account。 | class 是类型，不是实例；普通项目很难碰到。 |
| SQLite storage/account | Paid unlimited，Free 5 GB。 | Free 项目要监控总存储。 |
| Storage per class | Unlimited。 | class 不应成为拆分边界，业务实体才是。 |
| Storage per Durable Object | SQLite limits 表列 10 GB；FAQ 写明写入失败边界是 Paid 10 GB、Free 1 GB。 | Free 阶段按 1 GB/object 做保守设计，同时注意账号总量 5 GB。 |
| Key + value size | 合计不能超过 2 MB。 | 大 payload 放 R2，DO 存 key、状态和小索引。 |
| WebSocket received message | 32 MiB。 | 实时消息应该远小于这个值。 |
| CPU/request | 默认 30s，可配置到 5min active CPU。 | CPU 密集逻辑先优化，再考虑提高 `limits.cpu_ms`。 |
| Simultaneous outgoing connections/request | 6。 | 外部 API fan-out 不适合放在单个请求里无限并发。 |
| 单个对象软吞吐 | 官方 FAQ 提到约 1,000 requests/second。 | 更高吞吐要按 room、user、bucket 或 shard 拆对象。 |
| Hibernation WebSocket 连接数 | API 上限 32,768/对象。 | 实际上会先受到 CPU、内存、消息频率和广播 fan-out 限制。 |
| SQL columns/table | 100。 | DO 里的表要小而专注。 |
| SQL row/string/blob | 2 MB。 | 大字段放 R2。 |
| SQL statement | 100 KB。 | 迁移和批量写入拆小。 |
| Bound parameters/query | 100。 | 批量写入需要分组。 |

## 心智模型

Durable Objects 的最佳实践是“一个对象负责一个协调原子”。对象 ID 应该来自业务实体，例如 roomId、userId、tenantId、resourceId、rateLimitKey，而不是全站共用一个 `GLOBAL`。

| 设计问题 | 推荐判断 |
| --- | --- |
| 对象怎么命名 | 用业务上天然需要串行处理的 ID，例如 `room:${roomId}`。 |
| 状态放内存还是存储 | 内存只做热状态和缓存；关键状态先写 SQLite。 |
| constructor 做什么 | 轻量初始化 schema、恢复必要状态；不要在 constructor 里做重外部 I/O。 |
| `await fetch()` 时注意什么 | 等外部 I/O 会让其他事件有机会进入；关键状态变更先持久化。 |
| `ctx.waitUntil()` 怎么看 | 官方 DurableObjectState 页面说明它仅为 API 兼容存在，在 Durable Objects 中没有效果，不要依赖它延长生命周期。 |
| 需要 exactly-once 吗 | Durable Objects 能帮你串行处理单对象事件，但外部 API、alarm、queue 仍要按可重试设计。 |

## 生命周期和并发边界

官方 lifecycle 文档把对象状态拆成 active、idle non-hibernateable、idle hibernateable、hibernated 和 inactive。费用上最关键的是：active 和 idle non-hibernateable 会产生 duration；符合 hibernation 条件的 idle 对象不会因为空闲等待持续产生 duration。

| 边界 | 官方行为 | 实践判断 |
| --- | --- | --- |
| stub 创建 | 创建 stub 不会启动对象。 | 只有调用 RPC 方法或 `fetch()` 才会让对象 active。 |
| constructor | 首次请求、冷启动、休眠唤醒后都会执行。 | constructor 只放轻量 schema 和恢复逻辑。 |
| hibernation | 约 10 秒无事件且满足条件后可休眠，内存状态会丢弃。 | 关键状态必须写 SQLite；连接元数据写 attachment。 |
| 非休眠 idle | 有 timer、标准 WebSocket、待完成 `fetch()` 或事件处理时不能休眠。 | 移除长期 timer，改用 alarm；实时连接改 hibernation API。 |
| shutdown | 部署、空闲、runtime 更新、调度迁移都可能重启对象。 | 不依赖 shutdown hook，处理进度边做边写。 |
| 并发 | 对象单线程，但 `await` 会让事件循环有机会处理别的事件。 | SQLite 同步操作适合原子状态更新；外部异步 I/O 前先保存关键状态。 |
| `blockConcurrencyWhile()` | 阻塞其他事件，适合初始化和少量关键区。 | 不要把慢外部请求放进去，官方有 30 秒超时。 |

## SQLite storage 细节

SQLite-backed Durable Objects 把 SQL、同步 KV、异步 KV、PITR 和 Alarms 放在同一个对象私有存储里。它非常适合“一个实体的小数据库”，但不适合全局查询。

| 细节 | 结论 | 实践判断 |
| --- | --- | --- |
| SQL API | `ctx.storage.sql.exec()` 同步返回 cursor。 | cursor 在 `await` 前消费完，避免跨 await 后看到不稳定结果。 |
| 行读写计费 | cursor 暴露 `rowsRead` 和 `rowsWritten`。 | 开发期就把关键查询的行读写打印到日志里抽样观察。 |
| 索引 | 写入索引也会增加 rows written。 | 读多字段建索引，写多实体少建索引。 |
| KV API | SQLite-backed DO 的 KV 存在隐藏表 `__cf_kv`。 | 少量 key-value 状态可以用 KV；复杂查询用显式 SQL 表。 |
| PITR | SQLite-backed DO 支持恢复到过去 30 天内的时间点。 | 风险迁移或批量清理前先保留 bookmark。 |
| `deleteAll()` | SQLite-backed DO 会原子删除整个私有数据库；兼容日期较新时也会删除 alarm。 | 删除前先确认对象级数据可丢弃。 |
| `databaseSize` | 可读取当前 SQLite database size。 | 免费阶段用它做对象级存储水位监控。 |

## 配置习惯

Durable Objects 的 binding 和 migration 都写在 `wrangler.jsonc` 里。新 class 使用 `new_sqlite_classes`。

```jsonc
{
	"durable_objects": {
		"bindings": [
			{
				// name 是 Worker 代码里访问 Durable Object namespace 的变量名。
				"name": "ROOM",
				// class_name 必须和导出的 Durable Object class 名称一致。
				"class_name": "Room"
			}
		]
	},
	"migrations": [
		{
			// tag 是 migration 标识，每个 migration entry 都要唯一。
			"tag": "v1",
			// 新项目使用 SQLite-backed Durable Objects。
			"new_sqlite_classes": ["Room"]
		}
	],
	"limits": {
		// CPU 密集型对象再提高到 5 分钟；普通请求保持默认更容易发现问题。
		"cpu_ms": 300000
	}
}
```

删除 class 的 migration 会删除与该 class 关联的对象和数据。生产环境先迁移或导出数据，再移除 binding、代码和 class。

## RPC + SQLite 示例

新项目优先使用 RPC 方法，让 Worker 调用对象上的公开方法。对象内部用 SQLite 保存关键状态。

```ts
import { DurableObject } from 'cloudflare:workers';

type Message = {
	id: string;
	userId: string;
	content: string;
	createdAt: number;
};

interface Env {
	ROOM: DurableObjectNamespace<Room>;
}

export class Room extends DurableObject<Env> {
	// constructor 初始化轻量 schema，保证对象冷启动和休眠唤醒后都能处理请求。
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);

		this.ctx.storage.sql.exec(`
			CREATE TABLE IF NOT EXISTS messages (
				id TEXT PRIMARY KEY,
				user_id TEXT NOT NULL,
				content TEXT NOT NULL,
				created_at INTEGER NOT NULL
			);
		`);
	}

	// addMessage 串行写入房间消息，返回已持久化的消息对象。
	addMessage(userId: string, content: string): Message {
		const message = {
			id: crypto.randomUUID(),
			userId,
			content,
			createdAt: Date.now(),
		};

		this.ctx.storage.sql.exec(
			'INSERT INTO messages (id, user_id, content, created_at) VALUES (?, ?, ?, ?)',
			message.id,
			message.userId,
			message.content,
			message.createdAt,
		);

		return message;
	}

	// listMessages 读取最近消息，避免一次请求扫完整个房间历史。
	listMessages(limit = 50): Message[] {
		const rows = this.ctx.storage.sql.exec<{
			id: string;
			user_id: string;
			content: string;
			created_at: number;
		}>(
			'SELECT id, user_id, content, created_at FROM messages ORDER BY created_at DESC LIMIT ?',
			Math.min(limit, 100),
		);

		return [...rows].map((row) => ({
			id: row.id,
			userId: row.user_id,
			content: row.content,
			createdAt: row.created_at,
		}));
	}
}

export default {
	// fetch 校验外部请求，并把指定 roomId 的操作路由到同一个 Durable Object。
	async fetch(request, env) {
		const url = new URL(request.url);
		const roomId = url.searchParams.get('roomId');

		// roomId 来自外部输入，必须在 Worker 边界做最小校验。
		if (roomId === null || roomId === '') {
			return new Response('Missing roomId', { status: 400 });
		}

		const stub = env.ROOM.getByName(roomId);

		if (request.method === 'POST') {
			const body = (await request.json()) as {
				userId?: string;
				content?: string;
			};

			if (body.userId === undefined || body.content === undefined) {
				return new Response('Invalid body', { status: 400 });
			}

			const message = await stub.addMessage(body.userId, body.content);
			return Response.json(message, { status: 201 });
		}

		if (request.method === 'GET') {
			const messages = await stub.listMessages();
			return Response.json(messages);
		}

		return new Response('Method not allowed', {
			status: 405,
			headers: { allow: 'GET, POST' },
		});
	},
} satisfies ExportedHandler<Env>;
```

这个例子只保存消息，不做广播。真实聊天房间通常会把 `addMessage()` 和 WebSocket Hibernation 结合起来：SQLite 存历史，内存或 hibernatable sockets 做实时广播。

## WebSocket Hibernation

Durable Objects 是 Cloudflare 上做 WebSocket 房间最常见的选择。关键不是“能连上”，而是“空闲时能休眠”。

```ts
export class ChatRoom extends DurableObject<Env> {
	// fetch 接受 WebSocket upgrade，并把连接交给 hibernation API 管理。
	async fetch(request: Request): Promise<Response> {
		if (request.headers.get('upgrade') !== 'websocket') {
			return new Response('Expected WebSocket', { status: 426 });
		}

		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);

		// acceptWebSocket 允许对象在空闲时休眠；不要再调用 server.accept()。
		this.ctx.acceptWebSocket(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	// webSocketMessage 在对象被消息唤醒后广播内容。
	async webSocketMessage(sender: WebSocket, message: string | ArrayBuffer): Promise<void> {
		for (const socket of this.ctx.getWebSockets()) {
			if (socket !== sender) {
				socket.send(message);
			}
		}
	}
}
```

休眠会丢弃内存状态。需要在唤醒后恢复的连接元数据，使用 `serializeAttachment()` 和 `deserializeAttachment()` 保存到 WebSocket attachment；需要长期保存的业务状态，写入 SQLite。

| 对比 | 标准 WebSocket API | Hibernation WebSocket API |
| --- | --- | --- |
| 接入方法 | `server.accept()` 和事件监听器。 | `ctx.acceptWebSocket(server)` 和 DO handler。 |
| 空闲成本 | 连接存在期间会让对象持续计 duration。 | 空闲且满足条件时可休眠，不持续计 duration。 |
| 内存状态 | 连接期间内存保留，但部署或重启仍会丢。 | 休眠后内存必然丢弃。 |
| 连接元数据 | 自己维护内存或存储。 | `serializeAttachment()` 最多 16,384 bytes，适合连接级小状态。 |
| 最大连接 | 受内存、CPU、消息频率和广播成本影响。 | API 上限 32,768/对象，实际也受工作负载限制。 |
| 推荐场景 | 极短连接或无需休眠的特殊场景。 | 聊天、协作、presence、通知、多人房间。 |

## Alarms

Alarms 是 Durable Objects 内部的定时唤醒能力。每个对象同一时间只能设置一个 alarm，但你可以把多个未来事件存到 SQLite 表里，然后总是把 alarm 设到最近一个事件。

| 规则 | 实践判断 |
| --- | --- |
| 每个对象一个 alarm | 多事件调度要用表保存 schedule，再设置下一个 alarm。 |
| at least once | `alarm()` 可能重试，处理逻辑要幂等。 |
| 自动重试 | handler 抛错后指数退避，从 2 秒开始，最多 6 次。 |
| 计费 | SQLite-backed DO 中 `setAlarm()` 计 1 row written。 |
| 和 Cron 的区别 | Cron 是 Worker 级固定计划；alarm 是每个对象自己安排未来任务。 |

适合 alarm 的场景：房间空闲清理、用户会话过期、批量 flush、限流窗口重置、延迟结算。长期复杂流程优先看 Workflows，异步任务缓冲优先看 Queues。

## 迁移和删除清单

Durable Objects 的 migration 会改变 class 和存储数据的映射。它不像普通配置那样可以随便回滚，生产环境要把它当数据操作处理。

| 操作 | 配置 | 风险 |
| --- | --- | --- |
| 创建 SQLite class | `new_sqlite_classes`。 | 新项目默认选择；Free 也支持。 |
| 创建 legacy KV class | `new_classes`。 | 只适合历史兼容，且 Free 不支持。 |
| 重命名 class | `renamed_classes`。 | 目标 class 不要提前单独创建，迁移后旧数据会给新 class。 |
| 跨 Worker 转移 class | `transferred_classes`。 | 适合代码拆分，源脚本和目标 class 名必须准确。 |
| 删除 class | `deleted_classes`。 | 会删除对应 class 的所有对象和存储数据，不要直接在生产试。 |

迁移上线前最小清单：

1. `wrangler deploy --dry-run` 先看配置能否通过。
2. 确认 binding、class export、migration tag 三者一致。
3. 删除前先确认业务已经不再访问旧 binding。
4. 重要数据先迁移到新 class、D1 或 R2，再执行 delete migration。
5. 渐进部署不能包住 Durable Objects migration，migration 是原子操作。

## 观测与排障

Durable Objects 的问题通常不是“对象不存在”，而是单对象热点、存储超限、duration 长时间累积、WebSocket 不能休眠或迁移配置错误。

| 目标 | 看哪里 | 判断 |
| --- | --- | --- |
| 找热点对象 | Dashboard Durable Objects Metrics，或 GraphQL `durableObjectsInvocationsAdaptiveGroups`。 | request、error、duration 集中在少数 ID 时要分片。 |
| 看存储增长 | GraphQL `durableObjectsStorageGroups`、`databaseSize`、Data Studio。 | 单对象接近 Free 保守边界或总量接近 5 GB 时清理或归档。 |
| 看 WebSocket 成本 | invocations、periodic groups、duration、连接关闭后的 request metrics。 | 使用标准 API 的长连会暴涨 duration。 |
| 看日志 | Wrangler 配置 `observability.enabled = true` 后在 Durable Objects Logs 查看。 | 日志按 script name 和 class name 聚合，用 `$workers.durableObjectId` 定位实例。 |
| 排查 overload | `wrangler tail`、Troubleshooting 文档里的 overloaded errors。 | `.overloaded === true` 不要盲目重试，先降并发或拆对象。 |
| 处理 retryable | Error handling 文档建议 `.retryable === true` 且请求幂等时指数退避重试。 | 异常后重新创建 stub，不复用 broken stub。 |

## 适合的组合

| 目标 | 推荐组合 |
| --- | --- |
| 聊天 / 协作房间 | Workers + Durable Objects + WebSocket Hibernation + D1/R2 归档。 |
| 单资源强一致写入 | Workers + Durable Objects + SQLite storage。 |
| 用户级实时状态 | 每个 userId 一个 DO，外部列表和报表放 D1。 |
| 限流器 | 每个 IP/token/resource 一个 DO，必要时结合 WAF 或 Rate Limiting。 |
| 后台任务串行化 | Queues 进消息，按 entityId 路由到 Durable Object。 |
| Agent 状态 | Agents SDK / Actors + Durable Objects + Workers AI / AI Gateway。 |
| 文件处理状态 | R2 存文件，Queues 触发处理，Durable Objects 协调同一个文件或任务。 |

## 不要这样用

| 误区 | 更好的做法 |
| --- | --- |
| 全站一个 Durable Object。 | 按 room、user、tenant、resource 拆对象。 |
| 把 DO 当全局关系数据库。 | 关系表、列表和报表放 D1。 |
| 关键状态只放内存。 | 内存只做热缓存，关键状态写 SQLite。 |
| constructor 里做重查询或外部请求。 | constructor 只做轻量 schema 和必要恢复。 |
| 普通 WebSocket API 长连不休眠。 | 实时房间使用 `ctx.acceptWebSocket()` 和 hibernation API。 |
| 用 `ctx.waitUntil()` 兜底清理。 | Durable Objects 中它没有生命周期延长效果；用 alarm、Queues 或明确的 RPC。 |
| 把大 payload 写进对象存储。 | 大文件和大字段放 R2，DO 只存 key 和状态。 |
| 假设 alarm exactly-once。 | alarm handler 按可重复执行设计。 |
| 直接删除 class migration。 | 先迁移或导出数据，再删除 class。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs Durable Objects source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/durable-objects) | 官方 Durable Objects 文档源文件，适合追踪 pricing、limits、lifecycle、migrations 和 observability 的原始 Markdown。 |
| [cloudflare/workers-sdk C3 Durable Object template](https://github.com/cloudflare/workers-sdk/tree/main/packages/create-cloudflare/templates/hello-world-durable-object/ts) | 官方 `create-cloudflare` 模板，适合看最小 `wrangler.jsonc`、`new_sqlite_classes` 和 RPC 调用。 |
| [cloudflare/workers-chat-demo](https://github.com/cloudflare/workers-chat-demo) | 官方 Edge Chat Demo，一个 chat room 一个 Durable Object，包含 WebSocket、历史消息和限流器模式。 |
| [cloudflare/websocket-template](https://github.com/cloudflare/websocket-template) | Workers WebSocket 模板，适合对照普通 WebSocket 与 Durable Objects Hibernation 的接入方式。 |
| [cloudflare/actors](https://github.com/cloudflare/actors) | Cloudflare 官方 Actors 框架，封装 Durable Objects 的生命周期、RPC、SQL migration、alarms 和实例管理。 |
| [lambrospetrou/durable-utils](https://github.com/lambrospetrou/durable-utils) | Durable Objects 工具集，适合学习 SQLite schema migrations 和固定分片工具。 |
| [outerbase/starbasedb](https://github.com/outerbase/starbasedb) | 基于 Durable Objects 的 scale-to-zero SQLite HTTP database，适合看 Worker 网关 + DO SQLite 的架构。 |
| [acoyfellow/UserDO](https://github.com/acoyfellow/UserDO) | per-user Durable Object 模式，包含用户级 SQLite 表、SSE 实时更新和浏览器客户端。 |

这些仓库的 README 可能包含历史价格或旧限制，尤其是 Durable Objects 从 Paid 扩展到 Free 之后，务必以 Cloudflare 官方 pricing / limits 页面为准。

## 事实来源

- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Durable Objects Limits](https://developers.cloudflare.com/durable-objects/platform/limits/)
- [Getting started](https://developers.cloudflare.com/durable-objects/get-started/)
- [Lifecycle of a Durable Object](https://developers.cloudflare.com/durable-objects/concepts/durable-object-lifecycle/)
- [Durable Object State](https://developers.cloudflare.com/durable-objects/api/state/)
- [SQLite-backed Durable Object Storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/)
- [Use WebSockets](https://developers.cloudflare.com/durable-objects/best-practices/websockets/)
- [Alarms](https://developers.cloudflare.com/durable-objects/api/alarms/)
- [Durable Objects migrations](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/)
- [Durable Objects Metrics and analytics](https://developers.cloudflare.com/durable-objects/observability/metrics-and-analytics/)
- [Durable Objects Troubleshooting](https://developers.cloudflare.com/durable-objects/observability/troubleshooting/)
- [Durable Objects Error handling](https://developers.cloudflare.com/durable-objects/best-practices/error-handling/)
- [Durable Objects FAQs](https://developers.cloudflare.com/durable-objects/reference/faq/)
