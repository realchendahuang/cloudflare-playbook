---
title: Zero Trust 与企业网络
description: Cloudflare One、Access、Tunnel、Gateway、Client、WAN 和 Network Firewall 的普通项目取舍。
---

最后核对日期：2026-06-18。

Zero Trust 不是必须整套购买的企业名词。普通项目先看三件事：Access 管谁能访问应用，Tunnel 管源站怎么安全接入 Cloudflare，Gateway 管设备和网络的出站访问。Cloudflare WAN 和 Network Firewall 属于企业网络改造，通常不是个人站点、小 SaaS 或单个后台的第一步。

## 该不该用

| 真实场景 | 先看什么 | 判断 |
| --- | --- | --- |
| 保护后台、预览环境、数据库面板 | Access + Tunnel | 最值得先做。后台不裸奔，源站也不需要开公网入口。 |
| 临时发布本地服务 | Tunnel public hostname | 可以很快上线；没有 Access 策略时就是公开访问。 |
| 替代 VPN 访问内网 | Tunnel private network + Cloudflare One Client | 有团队、设备和私网资源后再做。 |
| 团队设备出站管控 | Gateway DNS -> Network -> HTTP | 先从 DNS 过滤起步，HTTP inspection 最后再上。 |
| 只想拦恶意域名 | Gateway DNS policies | 部署成本最低，适合作为小团队安全第一步。 |
| 控制 URL、文件、DLP | Gateway HTTP policies | 需要客户端、证书、TLS 解密和内部告知流程。 |
| 办公室、数据中心、云网络互联 | Cloudflare WAN | Enterprise-only，属于网络团队项目。 |
| L3/L4 防火墙、IDS、包捕获 | Cloudflare Network Firewall | 通常和 Cloudflare WAN 或 Magic Transit 一起评估。 |

## 免费层优先顺序

Cloudflare 官方定价页提供 Zero Trust 免费计划入口，适合先做 PoC。具体席位价格、日志留存和支持等级会随计划变化，落地前以当前控制台和官方定价页为准；不要把历史价格写进架构文档里当长期事实。

| 优先级 | 免费阶段先做什么 | 为什么 |
| ---: | --- | --- |
| 1 | 给后台、预览环境、内部工具加 Access | 直接降低真实入口风险。 |
| 2 | 用 Tunnel 发布后台，关闭源站入站端口 | 减少暴露面，不需要先改应用架构。 |
| 3 | 给机器访问使用 service token | 比共享人工账号更清楚，也更好撤销。 |
| 4 | 从 Gateway DNS filtering 起步 | 不必一开始就做全量客户端和 HTTPS 解密。 |
| 5 | 需要私网访问时再部署 Client | Client 是组织级动作，不是单站点必需品。 |
| 6 | 超出团队、审计或日志需求后再升级计划 | 付费应该跟人数、日志、SLA、支持和合规需求绑定。 |

这些不是“免费专属额度”，而是 Cloudflare One 官方 account limits 里影响起步的关键限制：

| 能力 | 默认限制 | 普通项目含义 |
| --- | ---: | --- |
| Access applications | 500 | 后台、预览、内部工具通常够用。 |
| Service tokens | 50 | 机器访问要控制生命周期，不要无限制发 token。 |
| Identity providers | 50 | 足够接入常见企业或开发者身份源。 |
| Rules per application | 1,000 | 策略空间很大，普通项目更应该保持简单。 |
| Domains per application | 5 | 不要把一堆不相关域名塞进同一个 Access 应用。 |
| DNS policies | 500 | Gateway DNS 过滤足够小团队分层使用。 |
| Network policies | 500 | 用来控制 SSH、RDP、数据库和内网端口。 |
| HTTP policies | 500 | 适合 URL、文件、上传下载和 SaaS 账号控制。 |
| cloudflared tunnels | 1,000 | 大多数个人和小团队远远用不到上限。 |
| Tunnel routes | 1,000 | 私网路由要按环境和归属命名。 |
| Active replicas per tunnel | 25 | 高可用可以多副本，但不要无意义堆副本。 |
| DEX tests | Free 10 / Standard 30 / Enterprise 50 | 先监控关键路径，不要把 DEX 当全量监控系统。 |

## 最重要的坑

| 误区 | 正确理解 |
| --- | --- |
| 用了 Tunnel 就安全 | Tunnel 只负责连接方式；访问控制还要靠 Access、Gateway 或应用自身认证。 |
| Tunnel public hostname 默认受保护 | 没有 Access 应用时，发布出来的 hostname 可以被任何人访问。 |
| Gateway 默认会阻断未知流量 | DNS、Network、HTTP 策略未命中时默认允许；要默认拒绝，需要显式 catch-all Block。 |
| Access 可以替代业务权限 | Access 解决入口身份，不替代应用里的角色、数据权限和审计。 |
| HTTP inspection 只是打开一个开关 | 它需要客户端、根证书、TLS 解密和组织内部流程。 |
| WAN / Network Firewall 是普通站点必修 | 没有办公室、数据中心、自有 IP 段或网络团队时，通常先不用。 |

## 产品责任边界

| 产品 | 管什么 | 什么时候上 |
| --- | --- | --- |
| Access | 用户、设备、服务 token 是否能进应用 | 后台、预览、内部工具需要保护时。 |
| Tunnel | 源站如何通过出站连接接入 Cloudflare | 不想暴露源站公网入口时。 |
| Gateway | DNS、Network、HTTP、Egress、Resolver 策略 | 要管理设备或网络的出站访问时。 |
| Cloudflare One Client | 把设备、身份和流量带进 Zero Trust 策略 | 要替代 VPN、做 posture 或出站过滤时。 |
| Cloudflare WAN | 办公室、数据中心、云网络互联 | 有企业网络和网络团队时。 |
| Network Firewall | L3/L4 firewall-as-a-service、IDS、包捕获 | 已经在做 WAN、Magic Transit 或企业网络安全时。 |

## 落地路线

| 阶段 | 做什么 | 验收标准 |
| --- | --- | --- |
| 0 | 公开站点先做好 DNS、SSL/TLS、WAF、Turnstile | 普通用户路径不受影响，写入口有基础防护。 |
| 1 | 后台先建 Access 应用，再用 Tunnel 发布 | 未授权用户进不去，源站不能被公网直连。 |
| 2 | 源站校验 Access token 或只允许隧道入口 | 绕过 Cloudflare 的请求失败。 |
| 3 | 私网资源用 Tunnel private network + Client | 只有已登记设备能访问私网资源。 |
| 4 | 团队出站安全从 Gateway DNS 开始 | 日志能看到策略命中，再逐步收紧。 |
| 5 | 企业网络再评估 WAN、Network Firewall、CNI、SIEM | 有明确网络资产、审计和运维负责人。 |

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 本站内容组织方式的原始参考仓库。 |
| [cloudflare/cloudflare-docs Cloudflare One source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/cloudflare-one) | 官方 Cloudflare One 文档源文件。 |
| [cloudflare/cloudflare-docs Tunnel source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/tunnel) | 官方 Tunnel 文档源文件。 |
| [cloudflare/cloudflare-docs Cloudflare WAN source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/cloudflare-wan) | 官方 Cloudflare WAN 文档源文件。 |
| [cloudflare/cloudflare-docs Network Firewall source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/cloudflare-network-firewall) | 官方 Network Firewall 文档源文件。 |
| [cloudflare/cloudflared](https://github.com/cloudflare/cloudflared) | Tunnel daemon 源码。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 用 Terraform 管理 Access、Gateway、DNS、Rules 和其他 Cloudflare 资源。 |

## 事实来源

- [Cloudflare One](https://developers.cloudflare.com/cloudflare-one/)
- [Zero Trust & SASE Plans & Pricing](https://www.cloudflare.com/plans/zero-trust-services/)
- [Cloudflare One account limits](https://developers.cloudflare.com/cloudflare-one/account-limits/)
- [Publish a self-hosted application with Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/)
- [Published applications with Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/routing-to-tunnel/)
- [Gateway get started](https://developers.cloudflare.com/cloudflare-one/traffic-policies/get-started/)
- [Gateway order of enforcement](https://developers.cloudflare.com/cloudflare-one/traffic-policies/order-of-enforcement/)
- [Cloudflare One Client modes](https://developers.cloudflare.com/cloudflare-one/team-and-resources/devices/cloudflare-one-client/configure/modes/)
- [Cloudflare WAN](https://developers.cloudflare.com/cloudflare-wan/)
- [Cloudflare Network Firewall](https://developers.cloudflare.com/cloudflare-network-firewall/)
