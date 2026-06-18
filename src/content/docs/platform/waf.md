---
title: WAF
description: Cloudflare WAF 的判断、免费边界、升级信号和误伤处理。
---

最后核对日期：2026-06-18。

WAF 的作用不是“写越多规则越安全”，而是给 Web 入口和 API 加一层应用安全过滤。先保护后台、登录、评论、搜索、上传和写 API，静态阅读路径不需要复杂规则。

## 一句话判断

| 要解决的问题 | 先用什么 |
| --- | --- |
| 已知漏洞、常见攻击、OWASP 风险 | Managed Rules。 |
| 后台、上传、写 API 这种明确路径 | Custom Rules。 |
| 登录、评论、搜索、上传被刷 | Rate Limiting。 |
| 表单和评论需要人机判断 | Turnstile。 |
| 源站 IP 可能被绕过 | 先看 [Fundamentals](/platform/fundamentals/) 和 [DDoS Protection](/platform/ddos/)。 |

## 免费与计划边界

| 能力 | Free | Pro / Business | 实践判断 |
| --- | --- | --- | --- |
| WAF | 可用 | 可用 | Free 已经能做基础防护。 |
| Custom Rules | 5 条 | Pro 20，Business 100 | Free 的 5 条留给最关键入口。 |
| Rate Limiting Rules | 1 条 | Pro 2，Business 5 | 优先给登录、评论、搜索、上传或写 API。 |
| Managed Rules | Free Managed Ruleset | Pro+ 可用更完整规则集 | 先开基础规则并观察误伤。 |
| 复杂匹配 | Free / Pro 较受限 | Business 起更完整 | 先整理路径，不要靠复杂表达式补设计。 |

这里的计划是 zone plan，不是 Workers Paid。`$5/month` Workers Paid 不会增加 WAF 规则数量。

## 推荐顺序

1. 确认 Web 记录 Proxied，源站不能被直连。
2. 打开基础 Managed Rules，用 Security Events 观察真实命中。
3. 给后台、登录、写 API、上传加少量 Custom Rules。
4. 给登录、评论、搜索、上传或写 API 加 Rate Limiting。
5. 对误伤做具体 exception，不要整套关闭。

如果只能做一件事，先保证后台和写接口不裸奔。静态站本身主要靠缓存、DDoS 防护和源站保护，不需要堆规则。

## Custom Rules 只管明确边界

| 适合写规则 | 不适合写规则 |
| --- | --- |
| 后台只允许可信来源。 | 挑战所有海外请求。 |
| 写 API 先挑战或限制方法。 | 拦截所有非浏览器请求。 |
| 上传路径单独收紧。 | 全站 Allow 某个大网段。 |
| 临时攻击路径直接拦截。 | 用一堆规则弥补入口没分清。 |

规则不够时，先合并业务入口、删掉无效规则，再考虑升级。

官方核对入口：[Cloudflare WAF](https://developers.cloudflare.com/waf/)、[Custom Rules](https://developers.cloudflare.com/waf/custom-rules/)、[Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)。
