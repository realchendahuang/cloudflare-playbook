---
title: 低频协议与平台工具
description: Network Error Logging、Randomness Beacon、Resource Tagging、Tenant、Version Management、Privacy Gateway、Privacy Proxy、MoQ 和 Agent Memory 的产品边界、计划边界和普通项目取舍。
---

最后核对日期：2026-06-17。

这一组产品很容易让人误判：它们都在 Cloudflare 官方文档里，但大多数不是普通项目的默认栈。更好的读法是先把它们分成三类：

```text
低频协议与平台工具
  ├─ 观测与公共协议：Network Error Logging / Randomness Beacon / MoQ
  ├─ 平台治理：Resource Tagging / Tenant / Version Management
  └─ 隐私与 Agent：Privacy Gateway / Privacy Proxy / Agent Memory
```

普通项目的默认顺序仍然是 Workers、Static Assets、D1、KV、R2、Queues、Durable Objects、WAF、Turnstile、Web Analytics 和 Workers Logs。下面这些能力只有在问题已经具体到“网络可达性、资源归因、企业配置灰度、隐私代理、实时媒体协议或 Agent 长期记忆”时才值得深入。

## 快速判断

| 你遇到的问题 | 看哪个产品 | 先问自己 |
| --- | --- | --- |
| 想知道用户浏览器到 Cloudflare 边缘的真实网络失败 | Network Error Logging | 是不是在排查区域性 ISP、TLS、TCP、HTTP/2 或 HTTP/3 问题？ |
| 需要公开、可验证、不可预测的随机数 | Randomness Beacon / drand | 这是公开抽签、审计、链上/协议随机数，还是应用内部密钥随机数？后者不要用公共 beacon。 |
| 资源太多，需要按环境、团队、成本中心归类 | Resource Tagging | 是否已经有多个 zone、Worker、D1、R2、KV、Tunnel 或 custom hostname 需要统一归因？ |
| 作为 Cloudflare partner 帮客户批量开账号和订阅 | Tenant API | 是否已经签署 Channel / Alliance partner 协议并有对应 entitlement？ |
| Enterprise zone 配置需要 staging、灰度和回滚 | Version Management | 是否愿意放弃 Terraform 作为同一批配置的真源，并接受 dashboard-only 工作流？ |
| 想用 OHTTP relay 隐藏客户端 IP | Privacy Gateway | 是否是隐私导向产品，并能进入 Enterprise closed beta？ |
| 想用 MASQUE forward proxy 隐藏用户真实 IP，同时保留地理位置准确性 | Privacy Proxy | 是否是 Enterprise 级代理服务，而不是普通网站后台保护？ |
| 需要基于 QUIC 的低延迟 live media 协议 | MoQ | 是否真的在做实时媒体协议实验，而不是普通视频播放或 WebRTC 会议？ |
| Agent 需要跨会话记住用户、项目和操作规则 | Agent Memory | 是否已经拿到 private beta access，并能接受当前价格仍未正式生效？ |

## 免费与付费边界

| 产品 | 免费 / 默认边界 | 付费 / 可用性边界 | 普通项目建议 |
| --- | --- | --- | --- |
| Network Error Logging | 官方 Get started 页标注 available to users on all plan types；Free 和 Pro zone 可在 Account home 的 Network 区域开启。 | 官方页面没有单独列价格；隐私要求高的账号可以通过 zone setting 或 Support 级开关关闭。 | 排查“用户访问失败但服务端没日志”的问题时很有价值；平时不需要主动把它当业务日志系统。 |
| Randomness Beacon | drand 是公开分布式随机数 beacon，不是按 Cloudflare 账号计费的常规产品。 | 最新用户文档入口在 drand.love；Cloudflare 文档更像背景和索引。 | 适合公开、可验证随机数；不要拿它生成密码、token、session secret。 |
| Resource Tagging | Available on all plans；public beta；当前 beta 限制为每账号最多 10,000 tags。 | API 稳定但行为可能变化；Dashboard 仍为 beta，自动化优先用 API；认证使用 Account Owned Tokens。 | 多资源、多环境、多团队后可以尽早引入 `env`、`team`、`owner`、`cost-center` 等标签。 |
| Tenant API | 面向 Channel 和 Alliance partners 的 provisioning 机制。 | 需要 partner agreement 和 Cloudflare 给账号启用 entitlement；普通 SaaS 多租户不等于 Tenant API。 | 普通项目继续用自己的 `tenant_id`、D1/R2/KV 分层；不要误把客户隔离问题升级成 Cloudflare partner API。 |
| Version Management | Free / Pro / Business 均不可用。 | Enterprise-only；dashboard-only；不支持 Terraform，同一批配置应二选一。 | 只有 Enterprise zone 的 WAF、Rules、Cache、配置灰度和回滚流程足够复杂时才考虑。 |
| Privacy Gateway | 无公开 self-serve 免费入口。 | Enterprise-only closed beta，面向 select privacy-oriented companies and partners。 | 普通站点不需要；隐私产品要先确认 OHTTP relay 是否是核心需求。 |
| Privacy Proxy | 无公开 self-serve 免费入口。 | Enterprise managed service；基于 MASQUE，支持 single-hop / double-hop 模型。 | 这是隐私代理产品，不是 Access、Tunnel、WARP 的替代说明。 |
| MoQ | 官方文档当前没有列 self-serve 价格或计划表。 | Cloudflare 实现支持 MoQ Transport 草案的一部分，feature matrix 仍在跟随草案演进。 | 普通直播、视频托管先看 Stream、RealtimeKit、Realtime SFU；协议团队再看 MoQ。 |
| Agent Memory | Private beta 期间官方暂不计费。 | Cloudflare 承诺开始收费或改变计费前至少提前 30 天通知；调用仍会涉及 Workers、Agents、AI 等底层产品的成本。 | 真正需要持久记忆的 Agent 再用；普通聊天记录先用 D1/R2 存原始会话和摘要。 |

## 与 $5 Workers Paid 的关系

Workers Paid 每月最低 $5，主要扩展 Workers、Pages Functions、KV、Hyperdrive、Durable Objects、Workers Logs、Builds 等开发者平台额度。它不会自动解锁 Enterprise-only、closed beta、partner entitlement 或协议实验能力。

| 能力 | Workers Paid 是否直接解决 |
| --- | --- |
| Version Management | 不解决。它是 Enterprise-only zone 能力。 |
| Privacy Gateway / Privacy Proxy | 不解决。它们是 Enterprise / closed beta / managed service 能力。 |
| Tenant API | 不解决。它依赖 Channel / Alliance partner 资格。 |
| Resource Tagging | 不需要 Workers Paid 才能使用；所有计划可用，但仍处于 public beta。 |
| Agent Memory | 价格目前是 private beta 暂不计费；实际应用里的 Worker、Agent、AI 调用成本要单独核对。 |
| MoQ | 不是用 Workers Paid 就能替代 Stream、RealtimeKit 或 WebRTC 的通用媒体能力。 |

## 产品拆解

### Network Error Logging

Network Error Logging 是浏览器上报网络失败的机制。Cloudflare 开启后会通过响应头让支持的浏览器把连接失败报告发到 Cloudflare，用来判断问题发生在用户、ISP、传输链路、Cloudflare 边缘、TLS 证书还是协议层。

它最适合回答这类问题：

- 某个地区用户反馈访问失败，但 Worker、源站和 WAF 日志看不到请求。
- 某个 ASN、ISP 或移动网络出现 `tcp.timed_out`、`tcp.failed` 或 TLS 证书错误。
- HTTP/2、HTTP/3、TLS、证书链路问题只在特定客户端或区域出现。

实践上不要把 NEL 当业务监控系统。它是网络可达性诊断工具，报告来自浏览器，覆盖面受浏览器支持和用户网络环境影响。隐私上，Cloudflare 官方文档说明 NEL 不存储 PII 或用户特定数据，客户端 IP 只在请求生命周期内的易失内存中使用后丢弃。

### Randomness Beacon

Randomness Beacon 对应 drand：多个节点用阈值密码学共同产生公开、可验证、不可偏置、不可预测的随机值。它像 NTP 或 Certificate Transparency 一样更接近互联网公共基础设施，而不是应用后端的随机数库。

适合：

- 公开抽签、竞赛、公示型随机过程。
- 协议、链上系统、审计流程需要外部可验证随机数。
- 研究分布式随机数 beacon 的密码学和运行模型。

不适合：

- 生成密码、session secret、API token。
- 替代语言运行时或操作系统的 CSPRNG。
- 对结果保密的内部业务随机数。

### Resource Tagging

Resource Tagging 是最值得普通团队关注的低频能力。它把 key-value metadata 贴到 Cloudflare 资源上，例如 zones、custom hostnames、Tunnels、Workers、D1、R2、KV。它不改变资源本身配置，而是在资源外建立一层可查询、可治理、可归因的标签。

建议从最小集合开始：

| 标签 | 示例 | 作用 |
| --- | --- | --- |
| `env` | `prod` / `staging` | 区分环境。 |
| `team` | `growth` / `platform` | 区分负责团队。 |
| `owner` | `alice` | 找到资源负责人。 |
| `cost-center` | `docs` / `api` | 对齐账单和预算。 |
| `data-class` | `public` / `internal` | 粗粒度数据边界。 |

注意三个 beta 限制：`PUT` 会替换全部标签，没有 `PATCH`；`DELETE` 会删除全部标签；从未打过标签的资源查询可能返回 `500` 而不是 `404`。所以自动化脚本要采用 GET、merge、PUT 的方式更新单个标签。

### Tenant API

Tenant API 不是“我做了多租户 SaaS，所以要用 Cloudflare Tenant”。它面向 Channel 和 Alliance partners，让合作伙伴替客户创建 Cloudflare account、user、zone、subscription，并保持客户之间的数据和配置隔离。

普通 SaaS 的多租户通常应该这样做：

- 应用层：D1 / R2 / KV / Durable Objects 里有 `tenant_id`。
- 域名层：客户需要自定义域名时用 Cloudflare for SaaS。
- 用户代码层：客户要运行自定义代码时再看 Workers for Platforms / Dynamic Workers。
- Partner provisioning：只有你成为 Cloudflare partner 并代客户管理 Cloudflare 账号，才看 Tenant API。

### Version Management

Version Management 解决的是 Enterprise zone 配置变更的灰度、staging 和回滚。它可以为 zone 配置创建独立 version，在 staging 环境验证后再部署到 production。

关键边界：

- Free、Pro、Business 都不可用，只有 Enterprise 可用。
- 只能通过 Cloudflare dashboard 管理，没有 public API。
- Terraform 不支持，官方明确建议 Terraform 和 Version Management 二选一。
- 不是所有产品配置都会 clone，例如 Network Error Logging、Client-side security、部分 API Shield、Image Transformations、Snippets、Compression Rules 等存在限制。
- Wrangler 部署 Worker routes / custom domains 时可能和 zone versioning 产生冲突。

如果团队已经把 DNS、WAF、Rules、Access、Workers route 等配置纳入 Terraform，默认继续保持 Terraform 为真源。Version Management 更适合以 dashboard 变更为主、需要 Enterprise staging / rollback 的组织。

### Privacy Gateway

Privacy Gateway 实现 Oblivious HTTP，用 relay 把客户端 IP 和应用后端隔开。Relay 只转发加密请求和响应，理论上只知道加密消息长度和目标服务，不知道应用数据本身。

它的边界很明确：

- Enterprise-only。
- 当前是 closed beta。
- 面向 select privacy-oriented companies and partners。
- 它不能阻止应用层自己在请求里发送邮箱、姓名、手机号等可识别字段。

普通项目如果只是想保护后台、内网或管理入口，优先看 Cloudflare Access、Tunnel、WAF、Turnstile 和 Rate Limiting。Privacy Gateway 只在“隐藏客户端 IP 是产品核心承诺”时才进入评估。

### Privacy Proxy

Privacy Proxy 是 MASQUE-based forward proxy，用 HTTP CONNECT 和 CONNECT-UDP over HTTP/2 / HTTP/3 代理 TCP 和 UDP 流量。它的目标是把用户身份和访问活动拆开：用户向代理认证，目标服务只看到 Cloudflare IP。

部署模型有两类：

| 模型 | 谁看到什么 | 适合场景 |
| --- | --- | --- |
| Single-hop | Cloudflare 处理认证、代理和 egress，因此能看到身份和目的地。 | 复杂度低，适合托管代理服务。 |
| Double-hop | 你运营第一跳，Cloudflare 运营第二跳；第一跳知道用户，不知道目的地；第二跳知道目的地，不知道用户。 | 追求更强隐私分离、监管隔离或自主管理用户认证。 |

这不是普通站点加速方案，也不是文档站评论、搜索、后台保护的方案。它更接近隐私网络产品的基础设施。

### MoQ

MoQ 是 Media over QUIC，用 QUIC 传输低延迟 live media。Cloudflare 文档把它定位为互联网基础设施级媒体交付协议，类似 HTTP 之于内容分发、WebRTC 之于实时通信。

当前要谨慎看待：

- Cloudflare 实现支持 MoQ Transport specification 的一部分。
- 官方 feature matrix 显示 draft-14 和 draft-07 的 supported / unsupported messages 仍在演进。
- Safari 的 WebTransport 支持仍可能导致一些用例需要 WebRTC 或 WebSocket fallback。

普通项目做视频托管看 Stream，做会议/课堂看 RealtimeKit，做自定义 WebRTC 看 Realtime SFU / TURN。MoQ 更适合协议团队、实时媒体基础设施团队和实验项目。

### Agent Memory

Agent Memory 是 Cloudflare 给 Agent 提供的持久记忆服务。它能从对话中抽取 facts、events、instructions、tasks，把记忆按 namespace 和 profile 隔离，再在后续 Agent 执行时 recall 相关上下文。

当前关键信息：

- Private beta。
- 官方 Pricing 页说明 beta 期间暂不计费。
- 开始收费或改变计费前至少提前 30 天通知。
- `ingest()` 每次最多 500 条消息。
- 单条 message content 最大 32 KB。
- `recall()` query 最大 1 KB。
- namespace name 最大 32 字符，profile name 最大 100 字符。

实践建议是不要把所有聊天历史都无脑丢给记忆系统。更稳的做法是：原始对话进入 D1/R2，短期会话状态进入 Durable Objects，需要长期复用的偏好、约定、事实和任务再进入 Agent Memory。没有 private beta access 时，可以先用 D1 + Vectorize / AI Search 做可控的记忆原型。

## 开源与官方 GitHub 源

这些仓库适合用来判断生态、实现状态和官方文档原始来源。价格、额度、计划和可用性仍以 Cloudflare Docs 页面为准。

| 方向 | GitHub 仓库 / 原始来源 | 怎么看 |
| --- | --- | --- |
| 官方文档源 | [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs) | Cloudflare 文档的原始 MDX 仓库；可追踪每个产品文档的变更。 |
| NEL 文档源 | [network-error-logging](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/network-error-logging) | 看 NEL overview、get started、reference 的原始文件。 |
| Randomness Beacon 实现 | [drand/drand](https://github.com/drand/drand) | Go 实现的分布式 randomness beacon daemon。 |
| Resource Tagging 文档源 | [resource-tagging](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/resource-tagging) | 看 public beta、limits、supported resource types。 |
| Tenant 文档源 | [tenant](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/tenant) | 看 partner provisioning、account/subscription 管理模型。 |
| Version Management 文档源 | [version-management](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/version-management) | 看 Enterprise-only、dashboard-only 和产品兼容限制。 |
| Privacy Gateway 文档源 | [privacy-gateway](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/privacy-gateway) | 看 OHTTP relay、closed beta、legal、limitations。 |
| Privacy Proxy 文档源 | [privacy-proxy](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/privacy-proxy) | 看 MASQUE、single-hop / double-hop、headers 和 observability。 |
| MoQ 实现 | [cloudflare/moq-rs](https://github.com/cloudflare/moq-rs) | Rust 实现的 IETF MoQ Transport 协议，适合看协议实现状态。 |
| QUIC / HTTP3 基础 | [cloudflare/quiche](https://github.com/cloudflare/quiche) | Cloudflare 的 QUIC / HTTP3 实现，适合理解底层协议生态。 |
| Agent Memory 文档源 | [agent-memory](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/agent-memory) | 看 private beta、Workers API、HTTP API、pricing 和 limits。 |
| Agents 生态 | [cloudflare/agents](https://github.com/cloudflare/agents) | 看 Cloudflare Agents SDK 的实践模式，再决定是否需要托管记忆。 |

## 官方资料

- [Network Error Logging](https://developers.cloudflare.com/network-error-logging/)
- [Network Error Logging get started](https://developers.cloudflare.com/network-error-logging/get-started/)
- [Network Error Logging reference](https://developers.cloudflare.com/network-error-logging/reference/)
- [Cloudflare Randomness Beacon](https://developers.cloudflare.com/randomness-beacon/)
- [drand developer docs](https://drand.love/developer/)
- [Resource Tagging](https://developers.cloudflare.com/resource-tagging/)
- [Resource Tagging limits](https://developers.cloudflare.com/resource-tagging/reference/limits/)
- [Tenant API](https://developers.cloudflare.com/tenant/)
- [Tenant get started](https://developers.cloudflare.com/tenant/get-started/)
- [Version Management](https://developers.cloudflare.com/version-management/)
- [Privacy Gateway](https://developers.cloudflare.com/privacy-gateway/)
- [Privacy Gateway limitations](https://developers.cloudflare.com/privacy-gateway/reference/limitations/)
- [Privacy Proxy](https://developers.cloudflare.com/privacy-proxy/)
- [Privacy Proxy deployment models](https://developers.cloudflare.com/privacy-proxy/concepts/deployment-models/)
- [MoQ](https://developers.cloudflare.com/moq/)
- [MoQ Feature Matrix](https://developers.cloudflare.com/moq/feature-matrix/)
- [Agent Memory](https://developers.cloudflare.com/agent-memory/)
- [Agent Memory pricing](https://developers.cloudflare.com/agent-memory/platform/pricing/)
- [Agent Memory limits](https://developers.cloudflare.com/agent-memory/platform/limits/)
