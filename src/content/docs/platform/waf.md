---
title: WAF
description: Cloudflare WAF 的普通项目判断、免费与付费边界、Custom Rules、Managed Rules、Rate Limiting 和误伤处理。
---

最后核对日期：2026-06-18。WAF 的规则数量、Managed Rules 可用性、Rate Limiting 配额和 Dashboard 入口会变化，上线前以 Cloudflare WAF 官方页面为准。

## 一句话判断

WAF 是给 Web 入口和 API 加一层应用安全过滤：已知漏洞交给 Managed Rules，明确业务边界交给 Custom Rules，刷接口和撞库交给 Rate Limiting。

普通项目不要把 WAF 当成“越多规则越安全”。最稳的顺序是：先打开基础防护，观察 Security Events，再只对登录、后台、评论、搜索、上传、写 API 这些明确入口加规则。

## 先问六个问题

| 问题 | 判断 |
| --- | --- |
| 是否有后台、登录、评论、搜索、上传或公开 API？ | 有这些入口，WAF 才有明确价值。 |
| 是否已经把源站藏在 Cloudflare 后面？ | 源站能被直连时，WAF 只能保护经过 Cloudflare 的流量。 |
| 是否知道最危险的路径在哪里？ | 不知道路径时，先观察日志，不要乱写全站挑战。 |
| 是否有正常用户共用出口 IP？ | 公司、学校、代理网络容易被简单 IP 限流误伤。 |
| 是否依赖搜索引擎、监控或第三方回调？ | 过宽规则会影响 SEO、告警和支付 / 登录回调。 |
| 是否需要统一管理多域名规则？ | 多 zone 统一策略通常要 Enterprise account-level WAF。 |

## 免费与计划边界

| 能力 | Free | Pro | Business | Enterprise |
| --- | --- | --- | --- | --- |
| WAF | 可用 | 可用 | 可用 | 可用 |
| Custom Rules | 5 条 | 20 条 | 100 条 | 1,000 条 |
| Custom Rules 动作 | 除 Log 外均支持 | 除 Log 外均支持 | 除 Log 外均支持 | 全部支持 |
| Custom Rules regex | 不支持 | 不支持 | 支持 | 支持 |
| Zone custom rulesets | 1 个 | 2 个 | 5 个 | 10 个 |
| Account-level custom rulesets | 不支持 | 不支持 | 不支持 | 支持 |
| Rate Limiting Rules | 1 条 | 2 条 | 5 条 | 100 条，按合同 / add-on |
| Rate Limiting 周期 | 10 秒 | 计数最长 1 分钟，执行最长 1 小时 | 计数最长 10 分钟，执行最长 1 天 | 更长周期和高级字段按合同 |
| WAF Managed Rules | Free Managed Ruleset | Free / Cloudflare Managed / OWASP | Free / Cloudflare Managed / OWASP | Free / Cloudflare Managed / OWASP / SDD |
| WAF Attack Score | 不支持 | 不支持 | 支持一个字段 | 支持 |
| Leaked Credentials Detection | 支持一个字段 | 支持 | 支持 | 支持 |
| Malicious Uploads Detection | 不支持 | 不支持 | 不支持 | Paid add-on |
| AI Security for Apps | 不支持 | 不支持 | 不支持 | Paid add-on |
| Security Events | sampled logs only | 支持 | 支持 | 支持 |
| Security Events alerts | 不支持 | 不支持 | 支持 | 支持，高级告警仅 Enterprise |

这里的计划指 zone 计划或 Enterprise 合同，不是 Workers Paid。每月 5 美元的 Workers Paid 不会提升 WAF 规则数量、Managed Rules 范围或 Rate Limiting 配额。

## 三种能力怎么选

| 能力 | 解决什么 | 普通项目用法 |
| --- | --- | --- |
| Managed Rules | 已知漏洞、常见攻击、OWASP 风险。 | Free 用 Free Managed Ruleset；Pro+ 再启用 Cloudflare Managed Ruleset，先保守观察。 |
| Custom Rules | 明确知道哪些路径、来源或请求特征需要处理。 | 保护后台、写 API、上传入口、临时攻击路径，不要写泛化规则。 |
| Rate Limiting | 防刷、防撞库、防 API 滥用。 | 优先放在登录、评论、搜索、上传和写接口，不要套全站。 |

如果只能做一件事，优先保证后台和写接口不裸奔。静态页面本身不需要复杂 WAF 规则，更多靠缓存、DDoS 防护和源站保护。

## 推荐默认顺序

| 阶段 | 做什么 | 为什么 |
| --- | --- | --- |
| 1 | 确认 DNS 记录走 Proxied，源站不暴露真实 IP。 | WAF 只能保护经过 Cloudflare 的请求。 |
| 2 | 打开 Free Managed Ruleset，Pro+ 再考虑 Cloudflare Managed Ruleset。 | 先获得基础漏洞防护。 |
| 3 | 用 Security Events 看真实命中。 | 先看证据，再决定收紧还是放行。 |
| 4 | 给后台、登录、写 API、上传加少量 Custom Rules。 | 规则越明确，误伤越少。 |
| 5 | 给登录、评论、搜索、上传加 Rate Limiting。 | 这些入口最容易被低成本刷爆。 |
| 6 | 对误伤做具体 exception，不要整套关闭。 | 保留防护面，同时减少正常业务受影响。 |

## Custom Rules 只管明确边界

Custom Rules 适合表达非常清楚的边界：后台只允许可信来源、写接口先挑战、特定临时攻击路径直接拦截、上传路径单独收紧。

不要用 Custom Rules 做模糊判断。比如“拦截坏流量”“挑战所有海外请求”“拦截所有非浏览器请求”这类规则听起来安全，实际最容易误伤搜索引擎、监控、支付回调、移动端 App 和真实用户。

Free 只有 5 条 Custom Rules，应该留给最关键入口。规则不够时，先合并业务入口和删除无效规则，而不是立刻升级。

## Managed Rules 先保守再收紧

Managed Rules 的价值是 Cloudflare 持续维护常见攻击、漏洞和 OWASP 风险。普通项目不要从第一天就把所有规则调到最激进。

更稳的做法：

1. 先启用默认或低风险配置。
2. 观察 Security Events 里是否命中正常用户。
3. 对误伤的具体规则、标签或路径做 exception。
4. 只在有证据时提高动作强度。

Managed Rules 会检查请求 body，但不同计划、不同规则集的检查范围和行为不完全一样。上传、富文本、搜索、Webhook 这类入口，最容易触发误伤，应该单独观察。

## Rate Limiting 放在写入口

Rate Limiting 适合限制“频率”，不是严格保证源站只收到固定数量请求。官方说明计数和执行之间可能有短暂延迟，超额请求仍可能在短时间内到达源站。

优先保护这些入口：

| 入口 | 为什么 |
| --- | --- |
| 登录 / 注册 / 找回密码 | 撞库、爆破、短信和邮件成本。 |
| 评论 / 留言 / 表单 | 垃圾内容和写入成本。 |
| 搜索 | 容易放大数据库、AI 或第三方 API 成本。 |
| 上传 | 带宽、存储和安全扫描成本更高。 |
| 公开写 API | 被脚本刷时最容易产生账单和数据污染。 |

不要把 Rate Limiting 粗暴套到全站。静态资源、搜索引擎、监控和正常高并发页面可能会被一起限住。

## Skip 和 exception

Cloudflare WAF 里“放过”不是一个随便用的全局白名单。更好的原则是：只跳过必须跳过的规则，范围越小越好。

| 场景 | 推荐做法 |
| --- | --- |
| 某个 Managed Rule 误伤上传接口 | 对具体路径和具体规则做 exception。 |
| 可信监控被挑战 | 只对监控来源跳过必要阶段。 |
| 后台用户被挑战循环 | 优先修 HTTPS、Cookie、跨域和登录入口设计。 |
| 合作方固定 IP 访问 API | 用窄范围规则保护特定 API，不要全站 Allow。 |

过宽 Allow 会让后续 Custom Rules、Rate Limiting、Managed Rules 都失去意义。普通项目应少用全局白名单，多用具体 exception。

## 什么时候升级

| 升级信号 | 可能需要 |
| --- | --- |
| 5 条 Custom Rules 不够保护关键入口 | Pro 或 Business。 |
| 需要 regex 匹配复杂路径 | Business 起。 |
| 需要更完整 Managed Rules / OWASP | Pro 起。 |
| 登录和 API 需要更多 Rate Limiting 规则 | Pro / Business，复杂场景看 Enterprise。 |
| 需要多域名统一 WAF 策略 | Enterprise account-level WAF。 |
| 需要 Attack Score、更多 bot 字段或高级限流维度 | Business / Enterprise，视具体产品合同。 |
| 上传文件需要恶意文件检测 | Enterprise paid add-on。 |
| AI 应用需要 prompt injection / PII / unsafe topic 检测 | Enterprise paid add-on。 |

升级前先确认规则是否真的不够用。很多项目的问题不是计划低，而是规则太散、入口没分清、源站还暴露。

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 开了 WAF 就不用管源站暴露。 | 先隐藏源站真实 IP，只允许 Cloudflare 回源。 |
| 规则越多越安全。 | 少量明确规则更好排查，也更不容易误伤。 |
| 全站 Challenge 可以防刷。 | 把挑战放在写入口、登录和高风险路径。 |
| Rate Limiting 可以精确限住每个请求。 | 把它当作滥用缓冲层，源站仍要能承受短时突增。 |
| Managed Rules 误伤就整套关闭。 | 对具体规则、标签或路径做 exception。 |
| Workers Paid 会提升 WAF。 | Workers Paid 只影响 Workers 平台，不提升 WAF 配额。 |

## GitHub 开源参考

| 仓库 | 可以学什么 |
| --- | --- |
| [cloudflare/cloudflare-docs WAF source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/waf) | 官方 WAF 文档源文件，适合追踪 Custom Rules、Managed Rules、Rate Limiting 和 troubleshooting 的变化。 |
| [cloudflare/cloudflare-docs Ruleset Engine source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ruleset-engine) | Ruleset Engine 的官方文档源文件，适合理解规则、阶段、动作和表达式的边界。 |
| [cloudflare/skills WAF reference](https://github.com/cloudflare/skills/tree/main/skills/cloudflare/references/waf) | Cloudflare 官方 Agent Skills 里的 WAF 参考，适合看产品取舍和常见误区。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 团队化项目用 Terraform 管理 WAF、rate limiting、managed rulesets 和 exception。 |
| [cloudflare/cloudflare-go](https://github.com/cloudflare/cloudflare-go) | Cloudflare 官方 Go SDK，适合做规则备份、同步和审计工具。 |
| [coreruleset/coreruleset](https://github.com/coreruleset/coreruleset) | OWASP Core Rule Set 上游项目，适合理解通用 Web 攻击规则的来源。 |

## 事实来源

- [Cloudflare WAF](https://developers.cloudflare.com/waf/)
- [WAF concepts](https://developers.cloudflare.com/waf/concepts/)
- [WAF custom rules](https://developers.cloudflare.com/waf/custom-rules/)
- [WAF managed rules](https://developers.cloudflare.com/waf/managed-rules/)
- [Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [Security Events](https://developers.cloudflare.com/waf/analytics/security-events/)
- [Security Analytics](https://developers.cloudflare.com/waf/analytics/security-analytics/)
- [WAF phases](https://developers.cloudflare.com/waf/reference/phases/)
- [Security features interoperability](https://developers.cloudflare.com/waf/feature-interoperability/)
- [WAF troubleshooting](https://developers.cloudflare.com/waf/troubleshooting/faq/)
