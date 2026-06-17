---
title: 低频协议与平台工具
description: NEL、Randomness Beacon、Resource Tagging、Version Management、Privacy、MoQ 和 Agent Memory 的取舍。
---

最后核对日期：2026-06-18。

这一组产品都在 Cloudflare 官方文档里，但大多数不是普通项目的默认栈。它们适合已经出现明确问题的团队：网络可达性、资源归因、企业配置灰度、隐私代理、实时媒体协议或 Agent 长期记忆。

## 一句话判断

| 问题 | 看什么 | 普通项目判断 |
| --- | --- | --- |
| 用户反馈访问失败，但服务端和 Worker 没日志。 | Network Error Logging | 浏览器侧网络失败诊断，不是业务日志系统。 |
| 需要公开、可验证、不可预测的随机数。 | Randomness Beacon / drand | 适合公开抽签和协议随机数，不适合密码、token、session secret。 |
| Cloudflare 资源太多，需要按环境、团队、成本中心归类。 | Resource Tagging | Available on all plans，public beta；普通团队最值得关注的低频治理能力。 |
| 作为 Cloudflare partner 帮客户批量开账号和订阅。 | Tenant API | 需要 Channel / Alliance partner 资格；普通 SaaS 多租户不用它。 |
| Enterprise zone 配置需要 staging、灰度和回滚。 | Version Management | Enterprise-only，dashboard-only；Terraform 和 Version Management 要二选一。 |
| 产品核心承诺是隐藏客户端 IP。 | Privacy Gateway / Privacy Proxy | Enterprise / closed beta / managed service 场景，普通后台保护不用它。 |
| 做 QUIC 低延迟 live media 协议实验。 | MoQ | 协议实验和媒体基础设施团队再看；普通视频先看 Stream / Realtime。 |
| Agent 需要跨会话记住用户事实、偏好和任务。 | Agent Memory | Private beta 当前不计费；没有 beta access 时先用 D1/R2/Vectorize 做原型。 |

## 免费与付费边界

| 能力 | 免费 / 默认边界 | 付费 / 可用性边界 |
| --- | --- | --- |
| Network Error Logging | Get started 标注 all plan types；Free / Pro 可在 Network 区域开启。 | 隐私要求高时可通过 zone setting 或 Support 级开关关闭。 |
| Randomness Beacon | drand 是公共 randomness beacon，不按 Cloudflare 账号常规计费。 | 最新用户文档在 drand.love；Cloudflare 文档更偏背景入口。 |
| Resource Tagging | Available on all plans；public beta；每账号最多 10,000 tags。 | API 稳定但 beta 行为可能变化，自动化优先用 API。 |
| Tenant API | 无普通自助入口。 | 需要 Cloudflare partner agreement 和 entitlement。 |
| Version Management | Free / Pro / Business 不可用。 | Enterprise-only；仅 Dashboard；不支持 Terraform。 |
| Privacy Gateway | 无公开 self-serve 免费入口。 | Enterprise-only closed beta，面向 select privacy-oriented companies and partners。 |
| Privacy Proxy | 无公开 self-serve 免费入口。 | Enterprise managed service，基于 MASQUE forward proxy。 |
| MoQ | 官方未列 self-serve 价格或计划表。 | 当前实现只支持 MoQ Transport 草案的一部分，仍适合实验场景。 |
| Agent Memory | Private beta 期间不计费。 | Cloudflare 承诺开始收费或改计费前至少提前 30 天通知；底层 Workers / Agents / AI 成本仍要另算。 |

## 与 $5 Workers Paid 的关系

| 能力 | Workers Paid 是否直接解决 | 判断 |
| --- | --- | --- |
| Version Management | 不解决。 | 它是 Enterprise-only zone 能力。 |
| Privacy Gateway / Privacy Proxy | 不解决。 | 这是 Enterprise / closed beta / managed service。 |
| Tenant API | 不解决。 | 它依赖 partner 资格。 |
| Resource Tagging | 不需要。 | 所有计划可用，但仍是 public beta。 |
| Agent Memory | 不等同。 | 当前 private beta 不计费，应用里的 Worker、Agent、AI 调用另算。 |
| MoQ | 不等同。 | 它不是 Stream、RealtimeKit 或 WebRTC 的通用替代。 |

## 推荐顺序

| 顺序 | 动作 | 为什么 |
| --- | --- | --- |
| 1 | 默认先用主线能力。 | Workers、Static Assets、D1、KV、R2、Queues、Durable Objects、WAF、Turnstile、Web Analytics 和 Workers Logs 更常用。 |
| 2 | 资源变多后再加 Resource Tagging。 | 它能解决归因和治理，但不用在第一个 Worker 上引入。 |
| 3 | 网络失败难定位时再看 NEL。 | NEL 补浏览器侧失败，不替代服务端日志。 |
| 4 | 企业灰度和隐私代理要先看资格。 | Enterprise-only、closed beta、partner entitlement 不是 `$5 Workers Paid` 能解决的事。 |
| 5 | Agent Memory 等 beta 能力先做可替代方案。 | 原始会话进 D1/R2，长期可复用事实再考虑托管记忆。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| NEL 能替代日志和监控。 | NEL 看 last mile 网络失败；业务日志仍看 Workers Logs、Web Analytics、Logpush。 |
| Randomness Beacon 可以生成密钥。 | 公共随机数适合可验证流程，不适合私密凭证。 |
| Resource Tagging 改资源配置。 | 它是资源外的 metadata，不改变 Worker、D1、R2 或 zone 本身配置。 |
| Tenant API 等于 SaaS 多租户。 | 普通 SaaS 多租户先在应用数据和客户域名层实现。 |
| Version Management 可以和 Terraform 混用。 | 官方明确建议 Terraform 和 Version Management 二选一。 |
| Privacy Proxy 是普通网站加速。 | 它是隐私代理基础设施，不是 Access、Tunnel、WAF 的替代品。 |
| MoQ 是视频托管默认方案。 | 普通视频和音视频先看 Stream、RealtimeKit、Realtime SFU / TURN。 |
| Agent Memory 应该保存所有聊天原文。 | 记忆系统只放可长期复用的事实、偏好、约定和任务。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs Network Error Logging source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/network-error-logging) | NEL overview、get started、reference 和隐私边界。 |
| [drand/drand](https://github.com/drand/drand) | 分布式 randomness beacon daemon。 |
| [cloudflare/cloudflare-docs Resource Tagging source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/resource-tagging) | public beta、limits、supported resource types。 |
| [cloudflare/cloudflare-docs Version Management source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/version-management) | Enterprise-only、dashboard-only 和产品兼容限制。 |
| [cloudflare/cloudflare-docs Privacy Gateway source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/privacy-gateway) | OHTTP relay、closed beta、legal 和 limitations。 |
| [cloudflare/cloudflare-docs Privacy Proxy source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/privacy-proxy) | MASQUE、single-hop / double-hop、headers 和 observability。 |
| [cloudflare/moq-rs](https://github.com/cloudflare/moq-rs) | Cloudflare 的 MoQ Transport Rust 实现。 |
| [cloudflare/cloudflare-docs Agent Memory source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/agent-memory) | private beta、pricing、limits 和 API 文档。 |
| [cloudflare/agents](https://github.com/cloudflare/agents) | Agents SDK 的状态和工具模式。 |

## 事实来源

- [Network Error Logging](https://developers.cloudflare.com/network-error-logging/)
- [Network Error Logging get started](https://developers.cloudflare.com/network-error-logging/get-started/)
- [Cloudflare Randomness Beacon](https://developers.cloudflare.com/randomness-beacon/)
- [drand developer docs](https://drand.love/developer/)
- [Resource Tagging](https://developers.cloudflare.com/resource-tagging/)
- [Resource Tagging limits](https://developers.cloudflare.com/resource-tagging/reference/limits/)
- [Tenant API](https://developers.cloudflare.com/tenant/)
- [Version Management](https://developers.cloudflare.com/version-management/)
- [Privacy Gateway](https://developers.cloudflare.com/privacy-gateway/)
- [Privacy Proxy](https://developers.cloudflare.com/privacy-proxy/)
- [MoQ](https://developers.cloudflare.com/moq/)
- [Agent Memory](https://developers.cloudflare.com/agent-memory/)
- [Agent Memory pricing](https://developers.cloudflare.com/agent-memory/platform/pricing/)
- [Agent Memory limits](https://developers.cloudflare.com/agent-memory/platform/limits/)
