---
title: WAF
description: Cloudflare WAF 的普通项目判断、免费边界、升级信号和误伤处理。
---

最后核对日期：2026-06-18。WAF 的规则数量、Managed Rules、Rate Limiting 和 Security Events 口径会变化；上线前以 Cloudflare WAF 官方文档为准。

WAF 的作用不是“写越多规则越安全”，而是给 Web 入口和 API 加一层应用安全过滤。普通项目先保护后台、登录、评论、搜索、上传和写 API，静态阅读路径不需要复杂规则。

## 一句话判断

| 要解决的问题 | 先用什么 |
| --- | --- |
| 已知漏洞、常见攻击、OWASP 风险 | Managed Rules。 |
| 后台、上传、写 API 这种明确路径 | Custom Rules。 |
| 登录、评论、搜索、上传被刷 | Rate Limiting。 |
| 表单和评论需要人机判断 | Turnstile。 |
| 源站 IP 可能被绕过 | 先看 [Fundamentals](/platform/fundamentals/) 和 [DDoS Protection](/platform/ddos/)。 |

## 免费与计划边界

| 能力 | Free | Pro / Business | 普通项目判断 |
| --- | --- | --- | --- |
| WAF | 可用 | 可用 | Free 已经能做基础防护。 |
| Custom Rules | 5 条 | Pro 20，Business 100 | Free 的 5 条留给最关键入口。 |
| Rate Limiting Rules | 1 条 | Pro 2，Business 5 | 优先给登录、评论、搜索、上传或写 API。 |
| Managed Rules | Free Managed Ruleset | Pro+ 可用更完整规则集 | 先开基础规则并观察误伤。 |
| regex / 更复杂匹配 | Free / Pro 不支持 | Business 起 | 路径结构先整理清楚，不要靠复杂表达式补设计。 |

这里的计划是 zone plan，不是 Workers Paid。`$5/month` Workers Paid 不会增加 WAF 规则数量，也不会提升 Managed Rules 范围。

## 推荐顺序

| 顺序 | 做什么 |
| --- | --- |
| 1 | 确认 Web 记录 Proxied，源站不能被直连。 |
| 2 | 打开 Free Managed Ruleset，用 Security Events 观察真实命中。 |
| 3 | 给后台、登录、写 API、上传加少量 Custom Rules。 |
| 4 | 给登录、评论、搜索、上传或写 API 加 Rate Limiting。 |
| 5 | 对误伤做具体 exception，不要整套关闭。 |

如果只能做一件事，先保证后台和写接口不裸奔。静态站本身主要靠缓存、DDoS 防护和源站保护，不需要堆规则。

## Custom Rules 只管明确边界

| 适合写规则 | 不适合写规则 |
| --- | --- |
| 后台只允许可信来源。 | 挑战所有海外请求。 |
| 写 API 先挑战或限制方法。 | 拦截所有非浏览器请求。 |
| 上传路径单独收紧。 | 全站 Allow 某个大网段。 |
| 临时攻击路径直接拦截。 | 用一堆规则弥补入口没分清。 |

规则不够时，先合并业务入口、删掉无效规则，再考虑升级。很多项目不是规则太少，而是路径太散。

## Managed Rules 与误伤

Managed Rules 适合挡常见漏洞和通用攻击。更稳的方式是：

| 阶段 | 做法 |
| --- | --- |
| 启用 | 先用默认或保守动作。 |
| 观察 | 看 Security Events 里是否命中正常用户、搜索引擎、监控或回调。 |
| 调整 | 对具体规则、标签、路径或来源做 exception。 |
| 收紧 | 有证据再提高动作强度。 |

上传、富文本、搜索、Webhook 和第三方回调最容易误伤。不要因为一次误伤就整套关闭 Managed Rules。

## 什么时候升级

| 信号 | 可能需要 |
| --- | --- |
| 5 条 Custom Rules 保护不了关键入口 | Pro 或 Business。 |
| 登录、评论、搜索、上传都需要独立限流 | Pro / Business。 |
| 需要 regex 处理复杂路径 | Business 起。 |
| 多个域名要统一策略 | Enterprise account-level WAF。 |
| 需要更完整 Bot / API 安全能力 | Business / Enterprise 或对应 add-on。 |

升级前先确认源站已经藏好、路径已经分清、规则没有重复。否则买更高计划也只是把混乱放大。

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 开了 WAF 就不用管源站。 | 先隐藏源站真实 IP，只允许 Cloudflare 回源。 |
| 全站 Challenge 更安全。 | 只给高风险路径和异常行为加挑战。 |
| Rate Limiting 能精确挡住每个请求。 | 它是滥用缓冲层，源站和业务仍要有承压能力。 |
| 误伤就关掉整套规则。 | 对具体规则或路径做 exception。 |
| Workers Paid 会提升 WAF。 | WAF 跟 zone plan / Enterprise 走，不跟 Workers Paid 走。 |

## 事实来源

| 来源 | 用途 |
| --- | --- |
| [Cloudflare WAF](https://developers.cloudflare.com/waf/) | WAF 官方入口。 |
| [WAF custom rules](https://developers.cloudflare.com/waf/custom-rules/) | Custom Rules、规则数量和匹配能力。 |
| [WAF managed rules](https://developers.cloudflare.com/waf/managed-rules/) | Managed Rules 和 exception。 |
| [Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/) | Rate Limiting 计划边界和行为。 |
| [Security Events](https://developers.cloudflare.com/waf/analytics/security-events/) | 误伤和命中排查。 |
| [cloudflare/cloudflare-docs WAF source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/waf) | 官方 WAF Markdown 源文件。 |
