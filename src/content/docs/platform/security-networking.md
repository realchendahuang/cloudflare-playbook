---
title: 安全与网络
description: Cloudflare 安全产品的普通项目基线、免费层边界、升级信号和常见误区。
---

最后核对日期：2026-06-18。

Cloudflare 的安全能力不要按产品名背。普通项目更应该按风险入口来理解：公开网站先保证入口正确，写接口再加验证和限流，后台先从公网收回来，密钥不要进代码，最后用日志和 Security Insights 复盘。

先记住一句：**安全不是把开关全打开，而是把请求放到正确的位置。** 个人站、开源文档、小 SaaS 和内部工具，先把免费层用对，通常比一开始追 Bot Management、完整 API Shield 或企业安全套件更有效。

## 先做什么

| 顺序 | 动作 | 为什么 |
| --- | --- | --- |
| 1 | Web 入口走 Proxied，SSL/TLS 目标设为 Full (strict) | 确保请求先进 Cloudflare，源站链路也是 HTTPS。 |
| 2 | 源站限制直连 | 源站 IP 暴露时，攻击可以绕过 Cloudflare。 |
| 3 | 静态内容缓存，动态和登录态谨慎缓存 | 先减少源站和 Worker 压力，再谈防护规则。 |
| 4 | 登录、评论、表单、上传、搜索加 WAF / Rate Limiting / Turnstile | 写入口才是普通项目最常见的滥用点。 |
| 5 | 后台、预览环境、内网工具走 Access / Tunnel | 管理面不要裸露公网。 |
| 6 | 密钥进 Worker secrets 或 Secrets Store | 不要把 token、数据库凭证、第三方 key 写进源码或前端。 |
| 7 | 每周看 Security Insights 和 Security Events | 规则调整要靠证据，不靠感觉。 |

## 免费层能做什么

| 能力 | Free / 默认边界 | 普通项目用法 |
| --- | --- | --- |
| DNS + Proxied | DNS queries 不另收费；Web 记录可以走 Proxied。 | 域名统一托管，Web 入口优先橙云。 |
| Universal SSL / Full (strict) | 基础证书、TLS 1.3、Always Use HTTPS 等可从 Free 起步。 | 全站 HTTPS，源站也要有有效证书。 |
| DDoS Protection | 所有计划都有 standard, unmetered L3-L7 DDoS protection。 | 公开网站和 API 先保持 Proxied。 |
| WAF | WAF available on all plans；Free 有 Custom Rules、1 条 Rate Limiting Rule、Free Managed Ruleset、sampled Security Events。 | 保护登录、评论、上传、搜索、后台路径。 |
| Turnstile | Free 最多 20 widgets、每个 widget 10 hostnames、挑战和验证请求不限量、analytics 7 天。 | 表单、评论、注册、登录和高频提交入口。 |
| Bot Fight Mode | Free 可用，针对简单 bot、云主机来源和 headless browsers。 | 有简单 bot 时再开，观察误伤。 |
| API Shield 基础能力 | Free 可用 Endpoint Management 和 Schema validation：100 saved endpoints、5 schemas、200 kB schema size、Block only。 | 小规模公开 API 起步；不能替代认证和权限。 |
| Tunnel 发布应用 | 通过 public hostname 发布不需要 paid Access plan。 | 发布后台前先配 Access policy，否则仍然是公开应用。 |
| Security Insights | Free 每 7 天自动扫描，支持 on-demand。 | 发现 DNS-only 暴露、TLS、WAF、Access 等配置风险。 |
| AI Crawl Control | Available on all plans。 | 内容站先观察 AI crawler，再决定允许、限制或屏蔽。 |

## 按风险入口选产品

| 风险入口 | 首选做法 | 升级信号 |
| --- | --- | --- |
| 评论、留言、表单 spam | Turnstile + 服务端 Siteverify + Rate Limiting。 | 正常用户被卡、spam 穿透、需要更长分析窗口或审核流程。 |
| 登录撞库 | Rate Limiting、Managed Challenge、必要时 Turnstile。 | 需要 bot score、设备策略、长期日志和更细规则。 |
| 搜索接口被刷 | 静态索引优先，动态搜索限频，可缓存结果先缓存。 | 查询成本明显上升，再看 AI Search 或专用搜索服务。 |
| 上传接口被打 | 登录态或短期上传凭证、文件大小/类型校验、限流。 | 大文件滥用、恶意文件、R2 成本异常、需要异步扫描。 |
| API 被乱打 | 认证、限流、OpenAPI schema、API Shield Free schema validation。 | API 成为核心资产，再看更完整的 API Shield、客户端认证和安全日志。 |
| 后台暴露公网 | Access + Tunnel，源站验证 Access token 或只接受隧道流量。 | 团队设备策略、Gateway、DLP、长期审计。 |
| AI crawler 抓取过重 | AI Crawl Control、Block AI bots、robots.txt 管理。 | 需要内容授权、Pay Per Crawl 或精细 bot 策略。 |
| 安全规则误伤 | 看 Ray ID、Security Events、`cf-mitigated`、用户反馈。 | 需要 Logpush、Log Explorer 或团队化规则审阅。 |

## 最重要的坑

| 坑 | 为什么危险 | 怎么避开 |
| --- | --- | --- |
| 只开 Cloudflare，不保护源站 | 源站 IP 暴露后，攻击可以绕过边缘防护。 | 源站防火墙只允许 Cloudflare IP 段和可信运维入口。 |
| Flexible SSL 长期使用 | 浏览器到 Cloudflare 是 HTTPS，但 Cloudflare 到源站不是完整安全链路。 | 目标设为 Full (strict)。 |
| Turnstile 只放前端 | 前端 widget 不等于业务安全。 | 服务端调用 Siteverify，验证 action、hostname 和 token 状态。 |
| WAF 规则越写越多 | 规则多会增加误伤和维护成本。 | 先 Managed Rules，再给高风险路径加少量规则。 |
| Tunnel 发布后以为自动私有 | 没有 Access policy 的 published application 任何人都能访问。 | 先建 Access application，再发布后台和内网工具。 |
| API Shield 当早期必选 | 早期真正缺的是认证、权限、schema 和限流。 | API 成为资产后再买更完整能力。 |
| Bot 问题只靠封 IP | IP 会变，误伤会扩大。 | 先识别路径和行为，再用限流、Turnstile、Bot 产品分层处理。 |
| 密钥写进配置或前端 | 开源仓库和前端 bundle 都会泄露。 | Worker secrets；多项目共享再看 Secrets Store。 |

## 产品取舍

| 产品 | 普通项目判断 |
| --- | --- |
| [DNS](/platform/dns/) / [SSL/TLS](/platform/ssl-tls/) / [Cache](/platform/cache/) | 所有站点的入口基线。 |
| [DDoS Protection](/platform/ddos/) | 默认依赖，重点是 Proxied 和源站隐藏。 |
| [WAF](/platform/waf/) | 登录、后台、API、评论、上传的第一层规则。 |
| Turnstile | 人机判断，适合写入口，不适合当万能登录系统。 |
| Bots | 有真实 bot 成本后再深入；Free 的 Bot Fight Mode 粒度较粗。 |
| API Shield | 有公开 API、移动端 API、客户数据 API 后再系统化使用。 |
| Access / Tunnel | 后台、预览环境、内网工具的默认选择。 |
| Secrets Store | Open beta；多 Worker、多环境、多团队共享密钥时再引入。 |
| Security Center / Security Insights | 每周巡检配置风险，Free 也有价值。 |
| Key Transparency Auditor | E2EE 公钥透明度专项，普通网站默认不用。 |
| Firewall Rules deprecated | 只作为旧系统迁移资料；新项目用 WAF Custom Rules / Ruleset Engine。 |

## 常见误区

| 误区 | 更好的理解 |
| --- | --- |
| 安全产品越多越安全。 | 顺序比数量重要：入口、源站、写接口、后台、密钥、证据。 |
| 免费层只是玩具。 | 免费层已经覆盖 DNS、TLS、DDoS、WAF 基础、Turnstile、Security Insights 等基线能力。 |
| 所有流量都该 challenge。 | Challenge 会影响体验，只给高风险路径和异常行为。 |
| 静态站没有安全问题。 | 静态阅读路径风险低，但评论、搜索、后台、部署密钥仍然需要保护。 |
| 有 Tunnel 就不用管 Access。 | Tunnel 负责连接，Access 负责谁能访问。 |
| Security Center 是企业才看的。 | Security Insights 默认扫描所有账户和 zone，Free 计划也能做配置巡检。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs Turnstile source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/turnstile) | Turnstile plans、server validation、analytics。 |
| [cloudflare/cloudflare-docs API Shield source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/api-shield) | Endpoint Management、schema validation、plans。 |
| [cloudflare/cloudflare-docs Bots source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/bots) | Bot Fight Mode、Super Bot Fight Mode、Bot Management、AI bots。 |
| [cloudflare/cloudflare-docs Security Center source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/security-center) | Security Center 和 Security Insights 源文件。 |
| [cloudflare/cloudflare-docs Cloudflare One source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/cloudflare-one) | Access、Tunnel、Gateway 和 Zero Trust 限制。 |
| [cloudflare/cloudflared](https://github.com/cloudflare/cloudflared) | Tunnel daemon 源码。 |
| [cloudflare/skills WAF reference](https://github.com/cloudflare/skills/tree/main/skills/cloudflare/references/waf) | WAF 规则模式和常见误区。 |

## 事实来源

- [WAF](https://developers.cloudflare.com/waf/)
- [DDoS Protection](https://developers.cloudflare.com/ddos-protection/)
- [Turnstile Plans](https://developers.cloudflare.com/turnstile/plans/)
- [API Shield Plans](https://developers.cloudflare.com/api-shield/plans/)
- [Bot solutions Free plan](https://developers.cloudflare.com/bots/plans/free/)
- [Security Insights how it works](https://developers.cloudflare.com/security/security-insights/how-it-works/)
- [Security Center](https://developers.cloudflare.com/security-center/)
- [Published applications with Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/)
- [Publish a self-hosted application with Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/)
- [Cloudflare One account limits](https://developers.cloudflare.com/cloudflare-one/account-limits/)
- [Secrets Store](https://developers.cloudflare.com/secrets-store/)
- [AI Crawl Control](https://developers.cloudflare.com/ai-crawl-control/)
- [Firewall Rules deprecated](https://developers.cloudflare.com/firewall/)
- [WAF custom rules](https://developers.cloudflare.com/waf/custom-rules/)
