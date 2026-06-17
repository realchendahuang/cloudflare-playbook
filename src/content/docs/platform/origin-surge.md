---
title: 源站保护与流量洪峰
description: Waiting Room、Smart Shield 和 Automatic Platform Optimization 的产品边界、计划差异、成本入口和普通项目落地顺序。
---

最后核对日期：2026-06-17。

这一页整理 Cloudflare 里和“源站被压垮怎么办”相关的产品：Waiting Room、Smart Shield 和 Automatic Platform Optimization。

普通项目最容易混淆的是：把 DDoS 当成所有流量洪峰，把缓存当成所有源站保护，把 WordPress 优化当成通用 Web 优化。实际顺序应该是：先让公开入口走 Proxied DNS，再做好 Cache / CDN / WAF / DDoS；如果是合法用户峰值，再看 Waiting Room；如果源站回源和连接压力明显，再看 Smart Shield；如果站点是 WordPress，再单独评估 APO。

## 一句话判断

| 需求 | 优先看什么 | 不要误用什么 |
| --- | --- | --- |
| 静态站、文档站、官网 | Cache / CDN + Workers Static Assets / Pages | 不需要 Waiting Room，也不需要 APO。 |
| 合法用户在秒杀、报名、抢票时压垮源站 | Waiting Room | 不要把 Waiting Room 当 DDoS 防护；恶意流量先走 WAF / DDoS / Bot。 |
| 源站回源太多、连接数太高 | Smart Shield | 不要在缓存策略混乱时先买高级包。 |
| 全球用户离源站远，动态回源慢 | Smart Shield + Argo 或 Argo Smart Routing | 先确认瓶颈是回源路径，不是 HTML 没缓存。 |
| WordPress 站点 TTFB 高 | Automatic Platform Optimization | 不要把 APO 当成非 WordPress 应用的通用方案。 |
| 源站只允许固定 Cloudflare 出口 IP | Dedicated CDN Egress IPs | Enterprise 场景，普通项目先保护源站 IP 和防火墙。 |

```text
用户流量
  │
  ├─ 恶意请求 / 自动化滥用
  │    └─ WAF / DDoS / Bot / Rate Limiting
  │
  ├─ 合法用户瞬时峰值
  │    └─ Waiting Room: 让超出容量的用户排队
  │
  ├─ 缓存 miss 和回源连接压力
  │    └─ Smart Shield: Tiered Cache + Connection Reuse + 可选 Argo / Cache Reserve
  │
  └─ WordPress 动态 HTML 慢
       └─ APO: WordPress 插件驱动的边缘 HTML 缓存
```

## 产品边界

| 产品 | 解决什么 | 普通项目判断 |
| --- | --- | --- |
| Waiting Room | 在合法流量接近源站容量时，把超出的用户放进虚拟等待室，并持续更新预计等待时间。 | 适合抢购、报名、发售、政务预约、活动页；Business 起可用。 |
| Smart Shield | 通过 Smart Tiered Cache、Connection Reuse、可选 Argo、Regional Tiered Cache、Cache Reserve 等降低回源请求和源站连接数。 | 适合源站带宽、连接数、跨区域回源成本明显的站点。 |
| Automatic Platform Optimization | 通过 Cloudflare WordPress plugin 缓存 WordPress 动态 HTML 和部分第三方脚本。 | 只适合 WordPress；非 WordPress 应用先用 Cache Rules、Workers 或应用层缓存。 |
| Dedicated CDN Egress IPs | 给 CDN / WAF / Spectrum 流量使用专用回源 IP，便于源站防火墙 allowlist。 | Enterprise；普通项目先隐藏源站 IP，不要裸露公网。 |

## 免费与付费边界

| 能力 | 免费 / 计划边界 | 成本控制 |
| --- | --- | --- |
| Waiting Room | Free / Pro 不可用；Business 有 1 个 basic waiting room；Enterprise 默认 1 个，Advanced 可购买更多和高级功能。 | 只给真正会被峰值打满的入口配置，不要全站套等待室。 |
| Waiting Room advanced | 自定义模板、多 hostname/path、Scheduled Events、Waiting Room rules、JSON response、Random / Reject / Passthrough queueing 等主要是 Enterprise Advanced add-on。 | 活动前要测试；Scheduled Events 每个 waiting room 最多 5 个。 |
| Smart Shield | 官方文档写明对所有客户以 opt-in configuration 形式可用；Free / Pro / Business 可购买 Smart Shield 和 Smart Shield + Argo。 | 公开 Pricing 页标注 Smart Shield + Argo starting at `$5/mo`；开启前确认 dashboard 套餐。 |
| Smart Shield Advanced | Enterprise 可用；Free / Pro / Business 当前不可用，需要联系 Enterprise Sales。 | Advanced 包含 Regional Tiered Cache 和 Cache Reserve；Smart Shield Advanced 文档写明 Cache Reserve included storage 为 2 TB。 |
| APO | Free plan 需要购买 APO；Cloudflare 产品页写明 Free 计划 `$5/month`，Pro / Business / Enterprise included。 | 只给 WordPress zone 开；先确认插件兼容和缓存命中，不要为非 WordPress 站点买。 |

## Waiting Room

Waiting Room 保护的是“合法用户太多”，不是“恶意攻击太多”。它的价值是把源站容量显式化，并让用户排队，而不是让所有请求同时撞源站。

核心配置：

| 配置 | 判断 |
| --- | --- |
| Hostname | 必填，不能带 `http://` 或 `https://`，不支持 wildcard。 |
| Path | 可选，大小写敏感，会覆盖所有 subpaths，不支持 wildcard 和 query parameters。 |
| Total active users | 同时允许进入 protected host/path 的 active sessions，必须大于 200。官方 best practice 建议设为源站容量的 75%。 |
| New users per minute | 每分钟允许进入的用户阈值，必须大于 200，且小于等于 total active users；官方建议按预期峰值 100% 设置。 |
| Session duration | 用户离开 waiting room 后可直接回来的时间，1 到 30 分钟，默认 5 分钟。 |
| Queueing method | Business 基础能力是 FIFO；Advanced 可用 FIFO、Random、Reject、Passthrough。 |
| Cookies | 必需；Waiting Room 用 cookie 记录用户位置和会话状态。 |

队列方法的取舍：

| 方法 | 适合场景 |
| --- | --- |
| FIFO | 谁先进入等待室，谁先离开；适合排队公平性明确的活动。 |
| Random | 随机放行；适合抽签、发售、需要降低“抢先进入”优势的场景。 |
| Passthrough | 平时全部放行，只采集 traffic analytics 或配合 scheduled event。 |
| Reject | 直接拒绝流量；适合维护页或只在特殊事件期间开放的入口。 |

活动型入口要特别注意 Scheduled Events：

| 项目 | 判断 |
| --- | --- |
| Event overrides | event 期间可覆盖 base waiting room 的 total active users、new users per minute、session duration、queueing method 和模板。 |
| Prequeue | `prequeue_start_time` 必须至少早于 `event_start_time` 5 分钟。 |
| Lottery | prequeue + `shuffle_at_event_start` 可以让活动开始前进入的用户随机排序。 |
| Limits | 每个 waiting room 最多 5 个 events。需要重叠 events 时，官方建议使用不同 waiting rooms。 |
| JSON response | 只适合 Advanced Waiting Room；`Accept` 必须精确为 `application/json`，非浏览器环境必须保存并回传 cookie。 |
| Turnstile | Waiting Room JSON response 不支持 Turnstile，浏览器 HTML response 才能执行 challenge。 |

## Smart Shield

Smart Shield 是源站保护包，不是单一开关。它把“减少回源请求”和“减少源站连接”放在一组能力里。

```text
访客
  │
  ▼
Cloudflare lower-tier data center
  │
  ├─ 命中边缘缓存：不回源
  │
  └─ 未命中
       ▼
     upper-tier data center
       ├─ Smart Tiered Cache: 只有 upper-tier 代表下层回源
       ├─ Connection Reuse: 复用到源站的连接
       ├─ optional Argo: 优化 Cloudflare 到源站路径
       └─ optional Cache Reserve: 持久化缓存可缓存内容
```

主要能力：

| 能力 | 边界 |
| --- | --- |
| Smart Tiered Cache | 所有 Smart Shield packages 可用；动态选择离 origin 低延迟的 upper-tier。 |
| Connection Reuse | 所有 Smart Shield packages 可用；官方文档写明平均减少源站连接 30%。 |
| Smart Shield + Argo | 在基础包上加入 Argo Smart Routing；适合访客离源站远、回源路径是瓶颈的站点。 |
| Regional Tiered Cache | Enterprise plans 或 Smart Shield Advanced；让 lower-tier 先查区域 hub，再到 upper-tier。 |
| Cache Reserve | Smart Shield Advanced；基于 R2 的持久缓存，Advanced included storage 为 2 TB。 |
| Health Checks | Pro / Business / Enterprise 在所有 Smart Shield packages 中可用。 |
| Dedicated CDN Egress IPs | Enterprise，可把回源 IP 固定成专用池，用于源站 allowlist。 |

普通项目的判断顺序：

1. 先确认公开入口是 Proxied，DNS-only 流量不会经过 Smart Shield。
2. 先把 Cache Rules、Cache-Control、静态资源 hash、HTML 缓存边界梳理清楚。
3. 源站还被 cache miss、并发连接、跨区域回源打满时，再看 Smart Shield。
4. 如果 origin 在 AWS / GCP / Azure / Oracle Cloud 这类 public cloud，要考虑 cloud region hint，帮助 Smart Tiered Cache 选对 upper-tier。
5. 修改源站 IP / DNS 时要谨慎，upper-tier 变化可能导致 MISS rate 上升。

## Automatic Platform Optimization

APO 是 WordPress 专项优化。它用 Cloudflare Workers 和 WordPress 插件协作，把原本动态的 WordPress HTML 缓存在 Cloudflare edge，让 TTFB 更稳定。

适合：

| 场景 | 判断 |
| --- | --- |
| WordPress 博客 / 内容站 | 很适合，尤其是源站在共享主机、PHP / MySQL 慢、全球访问多时。 |
| WooCommerce / 登录态 WordPress | 要谨慎测试；APO 会绕过 logged-in / administrator 用户缓存，相关 cookie 也会触发 bypass。 |
| 非 WordPress 站点 | 不适合；用 Cache Rules、Workers Static Assets、应用缓存或自定义 Worker。 |
| WordPress multisite | Cloudflare APO WordPress plugin 不支持 multisite WordPress installation。 |

关键行为：

| 项目 | 判断 |
| --- | --- |
| 插件 | 必须使用 Cloudflare for WordPress plugin 开启 APO。 |
| 内容更新 | WordPress 内容更新时，插件会触发 Cloudflare 边缘内容更新，避免长时间 stale。 |
| 管理用户 | logged-in 或 administrator 用户会 bypass cache，避免私有内容被缓存给其他访客。 |
| Query parameters | 默认有 query string 会 bypass；UTM、`fbclid`、`gclid` 等官方 allowlist 参数可继续用缓存。 |
| Cookies | `wp-`、`wordpress`、`comment_`、`woocommerce_`、`edd_` 等 cookie prefix 会 bypass cache。 |
| Device type | 开启 Cache by Device Type 后，Cloudflare 给源站发送 `CF-Device-Type: mobile/tablet/desktop`，并按设备缓存不同版本。 |
| 验证 | 关键响应头是 `CF-Cache-Status`、`cf-apo-via`、`cf-edge-cache`。检查 HTML 时请求里要带 `accept: text/html`。 |

APO 验证命令：

```bash
curl -svo /dev/null -A "CF" 'https://example.com/' -H 'accept: text/html' 2>&1 | grep 'cf-cache-status\|cf-edge\|cf-apo-via'
```

看到 `cf-cache-status: HIT`、`cf-apo-via: cache` 或 `tcache`、`cf-edge-cache: cache,platform=wordpress`，才说明 APO 路径真正工作。

## 本站当前选择

| 模块 | 当前选择 | 为什么 |
| --- | --- | --- |
| Waiting Room | 不启用 | 文档站没有秒杀、抢票、报名等源站容量事件。 |
| Smart Shield | 暂不启用 | 静态资产由 Cloudflare edge 服务，源站不是瓶颈；先靠 Workers Static Assets 和缓存。 |
| APO | 不启用 | 本站不是 WordPress。 |
| 源站保护 | Proxied DNS + Workers Static Assets + WAF / DDoS 基础能力 | 足够覆盖当前公开文档站。 |

未来触发条件：

| 触发条件 | 可能升级 |
| --- | --- |
| 开源仓库发布、活动报名、课程抢位导致合法用户峰值 | Waiting Room。 |
| 评论 API 或后台 API 出现明显回源和连接压力 | Smart Shield 或 Load Balancing + Health Checks。 |
| 迁入 WordPress 内容站 | APO。 |
| 企业源站需要固定 Cloudflare 回源 IP allowlist | Dedicated CDN Egress IPs。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| Waiting Room 能挡 DDoS。 | 它主要管理合法流量峰值；恶意流量先用 DDoS、WAF、Bot、Rate Limiting。 |
| Waiting Room 应该挂全站。 | 只挂会打满源站的入口；路径会覆盖 subpaths，要小心误伤。 |
| Total active users 写越大越好。 | 官方建议从源站容量的 75% 开始，太大就失去保护意义。 |
| Smart Shield 能替代缓存设计。 | 它建立在可缓存内容和正确代理入口上；缓存策略错了，Shield 也会变贵或效果差。 |
| APO 是通用动态站缓存。 | APO 是 WordPress 插件驱动方案；非 WordPress 不适用。 |
| 看浏览器 DevTools 发现 BYPASS 就以为 APO 失败。 | DevTools 常带 `Cache-Control: no-cache`；用带 `accept: text/html` 的 cURL 验证。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs Waiting Room source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/waiting-room) | 官方 Waiting Room 文档源文件，适合追踪 plans、configuration、queueing methods、events 和 JSON response。 |
| [cloudflare/cloudflare-docs Smart Shield source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/smart-shield) | 官方 Smart Shield 文档源文件，适合追踪 packages、connection reuse、Smart Tiered Cache、Cache Reserve 和 Dedicated CDN Egress IPs。 |
| [cloudflare/cloudflare-docs APO source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/automatic-platform-optimization) | 官方 APO 文档源文件，适合追踪 WordPress plugin、headers、query parameters、device cache 和 troubleshooting。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 用 Terraform 管理 Waiting Room、Rules、WAF、DNS、Load Balancing 等资源。 |
| [cloudflare/cloudflare-go](https://github.com/cloudflare/cloudflare-go) | Cloudflare 官方 Go SDK，适合看 Waiting Room、Zone settings 等 API 自动化。 |

## 事实来源

- [Waiting Room](https://developers.cloudflare.com/waiting-room/)
- [Waiting Room llms.txt](https://developers.cloudflare.com/waiting-room/llms.txt)
- [Waiting Room plans](https://developers.cloudflare.com/waiting-room/plans/)
- [Waiting Room configuration settings](https://developers.cloudflare.com/waiting-room/reference/configuration-settings/)
- [Waiting Room queueing methods](https://developers.cloudflare.com/waiting-room/reference/queueing-methods/)
- [Waiting Room best practices](https://developers.cloudflare.com/waiting-room/reference/best-practices/)
- [Waiting Room scheduled events](https://developers.cloudflare.com/waiting-room/additional-options/create-events/)
- [Waiting Room JSON response](https://developers.cloudflare.com/waiting-room/how-to/json-response/)
- [Smart Shield](https://developers.cloudflare.com/smart-shield/)
- [Smart Shield llms.txt](https://developers.cloudflare.com/smart-shield/llms.txt)
- [Smart Shield get started](https://developers.cloudflare.com/smart-shield/get-started/)
- [Smart Shield connection reuse](https://developers.cloudflare.com/smart-shield/concepts/connection-reuse/)
- [Smart Tiered Cache](https://developers.cloudflare.com/smart-shield/configuration/smart-tiered-cache/)
- [Regional Tiered Cache](https://developers.cloudflare.com/smart-shield/configuration/regional-tiered-cache/)
- [Cache Reserve in Smart Shield](https://developers.cloudflare.com/smart-shield/configuration/cache-reserve/)
- [Dedicated CDN Egress IPs](https://developers.cloudflare.com/smart-shield/configuration/dedicated-egress-ips/)
- [Automatic Platform Optimization](https://developers.cloudflare.com/automatic-platform-optimization/)
- [Automatic Platform Optimization llms.txt](https://developers.cloudflare.com/automatic-platform-optimization/llms.txt)
- [APO about](https://developers.cloudflare.com/automatic-platform-optimization/about/)
- [Activate the Cloudflare WordPress plugin](https://developers.cloudflare.com/automatic-platform-optimization/get-started/activate-cf-wp-plugin/)
- [Verify APO works](https://developers.cloudflare.com/automatic-platform-optimization/get-started/verify-apo-works/)
- [APO query parameters and cached responses](https://developers.cloudflare.com/automatic-platform-optimization/reference/query-parameters/)
- [Cloudflare plans](https://www.cloudflare.com/plans/)
- [APO product page](https://www.cloudflare.com/products/automatic-platform-optimization/)
