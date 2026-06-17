---
title: 流量调度与四层入口
description: Load Balancing、Health Checks、Spectrum 和 Argo Smart Routing 的普通项目取舍、付费边界和升级顺序。
---

最后核对日期：2026-06-18。Cloudflare 的流量调度产品经常涉及 add-on、按量计费或 Enterprise 合同；启用前一定回到官方 pricing / limits 和 Billing 页面确认。

这页只回答一个问题：普通项目什么时候才需要把“流量怎么走”交给 Cloudflare 的高级调度产品。默认顺序很简单：先把 Web 入口代理到 Cloudflare，做好缓存、WAF 和源站保护；有多源站再看 Load Balancing；只想监控源站先看 Health Checks；非 HTTP 服务才看 Spectrum；回源路径真的慢再看 Argo。

## 一句话判断

| 你遇到的问题 | 先看什么 | 先不要做什么 |
| --- | --- | --- |
| 单网站、单源站 | Proxied DNS、Cache、WAF、DDoS Protection | 不需要 Load Balancing。 |
| 两个以上源站，需要自动切换 | Load Balancing + health monitors | 不要用 DNS round-robin 假装高可用。 |
| 只想知道源站是否在线 | Standalone Health Checks | 不要为了监控先买完整调度。 |
| 公开 SSH、Minecraft、RDP 或 TCP / UDP 服务 | Spectrum | 不要把普通橙云 HTTP 代理当四层代理。 |
| 全球用户访问单一区域源站明显慢 | Argo Smart Routing / Smart Shield | 不要在缓存没做好前先买路径优化。 |
| 私有服务有多入口或多实例 | Private Network Load Balancing + Tunnel / Cloudflare WAN | 不要把私有 IP 或后台服务直接暴露公网。 |

## 先问六个问题

| 问题 | 判断 |
| --- | --- |
| 你是不是只有一个源站？ | 是的话，先把缓存、源站保护和告警做好，不要急着上 Load Balancing。 |
| 故障时用户要不要自动切到另一个源站？ | 要自动切换，才进入 Load Balancing 的范围。 |
| 你只是想收到“源站挂了”的提醒吗？ | 只需要提醒时，Standalone Health Checks 更轻。 |
| 流量是不是 HTTP / HTTPS？ | 普通网站不需要 Spectrum；TCP / UDP 应用才看 Spectrum。 |
| 慢在哪里？ | 如果慢在回源路径，Argo 才可能有价值；如果慢在应用逻辑、数据库或缓存命中率，先修这些。 |
| 有没有预算和账单提醒？ | Load Balancing、Spectrum、Argo 都可能进入 usage-based billing，先开预算提醒。 |

## 免费与付费边界

| 产品 / 能力 | 免费或计划边界 | 普通项目判断 |
| --- | --- | --- |
| Load Balancing | Paid add-on；按 DNS queries 计费，usage-based billing 表列出 first 500K queries included。Non-Enterprise 默认 20 load balancers、20 endpoints、20 pools。 | 只有多源站、跨区域、主备切换、蓝绿发布或私有多入口时再启用。 |
| Health Checks | Free 不可用；Pro 10 个、Business 50 个、Enterprise 1,000 个；Analytics 同样从 Pro 起可用。 | 需要监控源站但不需要自动切流时很合适。 |
| Spectrum | Free 不可用；Pro / Business 是 paid add-on；自定义 TCP / UDP / HTTP / HTTPS 需要 Enterprise paid add-on；usage-based billing 没有免费层。 | 普通 Web 站点不要用；SSH、Minecraft、RDP 或自定义 TCP / UDP 才进入评估。 |
| Argo Smart Routing | Paid add-on；按 data transfer 计费，first 1 GB included；Enterprise 有 non-contract service preview 边界。 | 缓存命中率、源站性能和静态资源策略都做好后，再用真实数据验证。 |
| Argo for Packets | 面向 Magic Transit、Cloudflare WAN、Cloudflare for Offices 等 IP layer 网络产品，需要联系 account manager。 | 普通项目基本不用看。 |
| Private Network Load Balancing | 用于私有 IP、Tunnel、Cloudflare WAN 等私有网络流量调度。 | 只有内网服务、多数据中心、企业网络或私有应用入口才需要。 |

## 推荐启用顺序

1. 先把 Web 记录设为 Proxied，确认缓存、SSL/TLS、WAF 和 DDoS Protection 正常。
2. 单源站阶段只做轻量健康监控；不要为了“看起来高可用”提前买调度产品。
3. 有主备源站、多区域源站或蓝绿发布需求时，再启用 Load Balancing。
4. 只有非 HTTP 的公开 TCP / UDP 应用，才评估 Spectrum。
5. 静态缓存和源站性能都做好后，再用 Argo analytics 判断回源路径是否值得优化。
6. 私有服务、多 Tunnel、多数据中心和企业网络，再进入 Private Network Load Balancing。

## Load Balancing 什么时候值得

Load Balancing 的价值不是“让一个源站更稳”，而是在多个源站之间做健康判断和故障切换。它适合下面这些情况：

| 场景 | 判断 |
| --- | --- |
| 主备源站 | 主源站不可用时自动切到备用源站。 |
| 多区域服务 | 用户分布广，源站也分布在多个区域。 |
| 蓝绿发布 | 需要逐步切流，而不是一次性替换。 |
| 多云或多机房 | 单个云厂商、单个机房不应该成为唯一入口。 |
| 私有入口 | Tunnel 或私有 IP 后面有多个服务实例。 |

不适合的情况也很明确：单源站、低流量、没有自动切换需求、只是想“看起来专业”。这类项目先把源站保护、缓存和告警做好，收益更大。

## Health Checks 怎么看

Standalone Health Checks 只负责监控和通知，不负责把用户流量切走。它适合“我还没有多源站，但我想知道源站是否健康”的阶段。

| 做法 | 判断 |
| --- | --- |
| 检查轻量健康页面 | 不要检查首页、复杂页面或依赖很多外部服务的路径。 |
| 间隔别过度激进 | 检查越频繁、区域越多，越容易给源站增加压力和告警噪音。 |
| 告警要能行动 | 没有人处理的告警只是噪音；先定义谁处理、处理什么。 |
| 不替代 Load Balancing | 需要自动切流时，还是要看 Load Balancing。 |

## Spectrum 怎么看

Spectrum 是四层代理，不是普通网站的默认入口。它解决的是 TCP / UDP 应用的代理、防护和入口问题。

| 适合 | 不适合 |
| --- | --- |
| SSH、Minecraft、RDP、游戏、MQTT、邮件等非 HTTP 服务。 | 普通网站、博客、文档站、前端应用。 |
| 已经确认端口、协议、证书和客户端 IP 传递需求。 | 只是想“所有端口都过 Cloudflare”。 |
| 能接受 paid add-on、按流量计费或 Enterprise 边界。 | 希望完全免费代理任意 TCP / UDP 服务。 |

几个硬边界要提前知道：Spectrum Free 不可用；自定义 TCP / UDP 通常是 Enterprise paid add-on；Universal SSL 不兼容 Spectrum；WAF Custom Rules 不适用于 Spectrum applications；UDP packet fragmentation 不支持。

## Argo Smart Routing 怎么看

Argo Smart Routing 优化的是 Cloudflare 到源站之间的网络路径。它不是缓存、不是压缩，也不能弥补应用逻辑或数据库慢查询。

| 适合开启的信号 | 判断 |
| --- | --- |
| 用户离源站远 | 全球用户访问单一区域源站，TTFB 主要花在回源路径上。 |
| 动态请求多 | 缓存无法吸收的请求较多，回源比例真实存在。 |
| 缓存已经做好 | 静态资源不该靠 Argo 提速，应该先被 CDN 缓存吸收。 |
| 有足够数据验证 | Argo analytics 需要最近 48 小时至少 500 origin requests 才显示详细性能数据。 |

更朴素的判断是：先把缓存命中率、源站压缩、数据库查询和静态资源策略做好，再看 Argo。否则你花钱优化的是本来不该回源的流量。

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| DNS round-robin 就是高可用。 | 它不知道源站健康，也不会自动避开故障源站。 |
| 单源站也先上 Load Balancing。 | 没有第二个可用源站时，调度价值很有限。 |
| Health Checks 能自动切流。 | 它主要是监控和通知；自动切流看 Load Balancing。 |
| Spectrum 可以保护所有端口。 | 只有配置了 Spectrum application 的端口才会代理到 origin。 |
| WAF 规则能直接管 Spectrum。 | Spectrum 应用不用 WAF Custom Rules，要看四层可用的访问控制。 |
| Argo 一开网站一定更快。 | 只有回源路径是瓶颈时才明显；缓存命中请求不该频繁回源。 |
| 看到 paid add-on 就直接开。 | Load Balancing、Spectrum、Argo 都要先看预算、用量和账单提醒。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs Load Balancing source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/load-balancing) | 官方 Load Balancing 文档源文件，适合追踪 limits、components、traffic steering 和 private network load balancing。 |
| [cloudflare/cloudflare-docs Health Checks source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/health-checks) | 官方 Health Checks 文档源文件，适合追踪 availability、analytics 和 notifications。 |
| [cloudflare/cloudflare-docs Spectrum source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/spectrum) | 官方 Spectrum 文档源文件，适合追踪 protocols per plan、limitations 和 settings by plan。 |
| [cloudflare/cloudflare-docs Argo Smart Routing source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/argo-smart-routing) | 官方 Argo 文档源文件，适合追踪 Smart Shield、analytics、billing 和 Argo for Packets。 |

## 事实来源

- [Load Balancing](https://developers.cloudflare.com/load-balancing/)
- [Enable Load Balancing](https://developers.cloudflare.com/load-balancing/get-started/enable-load-balancing/)
- [Load Balancing limitations](https://developers.cloudflare.com/load-balancing/reference/limitations/)
- [Private Network Load Balancing](https://developers.cloudflare.com/load-balancing/private-network/)
- [Health Checks](https://developers.cloudflare.com/health-checks/)
- [Spectrum](https://developers.cloudflare.com/spectrum/)
- [Spectrum Protocols per plan](https://developers.cloudflare.com/spectrum/protocols-per-plan/)
- [Spectrum Limitations](https://developers.cloudflare.com/spectrum/reference/limitations/)
- [Argo Smart Routing](https://developers.cloudflare.com/argo-smart-routing/)
- [Argo Smart Routing Analytics](https://developers.cloudflare.com/argo-smart-routing/analytics/)
- [Argo for Packets](https://developers.cloudflare.com/argo-smart-routing/argo-for-packets/)
- [Usage-based billing](https://developers.cloudflare.com/billing/understand/usage-based-billing/)
