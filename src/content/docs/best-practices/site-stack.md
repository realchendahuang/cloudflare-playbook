---
title: 本站技术栈
description: Cloudflare Playbook 当前阶段使用的文档、搜索、评论、主题和部署组合。
---

# 本站技术栈

这个仓库当前使用：

```text
Astro + Starlight
  ├─ Markdown / MDX 写内容
  ├─ Pagefind 做站内搜索
  ├─ Starlight Flexoki 做主题
  ├─ Starlight Giscus 做评论
  └─ 生成 dist 静态资产

Cloudflare Worker
  ├─ Workers Static Assets 托管 dist
  └─ Wrangler 管理部署配置
```

## 为什么这是当前最优解

| 需求 | 推荐方案 | 理由 |
| --- | --- | --- |
| 写 Cloudflare 最佳实践文档 | Astro + Starlight | 文档结构、侧边栏、搜索、SEO 都现成，Markdown 对开源协作友好。 |
| 普通关键词搜索 | Starlight 默认 Pagefind | Starlight 默认内置 Pagefind，全静态、低带宽，不占 Worker API 请求。 |
| 主题 | Starlight Flexoki | Starlight 官方资源页收录的社区主题，暖色系、可读性好，并支持橙色强调色。 |
| 评论功能 | Starlight Giscus | 直接接入 GitHub Discussions，不维护自定义评论组件和样式。 |
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

当前评论使用 Giscus：

- 评论数据存储在 GitHub Discussions。
- 页面评论组件由 `starlight-giscus` 插件注入。
- 样式和交互由 Giscus 和 Starlight 插件维护。
- 页面和评论通过 `pathname` 关联，便于每篇文档拥有独立讨论区。

如果后续需要更开放的匿名评论体验，可以评估 Waline、Cusdis 或其它独立评论服务，但不要在本站内维护自定义评论组件。

## 当前仓库落地

| 文件 | 职责 |
| --- | --- |
| `astro.config.mjs` | Starlight 站点配置、导航、全站注入评论资源。 |
| `wrangler.jsonc` | Worker、静态资产、域名和可观测性的部署配置。 |
| `src/worker.ts` | 将请求交给 Cloudflare Static Assets。 |
| `starlight-theme-flexoki` | 站点主题。 |
| `starlight-giscus` | 文档评论组件。 |

## 资料来源

- [Starlight Site Search](https://starlight.astro.build/guides/site-search/)
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare AI Search](https://developers.cloudflare.com/ai-search/)
- [Starlight Flexoki](https://delucis.github.io/starlight-theme-flexoki/)
- [Starlight Giscus](https://dragomano.github.io/starlight-giscus/)
