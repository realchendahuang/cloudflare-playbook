---
title: 静态内容站
description: 用 Cloudflare Pages 或 Workers Static Assets 部署文档站、官网和博客的架构模式。
---

最后核对日期：2026-06-17。

静态内容站是普通人最容易从 Cloudflare 获益的场景。文档站、官网、博客和作品集都适合从 Pages 或 [Workers Static Assets](/platform/static-assets/) 起步：纯静态和 PR 预览偏 Pages，静态站 + API / D1 / R2 / AI 偏 Workers Static Assets。

## 架构

```text
GitHub / 本地构建
  │
  ├─ Pages Build
  │   └─ 全球静态资源分发
  │
  └─ Wrangler deploy
      └─ Workers Static Assets
          └─ Worker API / D1 / R2 / KV
```

Cloudflare 官方 Use cases 现在把前端部署重点放在 Workers：Git 集成、Preview deployments、300+ edge locations、静态资源和 API routes 可以在同一次部署里工作。本站仍保留 Pages 选项，是因为 Pages 的 Git 工作流和 PR 预览对纯静态站很顺手；一旦项目需要同仓库 Worker API，Workers Static Assets 更适合作为长期真源。

## 产品组合

| 场景 | 推荐组合 | 判断 |
| --- | --- | --- |
| 纯文档站、官网、博客 | Pages 或 Workers Static Assets + Cache / CDN | 先把构建、部署、域名和缓存跑通。 |
| 文档站 + 搜索 | 静态搜索先用 Pagefind；内容量上来再看 AI Search / Vectorize | 不要一开始就自建向量管道。 |
| 内容站 + 评论 / 表单 | Workers Static Assets + Worker API + D1 / Queues | 写入口放 Worker，静态阅读路径继续轻。 |
| 文件下载、附件、图片源文件 | Workers Static Assets + R2 | R2 存对象，Worker 管权限和签名。 |

## 最小实践

- 使用静态站点生成器，例如 Astro、Starlight、VitePress、Docusaurus。
- 构建产物输出到 `dist`、`build` 或框架指定目录。
- 纯静态站可以通过 Pages 连接 Git 仓库，获得自动部署和 PR 预览。
- 需要统一接 Worker 能力时，在 `wrangler.jsonc` 配置 `assets.directory` 并用 Wrangler 部署。
- 如果使用 Workers Static Assets，请明确哪些路径直接命中静态文件，哪些路径需要 `run_worker_first` 或 Worker API。
- SPA 使用 `not_found_handling = "single-page-application"`；静态生成站优先提供真实 `404.html`。

## 风险

- 图片和附件过多时，要关注 Pages 文件数量和单文件大小限制。
- 需要动态接口时，不要把静态站强行改复杂，优先补 Pages Functions 或 Workers Static Assets + Worker API。
- 不要让所有请求先经过 Worker；能直接由静态资源命中的路径，就让 Cloudflare 直接服务和缓存。
- 评论、表单、搜索提交这类写入口，要单独加 WAF / Rate Limiting / Turnstile，而不是保护整站阅读路径。

## 验证方式

| 检查 | 怎么看 |
| --- | --- |
| 静态资源是否上线 | 访问首页、随机文章、`404.html`、CSS / JS / 图片路径。 |
| 搜索是否可用 | 构建后检查 Pagefind 索引文件，线上搜索关键字能命中文章。 |
| API 是否只在必要路径执行 | 给 `/api/*` 和普通文章各发一次请求，观察 Worker logs 或响应头。 |
| 缓存是否合理 | 静态 hash 资源长缓存，HTML 保持可更新。 |

## 官方资料

- [Deploy frontend applications](https://developers.cloudflare.com/use-cases/web-apps/deploy-frontend/)
- [Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Static Assets routing](https://developers.cloudflare.com/workers/static-assets/routing/)
- [Static Assets SPA routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Static Assets SSG and custom 404](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
- [Workers Static Assets source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workers/static-assets)
