---
title: Pages
description: Cloudflare Pages 的定位、免费边界、Git 部署、Pages Functions、路由规则、限制和与 Workers Static Assets 的取舍。
---

最后核对日期：2026-06-17。

Cloudflare Pages 是 Cloudflare 面向前端和内容项目的 JAMstack 部署平台。它最擅长把 Git 仓库里的静态站、前端应用、文档站和带少量动态接口的项目，自动构建并发布到 Cloudflare 全球网络。

Pages 的核心优势不是“比 Workers 更强”，而是协作流程更顺：连接 GitHub / GitLab 后，每次 push 自动构建，Pull Request 自动生成预览链接，构建状态回写到仓库。对开源文档站、官网、博客、活动页和纯前端应用来说，这个体验很省心。

但如果项目已经天然需要 Worker API、D1、R2、KV、Durable Objects、Queues 或 AI，优先评估 [Workers Static Assets](/platform/static-assets/)。两者都能免费服务静态资产，差别主要在部署真源、动态能力和后续复杂度。

## 一句话判断

| 场景 | 是否优先用 Pages | 判断 |
| --- | --- | --- |
| 开源文档站、官网、博客、作品集 | 是 | Git 集成和预览部署很适合内容协作。 |
| 前端应用需要 PR 预览链接 | 是 | 每个分支 / PR 都能有独立预览地址。 |
| 纯静态站，不需要 Worker 绑定 | 是 | 静态请求免费且不限量，配置简单。 |
| 只有少量表单、Webhook、轻 API | 可以 | Pages Functions 足够承载小型动态逻辑。 |
| 静态站 + 大量 Worker API / D1 / R2 / AI | 不优先 | 直接用 [Workers Static Assets](/platform/static-assets/) 更集中。 |
| 需要 WebSocket、Cron、复杂路由或多 Worker 编排 | 不优先 | Workers 是更自然的入口。 |
| 用户上传文件和大附件 | 否 | 文件进入 R2，Pages 只放构建产物。 |
| 想从 Git 部署切换到 Direct Upload 或反向切换 | 谨慎 | 官方文档说明项目创建后不能直接互相切换，通常要新建项目。 |

## 运行模型

```text
GitHub / GitLab
  │ push / pull request
  ▼
Cloudflare Pages Build
  │
  ├─ 静态资产
  │    └─ HTML / CSS / JS / 图片 / 字体
  │
  └─ Pages Functions
       └─ /functions 目录里的动态路由
            │
            ├─ D1 / KV / R2 / Queues / AI 等绑定
            └─ Workers runtime
```

如果项目没有 Functions，Pages 主要就是静态资源托管。加上 Functions 后，它会使用 Workers runtime 执行动态逻辑。这个边界很重要：静态资产请求免费且不限量，Functions 请求按 Workers 计划计入额度。

## 免费与付费边界

Pages 的静态资产请求在 Free 和 Paid 上都是免费且不限量。真正需要关注的是构建、部署、文件数量、单文件大小、custom domain 和 Functions 请求。

| 能力 | Free | Paid / 更高计划 | 实践判断 |
| --- | ---: | ---: | --- |
| 静态资产请求 | 免费且不限量 | 免费且不限量 | 文档站和官网主流量不要触发 Functions。 |
| Pages Functions 请求 | 计入 Workers Free 100,000 requests/day | 计入 Workers Paid / Standard 用量 | Functions、Workers 共享同一个 Workers 请求池。 |
| 构建 / 部署次数 | 500 builds/month | 5,000 builds/month 起 | 高频 CI 要避免无意义 push 构建。 |
| 并发构建 | 1 | 5 起 | 大团队或 monorepo 才容易撞到。 |
| 单次构建时长 | 20 minutes | 20 minutes | 文档站构建慢时先优化依赖和图片。 |
| 自定义域名 / project | 100 | 250 / 500 / Enterprise 500 起 | 普通项目很够，多租户不要拿 Pages custom domain 硬扛。 |
| 文件数 / site | 20,000 | 100,000 起 | 大量图片、索引碎片和附件要注意；超大文件放 R2。 |
| 单文件大小 | 25 MiB | 25 MiB | 大包、视频、下载文件不要进构建产物。 |
| `_headers` rules | 100 | 100 | 复杂 header 用 Functions 或 Cloudflare Rules。 |
| `_redirects` 总数 | 2,100 | 2,100 | 大规模迁移规则用 Bulk Redirects。 |
| `_routes.json` 规则 | 100 | 100 | 用来控制哪些路径触发 Functions，规则要保持简单。 |
| 预览部署 | 不限 active preview deployments | 不限 active preview deployments | 适合开源协作，但预览地址默认公开。 |
| 项目数 / account | soft limit 100 | soft limit 100 | 不是硬产品架构边界，但别把每个临时 demo 都长期保留。 |

Paid 计划的 100,000 文件数需要在 Pages 项目设置里启用 `PAGES_WRANGLER_MAJOR_VERSION=4`。这类细节很容易变化，上线前要回到官方 limits 页核对。

## 和 Workers Static Assets 怎么选

| 问题 | Pages | Workers Static Assets |
| --- | --- | --- |
| 部署真源 | Git / Dashboard / Pages 项目设置。 | `wrangler.jsonc` 和 Worker 项目。 |
| 预览部署 | 内置 PR 和分支预览。 | 需要自己用环境、版本或 CI 组织。 |
| 静态请求成本 | 免费且不限量。 | 免费且不限量。 |
| 动态 API | Pages Functions，文件路由模型。 | Worker 原生 `fetch()` 路由模型。 |
| 绑定复杂度 | 适合少量 D1/KV/R2/AI 绑定。 | 更适合多个 Worker 能力组合。 |
| 迁移方向 | 动态能力变复杂后迁到 Workers。 | 从一开始就 Worker-first。 |

简单判断：内容协作优先 Pages，平台能力优先 Workers Static Assets。

## 部署方式

Pages 有两条主线：Git Integration 和 Direct Upload。

| 方式 | 适合场景 | 注意 |
| --- | --- | --- |
| Git Integration | 开源项目、团队协作、PR 预览、自动构建。 | 连接 Git 后不能直接切到 Direct Upload；可关闭自动部署后用 Wrangler 手动部署。 |
| Direct Upload | 自己有 CI、想本地构建后上传、没有 Git 自动构建需求。 | Direct Upload 项目不能直接切到 Git Integration，通常要新建项目。 |

推荐普通项目先用 Git Integration。只有当你已经有成熟 CI，或者构建必须在自己的环境里完成，再用 Direct Upload。

## 推荐配置

纯静态 Astro / Starlight / VitePress / Docusaurus 项目最小配置通常是：

```text
Build command: pnpm build
Build output directory: dist
```

如果使用 `wrangler.jsonc` 管理 Pages 项目，可以这样写：

```jsonc
{
	"$schema": "./node_modules/wrangler/config-schema.json",
	"name": "my-pages-project",
	// Pages 使用 pages_build_output_dir 指向构建产物目录。
	"pages_build_output_dir": "./dist",
	// compatibility_date 影响 Pages Functions 的 Workers runtime 行为。
	"compatibility_date": "2026-06-17",
	// nodejs_compat 只在依赖确实需要 Node.js 兼容 API 时开启。
	"compatibility_flags": ["nodejs_compat"],
	"vars": {
		// 非敏感配置可以放 vars，密钥要用 wrangler pages secret put。
		"ENVIRONMENT": "production"
	},
	"env": {
		"preview": {
			"vars": {
				// preview 环境可以指向预览 API 或测试数据。
				"ENVIRONMENT": "preview"
			}
		}
	}
}
```

如果要接 D1、KV、R2、Queues、AI 等绑定，可以在 Pages 项目配置里声明；但绑定越来越多时，就要重新评估是否应该迁到 Workers Static Assets。

## Pages Functions

Pages Functions 用 `/functions` 目录做文件路由。它适合处理表单提交、Webhook、轻 API、鉴权中间件和少量服务端逻辑。

```text
functions/index.ts              -> /
functions/api/todos.ts          -> /api/todos
functions/api/todos/[id].ts     -> /api/todos/:id
functions/api/files/[[path]].ts -> /api/files/*
functions/_middleware.ts        -> 全站中间件
functions/api/_middleware.ts    -> /api/* 中间件
```

一个最小 API 可以这样写：

```ts
interface Env {
	DB: D1Database;
}

// onRequestGet 只处理 GET 请求，用 D1 查询公开列表。
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
	const { results } = await env.DB.prepare(
		'SELECT id, title, created_at FROM posts ORDER BY created_at DESC LIMIT 20',
	).all();

	return Response.json({ posts: results });
};

// onRequestPost 处理用户提交，真实项目里要在这里做输入校验和 Turnstile 校验。
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
	const body = (await request.json()) as { title: string };

	const result = await env.DB.prepare(
		'INSERT INTO posts (title) VALUES (?) RETURNING id',
	)
		.bind(body.title)
		.first();

	return Response.json({ id: result?.id }, { status: 201 });
};
```

中间件可以共享 `context.data`，也可以统一设置响应头：

```ts
// onRequest 中间件先执行下游函数，再补充统一 header。
export const onRequest: PagesFunction = async (context) => {
	const response = await context.next();

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	return response;
};
```

## `_routes.json` 很关键

加上 Functions 后，如果不控制路由，静态请求也可能触发 Functions。官方文档建议用 `_routes.json` 控制哪些路径会进入 Functions，避免把静态访问错误计入 Functions 请求。

```json
{
	"version": 1,
	"include": [
		"/api/*"
	],
	"exclude": [
		"/assets/*",
		"/*.css",
		"/*.js",
		"/*.png",
		"/*.jpg",
		"/*.svg"
	]
}
```

规则要记住三点：

- 至少要有一条 `include`。
- `include` 和 `exclude` 合计最多 100 条。
- `exclude` 优先级高于 `include`。

如果 Workers Free 计划下 Pages Functions 请求耗尽，Pages 可以配置 fail open / fail closed。鉴权、后台、付费内容这类关键路径不要随便 fail open；纯内容站可以倾向保留静态访问。

## Advanced Mode

Advanced Mode 会让 `_worker.js` 接管所有请求。它更接近 Worker 的写法，但代价是你必须自己把静态资产交回 `env.ASSETS.fetch()`。

```js
export default {
	// fetch 接管所有请求；只有 API 路径执行动态逻辑，其余请求返回 Pages 静态资产。
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname.startsWith('/api/')) {
			return Response.json({ ok: true });
		}

		// 忘记这一行会导致静态页面和资源无法正确返回。
		return env.ASSETS.fetch(request);
	},
};
```

普通项目不建议一开始就用 Advanced Mode。只有当文件路由无法表达需求，例如需要复杂路由、WebSocket 或更接近 Workers 的入口控制时，再考虑它。

## 静态服务行为

Pages 对静态页面有一些默认行为：

| 行为 | 说明 | 实践判断 |
| --- | --- | --- |
| HTML 路由 | `/contact.html` 会重定向到 `/contact`，`/about/index.html` 会重定向到 `/about/`。 | 文档站要保持链接统一，避免重复 URL。 |
| 404 | 如果存在 `404.html`，Pages 会寻找最近的 404 页面。 | 静态站应提供自定义 404。 |
| SPA fallback | 没有 404 时，SPA 可以回退到 `index.html`。 | SPA 可以用，文档站通常不要。 |
| 压缩 | Pages 会尽可能返回 Gzip / Brotli。 | 不需要在项目里重复压缩产物。 |
| 缓存 | 资产在每个数据中心缓存，缓存 TTL 可以是一周，但新部署后旧资产仍可能短暂存在。 | HTML 保持可更新，hash 静态资源长缓存。 |
| 默认 header | Pages 会自动添加 `ETag`、`Content-Type`、`X-Content-Type-Options` 等 header。 | 自定义安全 header 用 `_headers` 或 Functions 响应。 |

## Headers 和 Redirects

Pages 支持 `_headers` 和 `_redirects` 文件。它们通常放在 `public/` 或最终构建输出目录里。

| 文件 | 用途 | 注意 |
| --- | --- | --- |
| `_headers` | 给静态资产响应添加或覆盖 header。 | 不作用于 Pages Functions 返回的响应。 |
| `_redirects` | 配置静态重定向、占位符、splat 和有限 proxy。 | 不作用于 Functions 已接管的路径。 |

`_redirects` 的限制是 2,000 条静态重定向 + 100 条动态重定向，总计 2,100 条；超过时应该用 Bulk Redirects。Redirects 会先于 headers 匹配。

## 自定义域名和预览

Pages 每个项目都有 `*.pages.dev` 域名，也可以绑定自定义域名。

| 能力 | 实践建议 |
| --- | --- |
| Apex domain | 根域名要在同一个 Cloudflare 账号里作为 zone 接入。 |
| Subdomain | 可以通过 CNAME 指向 `<project>.pages.dev`，但仍要在 Pages 项目里添加 custom domain。 |
| Preview deployments | PR / 分支预览默认公开，可以用 Cloudflare Access 保护预览部署。 |
| `*.pages.dev` | 生产站建议把用户入口统一到自定义域名；必要时限制或重定向 pages.dev。 |

## 适合的组合

| 目标 | 推荐组合 |
| --- | --- |
| 开源文档站 | Pages + Astro / Starlight + Pagefind + Web Analytics。 |
| 官网 / 营销页 | Pages + Git preview + `_headers` + Web Analytics。 |
| 表单站点 | Pages + Pages Functions + Turnstile + D1 / Queues。 |
| 小型前端应用 | Pages + Vite / SvelteKit / Astro + 少量 Functions。 |
| PR 预览环境 | Pages preview deployments + Access。 |
| 静态站后续变 full-stack | 先 Pages，复杂后迁到 [Workers Static Assets](/platform/static-assets/)。 |

## 不要这样用

| 误区 | 更好的做法 |
| --- | --- |
| 加了 Functions 却不写 `_routes.json`。 | 只让 `/api/*` 等动态路径进入 Functions。 |
| 把用户上传和大附件塞进 Pages 构建产物。 | 用户文件进 R2，Pages 只放部署产物。 |
| 用 Pages Functions 承担复杂 Worker 编排。 | API、队列、DO、AI 组合变多时迁到 Workers。 |
| 以为 `_headers` 会影响 Functions 响应。 | Functions 响应要在代码里设置 header。 |
| 以为 Direct Upload 和 Git Integration 可以随便切。 | 项目创建前选清楚，切换通常要新建项目。 |
| 预览部署放敏感内容但保持公开。 | 用 Cloudflare Access 保护预览部署。 |
| 频繁构建大站而不关注部署次数和构建时间。 | 减少无意义构建，图片和大文件放 R2 / Images。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs Pages source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/pages) | 官方 Pages 文档源文件，适合追踪限制、Functions 和配置变更。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Pages Functions 构建、Direct Upload 和本地 dev 的实现来源。 |
| [cloudflare/workers-sdk pages-template-worker](https://github.com/cloudflare/workers-sdk/blob/main/packages/wrangler/templates/pages-template-worker.ts) | Pages Functions 运行包装逻辑，适合理解 `EventContext`、`waitUntil` 和 fail open。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | Cloudflare 官方模板集合；新 full-stack 项目可以优先参考 Workers 模板。 |
| [withastro/adapters Cloudflare](https://github.com/withastro/adapters/tree/main/packages/cloudflare) | Astro 部署到 Cloudflare 的适配器源码，适合内容站和 SSR 项目参考。 |
| [sveltejs/kit adapter-cloudflare](https://github.com/sveltejs/kit/tree/main/packages/adapter-cloudflare) | SvelteKit 部署到 Cloudflare 的官方适配器源码。 |

## 本项目怎么取舍

本项目是 Astro + Starlight 文档站，理论上非常适合 Pages。但这个仓库的主题是 Cloudflare 最佳实践，后续还会继续接 Worker API、评论、搜索和更多 Cloudflare 绑定，所以当前采用 [Workers Static Assets](/platform/static-assets/) 部署。

换句话说：Pages 是普通内容协作项目的好起点；本站选择 Worker-first，是为了让仓库本身也成为 Cloudflare 开发者平台的实践样板。

## 事实来源

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [Pages Functions Pricing](https://developers.cloudflare.com/pages/functions/pricing/)
- [Pages Functions Routing](https://developers.cloudflare.com/pages/functions/routing/)
- [Pages Advanced Mode](https://developers.cloudflare.com/pages/functions/advanced-mode/)
- [Pages Git Integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Pages Preview Deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [Pages Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Pages Custom Domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Pages Known Issues](https://developers.cloudflare.com/pages/platform/known-issues/)
- [Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
