---
title: 自有网络与专线
description: Magic Transit、BYOIP、Network Interconnect、Workers VPC 和企业网络入口的边界、配置顺序与普通项目判断。
---

最后核对日期：2026-06-17。

这一页整理的是 Cloudflare 里最容易被普通开发者误读的一组网络产品：Magic Transit、BYOIP、Network Interconnect、Workers VPC，以及它们和 Cloudflare WAN、Network Firewall 的关系。

结论先说：前三个基本是企业网络工程，Workers VPC 是开发者平台里“Worker 访问私有服务”的新入口。普通文档站、小 SaaS、单个后台，先不用 Magic Transit、BYOIP 或 CNI。

## 一句话判断

| 需求 | 优先看什么 | 不要误用什么 |
| --- | --- | --- |
| 普通网站防 DDoS | DNS 记录保持 Proxied + DDoS Protection + WAF | 不需要 Magic Transit。 |
| 保护自有公网 IP 段 | Magic Transit | 不要把它当成域名级 CDN 开关。 |
| 继续使用自己拥有的 IP | BYOIP | 不要为了“IP 好看”提前上 BYOIP。 |
| 和 Cloudflare 建私有专线 | Network Interconnect / CNI | 不要把 CNI 当成普通 Tunnel 替代品。 |
| Worker 访问内网 API / 数据库 | Workers VPC + Cloudflare Tunnel / Mesh | 不要给内网服务开公网入口。 |
| 办公室、数据中心、云 VPC 互联 | Cloudflare WAN + Network Firewall + CNI | 这是企业网络，不是开源文档站默认栈。 |

```text
自有网络与专线
  ├─ 入口防护
  │    ├─ 普通域名: Proxied DNS + WAF + DDoS Protection
  │    └─ 自有 IP 段: Magic Transit + BYOIP
  │
  ├─ 私有连接
  │    ├─ Internet tunnel: GRE / IPsec
  │    └─ Private interconnect: CNI
  │
  ├─ 企业网络控制
  │    ├─ Cloudflare WAN
  │    └─ Cloudflare Network Firewall
  │
  └─ 开发者入口
       └─ Workers VPC: Worker 访问私有 API / 数据库 / 服务
```

## 产品边界

| 产品 | 官方定位 | 普通项目判断 |
| --- | --- | --- |
| Magic Transit | 用 Cloudflare 全球 anycast 网络保护 on-premise、cloud-hosted、hybrid network 的公网 IP 网络，提供 L3/L4 DDoS 防护、流量加速和网络防火墙入口。 | Enterprise-only。你有自有公网 IP 段、路由团队和网络变更流程时才看。 |
| BYOIP | 让 Cloudflare 在所有 Cloudflare locations 宣告你自己的 IP prefixes，并把流量绑定到 Magic Transit、CDN、Spectrum、Gateway DNS locations 或 dedicated egress IPs。 | Enterprise-only。核心是 IP 资产和 BGP 宣告，不是域名解析小功能。 |
| Network Interconnect | 用 Direct / Partner / Cloud Interconnect 把你的网络直接接到 Cloudflare，不走公共 Internet。 | Enterprise-only。适合低延迟、稳定性、合规或大流量网络。 |
| Workers VPC | 让 Workers 访问外部云、on-premise、Cloudflare Mesh 或 Cloudflare WAN 背后的私有 API、服务和数据库。 | Free 和 Paid Workers 计划可用，当前 Open Beta 免费；适合开发者项目访问私有后端。 |
| Cloudflare Network Firewall | 随 Magic Transit 或 Cloudflare WAN 提供的网络层 FWaaS，支持 packet-level rules、IDS、packet captures 等。 | 没有企业网络、IP 段或 WAN 时不用。 |

## 免费与付费边界

| 能力 | 免费 / 计划边界 | 成本判断 |
| --- | --- | --- |
| Magic Transit | Enterprise-only，不是 self-serve 产品。 | 先联系 account team；普通网站 DDoS 防护不需要购买它。 |
| BYOIP | Enterprise-only；使用前需确认合同覆盖。 | 要有可验证的 IP prefix、IRR、RPKI、LOA 或自动 LOA 流程。 |
| Network Interconnect | Enterprise-only；CNI ports 当前对 Enterprise customers no charge，但无正式 SLA。 | 仍有机房、cross-connect、伙伴连接、云互联和冗余成本；必须保留 backup Internet connectivity。 |
| Workers VPC | Available on Free and Paid plans；Open Beta 期间免费。 | 仍按标准 Workers 请求和 CPU 收费；VPC Services 每账号 1,000 个。 |
| Network Firewall | Magic Transit 或 Cloudflare WAN 用户自动获得标准功能；高级功能另购。 | IDS、packet capture、threat intelligence lists、protocol validation 等属于更高阶企业安全预算。 |

Workers VPC 是这组产品里唯一适合普通开发者提前学习的能力。它的价值不是替代 D1、R2、Hyperdrive，而是让 Worker 安全访问已经存在的私有服务。

## Magic Transit

Magic Transit 的入口是 BGP 和 anycast，不是域名：

```text
用户 / 攻击流量
  │
  ▼
Cloudflare anycast network
  ├─ Network-layer DDoS managed rulesets
  ├─ Advanced TCP / DNS Protection
  ├─ Network Firewall
  └─ Traffic steering
       │
       ├─ GRE / IPsec tunnel over Internet
       └─ CNI private interconnect
            │
            ▼
        企业网络 / 数据中心 / 云网络
```

适合 Magic Transit 的前提：

| 条件 | 说明 |
| --- | --- |
| 有公网 IP 段 | 自有 prefix 通常至少需要 `/24`；不满足时可和 account team 讨论 Cloudflare-owned IP。 |
| 有路由与网络团队 | 需要 BGP、GRE/IPsec、MSS/MTU、tunnel health、PBR、故障切换等工程能力。 |
| 有明确网络风险 | 保护数据中心、云网络、游戏、金融、DNS、非 HTTP 服务或大规模 L3/L4 攻击面。 |
| 有变更窗口 | Cloudflare 全网配置 rollout、prefix advertisement、IRR/RPKI/LOA 都需要流程。 |

关键配置顺序：

1. 明确 ingress-only 还是 ingress + egress。
2. 验证 IP prefix、IRR、RPKI 和 Letter of Agency。
3. 配 GRE 或 IPsec tunnels，或通过 CNI 接入。
4. 配 static routes 或 BGP peering。BGP over CNI 和 anycast IPsec/GRE 当前仍有 beta / closed beta 边界。
5. 配 tunnel / endpoint health checks。
6. 做 MSS clamp，避免 GRE/IPsec 封装后出现难排查的丢包。
7. 完成 pre-flight checks 后再 advertise prefixes。
8. 观察 Network Analytics，再把高级 DDoS 规则从 Monitor 调到 mitigation。

Magic Transit 里的几个容易踩坑点：

| 点 | 判断 |
| --- | --- |
| China Network | 官方说明 Cloudflare China Network 目前不支持 Magic Transit。 |
| MSS / MTU | GRE/IPsec 会增加封装开销；路由切换前必须完成 MSS clamp。 |
| Egress | Magic Transit egress 需要 PBR 或默认路由设计，Network Firewall 规则会同时作用于入站和出站方向。 |
| Health checks | tunnel health 用于选路，endpoint health 更像整体可达性观察，两者不要混为一谈。 |
| BGP | 当前很多 BGP 能力带 beta / closed beta 边界，生产前必须和 account team 确认。 |

## BYOIP

BYOIP 解决的问题是：继续使用你自己的 IP，同时获得 Cloudflare 的安全和性能能力。它常和 Magic Transit、CDN、Spectrum、Gateway DNS locations、dedicated egress IPs 一起出现。

```text
BYOIP prefix
  ├─ validation
  │    ├─ RIR / IRR
  │    ├─ RPKI / ROA
  │    └─ ownership validation / LOA
  │
  ├─ service binding
  │    ├─ Magic Transit
  │    ├─ CDN
  │    └─ Spectrum
  │
  └─ advertisement
       ├─ dashboard
       └─ API
```

核心概念：

| 概念 | 作用 |
| --- | --- |
| Prefix validation | 验证你确实拥有或有权使用这个 IP prefix。 |
| IRR | 路由注册表记录，帮助网络运营商判断哪个 ASN 可以宣告这个 prefix。 |
| RPKI / ROA | 用密码学方式验证 route origin，降低 route hijacking 风险。 |
| Address maps | 指定 Cloudflare 对 proxied hostname 响应哪些 BYOIP 或 static IP。 |
| Service bindings | 把某段 IP 流量映射到 Magic Transit、CDN 或 Spectrum。 |
| Dynamic advertisement | 用 dashboard 或 API 按需 advertise / withdraw prefix。启用通常 2-7 分钟，停用约 15 分钟。 |
| Route Leak Detection | BYOIP 购买后可用，用来发现 prefix 被异常宣告。 |

注意 BYOIP 和 Magic Transit 的特殊关系：

| 规则 | 含义 |
| --- | --- |
| Magic Transit 只能作为覆盖整个 prefix 的 default binding。 | 你可以再把更小范围 IP 绑定到 CDN 或 Spectrum，但不能反过来。 |
| Service bindings 当前 API-only。 | 创建或删除后通常需要 4-6 小时全网传播，期间可能有服务影响。 |
| BYOIP onboarding 不等于 Magic Transit onboarding。 | 官方 BYOIP get started 明确说该流程不支持 Magic Transit prefix onboarding，要看 Magic Transit get started。 |
| CDN egress / dedicated egress IPs 是 Enterprise。 | 不要把 BYOIP 当作普通站点固定出口 IP 的免费方案。 |

## Network Interconnect

Network Interconnect，简称 CNI，是把你的网络和 Cloudflare 直接连接起来：

| 类型 | 适合 |
| --- | --- |
| Direct Interconnect | 你和 Cloudflare 在同一机房，需要物理 cross-connect，控制力和可靠性最高。 |
| Partner Interconnect | 通过 Console Connect、CoreSite、Digital Realty、Equinix Fabric、Megaport、PacketFabric、Zayo 等伙伴接入。 |
| Cloud Interconnect | 云上网络和 Cloudflare 私有互联，例如 AWS Direct Connect beta、Google Cloud Interconnect。 |

CNI 的关键事实：

| 项目 | 官方口径 |
| --- | --- |
| 计划 | Enterprise-only。 |
| 端口费用 | CNI ports 当前对 Enterprise customers no charge。 |
| SLA | 当前无正式 SLA；Cloudflare 建议保留 backup connectivity。 |
| 接入地点 | 只在选定 Cloudflare data centers 可用，且要看 dataplane v1 / v2 和设备多样性。 |
| 端口规格 | 支持 10G 和 100G 类型，具体光模块随 dataplane 变化。 |
| Prefix | Peering 时 IPv4 prefix 要 `/24` 或更短，IPv6 要 `/48` 或更短。 |
| 交付周期 | 常见 provisioning 为 2-4 周，物理连接阶段最容易延迟。 |

Dataplane 差异要提前判断：

| 能力 | Dataplane v1 | Dataplane v2 |
| --- | --- | --- |
| GRE requirement | 常见场景仍要 GRE。 | 面向 customer connectivity router，路由更简化。 |
| MTU | 部分方向需要 1,476-byte MTU 约束。 | 最高 1,500 bytes bidirectional。 |
| VLAN / QinQ | 可有单个 802.1Q VLAN tag。 | 官方当前标注 VLAN tagging / QinQ not yet supported。 |
| LACP | 支持。 | 当前 not supported，使用 ECMP。 |
| BGP over CNI | closed beta，不对新客户开放。 | 同样需 account team 确认。 |

设计 CNI 时最重要的不是“开通专线”，而是高可用：

1. 选择支持 device-level diversity 的地点。
2. 避免 single-homed PoP 承担关键业务。
3. 设计自动 failover，而不是靠人工切路。
4. 保留 Internet tunnel 或其他 backup connectivity。
5. 配 maintenance notifications，准备好维护窗口。

## Workers VPC

Workers VPC 和前面的企业网络产品不一样：它更靠近开发者平台。目标是让 Worker 安全访问私有网络里的 API、数据库、S3 兼容服务、Redis、MQTT 或内部工具。

```text
Worker
  ├─ vpc_services
  │    └─ 固定 host + port
  │         └─ Cloudflare Tunnel
  │              └─ Private API / DB
  │
  └─ vpc_networks
       ├─ Cloudflare Tunnel
       ├─ Cloudflare Mesh
       └─ Cloudflare WAN routes
            ├─ private services
            └─ optional public egress through Gateway policies
```

两种绑定模型：

| 模型 | 范围 | 协议 | 适合 |
| --- | --- | --- | --- |
| VPC Services | 具体 host + port，需要先注册服务。 | HTTP `fetch()`；TCP 服务通常和 Hyperdrive 组合。 | 固定内部 API、Postgres/MySQL、S3-compatible bucket。 |
| VPC Networks | 整个 Tunnel、Cloudflare Mesh 或 WAN routes。 | HTTP `fetch()`；TCP `connect()`，当前 VPC Networks 的 `connect()` 支持 plaintext TCP。 | 动态服务发现、多个内网资源、需要 Gateway egress policy 的 Worker。 |

Workers VPC 的安全边界：

| 做法 | 原因 |
| --- | --- |
| 已知目标优先用 VPC Services。 | 每个 binding 只指向特定 host + port，可降低 SSRF 面。 |
| 用 VPC Networks 时要控制 Worker 代码和输入。 | URL / address 在运行时决定目标，权限范围更宽。 |
| Cloudflare Tunnel 用 remotely-managed tunnel。 | 配置在 Cloudflare 侧管理，更适合团队协作和生产运维。 |
| `cloudflared` 使用 2025.7.0 或更新版本。 | Workers VPC 文档要求新版本以保证 DNS 解析和连接能力。 |
| 防火墙允许 outbound UDP 7844。 | Tunnel 需要 QUIC transport。 |
| 使用 Connectivity Directory 角色分权。 | Read / Bind / Admin 分别对应查看、绑定和创建管理。 |

Workers VPC 适合本站未来哪些场景？

| 场景 | 判断 |
| --- | --- |
| 评论服务访问 D1 | 不需要，D1 是 Cloudflare 原生 binding。 |
| 文档站搜索 Pagefind | 不需要，静态索引即可。 |
| 未来接一套私有后台 API | 可以考虑 VPC Service。 |
| 未来 Worker 访问私有 Postgres | 优先 Hyperdrive + Workers VPC。 |
| 未来做内部运维面板 | Workers Static Assets + Access + Workers VPC 可组合。 |

## 普通项目落地顺序

| 阶段 | 推荐 |
| --- | --- |
| 公开 Web 项目 | Proxied DNS + SSL/TLS + WAF + DDoS Protection。 |
| 后台和内网工具 | Tunnel + Access。 |
| Worker 访问私有后端 | Workers VPC，已知目标优先 VPC Services。 |
| 小团队替代 VPN | Tunnel private network + Cloudflare One Client + Gateway。 |
| 多站点 / 云网络互联 | Cloudflare WAN。 |
| 自有 IP 段和 L3/L4 防护 | Magic Transit + BYOIP + Network Firewall。 |
| 私有专线 | CNI，并设计双线路、双设备、backup Internet。 |

本站当前不需要 Magic Transit、BYOIP、Network Interconnect 或 Workers VPC。把它们写进 Playbook，是为了让读者知道什么是“已经进入企业网络工程”，而不是鼓励开源文档站提前购买复杂度。

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| DDoS 防护就是 Magic Transit。 | 普通 Web 站点走 Proxied DNS 已经有标准 DDoS Protection；Magic Transit 是保护 IP 网络。 |
| BYOIP 是固定 IP 功能。 | BYOIP 是把自有 prefix 带到 Cloudflare，需要 RIR、IRR、RPKI、LOA 和 service bindings。 |
| CNI 有 no charge 就等于免费。 | 专线工程仍有机房、cross-connect、伙伴、云互联、冗余、运维和无 SLA 边界。 |
| Workers VPC 可以随便打内网。 | 它是能力边界，不是免审计通行证；VPC Networks 范围更宽，必须控制输入和权限。 |
| Tunnel、CNI、WAN 是同一类东西。 | Tunnel 是出站连接和私网发布，CNI 是私有互联，WAN 是企业网络骨干。 |
| 有 CNI 就不需要备线。 | 官方要求保留 alternative Internet connectivity，关键应用要自动 failover。 |
| 网络产品先买再说。 | 先定义 prefix、流量方向、攻击面、路由归属、故障演练和回滚方案。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs Magic Transit source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/magic-transit) | 官方 Magic Transit 文档源文件，适合追踪 BGP、GRE/IPsec、health checks、traffic steering 和 DDoS 层。 |
| [cloudflare/cloudflare-docs BYOIP source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/byoip) | 官方 BYOIP 文档源文件，适合追踪 prefix validation、service bindings、address maps、RPKI 和 route leak detection。 |
| [cloudflare/cloudflare-docs Network Interconnect source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/network-interconnect) | 官方 CNI 文档源文件，适合追踪 direct / partner / cloud interconnect、dataplane、MTU、维护和接入流程。 |
| [cloudflare/cloudflare-docs Workers VPC source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workers-vpc) | 官方 Workers VPC 文档源文件，适合追踪 VPC Services、VPC Networks、pricing、limits 和 Wrangler binding。 |
| [cloudflare/cloudflare-docs Network Firewall source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/cloudflare-network-firewall) | 官方 Network Firewall 文档源文件，适合追踪标准/高级特性、IDS、packet captures 和 policies。 |
| [cloudflare/cloudflare-docs Cloudflare WAN source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/cloudflare-wan) | 官方 Cloudflare WAN 文档源文件，适合追踪 on-ramps、Cloudflare One integration、routes、health checks 和 appliance。 |
| [cloudflare/cloudflared](https://github.com/cloudflare/cloudflared) | Cloudflare Tunnel daemon 源码，适合理解 Tunnel 连接模型和部署边界。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 用 Terraform 管理 Cloudflare 企业网络、安全和开发者平台资源。 |

## 事实来源

- [Magic Transit](https://developers.cloudflare.com/magic-transit/)
- [Magic Transit llms.txt](https://developers.cloudflare.com/magic-transit/llms.txt)
- [Magic Transit About](https://developers.cloudflare.com/magic-transit/about/)
- [Magic Transit Get started](https://developers.cloudflare.com/magic-transit/get-started/)
- [Magic Transit DDoS protection](https://developers.cloudflare.com/magic-transit/ddos/)
- [Magic Transit Network health](https://developers.cloudflare.com/magic-transit/network-health/)
- [Magic Transit Traffic steering](https://developers.cloudflare.com/magic-transit/reference/traffic-steering/)
- [Magic Transit Egress traffic](https://developers.cloudflare.com/magic-transit/reference/egress/)
- [BYOIP](https://developers.cloudflare.com/byoip/)
- [BYOIP llms.txt](https://developers.cloudflare.com/byoip/llms.txt)
- [BYOIP Get started](https://developers.cloudflare.com/byoip/get-started/)
- [BYOIP Address maps](https://developers.cloudflare.com/byoip/address-maps/)
- [BYOIP Service bindings](https://developers.cloudflare.com/byoip/service-bindings/)
- [BYOIP Dynamic advertisement](https://developers.cloudflare.com/byoip/concepts/dynamic-advertisement/)
- [BYOIP Route filtering and RPKI](https://developers.cloudflare.com/byoip/concepts/route-filtering-rpki/)
- [BYOIP Route Leak Detection](https://developers.cloudflare.com/byoip/route-leak-detection/)
- [Network Interconnect](https://developers.cloudflare.com/network-interconnect/)
- [Network Interconnect llms.txt](https://developers.cloudflare.com/network-interconnect/llms.txt)
- [Network Interconnect Get started](https://developers.cloudflare.com/network-interconnect/get-started/)
- [Network Interconnect Operational guidance](https://developers.cloudflare.com/network-interconnect/operational-guidance/)
- [Workers VPC](https://developers.cloudflare.com/workers-vpc/)
- [Workers VPC llms.txt](https://developers.cloudflare.com/workers-vpc/llms.txt)
- [Workers VPC Pricing](https://developers.cloudflare.com/workers-vpc/reference/pricing/)
- [Workers VPC Limits](https://developers.cloudflare.com/workers-vpc/reference/limits/)
- [Workers VPC Services](https://developers.cloudflare.com/workers-vpc/configuration/vpc-services/)
- [Workers VPC Networks](https://developers.cloudflare.com/workers-vpc/configuration/vpc-networks/)
- [Workers VPC Tunnel configuration](https://developers.cloudflare.com/workers-vpc/configuration/tunnel/)
- [Cloudflare Network Firewall Plans](https://developers.cloudflare.com/cloudflare-network-firewall/plans/)
