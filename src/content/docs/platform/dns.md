---
title: DNS
description: Cloudflare DNS 的接入顺序、免费边界、Proxy status、DNSSEC 和迁移清单。
---

最后核对日期：2026-06-18。DNS 的记录数、计划边界和高级 setup 会变化；上线前以 Cloudflare DNS 官方页面为准。

DNS 决定哪些流量进入 Cloudflare，哪些流量直接去第三方服务或源站。默认顺序：**Full setup 接入域名，Web 入口 Proxied，邮件和验证记录 DNS-only，迁移前先处理 DNSSEC。**

## 先记住

| 问题 | 判断 |
| --- | --- |
| 这是网站、API、文档站或前端入口吗？ | 通常 Proxied，让 CDN、SSL/TLS、WAF、DDoS 生效。 |
| 这是邮件、验证、SSH、数据库或非 HTTP 服务吗？ | 通常 DNS-only。 |
| 旧 DNS 有没有 DNSSEC？ | 先处理旧 DS record，再改 nameserver。 |
| quick scan 扫到的记录可信吗？ | 只能辅助；必须手动核对邮件、验证、API、后台和第三方服务。 |
| Free zone 记录数够吗？ | 新 Free zone 默认 200 records/zone；多环境、多租户要提前算。 |
| 需要 partial / secondary DNS 吗？ | 多数是企业场景，先从 Full setup 起步。 |

## 免费与计划边界

| 能力 | Free | 实践判断 |
| --- | --- | --- |
| DNS queries | Free / Pro / Business 不收费、不限制 | 小项目不用担心 DNS 查询费。 |
| DNS records / zone | 新 Free zone 200；旧 Free zone 可能更高 | 记录多时先合并环境和清理旧记录。 |
| Full setup | 支持 | 默认选择。 |
| DNSSEC | 支持 | 迁移顺序比“开不开”更重要。 |
| CNAME flattening | 支持 | 根域名接 Pages / SaaS 时有用。 |
| Partial / Secondary DNS | 高阶计划或企业场景 | 保留外部主 DNS 或多 DNS 冗余时再看。 |

## 记录怎么放

| 记录 / 主机名 | Proxy status | 注意 |
| --- | --- | --- |
| `example.com`、`www` | Proxied | 官网、博客、文档站、落地页。 |
| `app`、`api` | 通常 Proxied | API 再配 WAF、Rate Limiting、Turnstile 或 Access。 |
| Workers / Pages 自定义域名 | 通常 Proxied | 和 Cloudflare 证书、路由和静态资产链路最顺。 |
| `MX`、`mail`、SPF、DKIM、DMARC | DNS-only | 邮件记录不能走 HTTP proxy。 |
| 第三方 CNAME / TXT 验证 | 通常 DNS-only | 第三方需要看到真实记录时不要代理。 |
| SSH、数据库、非 HTTP 服务 | DNS-only | 最好不要公开；后台用 Tunnel / Access。 |
| wildcard | 视场景 | 精确记录优先；平台化再看 Cloudflare for SaaS。 |

## 迁移判断

迁移 DNS 不需要背完整操作手册。先导出现有记录，让 Cloudflare quick scan 辅助导入，再手动核对网站、API、邮件、验证记录和后台入口。旧 DNS 如果开过 DNSSEC，先处理旧 DS record，再切 nameserver；Zone Active 后再验证网站、邮件、证书和第三方服务。

TTL、CNAME flattening、wildcard、round-robin DNS 都是后续细节。普通项目先把 Proxied / DNS-only 分清楚，比提前设计复杂 DNS 拓扑更重要。

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 所有记录都开 Proxied。 | 只有 Web 流量入口开代理。 |
| 不导出旧 DNS 就迁移。 | 先导出，再让 quick scan 辅助。 |
| 忽略 DNSSEC 直接切 nameserver。 | 先处理旧 DS record，Active 后再重新启用。 |
| 源站 IP 写进公开文档。 | 源站 IP 当敏感信息处理。 |
| wildcard 覆盖所有环境。 | 生产、预览、后台、验证域名分开设计。 |

## 事实来源

| 来源 | 用途 |
| --- | --- |
| [Cloudflare DNS](https://developers.cloudflare.com/dns/) | DNS 官方入口。 |
| [DNS records](https://developers.cloudflare.com/dns/manage-dns-records/) | DNS 记录管理。 |
| [Proxy status](https://developers.cloudflare.com/dns/proxy-status/) | Proxied 与 DNS-only。 |
| [Full setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/) | 默认接入方式。 |
| [DNSSEC](https://developers.cloudflare.com/dns/dnssec/) | DNSSEC。 |
| [CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/) | 根域名 CNAME 处理。 |
