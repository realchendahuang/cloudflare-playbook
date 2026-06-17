---
title: 平台化与多租户
description: Cloudflare for Platforms、Cloudflare for SaaS、Workers for Platforms 和 Dynamic Workers 的边界、费用与最佳实践。
---

最后核对日期：2026-06-17。

Cloudflare for Platforms 解决的是“你自己也要做一个平台”的问题：让客户使用自己的域名、自己的子域名，甚至上传或生成自己的代码，并在 Cloudflare 上隔离运行。

普通项目早期不要急着上这条线。只有当你开始做多租户 SaaS、低代码平台、插件平台、AI 生成应用平台、客户自定义域名，才需要认真看这一页。

## 一句话判断

| 需求 | 优先选择 | 不该用什么替代 |
| --- | --- | --- |
| 每个客户绑定自己的域名 | Cloudflare for SaaS / Custom Hostnames | 不要给每个客户手动建一个 zone。 |
| 每个客户部署自己的代码 | Workers for Platforms | 不要为每个客户创建普通 Worker 并手工维护 route。 |
| AI 临时生成代码并立刻执行 | Dynamic Workers | 不要用普通 Worker deploy 流程模拟短生命周期代码执行。 |
| 普通 SaaS 多租户数据隔离 | D1 / R2 / KV + tenant_id 或按租户拆资源 | 不要因为“多租户”直接上 Workers for Platforms。 |
| 管理后台、文档站、单个 API | Workers / Static Assets / D1 | 不需要 Cloudflare for Platforms。 |

```text
平台化能力
  ├─ 客户入口
  │    ├─ 客户子域名：customer.example.com
  │    └─ 客户自定义域名：app.customer.com
  │
  ├─ 平台控制面
  │    ├─ 鉴权 / 配额 / 账单
  │    ├─ Hostname → tenant / Worker 映射
  │    └─ 日志 / WAF / 限流 / 告警
  │
  └─ 客户执行面
       ├─ Cloudflare for SaaS：域名和证书
       ├─ Workers for Platforms：长期部署的用户 Worker
       └─ Dynamic Workers：按需加载的沙箱代码
```

## 三条产品线

| 产品 | 解决什么问题 | 普通人判断 |
| --- | --- | --- |
| Cloudflare for SaaS | 把客户自定义域名加入你的 SaaS zone，由 Cloudflare 托管证书、代理、缓存、安全和分析。 | 做多租户 SaaS 并支持客户自定义域名时再看。 |
| Workers for Platforms | 让客户代码以 user Worker 形式部署到 dispatch namespace，由你的 dispatch Worker 统一路由。 | 做插件平台、低代码平台、AI app builder、用户脚本平台时再看。 |
| Dynamic Workers | 在运行时加载并执行代码，适合 AI code mode、临时预览、自定义自动化和轻量沙箱。 | 需要“代码一生成就执行”时再看；它仍然要付 Workers Paid。 |

## 费用边界

| 能力 | 费用 / 免费边界 | 成本风险 |
| --- | --- | --- |
| Cloudflare for SaaS custom hostnames | Free / Pro / Business 都可用：包含 100 个 hostnames，最高 50,000；额外 hostname 为 `$0.10`。Enterprise 为 custom pricing。 | 客户域名数量会直接变成账单维度；批量创建前要做租户生命周期和清理。 |
| Workers for Platforms | Paid plan 为 `$25/month`，包含 20M requests/month、60M CPU ms/month、1000 scripts；超出后 requests `$0.30/million`、CPU `$0.02/million CPU ms`、script `$0.02/script`。 | 用户代码可能造成 runaway bills；必须按租户设置 CPU、subrequests、脚本数量和部署频率边界。 |
| Dynamic Workers | 仅 Workers Paid 可用；包含 1,000 unique Dynamic Workers/month、10M requests/month、30M CPU ms/month；超出后 unique Dynamic Worker `$0.002/worker/day`，请求和 CPU 按 Workers Standard。 | 如果没有稳定 ID，`.load(code)` 可能每次调用都算一个新的 Dynamic Worker。 |

Workers for Platforms 的计费口径要注意：dispatch Worker → user Worker → outbound Worker 链路只收 1 次 request，但 CPU time 会跨这些 Worker 累加。

Dynamic Workers 从 2026-05-26 开始对 daily created Dynamic Workers 计费；请求和 CPU 仍计入现有 Workers 账单。

## Cloudflare for SaaS：客户自定义域名

Cloudflare for SaaS 适合 SaaS provider 给客户提供 vanity domain，例如：

```text
客户访问 app.customer.com
  │
  ▼
客户 DNS CNAME 到 customers.saasprovider.com
  │
  ▼
SaaS provider 的 Cloudflare zone
  │
  ├─ custom hostname 验证
  ├─ certificate validation
  ├─ WAF / Cache / Analytics
  └─ fallback origin 或 Worker
```

一个 custom hostname 真正可用，需要同时满足：

| API 字段 | Ready 值 | 含义 |
| --- | --- | --- |
| `result.status` | `active` | hostname 已验证，Cloudflare 可以代理流量。 |
| `result.ssl.status` | `active` | custom hostname 证书已签发并部署。 |
| 客户 DNS | 指向 SaaS target | 客户真实流量已经切到你的 SaaS zone。 |

常见配置：

| 配置 | 判断 |
| --- | --- |
| fallback origin | 所有 custom hostnames 的默认回源。必须是 proxied DNS record。 |
| CNAME target | 建议使用 `customers.example.com` 这类稳定目标，让客户 CNAME 到这里。 |
| Worker as origin | 如果应用本身跑在 Worker 上，可以用 Worker 作为 SaaS zone 的 fallback origin。 |
| custom origin server | 每个 custom hostname 可以路由到不同 origin；custom origin 必须是 DNS hostname，不能直接填 IP。 |
| apex proxying / BYOIP | Enterprise paid add-on，用于客户 apex 域名不能 CNAME 的场景。 |

计划边界：

| 能力 | Free / Pro / Business | Enterprise |
| --- | --- | --- |
| Included hostnames | 100 | Custom |
| Max hostnames | 50,000 | Unlimited，超过 50,000 需联系 sales |
| Additional hostname | `$0.10` | Custom pricing |
| Custom origin | Yes | Yes |
| Custom certificates / CSR / selectable CA | No | Yes |
| Wildcard custom hostnames | No | Yes |
| mTLS support | No | Yes |
| Apex proxying / BYOIP | No | Paid add-on |
| Custom metadata | No | Paid add-on |

## Workers for Platforms：用户代码运行

Workers for Platforms 的关键组件是：

| 组件 | 作用 |
| --- | --- |
| Dispatch namespace | 存放所有客户 user Workers 的容器。官方建议所有客户 Worker 放在同一个 production namespace，不要每个客户一个 namespace；测试用 staging namespace。 |
| Dynamic dispatch Worker | 你的平台入口，负责鉴权、路由、配额、租户映射、调用 `env.DISPATCHER.get(workerName)`。 |
| User Worker | 客户写的代码，部署在 dispatch namespace 里。 |
| Outbound Worker | 可选，拦截 user Worker 的 `fetch()` 出站请求，用来做日志、allow/block list、凭据注入。 |

请求链路：

```text
客户域名 / 子域名
  │
  ▼
Dynamic dispatch Worker
  ├─ 识别 tenant / hostname / path
  ├─ 套用 plan limits
  ├─ 调用 env.DISPATCHER.get(workerName)
  ▼
User Worker
  ├─ 访问被显式绑定的 KV / D1 / R2 / DO
  └─ fetch() 出站请求可经过 Outbound Worker
```

隔离模式：

| 模式 | 默认 | 适合场景 | 注意 |
| --- | --- | --- | --- |
| Untrusted mode | 是 | 客户自己写代码或 AI 生成代码。 | user Worker 默认没有 `request.cf`；`caches.default` disabled；每个 Worker 的 cache 隔离。 |
| Trusted mode | 否 | 你完全控制 namespace 内所有代码。 | 所有 Workers 会共享 cache space；只有有明确 cache key 隔离策略时才考虑。 |

必须做的安全边界：

1. Dispatch Worker 先鉴权，再调用 user Worker。
2. 使用 custom limits 给不同套餐设置 `cpuMs` 和 `subRequests`。
3. 使用 Outbound Worker 控制外部请求，至少记录目标 hostname。
4. 只给 user Worker 绑定它需要的 KV / D1 / R2 / Durable Objects。
5. 用 tags 标注 `customer_id`、`plan`、`environment`，方便搜索、过滤和账单归因。
6. 不把平台 API token、数据库密码、第三方密钥直接暴露给 user Worker。

限制和口径：

| 项目 | 官方口径 |
| --- | --- |
| User Worker 数量 | Workers for Platforms customers 可用 unlimited scripts；pricing 里 included 1000 scripts，超出按 script 计费。 |
| Durable Object namespaces | Workers for Platforms 没有 DO namespace 数量限制。 |
| `cf` object | user Workers 默认不能访问；trusted mode 后才可用。 |
| Cache API | namespaced scripts 的 `caches.default` disabled。 |
| Tags | 每个 script 最多 8 个 tags。 |
| Gradual Deployments | user Workers 暂不支持；更新会一次性部署到 100% traffic。 |
| Client API rate limit | 1200 requests / 5 minutes / user or account token；per IP 200/second。 |

## Dynamic Workers：运行时沙箱

Dynamic Workers 更像“按需生成一个 Worker 并运行代码”，适合：

- AI Agent code mode。
- AI 生成应用的快速预览。
- 用户自定义自动化。
- 临时原型、工具和 playground。
- 需要比容器更轻的代码沙箱。

它的安全模型更偏 capability-based sandboxing：动态代码默认只能访问你显式传给它的 bindings 或 custom bindings。最稳的模式是：

```text
Loader Worker
  ├─ 接收用户/AI 代码
  ├─ 设置 stable Worker ID
  ├─ 设置 cpuMs / subRequests
  ├─ globalOutbound: null 或 HttpGateway
  └─ 只传入明确能力：STORAGE / CHAT_ROOM / API_CLIENT
       │
       ▼
Dynamic Worker
  └─ 只能调用这些能力，不能直接拿到密钥
```

成本控制重点：

| 做法 | 原因 |
| --- | --- |
| 用 `.get()` 和稳定 ID。 | 同一 ID + 同一 code 当天重复调用只算 1 个 Dynamic Worker。 |
| 避免无 ID 的 `.load(code)` 滥用。 | 没有 ID 或每次 code 变化，可能每次 invocation 都算新的 Dynamic Worker。 |
| 把 `globalOutbound` 设为 `null` 或网关。 | 防止动态代码任意访问外网、扫描、泄露数据或产生不可控请求。 |
| 通过 custom bindings 暴露能力。 | 动态代码只拿到方法，不拿到真实 API key 或数据库权限。 |
| 同时看 startup time 和 execution time。 | Dynamic Workers CPU 包含 isolate 初始化和解析代码成本。 |

## 普通项目该不该用

| 项目阶段 | 推荐 |
| --- | --- |
| 文档站、博客、官网 | 不用。Workers Static Assets + Pagefind + Web Analytics 即可。 |
| 小型 SaaS | 先用 Workers + D1 + R2 + KV，多租户用 `tenant_id` 或资源拆分。 |
| SaaS 需要客户自定义域名 | 上 Cloudflare for SaaS；先设计 hostname onboarding、验证状态、清理流程。 |
| 每个客户需要独立代码运行 | 上 Workers for Platforms；先做 dispatch、limits、outbound、observability。 |
| AI 生成短生命周期代码 | 评估 Dynamic Workers；生产前必须有 stable ID、出站控制和预算。 |
| 客户能上传任意代码 | 先当成安全产品设计，不是普通功能开发。 |

本站当前不需要 Cloudflare for Platforms。未来如果这个仓库变成“多人共建 Cloudflare 示例并在线部署”的平台，才需要重新评估 Workers for Platforms 或 Dynamic Workers。

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| 客户多就是 Workers for Platforms。 | 多租户数据和多租户代码是两回事。只隔离数据时先用 D1/R2/KV。 |
| 每个客户一个 dispatch namespace。 | 官方建议客户 Workers 放在单个 production namespace，测试才单独建 staging。 |
| 客户自定义域名直接建 DNS record。 | 多租户 SaaS 用 custom hostnames，配合 validation 和 certificate status。 |
| 只看 hostname `status`。 | 生产可用还要看 `ssl.status` 和客户 DNS 是否已经指向 SaaS target。 |
| 让 user Worker 直接拿平台密钥。 | 用 bindings、custom bindings 或 Outbound Worker 注入能力，不暴露密钥。 |
| 以为 Dynamic Workers 只按请求计费。 | 还要看 unique Dynamic Workers created daily，尤其是无稳定 ID 的调用。 |
| 开 trusted mode 更方便。 | 只有你控制 namespace 内全部代码时才考虑，否则会破坏 cache 隔离边界。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/templates worker-publisher-template](https://github.com/cloudflare/templates/tree/main/worker-publisher-template) | Workers for Platforms 最小发布平台模板：创建 dispatch namespace、部署 user Workers、按路径路由。 |
| [cloudflare/vibesdk](https://github.com/cloudflare/vibesdk) | AI vibe coding 平台示例，组合 Workers、Durable Objects、D1、R2、KV、AI Gateway、Containers 和 Workers for Platforms。 |
| [cloudflare/agents dynamic-workers examples](https://github.com/cloudflare/agents/tree/main/examples/dynamic-workers) | Dynamic Workers 示例，适合理解 loader、sandbox、runtime code execution。 |
| [cloudflare/agents dynamic-workers-playground](https://github.com/cloudflare/agents/tree/main/examples/dynamic-workers-playground) | Dynamic Workers playground，适合看实时日志和动态执行体验。 |
| [cloudflare/cloudflare-docs Cloudflare for Platforms source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/cloudflare-for-platforms) | 官方 Cloudflare for Platforms 文档源文件。 |
| [cloudflare/cloudflare-docs Dynamic Workers source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/dynamic-workers) | 官方 Dynamic Workers 文档源文件。 |

## 事实来源

- [Cloudflare for Platforms](https://developers.cloudflare.com/cloudflare-for-platforms/)
- [Cloudflare for Platforms llms.txt](https://developers.cloudflare.com/cloudflare-for-platforms/llms.txt)
- [Workers for Platforms](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/)
- [How Workers for Platforms works](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/how-workers-for-platforms-works/)
- [Workers for Platforms Pricing](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/pricing/)
- [Workers for Platforms Limits](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/limits/)
- [Worker Isolation](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/worker-isolation/)
- [Workers for Platforms Custom limits](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/configuration/custom-limits/)
- [Outbound Workers](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/configuration/outbound-workers/)
- [Hostname routing](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/configuration/hostname-routing/)
- [Workers for Platforms Bindings](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/configuration/bindings/)
- [Cloudflare for SaaS](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/)
- [Cloudflare for SaaS Plans](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/)
- [Configuring Cloudflare for SaaS](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/)
- [Custom hostnames](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/)
- [Hostname validation](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/hostname-validation/)
- [Workers as your fallback origin](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/advanced-settings/worker-as-origin/)
- [Custom origin server](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/advanced-settings/custom-origin/)
- [WAF for SaaS](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/security/waf-for-saas/)
- [Connection request details](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/reference/connection-details/)
- [Dynamic Workers](https://developers.cloudflare.com/dynamic-workers/)
- [Dynamic Workers Pricing](https://developers.cloudflare.com/dynamic-workers/pricing/)
- [Dynamic Workers Bindings](https://developers.cloudflare.com/dynamic-workers/usage/bindings/)
- [Dynamic Workers Egress control](https://developers.cloudflare.com/dynamic-workers/usage/egress-control/)
- [Dynamic Workers Custom limits](https://developers.cloudflare.com/dynamic-workers/usage/limits/)
