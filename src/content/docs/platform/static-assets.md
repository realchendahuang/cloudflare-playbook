---
title: Workers Static Assets
description: Cloudflare Workers Static Assets 的定位、免费边界、限制、路由模型、Wrangler 配置、Pages 取舍和开源参考。
---

最后核对日期：2026-06-17。

Workers Static Assets 是 Cloudflare Workers 里的静态资源托管能力。你可以把 HTML、CSS、JavaScript、图片、字体、站点构建产物和 Worker 脚本作为一个部署单元上传到 Cloudflare，由 Cloudflare 在全球网络上缓存和服务静态文件。

它最适合“静态页面为主、少量动态 API 为辅”的项目：文档站、官网、SPA、管理后台、小型 full-stack 应用。本站就是这个模型：Astro + Starlight 生成 `dist`，Worker 只负责把静态资产交给 `env.ASSETS`，评论服务和动态能力再用单独 Worker / D1 承载。

## 一句话判断

| 场景 | 是否优先用 Workers Static Assets | 判断 |
| --- | --- | --- |
| 文档站、官网、博客、产品说明页 | 是 | 静态请求免费且不限量，部署模型简单。 |
| SPA + `/api/*` 后端 | 是 | 静态资产直接服务，API 路径再进入 Worker。 |
| Astro / Vite / React / Vue 构建产物 | 是 | `dist`、`build`、`public` 都是天然输入目录。 |
| 需要 D1、R2、KV、DO、Queues、AI 组合 | 是 | 比 Pages 更适合把静态站和 Worker API 放到同一套配置里。 |
| 纯静态站，团队习惯 Git 自动构建 | 可以用 Pages | Pages 更偏 Git 驱动，Workers 更偏代码和配置驱动。 |
| 用户上传文件、图片库、大附件 | 否 | 静态资产是部署产物，用户生成文件应该放 R2。 |
| 视频、超大安装包、频繁替换的大文件 | 否 | 单文件 25 MiB，上 R2 / Stream 更合适。 |
| 需要每次请求都执行 SSR | 不算静态资产场景 | 会进入 Worker 计费，按 Workers 请求和 CPU 模型估算。 |

## 运行模型

```text
构建产物 dist/
  ├─ index.html
  ├─ pagefind/
  ├─ assets/*.js
  ├─ assets/*.css
  └─ _headers
        │
        ▼
wrangler deploy
        │
        ▼
Cloudflare Worker version
  ├─ Worker script
  └─ Static Assets
        │
        ├─ 命中静态文件：直接返回资产
        └─ 命中 Worker 路由：执行 Worker，再按需 env.ASSETS.fetch()
```

官方文档把它描述成 Worker 代码和静态资产一起部署的单元。这个心智模型很重要：静态资产不是 R2 bucket，也不是旧 Workers Sites 的 KV 资产处理器；它是 Worker 版本的一部分。

## 免费与付费边界

Static Assets 的成本模型很友好，但它不是“所有请求都免费”。只有静态资产请求免费；进入 Worker 脚本的请求仍按 Workers 计费。

| 能力 | Free | Workers Paid / Standard | 实践判断 |
| --- | --- | --- | --- |
| 静态资产请求 | 免费且不限量。 | 免费且不限量。 | 文档站、官网、SPA 的主访问流量不要打进 Worker。 |
| 静态资产存储 | 无额外费用。 | 无额外费用。 | 这是部署产物存储，不是用户文件库。 |
| Worker 请求 | 100,000 requests/day。 | 10M requests/month included，超出按 Workers pricing。 | `/api/*`、SSR、`run_worker_first` 命中的请求才算这里。 |
| Worker CPU | Free 单次 10 ms CPU。 | Paid 每月含 30M CPU milliseconds，单次默认 30s。 | 静态页面不要为了加 header 或日志无脑跑 Worker。 |
| 超出 Free Worker 请求 | 返回 429。 | 按 Paid 规则继续计费。 | `run_worker_first` 配太宽会让静态站被 Worker 请求上限拖住。 |

官方 billing 页特别提醒：如果 Free 用户配置了 `run_worker_first`，匹配到的请求会总是进入 Worker；一旦超过 Free 请求限制，这些请求会返回 429，而不是自动回退到静态资产。

## 关键限制

| 限制 | Workers Free | Workers Paid | 实践判断 |
| --- | ---: | ---: | --- |
| Static Asset 文件数 / Worker version | 20,000 | 100,000 | 文档站要关注 Pagefind、图片和构建碎片数量；Paid 提高文件数需要 Wrangler 4.34.0+。 |
| 单个 Static Asset 文件大小 | 25 MiB | 25 MiB | 大文件、视频、压缩包放 R2 / Stream。 |
| `_headers` rules | 100 | 100 | 复杂安全 header 可以在 Worker 代码或 Cloudflare Rules 里管理。 |
| `_headers` 每行字符 | 2,000 | 2,000 | CSP 很容易超长，分清静态响应和 Worker 响应。 |
| `_redirects` 静态重定向 | 2,000 | 2,000 | 大规模跳转用 Bulk Redirects。 |
| `_redirects` 动态重定向 | 100 | 100 | 不要把复杂路由系统塞进 `_redirects`。 |
| `_redirects` 总数 | 2,100 | 2,100 | 迁移老站时要先统计规则数量。 |
| `_redirects` 单条字符 | 1,000 | 1,000 | 复杂匹配改用 Worker 或 Bulk Redirects。 |

## 和 Pages 怎么选

| 问题 | Workers Static Assets | Pages |
| --- | --- | --- |
| 部署方式 | `wrangler deploy`，配置真源在 `wrangler.jsonc`。 | Git 集成和 Pages 项目配置更顺手。 |
| 动态 API | Worker 原生，可直接绑定 D1、R2、KV、DO、Queues、AI。 | Pages Functions 可以做 API，但复杂组合会逐渐接近 Worker。 |
| 静态请求成本 | 静态资产请求免费。 | 静态请求也免费。 |
| 适合项目 | 文档站 + API、小型 full-stack、需要 Worker 生态绑定的项目。 | 纯静态站、营销站、Git 驱动构建流程。 |
| 迁移方向 | 复杂度上来后，从 Pages 迁到 Workers 很自然。 | 初期纯静态可以先 Pages。 |

Cloudflare 官方迁移文档也说明：和 Pages 一样，Workers 上的静态资产请求是免费的；不同点是 Workers 有更完整的开发者平台能力，比如 Durable Objects、Cron Triggers 和更完整的 Observability。

## 配置习惯

最小配置只需要 `assets.directory`。如果 Worker 代码里要访问资产，再加 `binding`。

```jsonc
{
	"$schema": "./node_modules/wrangler/config-schema.json",
	"name": "cloudflare-playbook",
	"main": "./src/worker.ts",
	// compatibility_date 使用近期日期，获得新的 Workers Static Assets 行为。
	"compatibility_date": "2026-06-17",
	"assets": {
		// directory 指向框架构建产物目录。
		"directory": "./dist",
		// binding 让 Worker 代码可以通过 env.ASSETS.fetch() 读取静态资产。
		"binding": "ASSETS",
		// 静态文档站优先返回最近的 404.html，而不是 SPA fallback。
		"not_found_handling": "404-page",
		// 文档页目录用 trailing slash，避免同一页面出现两套 URL。
		"html_handling": "auto-trailing-slash"
	}
}
```

常见配置项：

| 配置 | 用途 | 判断 |
| --- | --- | --- |
| `assets.directory` | 指向静态资产目录。 | 必填，常见值是 `./dist`、`./build`、`./public`。 |
| `assets.binding` | 暴露 `env.ASSETS`。 | Worker 需要转发或读取静态资产时使用。 |
| `assets.not_found_handling` | 控制未命中文件时的行为。 | SPA 用 `single-page-application`，文档站 / SSG 用 `404-page`。 |
| `assets.html_handling` | 控制 HTML 路径和 trailing slash。 | SSG 通常用默认 `auto-trailing-slash`。 |
| `assets.run_worker_first` | 指定哪些请求先进入 Worker。 | 只给 `/api/*`、`/auth/*`、`/admin/*` 等必要路径。 |
| `.assetsignore` | 排除不该上传的文件。 | 可排除源码、map、构建中间文件、Pages 配置文件。 |

## 路由策略

普通项目最省钱的路由是“资产优先，API 再进 Worker”。

```text
请求 /assets/app.js
  └─ 命中静态资产，直接返回，不计 Worker invocation

请求 /api/search
  └─ run_worker_first 命中 /api/*，进入 Worker，按 Workers 计费

请求 /missing-page
  └─ 文档站：返回 404.html
  └─ SPA：返回 /index.html
```

`run_worker_first: true` 很容易把所有静态访问都变成 Worker 请求。除非你真的要每个请求都经过认证、A/B 测试或 SSR，否则更推荐数组模式：

```jsonc
{
	"assets": {
		"directory": "./dist",
		"binding": "ASSETS",
		"run_worker_first": [
			// 只有 API 请求进入 Worker。
			"/api/*",
			// API 文档仍然作为静态页面服务。
			"!/api/docs/*"
		]
	}
}
```

如果 SPA 使用 `not_found_handling: "single-page-application"`，并且 compatibility date 不早于 `2025-04-01`，浏览器导航请求可以优先走静态资产服务，减少不必要的 Worker invocation。

## ASSETS Binding 示例

Worker 只处理动态路径，其他请求交回静态资产。

```ts
interface Env {
	ASSETS: Fetcher;
}

export default {
	// fetch 只处理动态 API，静态页面和资源继续交给 Workers Static Assets。
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname.startsWith('/api/health')) {
			return handleHealth();
		}

		if (url.pathname.startsWith('/api/')) {
			return handleApi(request);
		}

		// 没有命中动态路径时，使用官方 ASSETS binding 返回构建产物。
		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;

// handleHealth 返回最小健康检查响应，方便部署后验证 Worker 活着。
function handleHealth(): Response {
	return Response.json({ ok: true });
}

// handleApi 承载真实 API 入口，示例里只保留边界响应。
function handleApi(request: Request): Response {
	return Response.json(
		{
			method: request.method,
			message: 'API route handled by Worker',
		},
		{
			status: 200,
		},
	);
}
```

`env.ASSETS.fetch()` 可以接收 `Request`、`URL` 或 URL 字符串。官方文档说明，URL 的 hostname 不重要，只有 pathname 用来匹配资产；这在 RPC 方法里没有原始 request 时很有用。

## Headers 和 Redirects

Static Assets 原生支持 `_headers` 和 `_redirects` 文件。它们应该放在最终静态资产目录里，或者放在框架会复制到构建产物的 `public/` 目录中。

| 文件 | 用途 | 注意 |
| --- | --- | --- |
| `_headers` | 给静态资产响应添加、覆盖或移除 headers。 | 不会作用于 Worker 代码生成的响应。 |
| `_redirects` | 配置静态和动态重定向。 | 规则超过 2,100 条时用 Bulk Redirects。 |

本站当前使用 `public/_headers` 管理安全 header。这个选择的前提是：页面主要由 Static Assets 返回；如果未来某些页面改成 Worker SSR，那些响应的 header 要在 Worker 代码里设置。

## 缓存习惯

默认静态资产响应包含 `Content-Type`、`Cache-Control`、`ETag` 和 `CF-Cache-Status` 等 header。官方默认 `Cache-Control: public, max-age=0, must-revalidate` 的目标是保证浏览器不会长期使用过期 HTML，同时借助 ETag 避免重复下载相同内容。

实践上可以这样区分：

| 资源 | 推荐缓存 |
| --- | --- |
| HTML | 短缓存或 revalidate，避免页面内容更新后旧 HTML 长时间残留。 |
| 带 hash 的 JS/CSS | `max-age=31536000, immutable`。 |
| 图片和字体 | 按是否带版本号决定长缓存。 |
| API 响应 | 不靠 `_headers`，在 Worker 代码里显式设置。 |

不要把 `CF-Cache-Status` 当关键业务逻辑依据。它适合排查缓存命中，不适合作为应用判断条件。

## 适合的组合

| 目标 | 推荐组合 |
| --- | --- |
| 文档站 / 知识库 | Astro / Starlight + Workers Static Assets + Pagefind + Web Analytics。 |
| 官网 + 表单 | Workers Static Assets + Worker API + D1 + Turnstile。 |
| SPA 后台 | Vite SPA + Workers Static Assets + Access / Worker 鉴权。 |
| 小型 SaaS | Workers Static Assets + Worker API + D1 + KV + R2。 |
| AI 搜索文档站 | Static Assets + Pagefind 起步，内容规模上来后接 AI Search / Vectorize。 |
| 文件下载 | 页面用 Static Assets，文件本体放 R2，自定义域名和缓存规则处理下载。 |

## 不要这样用

| 误区 | 更好的做法 |
| --- | --- |
| 把用户上传文件放进 Static Assets。 | 用户文件进 R2，部署产物才进 Static Assets。 |
| `run_worker_first: true` 覆盖全站。 | 只让 `/api/*`、`/auth/*` 等动态路径进 Worker。 |
| 把超大文件塞进 `dist`。 | 单文件超过 25 MiB 或下载很多时，用 R2 / Stream。 |
| 以为 `_headers` 会影响 Worker 响应。 | Worker 生成的响应在代码里设置 header。 |
| 用 `_redirects` 承担大型迁移规则。 | 超过规则限制后用 Bulk Redirects。 |
| 把静态站和 API 分散到多个平台。 | 小项目优先同一个 Worker 管理静态资产和 API。 |
| 迁移 Pages 时忘记排除 `_worker.js`。 | 用 `.assetsignore` 排除不该作为客户端资产上传的文件。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/templates](https://github.com/cloudflare/templates) | Cloudflare 官方 Workers 模板集合，适合看 full-stack Workers 项目结构。 |
| [cloudflare/templates/vite-react-template](https://github.com/cloudflare/templates/tree/main/vite-react-template) | Vite + React + Workers Static Assets 模板，适合看 SPA + API 的组合。 |
| [cloudflare/templates/astro-blog-starter-template](https://github.com/cloudflare/templates/tree/main/astro-blog-starter-template) | Astro 内容站模板，适合看静态内容项目如何进入 Workers。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、C3、Vite plugin 和 Static Assets 相关实现与 issue。 |
| [cloudflare/cloudflare-docs Static Assets source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workers/static-assets) | 官方 Static Assets 文档源文件，适合追踪文档变更。 |

## 事实来源

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Configuration and Bindings](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Routing](https://developers.cloudflare.com/workers/static-assets/routing/)
- [Single Page Application routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Static Site Generation and custom 404 pages](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
- [HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)
- [Headers](https://developers.cloudflare.com/workers/static-assets/headers/)
- [Redirects](https://developers.cloudflare.com/workers/static-assets/redirects/)
- [Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
