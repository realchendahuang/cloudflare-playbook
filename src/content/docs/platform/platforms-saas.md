---
title: 平台化与多租户
description: Cloudflare for SaaS、Workers for Platforms 和 Dynamic Workers 的普通项目取舍。
---

最后核对日期：2026-06-18。平台化产品解决的不是“我有很多用户”，而是“我要让客户带自己的域名、自己的代码、自己的运行环境进入我的平台”。普通 SaaS 早期先把数据隔离、账单、权限、日志和限流做好，不要因为听到“多租户”就直接上 Workers for Platforms。

## 一句话判断

只有客户域名、客户代码或 AI 生成代码进入你的平台时，才需要认真看 Cloudflare for Platforms。文档站、官网、单个 API、小 SaaS 后台，继续用 Workers、Static Assets、D1、R2、KV、Queues 和 Access 就够了。

## 先问六个问题

| 问题 | 如果答案是“否” |
| --- | --- |
| 客户是否需要绑定自己的域名？ | 不需要 Cloudflare for SaaS。 |
| 客户是否能上传或生成自己的代码？ | 不需要 Workers for Platforms / Dynamic Workers。 |
| 你是否要替客户托管证书、验证域名、清理下线 hostname？ | 先别开放 custom domains。 |
| 你能否按租户限制请求、CPU、出站访问和存储权限？ | 先别运行客户代码。 |
| 你能否把账单、滥用、日志、封禁和申诉做成后台能力？ | 平台化会很快变成运营问题。 |
| 你是否只是普通数据多租户？ | 先用 `tenant_id`、独立资源或数据层权限解决。 |

## 产品怎么选

| 需求 | 优先看 | 不要误用 |
| --- | --- | --- |
| 客户自定义域名 | Cloudflare for SaaS / Custom Hostnames | 不要给每个客户手工建 zone。 |
| 客户长期部署自己的 Worker | Workers for Platforms | 不要给每个客户创建普通 Worker 再手工维护路由。 |
| AI 生成代码后立即运行 | Dynamic Workers | 不要用普通 Worker deploy 流程模拟短生命周期执行。 |
| 普通 SaaS 多租户数据隔离 | D1 / R2 / KV + 租户模型 | 不要因为“客户多”就上平台产品。 |
| 管理后台和内部工具 | Tunnel + Access | 不需要 Cloudflare for Platforms。 |

## 费用边界

| 产品 | 官方边界 | 普通项目判断 |
| --- | --- | --- |
| Cloudflare for SaaS | Free / Pro / Business 可用；包含 100 个 hostnames，最高 50,000；额外 hostname `$0.10`；Enterprise 为 custom pricing。 | 客户域名数量会成为成本和运维维度，必须设计创建、验证、续期、下线和清理。 |
| Workers for Platforms | Paid plan `$25/month`；包含 20M requests/month、60M CPU ms/month、1,000 scripts；超出后按 requests、CPU 和 scripts 计费。 | 这是平台产品，不是免费 Worker 的升级项；用户代码失控会带来账单风险。 |
| Dynamic Workers | 仅 Workers Paid 可用；包含 1,000 unique Dynamic Workers/month、10M requests/month、30M CPU ms/month；2026-05-26 起按 daily created Dynamic Workers 计费。 | 没有稳定 ID 或代码频繁变化时，成本会被“每天创建了多少动态 Worker”放大。 |

Workers for Platforms 的一次平台调用只按一次 request 计费，但 CPU 会跨平台入口、客户 Worker 和出站控制层累加。Dynamic Workers 的 CPU 还包括初始化和解析代码成本。

## Cloudflare for SaaS

Cloudflare for SaaS 的核心是 custom hostnames：客户把 `app.customer.com` 指向你的 SaaS target，你在自己的 SaaS zone 里管理这个 hostname 的验证、证书、代理、安全和分析。

| 必须具备 | 为什么 |
| --- | --- |
| 稳定的 CNAME target | 让客户只需要指向一个长期不变的目标。 |
| fallback origin | custom hostnames 默认回源的位置，官方要求它是 proxied record。 |
| hostname validation | 证明客户域名可以被你的 SaaS 接管。 |
| certificate validation | 确保证书签发并部署后再承接生产流量。 |
| 下线清理流程 | 停用客户不清理 hostname，会留下成本和安全风险。 |

不要只看 hostname status。生产可用至少要同时确认 hostname active、certificate active、客户 DNS 已指向你的 SaaS target。

## Workers for Platforms

Workers for Platforms 适合“客户代码长期运行在你的平台上”：低代码平台、插件平台、AI app builder、用户脚本平台、模板发布平台。

上线前先把这些边界做出来：

| 边界 | 判断 |
| --- | --- |
| 路由 | dispatch Worker 负责鉴权、识别租户、选择 user Worker。 |
| 隔离 | 默认 untrusted mode；只有你控制全部代码时才考虑 trusted mode。 |
| 资源 | 只把客户需要的 KV / D1 / R2 / Durable Objects 绑定给 user Worker。 |
| 限制 | 按套餐设置 CPU 和 subrequests，避免 runaway bills。 |
| 出站 | 用 Outbound Worker 或策略记录、限制、注入外部请求能力。 |
| 归因 | 用 tags、日志和账单模型知道是谁产生了请求、CPU 和错误。 |

官方建议客户 Workers 放在一个 production namespace 里，不要每个客户一个 namespace；测试环境再单独建 staging namespace。这个细节不用让普通读者背，但做平台的人必须知道：平台化不是“资源越拆越安全”，而是要有统一的路由、隔离和治理层。

## Dynamic Workers

Dynamic Workers 更适合“代码刚生成就要跑”的场景：AI code mode、快速预览、用户自定义自动化、临时原型和轻量沙箱。

| 必须控制 | 原因 |
| --- | --- |
| 稳定 ID | 同一 ID + 同一 code 当天重复调用只算一个 Dynamic Worker；无 ID 可能每次调用都算新实例。 |
| 出站访问 | 未受控的动态代码可能访问外网、扫描、泄露数据或制造成本。 |
| 显式能力 | 动态代码只拿到必要 bindings，不直接拿平台密钥。 |
| 资源限制 | 需要限制 CPU、请求和外部调用，避免被 prompt 或用户输入拖垮。 |
| 日志归因 | 必须能追到哪个用户、哪段代码、哪次运行造成错误或费用。 |

把 Dynamic Workers 当成安全产品来设计，而不是当成一个“执行 JS 字符串”的小功能。

## 推荐路线

| 阶段 | 推荐 |
| --- | --- |
| 文档站、博客、官网 | Workers Static Assets / Pages + Pagefind + Web Analytics。 |
| 小型 SaaS | Workers + D1 / R2 / KV，先用数据层租户模型。 |
| 客户要自定义域名 | Cloudflare for SaaS，先做 hostname onboarding 和清理后台。 |
| 客户要上传长期代码 | Workers for Platforms，先做 dispatch、limits、outbound、observability。 |
| AI 生成短生命周期代码 | Dynamic Workers，先做 stable ID、egress control、budget 和审计。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| 客户多就是 Workers for Platforms。 | 多租户数据和多租户代码是两回事。 |
| 自定义域名就是给客户建 DNS record。 | SaaS 场景用 custom hostnames，并跟踪验证和证书状态。 |
| 只要 hostname active 就能上线。 | 还要确认证书 active 和客户 DNS 已切到 SaaS target。 |
| 用户代码可以直接拿平台密钥。 | 用 bindings、custom bindings 或出站网关提供能力。 |
| trusted mode 更方便。 | 只有你控制全部代码时才考虑，否则会破坏隔离边界。 |
| Dynamic Workers 只按请求计费。 | 还要看 unique Dynamic Workers created daily。 |
| 平台产品只是技术升级。 | 它会带来账单、滥用治理、客户支持和生命周期管理。 |

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [cloudflare/templates worker-publisher-template](https://github.com/cloudflare/templates/tree/main/worker-publisher-template) | Workers for Platforms 最小发布平台模板，适合看平台入口和用户 Worker 发布模型。 |
| [cloudflare/vibesdk](https://github.com/cloudflare/vibesdk) | AI app builder 参考，适合看 AI 生成、预览、部署和平台化组合。 |
| [cloudflare/agents dynamic-workers examples](https://github.com/cloudflare/agents/tree/main/examples/dynamic-workers) | Dynamic Workers 示例，适合理解动态执行和 sandbox。 |
| [cloudflare/cloudflare-docs Cloudflare for Platforms source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/cloudflare-for-platforms) | 官方 Cloudflare for Platforms 文档源文件。 |
| [cloudflare/cloudflare-docs Dynamic Workers source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/dynamic-workers) | 官方 Dynamic Workers 文档源文件。 |

## 事实来源

- [Cloudflare for Platforms](https://developers.cloudflare.com/cloudflare-for-platforms/)
- [Cloudflare for Platforms llms.txt](https://developers.cloudflare.com/cloudflare-for-platforms/llms.txt)
- [Cloudflare for SaaS Plans](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/)
- [Configuring Cloudflare for SaaS](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/)
- [Custom hostnames](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/)
- [How Workers for Platforms works](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/how-workers-for-platforms-works/)
- [Workers for Platforms Pricing](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/pricing/)
- [Workers for Platforms Limits](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/limits/)
- [Worker Isolation](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/worker-isolation/)
- [Workers for Platforms Custom limits](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/configuration/custom-limits/)
- [Outbound Workers](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/configuration/outbound-workers/)
- [Dynamic Workers](https://developers.cloudflare.com/dynamic-workers/)
- [Dynamic Workers Pricing](https://developers.cloudflare.com/dynamic-workers/pricing/)
- [Dynamic Workers Egress control](https://developers.cloudflare.com/dynamic-workers/usage/egress-control/)
