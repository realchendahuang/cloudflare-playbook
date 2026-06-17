---
title: KV
description: Cloudflare Workers KV 的定位、免费额度、付费边界、一致性模型、API 习惯和开源参考。
---

最后核对日期：2026-06-17。

KV 是 Cloudflare 的全球 key-value 存储。它把数据写入少量中心数据中心，然后在被读取后缓存到 Cloudflare 全球网络里，所以它最适合读多写少、可以接受最终一致的数据：配置、功能开关、公开索引、API 缓存、allow-list / deny-list、低频更新的用户偏好。

KV 的正确用法不是“便宜版数据库”。如果数据需要关系查询、强一致事务、频繁写同一个 key，优先看 D1 或 Durable Objects。

## 一句话判断

| 场景 | 是否优先用 KV | 判断 |
| --- | --- | --- |
| 公开配置、功能开关 | 是 | 读多写少，天然适合 KV。 |
| API 响应缓存 | 是 | 可接受短时间旧数据时很合适。 |
| 公开目录、静态索引 | 是 | 构建期或后台任务写入，前台高频读取。 |
| 用户偏好 | 可以 | 用户写入低频、读取高频时可用；敏感一致性要谨慎。 |
| 登录会话 | 谨慎 | 如果需要立刻撤销、强一致校验，优先 Durable Objects 或 D1。 |
| 评论、订单、文章关系数据 | 否 | 需要查询、排序、筛选和事务，D1 更合适。 |
| 计数器、排行榜、库存 | 否 | 同一个 key 高频写入会撞上 1 次/秒限制。 |
| 文件、图片、大对象 | 否 | 单 value 最大 25 MiB；文件本体放 R2。 |

## 运行模型

KV 的心智模型可以这样看：

```text
Worker
  │
  ├─ env.CONFIG.get("site:nav")
  ├─ env.CONFIG.put("site:nav", value)
  └─ env.CONFIG.list({ prefix: "site:" })
        │
        ▼
      Workers KV
        ├─ 写入中心数据存储
        ├─ 首次读取可能是 cold read
        ├─ 热点数据缓存在边缘或区域层
        └─ 写入后其他地区可能继续读到旧缓存
```

写入 KV 时，数据不会自动推送到每一个边缘节点。某个地区第一次读取时，可能要从区域层、中心层或中心存储取数据；读过之后才会在 Cloudflare 网络里变热。这个模型让 KV 的读扩展能力很好，但也决定了它不是强一致数据库。

## 免费与付费边界

KV 包含在 Workers Free 和 Workers Paid 里。Workers Paid 官方价格页写的是每个账户每月最低 $5 USD，它同时覆盖 Workers、Pages Functions、Workers KV、Hyperdrive 和 Durable Objects 的更高额度。

| 能力 | Workers Free | Workers Paid / Standard | 实践判断 |
| --- | --- | --- | --- |
| Keys read | 100,000/day。 | 10M/month included，超出 $0.50/million。 | 公开站点要避免每个页面读很多散 key。 |
| Keys written | 1,000/day。 | 1M/month included，超出 $5.00/million。 | 写入贵于读取；把写入集中在构建、后台或低频管理流程。 |
| Keys deleted | 1,000/day。 | 1M/month included，超出 $5.00/million。 | 批量清理要估算 key 数，不是按一次命令计。 |
| List requests | 1,000/day。 | 1M/month included，超出 $5.00/million。 | `list()` 适合后台和管理，不适合每个用户请求都跑。 |
| Stored data | 1 GB。 | 1 GB included，超出 $0.50/GB-month。 | 小配置和索引很划算，大文件去 R2。 |
| 同一个 key 写入 | 1 write/second。 | 1 write/second。 | 这条不会因为 Paid 变高，是 KV 最重要的架构边界。 |
| 每次 Worker invocation 外部操作 | 1,000。 | 1,000。 | bulk read 算 1 次外部操作，但计费仍按读到的 key 数。 |
| Namespaces/account | 1,000。 | 1,000。 | 可以按环境或产品拆 namespace，不要把所有数据混在一起。 |
| Key size | 512 bytes。 | 512 bytes。 | key 命名要短且可读。 |
| Metadata size | 1,024 bytes。 | 1,024 bytes。 | 小值可以放 metadata，减少 `list()` 后再 `get()`。 |
| Value size | 25 MiB。 | 25 MiB。 | 大对象和附件放 R2。 |
| Minimum `cacheTtl` | 30 seconds。 | 30 seconds。 | 默认 60 秒；写得频繁的数据不要拉长缓存。 |
| `expirationTtl` minimum | 60 seconds。 | 60 seconds。 | 用于 key 自动过期，和读取缓存的 `cacheTtl` 不是同一个概念。 |
| Egress | 不对 KV 数据传输单独收费。 | 不对 KV 数据传输单独收费。 | 成本主要看操作次数和存储。 |

免费额度在 UTC 00:00 重置。超过 Free 某一类 KV 操作额度后，该类操作会失败。Dashboard 和 Wrangler 里的读写删列操作也会计入用量。

## 一致性与缓存

KV 是 eventually-consistent。官方文档给出的关键边界是：

| 现象 | 实践判断 |
| --- | --- |
| 同一 Cloudflare 网络位置的写后读通常能较快看到新值。 | 不能把“通常”当保证。 |
| 其他地区可能最多 60 秒或 `cacheTtl` 时间内看到旧值。 | 写后马上读的业务不能依赖 KV。 |
| 读取不存在的 key 也会缓存 negative lookup。 | 刚创建的 key 在其他地区也可能短时间继续读到 `null`。 |
| `cacheTtl` 默认 60 秒，最小 30 秒。 | 读多写少的数据可以调大；经常更新的数据不要调大。 |
| 同一个 key 并发写入时 last write wins。 | 需要串行写入时用 Durable Objects 接住写路径。 |

一个常见组合是：写入先进入 Durable Object，由 Durable Object 串行处理同一个实体或同一个 key 的更新，再把结果写到 KV；读路径仍然从 KV 走。这不是让 KV 变强一致，而是把写冲突收敛到 Durable Object。

```text
写路径
  用户请求
    └─ Worker
        └─ Durable Object 串行化同一对象的写入
            └─ KV 保存可缓存快照

读路径
  用户请求
    └─ Worker
        └─ KV 快速读取快照
```

## API 习惯

### 读取

KV 读取用 `get()` 或 `getWithMetadata()`。单 key 不存在时返回 `null`，批量读取最多 100 个 key。

```ts
export default {
	// fetch 负责读取 KV 配置，并把缺失配置转成清晰的 HTTP 响应。
	async fetch(request, env) {
		// cacheTtl 控制当前地区缓存结果的时间，适合读多写少的数据。
		const config = await env.CONFIG.get('site:config', {
			type: 'json',
			cacheTtl: 300,
		});

		// KV 不存在时返回 null，调用方要把“没有配置”和“配置为空”区分开。
		if (config === null) {
			return Response.json({ error: 'config_not_found' }, { status: 404 });
		}

		return Response.json(config);
	},
};
```

读取类型从快到慢大致是 `stream`、`arrayBuffer`、`text`、`json`。大值优先用 `stream` 或 `arrayBuffer`，但真正的大文件应该放 R2。

### 写入

KV 写入用 `put()`。key 不能为空，不能是 `.` 或 `..`，最大 512 bytes；value 最大 25 MiB；metadata 序列化后最大 1,024 bytes。

```ts
export default {
	// fetch 负责接收配置更新，并把低频变更写入 KV。
	async fetch(request, env) {
		const body = await request.json();

		// 同一个 key 最多 1 次/秒写入，适合低频配置更新，不适合计数器。
		await env.CONFIG.put('feature:search-v2', JSON.stringify(body), {
			metadata: {
				updatedBy: 'admin',
				version: body.version,
			},
			expirationTtl: 60 * 60 * 24,
		});

		return Response.json({ ok: true });
	},
};
```

`expirationTtl` 最小是 60 秒。它表示 key 什么时候过期删除；`cacheTtl` 表示读取结果在边缘缓存多久。两者不要混淆。

### 列表

`list()` 默认最多返回 1,000 个 key，并通过 `cursor` 分页。不要用 `keys.length === 0` 判断是否结束，要看 `list_complete`。

```ts
export default {
	// fetch 负责按 prefix 分页列出 KV keys，适合后台管理或构建任务。
	async fetch(request, env) {
		let cursor;
		const keys = [];

		do {
			// prefix 可以把 namespace 当成多个逻辑集合使用。
			const page = await env.CONFIG.list({
				prefix: 'docs:',
				cursor,
			});

			keys.push(...page.keys);
			cursor = page.list_complete ? undefined : page.cursor;
		} while (cursor);

		return Response.json(keys);
	},
};
```

如果列表页只需要很小的展示字段，可以把展示字段放进 metadata，避免 `list()` 之后对每个 key 再 `get()` 一次。

### 删除和批量操作

`delete()` 删除不存在的 key 也会成功返回。删除和更新一样需要传播时间，其他地区可能短时间继续读到旧缓存。

批量写入、批量删除和批量读取适合通过 Wrangler 或 REST API 做后台任务。官方限制里，bulk write / delete 最多 10,000 个 KV pairs；bulk write 的整个请求要小于 100 MB；Worker binding 不支持 bulk write / delete。

```bash
pnpm wrangler kv namespace create CONFIG
pnpm wrangler kv key put site:config '{"theme":"orange"}' --binding CONFIG
pnpm wrangler kv key get site:config --binding CONFIG --text
pnpm wrangler kv key list --binding CONFIG --prefix site:
```

Wrangler 3.60.0 之后使用 `kv ...` 语法；旧的 `kv:...` 语法已经被标记为 deprecated。

## 适合的组合

| 目标 | 组合 |
| --- | --- |
| 站点配置 | Workers Static Assets + Worker + KV |
| API 缓存 | Worker + KV + 上游 API |
| 文档公开索引 | 构建任务 / Cron + KV + Pagefind 或前端搜索 |
| 功能开关 | Worker + KV，复杂发布规则再看 Flagship |
| 热门查询缓存 | D1 查询结果 + KV 缓存 + 短 `cacheTtl` |
| 文件目录 | R2 存文件 + KV 存公开 manifest，D1 存需要查询的 metadata |
| 强一致写入快照 | Durable Objects 串行写 + KV 读缓存 |
| 异步更新缓存 | Queues / Cron Triggers + KV |

## 不要这样用

| 误区 | 更好的做法 |
| --- | --- |
| 把 KV 当 SQL 数据库。 | 关系查询、排序、筛选、事务交给 D1。 |
| 用 KV 做高频计数器。 | Durable Objects、D1 或 Analytics Engine 更合适。 |
| 每个用户请求都 `list()` 全 namespace。 | 预生成索引，或用 prefix / metadata / D1 查询。 |
| 写入后要求全球立刻读到新值。 | 强一致路径用 Durable Objects 或 D1。 |
| 把大附件塞进 KV。 | R2 存文件，KV 或 D1 存索引。 |
| 为了省事把所有环境共用一个 namespace。 | local、staging、production 分 namespace。 |
| 无脑调大 `cacheTtl`。 | 只给低频更新的数据调大，避免旧数据传播太久。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/templates/to-do-list-kv-template](https://github.com/cloudflare/templates/tree/main/to-do-list-kv-template) | 官方 Remix + Workers Static Assets + KV 模板，适合看 KV binding、C3 初始化和部署流程。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | Cloudflare 官方 Workers 模板集合，适合比较 KV、D1、R2、Durable Objects 的项目组织方式。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Miniflare、Cloudflare Vite plugin 和本地 KV 测试能力。 |
| [cloudflare/workerskv.gui](https://github.com/cloudflare/workerskv.gui) | KV namespace 数据浏览器示例，适合理解 KV 管理工具形态。 |
| [cloudflare/kv-worker-migrate](https://github.com/cloudflare/kv-worker-migrate) | 历史 KV namespace 迁移工具，适合了解迁移时的 list/read/write 成本和一致性注意事项。 |
| [cloudflare/workers-rs](https://github.com/cloudflare/workers-rs) | Rust / WebAssembly 使用 Workers binding 的生态入口。 |

## 后续精读

KV 的下一步应该和 R2、Durable Objects、Queues 一起读：

1. R2：对象存储、Class A/B 操作、签名上传和生命周期。
2. Durable Objects：强一致状态、WebSocket、SQLite-backed storage。
3. Queues：异步更新缓存、批处理、重试和死信队列。
4. Cache API / CDN Cache：和 KV 缓存的边界。

## 事实来源

- [Workers KV](https://developers.cloudflare.com/kv/)
- [How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [KV Pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- [KV Limits](https://developers.cloudflare.com/kv/platform/limits/)
- [Read key-value pairs](https://developers.cloudflare.com/kv/api/read-key-value-pairs/)
- [Write key-value pairs](https://developers.cloudflare.com/kv/api/write-key-value-pairs/)
- [List keys](https://developers.cloudflare.com/kv/api/list-keys/)
- [Delete key-value pairs](https://developers.cloudflare.com/kv/api/delete-key-value-pairs/)
- [Wrangler KV commands](https://developers.cloudflare.com/kv/reference/kv-commands/)
- [KV Event subscriptions](https://developers.cloudflare.com/kv/platform/event-subscriptions/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
