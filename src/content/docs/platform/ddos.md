---
title: DDoS Protection
description: Cloudflare DDoS Protection 的免费边界、HTTP DDoS、Network-layer DDoS、Under Attack、源站保护、误伤排查和普通项目最佳实践。
---

最后核对日期：2026-06-17。DDoS Protection 的规则、告警、分析面板和 Advanced DDoS 能力会变化，上线前以 Cloudflare DDoS Protection 官方页面为准。

## 一句话判断

Cloudflare DDoS Protection 是入口层的自动防护，不是你在业务代码里写一个限流器就能替代的东西。它的核心价值是：**只要 Web 流量真正经过 Cloudflare 代理层，普通项目在 Free 计划也能获得自动、unmetered 的 DDoS 防护；需要精细 override、Log action、Adaptive / Advanced DDoS 时，再看 Enterprise 和 Advanced DDoS。**

```text
访客 / 攻击流量
  ↓
Cloudflare Anycast 网络
  ├─ Network-layer DDoS：L3/L4，UDP flood、SYN flood、DNS flood 等
  ├─ HTTP DDoS：L7，HTTP flood、cache busting、Slowloris、TLS exhaustion 等
  ├─ WAF / Rate Limiting / Bot / Turnstile
  ├─ Cache / Workers Static Assets / Worker
  └─ 源站 / D1 / R2 / 外部服务
```

普通项目的默认策略：**域名接入 Cloudflare，公开 Web 记录保持 Proxied，静态资源尽量缓存，源站不暴露公网直连；DDoS 交给默认 managed rulesets，登录、评论、搜索、上传和写 API 再用 WAF / Rate Limiting / Turnstile 做业务层保护。**

## 免费与付费边界

| 能力 | Free / Pro / Business | Enterprise | Enterprise + Advanced DDoS |
| --- | --- | --- | --- |
| 标准 DDoS 防护 | 可用，官方标注 standard, unmetered DDoS protection。 | 可用。 | 可用。 |
| HTTP DDoS Attack Protection | 可用，已接入 Cloudflare 的 zone 默认启用。 | 可用，可使用 Log action。 | 可用，支持更多规则和表达式能力。 |
| Network-layer DDoS Attack Protection | 可用，但普通 zone 不能像 Magic Transit 那样管理网络前缀策略。 | Magic Transit / Spectrum 客户可自定义。 | Magic Transit / Spectrum 客户可自定义。 |
| Ruleset override 数量 | 1 个 override / rule，不能自定义 expression，作用于全部流量。 | 1 个 override / rule，可用 Log action。 | 10 个 overrides / rules，可用 custom expressions 区分不同流量。 |
| Adaptive DDoS | 基础错误类 adaptive 保护。 | 基础错误类 adaptive 保护。 | 完整 Adaptive DDoS，包含更多 profiling signals。 |
| Advanced TCP / DNS Protection | 面向 Magic Transit 客户，不是普通文档站第一步。 | 面向 Magic Transit 客户。 | 面向 Magic Transit 客户。 |
| Analytics | Free 主要是 sampled logs；Pro / Business 可看 Security Events。 | WAF/CDN 看 Security Events，Magic Transit / Spectrum 看 Network Analytics。 | 更完整的分析和高级告警过滤。 |
| Alerts | 支持 DDoS alerts。 | 支持。 | 支持高级 alerts 与过滤。 |

这里的付费边界主要是 zone 计划、Enterprise 合同和 Advanced DDoS add-on，不是 Workers Paid。每月 $5 的 Workers Paid 会扩展 Workers 请求、CPU、日志、KV、Durable Objects 等开发者平台额度，但不会把 DDoS override 从 1 个变成 10 个。

## 两层防护

| 层级 | 保护对象 | 常见攻击 | 普通项目怎么理解 |
| --- | --- | --- | --- |
| Network-layer DDoS | L3/L4 网络流量。 | UDP flood、SYN flood、DNS flood、ICMP flood、反射放大。 | 只要 Web 入口走 Cloudflare，攻击会先撞到 Cloudflare 网络；自有 IP 段、TCP/UDP 应用和企业网络再看 [Spectrum](/platform/traffic-routing/) / Magic Transit。 |
| HTTP DDoS | L7 HTTP/HTTPS 请求。 | HTTP flood、cache busting、Slowloris、TLS/SSL exhaustion、已知 botnet 工具。 | 文档站、官网、API、评论入口最相关；默认启用，只有误伤或攻击未完全缓解时才调 override。 |

Cloudflare 的 managed rulesets 会持续更新。普通项目不需要维护“DDoS 规则库”，更重要的是确认所有公开入口真的在 Cloudflare 后面，并且源站不会被绕过。

## 与 WAF 和限流的关系

| 能力 | 解决的问题 | 不适合解决的问题 |
| --- | --- | --- |
| DDoS Protection | 大规模异常流量、协议层洪泛、应用层 DDoS。 | 业务规则、权限判断、评论垃圾内容。 |
| WAF Custom Rules | 明确路径、方法、国家、ASN、header、cookie 的安全边界。 | 只靠一条规则承受全站洪峰。 |
| Rate Limiting | 登录、评论、搜索、上传、写接口的刷量和撞库。 | 严格分布式计数或业务配额系统。 |
| Turnstile | 表单、评论、注册、登录等真人验证。 | 网络层洪泛和源站隐藏。 |
| Cache / CDN | 吸收可缓存请求，减少源站压力。 | 登录态、后台、用户私有响应。 |

DDoS 防护先挡“洪水”，WAF 和 Rate Limiting 再处理“坏请求”，Turnstile 处理“需要人机判断的入口”，缓存负责让静态资源不回源。把这几层混成一个功能，是很多配置变乱的起点。

## 推荐默认配置

| 项目阶段 | 推荐动作 | 说明 |
| --- | --- | --- |
| 新文档站 / 官网 | DNS 接入 Cloudflare，Web 记录设为 Proxied。 | 这是 DDoS、WAF、缓存、SSL/TLS 生效的前提。 |
| 有独立源站 | 源站防火墙只允许 Cloudflare IP 段和可信运维入口。 | 防止攻击者绕过 Cloudflare 直打源站。 |
| 静态站或前端应用 | 静态资源走 Workers Static Assets / Pages / Cache。 | 缓存命中越高，源站和 Worker 压力越低。 |
| 有登录 / 评论 / 搜索 / 上传 | 对写接口加 WAF Rate Limiting，必要时加 Turnstile。 | 这类通常不是纯 DDoS，而是业务层滥用。 |
| 正在被攻击 | 先看 Security Events / Analytics，再局部启用 Under Attack 或规则。 | 不要一上来全站挑战所有人。 |
| 企业网络 / 自有 IP 段 | 评估 Magic Transit、Spectrum、Network Analytics、Advanced DDoS。 | 这已经是企业网络防护，不是普通文档站默认栈。 |

本站是 Astro / Starlight 文档站，部署在 Workers Static Assets 上。对这类站点，最有价值的组合是：Cloudflare DNS + SSL/TLS + DDoS + Cache / CDN + WAF 基础规则 + Pagefind 静态搜索。评论服务和未来 API 才是需要额外 WAF / Rate Limiting / Turnstile 的入口。

## 源站保护

DDoS 防护最常见的失效方式，不是 Cloudflare 没拦住，而是攻击者根本没经过 Cloudflare：

```text
正确路径
访客 → Cloudflare → 源站 / Worker

危险路径
攻击者 → 源站真实 IP
```

普通项目先做这些：

1. Web 入口记录使用 Proxied，不要长期保持 DNS-only。
2. 审计历史 DNS、旧仓库、部署日志、邮件服务器、第三方回调配置，避免泄露源站 IP。
3. 源站防火墙允许 Cloudflare IP ranges，阻断其他来源访问 80/443。
4. 如果源站 IP 已经被打过，迁入 Cloudflare 后考虑更换源站 IP。
5. 能用 Cloudflare Tunnel 的后台和内网服务，不要暴露公网 IP。
6. 源站日志要恢复真实访客 IP，但只信任来自 Cloudflare 的请求头。

## Under Attack 怎么用

Under Attack mode 是应急工具。它会给访客展示 challenge 页面，能缓解 L7 DDoS，但也会影响 API、第三方分析和用户体验。

| 用法 | 判断 |
| --- | --- |
| 全站开启 | 只在站点正在被打、且无法快速定位路径时短时间使用。 |
| 按路径开启 | 更推荐，例如只保护 `/login`、`/admin`、`/api/write`。 |
| 长期开启 | 不推荐。它会让正常用户和 API 客户端持续承担 challenge 成本。 |
| 替代 WAF / Rate Limiting | 不推荐。攻击结束后要回到精确规则。 |

更稳的应急顺序：

1. 判断是源站过载、Worker 过载、D1/R2 打满，还是 Cloudflare 正在挑战/阻断。
2. 在 Security Events 里按 `Service equals HTTP DDoS`、path、host、country、ASN、status 过滤。
3. 先对受影响路径启用 Under Attack 或 Managed Challenge。
4. 对登录、评论、搜索、上传等写接口补 Rate Limiting。
5. 提高静态资源缓存命中，避免无意义回源。
6. 攻击结束后撤掉临时规则，只保留能解释清楚的长期规则。

## 误伤和排查

| 现象 | 常见原因 | 处理 |
| --- | --- | --- |
| 正常用户被挑战或拦截 | HTTP DDoS sensitivity 偏高，或某个规则误判。 | 查 Security Events 的 HTTP DDoS 事件，优先调整具体规则或 tag。 |
| API 客户端突然失败 | Under Attack 或 Managed Challenge 套到了 API。 | 用 Configuration Rules / WAF 规则缩小范围，避免全站 challenge。 |
| 攻击仍然打到源站 | 源站 IP 暴露，或入口记录是 DNS-only。 | 关源站直连，检查所有公开记录和历史泄露。 |
| 缓存没有吸收流量 | query string 随机化、HTML 不可缓存、响应带 `Set-Cookie`。 | 对静态资源使用长缓存；公开内容排除无意义 query。 |
| Free 计划看不到完整细节 | Free 主要是 sampled logs。 | 先用 Dashboard 可见事件定位；需要完整安全事件、日志和支持再评估计划。 |
| 规则改完没效果 | 改错层级或被 zone/account override 优先级影响。 | 确认是 `ddos_l7`、WAF custom、rate limiting 还是 account-level 规则。 |

Enterprise 客户可以先把动作切到 Log 观察，再恢复默认动作。非 Enterprise 没有 Log action 时，不要为了测试而大面积降低保护；更适合用低风险时间窗口和局部路径逐步调整。

## 验证清单

```bash
# 确认公开 Web 入口经过 Cloudflare；通常会看到 server: cloudflare 和 cf-ray。
curl -sI https://example.com | rg -i 'server:|cf-ray|cf-cache-status'
```

```bash
# 确认 DNS 代理结果不是你的源站真实 IP。
dig +short example.com
```

```bash
# 检查静态资源是否能被缓存吸收，减少攻击时回源压力。
curl -sI https://example.com/assets/app.js | rg -i 'cache-control|cf-cache-status|age'
```

```bash
# 读取 zone rulesets，用于备份和对账；不要在没有明确变更计划时直接写入生产规则。
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/rulesets" \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

不要用第三方 DDoS 测试服务攻击自己的站点来验证防护。需要压测时，用可控的应用层压力测试工具、明确速率、明确白名单，并先确认不会违反服务商条款。

## API 与 IaC

DDoS managed rulesets 是 zone/account 配置，不是 Worker 代码。新项目先用默认值；生产项目至少要把关键 override 导出或用 Terraform 管理。

```hcl
resource "cloudflare_ruleset" "http_ddos_override" {
  zone_id = var.cloudflare_zone_id
  name    = "HTTP DDoS Attack Protection entry point ruleset"
  kind    = "zone"
  phase   = "ddos_l7"

  rules = [{
    action      = "execute"
    expression  = "true"
    description = "zone wide http ddos override"

    action_parameters = {
      id = var.http_ddos_managed_ruleset_id

      overrides = {
        action            = "managed_challenge"
        sensitivity_level = "medium"
      }
    }
  }]
}
```

这段配置只适合有明确误伤或攻击排查需求时使用。普通项目不要为了“看起来专业”主动覆盖默认 DDoS managed rulesets。

## GitHub 开源参考

| 仓库 | 可以学什么 |
| --- | --- |
| [cloudflare/cloudflare-docs DDoS source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ddos-protection) | 官方 DDoS Protection 文档源文件，适合追踪 managed rulesets、best practices、analytics、alerts 和 changelog。 |
| [cloudflare/skills DDoS reference](https://github.com/cloudflare/skills/tree/main/skills/cloudflare/references/ddos) | Cloudflare 官方 Agent Skills 里的 DDoS 参考，适合看配置模式、API、gotchas 和分层防护。 |
| [cloudflare/cloudflare-docs Terraform DDoS source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/terraform/additional-configurations/ddos-managed-rulesets.mdx) | DDoS managed rulesets 的 Terraform 示例来源。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 用 `cloudflare_ruleset` 管理 DDoS、WAF、Rate Limiting 和其他 rulesets。 |
| [cloudflare/cloudflare-go](https://github.com/cloudflare/cloudflare-go) | Cloudflare 官方 Go SDK，适合做 rulesets 备份、审计和自动化工具。 |
| [cloudflare/cloudflare-docs Ruleset Engine source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ruleset-engine) | Ruleset Engine 文档源文件，适合理解 phase、action、expression 和 override 模型。 |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 本站早期学习的原始参考仓库之一，适合对照教程站的信息架构。 |

## 官方资料

- [Cloudflare DDoS Protection](https://developers.cloudflare.com/ddos-protection/)
- [About Cloudflare DDoS protection](https://developers.cloudflare.com/ddos-protection/about/)
- [How DDoS protection works](https://developers.cloudflare.com/ddos-protection/about/how-ddos-protection-works/)
- [Attack coverage](https://developers.cloudflare.com/ddos-protection/about/attack-coverage/)
- [Managed rulesets](https://developers.cloudflare.com/ddos-protection/managed-rulesets/)
- [HTTP DDoS Attack Protection](https://developers.cloudflare.com/ddos-protection/managed-rulesets/http/)
- [HTTP DDoS parameters](https://developers.cloudflare.com/ddos-protection/managed-rulesets/http/override-parameters/)
- [Configure HTTP DDoS via API](https://developers.cloudflare.com/ddos-protection/managed-rulesets/http/http-overrides/configure-api/)
- [Network-layer DDoS Attack Protection](https://developers.cloudflare.com/ddos-protection/managed-rulesets/network/)
- [Adaptive DDoS Protection](https://developers.cloudflare.com/ddos-protection/managed-rulesets/adaptive-protection/)
- [Proactive DDoS defense](https://developers.cloudflare.com/ddos-protection/best-practices/proactive-defense/)
- [DDoS Analytics](https://developers.cloudflare.com/ddos-protection/reference/analytics/)
- [DDoS Alerts](https://developers.cloudflare.com/ddos-protection/reference/alerts/)
- [Under Attack mode](https://developers.cloudflare.com/fundamentals/reference/under-attack-mode/)
- [Cloudflare IP addresses](https://developers.cloudflare.com/fundamentals/concepts/cloudflare-ip-addresses/)
- [Protect your origin server](https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/)
- [DDoS managed rulesets using Terraform](https://developers.cloudflare.com/terraform/additional-configurations/ddos-managed-rulesets/)
