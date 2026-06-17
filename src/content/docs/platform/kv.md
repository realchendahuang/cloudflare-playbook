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

## 二次精读结论

KV 的核心不是“便宜存储”，而是全球读缓存。它能把读请求做得很轻，但前提是数据天然读多写少、可以接受短时间旧值。

| 维度 | 结论 | 普通项目怎么落地 |
| --- | --- | --- |
| 成本 | Free 每天读 100,000 次、写 1,000 次、删 1,000 次、list 1,000 次；Paid 按月包含用量。 | 公开配置、缓存、索引很划算；每个页面散读很多 key 会快速吃完免费读额度。 |
| 一致性 | KV 是 eventually consistent，不适合写后立刻全球一致。 | 写后读、撤销会话、库存、计数器交给 D1 或 Durable Objects。 |
| 缓存 | `cacheTtl` 会缓存存在值，也会缓存不存在的 negative lookup。 | 低频更新可以调大；经常创建和更新的 key 不要依赖刚写完马上可见。 |
| 写入 | 同一个 key 所有计划都是 1 write/second。 | 高频写入要拆 key，或用 Durable Object 串行化后再写 KV 快照。 |
| 访问方式 | Worker Binding API 性能通常优于 REST API；REST API 还受全局 API rate limit 约束。 | 应用运行时优先 binding；后台批量导入、迁移、管理再用 Wrangler 或 REST API。 |
| 观测 | Dashboard 和 GraphQL 能看 operations、storage、latency。 | 先按 namespace 看读写删列，再定位是不是 `list()`、missing key 或散 key 太多。 |

## 上线前问题

| 问题 | 为什么要问 | 推荐答案 |
| --- | --- | --- |
| 这份数据是否允许 60 秒或 `cacheTtl` 级别的旧值？ | KV 的读缓存决定了它不是强一致数据库。 | 允许旧值才进 KV；强一致用 D1 / Durable Objects。 |
| 每个页面会读几个 key？ | Free 读额度按 key 计，bulk read 计费也按 key 数。 | 把冷 key 合并成一个 JSON，或预生成 manifest。 |
| 是否需要频繁 `list()`？ | `list()` 计费高于读，且不适合用户请求路径。 | `list()` 放后台、管理页或构建任务；前台用索引 key。 |
| 同一个 key 是否可能高频写？ | 所有计划同 key 都是 1 write/second。 | 用唯一 key、分片 key、队列或 Durable Object 收敛写入。 |
| 本地、staging、production 是否分 namespace？ | 误写生产 KV 很难靠一致性模型救回来。 | 同 binding name，不同环境绑定不同 namespace。 |
| 大值、二进制和附件放哪里？ | KV value 最大 25 MiB，且不是对象存储。 | R2 放文件，KV 只放配置、索引、manifest 或缓存。 |

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

## 计费证据怎么看

KV 计费最容易误判的地方，是把“一次调用”误当成“一次计费”。官方 pricing 页的口径是：读、写、删、list 都会计量；bulk read 在 Worker 外部操作数上算一次，但计费仍按读取的 key 数计算。

| 动作 | 计费用量 | 实践判断 |
| --- | --- | --- |
| `get("a")` | 1 次 read。 | missing key 返回 `null` 也会计 read。 |
| `get(["a", "b", ...])` | 按读到的 key 数计 read。 | 它减少 Worker 外部操作数，不等于免费批量读。 |
| `put()` | 每个 key 计 1 次 write。 | REST bulk update 5,000 个 key，就是 5,000 次 write。 |
| `delete()` | 每个 key 计 1 次 delete。 | 删除不存在的 key 成功返回，但操作仍然经过 KV。 |
| key 自动过期 | 不按 delete 操作计费。 | 临时缓存优先用 `expirationTtl`，不要写额外清理任务。 |
| `list()` | 每次 list 计 1 次 list request。 | 用户请求路径不要扫 namespace。 |
| Dashboard / Wrangler | 也计入对应读写删列。 | 手动排查和批量迁移也要算入免费额度。 |

线上排查看三层：

1. 单条路径：统计一次请求里读了多少 key、写了多少 key、是否调用 `list()`。
2. Namespace 整体：Dashboard 的 KV Metrics 看 operations、storage 和 latency。
3. 历史趋势：GraphQL Analytics API 的 `kvOperationsAdaptiveGroups` 和 `kvStorageAdaptiveGroups` 看 31 天内变化。

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

API 容易误解的点：

| 细节 | 判断 |
| --- | --- |
| bulk read | 最多 100 个 key；对 Worker invocation 的外部操作数算 1 次，但计费按 key 数。 |
| bulk read 类型 | 多 key `get()` / `getWithMetadata()` 只支持 `text` 和 `json`，不支持 `arrayBuffer` / `stream`。 |
| response size | 多 key 返回总响应超过 25 MB 会失败。 |
| `cacheTtl` | 最小 30 秒，默认 60 秒；会缓存存在值和不存在值。 |
| `expirationTtl` | 最小 60 秒；它决定 key 删除时间，不等于读取缓存时间。 |
| `metadata` | 序列化后最大 1,024 bytes；小展示字段可以放 metadata，减少 `list()` 后逐个 `get()`。 |
| `delete()` | 删除不存在的 key 也成功；删除传播仍然需要时间。 |
| REST API | 可以不用 Worker 访问 KV，但性能和 rate limit 与 binding API 不同。 |

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

## 环境和本地开发

KV 绑定名不需要等于 namespace 名，但必须是有效的 JavaScript 标识符。为了让代码简单，推荐所有环境使用同一个 binding name，分别指向不同 namespace。

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "kv_namespaces": [
    {
      "binding": "CONFIG",
      "id": "<staging_namespace_id>"
    }
  ],
  "env": {
    "production": {
      "kv_namespaces": [
        {
          "binding": "CONFIG",
          "id": "<production_namespace_id>"
        }
      ]
    }
  }
}
```

本地开发要特别注意：`wrangler dev` 默认使用本地 KV，读不到远端线上数据。需要排查远端 namespace 时，再显式使用 `--remote` 或 remote binding；不要把远端 KV 当本地测试沙盒。

| 场景 | 推荐做法 |
| --- | --- |
| 本地开发 | 默认本地 KV，手动准备 seed 数据。 |
| Staging | 独立 namespace，允许真实联调。 |
| Production | 独立 namespace，只由生产 Worker 和受控后台写入。 |
| 批量导入 | 用 Wrangler / REST API，先小批量验证，再导入完整数据。 |
| 生产排查 | 优先 `--namespace-id` 明确目标，避免 binding name / env 选错。 |

## 观测和事件

KV 的 Dashboard Metrics 来自 GraphQL Analytics API。普通项目先看这几个信号：

| 信号 | 看哪里 | 判断 |
| --- | --- | --- |
| 读额度增长快 | `kvOperationsAdaptiveGroups` 按 `actionType=read`。 | 页面散 key、missing key 或缓存命中设计不合理。 |
| `list()` 增长快 | Dashboard / GraphQL 的 list operations。 | 用户请求路径可能在扫 namespace。 |
| 写入报 429 | Worker 日志和错误消息。 | 同一个 key 超过 1 write/second。 |
| 冷读慢 | read latency quantiles。 | 热点不足、key 太分散，或 `cacheTtl` 太短。 |
| 存储增长 | `kvStorageAdaptiveGroups` 的 keyCount / byteCount。 | 临时缓存缺少过期时间，或大对象误进 KV。 |

KV 也支持 Event subscriptions，把 namespace created / deleted 这类事件投递到 Queues。它适合做治理、审计和自动化，不是监听每个 key 更新的实时变更流。

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
| 以为 bulk read 可以降低 KV 计费。 | bulk read 降低外部操作数，但计费仍按 key 数。 |
| 用 `list()` 生成用户页面。 | 预生成索引 key，或用 D1 做查询和分页。 |
| 把 key 自动过期当作实时删除通知。 | 过期后读起来像不存在，但不是事件流，也不保证前端实时感知。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs KV source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/kv) | 官方 KV 文档源文件，适合追踪 API、limits、pricing、observability、event subscriptions 和 Wrangler 命令变化。 |
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
- [Metrics and analytics](https://developers.cloudflare.com/kv/observability/metrics-analytics/)
- [Environments](https://developers.cloudflare.com/kv/reference/environments/)
- [Data security](https://developers.cloudflare.com/kv/reference/data-security/)
- [KV FAQ](https://developers.cloudflare.com/kv/reference/faq/)
- [Wrangler KV commands](https://developers.cloudflare.com/kv/reference/kv-commands/)
- [KV Event subscriptions](https://developers.cloudflare.com/kv/platform/event-subscriptions/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
