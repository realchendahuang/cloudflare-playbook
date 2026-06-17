---
title: 平台化与多租户
description: 什么时候才需要客户域名、客户代码和平台化能力。
---

最后核对日期：2026-06-18。平台化产品的价格和限制要以官方页面为准，数字统一放在 [免费额度大全](/platform/free-paid/)。

平台化解决的不是“用户很多”，而是“客户把自己的域名、代码或运行环境交给你管理”。普通 SaaS 早期先做好数据隔离、权限、账单、日志和限流。

## 先判断

| 你要做什么 | 先用什么 | 先别上什么 |
| --- | --- | --- |
| 普通文档站、官网、后台 | Workers / Static Assets / D1 / R2 / Access。 | Cloudflare for Platforms。 |
| 多租户业务数据 | 租户模型、资源隔离、权限和审计。 | 因为“客户多”就运行客户代码。 |
| 客户绑定自己的域名 | Cloudflare for SaaS / Custom Hostnames。 | 给每个客户手工建 zone。 |
| 客户长期部署自己的代码 | Workers for Platforms。 | 给每个客户手工维护一个普通 Worker。 |
| AI 生成代码后短期执行 | Dynamic Workers 或 Sandbox 相关能力。 | 把不可信代码放进主 Worker。 |

## 六个问题

只要有一个问题答不上来，就先别急着平台化。

| 问题 | 为什么重要 |
| --- | --- |
| 客户真的需要自己的域名吗？ | 否则普通路由和子路径就够。 |
| 客户会上传或生成自己的代码吗？ | 这是代码隔离和出站控制问题。 |
| 你能管理域名验证、证书、下线和清理吗？ | 自定义域名是生命周期能力。 |
| 你能按租户限制请求、CPU、存储和出站访问吗？ | 平台产品会放大账单风险。 |
| 你能处理滥用、封禁、申诉和客户支持吗？ | 平台化很快变成运营问题。 |
| 你有清晰的计费模型吗？ | 没有计费边界，技术边界也会失控。 |

## 推荐路线

| 阶段 | 做法 |
| --- | --- |
| 早期 SaaS | 先用普通 Workers、D1、R2、KV 和 Access，把租户模型做清楚。 |
| 客户域名成为核心卖点 | 做 Custom Hostname onboarding、验证、证书状态和清理后台。 |
| 客户代码成为产品能力 | 再看 Workers for Platforms，先设计隔离、limits、日志和出站控制。 |
| AI 代码执行成为核心流程 | 把 stable ID、最小 bindings、预算和审计作为第一版需求。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| 多租户就是 Workers for Platforms。 | 数据多租户和代码多租户是两回事。 |
| 自定义域名只是加一条 DNS。 | 还要处理验证、证书、状态、下线和客户支持。 |
| 用户代码可以直接拿平台密钥。 | 只给最小 bindings，并限制出站访问。 |
| 平台产品只是技术升级。 | 它会带来账单、滥用治理和生命周期管理。 |
| Dynamic Workers 只看请求量。 | 还要看动态 Worker 数量、CPU 和创建模式。 |

## 事实来源

- [Cloudflare for Platforms](https://developers.cloudflare.com/cloudflare-for-platforms/)
- [Cloudflare for Platforms llms.txt](https://developers.cloudflare.com/cloudflare-for-platforms/llms.txt)
- [Cloudflare for SaaS Plans](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/)
- [How Workers for Platforms works](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/how-workers-for-platforms-works/)
- [Workers for Platforms Pricing](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/pricing/)
- [Worker Isolation](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/worker-isolation/)
- [Dynamic Workers](https://developers.cloudflare.com/dynamic-workers/)
- [Dynamic Workers Pricing](https://developers.cloudflare.com/dynamic-workers/pricing/)
