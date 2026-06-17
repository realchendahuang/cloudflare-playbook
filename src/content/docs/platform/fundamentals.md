---
title: Fundamentals
description: Cloudflare 的账号、Zone、代理状态、源站保护、权限和排障入口。
---

最后核对日期：2026-06-18。Fundamentals 不是一个单独产品，而是 Cloudflare 的底层操作边界：账号归谁、域名怎么接入、哪些流量真正经过 Cloudflare、源站有没有被绕开、自动化权限是否过大、出问题时该拿什么证据。

这一页只保留普通项目需要的判断。具体按钮、底层参数和完整参考，请到官方文档查最新口径。

## 一句话判断

Cloudflare 的基础最佳实践不是“把所有开关打开”，而是先确认五件事：账号能交接、域名记录完整、Web 入口是 Proxied、源站不能被公网绕过、自动化不用 Global API Key。

## 先问六个问题

| 问题 | 判断 |
| --- | --- |
| 这个配置属于个人、账号，还是某个域名？ | 先分清 User profile、Account、Zone，避免改错层级。 |
| 这条 DNS 记录是 Web 入口吗？ | 网站和 API 通常 Proxied；邮件、验证、SSH、数据库通常 DNS-only。 |
| 请求有没有真的经过 Cloudflare？ | Active zone + Proxied record + 浏览器响应里能看到 Cloudflare 侧证据，才算进入代理层。 |
| 源站还能不能被直接打到？ | 如果真实 IP 公开、源站不限制来源，WAF 和 DDoS 很容易被绕开。 |
| 谁能改 DNS、账单、成员和部署？ | Super Administrator 要少，但不能只有一个；日常协作按 scope 分权。 |
| 自动化 token 是否最小权限？ | 部署、DNS、账单查询要拆 token；新项目不要使用 Global API Key。 |

## 三层模型

| 层级 | 管什么 | 普通项目怎么用 |
| --- | --- | --- |
| User profile | 登录邮箱、2FA、语言、通知和个人 API Token。 | 这是“人”的身份，不要把项目资产绑死在单个人身上。 |
| Account | 成员、权限、账单、Workers、Pages、D1、R2、KV 等账号级资源。 | 开源项目或团队项目最好使用可交接的长期账号。 |
| Zone | 一个接入 Cloudflare 的域名或子域名。 | DNS、SSL/TLS、WAF、Cache、Rules 大多在这里生效。 |

最常见的误操作，是在账号级产品和 Zone 级产品之间来回找。凡是和某个域名访问有关，先到 Zone；凡是和成员、账单、Workers 平台资源有关，先到 Account。

## 域名接入

| 步骤 | 必看点 |
| --- | --- |
| 添加站点 | 普通 full setup 添加 apex domain，例如 `example.com`。低层级子域接入通常是 Enterprise 场景。 |
| 核对 DNS | Quick scan 不保证完整；必须手动检查 apex、`www`、API、邮件和第三方验证记录。 |
| 处理邮件 | MX、SPF、DKIM、DMARC、邮件服务 CNAME 通常保持 DNS-only。 |
| 处理 DNSSEC | 如果旧 DNS 已启用 DNSSEC，切 nameserver 前先处理旧 DS record。 |
| 修改 nameserver | 到注册商切到 Cloudflare 分配的 nameserver，等待 Zone Active。 |
| 完成 HTTPS | 普通项目目标是 Full (strict)，不要长期停在 Flexible。 |

排障不要一上来改 nameserver。缓存问题先用 Development Mode；单个主机需要绕过代理时，只改那一条记录的 proxy status；全站 Pause 会让 Rules、WAF、Cloudflare 侧 SSL/TLS 等能力同时失效。

## Proxied 和 DNS-only

| 状态 | 含义 | 适合 |
| --- | --- | --- |
| Proxied | DNS 返回 Cloudflare anycast IP，HTTP/HTTPS 流量经过 Cloudflare。 | 网站、公开 API、文档站、需要 WAF / Cache / DDoS / Rules 的入口。 |
| DNS-only | DNS 只返回真实目标，Cloudflare 不代理业务流量。 | 邮件、域名验证、SSH、数据库、部分第三方 SaaS 验证。 |

只有 Proxied 的 HTTP/HTTPS 流量才进入 Cloudflare 代理层。把域名放进 Cloudflare，不代表所有协议、所有端口、所有子域名都被保护。

## 源站保护

| 优先级 | 做法 | 为什么 |
| --- | --- | --- |
| 1 | Web 记录尽量 Proxied，邮件和验证记录 DNS-only。 | 先让公开 Web 入口真正经过 Cloudflare。 |
| 2 | 审计 DNS-only 记录、历史文档和截图，避免暴露源站 IP。 | 攻击者拿到旧 IP 后可以绕过代理。 |
| 3 | 源站防火墙 allowlist Cloudflare IP ranges，再拒绝其他公网来源。 | 这是普通 Web 源站最重要的一步。 |
| 4 | 后台和内网工具优先用 Cloudflare Tunnel + Access。 | 不需要给管理后台开公网入口。 |
| 5 | 需要更强认证时再看 Authenticated Origin Pulls。 | 它解决“请求是否来自 Cloudflare”这个传输层问题。 |

如果源站 IP 曾经公开过，最好换 IP 后再接入，并确认新 IP 不出现在 DNS-only 记录、错误页、监控截图、仓库配置或邮件服务里。

## 权限和自动化

| 场景 | 推荐做法 |
| --- | --- |
| 账号连续性 | 至少两个可信 Super Administrator；2FA backup codes、账单信息和域名注册主体能交接。 |
| 团队协作 | 用成员、角色和 scope 分权，不共享一个登录邮箱、密码和 2FA。 |
| 外包或临时协作 | 给指定 Zone 或资源权限，到期收回。 |
| 部署自动化 | 用最小权限 API Token 或 Account API Token，不用 Super Admin 用户的 Global API Key。 |
| DNS 自动化 | 只给目标 Zone 的 DNS 权限，不给全账号所有域名。 |
| 事故复盘 | 看 Audit Logs、成员权限、User Groups、修改时间线和相关请求证据。 |

Global API Key 是 legacy 全权限钥匙，不适合作为新项目默认方案。API Token 可以限制权限、资源、来源 IP 和有效期，更适合 CI/CD、DNS 自动化和账单读取。

## 排障证据包

| 问题 | 先收集什么 |
| --- | --- |
| 用户打不开页面 | URL、UTC 时间、状态码、用户地区、Ray ID、源站访问日志。 |
| WAF 或 Rules 误伤 | Ray ID、Security Events、触发规则、请求路径、方法和 User-Agent。 |
| 源站 52x | Ray ID、源站错误日志、SSL/TLS 模式、源站防火墙、Cloudflare IP allowlist。 |
| 配置被改 | Audit Logs 里的 actor、action、interface、resource、zone 和时间线。 |
| 自动化失败 | Account ID / Zone ID、token 类型、目标权限、HTTP 状态码和 rate limit 响应。 |

不要把所有问题都归结为“Cloudflare 出问题”。很多 52x 是源站、证书、端口、防火墙、长请求或同步任务造成的。Cloudflare 侧最有价值的线索是 Ray ID 和对应时间窗口。

## 什么时候看别的产品

| 需求 | 下一页 |
| --- | --- |
| 域名解析、记录数量、DNSSEC | [DNS](/platform/dns/) |
| HTTPS、证书、Full (strict) | [SSL/TLS](/platform/ssl-tls/) |
| 缓存、Purge、Cache Rules | [Cache / CDN](/platform/cache/) |
| WAF、Rate Limiting、Bot 防护 | [WAF](/platform/waf/) 和 [安全与网络](/platform/security-networking/) |
| 后台不暴露公网 | [Zero Trust 与企业网络](/platform/zero-trust-networking/) |
| 自有 IP、专线、企业网络 | [自有网络与专线](/platform/private-networking/) |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 以为接入 Cloudflare 就等于所有服务都受保护。 | 只把需要代理的 Web 入口设为 Proxied，并确认真实流量路径。 |
| 邮件、SSH、数据库也开橙云。 | 非 Web 服务通常 DNS-only，后台访问用 Tunnel / Access 或专门产品。 |
| 源站仍允许公网直连。 | 源站只接受 Cloudflare IP、可信伙伴或 Tunnel 流量。 |
| 所有人都是 Super Administrator。 | 按 Account、Zone、Resource 分权。 |
| CI 里放 Global API Key。 | 拆最小权限 API Token，并定期轮换。 |
| 缓存问题就 Pause Cloudflare。 | 先用 Development Mode 或临时 Cache Rule。 |

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [cloudflare/cloudflare-docs Fundamentals source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/fundamentals) | 官方 Fundamentals 文档源文件，适合追踪账号、域名、成员权限、API Token 和排障口径。 |
| [cloudflare/cloudflare-docs DNS source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/dns) | DNS、Proxy status、DNSSEC、Full setup 的官方源文件。 |
| [cloudflare/cloudflare-docs Rules source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/rules) | Rules、Trace、Redirects、Origin Rules、Custom Errors 的官方源文件。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 把 Zone、DNS、rulesets、账号资源纳入 IaC 的主流参考。 |
| [cloudflare/cloudflare-go](https://github.com/cloudflare/cloudflare-go) | 自动化 Cloudflare API 的官方 Go SDK，适合核对资源模型和权限边界。 |

## 官方资料

- [Cloudflare Fundamentals](https://developers.cloudflare.com/fundamentals/)
- [Accounts, zones, and profiles](https://developers.cloudflare.com/fundamentals/concepts/accounts-and-zones/)
- [How Cloudflare DNS works](https://developers.cloudflare.com/fundamentals/concepts/how-cloudflare-works/)
- [Traffic flow through Cloudflare](https://developers.cloudflare.com/fundamentals/concepts/traffic-flow-cloudflare/)
- [Cloudflare IP addresses](https://developers.cloudflare.com/fundamentals/concepts/cloudflare-ip-addresses/)
- [Onboard a domain](https://developers.cloudflare.com/fundamentals/manage-domains/add-site/)
- [Pause Cloudflare](https://developers.cloudflare.com/fundamentals/manage-domains/pause-cloudflare/)
- [Account and domain management best practices](https://developers.cloudflare.com/fundamentals/reference/best-practices/)
- [Protect your origin server](https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/)
- [Policies](https://developers.cloudflare.com/fundamentals/manage-members/policies/)
- [Role scopes](https://developers.cloudflare.com/fundamentals/manage-members/scope/)
- [Audit Logs v2](https://developers.cloudflare.com/fundamentals/account/account-security/audit-logs/)
- [Create API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Global API key](https://developers.cloudflare.com/fundamentals/api/get-started/keys/)
- [API rate limits](https://developers.cloudflare.com/fundamentals/api/reference/limits/)
- [Cloudflare Ray ID](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/)
