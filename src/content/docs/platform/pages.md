---
title: Pages
description: Cloudflare Pages 的定位、适用场景和部署方式。
---

Pages 适合部署静态站点、前端应用、文档站和带少量动态接口的项目。纯静态、强依赖 Git 预览部署时，Pages 仍然很好用；如果项目已经需要 Worker API、D1、R2、Durable Objects 或 AI，优先评估 [Workers Static Assets](/platform/static-assets/)。

## 适合什么

- 文档站、博客、官网、产品说明页。
- 前端应用的自动构建和预览部署。
- 需要 Pull Request 预览链接的开源项目。
- 静态内容为主、少量动态接口为辅的项目。

## 推荐配置

```text
Build command: pnpm build
Build output directory: dist
```

## 什么时候不用

- 需要复杂后端运行时和长时间任务时，优先看 Workers、Workflows 或外部后端。
- 需要强一致对象状态时，优先引入 Durable Objects。
- 静态站和 API 希望在同一个 Worker 配置里维护时，优先看 [Workers Static Assets](/platform/static-assets/)。

## 本项目部署方式

本项目是 Astro + Starlight 文档站，构建产物在 `dist`，当前采用 [Workers Static Assets](/platform/static-assets/) 部署到 Cloudflare Workers。它也可以部署到 Pages，但本站选择 Worker-first 模型，方便后续接 API、搜索和更多 Cloudflare 绑定。
