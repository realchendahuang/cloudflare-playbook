---
title: DDoS Protection
description: Cloudflare DDoS Protection 的免费边界、源站保护、Under Attack 和升级判断。
---

最后核对日期：2026-06-18。DDoS Protection 的规则、告警、分析面板和 Advanced DDoS 能力会变化；上线前以 Cloudflare DDoS Protection 官方文档为准。

Cloudflare DDoS Protection 是入口层的自动防护。普通项目不需要先研究规则细节，先确认公开 Web 流量真的经过 Cloudflare，源站不能被直连，静态资源能被缓存。

## 一句话判断

| 问题 | 判断 |
| --- | --- |
| Free 有没有 DDoS 防护？ | 有。Cloudflare 官方标注所有计划都有 standard, unmetered DDoS protection。 |
| Workers Paid 会不会增强 DDoS？ | 不会。Workers Paid 只影响开发者平台额度。 |
| 只把域名放进 Cloudflare 就安全吗？ | 不一定。DNS-only、源站直连和泄露 IP 都可能绕过 Cloudflare。 |
| DDoS 能不能解决评论垃圾内容？ | 不能。评论、登录、搜索和写 API 要配合 WAF、Rate Limiting、Turnstile 和业务权限。 |

## 默认顺序

| 顺序 | 做什么 | 为什么 |
| --- | --- | --- |
| 1 | 公开 Web 记录保持 Proxied。 | 这是 DDoS、WAF、Cache、SSL/TLS 生效的前提。 |
| 2 | 源站只接受 Cloudflare 回源和可信运维入口。 | 防止攻击者绕过 Cloudflare。 |
| 3 | 静态资源放到 Static Assets、Pages、R2 或 Cache。 | 缓存命中越高，攻击时回源压力越小。 |
| 4 | DDoS managed rulesets 保持默认。 | 官方默认比普通项目手动调参更稳。 |
| 5 | 写入口加 WAF / Rate Limiting / Turnstile。 | 业务滥用不是纯 DDoS 问题。 |
| 6 | 开基础告警和账单提醒。 | 先知道是否发生异常，再决定是否升级。 |

## 源站保护最重要

| 动作 | 判断 |
| --- | --- |
| Web 记录使用 Proxied | 让请求进入 Cloudflare 防护链路。 |
| 审计 DNS-only 记录 | 旧子域、邮件、监控、截图和配置可能泄露源站 IP。 |
| 邮件和 Web 源站分离 | MX、退信和邮件日志很容易暴露服务器地址。 |
| 源站防火墙收窄入口 | 只允许 Cloudflare IP ranges、可信运维入口或 Tunnel。 |
| 被打过后换源站 IP | 旧 IP 已经泄露时，单纯接入 Cloudflare 不够。 |
| 后台走 Tunnel / Access | 管理入口不要裸露公网。 |

如果源站可以被公网直连，Cloudflare 只能保护走 Cloudflare 的那部分流量。

## DDoS、WAF、Rate Limiting 的分工

| 能力 | 解决什么 |
| --- | --- |
| DDoS Protection | 大规模异常流量、HTTP flood、L3/L4 攻击、TLS / 连接压力。 |
| Cache / CDN | 减少攻击或突发流量对源站的回源压力。 |
| WAF | 已知漏洞、危险路径、明确业务边界。 |
| Rate Limiting | 登录、评论、搜索、上传和写 API 被刷。 |
| Turnstile | 需要人机判断的表单和写入口。 |

不要把它们混成一个开关。DDoS 防护挡大流量，业务滥用要靠更靠近业务的规则。

## Under Attack 慎用

Under Attack mode 是应急工具，不是长期配置。它可能影响 API、搜索引擎、第三方回调、监控和真实用户体验。

| 用法 | 判断 |
| --- | --- |
| 全站开启 | 只适合正在被打且暂时无法定位路径时短时间使用。 |
| 按路径开启 | 更推荐，用在登录、后台、写 API 或被打路径。 |
| 长期开启 | 不推荐。攻击结束后回到 WAF / Rate Limiting 的精确规则。 |
| 替代源站保护 | 不行。源站直连问题必须单独处理。 |

## 什么时候升级

| 信号 | 可能需要 |
| --- | --- |
| 需要更细的 DDoS 命中日志和企业级排查 | Enterprise。 |
| 需要按不同业务流量写多组 DDoS overrides | Enterprise + Advanced DDoS。 |
| 要保护自有 IP 段、非 HTTP 入口或企业网络 | Magic Transit、Spectrum、Network Analytics。 |
| 合法流量经常出现大峰值，担心误伤 | Business / Enterprise 的更完整分析和支持。 |

普通 Web 项目先把 Proxied、源站保护、缓存、WAF、Rate Limiting 和告警做好，通常比提前买高级 DDoS 能力更有用。

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| Free 没有 DDoS 防护。 | Free 也有 standard, unmetered DDoS protection。 |
| 开了 Cloudflare 就一定安全。 | 只保护经过 Cloudflare 的流量，源站直连必须堵住。 |
| Under Attack 可以长期打开。 | 它只适合应急，长期要回到精确规则。 |
| 缓存不重要。 | 缓存能显著降低攻击时的回源压力。 |
| 自己模拟 DDoS 测试防护。 | 不要攻击自己的站点；需要压测用合规、可控的应用层压测。 |

## 事实来源

| 来源 | 用途 |
| --- | --- |
| [Cloudflare DDoS Protection](https://developers.cloudflare.com/ddos-protection/) | DDoS 官方入口。 |
| [About DDoS protection](https://developers.cloudflare.com/ddos-protection/about/) | DDoS 防护范围和工作方式。 |
| [HTTP DDoS Attack Protection](https://developers.cloudflare.com/ddos-protection/managed-rulesets/http/) | HTTP DDoS 默认防护。 |
| [Network-layer DDoS Attack Protection](https://developers.cloudflare.com/ddos-protection/managed-rulesets/network/) | L3/L4 防护边界。 |
| [Under Attack mode](https://developers.cloudflare.com/fundamentals/reference/under-attack-mode/) | 应急挑战模式。 |
| [Protect your origin server](https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/) | 源站保护。 |
| [cloudflare/cloudflare-docs DDoS source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ddos-protection) | 官方 DDoS Markdown 源文件。 |
