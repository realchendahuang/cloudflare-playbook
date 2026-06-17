---
title: 安全边界
description: Cloudflare 项目上线前需要检查的入口、写接口、后台、API、密钥和观测边界。
---

最后核对日期：2026-06-18。

安全边界不是“买哪个安全产品”，而是把每个公开入口、写操作、后台入口、密钥和生产资源放到正确的层上。普通项目默认先做最小可验证基线，再按流量、风险和团队复杂度升级。

## 默认顺序

| 顺序 | 先做什么 | 为什么 |
| --- | --- | --- |
| 1 | 域名接入 Cloudflare，公开 Web 记录保持 Proxied。 | 让 CDN、DDoS、WAF、SSL/TLS 和 Security Events 有机会生效。 |
| 2 | SSL/TLS 默认 Full (strict)，开启 HTTPS。 | 不让边缘到源站之间降级成弱链路。 |
| 3 | 静态内容尽量缓存，动态写入单独进 Worker。 | 减少回源和动态计算成本，也减少攻击面。 |
| 4 | 登录、评论、搜索、上传、Webhook、AI 调用先做身份或速率边界。 | 这些是最容易被刷成本、刷库和触发滥用的入口。 |
| 5 | 表单和匿名写操作叠加 Turnstile 服务端验证。 | 前端组件只生成 token，必须在服务端调用 Siteverify。 |
| 6 | 管理后台、预览环境和内部工具用 Access / Tunnel 保护。 | 后台入口不要裸露公网，也不要只靠弱口令。 |
| 7 | 生产密钥走 Cloudflare Secrets 或 Secrets Store。 | 密钥不能进入仓库、前端包、日志和公开文档。 |
| 8 | Security Insights、Security Events 和 Workers Logs 作为复盘入口。 | 配置改完要能看到命中、误伤、错误和趋势。 |

## 上线前基线

| 检查项 | 最小要求 | 适合升级到 |
| --- | --- | --- |
| DNS | Web 入口 Proxied；邮件、验证、第三方服务按需 DNS-only。 | DNS 记录多、多人维护时保留可复核的配置真源。 |
| TLS | Full (strict)、Universal SSL、源站证书有效。 | Advanced Certificate Manager、Authenticated Origin Pulls。 |
| 源站 | 源站 IP 不公开；只允许 Cloudflare IP 或通过 Tunnel 访问。 | Access + Tunnel、Workers VPC、Enterprise 网络能力。 |
| 缓存 | 静态 hash 资源长缓存；HTML 和用户态接口谨慎缓存。 | Cache Rules、Cache Reserve、精细 purge 流程。 |
| WAF | 登录、后台、API、评论、上传配置最小 custom / rate limiting rules。 | Managed Rules、高级 Bot、API Shield、Security Analytics。 |
| Turnstile | 匿名写操作必须服务端验证 token。 | Enterprise Turnstile、更长 analytics、更多 hostnames。 |
| 后台 | Access 应用默认 deny，明确 Allow policy。 | 设备 posture、Gateway、CASB、长期日志。 |
| API | 鉴权、schema、幂等、限流和日志先在应用层做清楚。 | API Shield schema validation、JWT、mTLS、sequence analytics。 |
| 密钥 | 单 Worker 用 Cloudflare Secrets；多 Worker 共享再用 Secrets Store。 | Secrets Store RBAC、审计日志、AI Gateway BYOK。 |
| 数据 | D1 / R2 / KV / Queues 只通过 binding 或受控 API 访问。 | 备份、生命周期、只读 token、分环境资源。 |
| 观测 | 关键写操作有结构化日志，不记录 token、cookie 和正文隐私。 | Workers Logs、Trace Events Logpush、Log Explorer。 |
| 应急 | 知道如何临时加 WAF / Rate Limiting、切缓存、回滚 Worker。 | IaC review、变更审批、演练。 |

## 按项目类型选择

| 项目 | 默认组合 | 暂时不要急着上 |
| --- | --- | --- |
| 文档站 / 官网 | DNS、SSL/TLS、CDN、DDoS、Workers Static Assets、基础 WAF。 | 复杂后台、完整 API Shield、自建评论 UI。 |
| 评论 / 留言 | Worker API、D1、Turnstile、Rate Limiting、最小管理入口。 | 匿名无限写入、高成本 AI 审核。 |
| 文件上传 | Worker 鉴权、R2 private bucket、短期签名 URL、对象大小限制。 | 公开写入 bucket、把 R2 key 下发浏览器。 |
| 小型 SaaS API | 登录态、权限校验、OpenAPI schema、幂等 key、D1 索引。 | 过早拆微服务、过早 Enterprise 安全套件。 |
| 管理后台 | Access + Tunnel、D1 / R2 bindings、最小成员权限。 | 裸露公网后台、自写弱登录。 |
| AI / 搜索接口 | 登录态或配额、AI Gateway、速率限制、日志采样。 | 匿名无限模型调用、无预算提醒。 |

## 写接口保护

写接口包括评论、表单、注册、登录、上传、Webhook、AI 调用、发邮件和数据库修改。它们至少要回答四个问题：

| 问题 | 要求 |
| --- | --- |
| 谁能写 | 登录态、Access、service token、Webhook 签名或 Turnstile。 |
| 能写多少 | WAF Rate Limiting、业务配额、对象大小、频率限制。 |
| 写失败怎么办 | 幂等 key、重试策略、队列、回滚或人工处理。 |
| 怎么追踪 | 结构化日志、Ray ID、业务 ID、Security Events。 |

Turnstile 的关键点是：**前端组件不等于保护完成**。token 有有效期和单次使用限制；服务端必须调用 Siteverify，失败就不要继续写库、发邮件或触发 AI。

## 后台与内网工具

Cloudflare Access 适合保护管理后台、预览环境、数据库面板、内部分析页和运维工具。Access application 默认 deny，用户必须命中 Allow policy 才能访问。

Tunnel 负责让内网服务通过出站连接接入 Cloudflare。顺序很重要：先创建 Access application，再发布 Tunnel public hostname。没有 Access policy 的 published application 仍然会暴露给公网。

如果源站本身可公网访问，还要在源站侧验证 Access token 或开启 `cloudflared` 的 Protect with Access，避免因为网络配置失误绕过 Access。

## API 安全

API Shield 适合公开 API、移动端 API、客户数据 API 和有 OpenAPI schema 的项目。普通项目先把应用层鉴权、schema、速率限制和日志做扎实，再把 API Shield 加到边缘层。

| 阶段 | 做法 |
| --- | --- |
| 先识别 | 明确哪些路径是公开 API，哪些只是前端页面或内部回调。 |
| 先应用层 | 鉴权、schema、幂等、限流和错误日志先在 Worker 或后端完成。 |
| 再边缘层 | 有 schema 后再启用 API Shield，先 log 再 block。 |
| 再高级能力 | JWT validation、mTLS、Sequence Analytics 和 per-session rate limit 只给高风险 API。 |

## 密钥和绑定

密钥边界遵守三条：

- 前端永远拿不到服务端密钥。
- 单 Worker 生产密钥优先用 Cloudflare Secrets。
- 多 Worker、多团队、AI Gateway BYOK 或账号级复用，再用 Secrets Store。

Secrets Store 是账号级密钥中心，和 per-Worker Variables and Secrets 不同。绑定到 Worker 时，代码只通过 `env` 读取，不把密钥写进配置、Markdown、日志或异常响应。

## 观测和复盘

Security Insights 会扫描账号设置、DNS、SSL/TLS、WAF、Access 等配置。Free 计划默认每 7 天扫描一次，Pro / Business 每 3 天，Enterprise 每天；On-demand 可用，但不同计划的手动触发入口要按官方说明确认。

优先处理这些发现：

| 发现 | 为什么重要 |
| --- | --- |
| DNS-only 暴露 Web 源站 | 流量绕过 Cloudflare，WAF、DDoS、Access 都可能失效。 |
| 缺少 HTTPS / HSTS / 旧 TLS | 用户到站点或边缘到源站的链路变弱。 |
| 未部署 WAF Managed Rules 或写接口无限制 | 容易被常见攻击和业务刷量打穿。 |
| Access policy 过宽或 Tunnel 未保护 | 后台和内部工具可能变成公开入口。 |
| 未启用 Turnstile 的高风险表单 | 匿名写操作容易被自动化滥用。 |
| 没有 MFA 的成员账号 | 控制台账号本身成为风险入口。 |

## 应急动作

遇到异常流量、刷接口或源站压力时，按这个顺序处理：

1. 确认请求是否真的经过 Cloudflare：看 DNS proxy status、Ray ID、Security Events。
2. 静态资源先提高缓存命中，避免把静态访问打进 Worker 或源站。
3. 对具体路径加 WAF / Rate Limiting，不要一上来全站粗暴封。
4. 登录、评论、搜索、上传、AI 调用优先加 Turnstile、配额或登录态。
5. Under Attack Mode 只当短期止血，不当长期配置。
6. 攻击结束后复盘规则命中、误伤、成本和日志，不把临时规则永久遗忘。

## 事实来源

- [Protect your origin server](https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/)
- [WAF custom rules](https://developers.cloudflare.com/waf/custom-rules/)
- [WAF rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [DDoS proactive defense](https://developers.cloudflare.com/ddos-protection/best-practices/proactive-defense/)
- [Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Turnstile plans](https://developers.cloudflare.com/turnstile/plans/)
- [Publish a self-hosted application with Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/)
- [Tunnel configuration](https://developers.cloudflare.com/tunnel/configuration/)
- [API Shield get started](https://developers.cloudflare.com/api-shield/get-started/)
- [Secrets Store Workers integration](https://developers.cloudflare.com/secrets-store/integrations/workers/)
- [Security Insights how it works](https://developers.cloudflare.com/security/security-insights/how-it-works/)
