---
title: 平台化与多租户
description: Cloudflare for SaaS、Workers for Platforms 和 Dynamic Workers 的普通项目取舍。
---

最后核对日期：2026-06-18。

平台化产品解决的不是“我有很多用户”，而是“我要让客户带自己的域名、自己的代码、自己的运行环境进入我的平台”。普通 SaaS 早期先把数据隔离、账单、权限、日志和限流做好，不要因为听到“多租户”就直接上 Workers for Platforms。

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
| 你是否只是普通数据多租户？ | 先用 tenant model、独立资源或数据层权限解决。 |

## 产品怎么选

| 需求 | 优先看 | 不要误用 |
| --- | --- | --- |
| 客户自定义域名 | Cloudflare for SaaS / Custom Hostnames | 不要给每个客户手工建 zone。 |
| 客户长期部署自己的 Worker | Workers for Platforms | 不要给每个客户创建普通 Worker 再手工维护路由。 |
| AI 生成代码后立即运行 | Dynamic Workers | 不要用普通 Worker 部署流程模拟短生命周期执行。 |
| 普通 SaaS 多租户数据隔离 | D1 / R2 / KV + 租户模型 | 不要因为“客户多”就上平台产品。 |
| 管理后台和内部工具 | Tunnel + Access | 不需要 Cloudflare for Platforms。 |

## 费用边界

| 产品 | 官方边界 | 普通项目判断 |
| --- | --- | --- |
| Cloudflare for SaaS | Free / Pro / Business 可用；包含 100 个 hostnames，最高 50,000；额外 hostname 0.10 USD；Enterprise 为 custom pricing。 | 客户域名数量会成为成本和运维维度，必须设计创建、验证、续期、下线和清理。 |
| Workers for Platforms | Paid plan 25 USD/month；包含 20M requests/month、60M CPU ms/month、1,000 scripts；超出后按 requests、CPU 和 scripts 计费。 | 这是平台产品，不是免费 Worker 的升级项；用户代码失控会带来账单风险。 |
| Dynamic Workers | 仅 Workers Paid 可用；包含 1,000 unique Dynamic Workers/month、10M requests/month、30M CPU ms/month；2026-05-26 起按 daily created Dynamic Workers 计费。 | 没有稳定 ID 或代码频繁变化时，成本会被“每天创建了多少动态 Worker”放大。 |

这三类产品都不是普通文档站的默认能力。先确认是否真的有客户域名、客户代码或动态代码运行，再看 pricing。

## 三种平台化场景

| 场景 | 关键工作 | 不该忽略 |
| --- | --- | --- |
| 客户自定义域名 | onboarding、hostname validation、certificate validation、下线清理。 | 不要只看 hostname active，还要确认证书和客户 DNS。 |
| 客户长期代码 | dispatch、租户识别、资源限制、出站控制、日志归因。 | 平台化不是“给每个客户一个 Worker”这么简单。 |
| AI 动态代码 | stable ID、最小 bindings、出站限制、预算和审计。 | 这更接近安全产品，不是一个随手执行代码的小功能。 |

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

## 事实来源

- [Cloudflare for Platforms](https://developers.cloudflare.com/cloudflare-for-platforms/)
- [Cloudflare for Platforms llms.txt](https://developers.cloudflare.com/cloudflare-for-platforms/llms.txt)
- [Cloudflare for SaaS Plans](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/)
- [Custom hostnames](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/)
- [How Workers for Platforms works](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/how-workers-for-platforms-works/)
- [Workers for Platforms Pricing](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/pricing/)
- [Workers for Platforms Limits](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/limits/)
- [Worker Isolation](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/worker-isolation/)
- [Dynamic Workers](https://developers.cloudflare.com/dynamic-workers/)
- [Dynamic Workers Pricing](https://developers.cloudflare.com/dynamic-workers/pricing/)
- [Dynamic Workers Egress control](https://developers.cloudflare.com/dynamic-workers/usage/egress-control/)
