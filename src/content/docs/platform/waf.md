---
title: WAF
description: Cloudflare WAF 的 Custom Rules、Managed Rules、Rate Limiting、Ruleset Engine、计划边界、误伤排查和普通项目最佳实践。
---

最后核对日期：2026-06-17。WAF 的规则数量、Managed Rules 可用性、Rate Limiting 配额和 Dashboard 入口会变化，上线前以 Cloudflare WAF 官方页面为准。

## 一句话判断

Cloudflare WAF 不是“打开一个安全开关就完事”，而是把入口请求分成几层处理：

```text
HTTP 请求进入 Cloudflare
  ↓
DDoS L7 防护
  ↓
Custom Rules：你自己写的路径、IP、国家、header、cookie、score 规则
  ↓
Rate Limiting：按 IP、cookie、header、API key 等维度计数
  ↓
Managed Rules：Cloudflare 和 OWASP 维护的漏洞/攻击规则集
  ↓
Bot / 其他安全能力
  ↓
源站 / Worker / Pages
```

普通项目默认策略：**Managed Rules 先用保守模式，Custom Rules 只保护明确入口，Rate Limiting 放在登录、评论、搜索、上传和写 API 上；先观察 Security Events，再逐步收紧。**

## 免费与付费边界

| 能力 | Free | Pro | Business | Enterprise |
| --- | --- | --- | --- | --- |
| WAF | 可用 | 可用 | 可用 | 可用 |
| Custom Rules | 5 条 | 20 条 | 100 条 | 1,000 条 |
| Custom Rules 支持动作 | 除 Log 外均支持 | 除 Log 外均支持 | 除 Log 外均支持 | 全部支持 |
| Custom Rules regex | 不支持 | 不支持 | 支持 | 支持 |
| Zone custom rulesets | 1 | 2 | 5 | 10 |
| Account-level custom rulesets | 不支持 | 不支持 | 不支持 | 支持 |
| Rate Limiting Rules | 1 条 | 2 条 | 5 条 | 100 条，需对应合同 / add-on |
| WAF Managed Rules | Free Managed Ruleset only | Cloudflare Managed / OWASP / Free Managed | Cloudflare Managed / OWASP / Free Managed | Cloudflare Managed / OWASP / SDD 等 |
| WAF Attack Score | 不支持 | 不支持 | 支持一个字段 | 支持 |
| Leaked Credentials Detection | 支持一个字段 | 支持 | 支持 | 支持 |
| Malicious Uploads Detection | 不支持 | 不支持 | 不支持 | Paid add-on |
| Security Events | sampled logs only | 支持 | 支持 | 支持 |
| Security Events alerts | 不支持 | 不支持 | 支持 | 支持，高级告警仅 Enterprise |
| Custom Lists | 1 个 / 10,000 items | 10 个 / 10,000 items | 10 个 / 10,000 items | 1,000 个 / 500,000 items |

这里的“付费”是 zone 计划或 Enterprise 合同，不是 Workers Paid。Workers Paid 每月 $5 不会自动提升 WAF 规则数量。

## 三类规则

| 类型 | 解决什么问题 | 普通项目怎么用 |
| --- | --- | --- |
| Custom Rules | 你明确知道要拦、挑战、跳过的流量。 | 保护 `/admin`、`/api/*`、上传、特定国家/ASN、临时攻击路径。 |
| Rate Limiting Rules | 防刷、防撞库、防 API 滥用。 | 登录、评论、搜索、验证码、上传、写接口优先。 |
| Managed Rules | 已知漏洞、常见攻击、OWASP/CVE 规则。 | Pro+ 可以启用 Cloudflare Managed Ruleset；Free 至少有 Free Managed Ruleset。 |

不要一开始写一堆“看起来很安全”的规则。WAF 规则越多，误伤和排查成本越高。普通项目最有价值的规则，通常是少数几个明确入口的保护。

## 执行顺序

Cloudflare WAF 的现代能力基于 Ruleset Engine。安全相关阶段大致按这个顺序执行：

```text
ddos_l7
  ↓
http_request_firewall_custom
  ↓
http_ratelimit
  ↓
http_request_firewall_managed
  ↓
http_request_sbfm
```

重要影响：

- Custom Rules 比 Managed Rules 更早执行。
- Rate Limiting 在 Custom Rules 后执行。
- 一个 terminating action，例如 Block 或 Managed Challenge，会停止后续阶段。
- Account-level rulesets 先于 zone-level rulesets。
- Bot Fight Mode 不走 Ruleset Engine，不能用 Custom Rules skip。

## 推荐默认组合

| 场景 | 推荐配置 | 说明 |
| --- | --- | --- |
| 文档站 / 官网 | Free Managed Ruleset + 少量 Custom Rules | 先保护后台、登录、特殊 API，不要挑战所有访客。 |
| 有评论 / 表单 | Rate Limiting + Turnstile 服务端验证 | WAF 限速防刷，Turnstile 验证真人。 |
| Worker API | Custom Rules 限路径 + Rate Limiting 限写接口 | 只让需要公开的路径进 Worker，写接口更严格。 |
| 管理后台 | Access 优先，WAF 作为补充 | 后台不要只靠 WAF；Access 更适合身份边界。 |
| 电商 / 登录系统 | Managed Rules + Rate Limiting + Leaked Credentials Detection | 先记录和观察，再对高风险入口 block/challenge。 |
| WordPress | Managed Rules 里只启用相关规则组 | 不用的 CMS 规则不要全开。 |

本站当前是文档站，真正需要 WAF 的入口主要是评论服务、后台和未来搜索/API。静态页面不需要复杂 WAF 规则。

## Custom Rules

Custom Rules 适合写明确的业务边界。常见表达式：

```text
# 保护后台路径，只允许可信 IP。
http.request.uri.path starts_with "/admin" and not ip.src in $trusted_admin_ips

# 对公开 API 的非 GET 请求做挑战。
http.request.uri.path starts_with "/api/" and http.request.method ne "GET"

# 放过静态资源，避免安全规则误伤。
http.request.uri.path matches "\\.(css|js|png|jpg|webp|woff2?)$"
```

写规则时优先用 `starts_with`、`eq`、`contains` 这类简单操作；Business 以上才支持 regex。规则名要写出意图，例如 `challenge write api outside trusted ip`，不要写成 `block bad traffic`。

## Managed Rules

Managed Rules 是 Cloudflare 维护的规则集。常见规则集：

| 规则集 | 可用性 | 判断 |
| --- | --- | --- |
| Cloudflare Free Managed Ruleset | 所有计划 | Free 计划也能用，覆盖高影响和广泛利用漏洞。 |
| Cloudflare Managed Ruleset | Pro+ | 覆盖更广，适合大多数生产站。 |
| Cloudflare OWASP Core Ruleset | Pro+ | 需要监控误伤；官方说明它在 Cloudflare Managed Ruleset 和 WAF attack score 之上收益可能有限。 |
| Exposed Credentials Check | Pro+，已 deprecated | 官方更推荐新的 leaked credentials detection。 |
| Sensitive Data Detection | Enterprise | 数据泄露检测场景。 |

Managed Rules 的正确打开方式：

1. 先启用低风险或默认配置。
2. 看 Security Events 里真实命中。
3. 对误伤的具体规则做 exception 或 override。
4. 不要为了放过一个路径就跳过整套 Managed Rules。

Managed Rules 会检查请求 body，但检查上限随计划不同。官方特别提醒：请求 body 没被检查的部分不会参与规则判断，较大的 body 也可能带来误伤，需要结合上传接口单独处理。

## Rate Limiting

Rate Limiting 用来限制请求速率，不是严格保证“只有 N 个请求能到源站”。官方说明计数和执行之间可能有几秒延迟，超额请求仍可能在短时间内到达源站。

优先保护：

| 入口 | 维度 | 初始动作 |
| --- | --- | --- |
| `/login` | IP + cookie / JA4（有条件时） | Managed Challenge 或 Block |
| `/api/comment` | IP + path + method | Managed Challenge |
| `/api/search` | IP + query / API key | 短周期限制 |
| `/upload` | IP + user/session | 更低阈值 |
| `/checkout` | `cf_clearance` cookie / session | 防 challenge token 复用 |

Rate Limiting 的旧 API 和旧 Terraform resource 已在 2025-06-15 后不再支持。新配置应该走 Rulesets API 或 `cloudflare_ruleset`。

## Skip 与 Allow

WAF custom rules 没有 Allow 动作。要放过特定请求，使用 Skip，并明确跳过什么：

| 做法 | 结果 |
| --- | --- |
| IP Access Rules 里 Allow | 可能绕过 Custom Rules、Rate Limiting、Managed Rules，且不一定出现在 Security Events。 |
| Custom Rules 里 Skip current ruleset | 只跳过当前 ruleset 后续规则。 |
| Custom Rules 里 Skip phases | 可以跳过 rate limiting、managed rules 或 Super Bot Fight Mode。 |
| Managed Rules exception | 只跳过某个 managed ruleset、tag 或具体规则，更适合处理误伤。 |

普通项目不要把“可信 IP”全局 Allow 到过宽。更可控的方式是用 Custom Rules 的 Skip，只跳过确实需要跳过的阶段。

## 误伤排查

| 现象 | 常见原因 | 处理 |
| --- | --- | --- |
| 搜索引擎或监控被拦 | country / ASN / path 规则过宽，或 fake bot managed rule。 | 查 Security Events，给已知 bot 或监控做精确 exception。 |
| 后台用户被挑战循环 | Challenge cookie 与 HTTP/HTTPS、SameSite 或跨 hostname 配置冲突。 | 确保全站 HTTPS，减少跨域后台入口。 |
| 规则没触发 | IP Access Allow 更早放行，或路径被 rewrite 后不再匹配。 | 查 Trace / Security Events，确认规则看到的请求形态。 |
| 登录限流误伤公司网络 | 大量用户共用 NAT IP。 | Business+ 可用 IP with NAT support；否则加 session/cookie/header 维度。 |
| Managed Rules 拦正常上传 | body 或特定规则误判。 | 对具体上传路径和具体 rule 做 exception，别关整套规则。 |

排查顺序：

1. 先看 Security Events 的 source、action、rule ID。
2. 确认是否有 IP Access Rules 或旧规则提前生效。
3. 确认 Custom Rules 顺序和 terminating action。
4. 如果是 Managed Rules，只 override 具体规则或 tag。
5. 规则调整先用 Log / Challenge 观察，再 Block。

## API 与 IaC

WAF 是 zone/account 级配置，不是 Worker 代码配置。生产项目建议把关键规则写入 IaC，或者至少导出规则快照。

```bash
# 读取 zone rulesets，用于备份和对账。
curl --request GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets" \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

```hcl
# 使用 cloudflare_ruleset 管理 Custom Rules；旧 firewall/rate_limit 资源不要再作为新项目真源。
resource "cloudflare_ruleset" "waf_custom" {
  zone_id = var.zone_id
  name    = "custom-waf"
  kind    = "zone"
  phase   = "http_request_firewall_custom"

  rules {
    action      = "managed_challenge"
    expression  = "http.request.uri.path starts_with \"/api/\" and http.request.method ne \"GET\""
    description = "challenge write api requests"
    enabled     = true
  }
}
```

## GitHub 开源参考

| 仓库 | 可以学什么 |
| --- | --- |
| [cloudflare/cloudflare-docs WAF source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/waf) | 官方 WAF 文档源文件，适合追踪 Custom Rules、Managed Rules、Rate Limiting、troubleshooting 的变更。 |
| [cloudflare/skills WAF reference](https://github.com/cloudflare/skills/tree/main/skills/cloudflare/references/waf) | Cloudflare 官方 Agent Skills 里的 WAF 参考，适合看配置模式、常见误区和 Rulesets API 写法。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 用 `cloudflare_ruleset` 管理 WAF、rate limiting、managed rulesets 和 skip/override。 |
| [cloudflare/cloudflare-go](https://github.com/cloudflare/cloudflare-go) | Cloudflare 官方 Go SDK，适合做规则备份、同步和审计工具。 |
| [cloudflare/cloudflare-docs Ruleset Engine source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ruleset-engine) | Ruleset Engine 文档源文件，适合理解 phases、actions、expressions 和 API 模型。 |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 本站早期学习的原始参考仓库之一，适合对照教程站的信息架构。 |

## 官方资料

- [Cloudflare WAF](https://developers.cloudflare.com/waf/)
- [WAF concepts](https://developers.cloudflare.com/waf/concepts/)
- [WAF custom rules](https://developers.cloudflare.com/waf/custom-rules/)
- [WAF custom rules settings](https://developers.cloudflare.com/waf/custom-rules/settings/)
- [WAF managed rules](https://developers.cloudflare.com/waf/managed-rules/)
- [Cloudflare Managed Ruleset](https://developers.cloudflare.com/waf/managed-rules/reference/cloudflare-managed-ruleset/)
- [Cloudflare Free Managed Ruleset](https://developers.cloudflare.com/waf/managed-rules/reference/cloudflare-free-managed-ruleset/)
- [Cloudflare OWASP Core Ruleset](https://developers.cloudflare.com/waf/managed-rules/reference/owasp-core-ruleset/)
- [Rate limiting rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- [WAF availability](https://developers.cloudflare.com/waf/#availability)
- [WAF phases](https://developers.cloudflare.com/waf/reference/phases/)
- [Security Events](https://developers.cloudflare.com/waf/analytics/security-events/)
- [Troubleshooting WAF](https://developers.cloudflare.com/waf/troubleshooting/)
- [Ruleset Engine](https://developers.cloudflare.com/ruleset-engine/)
- [Rules language](https://developers.cloudflare.com/ruleset-engine/rules-language/)
