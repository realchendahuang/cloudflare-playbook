---
title: Cache / CDN
description: Cloudflare Cache / CDN 的默认缓存行为、Cache Rules、TTL、Purge、Workers Cache API、Cache Reserve、计划边界和最佳实践。
---

最后核对日期：2026-06-17。Cloudflare Cache / CDN 的计划限制、Rules 配额和 Cache Reserve 价格会变化，上线前以官方 Cache plans、Workers Cache API 和 Cache Reserve 页面为准。

## 一句话判断

Cloudflare Cache 不是“把所有请求都缓存起来”，而是围绕四个问题做判断：

```text
请求能不能缓存？
  ├─ Cache eligibility：静态资源、公开 HTML、公开 API？
  ├─ Cache key：同一个 URL 是否应该按 query、header、设备、语言分开？
  ├─ TTL：浏览器缓存多久、边缘缓存多久、是否进入长期持久缓存？
  └─ Purge：内容更新时怎么失效，能不能避免全站清缓存？
```

普通项目的默认策略：**静态 hash 资源长缓存，HTML 短缓存或 revalidate，登录态和用户数据默认 bypass，大文件和媒体进入 R2 / Images / Stream，不把普通 CDN 当对象存储。**

## 请求链路

```text
访客
  ↓
Lower-tier edge cache（离用户最近）
  ↓ miss
Upper-tier cache（靠近源站）
  ↓ miss
Cache Reserve（可选，持久缓存层）
  ↓ miss
Origin / Worker / R2 custom domain
```

Tiered Cache 的目标是减少源站回源次数。Cache Reserve 是付费持久缓存层，适合长尾、稳定、大量重复访问的文件；它不是 Workers 里的 `caches.default`，也不能靠 `cache.put()` 精确写入。

## 免费与付费边界

| 能力 | Free | 付费 / 更高计划边界 |
| --- | --- | --- |
| Cache / CDN | 所有计划可用。 | 更细 TTL、规则数量、拓扑、支持和企业能力随计划提升。 |
| Cache Rules 数量 | 10 条。 | Pro 25、Business 50、Enterprise 300。 |
| Edge Cache TTL 最小值 | 2 小时。 | Pro 1 小时；Business / Enterprise 1 秒。 |
| 最大可缓存文件 | Free / Pro / Business 为 512 MB。 | Enterprise 默认 5 GB，可联系账号团队提高。 |
| Purge by URL | 800 URLs/s，单次最多 100 个 URL。 | Pro / Business 1500 URLs/s；Enterprise 3000 URLs/s，单次最多 500 个 URL。 |
| Hostname / tag / prefix / purge everything | 5 requests/min，bucket size 25，单次最多 100 个操作。 | Pro 5 requests/s；Business 10 requests/s、bucket 50；Enterprise 50 requests/s、bucket 500。 |
| Tiered Cache | 可用，Smart Topology 可用。 | Generic Global、Regional、Custom Topology 是 Enterprise 能力。 |
| Cache Reserve | Usage-based add-on。 | Storage $0.015/GB-month，Class A 写入 $4.50/million，Class B 读取 $0.36/million；适合先算账再开。 |
| Workers Cache API | Workers 里可用。 | 它只操作当前数据中心缓存，不复制到其他数据中心，也不兼容 Tiered Cache / Cache Reserve。 |
| Vary for Images | Free 不可用。 | Pro / Business / Enterprise 可用。 |
| Cache by status code | Free / Pro / Business 不可用。 | Enterprise 可用。 |
| 更复杂的 Cache Key | 基础能力可用。 | 按 header、cookie、host、user features 定制通常是 Enterprise 能力。 |

Cloudflare 官网条款还把普通 CDN 和专门的媒体/文件产品区分开：Free / Pro / Business CDN 适合缓存网页和网站，不应该被当成外部大文件、视频流或对象存储替代品。大文件下载用 R2，视频用 Stream，图片变换用 Images。

## 默认缓存行为

Cloudflare 默认会缓存静态内容，例如图片、CSS、JavaScript。HTML 这类动态内容默认不缓存，需要 Cache Rules 明确配置。

常见规则：

| 情况 | 结果 |
| --- | --- |
| `Cache-Control: public, max-age>0` 或 `Expires` 是未来时间 | 可以缓存。 |
| `Cache-Control: private` / `no-store` / `no-cache` / `max-age=0` | 不缓存。 |
| 响应带 `Set-Cookie` | 通常绕过缓存，避免缓存用户态内容。 |
| 请求方法不是 `GET` | 不缓存。 |
| 没有明确缓存 header，但状态码是 200 / 206 / 301 | 默认 Edge TTL 是 120 分钟。 |
| 没有明确缓存 header，但状态码是 302 / 303 | 默认 Edge TTL 是 20 分钟。 |
| 没有明确缓存 header，但状态码是 404 / 410 | 默认 Edge TTL 是 3 分钟。 |

不要把 `CF-Cache-Status: HIT` 当成业务判断条件。它是排障信号，不是应用协议。

## 三种 TTL

| TTL | 控制什么 | 实践判断 |
| --- | --- | --- |
| Browser Cache TTL | 用户浏览器缓存多久，通常表现为 `Cache-Control`。 | hash 静态资源可以很长；HTML 要短。 |
| Edge Cache TTL | Cloudflare 边缘缓存多久，不一定体现在响应 header。 | 用 Cache Rules 控制，避免源站 headers 不可控。 |
| Cache Reserve retention / TTL | 资源在持久缓存层保留多久。 | 只给稳定、可公开、可重复下载的资源。 |

如果需要把浏览器 TTL 和 CDN TTL 分开，优先在源站使用 `Cloudflare-CDN-Cache-Control` 或 `CDN-Cache-Control`；如果已经用 Cache Response Rules 设置 `Cache-Control`，规则会优先于源站 CDN cache header。

## 推荐规则

| 路径 | 推荐缓存策略 | 原因 |
| --- | --- | --- |
| `/assets/*.[hash].js`、`*.css`、字体 | Browser 长缓存 + Edge 长缓存 + immutable。 | 文件名带 hash，内容变更会换 URL。 |
| 图片、公开下载文件 | Edge 长缓存，必要时配合 R2 custom domain。 | 减少 R2 Class B / 源站读取。 |
| HTML 文档页 | 短缓存或 `max-age=0, must-revalidate`。 | 内容更新后不能长时间卡旧页面。 |
| 公开 API 且结果低频变化 | 短 Edge TTL，明确 cache key。 | 减少源站压力，但保留新鲜度。 |
| 登录态页面、用户资料、购物车、后台 | Bypass。 | 用户态内容不能进入共享缓存。 |
| 搜索 API | 先看 Pagefind / 静态索引；后端搜索短 TTL。 | 避免把动态搜索成本打满。 |

本站当前的静态页面和 Pagefind 索引由 Workers Static Assets 承载，HTML 保持可更新，hash 静态资源天然适合长缓存。

## Cache Rules

Cache Rules 是普通项目管理缓存的主入口。它比在 Worker 里到处写缓存逻辑更直观，也更容易审计。

适合用 Cache Rules 做：

- 给静态资源设置 Edge Cache TTL 和 Browser Cache TTL。
- 对 `/api/public/*` 设置短缓存。
- 对 `/api/private/*`、`/admin/*`、带登录 cookie 的请求 bypass。
- 为 R2 自定义域名上的公开对象设置长缓存。
- 配置 Cache Deception Armor，降低 Web Cache Deception 风险。

不要做：

- 用 `Cache Everything` 覆盖整站，但不排除登录态和后台。
- 让 query string、语言、设备、header 混乱地进入 cache key。
- 只写缓存规则，不设计 purge 或版本化 URL。

## Purge 策略

失效优先级应该是：

1. 文件名版本化：`app.8f3a1c.js` 这种最稳。
2. Purge by URL：官方推荐的精确清理方式。
3. Purge by prefix / tag / hostname：批量发布或目录级清理。
4. Purge everything：只在误缓存用户数据、重大回滚等紧急场景使用。

`Purge everything` 会让后续请求集中回源。高流量站点全站清缓存，可能把源站打慢。能用 URL、prefix、tag 解决，就不要全站清。

## Workers 与 Cache

Workers 有两条缓存路径，边界很重要：

| 方法 | 特点 | 适合场景 |
| --- | --- | --- |
| `fetch()` + `cf` 缓存选项 | 走 Cloudflare CDN，可配合 Tiered Cache。 | 请求源站、R2 custom domain、公开 API。 |
| `caches.default` / `caches.open()` | 只操作当前数据中心缓存；不会复制到其他数据中心；`cache.put()` 不兼容 Tiered Cache / Cache Reserve。 | 缓存 Worker 自己生成的响应或特殊对象。 |

```ts
export default {
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// 公开、低频变化的 API 可以设置短 TTL；用户态接口不要这样做。
		if (url.pathname.startsWith('/api/public/')) {
			return fetch(request, {
				cf: {
					cacheEverything: true,
					cacheTtl: 60,
				},
			});
		}

		return fetch(request);
	},
};
```

`cache.put()` 写入的响应会受 header 影响：带 `Set-Cookie` 的响应不会被缓存，`stale-while-revalidate` 和 `stale-if-error` 也不适用于 Cache API 的 `put()` / `match()`。需要 Tiered Cache 或 Cache Reserve 时，优先走标准 `fetch()`。

## Cache Reserve

Cache Reserve 适合这些场景：

| 场景 | 是否适合 |
| --- | --- |
| 文档附件、公开图片、归档文件、稳定下载文件 | 适合。 |
| 源站在 AWS/S3 等有 egress 成本 | 适合先估算。 |
| 视频 seek、Range request 很多 | 不适合，Range requests 不支持。 |
| 登录态、个性化、频繁更新内容 | 不适合。 |
| 想在 Worker 里按请求写入 Cache Reserve | 不适合，它是 zone-level 自动能力。 |

Cache Reserve 需要资源本身可缓存、TTL 至少 10 小时、响应有 `Content-Length`、没有阻断缓存的 `Set-Cookie` 或 `Vary: *`。Purge by URL 会同时清掉 edge cache 和 Cache Reserve；tag / host / prefix / purge everything 对 Cache Reserve 更偏向触发后续 revalidation，不等于立刻删除所有存储成本。

价格上，Cache Reserve 的计费项和 R2 Standard 很像：存储按 GB-month，写入是 Class A，读取是 Class B。它是否划算，取决于“源站 egress 成本 + 回源压力”能不能被更高命中率抵消。

## 安全边界

缓存最危险的问题通常不是“没命中”，而是“命中了不该给别人的内容”。

| 风险 | 做法 |
| --- | --- |
| Web Cache Deception | 开 Cache Deception Armor，确保 URL 扩展名和 `Content-Type` 匹配。 |
| Web Cache Poisoning | 只把必要 query/header 纳入 cache key，避免无意义 header 影响缓存。 |
| 用户态泄漏 | 登录态、带 `Authorization` 或敏感 cookie 的响应默认 bypass。 |
| CORS 旧响应 | 修改 CORS 后，必要时 purge 已缓存对象。 |
| 预览环境混缓存 | 预览域名和生产域名分开，避免共享 cache key。 |

## 验证命令

```bash
# 第一次请求通常是 MISS、BYPASS 或 EXPIRED。
curl -I https://example.com/assets/app.8f3a1c.js

# 第二次请求如果可缓存，通常会看到 HIT 或 Age 增加。
curl -I https://example.com/assets/app.8f3a1c.js

# 只看和缓存相关的响应头。
curl -sI https://example.com/assets/app.8f3a1c.js | rg -i 'cf-cache-status|cache-control|age|etag|last-modified|cache-tag'
```

```bash
# 精确 purge 单个 URL。API token 至少需要 Cache Purge 权限。
curl --request POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"files":["https://example.com/assets/app.8f3a1c.js"]}'
```

## GitHub 开源参考

| 仓库 | 可以学什么 |
| --- | --- |
| [cloudflare/cloudflare-docs Cache source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/cache) | 官方 Cache / CDN 文档源文件，适合追踪 Cache Rules、Purge、TTL、Cache Reserve 变更。 |
| [cloudflare/cloudflare-docs Workers Cache API source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workers/runtime-apis/cache) | Workers Cache API 文档源文件，适合理解 `fetch()`、`caches.default` 和限制。 |
| [cloudflare/skills Cache Reserve reference](https://github.com/cloudflare/skills/tree/main/skills/cloudflare/references/cache-reserve) | Cloudflare 官方 Agent Skills 里的 Cache Reserve 参考，适合看常见误区和检查清单。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 用 rulesets、zone settings 和 cache 相关资源管理缓存配置。 |
| [cloudflare/cloudflare-go](https://github.com/cloudflare/cloudflare-go) | Cloudflare 官方 Go SDK，适合做 purge、规则和缓存配置自动化。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler / Miniflare / Workers SDK，适合追踪本地缓存模拟和部署行为。 |
| [Rheosoph/serverless-cloudflare-search](https://github.com/Rheosoph/serverless-cloudflare-search) | Worker + Queues + R2 + Cache 做小规模搜索的开源参考。 |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 本站早期学习的原始参考仓库之一，适合对照教程站的信息架构。 |

## 官方资料

- [Cloudflare Cache](https://developers.cloudflare.com/cache/)
- [Get started with Cache](https://developers.cloudflare.com/cache/get-started/)
- [Cache concepts](https://developers.cloudflare.com/cache/concepts/)
- [Default cache behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/)
- [Origin Cache Control](https://developers.cloudflare.com/cache/concepts/cache-control/)
- [CDN-Cache-Control](https://developers.cloudflare.com/cache/concepts/cdn-cache-control/)
- [Cloudflare cache responses](https://developers.cloudflare.com/cache/concepts/cache-responses/)
- [Cache Rules](https://developers.cloudflare.com/cache/how-to/cache-rules/)
- [Cache Rules settings](https://developers.cloudflare.com/cache/how-to/cache-rules/settings/)
- [Edge and Browser Cache TTL](https://developers.cloudflare.com/cache/how-to/edge-browser-cache-ttl/)
- [Purge cache](https://developers.cloudflare.com/cache/how-to/purge-cache/)
- [Purge everything](https://developers.cloudflare.com/cache/how-to/purge-cache/purge-everything/)
- [Tiered Cache](https://developers.cloudflare.com/cache/how-to/tiered-cache/)
- [Cache Reserve](https://developers.cloudflare.com/cache/advanced-configuration/cache-reserve/)
- [Cache plans](https://developers.cloudflare.com/cache/plans/)
- [Workers Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/)
- [Service-Specific Terms](https://www.cloudflare.com/service-specific-terms-application-services/)
