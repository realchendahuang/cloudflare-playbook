---
title: 架构模式
description: 常见 Cloudflare 架构组合的入口。
---

# 架构模式

架构页关注“产品如何组合”，不是重复产品手册。

## 当前收录

| 模式 | 适合项目 | 核心产品 |
| --- | --- | --- |
| [静态内容站](/architecture/static-site/) | 文档站、官网、博客、作品集 | Pages、CDN、Web Analytics |
| [API 网关](/architecture/api-gateway/) | 代理、鉴权、Webhook、轻量后端 | Workers、KV、D1、Queues |
| [实时应用](/architecture/realtime-app/) | 协作、房间、状态同步、限流 | Durable Objects、Workers |

## 每个架构页应包含

- 适用场景。
- 产品组合。
- 请求路径。
- 最小落地步骤。
- 验证方式。
- 成本和安全风险。
