---
title: DDoS Protection
description: Cloudflare DDoS Protection 的免费边界、入口保护、HTTP / Network-layer DDoS、Under Attack、源站保护和升级判断。
---

最后核对日期：2026-06-18。DDoS Protection 的规则、告警、分析面板和 Advanced DDoS 能力会变化，上线前以 Cloudflare DDoS Protection 官方页面为准。

## 一句话判断

Cloudflare DDoS Protection 是入口层的自动防护。只要公开 Web 流量真正经过 Cloudflare，Free 计划也有标准、unmetered 的 L3-L7 DDoS 防护。

普通项目最重要的不是调规则，而是三件事：公开记录走 Proxied，源站不能被直连，静态资源尽量让缓存吸收。登录、评论、搜索、上传和写 API 再交给 WAF、Rate Limiting、Turnstile 做业务层保护。

## 先问六个问题

| 问题 | 判断 |
| --- | --- |
| 公开入口是否真的经过 Cloudflare？ | 只有经过 Cloudflare 的流量才会被 Cloudflare 保护。 |
| Web 记录是不是 Proxied？ | DNS-only 记录不会获得 HTTP 代理层的 WAF、缓存和 DDoS 能力。 |
| 源站真实 IP 是否可能泄露？ | 泄露后攻击者可以绕过 Cloudflare 直打源站。 |
| 静态资源是否能被缓存？ | 缓存命中越高，攻击时回源压力越小。 |
| 是否有登录、评论、搜索、上传或写 API？ | 这些通常要配合 WAF / Rate Limiting / Turnstile。 |
| 是否保护自有 IP 段、TCP/UDP 应用或企业网络？ | 这时再看 Spectrum、Magic Transit 和 Advanced DDoS。 |

## 免费与计划边界

| 能力 | Free / Pro / Business | Enterprise | Enterprise + Advanced DDoS |
| --- | --- | --- | --- |
| 标准 DDoS 防护 | 可用，standard / unmetered，覆盖 L3-L7。 | 可用。 | 可用。 |
| HTTP DDoS Attack Protection | 可用，Cloudflare 文档标注为 always enabled。 | 可用，可使用 Log action。 | 可用，支持更细的表达式和多规则。 |
| Network-layer DDoS Protection | 可用，保护经过 Cloudflare 网络的 zone。 | Magic Transit / Spectrum 场景可自定义。 | Magic Transit / Spectrum 场景可自定义。 |
| Managed rules customization | 1 个 ruleset override，通常作用于全部流量。 | 1 个 override，可用 Log action。 | 10 个 overrides / rules，可按流量细分。 |
| Adaptive DDoS | 主要是错误率相关的基础 adaptive 保护。 | 错误率和历史趋势。 | 更多 profiling signals 和完整 adaptive 规则。 |
| Advanced TCP / DNS Protection | Magic Transit 客户可用，不是普通站点默认项。 | Magic Transit 客户可用。 | Magic Transit 客户可用。 |
| Analytics | Free 为 sampled logs；Pro / Business 可看 Security Events。 | WAF/CDN 看 Security Events；Magic Transit / Spectrum 看 Network Analytics。 | 更完整的分析和高级告警过滤。 |
| Alerts | HTTP DDoS Attack Alert included with all Cloudflare plans。 | 支持更多企业场景。 | 支持高级过滤。 |

这里的付费边界是 zone 计划、Enterprise 合同或 Advanced DDoS add-on，不是 Workers Paid。`$5/month` Workers Paid 不会提升 DDoS override 数量、不会给你 Advanced DDoS，也不会让源站暴露变安全。

## 两层防护怎么理解

| 层级 | 保护什么 | 普通项目怎么用 |
| --- | --- | --- |
| HTTP DDoS | HTTP / HTTPS 请求、HTTP flood、cache busting、Slowloris、TLS exhaustion 等。 | 文档站、官网、API、评论入口最相关；默认启用，通常不用改。 |
| Network-layer DDoS | L3/L4 流量、UDP flood、SYN flood、DNS flood、反射放大等。 | 普通 Web 站点随 Cloudflare 入口获得保护；自有 IP 段和 TCP/UDP 应用再看企业网络产品。 |

不要把 DDoS Protection、WAF、Rate Limiting 混成一个东西。DDoS 挡大规模异常流量，WAF 处理明确安全边界，Rate Limiting 处理刷接口，Turnstile 处理需要人机判断的入口，Cache 负责减少回源。

## 推荐默认顺序

| 顺序 | 做什么 | 为什么 |
| --- | --- | --- |
| 1 | 域名接入 Cloudflare，公开 Web 记录保持 Proxied。 | 这是 DDoS、WAF、缓存和 SSL/TLS 生效的前提。 |
| 2 | 源站只接受 Cloudflare 回源和可信运维入口。 | 防止攻击者绕过 Cloudflare。 |
| 3 | 静态资源放到 Workers Static Assets、Pages、R2 或 Cache。 | 攻击时先让边缘缓存吃掉可缓存请求。 |
| 4 | 保持 DDoS managed rulesets 默认设置。 | 官方默认值通常比普通项目手动调参更稳。 |
| 5 | 写入口再加 WAF / Rate Limiting / Turnstile。 | 业务滥用不是纯 DDoS 问题。 |
| 6 | 做 DDoS alerts 和基础账单告警。 | 先知道是否发生攻击，再决定是否升级。 |

## 源站保护最重要

DDoS 防护失效最常见的原因，是源站可以被绕过 Cloudflare 直连。

普通项目先做这些：

| 动作 | 判断 |
| --- | --- |
| Web 记录使用 Proxied | 能隐藏源站 IP，并让请求进入 Cloudflare 防护链路。 |
| 审计 DNS-only 记录 | SPF、TXT、旧子域名、历史记录可能泄露源站信息。 |
| 邮件服务和 Web 源站分离 | 邮件退信、MX 记录和日志容易暴露服务器 IP。 |
| 源站防火墙只放必要入口 | 允许 Cloudflare IP ranges 和可信运维入口。 |
| 被打过后考虑更换源站 IP | 旧 IP 已经泄露时，单纯接入 Cloudflare 不够。 |
| 后台和内网服务优先用 Tunnel / Access | 不要为了方便把管理入口暴露到公网。 |

如果源站不能收窄入口，Cloudflare 前面的防护再好，也只能保护走 Cloudflare 的那部分流量。

## Under Attack 慎用

Under Attack mode 是 L7 DDoS 应急工具，不是长期配置。它会给访客展示 challenge 页面，可能影响 API、第三方分析、搜索引擎和用户体验。

| 用法 | 判断 |
| --- | --- |
| 全站开启 | 只适合正在被打、且暂时无法定位路径时短时间使用。 |
| 按路径开启 | 更推荐，只保护登录、后台、写 API 或被打路径。 |
| 长期开启 | 不推荐，会让正常访问长期承担 challenge 成本。 |
| 替代 WAF / Rate Limiting | 不推荐，攻击结束后要回到精确规则。 |

更稳的应急思路是：先确认是源站过载、缓存未命中、Worker 压力、数据库压力，还是 Cloudflare 已经在挑战 / 阻断；再对受影响路径临时加保护。不要一上来全站挑战所有人。

## 什么时候升级

| 升级信号 | 可能需要 |
| --- | --- |
| 需要用 Log action 观察 DDoS managed rules 命中 | Enterprise。 |
| 需要 10 个 overrides / rules，并按不同流量细分 | Enterprise + Advanced DDoS。 |
| 合法流量经常出现大峰值，担心新规则误伤 | Business / Enterprise 的 proactive false positive detection 更有价值。 |
| 需要更完整 Adaptive DDoS | Enterprise + Advanced DDoS。 |
| 要保护自有 IP 段、企业网络或非 HTTP 入口 | Magic Transit、Spectrum、Network Analytics。 |
| 需要高级 DDoS 告警过滤 | Enterprise + Advanced DDoS。 |

不要因为“怕 DDoS”直接买企业能力。普通 Web 项目先把 Proxied、源站保护、缓存、WAF、Rate Limiting 和告警做好，通常比提前调 DDoS overrides 更有用。

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| Free 没有 DDoS 防护。 | 官方标注所有计划都有 standard, unmetered DDoS protection。 |
| 开了 Cloudflare 就一定安全。 | 只有经过 Cloudflare 的流量才受保护，源站直连必须堵住。 |
| Workers Paid 会增强 DDoS。 | Workers Paid 影响开发者平台额度，不提升 DDoS 产品能力。 |
| Under Attack 可以长期打开。 | 把它当应急工具，攻击结束后回到精确规则。 |
| DDoS Protection 能解决评论垃圾内容。 | 评论、登录、搜索和写 API 要用 WAF、Rate Limiting、Turnstile 和业务权限。 |
| 缓存不重要。 | 缓存能显著降低攻击时的回源压力。 |
| 要自己模拟 DDoS 来测试。 | 不要攻击自己的站点；需要压测时用合规、可控的应用层压测方案。 |

## GitHub 开源参考

| 仓库 | 可以学什么 |
| --- | --- |
| [cloudflare/cloudflare-docs DDoS source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ddos-protection) | 官方 DDoS Protection 文档源文件，适合追踪 managed rulesets、best practices、analytics、alerts 和 changelog。 |
| [cloudflare/cloudflare-docs Fundamentals source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/fundamentals) | Under Attack、Cloudflare IP ranges、源站保护等基础文档源文件。 |
| [cloudflare/skills DDoS reference](https://github.com/cloudflare/skills/tree/main/skills/cloudflare/references/ddos) | Cloudflare 官方 Agent Skills 里的 DDoS 参考，适合看产品边界和常见误区。 |
| [cloudflare/cloudflare-docs Ruleset Engine source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ruleset-engine) | 需要团队化管理规则时，再理解 phase、action、expression 和 override 模型。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 企业项目把 DDoS、WAF、Rules 和其他 Cloudflare 配置纳入 IaC 时再看。 |

## 事实来源

- [Cloudflare DDoS Protection](https://developers.cloudflare.com/ddos-protection/)
- [About DDoS protection](https://developers.cloudflare.com/ddos-protection/about/)
- [Attack coverage](https://developers.cloudflare.com/ddos-protection/about/attack-coverage/)
- [How DDoS protection works](https://developers.cloudflare.com/ddos-protection/about/how-ddos-protection-works/)
- [Managed rulesets](https://developers.cloudflare.com/ddos-protection/managed-rulesets/)
- [HTTP DDoS Attack Protection](https://developers.cloudflare.com/ddos-protection/managed-rulesets/http/)
- [Network-layer DDoS Attack Protection](https://developers.cloudflare.com/ddos-protection/managed-rulesets/network/)
- [Adaptive DDoS Protection](https://developers.cloudflare.com/ddos-protection/managed-rulesets/adaptive-protection/)
- [Proactive DDoS defense](https://developers.cloudflare.com/ddos-protection/best-practices/proactive-defense/)
- [DDoS Analytics](https://developers.cloudflare.com/ddos-protection/reference/analytics/)
- [DDoS Alerts](https://developers.cloudflare.com/ddos-protection/reference/alerts/)
- [Under Attack mode](https://developers.cloudflare.com/fundamentals/reference/under-attack-mode/)
- [Protect your origin server](https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/)
- [Cloudflare IP addresses](https://developers.cloudflare.com/fundamentals/concepts/cloudflare-ip-addresses/)
