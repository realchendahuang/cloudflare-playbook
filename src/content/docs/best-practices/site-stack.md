---
title: 文档站技术栈
---

## 推荐组合

| 能力 | 推荐选择 | 判断依据 |
| --- | --- | --- |
| 文档框架 | Astro + Starlight | 文档导航、目录、SEO、搜索入口和 Markdown / MDX 体验成熟，适合开源协作。 |
| 主题 | Starlight Theme Next + 少量品牌变量 | 复用成熟主题，不从零手写文档站 UI。 |
| 站内搜索 | Pagefind | 构建期生成静态索引，搜索在浏览器完成，不消耗 Worker 动态请求。 |
| 部署 | Workers Static Assets | 静态产物直接部署到 Cloudflare，静态资产请求免费且不限量。 |
| 评论 | Twikoo + twikoo-cloudflare + D1 | 复用成熟评论组件，后端托管在 Workers，数据进 D1。 |
| 自然语言搜索 | 按需引入 | 内容规模变大，并且用户确实会用自然语言提问后再看 AI Search / AI Gateway。 |

## 框架判断

| 方案 | 判断依据 |
| --- | --- |
| Astro + Starlight | 文档导航、主题、SEO、Pagefind 和 MDX 体验成熟。 |
| VitePress / VuePress | 已有 Vue 内容和主题资产时可以继续用。 |
| Docusaurus | 已有 React 生态、插件和版本化文档场景时适合。 |

## 部署判断

| 方案 | 适合场景 | 判断依据 |
| --- | --- | --- |
| Pages | 纯静态站、营销页、博客、预览部署。 | Git 工作流轻，静态资产同样免费；动态函数按 Workers 计费。 |
| Workers Static Assets | 静态内容 + 接口 + Cloudflare 数据能力 + 自定义 Worker 行为。 | 更适合展示 Workers、D1、R2、AI、Queues 等能力。 |

## 搜索路线

内容少、结构清楚时，用 Pagefind 就够了，免费、静态、无需后端。内容变多但关键词还能解决时，先做 Pagefind + 标题、标签、导航优化。只有当用户开始问自然语言问题，并且搜索成为主要体验时，再加 AI Search / AI Gateway。

## 评论路线

评论优先复用成熟组件。前端用 Twikoo 前端包，后端用 twikoo-cloudflare，托管在 Cloudflare Workers，和文档站放在同一平台。评论、配置、计数这类关系数据放 D1；有滥用压力后再补 Turnstile / WAF 限流；附件图片放 R2。

## 常见误区

- 不要为文档站重写设计系统。文档站最值钱的是内容、判断和阅读体验；主题只做少量品牌调整。
- 不要太早自写评论组件。评论涉及存储、审核、安全、管理后台和反垃圾，成熟库更合适。
- 不要太早引入 AI 搜索。内容量不足时，优先完善目录、标题、标签和 Pagefind。
- 不要让所有静态请求经过 Worker。这样会消耗 Workers Free / Paid 的动态请求和 CPU 额度。
