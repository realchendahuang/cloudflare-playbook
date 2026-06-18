---
title: Cache / CDN
description: Cloudflare Cache / CDN 的缓存策略、免费边界和安全误区。
---

最后核对日期：2026-06-18。

Cloudflare Cache 不是“把所有东西都缓存”。先记住一句：**带 hash 的静态资源长缓存，HTML 短缓存或重新验证，登录态和用户数据默认绕过缓存，更新靠版本化 URL 和精确清理。**

## 先问五个问题

| 问题 | 判断 |
| --- | --- |
| 资源是不是公开静态文件？ | 图片、CSS、JS、字体、下载文件最适合缓存。 |
| URL 变了是否代表内容变了？ | 带 hash 的文件可以长缓存；不带版本号要谨慎。 |
| 响应里有没有登录态、用户资料或后台数据？ | 默认不要进共享缓存。 |
| HTML / JSON / API 真的适合缓存吗？ | 要缓存就用 Cache Rules 明确范围。 |
| 内容更新时怎么失效？ | 优先版本化文件名，其次按 URL purge。 |

## 推荐策略

| 资源 | 推荐策略 |
| --- | --- |
| Hash 静态文件。 | Browser 长缓存，Edge 长缓存。 |
| 图片、字体、公开下载文件。 | Edge 长缓存；大文件放 R2 custom domain。 |
| HTML 页面。 | 短缓存、重新验证，或交给静态托管默认策略。 |
| 公开 API 且低频变化。 | 用 Cache Rules 限定路径和短 TTL。 |
| 登录、后台、购物车、用户资料。 | Bypass。 |

Free 计划的缓存能力足够静态站起步。真正要记住的是：Cache Rules 数量有限，所以按“静态资源、公开 API、用户态绕过、R2 公开文件”几类整理，不要为每个路径写规则。

## Purge 怎么做

| 方式 | 什么时候用 |
| --- | --- |
| 文件名版本化。 | 最稳，构建产物带 hash，发版自然换 URL。 |
| Purge by URL。 | 官方推荐的精确清理方式，适合少量资源。 |
| Purge by prefix / tag / hostname。 | 批量发布或目录级清理时再用。 |
| Purge everything。 | 只在误缓存用户数据、重大回滚或规则严重错误时用。 |

全站 purge 会让后续请求集中回源，高流量站点可能把源站打慢。

## Tiered Cache、R2 和 Cache Reserve

| 能力 | 实践判断 |
| --- | --- |
| Tiered Cache | 有 VPS、对象存储或 R2 custom domain 源站时值得开启。 |
| R2 custom domain | 公开文件走 R2 + Cache Rules，比塞进站点包更合理。 |
| Cache Reserve | Paid add-on；稳定大文件、源站 egress 贵、缓存命中能省钱时再算。 |
| Workers Cache API | 少数自定义响应才用；静态资源先用标准 CDN / Cache Rules。 |

## 不要这样用

| 做法 | 问题 |
| --- | --- |
| `Cache Everything` 覆盖整站。 | 容易把登录态、后台或预览内容放进共享缓存。 |
| 没有版本化 URL，只靠 purge 发版。 | 缓存状态更难预测。 |
| 把 CDN 当对象存储。 | 大文件、视频、下载归档应该看 R2 / Stream / Images。 |
| 让查询参数、登录状态和请求头随意影响缓存命中。 | 命中率会被打碎，也更难排查。 |
| 先开 Cache Reserve 再算账。 | 它会产生存储和操作费用。 |

官方核对入口：[Cloudflare Cache](https://developers.cloudflare.com/cache/)、[Default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)、[Cache Rules](https://developers.cloudflare.com/cache/how-to/cache-rules/)、[Purge cache](https://developers.cloudflare.com/cache/how-to/purge-cache/)。
