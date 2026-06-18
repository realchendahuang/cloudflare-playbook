---
title: 流量调度与四层入口
description: Load Balancing、Health Checks、Spectrum 和 Argo Smart Routing 的取舍。
---

最后核对日期：2026-06-18。

这页只回答一个问题：什么时候需要把“流量怎么走”交给 Cloudflare 的高级调度产品。默认顺序是：先把 Web 入口代理到 Cloudflare，做好缓存、WAF 和源站保护；有多源站再看 Load Balancing；只想监控源站先看 Health Checks；非 HTTP 服务才看 Spectrum；回源路径真的慢再看 Argo。

## 一句话判断

| 你遇到的问题 | 先看什么 | 先不要做什么 |
| --- | --- | --- |
| 单网站、单源站。 | Proxied DNS、Cache、WAF、DDoS Protection。 | 不需要 Load Balancing。 |
| 两个以上源站，需要自动切换。 | Load Balancing + health monitors。 | 不要用 DNS round-robin 假装高可用。 |
| 只想知道源站是否在线。 | Standalone Health Checks。 | 不要为了监控先买完整调度。 |
| 公开 SSH、Minecraft、RDP 或 TCP / UDP 服务。 | Spectrum。 | 不要把普通橙云 HTTP 代理当四层代理。 |
| 全球用户访问单一区域源站明显慢。 | Argo Smart Routing / Smart Shield。 | 不要在缓存没做好前先买路径优化。 |
| 私有服务有多入口或多实例。 | Private Network Load Balancing。 | 不要把私有 IP 或后台服务直接暴露公网。 |

## 推荐顺序

1. 先把 Web 记录设为 Proxied，确认缓存、SSL/TLS、WAF 和 DDoS Protection 正常。
2. 单源站阶段只做轻量健康监控。
3. 有主备源站、多区域源站或蓝绿发布需求时，再启用 Load Balancing。
4. 只有非 HTTP 的公开 TCP / UDP 应用，才评估 Spectrum。
5. 静态缓存和源站性能都做好后，再用 Argo analytics 判断回源路径是否值得优化。
6. 私有服务、多 Tunnel、多数据中心和企业网络，再进入 Private Network Load Balancing。

## 产品边界

| 产品 | 实践判断 |
| --- | --- |
| Load Balancing | 价值在多源站健康判断和故障切换；单源站收益很有限。 |
| Health Checks | 只负责监控和通知，不负责自动切流。 |
| Spectrum | 四层代理，不是网站默认入口。 |
| Argo Smart Routing | 优化 Cloudflare 到源站的路径，不是缓存、压缩或数据库优化。 |
| Private Network Load Balancing | 私有网络、多入口和企业网络场景再看。 |

官方核对入口：[Load Balancing](https://developers.cloudflare.com/load-balancing/)、[Health Checks](https://developers.cloudflare.com/health-checks/)、[Spectrum](https://developers.cloudflare.com/spectrum/)、[Argo Smart Routing](https://developers.cloudflare.com/argo-smart-routing/)。
