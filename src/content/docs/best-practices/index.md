---
title: 最佳实践
description: Cloudflare 项目的安全、成本、缓存和部署实践入口。
---

最佳实践页沉淀跨产品的原则，避免每个案例都重复解释。

## 当前主题

| 主题 | 解决的问题 |
| --- | --- |
| [本站技术栈](/best-practices/site-stack/) | 本站为什么用 Astro、Starlight、Workers Static Assets、Pagefind 和 Twikoo |
| [独立开发者推荐栈](/best-practices/indie-stack/) | 普通项目从免费能力到 Workers Paid 的产品组合顺序 |
| [Codex 协作](/best-practices/codex-cloudflare/) | 用 Codex 维护 Cloudflare 项目时如何查官方资料、用 MCP 和部署验证 |
| [安全边界](/best-practices/security/) | 域名、凭据、访问控制、写操作和生产资源保护 |
| [成本控制](/best-practices/cost/) | 如何避免缓存、AI、存储和请求量失控 |

## 基本原则

- 每个外部入口都要有清晰的访问边界。
- 每个写操作都要知道失败后怎么重试或回滚。
- 每个缓存都要知道过期策略和失效方式。
- 每个成本项都要知道触发条件和观测方式。
- 涉及价格、额度、限制和配置字段时，先回到官方资料核对。
