---
title: 本站技术栈
description: 面向 Cloudflare 文档站、开源教程站和轻社区的推荐技术栈。
---

最后核对日期：2026-06-18。

这篇给想在 Cloudflare 上做文档站、开源教程站或轻社区的读者一套可复用判断：文档框架用成熟方案，搜索先静态，评论用成熟组件，部署放到 Cloudflare 的静态资产层，动态能力只在必要路径出现。

## 推荐组合

| 能力 | 推荐选择 | 判断 |
| --- | --- | --- |
| 文档框架 | Astro + Starlight | 文档导航、目录、SEO、搜索入口和 Markdown / MDX 体验成熟，适合开源协作。 |
| 主题 | Starlight Theme Next + 少量品牌变量 | 复用成熟主题，不从零手写文档站 UI。 |
| 站内搜索 | Pagefind | 构建期生成静态索引，搜索在浏览器完成，不消耗 Worker 动态请求。 |
| 部署 | Workers Static Assets | 静态产物直接部署到 Cloudflare，静态资产请求免费且不限量。 |
| 评论 | Twikoo + twikoo-cloudflare + D1 | 复用成熟评论组件，后端托管在 Workers，数据进 D1。 |
| 自然语言搜索 | AI Search / AI Gateway，后置引入 | 内容规模和读者需求明确后再上，避免一开始就增加复杂度和成本解释。 |

核心判断：**让读文档这条主路径保持静态，让评论、搜索增强和未来 API 走明确的动态边界。**

## 为什么不是 VuePress

VuePress 可以部署到 Cloudflare，也适合写普通教程。但这个仓库的目标不是“能出一个文档站”就结束，而是把文档站本身做成 Cloudflare 最佳实践样板。

更偏向 Astro + Starlight 的原因：

- Starlight 的文档体验和 Pagefind 搜索默认可用，少维护一层主题与搜索集成。
- Astro 静态输出天然适合 Workers Static Assets；纯静态 Astro 不需要复杂运行时。
- 后续如果加 Worker API、AI Search、R2 上传、D1 示例和 MCP 示例，Workers 模型比纯文档生成器更贴合本站定位。

## 为什么不是纯 Cloudflare Pages

Cloudflare Pages 仍然是纯静态站、博客、PR 预览和 Git 部署的好选择。这里优先选择 Workers Static Assets，是因为它更方便把静态内容和未来 Worker API、bindings、D1、R2、AI、Queues 放进同一套 Workers 模型里。

| 选择 | 适合场景 | 判断 |
| --- | --- | --- |
| Pages | 纯静态站、营销页、博客、Preview Deployments。 | Git 工作流轻，静态资产同样免费；Functions 进入 Workers 计费口径。 |
| Workers Static Assets | 静态内容 + API + bindings + 自定义 Worker 行为。 | 更适合展示 Workers、D1、R2、AI、Queues 等能力。 |

普通读者可以这样选：如果你的项目只是内容站，Pages 足够；如果你想把内容、API、评论、搜索增强和 Cloudflare bindings 放在一个 Worker-first 项目里，优先看 Workers Static Assets。

## 搜索路线

| 阶段 | 推荐方案 | 为什么 |
| --- | --- | --- |
| 内容少、结构清楚 | Pagefind | 免费、静态、无需后端。 |
| 内容变多、关键词还能解决 | Pagefind + 更好的标题、标签、导航 | 先优化内容结构，比提前引入 AI 更重要。 |
| 读者开始问自然语言问题 | AI Search / AI Gateway | 适合“我该用 D1 还是 KV”这类问答式检索。 |
| 需要 Agent 工具调用 | AI Search MCP endpoint 或自建 Worker API | 只有当搜索成为产品能力时再加。 |

不要一开始就为了“高级”上向量搜索。早期文档站最重要的是目录、标题、交叉链接和可靠来源。

## 评论路线

评论区不要自写 UI 和后端，除非评论本身就是你的核心产品。成熟组件通常已经处理了管理面板、回复、审核、邮件通知、垃圾内容防护和数据结构。

| 模块 | 推荐选择 | 判断 |
| --- | --- | --- |
| 评论 UI | Twikoo 官方包 | 复用成熟前端组件和管理能力。 |
| 评论后端 | twikoo-cloudflare | 托管在 Cloudflare Workers，适合和文档站放在同一平台。 |
| 数据库 | D1 | 评论、配置、计数这类关系数据足够清晰。 |
| 安全增强 | Turnstile / WAF Rate Limiting | 评论量或滥用压力出现后再加。 |
| 附件图片 | R2 | 文件对象不要进入 D1、Git 或静态站 bundle。 |

## 免费额度影响

| 路径 | 当前消耗 | 说明 |
| --- | --- | --- |
| 阅读文档 | Workers Static Assets / Pages | 静态资产请求免费且不限量。 |
| 搜索文档 | Pagefind 静态索引 | 浏览器本地搜索，不打 Worker API。 |
| 评论读写 | 评论 Worker + D1 | 只有评论相关请求进入动态额度。 |
| 图片和附件 | R2 | 先看 storage、Class A、Class B，egress 免费不等于 R2 全免费。 |
| 未来 AI 搜索 | AI Search / AI Gateway / Workers AI | 等需求明确后再按 [免费额度大全](/platform/free-paid/) 估算。 |

`5 USD/month` Workers Paid 不等于 Cloudflare Pro。它主要放大 Workers、KV、D1、Queues、Durable Objects、日志和相关开发者平台额度；WAF、Bot、zone 计划、Enterprise 网络能力和部分 add-on 仍然要分开看。

## 不要做什么

| 不推荐 | 原因 |
| --- | --- |
| 为文档站重写设计系统 | 文档站核心价值是内容、来源和判断；主题只做必要品牌收敛。 |
| 自写评论组件 | 评论涉及存储、审核、安全、管理后台和反垃圾，成熟库更合适。 |
| 一开始做 AI 搜索 | 内容量不够时，AI Search 会增加配置和成本解释负担。 |
| 让所有静态请求都先进 Worker | 会浪费 Workers Free / Paid 的动态请求和 CPU 边界。 |
| 把开发过程写进页面文案 | 读者需要的是产品化内容和判断框架，不是临时说明。 |

## 事实来源

- [Starlight Site Search](https://starlight.astro.build/guides/site-search/)
- [Pagefind Docs](https://pagefind.app/docs/)
- [Astro Cloudflare Deployment](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Cloudflare Astro on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Workers Static Assets Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Cloudflare AI Search](https://developers.cloudflare.com/ai-search/)
- [AI Search Limits and Pricing](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)
- [Codex + Cloudflare](https://developers.cloudflare.com/agent-setup/codex/)
- [Docs for agents](https://developers.cloudflare.com/docs-for-agents/)
