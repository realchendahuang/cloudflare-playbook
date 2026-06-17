---
title: Cache / CDN
description: Cloudflare Cache / CDN 的普通项目缓存策略、免费边界、Cache Rules、Purge、Tiered Cache、Cache Reserve 与安全误区。
---

最后核对日期：2026-06-18。Cache Rules 数量、TTL 下限、Purge 限制和 Cache Reserve 价格会变化，上线前以 Cloudflare Cache 官方页面为准。

Cloudflare Cache 不是“把所有东西都缓存”。普通项目先记住这条：**带 hash 的静态资源长缓存，HTML 短缓存或重新验证，登录态和用户数据默认 bypass，更新靠版本化 URL 和精确 purge。**

## 先问五个问题

| 问题 | 判断 |
| --- | --- |
| 这个资源是不是公开静态文件？ | 图片、CSS、JS、字体、下载文件最适合缓存。 |
| URL 变了是不是代表内容变了？ | 带 hash 的文件可以长缓存；不带版本号的文件要谨慎。 |
| 响应里有没有登录态、cookie、用户资料、购物车、后台数据？ | 默认不要进共享缓存。 |
| HTML / JSON / API 是否真的适合缓存？ | Cloudflare 默认不缓存 HTML / JSON；要缓存就用 Cache Rules 明确范围。 |
| 内容更新时怎么失效？ | 优先版本化文件名，其次按 URL purge，最后才考虑大范围清理。 |

## 免费与计划边界

| 能力 | Free | Pro / Business | Enterprise | 普通项目判断 |
| --- | ---: | ---: | ---: | --- |
| Cache / CDN | 支持 | 支持 | 支持 | 免费计划已经足够承载普通静态站缓存。 |
| Cache Rules | 10 条 | Pro 25；Business 50 | 300 | Free 要把规则写少、写准。 |
| Edge Cache TTL 下限 | 2 小时 | Pro 1 小时；Business 1 秒 | 1 秒 | Free 不适合大量短 TTL 动态缓存。 |
| Browser Cache TTL | 支持，默认 4 小时 | 支持 | 支持 | hash 资源可以更长，HTML 不要长。 |
| 最大可缓存文件 | 512 MB | 512 MB | 默认 5 GB，可申请提高 | 大文件下载优先看 R2，不要把 CDN 当对象存储。 |
| 最大上传大小 | 100 MB | Pro 100 MB；Business 200 MB | 500+ MB | 上传大文件走 R2 signed upload。 |
| Purge by URL | 800 URLs/s，单次 100 URL | 1500 URLs/s，单次 100 URL | 3000 URLs/s，单次 500 URL | 发版清资源够用。 |
| Hostname / tag / prefix / purge everything | 5 requests/min | Pro 5 requests/s；Business 10 requests/s | 50 requests/s | 大范围 purge 要克制。 |
| Tiered Cache / Smart Topology | 支持 | 支持 | 支持 | 有源站或 R2 custom domain 时值得打开。 |
| Generic / Regional / Custom Tiered Cache | 不支持 | 不支持 | 支持 | 企业多区域源站再看。 |
| Cache Analytics | 不支持 | Pro 7 天；Business 30 天 | 30 天 | Free 阶段主要看响应头和源站压力。 |
| Cache Reserve | Paid add-on | Paid add-on | Paid add-on | 稳定大文件、源站 egress 贵时再算账。 |
| Vary for Images | 不支持 | 支持 | 支持 | 图片格式协商复杂时再看。 |
| Cache by status code | 不支持 | 不支持 | 支持 | 普通项目不从这里起步。 |

## 默认会缓存什么

Cloudflare 默认缓存静态文件扩展名，不按 MIME type 判断。常见的图片、CSS、JavaScript、字体、压缩包、PDF、音视频文件会进入默认缓存范围；HTML 和 JSON 默认不缓存。

| 情况 | 判断 |
| --- | --- |
| `Cache-Control: public` 且有正数 `max-age` | 可以缓存。 |
| `Expires` 是未来时间 | 可以缓存。 |
| `Cache-Control: private`、`no-store`、`no-cache`、`max-age=0` | 默认不缓存或需要重新验证。 |
| 响应带 `Set-Cookie` | 通常不要缓存，避免用户态泄漏。 |
| 请求不是 `GET` | 默认不缓存。 |
| 没有缓存 header，但状态码是 200 / 206 / 301 | 默认 Edge TTL 是 120 分钟。 |
| 没有缓存 header，但状态码是 302 / 303 | 默认 Edge TTL 是 20 分钟。 |
| 没有缓存 header，但状态码是 404 / 410 | 默认 Edge TTL 是 3 分钟。 |

## 推荐策略

| 资源 | 推荐策略 | 原因 |
| --- | --- | --- |
| `/assets/app.8f3a1c.js` 这类 hash 文件 | Browser 长缓存，Edge 长缓存。 | 内容变更会换 URL。 |
| 图片、字体、公开下载文件 | Edge 长缓存；大文件放 R2 custom domain。 | 减少源站和 R2 读取压力。 |
| HTML 页面 | 短缓存、重新验证，或交给静态托管默认策略。 | 发版后不能长期卡旧页面。 |
| 公开 API 且结果低频变化 | 用 Cache Rules 限定路径和短 TTL。 | 只缓存明确可公开的结果。 |
| 搜索接口 | 静态索引优先；动态搜索短 TTL。 | 防止搜索成本被刷爆。 |
| 登录、后台、购物车、用户资料 | Bypass。 | 共享缓存里不该出现用户态内容。 |

## Cache Rules 怎么用

Cache Rules 是普通项目管理缓存的主入口。优先用规则表达“哪些路径能缓存、缓存多久、哪些入口要绕过”，不要先在 Worker 里手写缓存逻辑。

| 场景 | 做法 |
| --- | --- |
| 静态资源路径 | 设长 Edge TTL 和 Browser TTL。 |
| R2 custom domain 的公开对象 | 设长缓存，必要时打开 Tiered Cache。 |
| 公开 API | 只给确定公开、低频变化的路径短缓存。 |
| 带登录 cookie 或登录凭证的请求 | 明确 bypass。 |
| 后台、预览环境、管理入口 | 明确 bypass。 |
| 可能被 Web Cache Deception 利用的路径 | 打开 Cache Deception Armor。 |

Free 计划只有 10 条 Cache Rules，所以不要为每个小路径写一条规则。先按“静态资源、公开 API、用户态 bypass、R2 公开文件”这几个大类整理。

## Purge 怎么做

| 方式 | 什么时候用 |
| --- | --- |
| 文件名版本化 | 最稳。构建产物带 hash，发版自然换 URL。 |
| Purge by URL | 官方推荐的精确清理方式，适合发版后清少量资源。 |
| Purge by prefix / tag / hostname | 批量发布、目录级清理、多资源联动时再用。 |
| Purge everything | 只在误缓存用户数据、重大回滚、规则严重错误时用。 |

`Purge everything` 会让后续请求集中回源。高流量站点全站清缓存，可能把源站打慢；能按 URL 或 prefix 清，就不要全站清。

## Tiered Cache 与 R2

Tiered Cache 的作用是减少回源：离用户近的数据中心 miss 后，先问上层缓存；上层也没有，才回源。Free 也支持 Tiered Cache 和 Smart Topology。

| 场景 | 判断 |
| --- | --- |
| 有 VPS / 对象存储 / R2 custom domain 源站 | 值得开启 Smart Tiered Cache。 |
| R2 使用 `r2.dev` 开发地址 | 不支持缓存、WAF、Bot Management；要用 custom domain。 |
| 文件超过 Free / Pro / Business 的 512 MB 可缓存上限 | 不会进入普通 CDN 缓存，改用更合适的交付方式。 |
| 多区域企业源站 | 再看 Enterprise 的 Regional / Custom Topology。 |

## Cache Reserve 什么时候用

Cache Reserve 是 paid add-on，会把可缓存内容放进基于 R2 的持久缓存层。它不是免费 CDN 的默认能力，也不是 Worker 里可以精确写入的缓存。

| 适合 | 不适合 |
| --- | --- |
| 稳定、公开、重复下载的大文件。 | 登录态、个性化、频繁更新内容。 |
| 源站 egress 贵，缓存命中能省钱。 | 小流量项目，为了“专业”而开启。 |
| 文件 TTL 至少 10 小时，并有 `Content-Length`。 | Range request 很多的视频 seek 场景。 |
| 配合 Tiered Cache 降低回源。 | 想用 Worker 手动写入 Cache Reserve。 |

当前公开价格口径是：Storage `0.015 USD / GB-month`，Class A 写入 `4.50 USD / million requests`，Class B 读取 `0.36 USD / million requests`。它是否划算，取决于能不能抵消源站带宽和回源压力。

## Workers Cache API 的位置

Workers Cache API 适合少数自定义场景，不是普通项目缓存的第一选择。

| 选择 | 判断 |
| --- | --- |
| 标准 CDN / Cache Rules | 优先选择。可以和 Tiered Cache、R2 custom domain 更自然配合。 |
| Worker 手动缓存 | 只影响当前数据中心，不会复制到其他数据中心。 |
| Worker 手动写入 | 不兼容 Tiered Cache，也不能写入 Cache Reserve。 |
| Worker 手动删除 | 只删当前数据中心；全局清理仍用 purge。 |

如果只是缓存静态资源、公开 HTML 或 R2 公共文件，先用 Cache Rules。只有 Worker 自己生成响应、且明确知道数据中心级缓存边界时，再考虑 Cache API。

## 不要这样用

| 做法 | 问题 |
| --- | --- |
| `Cache Everything` 覆盖整站 | 很容易把登录态、后台或预览内容放进共享缓存。 |
| 没有版本化 URL，只靠 purge 发版 | 缓存状态更难预测。 |
| 把 CDN 当对象存储 | 大文件、视频、下载归档应该看 R2 / Stream / Images。 |
| 让 query、cookie、header 随意进入 cache key | 命中率会被打碎，也更难排查。 |
| 只看 `CF-Cache-Status: HIT` | 它是排障信号，不是业务协议。 |
| 先开 Cache Reserve 再算账 | paid add-on 会产生存储和操作费用。 |

## GitHub 开源参考

| 仓库 | 可以学什么 |
| --- | --- |
| [cloudflare/cloudflare-docs Cache source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/cache) | 官方 Cache / CDN 文档源文件，适合追踪 Cache Rules、Purge、TTL、Cache Reserve 变更。 |
| [cloudflare/cloudflare-docs Workers Cache API source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workers/runtime-apis/cache) | Workers Cache API 文档源文件，适合理解它和标准 CDN 的边界。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 用 IaC 管理 rulesets、zone settings 和缓存配置。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler / Miniflare / Workers SDK，适合追踪本地开发和部署行为。 |

## 事实来源

- [Cloudflare Cache](https://developers.cloudflare.com/cache/)
- [Cache plans](https://developers.cloudflare.com/cache/plans/)
- [Get started with Cache](https://developers.cloudflare.com/cache/get-started/)
- [Default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)
- [Origin Cache Control](https://developers.cloudflare.com/cache/concepts/cache-control/)
- [Cache Rules](https://developers.cloudflare.com/cache/how-to/cache-rules/)
- [Purge cache](https://developers.cloudflare.com/cache/how-to/purge-cache/)
- [Tiered Cache](https://developers.cloudflare.com/cache/how-to/tiered-cache/)
- [Cache Reserve](https://developers.cloudflare.com/cache/advanced-configuration/cache-reserve/)
- [Cache Deception Armor](https://developers.cloudflare.com/cache/cache-security/cache-deception-armor/)
- [Enable cache in an R2 bucket](https://developers.cloudflare.com/cache/interaction-cloudflare-products/r2/)
- [Workers Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/)
