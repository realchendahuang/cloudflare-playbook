---
title: Pages
description: Cloudflare Pages 的定位、适用场景和部署方式。
---

Pages 适合部署静态站点、前端应用、文档站和带少量动态接口的全栈项目。这个 Playbook 自身也推荐先部署到 Pages。

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

## 本项目部署方式

本项目是 Astro + Starlight 文档站，构建产物在 `dist`，可以直接部署到 Cloudflare Pages。
