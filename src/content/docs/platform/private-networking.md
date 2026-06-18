---
title: 自有网络与专线
description: 什么时候才需要 Magic Transit、BYOIP、Network Interconnect、Workers VPC 和企业网络入口。
---

最后核对日期：2026-06-18。企业网络产品变化快，具体价格和限制以官方页面为准。

这组产品最容易被普通开发者误读。普通网站防护先用 Proxied DNS、SSL/TLS、DDoS Protection、WAF 和 Rate Limiting；后台和内网工具先用 Tunnel + Access。

## 先判断

| 你要解决什么 | 先看什么 | 先别看什么 |
| --- | --- | --- |
| 网站、API、文档站、博客入口防护。 | Proxied DNS + DDoS Protection + WAF。 | Magic Transit。 |
| 后台、预览环境、内网工具不想裸露公网。 | Tunnel + Access。 | Network Interconnect。 |
| Worker 要访问私有 API。 | Workers VPC。 | 给内网 API 开公网白名单。 |
| Worker 要访问私有数据库。 | Hyperdrive + Workers VPC。 | 数据库直接暴露公网。 |
| 小团队替代 VPN。 | Tunnel private network + Cloudflare One Client。 | 企业 WAN。 |
| 保护自有公网 IP 段。 | Magic Transit + Network Firewall。 | 把它当普通域名配置。 |

## 简单判断

如果你保护的是域名入口，不是自有公网 IP 网络，就不需要 Magic Transit。没有自有 IP prefix，就不需要 BYOIP。只是保护后台，先用 Tunnel + Access。只有 Worker 确实要访问私有服务时，再看 Workers VPC；专线互联要有网络团队、变更窗口、备线和回滚方案。

官方核对入口：[Magic Transit](https://developers.cloudflare.com/magic-transit/)、[Network Interconnect](https://developers.cloudflare.com/network-interconnect/)、[Workers VPC](https://developers.cloudflare.com/workers-vpc/)。
