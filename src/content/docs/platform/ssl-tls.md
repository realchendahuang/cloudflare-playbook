---
title: SSL/TLS
description: Cloudflare SSL/TLS 的配置顺序、免费边界、Full (strict)、HSTS 和源站保护。
---

最后核对日期：2026-06-18。SSL/TLS 的计划权限、证书签发和浏览器兼容会变化；上线前以 Cloudflare SSL/TLS 官方页面为准。

SSL/TLS 只要先做对一件事：访客到 Cloudflare、Cloudflare 到源站，两段都加密。默认目标是 **Universal SSL + Full (strict)**。

## 先记住

| 问题 | 判断 |
| --- | --- |
| 文档站、官网、博客、前端应用 | Universal SSL 通常够用。 |
| 有 VPS / NGINX / Caddy 源站 | 源站装公开 CA 或 Cloudflare Origin CA 证书，然后用 Full (strict)。 |
| Workers / Pages 自定义域名 | 多数证书由 Cloudflare 管理，不要自加证书运维。 |
| 还在用 Flexible | 只适合短期迁移，长期会明文回源并容易循环跳转。 |
| 想开 HSTS preload | 等所有子域、证书续期和回滚路径稳定后再说。 |
| 想上传自有证书 | 通常不用；先看计划边界和真实兼容需求。 |

## 免费与计划边界

| 能力 | Free 是否够用 | 实践判断 |
| --- | --- | --- |
| Universal SSL | 通常够用 | 自动签发和续期，覆盖多数站点。 |
| Origin CA | 可用 | 源站只经 Cloudflare 访问时好用；不能给浏览器直连用。 |
| Full / Full (strict) | 可用 | 新项目直接以 Full (strict) 为目标。 |
| Always Use HTTPS | 可用 | Full (strict) 正常后再开。 |
| HSTS | 可用 | 强但难回滚，先短周期验证。 |
| Authenticated Origin Pulls | 可用 | 有真实源站且担心绕过 Cloudflare 时再评估。 |
| 高阶证书能力 | 多为付费或高阶计划 | 有自定义证书、旧客户端或合规要求时再看。 |

## 默认顺序

| 顺序 | 做什么 |
| --- | --- |
| 1 | DNS 记录确认 Proxied。 |
| 2 | 等 Universal SSL 可用。 |
| 3 | 源站准备公开 CA 或 Cloudflare Origin CA 证书。 |
| 4 | SSL/TLS mode 设为 Full (strict)。 |
| 5 | 开 Always Use HTTPS。 |
| 6 | 按用户群体设置最低 TLS 版本。 |
| 7 | 最后评估 HSTS。 |

不要同时在源站和 Cloudflare 写多套 HTTPS 跳转，循环跳转很常见，也很浪费排查时间。

## 加密模式

| 模式 | 判断 |
| --- | --- |
| Off | 公开生产站点不要用。 |
| Flexible | 只适合迁移期，不适合长期。 |
| Full | 可过渡，但不严格校验证书。 |
| Full (strict) | 默认目标。 |
| Strict (SSL-Only Origin Pull) | 企业级源站保护能力，早期先不用。 |

Full (strict) 的源站证书可以来自公开可信 CA，也可以来自 Cloudflare Origin CA；证书要未过期，并覆盖被请求的主机名。

## HSTS 慎用

| 开启前检查 | 为什么 |
| --- | --- |
| 所有公开子域都能稳定 HTTPS | `includeSubDomains` 会一起锁住。 |
| 不会暂停 Cloudflare 或改回 DNS-only | 浏览器仍会强制 HTTPS。 |
| 证书续期和域名验证稳定 | 证书失效时用户很难绕过。 |
| HTTP 资源已治理 | Always Use HTTPS 不会自动修好 mixed content。 |

先开 Always Use HTTPS，再用短 `max-age` 观察。不要一上来 preload。

## 源站保护

Authenticated Origin Pulls 可以让源站只接受经过 Cloudflare 的请求。纯 Workers、Pages、Static Assets 通常不需要；有 VPS 源站并承载登录、后台、支付或写接口时再评估。

更靠前的动作仍然是：Web 记录 Proxied、源站防火墙只允许 Cloudflare IP、隐藏真实源站地址。

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 长期用 Flexible。 | 尽快迁到 Full (strict)。 |
| 证书刚可用就开 HSTS preload。 | 先短周期验证，再决定是否扩大范围。 |
| Origin CA 当公开证书。 | 它只适合 Cloudflare 回源，不适合浏览器直连。 |
| 普通站点先买 Custom Certificate。 | Universal SSL 通常已经够用。 |
| 只看边缘证书。 | Full (strict) 还要求源站证书有效。 |

## 事实来源

| 来源 | 用途 |
| --- | --- |
| [SSL/TLS Overview](https://developers.cloudflare.com/ssl/) | SSL/TLS 官方入口。 |
| [Encryption modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/) | Off、Flexible、Full、Full strict。 |
| [Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/) | 推荐目标模式。 |
| [Universal SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/) | 免费边缘证书。 |
| [Origin CA](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/) | 源站证书。 |
| [Authenticated Origin Pulls](https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/) | 回源认证。 |
| [HSTS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/) | HSTS 风险和配置。 |
