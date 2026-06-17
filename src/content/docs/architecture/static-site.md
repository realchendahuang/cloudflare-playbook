---
title: 静态内容站
description: 用 Cloudflare Pages 或 Workers Static Assets 部署文档站、官网和博客的架构模式。
---

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

## 最小实践

- 使用静态站点生成器，例如 Astro、Starlight、VitePress、Docusaurus。
- 构建产物输出到 `dist`、`build` 或框架指定目录。
- 纯静态站可以通过 Pages 连接 Git 仓库，获得自动部署和 PR 预览。
- 需要统一接 Worker 能力时，在 `wrangler.jsonc` 配置 `assets.directory` 并用 Wrangler 部署。

## 风险

- 图片和附件过多时，要关注 Pages 文件数量和单文件大小限制。
- 需要动态接口时，不要把静态站强行改复杂，优先补 Pages Functions 或 Workers Static Assets + Worker API。
