---
title: Workers
description: Cloudflare Workers 的运行模型、免费额度、付费边界、配置习惯和开源参考。
---

最后核对日期：2026-06-17。

Workers 是 Cloudflare 开发者平台的核心计算层。它适合写边缘 API、Webhook、代理、鉴权中间层、轻量后端，以及和 D1、KV、R2、Queues、Durable Objects、AI Gateway 等产品组合起来的小型应用。

对普通项目来说，Workers 最重要的不是“能不能跑 JavaScript”，而是三件事：

1. 静态资产默认不消耗 Worker 请求。
2. 动态逻辑按请求数和 CPU 计费。
3. 运行时不是传统 Node.js 服务器，要按 isolate、绑定、流式处理和短请求模型思考。

## 一句话判断

| 场景 | 是否优先用 Workers | 判断 |
| --- | --- | --- |
| 文档站、官网、博客 | 是，但优先走 [Static Assets](/platform/static-assets/) | 静态页面交给资产服务，只有评论、搜索 API、表单、Webhook 进入 Worker。 |
| 小型 API / Webhook | 是 | `fetch(request, env, ctx)` 模型足够轻，绑定 D1/R2/KV/Queues 很顺。 |
| API 网关和边缘代理 | 是 | 适合做鉴权、header 改写、缓存、限流、请求转发。 |
| 长时间 CPU 计算 | 谨慎 | Paid 单次 CPU 可到 5 分钟，但成本和限制要单独估算。 |
| 大文件上传下载 | 只做入口控制 | 文件本体进 R2，Worker 负责鉴权、签名、元数据和流式转发。 |
| 强一致房间状态 | Workers + Durable Objects | Worker 负责入口，房间状态放 Durable Objects。 |
| 传统后台常驻进程 | 不优先 | 需要常驻进程、系统调用或复杂本地依赖时，再看 Containers 或外部服务。 |

## 二次精读结论

Workers 不是一台“小服务器”，而是一层请求级运行时。把它用好，关键不是把所有逻辑都塞进去，而是把入口、状态、文件、异步任务和内部服务拆到正确位置。

| 维度 | 结论 | 普通项目怎么落地 |
| --- | --- | --- |
| 成本 | 静态资产请求免费且不限量；动态 Worker 才看请求、CPU、日志和绑定产品用量。 | 文档、官网、前端资源先走 Static Assets；`/api/*` 才进 Worker。 |
| 状态 | isolate 可能复用，也可能被回收；全局变量不能保存用户态业务数据。 | 用户、评论、订单进 D1；强一致房间进 Durable Objects；缓存和配置进 KV。 |
| 生命周期 | HTTP 请求没有固定 wall time 上限，但客户端断开或响应结束后任务可能被取消。 | 响应依赖的工作必须 `await`；响应后短任务才用 `ctx.waitUntil()`。 |
| 后台任务 | `waitUntil()` 最多适合 30 秒内的收尾工作，不是任务队列。 | 邮件、通知、导入、批处理进 Queues 或 Workflows。 |
| 拆服务 | Service Bindings 可以 Worker-to-Worker 内部调用，不走公网 URL。 | 认证、AI 代理、评论 API、后台 API 可以拆成内部 Worker。 |
| 兼容性 | `compatibility_date` 决定运行时行为；`nodejs_compat` 只解决部分 Node.js API。 | 新项目用当前日期；升级日期前跑测试；重型 Node 包先验证。 |

## 上线前问题

| 问题 | 为什么要问 | 推荐答案 |
| --- | --- | --- |
| 哪些路径必须进入 Worker？ | 免费额度最容易被全站动态化消耗掉。 | 只让 `/api/*`、`/auth/*`、`/admin/*` 等动态路径进入 Worker。 |
| 单次请求 CPU 大概多少？ | Workers Paid 同时看请求和 CPU，不只看 QPS。 | SSR、Markdown 转换、JSON 大解析、AI 前处理要单独估算。 |
| 会不会一次打开超过 6 个等待响应头的出站连接？ | 每次 invocation 同时等待响应头的连接上限是 6。 | 批量抓取和多上游聚合要分批、缓存或进队列。 |
| 是否有大文件或大 body？ | Worker 内存是 128 MB，缓冲大 body 会出问题。 | 文件进 R2，Worker 尽量流式处理。 |
| 失败时应该 fail open 还是 fail closed？ | Free 请求超过 100,000/day 后 route 会按配置处理。 | 鉴权、后台、付费内容 fail closed；非关键增强逻辑可评估 fail open。 |
| 内部 Worker 怎么互调？ | same-zone route 之间直接 `fetch()` 有限制，公网 URL 也暴露边界。 | 优先 Service Bindings；需要公网入口再用 Custom Domain。 |
| 日志里会不会出现 token、cookie、正文隐私？ | Workers Logs / Logpush 会进入观测链路。 | 只记录 request id、Ray ID、状态、耗时、匿名化用户标识。 |

## 运行模型

Workers 使用 V8 isolate 运行用户代码。它更像“分布在 Cloudflare 网络里的请求处理函数”，不是一台你长期持有的服务器。

```text
用户请求
  │
  ▼
Cloudflare 网络
  │
  ├─ 命中静态资产：直接返回，不进入 Worker 计费
  │
  └─ 进入 Worker：
       ├─ request：本次请求
       ├─ env：D1、KV、R2、Queues、变量、密钥等绑定
       └─ ctx：waitUntil、passThroughOnException 等生命周期能力
```

官方 `fetch()` handler 的核心形态是：

```ts
export default {
	async fetch(request, env, ctx) {
		// request 是本次 HTTP 请求，env 是绑定入口，ctx 用来管理请求生命周期。
		return new Response('Hello World');
	},
};
```

实践上要注意：

- 不要依赖可变全局状态保存业务数据。isolate 可能复用，也可能被回收，任意两个用户请求也不保证落在同一个 isolate。
- 顶层代码会影响启动时间。Workers 的 startup time 限制是 1 秒，大依赖和重初始化要移到构建期或请求内惰性执行。
- 等待外部网络、D1、KV、R2 等 I/O 的时间不算 CPU，但解析大 JSON、加密、大量循环、SSR 渲染会消耗 CPU。
- 大响应和大请求尽量流式处理，不要把完整 body 读进内存。
- 需要返回响应后继续做短任务时用 `ctx.waitUntil()`，但它不是无限后台任务队列。
- `env` 是绑定入口，同一环境下可能被多个请求复用；它适合访问绑定，不适合挂请求级临时状态。

## 免费与付费边界

Workers Free 和 Workers Paid / Standard 的差异，先看最常影响架构的部分：

| 能力 | Workers Free | Workers Paid / Standard | 实践判断 |
| --- | --- | --- | --- |
| Worker 请求 | 100,000 requests/day，UTC 0 点重置。 | 10M requests/month included，超出 $0.30/million。 | 免费足够早期 API；公开 API 要加缓存、限流和监控。 |
| CPU | 10 ms/invocation。 | 30M CPU ms/month included，超出 $0.02/million CPU ms；单次默认 30s，可设到 5min。 | SSR、AI 前处理、批处理要估 CPU；普通代理通常很省。 |
| 静态资产请求 | 免费且不限量。 | 免费且不限量。 | 文档站和前端应用一定要让静态请求留在资产层。 |
| 数据传输 / 带宽 | Workers 价格页说明无额外 data transfer 或 throughput charge。 | 同左。 | 成本主要看请求、CPU、存储和操作次数。 |
| 内存 | 128 MB。 | 128 MB。 | 大文件走流式和 R2，不要在 Worker 内存里拼完整文件。 |
| Subrequests | 50/request。 | 默认 10,000/request，可配置到更高。 | 聚合多个上游 API 时要数清楚；优先并发控制和缓存。 |
| 同时等待响应头的出站连接 | 6/request。 | 6/request。 | 批量抓取不要一次性打爆，分批或进 Queues。 |
| Worker 压缩后大小 | 3 MB。 | 10 MB。 | 控制依赖体积，重型库先评估是否适合边缘运行。 |
| Worker 数量 | 100/account。 | 500/account。 | 个人项目足够；多租户平台看 [Workers for Platforms](/platform/platforms-saas/)。 |
| Cron Triggers | 5/account。 | 250/account。 | 免费阶段只放关键定时任务。 |
| Static Asset 文件数 | 20,000 files/Worker version。 | 100,000 files/Worker version。 | 大量媒体不要进静态包，放 R2/Images/Stream。 |
| Static Asset 单文件 | 25 MiB。 | 25 MiB。 | 文档构建产物没问题；大附件不要塞进站点 bundle。 |

另外，HTTP request body 上限取决于 Cloudflare zone 计划，不取决于 Workers 计划：Free/Pro 为 100 MB，Business 为 200 MB，Enterprise 默认 500 MB。Worker 响应体没有平台强制大小上限，但 CDN 缓存仍有计划限制。

## 容易被低估的限制

这些限制不会每天碰到，但一旦碰到，通常就是线上事故或账单问题。

| 限制 | 当前边界 | 实践判断 |
| --- | --- | --- |
| Daily requests | Free 100,000 requests/day，UTC 0 点重置。 | 超出后返回 Error 1027，route 可配置 fail open / fail closed。 |
| Wall time | HTTP 请求没有硬性 wall time 上限；Cron、Queue Consumer、DO Alarm 为 15 分钟。 | 长连接和流式响应可以跑很久，但客户端断开后未保护任务可能取消。 |
| `waitUntil()` | 响应后或客户端断开后最多延长 30 秒。 | 适合日志、缓存写入、短 webhook；不适合导入、转码、批量抓取。 |
| Memory | 每个 isolate 128 MB。 | 不要把上传文件、R2 对象、上游大响应完整读入内存。 |
| Startup time | 1 秒。 | 大 schema、模型、初始化代码不要放顶层。部署时可用 `wrangler check startup` 排查。 |
| Subrequests | Free 50/request；Paid 默认 10,000/request，可按配置提高。 | R2、KV、D1、Cache API、fetch 都会进入这个心智模型。 |
| 同时等待响应头的连接 | 6/request。 | 多上游聚合要限并发；失败响应不用 body 时及时 cancel。 |
| 环境变量 | Free 64/Worker，Paid 128/Worker，单个 5 KB。 | 配置要收敛；密钥放 secrets，不放 `vars`。 |
| 日志大小 | 单次请求日志数据 256 KB。 | 日志不是数据库；大对象、正文、token 不要写进去。 |
| WebSocket 请求计费 | 建立连接的 Upgrade 算一次请求；消息本身不按请求数计。 | 实时状态放 Durable Objects，并使用 WebSocket Hibernation 控制 duration。 |

## Static Assets

[Workers Static Assets](/platform/static-assets/) 是现在更适合 full-stack 项目的静态托管方式。它把 Worker 代码和静态资源作为一次部署发到 Cloudflare 网络里。

默认路由行为很关键：

```text
请求 URL
  │
  ├─ 匹配静态文件
  │    └─ 直接返回资产，不运行 Worker
  │
  └─ 没匹配到静态文件
       ├─ 有 Worker 脚本：交给 Worker
       └─ 没 Worker 脚本：返回 404
```

`run_worker_first` 可以让部分路径先进入 Worker，但免费计划要谨慎使用。官方文档特别提醒：匹配 `run_worker_first` 的请求一定会调用 Worker，如果超过 Free 请求限制，会返回 429，而不是退回静态资产服务。

普通项目推荐这样分层：

| 路径 | 推荐处理方式 | 原因 |
| --- | --- | --- |
| `/`、`/docs/*`、`/assets/*` | Static Assets | 免费、不限量、缓存友好。 |
| `/api/*` | Worker | API 鉴权、数据访问、业务逻辑集中在这里。 |
| `/uploads/*` | Worker + R2 | Worker 做权限和签名，R2 放文件。 |
| `/admin/*` | Worker + Access 或 Tunnel | 后台入口先保护，再谈业务功能。 |

## 配置习惯

Cloudflare 官方文档已经把 `wrangler.jsonc` 作为新项目推荐配置格式，并建议让 Wrangler 配置成为 Worker 的配置真源。

```jsonc
{
	"$schema": "./node_modules/wrangler/config-schema.json",
	"name": "my-api",
	"main": "src/index.ts",
	"compatibility_date": "2026-06-17",
	"compatibility_flags": ["nodejs_compat"],
	"assets": {
		"directory": "./dist",
		"binding": "ASSETS"
	},
	"limits": {
		// 限制单次调用的 CPU，避免异常流量或死循环把账单打穿。
		"cpu_ms": 30000
	}
}
```

配置层面的最佳实践：

- 新项目优先使用 `wrangler.jsonc`，并提交到 Git。
- 新项目设置当前 `compatibility_date`，老项目定期评估升级。
- 使用需要 Node.js 内置模块的库时启用 `nodejs_compat`。
- 不要手写 `Env` 类型，使用 `wrangler types` 生成类型。
- 生产密钥用 `wrangler secret put` 或 Secrets Store，不放进源码和配置文件。
- staging / production 分环境部署时，绑定不会自动继承，要在每个环境里显式声明。
- Custom Domain 表示 Worker 是 origin；Route 表示 Worker 在已有 origin 前面运行，Route 需要对应 hostname 有橙云代理 DNS 记录。

## Route、Custom Domain 和 Service Bindings

Workers 有三种常见入口，选错会让链路变绕：

| 入口 | 适合场景 | 注意 |
| --- | --- | --- |
| Route | Worker 放在已有源站前面，做鉴权、日志、缓存、改写、代理。 | 需要 zone 内 DNS 记录为 Proxied；同 zone route 之间不能随便互相 `fetch()`。 |
| Custom Domain | Worker 本身就是 origin，所有路径都交给这个 Worker。 | Cloudflare 会自动创建 DNS 记录和证书；同 zone Custom Domain 可以被另一个 Worker `fetch()`。 |
| Service Bindings | 账号内 Worker-to-Worker 内部调用。 | 不走公网 URL，支持 RPC / HTTP；Standard 计费下不会额外增加请求费用。 |

普通项目可以这样拆：

| 模块 | 推荐入口 |
| --- | --- |
| 前端页面和静态资源 | Workers Static Assets |
| 公开 API | Custom Domain 或 Static Assets 同 Worker 的 `/api/*` |
| 认证、评论、AI 代理等内部服务 | Service Bindings |
| 已有源站前的安全层 | Route |

Service Bindings 的生命周期要记住两点：调用方要 `await` 被调用 Worker 的结果，否则被调用方可能提前终止；RPC 返回远程对象时，要按官方生命周期规则释放 stub，复杂对象优先用 `using` 或显式 dispose。

## `ctx.waitUntil()` 怎么用

`ctx.waitUntil()` 只适合“不影响当前响应正确性”的短任务。

| 用法 | 判断 |
| --- | --- |
| 写 analytics、短日志、缓存预热、非关键 webhook | 适合，用 `ctx.waitUntil()`。 |
| 写数据库后再告诉用户成功 | 不适合，必须 `await` 数据库写入。 |
| 发送邮件、批量导入、网页抓取、转码、重试任务 | 不适合，进 Queues / Workflows。 |
| 流式响应还在持续输出 | 不需要靠 `waitUntil()` 保活，响应流本身保持 invocation 活跃。 |

不要把 `ctx.waitUntil` 解构出来调用，官方最佳实践里专门提醒这会丢失绑定并导致 `Illegal invocation`。保持 `ctx.waitUntil(promise)` 的写法。

## 兼容性日期和 Node.js 兼容

Workers 文档里的运行时行为通常按当前 compatibility date 描述。新项目应该使用当前日期，老项目升级前要看 compatibility flags 并跑测试。

| 配置 | 作用 | 实践判断 |
| --- | --- | --- |
| `compatibility_date` | 选择 Workers runtime 的行为版本。 | 新项目设当前日期；老项目按变更批次升级。 |
| `compatibility_flags` | 提前或显式启用特定运行时行为。 | 只启用项目确实需要的 flag。 |
| `nodejs_compat` | 启用 Workers 支持的 Node.js API 和 Wrangler polyfill。 | 需要 compatibility date `2024-09-23` 或更新；不是完整 Node.js 服务器。 |
| `nodejs_als` | 只启用 AsyncLocalStorage。 | 只需要请求上下文追踪时，比完整 `nodejs_compat` 更克制。 |

Node.js 兼容适合解决 `node:crypto`、`node:buffer`、`node:stream` 等常见依赖问题，但 child process、cluster、REPL、部分 UDP / VM 等并不适合 serverless runtime。凡是依赖本地文件系统长期可写、子进程、系统包或常驻 TCP 服务的库，都要先验证，再决定是不是应该去 Containers 或外部服务。

## 代码习惯

Worker 代码要按“短、清楚、可观察、可流式”的方式写。

| 做法 | 为什么 |
| --- | --- |
| 入口只做路由、认证和组合，不把所有逻辑塞进 `fetch()`。 | 后续接 D1、R2、Queues 时更容易测试和维护。 |
| 大 body 用 stream，不随手 `await response.text()`。 | Worker 单 isolate 内存 128 MB，缓冲大数据容易触发内存限制。 |
| 对外部 API 设置超时、缓存和失败路径。 | Worker 很快，但外部服务不一定快。 |
| 日志只记录必要上下文，不记录 token、cookie、隐私数据。 | Workers Logs / Logpush 会进入观测系统，敏感信息泄漏代价高。 |
| 能用 Service Bindings 就不要用公网 URL 调另一个 Worker。 | Worker-to-Worker 调用更清晰，也少暴露内部入口。 |
| 需要强一致状态时把状态放 Durable Objects。 | 普通 Worker 全局变量不是可靠状态存储。 |
| Promise 必须 `await`、`return` 或交给 `ctx.waitUntil()`。 | Floating promise 可能在 isolate 结束时被取消，还可能吞掉错误。 |
| Cloudflare 服务优先用 binding，不从 Worker 里打 REST API。 | R2、KV、D1、Queues、Workflows binding 不需要额外鉴权和公网网络跳转。 |

## 常见架构组合

| 目标 | 组合 |
| --- | --- |
| 低成本文档站 | [Workers Static Assets](/platform/static-assets/) + Pagefind + Web Analytics |
| 有 API 的前端应用 | [Workers Static Assets](/platform/static-assets/) + `/api/*` Worker + D1/KV |
| 评论、表单、留言 | Worker + D1 + Turnstile + Rate Limiting |
| 文件上传 | Worker + R2 + D1 metadata + signed URL |
| Webhook 网关 | Worker + Queues + D1/R2 |
| 实时房间 | Worker + Durable Objects + WebSocket hibernation |
| AI API 代理 | Worker + AI Gateway + KV/D1 缓存 |
| 管理后台 | [Workers Static Assets](/platform/static-assets/) + Cloudflare Access + D1 |

## 不要这样用

| 误区 | 更好的做法 |
| --- | --- |
| 所有访问都先 `run_worker_first`。 | 只让真正需要动态逻辑的路径进入 Worker。 |
| 把 KV 当强一致数据库。 | 用户、订单、评论等关系数据用 D1；强一致对象用 Durable Objects。 |
| 上传文件先读成 ArrayBuffer 再写 R2。 | 尽量流式处理，Worker 只做入口控制和元数据。 |
| 一开始就把 SSR、搜索、评论、AI、后台任务全放进一个 Worker。 | 先按路径和绑定拆清楚，再用 Service Bindings 或 Queues 分离复杂逻辑。 |
| 只看请求数，不看 CPU。 | Workers Paid 同时看请求和 CPU，SSR 与批处理尤其要估算 CPU。 |
| 为了方便把密钥写在 `vars` 或源码里。 | 非敏感配置用 `vars`，密钥用 secrets。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Create Cloudflare、Miniflare、Cloudflare Vite plugin 的真实实现和 issue。 |
| [cloudflare/workerd](https://github.com/cloudflare/workerd) | Workers JavaScript/Wasm runtime 的开源实现，理解 isolate、compatibility date、capability bindings。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | 官方 Workers 模板集合，适合看 Astro、D1、Durable Objects、AI Gateway 等项目脚手架。 |
| [cloudflare/workers-rs](https://github.com/cloudflare/workers-rs) | Rust / WebAssembly 写 Workers 的生态入口。 |
| [cloudflare/workers-oauth-provider](https://github.com/cloudflare/workers-oauth-provider) | 在 Workers 上实现 OAuth 2.1 provider 的库，适合学习 API 鉴权边界。 |

## 后续精读

Workers 只是入口。要把 Cloudflare 开发者平台真正用起来，下一组要继续精读：

1. D1：SQL、索引、迁移、读写额度、Sessions API。
2. KV：最终一致、缓存、读多写少场景。
3. R2：Class A/B 操作、签名上传、公开桶、生命周期。
4. Queues：操作计费、批处理、重试、死信队列。
5. Durable Objects：强一致状态、SQLite-backed storage、WebSocket hibernation。

## 事实来源

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [How Workers works](https://developers.cloudflare.com/workers/reference/how-workers-works/)
- [Fetch Handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/)
- [Context API](https://developers.cloudflare.com/workers/runtime-apis/context/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Compatibility dates](https://developers.cloudflare.com/workers/configuration/compatibility-dates/)
- [Node.js compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)
- [Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [RPC Lifecycle](https://developers.cloudflare.com/workers/runtime-apis/rpc/lifecycle/)
- [Routes](https://developers.cloudflare.com/workers/configuration/routing/routes/)
- [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Static Assets Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [Workers Templates](https://developers.cloudflare.com/workers/get-started/quickstarts/)
