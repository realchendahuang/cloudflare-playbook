---
title: 流量调度与四层入口
description: Load Balancing、Health Checks、Spectrum 和 Argo Smart Routing 的边界、费用口径和普通项目落地顺序。
---

最后核对日期：2026-06-17。

这一页整理 Cloudflare 里和“流量怎么走”相关的产品：Load Balancing、Health Checks、Spectrum 和 Argo Smart Routing。

普通项目最容易误判的是：把 DNS round-robin 当高可用，把 Spectrum 当普通 HTTP 代理，把 Argo 当必须开启的性能开关。真正的顺序应该是：先让 Web 入口 Proxied，再做好缓存和源站健康；有多源站以后再做 Load Balancing；非 HTTP 应用才看 Spectrum；全球用户明显受源站距离影响时再评估 Argo。

## 一句话判断

| 需求 | 优先看什么 | 不要误用什么 |
| --- | --- | --- |
| 单个网站、单个源站 | Proxied DNS + Cache / CDN + WAF | 不需要 Load Balancing。 |
| 多个源站、自动故障切换 | Load Balancing + health monitors | 不要用 DNS round-robin 假装高可用。 |
| 只想监控一个源站是否在线 | Standalone Health Checks | 不需要先买完整 Load Balancing。 |
| 代理 SSH、Minecraft、RDP 或自定义 TCP/UDP | Spectrum | 不要用普通橙云代理非 HTTP 服务。 |
| 全球用户访问单一远端源站慢 | Argo Smart Routing / [Smart Shield](/platform/origin-surge/) | 不要在缓存没做好前先买路径优化。 |
| 私有服务的多入口调度 | Private Network Load Balancing + Tunnel / Cloudflare WAN | 不要把私有服务直接暴露公网。 |

```text
用户请求
  │
  ├─ HTTP / HTTPS
  │    ├─ Cache / CDN / WAF / Rules
  │    ├─ Load Balancing: 多源站、健康检查、故障切换
  │    └─ Argo Smart Routing: Cloudflare 到源站路径优化
  │
  └─ TCP / UDP
       ├─ Spectrum: L4 代理和 DDoS 防护
       └─ Load Balancing: 给 Spectrum origin 做健康检查和调度
```

## 产品边界

| 产品 | 解决什么 | 普通项目判断 |
| --- | --- | --- |
| Load Balancing | 在多个 endpoint / pool 之间分配流量，支持 health monitor、failover、traffic steering、session affinity、private network load balancing。 | 有两个以上源站、跨区域、蓝绿发布、故障切换时再上。 |
| Health Checks | 独立监控 IP 或 hostname，查看 uptime、latency、failure reason，并发送通知。 | 只想知道源站是否挂了时很好用，Pro 起可用。 |
| Spectrum | 代理和保护 TCP / UDP 应用，例如 SSH、Minecraft、RDP、邮件、MQTT、游戏等。 | 非 HTTP 服务才看；自定义 TCP/UDP 通常是 Enterprise paid add-on。 |
| Argo Smart Routing | 为 Web 流量选择更快、更可靠的 Cloudflare 到源站路径，降低延迟和丢包。 | Paid add-on；缓存命中率低、源站远、全球访问明显时再评估。 |
| Argo for Packets | 为 Magic Transit、Cloudflare WAN、Cloudflare for Offices 等 IP layer 网络服务优化路径。 | 企业网络场景，联系 account manager。 |

## 免费与付费边界

| 能力 | 免费 / 计划边界 | 成本控制 |
| --- | --- | --- |
| Load Balancing | Paid add-on；usage-based billing 口径是 DNS queries，官方 Billing 页写明 first 500K queries included。 | 开启前先确认 dashboard 里的 plan options；上线后设置 usage-based billing notifications。 |
| Load Balancing limits | Non-Enterprise 默认 20 load balancers、20 endpoints、20 pools；monitors 为 pools 数量的 1.5x；monitor interval 最小 15s。Enterprise 为 custom，interval 最小 10s。 | 不要给每个小服务都建独立 LB；先按业务入口和故障域建。 |
| Standalone Health Checks | Free 不可用；Pro 10 个、Business 50 个、Enterprise 1,000 个；Analytics 在 Pro/Business/Enterprise 可用。 | 降低 interval、增加 check regions 会增加源站请求压力。 |
| Spectrum | Available on Paid plans；Free 不可用。Pro/Business 可用有限的一 app 场景；自定义 TCP/UDP/HTTP/HTTPS 需要 Enterprise paid add-on。 | Billing 口径是 data transfer，官方 Billing 页标注 no free tier。 |
| Argo Smart Routing | Paid add-on；Billing 口径是 data transfer，first 1 GB included。 | 只在缓存、源站压缩、静态资源策略都做好后再开启；打开预算提醒。 |
| Enterprise preview | Load Balancing 和 Argo docs 都说明 Enterprise customers 可以作为 non-contract service preview，免 metered usage fees、limits 和部分限制。 | 这是 Enterprise preview 边界，不代表普通账户免费。 |

## Load Balancing

Load Balancing 的核心组件很简单：

```text
Load Balancer hostname
  ├─ Pool A
  │    ├─ endpoint 1
  │    └─ endpoint 2
  ├─ Pool B
  │    ├─ endpoint 3
  │    └─ endpoint 4
  └─ Monitor
       ├─ path /health
       ├─ expected code / body
       └─ regions / interval / timeout / retries
```

配置时要先想清楚四个问题：

| 问题 | 判断 |
| --- | --- |
| Pool 代表什么？ | 通常代表一个区域、一个云厂商、一个数据中心或一个发布环境。 |
| Endpoint 代表什么？ | 可以是 origin、hostname、public/private IP、VIP、服务器或设备。 |
| Monitor 看什么？ | `/health` 应该只检查依赖最小的健康状态，不要把慢查询和第三方 API 放进健康检查。 |
| Fallback pool 是谁？ | 所有池都 unhealthy 时的最后去处，不能随便留空或指向测试环境。 |

Traffic steering 分三层：

| 层级 | 作用 |
| --- | --- |
| Pool / endpoint health | 先决定哪些 pool 和 endpoint 能接流量。 |
| Global traffic steering | 在可用 pools 之间选择，例如 failover、random、dynamic、geo、proximity、least outstanding requests。 |
| Local traffic steering | 在 pool 内部 endpoints 之间选择，例如 random、hash、least outstanding requests。 |

常见组合：

| 场景 | 推荐 |
| --- | --- |
| 主备源站 | 两个 pools，主池优先，备池 fallback。 |
| 多区域服务 | 每个区域一个 pool，按 geo / proximity / dynamic steering。 |
| 蓝绿发布 | 两个 pools 或 endpoint weights，先小流量再切换。 |
| Pages / Workers 作为 origin | 配 host header，避免 origin 解析错。 |
| Tunnel 后的私有服务 | Public traffic to Tunnel 或 Private Network Load Balancing。 |
| Spectrum TCP / UDP 应用 | Spectrum application 的 Origin 选择 Load Balancer。 |

注意和 Spectrum 集成时的限制：session affinity、failover across pools、自定义 Load Balancing rules 不支持；UDP health checks 只能 public monitoring，TCP 可用于 public 和 private monitoring。

## Health Checks

Standalone Health Checks 适合“我还不需要自动切流，但想知道源站是否健康”的阶段。它和 Load Balancing 的 monitors 不是同一个东西。

| 能力 | 作用 |
| --- | --- |
| Interval | 检查频率。越短越快发现问题，但也越容易增加源站压力。 |
| Check regions | 从哪些 Cloudflare regions 检查。区域越多，覆盖越好，请求也越多。 |
| Retries | 超时后重试次数，避免短暂抖动直接告警。 |
| Expected codes | 例如 `200` 或 `2xx`，用于判断 HTTP 状态。 |
| Response body | 只读取前 10 KB，关键字不要放在很后面。 |
| Notifications | 状态变化后发送邮件；单区域要 2/3 data centers 多数变化，多区域按多数 regions 触发。 |

常见误区：

| 误区 | 更好的做法 |
| --- | --- |
| 直接检查首页。 | 用轻量 `/health`，减少缓存、重定向、慢查询和外部依赖干扰。 |
| interval 越短越好。 | 先看业务 RTO，再平衡源站压力。 |
| Health Checks 能替代 Load Balancing。 | 它只监控和通知，不自动把用户切到别的源站。 |
| Health Check 失败就是源站挂了。 | 还可能是 TLS、DNS、网络、Host header、redirect、expected body 配错。 |
| 受保护源站一定能被检查。 | Standalone Health Checks 不支持 Authenticated Origin Pull。 |

## Spectrum

Spectrum 是给 TCP / UDP 应用用的，不是普通 Web 站点的默认入口。

```text
Client
  │ TCP / UDP
  ▼
Cloudflare Spectrum
  ├─ L3/L4 DDoS protection
  ├─ optional Proxy Protocol
  ├─ optional static IP / BYOIP
  └─ origin or Load Balancer
       ▼
    TCP / UDP service
```

按计划支持情况要看清：

| 能力 | Free | Pro | Business | Enterprise |
| --- | --- | --- | --- | --- |
| Spectrum availability | No | Paid add-on | Paid add-on | Yes |
| Custom TCP / UDP / HTTP / HTTPS | No | No | No | Paid add-on |
| Minecraft | No | Yes，one app allowed | Yes，one app allowed | Yes |
| SSH | No | Yes，one app allowed | Yes，one app allowed | Yes |
| RDP | No | No | Yes，one app allowed | Yes |

限制和注意点：

| 项目 | 判断 |
| --- | --- |
| UDP fragmentation | Cloudflare 不支持 UDP packet fragmentation；fragmented packets 会在 edge 被丢弃。 |
| Universal SSL | 不兼容 Spectrum；需要 Advanced Certificate 或 Custom Certificate。 |
| WAF Custom Rules | 不适用于 Spectrum applications；用 IP Access rules 做 IP、ASN、country 控制。 |
| Tunnel 集成 | Spectrum + Tunnel 只支持 HTTP/HTTPS applications；非 HTTP TCP/UDP 到私有端点要通过 Load Balancer + Private Network Load Balancing。 |
| Client IP | 要把客户端 IP 传给源站，配置 Proxy Protocol v1/v2 或 Simple Proxy Protocol。 |
| DDoS Analytics | Spectrum 流量会走 L3/L4 保护，并有连接级 analytics / Logpush。 |

普通开发者最常见的 Spectrum 场景是 SSH 或 Minecraft；但一旦进入自定义 TCP/UDP、大规模游戏、邮件、MQTT 或企业端口代理，它就会变成付费和企业合同问题。

## Argo Smart Routing

Argo Smart Routing 解决的是 Cloudflare 到源站之间的路径问题。它不是缓存，也不是压缩，也不是应用代码优化。

```text
访客
  │
  ▼
最近 Cloudflare data center
  │
  ├─ 普通路径：直接回源
  │
  └─ Argo Smart Routing：选择更快、更可靠的 Cloudflare 网络路径回源
       ▼
     Origin
```

适合开启 Argo 的信号：

| 信号 | 判断 |
| --- | --- |
| 源站离用户远 | 全球用户明显访问同一个区域源站。 |
| TTFB 主要来自回源路径 | 缓存 miss、动态页面或 API 的 origin response time 高。 |
| 缓存已经做好 | 静态资源应先被缓存吸收，Argo 主要优化必须回源的流量。 |
| 有足够流量验证 | Argo analytics 需要最近 48 小时至少 500 origin requests 才会显示详细性能数据。 |

开启前先做三件事：

1. 提高缓存命中率，避免所有请求都回源。
2. 配 Budget alerts 和 usage-based billing notifications。
3. 看 Web Analytics / Cache Analytics / Origin Performance，确认瓶颈真在回源路径。

Argo 和 Tiered Cache 的关系：Tiered Cache 减少回源次数；Argo 优化仍然需要回源的路径。两者解决的问题不同，可以组合，但不要用 Argo 弥补混乱的缓存策略。

## 本站当前选择

| 模块 | 当前选择 | 为什么 |
| --- | --- | --- |
| 文档站入口 | 单 Worker + Static Assets | 没有多个源站，不需要 Load Balancing。 |
| 健康监控 | 暂不启用 Standalone Health Checks | 纯静态站风险低；未来有 API 或评论后台再看。 |
| 非 HTTP 入口 | 不使用 Spectrum | 本站没有 SSH、Minecraft、RDP、MQTT 等公开 TCP/UDP 服务。 |
| 路径优化 | 不使用 Argo Smart Routing | 静态资产由 Cloudflare edge 直接服务，优先把缓存和构建做好。 |

未来触发条件：

| 触发条件 | 可能升级 |
| --- | --- |
| 评论 API 或后台 API 有多源站部署 | Load Balancing + health monitors。 |
| 需要监控评论服务、私有 API 或源站健康 | Standalone Health Checks。 |
| 公开非 HTTP 服务 | Spectrum。 |
| 全球动态请求明显慢且缓存已优化 | Argo Smart Routing。 |
| 内部服务经 Tunnel 多实例部署 | Private Network Load Balancing。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| DNS round-robin 就是高可用。 | 它不知道源站健康，也没有 Cloudflare 的 failover 和 steering 逻辑。 |
| Load Balancing 能自动修复源站。 | 它只能把流量从 unhealthy endpoint 移走，源站恢复仍靠你。 |
| Health Checks 越敏感越好。 | 太短 interval、太多 regions、太低 timeout 会制造噪音和源站压力。 |
| Spectrum 可以保护所有端口。 | 只有配置了 Spectrum application 的端口才会代理到 origin。 |
| WAF Custom Rules 能管 Spectrum。 | Spectrum 应用不用 WAF Custom Rules，使用 IP Access rules 等 L4 可用控制。 |
| Argo 一开网站就一定更快。 | 只有回源路径是瓶颈时才明显；缓存命中请求本来就不该频繁回源。 |
| 看到 paid add-on 就直接开。 | Load Balancing、Spectrum、Argo 都是 usage-based 或合同边界，先设预算和通知。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs Load Balancing source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/load-balancing) | 官方 Load Balancing 文档源文件，适合追踪 pools、monitors、traffic steering、private network load balancing 和 limits。 |
| [cloudflare/cloudflare-docs Health Checks source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/health-checks) | 官方 Health Checks 文档源文件，适合追踪 availability、analytics、notifications 和 region 行为。 |
| [cloudflare/cloudflare-docs Spectrum source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/spectrum) | 官方 Spectrum 文档源文件，适合追踪 protocols per plan、settings by plan、limitations、Proxy Protocol 和 logs。 |
| [cloudflare/cloudflare-docs Argo Smart Routing source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/argo-smart-routing) | 官方 Argo Smart Routing 文档源文件，适合追踪 Smart Shield、analytics、billing note 和 Argo for Packets。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 用 Terraform 管理 Load Balancing、DNS、Rules、Access 和其他 Cloudflare 资源。 |
| [cloudflare/cloudflare-go](https://github.com/cloudflare/cloudflare-go) | Cloudflare 官方 Go SDK，适合看 Load Balancing、Health Checks 等 API 自动化。 |

## 事实来源

- [Load Balancing](https://developers.cloudflare.com/load-balancing/)
- [Load Balancing llms.txt](https://developers.cloudflare.com/load-balancing/llms.txt)
- [Enable Load Balancing](https://developers.cloudflare.com/load-balancing/get-started/enable-load-balancing/)
- [Load Balancing components](https://developers.cloudflare.com/load-balancing/understand-basics/load-balancing-components/)
- [Load Balancing limitations](https://developers.cloudflare.com/load-balancing/reference/limitations/)
- [Load Balancing traffic steering](https://developers.cloudflare.com/load-balancing/understand-basics/traffic-steering/)
- [Private Network Load Balancing](https://developers.cloudflare.com/load-balancing/private-network/)
- [Load Balancing with Spectrum](https://developers.cloudflare.com/load-balancing/additional-options/spectrum/)
- [Load Balancing with Cloudflare Tunnel](https://developers.cloudflare.com/load-balancing/additional-options/cloudflare-tunnel/)
- [Health Checks](https://developers.cloudflare.com/health-checks/)
- [Health Checks llms.txt](https://developers.cloudflare.com/health-checks/llms.txt)
- [Health Checks Get started](https://developers.cloudflare.com/health-checks/get-started/)
- [Health Checks Analytics](https://developers.cloudflare.com/health-checks/health-checks-analytics/)
- [Health Checks notifications](https://developers.cloudflare.com/health-checks/how-to/health-checks-notifications/)
- [Spectrum](https://developers.cloudflare.com/spectrum/)
- [Spectrum llms.txt](https://developers.cloudflare.com/spectrum/llms.txt)
- [Spectrum Protocols per plan](https://developers.cloudflare.com/spectrum/protocols-per-plan/)
- [Spectrum Settings by plan](https://developers.cloudflare.com/spectrum/reference/settings-by-plan/)
- [Spectrum Limitations](https://developers.cloudflare.com/spectrum/reference/limitations/)
- [Argo Smart Routing](https://developers.cloudflare.com/argo-smart-routing/)
- [Argo Smart Routing llms.txt](https://developers.cloudflare.com/argo-smart-routing/llms.txt)
- [Argo Smart Routing Get started](https://developers.cloudflare.com/argo-smart-routing/get-started/)
- [Argo Smart Routing Analytics](https://developers.cloudflare.com/argo-smart-routing/analytics/)
- [Argo for Packets](https://developers.cloudflare.com/argo-smart-routing/argo-for-packets/)
- [Usage-based billing](https://developers.cloudflare.com/billing/understand/usage-based-billing/)
