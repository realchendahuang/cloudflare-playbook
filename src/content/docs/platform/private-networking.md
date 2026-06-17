---
title: 自有网络与专线
description: Magic Transit、BYOIP、Network Interconnect、Workers VPC 和企业网络入口的普通项目取舍。
---

最后核对日期：2026-06-18。自有网络、专线和企业网络产品的可用性、合同边界和 limits 变化较快，本页只保留项目判断需要的口径，最终以官方文档和 account team 确认为准。

这组产品最容易被普通开发者误读。Magic Transit、BYOIP、Network Interconnect 和 Cloudflare WAN 主要是企业网络工程；Workers VPC 才更接近普通开发者的需求：让 Worker 安全访问已经存在的私有 API、数据库或内部服务。

## 一句话判断

普通网站防护先用 Proxied DNS、SSL/TLS、DDoS Protection、WAF 和 Rate Limiting；后台和内网工具先用 Tunnel + Access；Worker 访问私有后端再看 Workers VPC；有自有公网 IP 段、BGP、专线、数据中心和网络团队时，才看 Magic Transit、BYOIP、Network Interconnect、Cloudflare WAN 和 Network Firewall。

## 先问六个问题

| 问题 | 如果答案是“否” |
| --- | --- |
| 你是在保护域名，还是保护自有公网 IP 网络？ | 保护域名先用 Proxied DNS，不要上 Magic Transit。 |
| 你真的拥有或管理公网 IP prefix 吗？ | 不需要 BYOIP。 |
| 你有网络团队、BGP 经验、变更窗口和故障演练吗？ | 不要碰 Magic Transit / CNI。 |
| 你只是想把后台放到内网吗？ | 先用 Tunnel + Access。 |
| Worker 需要访问私有 API、数据库或 S3-compatible 服务吗？ | 不需要 Workers VPC。 |
| 专线中断时有备线和自动切路吗？ | 不要把 CNI 放到关键路径。 |

## 免费与付费边界

| 产品 | 免费 / 计划边界 | 普通项目判断 |
| --- | --- | --- |
| Magic Transit | Enterprise-only；用于保护 on-premise、cloud-hosted、hybrid network 的公网 IP 网络。 | 普通 Web 站点不需要；它不是域名级 CDN 开关。 |
| BYOIP | Enterprise-only；使用前要确认合同覆盖，并验证 prefix 所有权和路由资料。 | 只有必须继续使用自有 IP 时才看。 |
| Network Interconnect / CNI | Enterprise-only；当前 CNI offered at no charge 且无正式 SLA；官方要求保留 backup Internet connectivity。 | no charge 不等于免费工程；机房、cross-connect、伙伴连接、冗余和运维仍然很重。 |
| Workers VPC | Available on Free and Paid Workers plans；Open Beta 期间免费；标准 Workers 请求和 CPU 计费仍然适用；VPC Services 每账号 1,000 个。 | 普通开发者最可能用到的一项，只在 Worker 需要访问私有后端时启用。 |
| Network Firewall | Magic Transit 或 Cloudflare WAN 用户有标准功能；高级功能另购。 | 没有企业网络、WAN 或自有 IP 段时不用。 |
| Cloudflare WAN | 企业网络骨干产品，用于连接并保护办公室、数据中心、云网络和分支站点。 | 小团队内网工具先用 Zero Trust / Tunnel。 |

## 产品怎么选

| 需求 | 优先选 | 不建议 |
| --- | --- | --- |
| 网站、API、文档站、博客的 DDoS 防护 | Proxied DNS + DDoS Protection + WAF。 | 为域名级防护购买 Magic Transit。 |
| 后台、预览环境、内网工具 | Tunnel + Access。 | 直接暴露公网后台。 |
| Worker 访问私有 API | Workers VPC Services。 | 给内网 API 开公网白名单。 |
| Worker 访问私有 Postgres / MySQL | Hyperdrive + Workers VPC。 | 让数据库直接暴露公网。 |
| 小团队替代 VPN | Tunnel private network + Cloudflare One Client + Gateway。 | 提前设计企业 WAN。 |
| 自有公网 IP 段防护 | Magic Transit + Network Firewall。 | 把它当成普通 Zone 配置。 |
| 继续使用自有 IP | BYOIP。 | 为了“固定 IP 好看”上 BYOIP。 |
| 私有专线接 Cloudflare | Network Interconnect / CNI。 | 没有备线、没有变更窗口就接关键业务。 |

## 成本和风险

| 产品 | 先盯什么 |
| --- | --- |
| Magic Transit | 自有 IP prefix、攻击面、流量方向、路由归属、变更窗口和回滚方案。 |
| BYOIP | prefix 权属、合同覆盖、RPKI / IRR / LOA、谁能 advertise / withdraw。 |
| CNI | 接入地点、备线、维护窗口、第三方交付周期、单点 PoP 风险。 |
| Workers VPC | 绑定范围、目标服务数量、Worker 权限、输入是否能影响目标地址。 |
| Network Firewall / WAN | 谁维护策略、日志在哪里看、误拦后怎么回滚。 |

## Workers VPC 的位置

Workers VPC 不替代 D1、R2、KV、Queues 或 Hyperdrive。它解决的是 Worker 访问“已经存在的私有资源”：

| 场景 | 判断 |
| --- | --- |
| 评论、表单、小后台数据 | 优先 D1，不需要 Workers VPC。 |
| 文件、附件、图片原图 | 优先 R2，不需要 Workers VPC。 |
| 私有 REST API | Workers VPC Services。 |
| 私有 Postgres / MySQL | Hyperdrive + Workers VPC。 |
| 多个私有网络目标、目标由运行时决定 | VPC Networks，但要更严格控制输入和权限。 |

## 升级信号

| 信号 | 该看什么 |
| --- | --- |
| 域名防护、缓存、证书和 WAF 已经不够，真正要保护公网 IP 网络。 | Magic Transit。 |
| 客户、合规或迁移要求必须继续使用自己的 IP。 | BYOIP。 |
| 公网 Tunnel 不满足延迟、合规、稳定性或大流量要求。 | Network Interconnect / CNI。 |
| Worker 必须访问私有 API、数据库、MQTT、Redis 或内部 S3-compatible 服务。 | Workers VPC。 |
| 办公室、分支、云网络和数据中心要统一接入和过滤。 | Cloudflare WAN + Network Firewall。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| DDoS 防护就是 Magic Transit。 | 普通 Web 站点走 Proxied DNS 已经有标准 DDoS Protection。 |
| BYOIP 是固定 IP 功能。 | BYOIP 是把自有 prefix 带到 Cloudflare，不是普通站点固定 IP 小功能。 |
| CNI 没端口费，所以可以随便上。 | CNI 是网络工程，仍有专线、机房、伙伴、备线、SLA 和维护成本。 |
| Workers VPC 可以随便打内网。 | VPC Services 范围更窄；VPC Networks 权限更宽，必须控制输入和代码权限。 |
| Tunnel、CNI、WAN 是同一类东西。 | Tunnel 是出站连接和私网发布；CNI 是私有互联；WAN 是企业网络骨干。 |
| 网络产品先买再说。 | 先定义流量方向、风险、责任人、回滚、日志和故障演练。 |

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [cloudflare/cloudflare-docs Magic Transit source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/magic-transit) | 官方 Magic Transit 文档源文件，适合追踪 Enterprise 边界、DDoS、traffic steering 和网络健康。 |
| [cloudflare/cloudflare-docs BYOIP source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/byoip) | 官方 BYOIP 文档源文件，适合追踪 prefix validation、address maps 和自有 IP 路由关系。 |
| [cloudflare/cloudflare-docs Network Interconnect source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/network-interconnect) | 官方 CNI 文档源文件，适合追踪接入方式、无 SLA 口径和运维建议。 |
| [cloudflare/cloudflare-docs Workers VPC source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workers-vpc) | 官方 Workers VPC 文档源文件，适合追踪 Open Beta、pricing、limits、VPC Services 和 VPC Networks。 |
| [cloudflare/cloudflare-docs Network Firewall source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/cloudflare-network-firewall) | 官方 Network Firewall 文档源文件，适合追踪标准和高级能力。 |

## 事实来源

- [Magic Transit](https://developers.cloudflare.com/magic-transit/)
- [Magic Transit About](https://developers.cloudflare.com/magic-transit/about/)
- [BYOIP](https://developers.cloudflare.com/byoip/)
- [BYOIP Get started](https://developers.cloudflare.com/byoip/get-started/)
- [Network Interconnect](https://developers.cloudflare.com/network-interconnect/)
- [Network Interconnect Get started](https://developers.cloudflare.com/network-interconnect/get-started/)
- [Network Interconnect Operational guidance](https://developers.cloudflare.com/network-interconnect/operational-guidance/)
- [Workers VPC](https://developers.cloudflare.com/workers-vpc/)
- [Workers VPC Pricing](https://developers.cloudflare.com/workers-vpc/reference/pricing/)
- [Workers VPC Limits](https://developers.cloudflare.com/workers-vpc/reference/limits/)
- [Cloudflare Network Firewall Plans](https://developers.cloudflare.com/cloudflare-network-firewall/plans/)
