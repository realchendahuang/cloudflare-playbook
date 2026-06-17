---
title: 安全与网络
description: DNS、CDN、DDoS、WAF、Turnstile、Tunnel 和 Zero Trust 的普通项目实践。
---

# 安全与网络

Cloudflare 最容易被低估的免费能力，不是某个单点产品，而是入口层的一整套组合：DNS、CDN、HTTPS、DDoS、WAF、缓存规则、Turnstile、Tunnel。

## 推荐默认组合

| 场景 | 推荐组合 | 说明 |
| --- | --- | --- |
| 公开文档站 | DNS + CDN + SSL/TLS + DDoS + Web Analytics | 先把基础入口交给 Cloudflare，减少源站暴露面。 |
| 有评论或表单 | Worker 限流 + 蜜罐 + 后续 Turnstile | 保持自由提交，刷屏严重再加 Turnstile。 |
| 管理后台 | Tunnel 或 Access + WAF 规则 | 不要把后台裸露到公网。 |
| API 服务 | WAF + Rate Limiting + API schema | 先定义输入边界，再加防刷和安全规则。 |
| 被攻击时 | Under Attack / WAF / DDoS Analytics / Logs | 先保可用，再逐步缩小规则。 |

## DNS

Cloudflare DNS 对 Free、Pro、Business 用户不收 DNS query 费用，但 DNS 记录数量有计划上限。普通项目的最佳实践是：

- 域名统一放 Cloudflare 管理。
- 生产、预览、实验环境用清楚的子域名。
- DNS 记录改动走文档或 IaC 记录，避免“谁改的没人知道”。
- 不要把源站真实 IP 暴露在公开仓库、旧 DNS 记录或错误的直连域名里。

## CDN 与缓存

CDN 的目标不是“所有东西都缓存”，而是让静态资源尽可能靠近用户。

适合缓存：

- JS、CSS、字体、图片。
- 构建后带 hash 的静态资源。
- 不含用户态的公开文档页面。

谨慎缓存：

- 登录后的 HTML。
- 带权限的 API。
- 用户刚提交后需要立即读到的新内容。

本站的选择是：文档页面和 Pagefind 索引作为静态资产服务，评论 API 不缓存。

## DDoS 与 WAF

Cloudflare DDoS Protection 官方标注 available on all plans；WAF 也 available on all plans，但不同计划能力不同。

普通项目先做这几件事：

1. 所有公开域名走 Cloudflare。
2. 登录、评论、上传、搜索 API 加限流。
3. 对后台路径加 Access 或 WAF 规则。
4. 日志里记录请求路径、状态码和必要上下文，不记录密钥。
5. 遇到攻击先保可用，再精细化规则。

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

本站当前没有上 Turnstile，因为目标是自由评论。先用蜜罐字段和 IP 哈希限流，只有出现明显刷屏再加 Turnstile。

## Tunnel 与 Zero Trust

如果你有后台面板、数据库管理界面、内部工具，优先考虑 Tunnel / Access：

- 不开公网端口。
- 不自己写一套粗糙登录。
- 用身份提供商、邮箱、组织策略保护内部入口。

独立开发者最常见的错误，是把管理后台直接挂到公网，再靠一个弱密码顶着。Cloudflare Access 通常比自己临时写登录更可靠。

## 官方资料

- [DNS FAQ](https://developers.cloudflare.com/dns/faq/)
- [Cache plans](https://developers.cloudflare.com/cache/plans/)
- [DDoS Protection](https://developers.cloudflare.com/ddos-protection/)
- [WAF](https://developers.cloudflare.com/waf/)
- [Turnstile Plans](https://developers.cloudflare.com/turnstile/plans/)
- [Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
