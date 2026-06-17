---
title: 自有网络与专线
description: Magic Transit、BYOIP、Network Interconnect、Workers VPC 和企业网络入口的普通项目取舍。
---

最后核对日期：2026-06-18。

这组产品最容易被普通开发者误读。普通网站防护先用 Proxied DNS、SSL/TLS、DDoS Protection、WAF 和 Rate Limiting；后台和内网工具先用 Tunnel + Access。只有 Worker 要访问私有后端，才优先看 Workers VPC。

## 一句话判断

| 你要解决什么 | 先看什么 | 先别看什么 |
| --- | --- | --- |
| 网站、API、文档站、博客的入口防护。 | Proxied DNS + DDoS Protection + WAF。 | Magic Transit。 |
| 后台、预览环境、内网工具不想裸露公网。 | Tunnel + Access。 | Network Interconnect / CNI。 |
| Worker 要访问私有 API。 | Workers VPC Services。 | 给内网 API 开公网白名单。 |
| Worker 要访问私有 Postgres / MySQL。 | Hyperdrive + Workers VPC。 | 数据库直接暴露公网。 |
| 小团队替代 VPN。 | Tunnel private network + Cloudflare One Client。 | 企业 WAN。 |
| 保护自有公网 IP 段。 | Magic Transit + Network Firewall。 | 把它当普通 Zone 配置。 |

## 先问六个问题

| 问题 | 如果答案是“否” |
| --- | --- |
| 你是在保护自有公网 IP 网络，而不是域名吗？ | 不需要 Magic Transit。 |
| 你拥有或管理公网 IP prefix 吗？ | 不需要 BYOIP。 |
| 你有网络团队、BGP、变更窗口和回滚方案吗？ | 不要碰 CNI。 |
| 你只是想保护后台吗？ | 先用 Tunnel + Access。 |
| Worker 真的要访问私有服务吗？ | 不需要 Workers VPC。 |
| 专线中断时有备线吗？ | 不要把 CNI 放进关键路径。 |

## 付费和复杂度

| 产品 | 普通项目判断 |
| --- | --- |
| Magic Transit | 企业网络工程；保护公网 IP 网络，不是普通域名防护。 |
| BYOIP | 只有必须继续使用自有 IP prefix 时才看。 |
| Network Interconnect / CNI | 专线工程，不是“免费开关”；还要考虑机房、伙伴、备线、SLA 和维护。 |
| Workers VPC | 普通开发者最可能用到，只在 Worker 需要访问私有后端时启用。 |
| Cloudflare WAN / Network Firewall | 办公室、分支、云网络和数据中心统一接入时再看。 |

具体额度和 beta 状态看 [免费额度大全](/platform/free-paid/) 和官方 pricing / limits。

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| DDoS 防护就是 Magic Transit。 | 普通 Web 站点走 Proxied DNS 已经有标准 DDoS Protection。 |
| BYOIP 是固定 IP 小功能。 | BYOIP 是把自有 prefix 带到 Cloudflare。 |
| CNI 没端口费，所以可以随便上。 | 专线工程仍有交付、备线、故障和维护成本。 |
| Workers VPC 可以随便打内网。 | 目标范围、Worker 权限和输入都要收紧。 |
| Tunnel、CNI、WAN 是同一类东西。 | Tunnel 是出站连接和私网发布；CNI 是私有互联；WAN 是企业网络骨干。 |

## 开源参考

- [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs)
- [cloudflare/cloudflared](https://github.com/cloudflare/cloudflared)

## 事实来源

- [Magic Transit](https://developers.cloudflare.com/magic-transit/)
- [BYOIP](https://developers.cloudflare.com/byoip/)
- [Network Interconnect](https://developers.cloudflare.com/network-interconnect/)
- [Workers VPC](https://developers.cloudflare.com/workers-vpc/)
- [Workers VPC Pricing](https://developers.cloudflare.com/workers-vpc/reference/pricing/)
- [Cloudflare Network Firewall Plans](https://developers.cloudflare.com/cloudflare-network-firewall/plans/)
