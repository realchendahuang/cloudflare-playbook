---
title: 安全与网络
description: Cloudflare 安全产品的入口顺序、免费层边界和升级信号。
---

最后核对日期：2026-06-18。

安全能力先按风险入口处理：公开网站保证入口正确，写接口加验证和限流，后台从公网收回来，密钥不要进代码，最后用日志和 Security Insights 复盘。

先记住一句：**安全不是把开关全打开，而是把请求放到正确的位置。**

## 先做什么

| 顺序 | 动作 | 为什么 |
| --- | --- | --- |
| 1 | Web 入口走 Proxied，SSL/TLS 用 Full (strict)。 | 请求先进 Cloudflare，源站链路也是 HTTPS。 |
| 2 | 源站限制直连。 | 源站 IP 暴露时，攻击可以绕过 Cloudflare。 |
| 3 | 静态内容缓存，动态和登录态谨慎缓存。 | 先减少源站和 Worker 压力。 |
| 4 | 登录、评论、表单、上传、搜索加 WAF / Rate Limiting / Turnstile。 | 写入口最容易被刷。 |
| 5 | 后台、预览环境、内网工具走 Access / Tunnel。 | 管理面不要裸露公网。 |
| 6 | 密钥进 Worker secrets 或 Secrets Store。 | 不把访问凭证、数据库凭证、第三方密钥写进仓库。 |
| 7 | 每周看 Security Insights 和 Security Events。 | 规则调整要靠证据。 |

## 按风险入口选产品

| 风险入口 | 首选做法 | 升级信号 |
| --- | --- | --- |
| 评论、留言、表单 spam | Turnstile + 服务端验证 + Rate Limiting。 | spam 穿透、正常用户被卡或需要审核流程。 |
| 登录撞库 | Rate Limiting、挑战验证、必要时 Turnstile。 | 需要更细 bot 判断、设备策略和更长日志。 |
| 搜索接口被刷 | 静态索引优先，动态搜索限频和缓存。 | 查询成本明显上升。 |
| 上传接口被打 | 登录态、短期上传凭证、文件大小/类型校验。 | R2 成本异常或需要异步扫描。 |
| API 被乱打 | 认证、限流、请求格式校验、最少日志。 | API 成为核心资产，再看更完整 API Shield。 |
| 后台暴露公网 | Access + Tunnel。 | 团队设备策略、Gateway、长期审计。 |
| AI crawler 抓取过重 | robots.txt、AI Crawl Control、必要时 block。 | 需要内容授权或更细 bot 策略。 |

## 避坑

| 坑 | 怎么避开 |
| --- | --- |
| 只开 Cloudflare，不保护源站。 | 源站防火墙只允许 Cloudflare IP 段和可信运维入口。 |
| Flexible SSL 长期使用。 | 目标设为 Full (strict)。 |
| Turnstile 只放前端。 | 服务端调用 Siteverify，并校验动作、域名和验证状态。 |
| WAF 规则越写越多。 | 先 Managed Rules，再给高风险路径加少量规则。 |
| Tunnel 发布后以为自动私有。 | 先建 Access application，再发布后台和内网工具。 |
| API Shield 当早期必选。 | 早期先做好认证、权限、请求格式和限流。 |
| Bot 问题只靠封 IP。 | 先识别路径和行为，再分层处理。 |
| 密钥写进配置或前端。 | Worker secrets；多项目共享再看 Secrets Store。 |

## 事实来源

- [WAF](https://developers.cloudflare.com/waf/)
- [DDoS Protection](https://developers.cloudflare.com/ddos-protection/)
- [Turnstile Plans](https://developers.cloudflare.com/turnstile/plans/)
- [API Shield Plans](https://developers.cloudflare.com/api-shield/plans/)
- [Bot solutions Free plan](https://developers.cloudflare.com/bots/plans/free/)
- [Security Insights how it works](https://developers.cloudflare.com/security/security-insights/how-it-works/)
- [Published applications with Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/)
- [Publish a self-hosted application with Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/)
- [Secrets Store](https://developers.cloudflare.com/secrets-store/)
