---
title: SSL/TLS
description: Cloudflare SSL/TLS 的普通项目配置顺序、免费边界、证书选择、Full (strict)、HTTPS 重定向、HSTS 与源站保护。
---

最后核对日期：2026-06-18。SSL/TLS 的计划权限、证书签发和浏览器兼容会变化，上线前以 Cloudflare SSL/TLS 官方页面为准。

SSL/TLS 要解决的是两段连接：访客到 Cloudflare，Cloudflare 到源站。普通项目不要把它做复杂，先追求一件事：**边缘证书交给 Cloudflare，源站连接用 Full (strict)，重定向和 HSTS 等稳定后再开。**

## 先记住

| 问题 | 判断 |
| --- | --- |
| 只是文档站、官网、博客、前端应用？ | Universal SSL 通常够用，公开 Web 记录保持 Proxied。 |
| 有自己的 VPS / NGINX / Caddy 源站？ | 源站装公开 CA 或 Cloudflare Origin CA 证书，然后使用 Full (strict)。 |
| 用 Workers / Pages 自定义域名？ | 多数证书由 Cloudflare 管理，不要自己加一层证书运维。 |
| 还在用 Flexible？ | 只适合短期迁移。长期会留下明文回源和重定向循环风险。 |
| 想开 HSTS preload / includeSubDomains？ | 等所有子域、回滚路径和证书续期都稳定后再评估。 |
| 想上传自己的证书或控制 CA / 有效期 / 多级子域？ | 先看 Advanced Certificate Manager、Total TLS、Custom Certificates 的计划边界。 |

## 免费与计划边界

| 能力 | Free | Pro / Business | Enterprise | 普通项目判断 |
| --- | ---: | ---: | ---: | --- |
| Universal SSL | 支持 | 支持 | 支持 | 免费自动签发和续期，普通站点默认够用。 |
| Origin CA | 支持 | 支持 | 支持 | 源站只经 Cloudflare 访问时很省心；不要用于浏览器直连源站。 |
| Full / Full (strict) | 支持 | 支持 | 支持 | 新项目直接以 Full (strict) 为目标。 |
| Strict (SSL-Only Origin Pull) | 不支持 | 不支持 | 支持 | Enterprise-only；普通项目先不用。 |
| Always Use HTTPS | 支持 | 支持 | 支持 | Full (strict) 正常后再开。 |
| Automatic HTTPS Rewrites | 支持 | 支持 | 支持 | 只能辅助 mixed content，不能代替内容治理。 |
| HSTS | 支持 | 支持 | 支持 | 免费可用，但风险来自错误配置，不是费用。 |
| TLS 1.3 / Minimum TLS Version | 支持 | 支持 | 支持 | 全站最低 TLS 版本免费可配；per-hostname 控制看 Advanced Certificate Manager。 |
| Authenticated Origin Pulls | 支持 | 支持 | 支持 | 有真实源站且担心直连绕过 Cloudflare 时再上。 |
| Advanced Certificates | 付费 add-on | 付费 add-on | 付费 add-on | 需要自定义主机名列表、有效期、CA 时再买。 |
| Custom Certificates | 不支持 | Business 支持 | 支持 | 需要上传自有证书、EV 或遗留客户端兼容时再看。 |
| Keyless SSL | 不支持 | 不支持 | Enterprise paid add-on | 私钥不能离开自有环境的合规场景。 |

Free 计划的 Universal SSL 面向现代客户端；普通 Web 用户通常没问题。面向老旧设备、嵌入式设备或传统企业客户端时，要单独测试兼容性。

## 默认顺序

| 顺序 | 做什么 | 不要急着做什么 |
| --- | --- | --- |
| 1 | DNS 记录先确认 Proxied。 | 还没走 Cloudflare 代理就讨论 WAF、HSTS、AOP。 |
| 2 | 等 Universal SSL 变为可用。 | 为普通站点过早买自定义证书。 |
| 3 | 源站准备公开 CA 或 Cloudflare Origin CA 证书。 | 让 Cloudflare 到源站继续明文 HTTP。 |
| 4 | SSL/TLS mode 设为 Full (strict)。 | 长期停在 Flexible 或 Full。 |
| 5 | 开 Always Use HTTPS。 | 同时在源站和 Cloudflare 写多套跳转。 |
| 6 | 开 TLS 1.3，按用户群体设置最低 TLS 版本。 | 为了“更安全”直接踢掉还在使用的真实客户端。 |
| 7 | 最后评估 HSTS。 | 一上来就 preload、includeSubDomains、长 max-age。 |

## 加密模式怎么选

| 模式 | 判断 |
| --- | --- |
| Off | 公开生产站点不要用。 |
| Flexible | 访客到 Cloudflare 是 HTTPS，Cloudflare 到源站是 HTTP。只适合迁移期，不适合长期。 |
| Full | 到源站也走 HTTPS，但不严格校验证书。可作过渡，不是最终状态。 |
| Full (strict) | 到源站走 HTTPS，并校验证书有效、未过期、主机名匹配。普通项目默认目标。 |
| Strict (SSL-Only Origin Pull) | Enterprise-only，强制回源始终 HTTPS。普通项目先不用。 |

Full (strict) 的源站证书可以来自公开可信 CA，也可以来自 Cloudflare Origin CA。证书必须未过期，并且要覆盖被请求的主机名。

## 证书怎么选

| 场景 | 建议 |
| --- | --- |
| 根域名和一级子域名 | Universal SSL。Full setup 下覆盖根域和一级子域名。 |
| 更深层级子域名很多 | 先整理域名结构；确实需要再看 Total TLS 或 Advanced Certificates。 |
| 源站只允许 Cloudflare 代理访问 | Cloudflare Origin CA。 |
| 源站需要被浏览器直连 | 用公开可信 CA，例如 Let's Encrypt。 |
| 第三方 SaaS 源站 | 按对方文档要求配置，不要假设 Origin CA 可用。 |
| 需要上传自有证书 | Business / Enterprise 的 Custom Certificates。 |
| 私钥不能离开自有环境 | Enterprise Keyless SSL。 |

Origin CA 有两个坑要记住：浏览器不信任它，所以不能用于直连源站；Cloudflare 当前不会发送 Origin CA 到期提醒，所以要放进自己的证书台账。

## HTTPS 与 HSTS

Always Use HTTPS 是把访客的 HTTP 请求跳到 HTTPS。Cloudflare 官方建议不要在源站重复做同类跳转，否则容易产生 redirect loop。

HSTS 是浏览器侧承诺：浏览器记住这个域名必须用 HTTPS。它很强，也很难回滚。开启前先确认：

| 检查项 | 为什么 |
| --- | --- |
| 所有公开子域都能稳定 HTTPS | `includeSubDomains` 会把子域一起锁住。 |
| 不会暂停 Cloudflare 或把记录改回 DNS-only | HSTS 仍会让浏览器强制 HTTPS。 |
| 证书续期、CAA、DCV 都稳定 | 证书失效时用户不能轻易绕过。 |
| HTTP 资源已经治理 | Always Use HTTPS 不会自动修好 mixed content。 |

普通项目可以先开 Always Use HTTPS，再观察一段时间。HSTS 先用短 max-age 验证，不要一开始就 preload。

## 源站保护

Authenticated Origin Pulls 是 Cloudflare 到源站的 mTLS。它可以让源站只接受经过 Cloudflare 的请求，避免源站 IP 暴露后被绕过。

| 场景 | 判断 |
| --- | --- |
| 纯 Workers / Pages / Static Assets | 通常不需要。 |
| 有 VPS 源站，且承载登录、支付、后台或写接口 | 值得评估。 |
| 只是普通静态网站源站 | 先限制源站只允许 Cloudflare IP，再看是否需要 AOP。 |
| SSL/TLS mode 还是 Off 或 Flexible | 不适用，先把模式改到 Full / Full (strict)。 |

Global AOP 只能证明请求来自 Cloudflare 网络；如果要证明请求来自自己的账号，使用 zone-level 或 per-hostname AOP，并准备自己的证书和源站配置能力。

## 不要这样用

| 做法 | 问题 |
| --- | --- |
| 长期用 Flexible | 回源不加密，且最容易和源站 HTTPS 跳转打架。 |
| 证书刚可用就开 HSTS preload | 一旦子域或证书链出问题，浏览器侧很难快速回滚。 |
| 把 Origin CA 当公开证书 | 用户直连源站会看到不受信任证书。 |
| 为普通站点先买 Custom Certificate | 大多数站点 Universal SSL 已经够用。 |
| 在源站和 Cloudflare 都写 HTTPS 跳转 | 容易产生循环，排查成本高。 |
| 只看边缘证书，不看源站证书 | Full (strict) 的关键是源站证书也必须有效。 |

## GitHub 开源参考

| 仓库 | 可以学什么 |
| --- | --- |
| [cloudflare/cloudflare-docs SSL/TLS source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ssl) | 官方 SSL/TLS 文档源文件，适合追踪计划边界和功能变更。 |

## 事实来源

- [SSL/TLS Overview](https://developers.cloudflare.com/ssl/)
- [Get started](https://developers.cloudflare.com/ssl/get-started/)
- [Encryption modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/)
- [Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)
- [Strict (SSL-Only Origin Pull)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/ssl-only-origin-pull/)
- [Universal SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/)
- [Origin CA](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)
- [Authenticated Origin Pulls](https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/)
- [Always Use HTTPS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/)
- [Automatic HTTPS Rewrites](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/automatic-https-rewrites/)
- [HSTS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/)
- [Minimum TLS Version](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/minimum-tls/)
- [SSL/TLS features and plans](https://developers.cloudflare.com/ssl/reference/all-features/)
- [Browser compatibility](https://developers.cloudflare.com/ssl/reference/browser-compatibility/)
