---
title: DNS
description: Cloudflare DNS 的普通项目接入顺序、免费边界、Proxy status、记录设计、DNSSEC 与迁移清单。
---

最后核对日期：2026-06-18。DNS 的记录数、计划边界和高级 setup 会变化，上线前以 Cloudflare DNS 官方页面为准。

DNS 是 Cloudflare 的入口层。它不是单纯“把域名解析到 IP”，而是决定哪些流量进入 Cloudflare，哪些流量直接去第三方服务或源站。

普通项目先记这条：**Full setup 接入域名，Web 入口用 Proxied，邮件和验证记录保持 DNS-only，迁移前处理 DNSSEC。**

## 先问六个问题

| 问题 | 判断 |
| --- | --- |
| 这个域名是不是网站、API、文档站或前端应用入口？ | 是的话优先接 Cloudflare DNS，并让 HTTP/HTTPS 流量走 Proxied。 |
| 这个记录是不是邮件、域名验证、SSH、数据库或第三方要求直连？ | 通常 DNS-only，不要为了“安全感”乱开代理。 |
| 当前域名有没有 DNSSEC？ | 有就先处理 DNSSEC，再改 nameserver。 |
| 旧 DNS 里有没有邮件、验证、后台、CDN、对象存储记录？ | 迁移前逐条核对，不能只信 quick scan。 |
| 新 Free zone 会不会超过 200 条 DNS 记录？ | 多环境、多租户、客户域名多时要提前算。 |
| 是否真的需要企业 DNS 架构？ | Partial setup、secondary DNS、zone transfers 多数不是普通项目起步项。 |

## 免费与计划边界

Cloudflare 官方 FAQ 写明：Free、Pro、Business 不对 DNS queries 收费，也不限制 DNS queries；Enterprise 会把 monthly DNS queries 作为报价输入之一。普通项目真正容易碰到的是记录数量和高级 DNS setup。

| 能力 | Free | Pro / Business | Enterprise | 普通项目判断 |
| --- | ---: | ---: | ---: | --- |
| DNS queries | 不收费，不限制 | 不收费，不限制 | 作为报价输入 | 个人站、小团队站点不用担心 DNS 查询费。 |
| DNS records / zone | 新 zone 200；2024-09-01 前创建的旧 Free zone 1,000 | 3,500 | 3,500，可申请提高 | 新项目多环境、多租户时要先算记录数。 |
| Full setup | 支持 | 支持 | 支持 | 普通项目默认选择。 |
| Partial CNAME setup | 不支持 | Business 支持 | 支持 | 保留外部主 DNS 时才需要。 |
| Secondary DNS / zone transfers | 不支持 | 不支持 | 支持 | 企业多 DNS 冗余场景。 |
| DNSSEC | 支持 | 支持 | 支持 | 迁移顺序比“是否开启”更重要。 |
| CNAME flattening | 支持，Free 不能自定义 | 支持，可自定义 | 支持，可自定义 | 根域名指向 Pages / SaaS 时很有用。 |
| Record comments / tags | Comments 支持 100 字符；tags 不支持 | Comments 500 字符；tags 支持 | Comments 500 字符；tags 支持 | 记录多了再用注释和标签治理。 |

## Setup 怎么选

| Setup | 适合谁 | 判断 |
| --- | --- | --- |
| Full setup | 个人、开源项目、小团队、Free / Pro 用户 | 最常见。把 authoritative nameservers 切到 Cloudflare。 |
| Partial CNAME setup | 已有企业 DNS，且只想让部分子域走 Cloudflare | Business / Enterprise 能力；普通项目不要从这里起步。 |
| Secondary DNS / zone transfers | 需要多 DNS 提供商冗余的企业 | Enterprise 能力，涉及运维流程和故障演练。 |
| Subdomain setup | 子域由独立团队、独立账号或独立配置管理 | 常见于 `docs.example.com`、`app.example.com` 分属不同团队。 |

## 记录怎么放

| 记录 / 主机名 | 常见用途 | Proxy status | 注意 |
| --- | --- | --- | --- |
| `example.com`、`www` | 官网、博客、文档站、落地页 | 通常 Proxied | 让 CDN、SSL/TLS、WAF、DDoS、Cache Rules 生效。 |
| `app`、`api` | 前端应用、API、Webhook | 通常 Proxied | API 入口再配 WAF、Rate Limiting、Turnstile 或 Access。 |
| Workers / Pages 自定义域名 | Cloudflare 部署入口 | 通常 Proxied | 和 Cloudflare 的证书、路由、静态资产链路最顺。 |
| `MX`、`mail`、SPF、DKIM、DMARC | 邮件收发和邮件认证 | DNS-only | 邮件记录不能走 Cloudflare HTTP proxy。 |
| 第三方 CNAME / TXT 验证 | SaaS、搜索控制台、证书、域名归属验证 | 通常 DNS-only | 第三方需要看到真实 CNAME/TXT 时不要代理或 flatten。 |
| SSH、数据库、非 HTTP 服务 | 运维或内部连接 | DNS-only，且最好不要公开 | Cloudflare 普通 HTTP proxy 不保护这些协议。 |
| `*` wildcard | 多租户、临时子域、统一入口 | 视场景 | 精确记录优先；Pages wildcard custom domains 不支持。 |

## Proxied 与 DNS-only

Proxied 和 DNS-only 不是 UI 图标差异，而是两条完全不同的流量路径。

| 选择 | 会发生什么 | 适合 |
| --- | --- | --- |
| Proxied | DNS 返回 Cloudflare Anycast IP，HTTP/HTTPS 请求进入 Cloudflare 网络。 | 网站、API、前端应用、公开文档站。 |
| DNS-only | DNS 返回真实记录值，流量不经过 Cloudflare HTTP proxy。 | 邮件、TXT 验证、非 HTTP 服务、部分第三方 SaaS 验证。 |

只有 A、AAAA、CNAME 这类用于 IP 地址解析的记录可以被代理；MX、TXT 等记录始终是 DNS-only。Cloudflare 官方也建议：服务 Web 流量的 A、AAAA、CNAME 记录优先 Proxied，域名所有权验证这类记录不要代理。

## 只需要知道到这里

| 主题 | 普通项目判断 |
| --- | --- |
| TTL | Proxied 记录 TTL 为 Auto，当前 300 秒，不能编辑；DNS-only 非 Enterprise 可设 60 秒到 1 天。迁移前降低关键 DNS-only 记录 TTL，稳定后再调回。 |
| DNSSEC | 迁入 Cloudflare 前确认旧 DNSSEC 状态。最稳妥的路线是先关闭旧 DNSSEC，nameserver 切到 Cloudflare 且 zone Active 后，再在 Cloudflare 启用并添加 DS record。 |
| CNAME flattening | 解决根域名不能直接用 CNAME 的问题，也让 Pages 根域名可用。第三方验证需要看到原始 CNAME 时，不要让 flattening 破坏验证。 |
| Wildcard | `*.example.com` 适合多租户或统一入口；精确记录优先于 wildcard。Pages wildcard custom domains 不支持，平台化场景看 Cloudflare for SaaS / Workers for Platforms。 |
| DNS round-robin | 多个 A/AAAA 可以分散解析结果，但不等于高可用。真正需要健康检查和故障切换时看 [流量调度与四层入口](/platform/traffic-routing/)。 |

## 迁移顺序

1. 先导出现有 DNS zone file。
2. 在 Cloudflare 添加域名，让 quick scan 先扫一遍。
3. 手动核对 apex、`www`、API、后台、邮件、验证、CDN、对象存储和第三方服务记录。
4. 对即将切换的关键 DNS-only 记录降低 TTL。
5. 处理旧 DNSSEC，避免切 nameserver 后解析失败。
6. 到注册商把 nameservers 改成 Cloudflare 分配的 nameservers。
7. 等 Cloudflare zone 变成 Active。
8. 验证网站、API、邮件收发、证书签发和第三方验证。
9. 稳定后重新启用 DNSSEC，并清理旧 DNS provider 里不再使用的敏感记录。

## 不要这样用

| 误区 | 更好的做法 |
| --- | --- |
| 所有记录都开 Proxied。 | 只有 Web 流量入口开代理；邮件、验证、非 HTTP 服务保持 DNS-only。 |
| 迁移前不导出旧 DNS。 | 先导出，再让 quick scan 辅助，不要把 quick scan 当真源。 |
| 忽略 DNSSEC 直接切 nameserver。 | 先处理旧 DNSSEC，Active 后再重新启用。 |
| 把源站 IP 写进公开文档或长期保留旧直连记录。 | 源站 IP 当敏感信息处理，公开 Web 入口走 Proxied。 |
| 用 wildcard 覆盖所有环境。 | 生产、预览、后台、验证域名分开设计，精确记录优先。 |
| 修改 DNS 后立刻判断失败。 | 按 TTL、本地缓存、递归解析器和运营商缓存留传播时间。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs DNS source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/dns) | 官方 DNS 文档源文件，适合追踪 limits、proxy status、DNSSEC 和 troubleshooting。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 当 DNS 记录、zone 设置和 rules 需要进入 IaC 时再看。 |
| [favonia/cloudflare-ddns](https://github.com/favonia/cloudflare-ddns) | 动态 IP 更新 Cloudflare DNS 的成熟开源实现。 |
| [timothymiller/cloudflare-ddns](https://github.com/timothymiller/cloudflare-ddns) | 自托管 DDNS 场景的轻量参考。 |
| [cloudposse/terraform-cloudflare-zone](https://github.com/cloudposse/terraform-cloudflare-zone) | Terraform 管理 Cloudflare zone、DNS records 和规则的模块参考。 |

## 事实来源

- [Cloudflare DNS FAQ](https://developers.cloudflare.com/dns/faq/)
- [DNS records](https://developers.cloudflare.com/dns/manage-dns-records/)
- [DNS features and plans](https://developers.cloudflare.com/dns/reference/all-features/)
- [Full setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/)
- [Partial setup](https://developers.cloudflare.com/dns/zone-setups/partial-setup/)
- [Proxy status](https://developers.cloudflare.com/dns/proxy-status/)
- [Time to Live](https://developers.cloudflare.com/dns/manage-dns-records/reference/ttl/)
- [DNSSEC](https://developers.cloudflare.com/dns/dnssec/)
- [CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/)
- [Wildcard DNS records](https://developers.cloudflare.com/dns/manage-dns-records/reference/wildcard-dns-records/)
- [Import and export records](https://developers.cloudflare.com/dns/manage-dns-records/how-to/import-and-export/)
