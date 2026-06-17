---
title: 安全与网络
description: Cloudflare 安全产品的普通项目基线、免费层边界、升级信号和常见误区。
---

最后核对日期：2026-06-18。

Cloudflare 安全能力不要按产品名背。普通项目先按风险入口处理：公开网站先保证入口正确，写接口加验证和限流，后台从公网收回来，密钥不要进代码，最后用日志和 Security Insights 复盘。

先记住一句：**安全不是把开关全打开，而是把请求放到正确的位置。**

## 先做什么

| 顺序 | 动作 | 为什么 |
| --- | --- | --- |
| 1 | Web 入口走 Proxied，SSL/TLS 用 Full (strict)。 | 请求先进 Cloudflare，源站链路也是 HTTPS。 |
| 2 | 源站限制直连。 | 源站 IP 暴露时，攻击可以绕过 Cloudflare。 |
| 3 | 静态内容缓存，动态和登录态谨慎缓存。 | 先减少源站和 Worker 压力。 |
| 4 | 登录、评论、表单、上传、搜索加 WAF / Rate Limiting / Turnstile。 | 写入口是普通项目最常见的滥用点。 |
| 5 | 后台、预览环境、内网工具走 Access / Tunnel。 | 管理面不要裸露公网。 |
| 6 | 密钥进 Worker secrets 或 Secrets Store。 | 不把 token、数据库凭证、第三方 key 写进源码。 |
| 7 | 每周看 Security Insights 和 Security Events。 | 规则调整要靠证据。 |

## 免费层能做什么

| 能力 | Free / 默认边界 | 普通项目用法 |
| --- | --- | --- |
| DNS + Proxied | DNS queries 不另收费；Web 记录可走 Proxied。 | 域名统一托管，Web 入口优先橙云。 |
| Universal SSL / Full (strict) | 基础证书、TLS 1.3、Always Use HTTPS 等可从 Free 起步。 | 全站 HTTPS，源站也要有有效证书。 |
| DDoS Protection | 所有计划都有 standard, unmetered DDoS protection。 | 公开网站和 API 保持 Proxied。 |
| WAF | Free 有基础 Custom Rules、Rate Limiting Rule、Managed Rules 和 sampled events。 | 保护登录、评论、上传、搜索、后台路径。 |
| Turnstile | Free widgets、hostnames、挑战验证足够普通项目起步。 | 表单、评论、注册、登录和高频提交入口。 |
| Bot Fight Mode | Free 可用，粒度较粗。 | 有简单 bot 时再开，观察误伤。 |
| API Shield 基础能力 | Free 可用 endpoint 和 schema validation。 | 小规模 API 起步；不能替代认证和权限。 |
| Access / Tunnel | Tunnel 可发布应用，Access 保护入口。 | 发布后台前先配 Access policy。 |
| Security Insights | Free 也会扫描配置风险。 | 发现 DNS-only 暴露、TLS、WAF、Access 缺口。 |

## 按风险入口选产品

| 风险入口 | 首选做法 | 升级信号 |
| --- | --- | --- |
| 评论、留言、表单 spam | Turnstile + 服务端验证 + Rate Limiting。 | spam 穿透、正常用户被卡或需要审核流程。 |
| 登录撞库 | Rate Limiting、Managed Challenge、必要时 Turnstile。 | 需要 bot score、设备策略和更长日志。 |
| 搜索接口被刷 | 静态索引优先，动态搜索限频和缓存。 | 查询成本明显上升。 |
| 上传接口被打 | 登录态、短期上传凭证、文件大小/类型校验。 | R2 成本异常或需要异步扫描。 |
| API 被乱打 | 认证、限流、schema、最少日志。 | API 成为核心资产，再看更完整 API Shield。 |
| 后台暴露公网 | Access + Tunnel。 | 团队设备策略、Gateway、长期审计。 |
| AI crawler 抓取过重 | AI Crawl Control、robots.txt、必要时 block。 | 需要内容授权或精细 bot 策略。 |

## 最重要的坑

| 坑 | 怎么避开 |
| --- | --- |
| 只开 Cloudflare，不保护源站。 | 源站防火墙只允许 Cloudflare IP 段和可信运维入口。 |
| Flexible SSL 长期使用。 | 目标设为 Full (strict)。 |
| Turnstile 只放前端。 | 服务端调用 Siteverify，并校验 action、hostname 和 token 状态。 |
| WAF 规则越写越多。 | 先 Managed Rules，再给高风险路径加少量规则。 |
| Tunnel 发布后以为自动私有。 | 先建 Access application，再发布后台和内网工具。 |
| API Shield 当早期必选。 | 早期先做好认证、权限、schema 和限流。 |
| Bot 问题只靠封 IP。 | 先识别路径和行为，再分层处理。 |
| 密钥写进配置或前端。 | Worker secrets；多项目共享再看 Secrets Store。 |

## 常见误区

| 误区 | 更好的理解 |
| --- | --- |
| 安全产品越多越安全。 | 顺序比数量重要：入口、源站、写接口、后台、密钥、证据。 |
| 免费层只是玩具。 | 免费层已经覆盖 DNS、TLS、DDoS、WAF 基础、Turnstile、Security Insights。 |
| 所有流量都该 challenge。 | Challenge 会影响体验，只给高风险路径和异常行为。 |
| 静态站没有安全问题。 | 阅读路径风险低，但评论、搜索、后台、部署密钥仍要保护。 |
| 有 Tunnel 就不用管 Access。 | Tunnel 负责连接，Access 负责谁能访问。 |

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
