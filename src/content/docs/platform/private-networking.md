---
title: 自有网络与专线
description: 什么时候才需要自有 IP、防护专线和私有网络入口。
---

最后核对日期：2026-06-18。企业网络产品变化快，具体价格和限制以官方页面为准。

这组产品最容易被普通开发者误读。普通网站防护先用代理 DNS、HTTPS、DDoS、WAF 和限流；后台和内网工具先用 Tunnel + Access。只有你真的有自有公网 IP、私有网络、专线或网络团队时，再看这一页。

## 先判断

| 真实问题 | 先做什么 | 先别做什么 |
| --- | --- | --- |
| 保护网站、API、文档站。 | 先把域名代理到 Cloudflare。 | 买自有网络防护。 |
| 后台或预览环境不想公开。 | Tunnel + Access。 | 上专线。 |
| Worker 要访问私有服务。 | 再看私有网络连接。 | 给内网服务开公网白名单。 |
| 小团队想替代 VPN。 | Tunnel 私网 + 客户端。 | 企业广域网方案。 |
| 保护自有公网 IP 段。 | 再看网络级防护。 | 当普通域名功能配置。 |

## 简单判断

如果你保护的是域名入口，而不是自有公网 IP 网络，就不需要企业网络产品。只是保护后台，先用 Tunnel + Access。只有 Worker 确实要访问私有服务时，再评估私有网络连接；专线互联要有网络团队、变更窗口、备线和回滚方案。

官方核对入口：[Magic Transit](https://developers.cloudflare.com/magic-transit/)、[Network Interconnect](https://developers.cloudflare.com/network-interconnect/)、[Workers VPC](https://developers.cloudflare.com/workers-vpc/)。
