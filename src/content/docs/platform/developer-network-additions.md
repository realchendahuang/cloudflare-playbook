---
title: 开发者与网络补充专项
description: Agent Lee、Artifacts、Email Service、Flagship、Network、Network Flow、R2 SQL、Sandbox SDK 和 Style Guide 的取舍。
---

最后核对日期：2026-06-18。

这一页收纳 Cloudflare 的补充型开发者和网络产品。它们不是普通项目默认栈，而是在项目已经有明确问题时再看：事务邮件、功能灰度、网络观测、R2 数据查询、代码沙箱、Agent 工作区或文档工程。

## 一句话判断

| 产品 | 什么时候看 | 普通项目判断 |
| --- | --- | --- |
| Agent Lee | 想在 Dashboard 里问账号配置、跑 DNS / 证书诊断。 | Beta；不要当生产自动化真源。 |
| Artifacts | Agent、Sandbox、CI/CD 需要版本化文件树或构建产物。 | Workers Free 不可用，Workers Paid 才有 included usage。 |
| Email Service | 需要事务邮件、入站邮件处理或 Agent 邮件能力。 | Email Routing 可免费起步，任意收件人 outbound sending 需要 Workers Paid。 |
| Flagship | API、SaaS、AI 功能需要灰度、kill switch、定向发布。 | 简单环境开关继续用配置变量，不要过早引入 feature flag 平台。 |
| Network | 需要 gRPC、IPv6、WebSockets、IP geolocation 等 zone 级网络设置。 | 大多是入口兼容性开关，不是独立架构。 |
| Network Flow | 有路由器、NetFlow / sFlow / IPFIX 或企业网络流量。 | 普通网站先看 Web Analytics、Logs、Security Events。 |
| R2 SQL | 数据已经在 R2 Data Catalog，并需要 SQL 分析 Iceberg / Parquet。 | 不是 D1 替代品，不做事务查询。 |
| Sandbox SDK | 需要安全执行不可信代码、AI code executor 或临时开发环境。 | 生产能力继承 Containers 成本，普通 API 不要先上。 |
| Style Guide | 写开源文档、产品文档和 Agent-friendly docs。 | 值得长期参考，不是计费产品。 |

## 免费与付费边界

| 产品 | 免费 / 起步边界 | 付费或升级边界 |
| --- | --- | --- |
| Agent Lee | Beta，当前只对 Free plan 账号开放；写操作需要显式确认。 | 官方当前页面没有 self-serve paid tier。 |
| Artifacts | Workers Free 不可用。 | Workers Paid 包含 10,000 operations/month 和 1 GB storage/month；超出按 operations 和 GB-mo 计费。 |
| Email Service | Email Routing inbound unlimited；发到 verified destination addresses 在所有计划免费且不计入 quota。 | 向任意收件人发送需要 Workers Paid；3,000 outbound emails/month included，超出按量。 |
| Flagship | 官方 limits 列出 apps/account、flags/app、condition depth 和 flag config 等边界。 | 价格和可用性按官方页面和 Dashboard 实际状态核对。 |
| Network | Network settings available on all plans。 | True-Client-IP Header 是 Enterprise-only；相关 add-on 费用按产品另算。 |
| Network Flow | Free version available to all accounts，适合小规模网络流量观察。 | 更高流量和配置规模走企业版本。 |
| R2 SQL | 1 GB/month data scanned included。 | Paid 10 GB/month included，超出按扫描量计费；R2 storage / operations、R2 Data Catalog 另算。 |
| Sandbox SDK | 本地和原型可试。 | 生产部署基于 Containers；还会叠加 Workers、Durable Objects、Workers Logs 等费用。 |
| Style Guide | 免费阅读；Cloudflare docs 公开在 GitHub。 | 不是计费产品；托管和构建仍按所选平台计费。 |

## 与 5 USD Workers Paid 的关系

| 能力 | Workers Paid 是否关键 | 判断 |
| --- | --- | --- |
| Artifacts | 是。 | Free 不可用，Paid 才有 operations 和 storage included usage。 |
| Email Service outbound | 是。 | 向任意收件人发送邮件需要 Workers Paid。 |
| Sandbox SDK | 通常是。 | Containers 和生产沙箱能力会进入付费边界。 |
| R2 SQL | 对更高 included usage 有帮助。 | Free 1 GB/month scanned，Paid 10 GB/month scanned。 |
| Agent Lee | 不是。 | 当前更像 Dashboard 助手，不是 Workers Paid 能力。 |
| Network / Network Flow | 不是直接关系。 | Network settings 所有计划可用；Network Flow 有独立 free version。 |
| Flagship | 不写成 5 USD 解锁。 | 先按官方 limits 和 Dashboard 实际可用性核对。 |

## 启用前判断

| 问题 | 判断 |
| --- | --- |
| 主线产品能不能解决？ | 普通项目主线仍是 Workers、Static Assets、D1、KV、R2、Queues、DO、安全和缓存。 |
| 是否会产生按量成本？ | Artifacts、Email Sending、R2 SQL、Sandbox 都可能从“试一下”变成成本。 |
| 是否会影响生产行为？ | Agent Lee、Flagship、Email、Network settings 都要保留 review。 |
| 是否涉及数据或代码执行？ | Sandbox、Email、R2 SQL、Artifacts 不应和普通请求路径混在一起。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| Agent Lee 可以代替生产变更流程。 | 它是 Dashboard 助手；生产变更仍要有 review 和可追踪真源。 |
| Artifacts 是对象存储。 | 普通文件和上传先用 R2；Artifacts 更偏 Git-backed 工作区。 |
| Email Service 可以直接做营销邮件。 | 事务邮件可以评估，营销邮件还要退订、投诉、声誉和合规。 |
| Feature flag 可以代替权限。 | Flagship 控制功能开关，真正授权仍在业务后端。 |
| R2 SQL 是数据库。 | 它是 serverless query engine，按扫描量计费，只读分析数据湖。 |
| Sandbox SDK 很酷所以先上。 | 只有需要执行不可信代码时才值得承担 Containers 和安全复杂度。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs) | 这些产品的官方文档源文件和变更历史。 |
| [cloudflare/artifact-fs](https://github.com/cloudflare/artifact-fs) | Artifacts 生态里的 Git-backed FUSE driver。 |
| [cloudflare/flagship](https://github.com/cloudflare/flagship) | Flagship SDK 和 OpenFeature provider。 |
| [cloudflare/sandbox-sdk](https://github.com/cloudflare/sandbox-sdk) | Sandbox SDK 官方源码和示例。 |
| [cloudflare/agents email guide](https://github.com/cloudflare/agents/blob/main/docs/email.md) | Agents SDK 中 Email Service 的发信、收信和回复路由。 |
| [cloudflare/skills](https://github.com/cloudflare/skills) | 官方 Agent Skills，适合学习如何把平台知识交给 Agent。 |
| [cloudflare/mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare) | Cloudflare domain-specific MCP servers。 |

## 事实来源

- [Agent Lee](https://developers.cloudflare.com/agent-lee/)
- [Artifacts Pricing](https://developers.cloudflare.com/artifacts/platform/pricing/)
- [Artifacts Limits](https://developers.cloudflare.com/artifacts/platform/limits/)
- [Email Service Pricing](https://developers.cloudflare.com/email-service/platform/pricing/)
- [Email Service Limits](https://developers.cloudflare.com/email-service/platform/limits/)
- [Flagship Limits](https://developers.cloudflare.com/flagship/reference/limits/)
- [Network settings](https://developers.cloudflare.com/network/)
- [True-Client-IP Header](https://developers.cloudflare.com/network/true-client-ip-header/)
- [Network Flow free version](https://developers.cloudflare.com/network-flow/network-flow-free/)
- [R2 SQL Pricing](https://developers.cloudflare.com/r2-sql/platform/pricing/)
- [R2 SQL limitations and best practices](https://developers.cloudflare.com/r2-sql/reference/limitations-best-practices/)
- [Sandbox SDK Pricing](https://developers.cloudflare.com/sandbox/platform/pricing/)
- [Sandbox SDK Limits](https://developers.cloudflare.com/sandbox/platform/limits/)
- [Cloudflare Style Guide](https://developers.cloudflare.com/style-guide/)
- [Cloudflare docs site stack](https://developers.cloudflare.com/style-guide/how-we-docs/our-site/)
