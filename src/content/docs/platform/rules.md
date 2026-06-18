---
title: Rules
description: Cloudflare Rules 的取舍、Page Rules 迁移和常见误区。
---

最后核对日期：2026-06-18。

Rules 解决的是“请求到 Cloudflare 之后怎么处理”：跳转、改路径、改请求头、改回源、改缓存或做少量边缘设置。它不是应用后端，也不是 Workers Paid 的一部分。

## 先用 Rules 的场景

| 需求 | 优先看 |
| --- | --- |
| 旧 URL、旧域名、`www` / apex 统一跳转。 | Single Redirects / Bulk Redirects。 |
| 改路径、查询参数、请求头或响应头。 | Transform Rules。 |
| 按路径调整 Cloudflare 设置。 | Configuration Rules。 |
| 某些路径要走不同端口或后端。 | Origin Rules。 |
| 明确控制哪些内容缓存。 | Cache Rules。 |

只要是跳转、改写、缓存和回源这类边缘规则，先别写 Worker。需要数据库、D1 / KV / R2、鉴权业务、队列、复杂日志或完整工程流程时，再上 Worker。

## 先别这样用

| 做法 | 问题 |
| --- | --- |
| 新项目继续写 Page Rules。 | 新实现优先现代 Rules；Page Rules 只作为迁移对象。 |
| 为每个小路径写一条规则。 | Free 规则数有限，先按业务入口合并。 |
| 全站 redirect、rewrite、challenge、cache。 | 容易误伤证书验证、后台、API、登录和预览环境。 |
| 以为 Workers Paid 会提高 Rules 配额。 | Rules 跟 zone / account 计划走，不跟 Workers Paid 走。 |
| Trace 通过就当线上没问题。 | Trace 是模拟；线上复盘还要看 Ray ID、真实日志和时间窗口。 |

## Page Rules 迁移

旧 Page Rules 不要机械搬。先问“这条规则想做什么”，再拆到现代入口：

| 旧需求 | 现代入口 |
| --- | --- |
| Forwarding URL、HTTP 到 HTTPS。 | Single Redirects。 |
| Cache Everything、Browser Cache TTL。 | Cache Rules。 |
| Host Header Override、Resolve Override。 | Origin Rules。 |
| Security Level、Automatic HTTPS Rewrites、Zaraz。 | Configuration Rules。 |
| URL path rewrite、header 修改。 | Transform Rules。 |

迁移时每次只动少量关键路径，观察后再删旧规则。现代 Rules 会优先于 Page Rules，新旧同时覆盖同一路径时，问题通常来自规则叠加。

## Snippets 和 Workers

Snippets 是轻量 JavaScript，Workers 是完整开发者平台。

| 需求 | 判断 |
| --- | --- |
| 简单改请求头、轻量跳转、维护页。 | Pro+ 可以看 Snippets。 |
| 需要 D1、KV、R2、Durable Objects、Queues。 | 直接看 Workers。 |
| 需要测试、CI、版本发布、复杂业务。 | 直接看 Workers。 |
| 还在 Free zone。 | Snippets 不可用，Workers Free 可以跑小 API。 |

## 常见组合

| 场景 | 推荐组合 |
| --- | --- |
| 文档站域名规范化。 | Single Redirects 做 `www` / apex 统一。 |
| 旧博客迁移。 | 少量规律路径用 Single Redirects / Transform Rules；大量静态映射用 Bulk Redirects。 |
| 静态站缓存。 | Cache Rules 控制 HTML 和静态 hash 资源。 |
| API 后端分流。 | Transform Rules 调路径，Origin Rules 调回源；复杂鉴权交给 Worker。 |

官方核对入口：[Cloudflare Rules](https://developers.cloudflare.com/rules/)、[Redirects](https://developers.cloudflare.com/rules/url-forwarding/)、[Transform Rules](https://developers.cloudflare.com/rules/transform/)、[Page Rules migration guide](https://developers.cloudflare.com/rules/reference/page-rules-migration/)。
