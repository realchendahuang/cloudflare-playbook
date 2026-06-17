---
title: 源站保护与流量洪峰
description: Waiting Room、Smart Shield 和 APO 的普通项目取舍、免费边界和升级顺序。
---

最后核对日期：2026-06-18。

这一页只回答一个问题：源站快被打满时，普通项目应该先用 Cloudflare 的哪一类能力，哪些能力要付费，哪些能力根本不该先买。

最重要的判断是：**恶意流量先走 DDoS / WAF / Bot / Rate Limiting，合法峰值才看 Waiting Room，回源请求和连接压力才看 Smart Shield，WordPress 动态 HTML 慢才看 APO。**

## 先判断免费能做什么

| 问题 | 免费阶段先做 | 什么时候再付费 |
| --- | --- | --- |
| 源站暴露公网，被直接扫或攻击。 | 把 Web 记录设为 Proxied，源站防火墙只放 Cloudflare 回源；再补 WAF、DDoS、Rate Limiting、Turnstile。 | 需要更多 WAF 规则、更长安全事件、Bot / API 防护或企业网络能力时再升级 zone plan。 |
| 静态站、文档站、官网流量变大。 | 先把静态资产交给 CDN、Workers Static Assets 或 Pages；静态资产请求免费且不限量。 | 构建、文件数、动态请求、日志、团队治理撞墙时再看 Workers Paid 或更高计划。 |
| API、评论、表单偶尔有峰值。 | 先用缓存、限流、Turnstile、队列和 D1 / KV，把写入和慢任务拆开。 | 合法用户同时进入会压垮源站时，再看 Waiting Room；后台任务变多时再看 Queues / Workers Paid。 |
| 缓存命中仍低，源站连接数很高。 | 先修 Cache-Control、Cache Rules、静态资源 hash、HTML 缓存边界。 | 确认瓶颈是回源请求或连接后，再看 Smart Shield / Argo / Cache Reserve。 |
| WordPress 首字节慢。 | 先确认主题、插件、源站 PHP / MySQL 和页面缓存。 | 确认是 WordPress 内容站后，再看 APO；非 WordPress 不要买 APO。 |

## 一句话判断

| 需求 | 优先看什么 | 不要误用什么 |
| --- | --- | --- |
| 静态站、文档站、官网 | Cache / CDN、Workers Static Assets、Pages | 不需要 Waiting Room，也不需要 APO。 |
| 秒杀、报名、抢票、发售等合法用户峰值 | Waiting Room | 不要把 Waiting Room 当 DDoS 防护。 |
| 恶意请求、自动化提交、撞库、爬虫滥用 | DDoS、WAF、Bot、Rate Limiting、Turnstile | 不要先上 Waiting Room。 |
| 源站回源请求多、连接数高 | Smart Shield | 不要在缓存策略混乱时先买高级包。 |
| 全球用户离源站远，动态回源慢 | Smart Shield + Argo 或 Argo Smart Routing | 先确认瓶颈是回源路径，不是 HTML 没缓存。 |
| WordPress 动态 HTML 慢 | Automatic Platform Optimization | APO 不是通用动态站缓存。 |
| 源站防火墙必须 allowlist 固定 Cloudflare 出口 IP | Dedicated CDN Egress IPs | Enterprise 场景，普通项目先隐藏源站 IP。 |

## 免费与付费边界

| 能力 | 免费 / 计划边界 | 普通项目判断 |
| --- | --- | --- |
| Waiting Room | Free / Pro 不可用；Business 包含 1 个 basic waiting room；Enterprise 默认 1 个，Advanced 可购买更多和高级功能。 | 只有合法用户峰值真的会打满源站时才需要。 |
| Waiting Room Advanced | 自定义模板、多 hostname/path、Scheduled Events、Waiting Room rules、JSON response、Random / Reject / Passthrough queueing 主要在 Enterprise Advanced add-on。 | 活动页、抢购页、政务预约这类入口才值得评估。 |
| Smart Shield | 官方文档写明所有客户都可以 opt-in；Free / Pro / Business 可购买 Smart Shield 和 Smart Shield + Argo；Smart Shield Advanced 当前不面向 Free / Pro / Business。 | 先免费修缓存和代理入口，再看是否需要回源优化包。 |
| Smart Shield Advanced | Enterprise 可用，包含 Regional Tiered Cache 和 Cache Reserve；Cache Reserve 在 Advanced 中包含 2 TB storage。 | 适合高流量、跨区域、大缓存对象或源站成本明显的站点。 |
| Health Checks | Pro / Business / Enterprise 在 Smart Shield packages 中可用。 | 有多源站、告警或可用性要求时再看。 |
| Dedicated CDN Egress IPs | Enterprise；用于 CDN / WAF / Spectrum 流量的专用回源 IP。 | 只有源站必须固定 Cloudflare 出口 IP allowlist 时才需要。 |
| APO | WordPress 专项能力，需要 Cloudflare for WordPress plugin；具体价格和 included 计划以控制台和官方产品页为准。 | 只给 WordPress 内容站评估，非 WordPress 走 Cache Rules、应用缓存或 Workers。 |

## 推荐启用顺序

| 顺序 | 动作 | 为什么 |
| --- | --- | --- |
| 1 | Web 入口先设为 Proxied。 | DNS-only 流量不会经过 Cloudflare 的反向代理、安全和 Smart Shield 能力。 |
| 2 | 先把缓存、安全和限流做好。 | 大多数普通项目的问题不是缺高级包，而是源站裸露、缓存没命中、写入口没限流。 |
| 3 | 合法用户峰值再看 Waiting Room。 | Waiting Room 是排队系统，不是攻击防护。 |
| 4 | 回源请求和连接压力仍高再看 Smart Shield。 | Smart Shield 的价值建立在“可缓存内容已经整理过”之上。 |
| 5 | WordPress 站点单独看 APO。 | APO 依赖 WordPress 插件和 WordPress 缓存语义。 |
| 6 | 企业源站安全要求再看 Dedicated CDN Egress IPs。 | 固定回源 IP 是企业源站防火墙治理问题，不是普通站点默认项。 |

## Waiting Room 怎么看

Waiting Room 适合“合法用户太多”的场景：抢购、报名、抢票、考试预约、热门活动入口。它把超过源站承载能力的用户放进等待室，让源站按容量放行。

| 判断项 | 建议 |
| --- | --- |
| 是否需要 | 只有明确知道源站容量，并且合法用户峰值会超过容量，才启用 Waiting Room。 |
| 放在哪 | 只放在会被打满的 hot path，不要默认全站套等待室。 |
| 初始容量 | 官方 best practice 建议从源站流量容量的 75% 开始设置 total active users。 |
| 路径影响 | Waiting Room 的 path 会覆盖 subpaths，配置前要确认不会误伤其它页面。 |
| Queueing method | Business 基础能力是 FIFO；Random、Reject、Passthrough 属于 Advanced 能力。 |
| API / 移动端 | JSON-friendly response 属于 Advanced Waiting Room；非浏览器客户端必须保存并回传 cookie。 |
| 活动预热 | Scheduled Events 属于 Advanced 能力；适合活动开始前预队列和活动期间覆盖容量。 |

## Smart Shield 怎么看

Smart Shield 不是“打开就解决所有性能问题”的开关，它是一组减少回源请求、减少源站连接、优化回源路径的能力。

| 能力 | 适合什么情况 |
| --- | --- |
| Smart Tiered Cache | 下层节点未命中时，让上层节点代表它回源，减少直接打到源站的请求。 |
| Connection Reuse | 复用 Cloudflare 到源站的连接；官方文档写明平均减少源站连接 30%。 |
| Smart Shield + Argo | 访客离源站远，Cloudflare 到源站路径是瓶颈时再看。 |
| Regional Tiered Cache | Enterprise 或 Smart Shield Advanced 场景，适合跨区域缓存层级更复杂的站点。 |
| Cache Reserve | Smart Shield Advanced 场景，用 R2 持久化可缓存内容，适合大对象和长期缓存。 |
| Dedicated CDN Egress IPs | Enterprise 场景，让源站只允许一小组专用 Cloudflare 出口 IP。 |

普通项目先做三件事：确认 DNS 记录是 Proxied，确认静态资源能长期缓存，确认 HTML / API 哪些能缓存、哪些不能缓存。只有这些都做完了，源站仍被回源和连接压住，Smart Shield 才真正有意义。

## APO 怎么看

Automatic Platform Optimization 是 WordPress 专项优化。它通过 Cloudflare Workers 和 WordPress 插件协作，把 WordPress 动态 HTML 缓存在 Cloudflare edge。

| 场景 | 判断 |
| --- | --- |
| WordPress 博客 / 内容站 | 可以评估 APO，尤其是共享主机、PHP / MySQL 慢、全球访问多的站点。 |
| WooCommerce / 登录态 WordPress | 要谨慎测试；logged-in / administrator 用户会 bypass cache，相关 cookie 也会触发 bypass。 |
| 非 WordPress 应用 | 不适合 APO；优先用 Cache Rules、Workers Static Assets、应用层缓存或自定义 Worker。 |
| WordPress multisite | Cloudflare APO WordPress plugin 不支持 multisite WordPress installation。 |

APO 的关键不是“买了就快”，而是 WordPress 插件能在内容更新时通知 Cloudflare 更新边缘缓存，并且登录态、管理态、特定 cookie 和 query string 不会错误缓存。

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| Waiting Room 能挡 DDoS。 | 它主要管理合法流量峰值；恶意流量先用 DDoS、WAF、Bot、Rate Limiting。 |
| 源站一慢就买 Smart Shield。 | 先看缓存命中、源站暴露、慢查询、图片和静态资源；Smart Shield 解决的是回源与连接压力。 |
| 全站挂 Waiting Room 更安全。 | Waiting Room 应该只放在会打满源站的入口，全站套容易误伤正常浏览。 |
| APO 是所有动态站缓存。 | APO 是 WordPress 插件驱动方案；非 WordPress 不适用。 |
| 有 Cloudflare 就不用保护源站。 | 如果源站 IP 暴露，攻击可以绕过 Cloudflare；源站防火墙仍要只信任必要来源。 |
| 只看套餐价格，不看流量形态。 | 免费层能解决很多入口问题；付费前先确认真正瓶颈是峰值、回源、连接、WordPress 还是企业合规。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs Waiting Room source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/waiting-room) | 官方 Waiting Room 文档源文件，适合追踪 plans、queueing methods、events、JSON response 和 best practices。 |
| [cloudflare/cloudflare-docs Smart Shield source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/smart-shield) | 官方 Smart Shield 文档源文件，适合追踪 packages、connection reuse、Smart Tiered Cache、Cache Reserve 和 Dedicated CDN Egress IPs。 |
| [cloudflare/cloudflare-docs APO source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/automatic-platform-optimization) | 官方 APO 文档源文件，适合追踪 WordPress plugin、headers、query parameters、device cache 和 troubleshooting。 |

## 事实来源

- [Waiting Room](https://developers.cloudflare.com/waiting-room/)
- [Waiting Room plans](https://developers.cloudflare.com/waiting-room/plans/)
- [Waiting Room best practices](https://developers.cloudflare.com/waiting-room/reference/best-practices/)
- [Waiting Room queueing methods](https://developers.cloudflare.com/waiting-room/reference/queueing-methods/)
- [Waiting Room JSON response](https://developers.cloudflare.com/waiting-room/how-to/json-response/)
- [Waiting Room scheduled events](https://developers.cloudflare.com/waiting-room/additional-options/create-events/)
- [Smart Shield](https://developers.cloudflare.com/smart-shield/)
- [Smart Shield get started](https://developers.cloudflare.com/smart-shield/get-started/)
- [Smart Shield connection reuse](https://developers.cloudflare.com/smart-shield/concepts/connection-reuse/)
- [Cache Reserve in Smart Shield](https://developers.cloudflare.com/smart-shield/configuration/cache-reserve/)
- [Dedicated CDN Egress IPs](https://developers.cloudflare.com/smart-shield/configuration/dedicated-egress-ips/)
- [Automatic Platform Optimization](https://developers.cloudflare.com/automatic-platform-optimization/)
- [APO about](https://developers.cloudflare.com/automatic-platform-optimization/about/)
- [Activate the Cloudflare WordPress plugin](https://developers.cloudflare.com/automatic-platform-optimization/get-started/activate-cf-wp-plugin/)
- [APO query parameters and cached responses](https://developers.cloudflare.com/automatic-platform-optimization/reference/query-parameters/)
