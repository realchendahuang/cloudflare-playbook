---
title: 低频协议与平台工具
description: NEL、Randomness Beacon、Resource Tagging、Version Management、Privacy、MoQ 和 Agent Memory 的取舍。
---

最后核对日期：2026-06-18。

这一页只解决一个问题：哪些 Cloudflare 产品普通项目可以先跳过。这里的产品大多不是文档站、小 API、小 SaaS 或内部后台的主线能力。

## 先跳过

| 产品 | 为什么先跳过 |
| --- | --- |
| Network Error Logging | 它看浏览器侧网络失败，不替代 Workers Logs、Web Analytics 或业务日志。 |
| Randomness Beacon | 它是公共随机数服务，不适合生成密钥、token 或 session secret。 |
| Tenant API | 它面向 Cloudflare partner 管理客户账号，不是普通 SaaS 多租户方案。 |
| Version Management | Enterprise-only，适合企业 zone 配置灰度，不适合早期项目。 |
| Privacy Gateway / Privacy Proxy | 企业隐私代理基础设施，不是 Access、Tunnel、WAF 的替代品。 |
| MoQ | 媒体协议实验场景；普通视频先看 Stream，实时音视频先看 Realtime。 |
| Agent Memory | 仍要按 beta 状态核对；没有明确 Agent 记忆需求时先用 D1 / R2 / Vectorize。 |

## 可以现在看

| 场景 | 看什么 | 判断 |
| --- | --- | --- |
| Cloudflare 资源变多，想按环境、团队、成本中心归类。 | Resource Tagging | 可作为治理工具，但不用在第一个 Worker 上引入。 |
| 用户反馈“打不开”，但服务端没有请求记录。 | Network Error Logging | 只用于补充诊断 last mile 问题。 |
| 做公开抽签或协议随机数，需要可验证随机源。 | Randomness Beacon | 只用于公开可验证流程，不用于私密凭证。 |

## 普通项目顺序

1. 先把 Workers Static Assets、Workers、D1、KV、R2、Queues、Durable Objects、WAF、Turnstile 和日志用好。
2. 资源真的多了，再加 Resource Tagging。
3. 网络失败难定位时，再看 NEL。
4. Enterprise-only、closed beta、partner entitlement 相关能力，等业务资格明确后再读官方细节。

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| NEL 能替代日志和监控。 | 它只补浏览器侧网络失败。 |
| Randomness Beacon 可以生成密钥。 | 公共随机数不能当私密随机源。 |
| Tenant API 等于 SaaS 多租户。 | 普通 SaaS 先在应用数据、客户域名和权限层实现多租户。 |
| MoQ 是视频托管默认方案。 | 普通视频和实时场景先看 Stream、RealtimeKit、Realtime SFU / TURN。 |
| Agent Memory 应该保存所有聊天原文。 | 长期记忆只放可复用的事实、偏好、约定和任务。 |

## 开源参考

- [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs)
- [cloudflare/moq-rs](https://github.com/cloudflare/moq-rs)
- [cloudflare/agents](https://github.com/cloudflare/agents)
- [drand/drand](https://github.com/drand/drand)

## 事实来源

- [Network Error Logging](https://developers.cloudflare.com/network-error-logging/)
- [Resource Tagging](https://developers.cloudflare.com/resource-tagging/)
- [Version Management](https://developers.cloudflare.com/version-management/)
- [Privacy Gateway](https://developers.cloudflare.com/privacy-gateway/)
- [Privacy Proxy](https://developers.cloudflare.com/privacy-proxy/)
- [MoQ](https://developers.cloudflare.com/moq/)
- [Agent Memory](https://developers.cloudflare.com/agent-memory/)
