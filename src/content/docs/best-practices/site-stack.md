---
title: 本站技术栈
description: Cloudflare Playbook 当前阶段使用的文档、搜索、评论、主题和部署组合。
---

这个仓库当前使用：

```text
Astro + Starlight
  ├─ Markdown / MDX 写内容
  ├─ Pagefind 做站内搜索
  ├─ Starlight Theme Next 做主题
  ├─ Twikoo 做评论
  └─ 生成 dist 静态资产

Cloudflare Worker
  ├─ Workers Static Assets 托管 dist
  ├─ Twikoo Cloudflare Worker 承载评论服务
  └─ Wrangler 管理部署配置

Cloudflare D1
  └─ 保存 Twikoo 评论数据
```

## 为什么这是当前最优解

| 需求 | 推荐方案 | 理由 |
| --- | --- | --- |
| 写 Cloudflare 最佳实践文档 | Astro + Starlight | 文档结构、侧边栏、搜索、SEO 都现成，Markdown 对开源协作友好。 |
| 普通关键词搜索 | Starlight 默认 Pagefind | Starlight 默认内置 Pagefind，全静态、低带宽，不占 Worker API 请求。 |
| 主题 | Starlight Theme Next + Cloudflare 主题变量 | 复用成熟 Starlight 主题，整体更接近工程产品文档；只通过主题变量收敛品牌色。 |
| 评论功能 | Twikoo + twikoo-cloudflare | 前端评论组件成熟，后端托管在 Cloudflare Workers，数据进入 D1。 |
| 统一部署 | Workers Static Assets | 静态页面可以在 Worker 项目里统一部署，配置集中在 `wrangler.jsonc`。 |
| 后续自然语言搜索 | Cloudflare AI Search | 等内容量变大后再加，适合知识库搜索、混合检索和 Agent 使用。 |

## 为什么不是 VuePress

VuePress 可以部署到 Cloudflare，但它更像“文档生成器”。如果只是写教程，它没问题；但你现在想把仓库做成 Cloudflare 最佳实践样板，并且要放搜索、评论、后续 AI 搜索，那 Worker-first 的架构更贴合主题。

## 为什么不是纯 Cloudflare Pages

Cloudflare Pages 很适合纯静态站。这个项目更希望把 Cloudflare Worker 作为部署真源，后续如果加 AI Search、R2 附件或其它 Worker 能力，可以继续沿用同一套部署模型。Cloudflare 官方文档也说明静态资源可以作为 Worker 的一部分上传，并由 Cloudflare 缓存和服务。

## 搜索分层

第一阶段只用 Pagefind：

- 构建时生成索引。
- 读者搜索时在浏览器里查本地索引。
- 不需要数据库，不需要额外 API，也没有额外后端成本。

第二阶段再加 AI Search：

- 当内容足够多，读者开始问“我应该用 D1 还是 KV？”这种自然语言问题。
- 当需要混合搜索、结果过滤、站点持续索引、Agent 工具调用。
- 当愿意接受一个额外 Cloudflare 产品的配置和成本边界。

## 评论系统

当前评论使用 Twikoo：

- 评论前端来自 `twikoo` 官方包。
- 评论后端复用 `twikoo-cloudflare`，作为单独 Worker 部署。
- 评论数据存储在 Cloudflare D1。
- 页面和评论通过规范化后的路径关联，便于每篇文档拥有独立讨论区。

如果后续评论量明显增加，再补 Turnstile、邮件通知和更细的管理策略。

## 当前仓库落地

| 文件 | 职责 |
| --- | --- |
| `astro.config.mjs` | Starlight 站点配置、导航、全站注入评论资源。 |
| `wrangler.jsonc` | 文档站 Worker、静态资产、域名和可观测性的部署配置。 |
| `wrangler.comments.jsonc` | Twikoo 评论 Worker、D1 和评论域名配置。 |
| `src/worker.ts` | 将请求交给 Cloudflare Static Assets。 |
| `src/components/TwikooFooter.astro` | 在 Starlight 页脚接入 Twikoo 官方组件。 |
| `comments-worker/src/index.js` | 复用 `twikoo-cloudflare` 的 Worker 入口。 |
| `comments-worker/schema.sql` | Twikoo Cloudflare 版需要的 D1 表结构。 |
| `starlight-theme-next` | 站点主题。 |
| `src/styles/cloudflare-theme.css` | Cloudflare 橙色主题变量。 |
| `twikoo` | 文档评论组件。 |
| `twikoo-cloudflare` | Cloudflare 上的评论服务适配。 |

## 资料来源

- [Starlight Site Search](https://starlight.astro.build/guides/site-search/)
- [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare AI Search](https://developers.cloudflare.com/ai-search/)
- [Cloudflare Workers Templates](https://github.com/cloudflare/templates)
- [Starlight Theme Next](https://starlight-theme-next.trueberryless.org/)
- [Twikoo](https://twikoo.js.org/)
- [twikoo-cloudflare](https://github.com/twikoojs/twikoo-cloudflare)
