---
title: 静态内容站
description: 用 Cloudflare Pages 部署文档站、官网和博客的架构模式。
---

# 静态内容站

静态内容站是普通人最容易从 Cloudflare 获益的场景。文档站、官网、博客和作品集都适合从 Pages 开始。

## 架构

```text
GitHub / GitLab
  │ push
  ▼
Cloudflare Pages Build
  │
  ▼
全球静态资源分发
  │
  ├─ 自定义域名
  ├─ 自动 HTTPS
  └─ 预览部署
```

## 最小实践

- 使用静态站点生成器，例如 Astro、Starlight、VitePress、Docusaurus。
- 构建产物输出到 `dist`、`build` 或框架指定目录。
- 通过 Pages 连接 Git 仓库，获得自动部署和 PR 预览。

## 风险

- 图片和附件过多时，要关注 Pages 文件数量和单文件大小限制。
- 需要动态接口时，不要把静态站强行改复杂，优先补 Pages Functions 或 Workers。
