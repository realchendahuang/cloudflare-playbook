---
title: Fundamentals
description: Cloudflare 账号、Zone、代理状态、源站保护、权限和排障入口。
---

最后核对日期：2026-06-18。Fundamentals 是 Cloudflare 的底层边界：账号归谁、域名怎么接入、哪些请求真的经过 Cloudflare、源站能不能被绕过、自动化权限是否过大。

## 先记住

| 问题 | 判断 |
| --- | --- |
| 配置属于谁？ | User profile 是人，Account 是团队和资源，Zone 是域名。先分清层级。 |
| Web 入口有没有进 Cloudflare？ | Active zone + Proxied DNS 记录，才会走 Cloudflare 代理层。 |
| 源站还能不能直连？ | 真实 IP 公开时，WAF、DDoS、Cache 都可能被绕过。 |
| 谁能改账号和域名？ | Super Administrator 要少，但不能只有一个。 |
| 自动化用什么权限？ | 用最小权限 API 访问凭证，不把全局密钥放进 CI。 |

## 三层模型

| 层级 | 管什么 | 实践判断 |
| --- | --- | --- |
| User profile | 登录邮箱、2FA、个人 API 访问凭证。 | 不要把项目资产绑死在单个人身上。 |
| Account | 成员、账单、Workers、Pages、D1、R2、KV。 | 开源或团队项目用可交接的长期账号。 |
| Zone | DNS、SSL/TLS、WAF、Cache、Rules。 | 凡是和域名访问有关，先到 Zone 看。 |

## 域名接入顺序

| 顺序 | 做什么 |
| --- | --- |
| 1 | 添加 apex domain，例如 `example.com`。 |
| 2 | 核对 DNS，不要只信 quick scan。 |
| 3 | 邮件、验证、SSH、数据库记录保持 DNS-only。 |
| 4 | 如果旧 DNS 已启用 DNSSEC，先处理旧 DS record。 |
| 5 | 到注册商切 nameserver，等 Zone Active。 |
| 6 | Web 记录设为 Proxied，目标 TLS 模式是 Full (strict)。 |

排障时不要一上来 Pause Cloudflare。缓存问题先用 Development Mode 或临时 Cache Rule；单个主机要绕过代理，只改那条记录。

## Proxied 与 DNS-only

| 状态 | 适合 |
| --- | --- |
| Proxied | 网站、公开 API、文档站、需要 WAF / Cache / DDoS / Rules 的入口。 |
| DNS-only | 邮件、域名验证、SSH、数据库、部分第三方 SaaS 验证。 |

把域名放进 Cloudflare，不代表所有协议、所有端口、所有子域名都受保护。只有经过代理层的 HTTP/HTTPS 请求，才进入 WAF、Cache、DDoS 和 Rules 链路。

## 源站保护

| 优先级 | 做法 |
| --- | --- |
| 1 | Web 记录 Proxied，邮件和验证记录 DNS-only。 |
| 2 | 清理暴露源站 IP 的 DNS-only 记录、旧文档、截图和监控配置。 |
| 3 | 源站防火墙只允许 Cloudflare IP、可信运维入口或 Tunnel。 |
| 4 | 后台和内网工具优先用 Tunnel + Access。 |
| 5 | 源站承载登录、支付或后台时，再评估 Authenticated Origin Pulls。 |

如果源站 IP 已经泄露，最好换 IP 后再接入，并确认新 IP 不出现在公开记录和仓库配置里。

## 权限和排障

| 场景 | 最小做法 |
| --- | --- |
| 账号连续性 | 至少两个可信管理员，2FA backup codes 和账单信息能交接。 |
| 团队协作 | 按 Account、Zone、Resource 分权，不共享登录邮箱。 |
| 部署自动化 | 用最小权限 API 访问凭证；DNS 自动化只给目标 Zone 权限。 |
| 配置被改 | 查 Audit Logs，看 actor、action、resource、zone 和时间线。 |
| 请求失败 | 记录 URL、UTC 时间、状态码、Ray ID、源站日志和相关规则命中。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 接入 Cloudflare 等于所有服务都被保护。 | 只保护走 Proxied 的 Web 流量，源站直连要堵住。 |
| 邮件、SSH、数据库也开代理。 | 非 Web 服务通常 DNS-only，后台访问用 Tunnel / Access。 |
| 所有人都是 Super Administrator。 | 少数管理员 + 清晰权限范围。 |
| CI 里放全局密钥。 | 拆最小权限 API 访问凭证，并定期轮换。 |
| 缓存问题就 Pause Cloudflare。 | 先用 Development Mode、Purge 或临时规则。 |

## 事实来源

| 来源 | 用途 |
| --- | --- |
| [Cloudflare Fundamentals](https://developers.cloudflare.com/fundamentals/) | 账号、域名、成员、权限和排障入口。 |
| [Accounts, zones, and profiles](https://developers.cloudflare.com/fundamentals/concepts/accounts-and-zones/) | 三层资源模型。 |
| [Onboard a domain](https://developers.cloudflare.com/fundamentals/manage-domains/add-site/) | 域名接入流程。 |
| [Protect your origin server](https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/) | 源站保护。 |
| [Create API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) | API 访问凭证。 |
| [Cloudflare Ray ID](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/) | 排障证据。 |
