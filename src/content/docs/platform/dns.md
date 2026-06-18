---
title: DNS
description: Cloudflare DNS 的接入顺序、免费边界、代理状态和迁移清单。
---

最后核对日期：2026-06-18。DNS 的记录数和计划边界会变化；上线前以 Cloudflare DNS 官方页面为准。

DNS 决定哪些流量进入 Cloudflare，哪些流量直接去第三方服务或源站。默认顺序：完整接入域名，网站入口走代理，邮件和验证记录不代理，迁移前先处理旧的 DNSSEC。

## 先记住

| 问题 | 判断 |
| --- | --- |
| 这是网站、API、文档站或前端入口吗？ | 通常走代理，让 CDN、HTTPS、WAF、DDoS 生效。 |
| 这是邮件、验证、SSH、数据库或非 HTTP 服务吗？ | 通常不代理。 |
| 旧 DNS 有没有 DNSSEC？ | 先处理旧 DS record，再改 nameserver。 |
| 自动扫描到的记录可信吗？ | 只能辅助；必须手动核对邮件、验证、API、后台和第三方服务。 |
| 记录数量够吗？ | 多环境、多租户要提前算；具体数字回到免费额度页核对。 |
| 需要保留外部主 DNS 吗？ | 多数是企业场景，普通项目先完整接入 Cloudflare。 |

## 记录怎么放

| 记录 / 主机名 | 处理方式 | 注意 |
| --- | --- | --- |
| 根域名、`www` | 走代理 | 官网、博客、文档站、落地页。 |
| `app`、`api` | 通常走代理 | API 再配 WAF、限流、Turnstile 或 Access。 |
| Workers / Pages 自定义域名 | 通常走代理 | 和证书、路由和静态资产链路最顺。 |
| 邮件记录 | 不代理 | 邮件记录不能走 HTTP 代理。 |
| 第三方验证记录 | 通常不代理 | 第三方需要看到真实记录时不要代理。 |
| SSH、数据库、非 HTTP 服务 | 不代理 | 最好不要公开；后台用 Tunnel / Access。 |
| 泛域名 | 视场景 | 精确记录优先；平台化后再看客户域名能力。 |

## 迁移判断

迁移 DNS 不需要背完整操作手册。先导出现有记录，让 Cloudflare 自动扫描辅助导入，再手动核对网站、API、邮件、验证记录和后台入口。旧 DNS 如果开过 DNSSEC，先处理旧 DS record，再切 nameserver；域名生效后再验证网站、邮件、证书和第三方服务。

TTL、根域名 CNAME、泛域名、多源站 DNS 都是后续细节。普通项目先把“走代理 / 不代理”分清楚，比提前设计复杂 DNS 拓扑更重要。

官方核对入口：[Cloudflare DNS](https://developers.cloudflare.com/dns/)、[DNS records](https://developers.cloudflare.com/dns/manage-dns-records/)、[Proxy status](https://developers.cloudflare.com/dns/proxy-status/)、[Full setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/)。
