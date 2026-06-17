---
title: 安全与网络
description: DNS、SSL/TLS、CDN、DDoS、WAF、Turnstile、Tunnel 和 Zero Trust 的普通项目实践。
---

Cloudflare 最容易被低估的免费能力，不是某个单点产品，而是入口层的一整套组合：DNS、SSL/TLS、CDN、DDoS、WAF、缓存规则、Turnstile、Tunnel。

## 推荐默认组合

| 场景 | 推荐组合 | 说明 |
| --- | --- | --- |
| 公开文档站 | DNS + CDN + SSL/TLS + DDoS + Web Analytics | 先把基础入口交给 Cloudflare，减少源站暴露面。 |
| 有评论或表单 | 成熟评论系统 + 后续 Turnstile | 先复用成熟组件和服务，再按提交量补充防护。 |
| 管理后台 | Tunnel 或 Access + WAF 规则 | 不要把后台裸露到公网。 |
| API 服务 | WAF + Rate Limiting + API schema | 先定义输入边界，再加防刷和安全规则。 |
| 被攻击时 | Under Attack / WAF / DDoS Analytics / Logs | 先保可用，再逐步缩小规则。 |

## DNS

Cloudflare DNS 对 Free、Pro、Business 用户不收 DNS query 费用，也不限制 DNS queries；记录数量、代理状态、DNSSEC 和迁移顺序要看 [DNS 精读](/platform/dns/)。普通项目的最佳实践是：

- 域名统一放 Cloudflare 管理。
- 生产、预览、实验环境用清楚的子域名。
- DNS 记录改动走文档或 IaC 记录，避免“谁改的没人知道”。
- 不要把源站真实 IP 暴露在公开仓库、旧 DNS 记录或错误的直连域名里。

## SSL/TLS

DNS 接入之后，下一步就是把 HTTPS 链路补完整。细节看 [SSL/TLS 精读](/platform/ssl-tls/)，普通项目先抓三件事：

- 边缘证书交给 Universal SSL 自动签发、续期和部署。
- 源站安装公开 CA 证书或 Cloudflare Origin CA 证书。
- SSL/TLS mode 默认目标设为 Full (strict)，不要长期停在 Flexible。

HTTPS 重定向、Automatic HTTPS Rewrites、TLS 1.3、Minimum TLS Version 和 HSTS 都是后续加固项。尤其是 HSTS，要等所有子域都确认稳定后再开。

## CDN 与缓存

CDN 的目标不是“所有东西都缓存”，而是让静态资源尽可能靠近用户。细节看 [Cache / CDN 精读](/platform/cache/)，普通项目先抓三件事：

- 静态 hash 资源长缓存，HTML 短缓存或 revalidate。
- 登录态、后台、用户数据和带敏感 cookie 的响应默认 bypass。
- 内容更新优先靠版本化 URL，其次再用 purge by URL / prefix / tag。

适合缓存：

- JS、CSS、字体、图片。
- 构建后带 hash 的静态资源。
- 不含用户态的公开文档页面。

谨慎缓存：

- 登录后的 HTML。
- 带权限的 API。
- 用户刚提交后需要立即读到的新内容。

本站的选择是：文档页面和 Pagefind 索引作为静态资产服务，讨论组件由第三方评论系统加载。

## DDoS 与 WAF

Cloudflare DDoS Protection 官方标注 available on all plans；WAF 也 available on all plans，但不同计划能力不同。WAF 的计划边界、Custom Rules、Managed Rules、Rate Limiting 和误伤排查看 [WAF 精读](/platform/waf/)。

普通项目先做这几件事：

1. 所有公开域名走 Cloudflare。
2. 登录、评论、上传、搜索 API 加限流。
3. 对后台路径加 Access 或 WAF 规则。
4. 日志里记录请求路径、状态码和必要上下文，不记录密钥。
5. 遇到攻击先保可用，再精细化规则。

WAF 规则不要追求“越多越安全”。更好的顺序是：先启用基础 Managed Rules，再给高风险路径加少量 Custom Rules 和 Rate Limiting，最后根据 Security Events 调整误伤。

## Turnstile

Turnstile 是免费的 CAPTCHA 替代方案，适合表单防刷。但它不是“贴一个前端组件就安全”。

正确做法：

```text
浏览器完成 Turnstile challenge
  ↓
前端提交 token
  ↓
Worker 服务端调用 Siteverify
  ↓
验证通过后才写入 D1 / 调用业务逻辑
```

本站当前没有上 Turnstile。评论系统先交给成熟组件承载，表单提交量或滥用风险上来后，再把 Turnstile 接到需要保护的入口。

## Tunnel 与 Zero Trust

如果你有后台面板、数据库管理界面、内部工具，优先考虑 Tunnel / Access：

- 不开公网端口。
- 不自己写一套粗糙登录。
- 用身份提供商、邮箱、组织策略保护内部入口。

独立开发者最常见的错误，是把管理后台直接挂到公网，再靠一个弱密码顶着。Cloudflare Access 通常比自己临时写登录更可靠。

## 官方资料

- [DNS FAQ](https://developers.cloudflare.com/dns/faq/)
- [SSL/TLS](https://developers.cloudflare.com/ssl/)
- [SSL/TLS features and plans](https://developers.cloudflare.com/ssl/reference/all-features/)
- [Cache plans](https://developers.cloudflare.com/cache/plans/)
- [Cache Rules](https://developers.cloudflare.com/cache/how-to/cache-rules/)
- [Workers Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/)
- [DDoS Protection](https://developers.cloudflare.com/ddos-protection/)
- [WAF](https://developers.cloudflare.com/waf/)
- [WAF availability](https://developers.cloudflare.com/waf/#availability)
- [WAF custom rules](https://developers.cloudflare.com/waf/custom-rules/)
- [Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [Turnstile Plans](https://developers.cloudflare.com/turnstile/plans/)
- [Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
