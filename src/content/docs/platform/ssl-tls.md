---
title: SSL/TLS
description: Cloudflare SSL/TLS 的配置顺序、免费边界和源站保护。
---

SSL/TLS 只要先做对一件事：访客到 Cloudflare、Cloudflare 到源站，两段都加密。默认目标是 **Universal SSL + Full (strict)**。

## 先记住

| 问题 | 判断 |
| --- | --- |
| 文档站、官网、博客、前端应用 | Universal SSL 通常够用。 |
| 有 VPS / NGINX / Caddy 源站 | 源站装公开 CA 或 Cloudflare Origin CA 证书，然后用 Full (strict)。 |
| Workers / Pages 自定义域名 | 多数证书由 Cloudflare 管理。 |
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
| 1 | DNS 记录确认开启代理。 |
| 2 | 等 Universal SSL 可用。 |
| 3 | 源站准备公开 CA 或 Cloudflare Origin CA 证书。 |
| 4 | SSL/TLS 模式设为 Full (strict)。 |
| 5 | 开 Always Use HTTPS。 |
| 6 | 按用户群体设置最低 TLS 版本。 |
| 7 | 最后评估 HSTS。 |

HTTPS 跳转只保留一条清晰路径，避免源站和 Cloudflare 同时改写造成循环跳转。

## 源站保护

Authenticated Origin Pulls 可以让源站只接受经过 Cloudflare 的请求。纯 Workers、Pages、Static Assets 通常不需要；有 VPS 源站并承载登录、后台、支付或写接口时再评估。

更靠前的动作仍然是：网站记录开启代理、源站防火墙只允许 Cloudflare IP、隐藏真实源站地址。

起步阶段只抓主线：Flexible 只用于短期迁移；Full (strict) 正常后再开 HTTPS 强制跳转；HSTS 先短周期验证，preload 放到所有子域稳定后。
