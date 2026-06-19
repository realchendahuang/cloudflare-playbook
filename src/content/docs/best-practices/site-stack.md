---
title: 文档站技术栈
description: 面向 Cloudflare 文档站、开源教程站和轻社区的技术栈选择。
---

## 推荐组合

| 能力 | 推荐选择 | 判断 |
| --- | --- | --- |
| 文档框架 | Astro + Starlight | 文档导航、目录、SEO、搜索入口和 Markdown / MDX 体验成熟，适合开源协作。 |
| 主题 | Starlight Theme Next + 少量品牌变量 | 复用成熟主题，不从零手写文档站 UI。 |
| 站内搜索 | Pagefind | 构建期生成静态索引，搜索在浏览器完成，不消耗 Worker 动态请求。 |
| 部署 | Workers Static Assets | 静态产物直接部署到 Cloudflare，静态资产请求免费且不限量。 |
| 评论 | Twikoo + twikoo-cloudflare + D1 | 复用成熟评论组件，后端托管在 Workers，数据进 D1。 |
| 自然语言搜索 | 按需引入 | 内容规模和用户需求明确后再看 AI Search / AI Gateway。 |

## 框架判断

| 选择 | 判断 |
| --- | --- |
| Astro + Starlight | 文档导航、主题、SEO、Pagefind 和 MDX 体验成熟。 |
| VitePress / VuePress | 已有 Vue 内容和主题资产时可以继续用。 |
| Docusaurus | 已有 React 生态、插件和版本化文档需求时适合。 |

## 部署判断

| 选择 | 适合场景 | 判断 |
| --- | --- | --- |
| Pages | 纯静态站、营销页、博客、预览部署。 | Git 工作流轻，静态资产同样免费；动态函数按 Workers 计费。 |
| Workers Static Assets | 静态内容 + 接口 + Cloudflare 数据能力 + 自定义 Worker 行为。 | 更适合展示 Workers、D1、R2、AI、Queues 等能力。 |

## 搜索路线

| 阶段 | 推荐方案 | 为什么 |
| --- | --- | --- |
| 内容少、结构清楚 | Pagefind | 免费、静态、无需后端。 |
| 内容变多、关键词还能解决 | Pagefind + 更好的标题、标签、导航 | 先优化内容结构，比提前引入 AI 更重要。 |
| 用户开始问自然语言问题 | AI Search / AI Gateway | 只有搜索成为主要体验时再加。 |

## 评论路线

| 模块 | 推荐选择 | 判断 |
| --- | --- | --- |
| 评论 UI | Twikoo 前端包 | 复用成熟前端组件和管理能力。 |
| 评论后端 | twikoo-cloudflare | 托管在 Cloudflare Workers，适合和文档站放在同一平台。 |
| 数据库 | D1 | 评论、配置、计数这类关系数据足够清晰。 |
| 安全补充 | Turnstile / WAF 限流 | 有滥用压力后再加。 |
| 附件图片 | R2 | 文件对象放到 R2。 |

## 边界

| 做法 | 边界 |
| --- | --- |
| 为文档站重写设计系统 | 文档站最值钱的是内容、判断和阅读体验；主题只做少量品牌调整。 |
| 自写评论组件 | 评论涉及存储、审核、安全、管理后台和反垃圾，成熟库更合适。 |
| 一开始做 AI 搜索 | 内容量不够时，先把目录、标题、标签和 Pagefind 做好。 |
| 让所有静态请求都先经过 Worker | 会浪费 Workers Free / Paid 的动态请求和 CPU 额度。 |
