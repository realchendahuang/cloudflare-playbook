---
title: 本站技术栈
description: Cloudflare Playbook 当前阶段推荐的文档、搜索、评论和部署组合。
---

# 本站技术栈

如果这个仓库要同时做文档站、搜索和自由评论，我建议当前阶段使用：

```text
Astro + Starlight
  ├─ Markdown / MDX 写内容
  ├─ Pagefind 做站内搜索
  └─ 生成 dist 静态资产

Cloudflare Worker
  ├─ Workers Static Assets 托管 dist
  ├─ /api/comments 处理评论
  └─ Wrangler 管理部署配置

Cloudflare D1
  └─ 保存页面评论
```

## 为什么这是当前最优解

| 需求 | 推荐方案 | 理由 |
| --- | --- | --- |
| 写 Cloudflare 最佳实践文档 | Astro + Starlight | 文档结构、侧边栏、搜索、SEO 都现成，Markdown 对开源协作友好。 |
| 普通关键词搜索 | Starlight 默认 Pagefind | Starlight 默认内置 Pagefind，全静态、低带宽，不占 Worker API 请求。 |
| 评论功能 | Worker API + D1 | 评论是小型结构化数据，用 D1 足够简单；Cloudflare 官方也有 D1 评论 API 教程。 |
| 统一部署 | Workers Static Assets | 静态页面和 API 可以在同一个 Worker 项目里，配置集中在 `wrangler.jsonc`。 |
| 后续自然语言搜索 | Cloudflare AI Search | 等内容量变大后再加，适合知识库搜索、混合检索和 Agent 使用。 |

## 为什么不是 VuePress

VuePress 可以部署到 Cloudflare，但它更像“文档生成器”。如果只是写教程，它没问题；但你现在想把仓库做成 Cloudflare 最佳实践样板，并且要放搜索、评论、后续 AI 搜索，那 Worker-first 的架构更贴合主题。

## 为什么不是纯 Cloudflare Pages

Cloudflare Pages 很适合纯静态站。这个项目有评论 API，后续还可能有 AI Search、R2 附件、队列任务或管理端，所以优先用 Workers Static Assets。Cloudflare 官方文档也说明静态资源可以作为 Worker 的一部分上传，并由 Cloudflare 缓存和服务。

## 搜索分层

第一阶段只用 Pagefind：

- 构建时生成索引。
- 读者搜索时在浏览器里查本地索引。
- 不需要数据库，不需要额外 API，也没有额外后端成本。

第二阶段再加 AI Search：

- 当内容足够多，读者开始问“我应该用 D1 还是 KV？”这种自然语言问题。
- 当需要混合搜索、结果过滤、站点持续索引、Agent 工具调用。
- 当愿意接受一个额外 Cloudflare 产品的配置和成本边界。

## 评论分层

第一阶段只做自由评论：

- 不登录。
- 不异步审核。
- 使用蜜罐字段挡简单机器人。
- 使用 IP 哈希限流挡短时间刷屏。
- 使用 `textContent` 渲染评论，避免把用户内容当 HTML 执行。

第二阶段再加 Turnstile：

- 当刷屏明显变多。
- 当评论区开始承载更高信任的内容。
- 注意 Turnstile 不是只放前端组件就结束，官方要求服务端调用 Siteverify 验证 token。

第三阶段才考虑队列和审核：

- 需要邮件通知、人工审核、敏感词处理或批量清理时，再引入 Queues。
- 当前不需要，因为你明确希望评论自由、直接发布。

## 当前仓库落地

| 文件 | 职责 |
| --- | --- |
| `astro.config.mjs` | Starlight 站点配置、导航、全站注入评论资源。 |
| `wrangler.jsonc` | Worker、静态资产、D1、域名和可观测性的部署配置。 |
| `src/worker.ts` | 评论 API 和静态资源兜底。 |
| `migrations/0001_create_comments.sql` | D1 评论表结构。 |
| `public/comments.js` | 每篇文档底部自动挂载评论区。 |
| `public/comments.css` | 评论区样式。 |

## 资料来源

- [Starlight Site Search](https://starlight.astro.build/guides/site-search/)
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare D1: Build a Comments API](https://developers.cloudflare.com/d1/tutorials/build-a-comments-api/)
- [Cloudflare AI Search](https://developers.cloudflare.com/ai-search/)
- [Cloudflare Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
