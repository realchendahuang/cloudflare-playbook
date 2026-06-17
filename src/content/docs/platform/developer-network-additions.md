---
title: 开发者与网络补充专项
description: Agent Lee、Artifacts、Email Service、Flagship、Network、Network Flow、R2 SQL、Sandbox SDK 和 Style Guide 的免费边界、付费入口、GitHub 来源和普通项目取舍。
---

最后核对日期：2026-06-17。

这一组产品不是“所有项目都先上”的默认栈，而是 Cloudflare 在开发者工作流、Agent 工作区、事务邮件、网络观测、数据湖查询和文档工程上的补充能力。普通项目要先问三个问题：

1. 它是不是解决了当前真实问题。
2. 它是不是已经进入可自助使用、可计费、可稳定部署的阶段。
3. 它和 Workers Paid 的关系是什么，是被 `$5/month` 解锁，还是仍然属于 Enterprise、Beta 或独立产品边界。

```text
开发者与网络补充专项
  ├─ 开发者工作流
  │    ├─ Artifacts：Git-backed 工作区和构建产物
  │    ├─ Sandbox SDK：安全代码执行环境
  │    ├─ R2 SQL：查询 R2 Data Catalog 的 Iceberg / Parquet 数据
  │    └─ Flagship：边缘 feature flags
  │
  ├─ 通信与入口
  │    ├─ Email Service：事务邮件发送和邮件路由
  │    ├─ Network：gRPC、IPv6、WebSockets、IP headers 等 zone 级网络设置
  │    └─ Network Flow：NetFlow / sFlow / IPFIX 流量观测
  │
  └─ 控制台与文档
       ├─ Agent Lee：Cloudflare Dashboard 内置 AI 助手
       └─ Style Guide：Cloudflare 官方文档工程规范
```

## 快速判断

| 产品 | 普通项目先怎么判断 | 免费 / 付费边界 |
| --- | --- | --- |
| Agent Lee | 当作 Dashboard 里的辅助排障和配置检查工具，不当作生产自动化入口。 | 当前是 Beta，并且只对 Free plan 账号开放；写操作需要显式确认。 |
| Artifacts | Agent、Sandbox、CI/CD 需要版本化文件树时再看。 | Workers Free 不可用；Workers Paid 包含 10,000 operations/month 和 1 GB storage/month。 |
| Email Service | 需要事务邮件、入站邮件处理、Agent 邮件能力时看。 | Email Routing Free/Paid 都可用；向任意收件人发送邮件需要 Workers Paid，包含 3,000 outbound emails/month。 |
| Flagship | API、SaaS、AI 功能需要灰度发布时看。 | 官方 limits 页给出软限制；当前专题只写已核对的 limits，不假设额外价格。 |
| Network | 域名接入后按需打开 gRPC、IPv6、WebSockets、IP geolocation 等。 | Network settings available on all plans；True-Client-IP Header 是 Enterprise-only。 |
| Network Flow | 自有路由器、Magic Transit 或网络流量观测场景再看。 | Free version available to all accounts，限制为 10 routers、25 rules、250 flows/sec/account。 |
| R2 SQL | 数据已经进 R2 Data Catalog，并且需要 SQL 分析时看。 | Free included 1 GB/month data scanned；Paid included 10 GB/month，超出 `$0.0025/GB`。 |
| Sandbox SDK | AI 代码执行、代码评审、临时开发环境、CI/CD 沙箱再看。 | 基于 Containers，生产部署需要 Workers Paid 或 Enterprise；还会涉及 Workers、Durable Objects、Workers Logs 等费用。 |
| Style Guide | 写开源文档、产品文档和 Agent-friendly docs 时长期参考。 | 不是计费产品；Cloudflare docs 自身使用 GitHub、Starlight/Astro、Workers、Algolia/DocSearch 等组合。 |

## 和 Workers Paid 的关系

Workers Paid 每个账号每月最低 `$5 USD`，它不是 Cloudflare Pro，也不是把所有 Cloudflare 产品都升级。对这一组产品，可以这样看：

| 能力 | `$5 Workers Paid` 是否关键 | 具体边界 |
| --- | --- | --- |
| Artifacts | 是。 | Free 不可用；Paid 包含 10,000 operations/month 和 1 GB storage/month，超出后按操作和 GB-month 计费。 |
| Email Service | 对 outbound sending 是。 | Email Routing 可在 Free/Paid 使用；向任意收件人发送邮件需要 Workers Paid，包含 3,000 outbound emails/month。 |
| Sandbox SDK | 是。 | Containers 和 Worker Loader bindings 需要 Workers Paid 或 Enterprise；费用由 Containers、Workers、Durable Objects 和可选 logs 共同决定。 |
| R2 SQL | 对更高 included usage 有帮助。 | Free 1 GB/month data scanned；Paid 10 GB/month，超出 `$0.0025/GB`。R2 storage / operations、R2 Data Catalog 费用另算。 |
| Flagship | 不在这篇里写成 `$5` 解锁。 | 官方 limits 页给出 apps、flags 和配置大小限制；pricing 需要以后继续核对。 |
| Agent Lee | 不是。 | 当前 Beta 只对 Free plan 账号开放。 |
| Network | 不是。 | Network settings available on all plans；但 True-Client-IP Header 是 Enterprise-only。 |
| Network Flow | 不是。 | Free version 面向所有账号；更高网络流量和配置上限走企业能力。 |
| Style Guide | 不是。 | 它是写作和文档工程规范。 |

## 额度速查

| 产品 | Free / 免费边界 | Paid / 付费边界 | 普通项目建议 |
| --- | --- | --- | --- |
| Agent Lee | Beta，只对 Free plan 账号开放；可以回答账号配置问题、运行 DNS / 证书诊断、生成账号分析图表。 | 官方当前页面没有写 self-serve paid tier；写操作仍需用户确认。 | 适合排查和学习账号状态；不要让它代替 Git、Wrangler、IaC 和 review。 |
| Artifacts | Workers Free 不可用。 | Workers Paid 包含 10,000 operations/month，超出 `$0.15/1,000 operations`；包含 1 GB storage/month，超出 `$0.50/GB-mo`。limits 包括 2,000 requests/10s/namespace、2,000 Git requests/10s/artifact、10 GB/repository、1 TB/account。 | Agent 工作区、构建产物和多沙箱 repo 很适合；普通文档站不需要。 |
| Email Service | Email Routing inbound unlimited；发送到 verified destination addresses 在所有计划免费且不计入 quota。 | 向任意收件人发送需要 Workers Paid；3,000 outbound emails/month included，超出 `$0.35/1,000 emails`。Routing rules/domain 200，destination addresses/account 200，inbound message size 25 MiB。 | 事务邮件可以用；营销邮件、冷启动批量发送和合规退订要单独设计。 |
| Flagship | 官方 limits 页列出 apps/account 10,000、flags/app 5,000、condition nesting depth 6、flag config size/app 25 MB。 | apps/account 和 flags/app 是 soft limits，可联系支持提高；这篇不写未核对价格。 | 灰度发布、A/B、kill switch 优先用；简单环境开关继续用配置变量即可。 |
| Network | Network settings available on all plans；gRPC、IP Geolocation、IPv6、WebSockets、Pseudo IPv4 等按页面开关使用。 | True-Client-IP Header 是 Enterprise-only；gRPC 经 Argo、WAF、Bot Management 等 add-on 时可能有对应费用。 | 先用默认 IPv6 / WebSockets；gRPC 要确认端口 443、TLS、HTTP/2 和 Access/WAF 限制。 |
| Network Flow | Free version available to all Cloudflare accounts，包含 enterprise features，但有 volume/config 限制：10 routers、25 rules、250 flows/sec/account。 | 更高流量和配置规模走企业版本。 | 有路由器和 NetFlow/sFlow/IPFIX 数据才需要；普通网站用 Web Analytics / Logs 即可。 |
| R2 SQL | 1 GB/month data scanned included。 | Paid 10 GB/month included，超出 `$0.0025/GB`；每次查询最小 10 MB；R2 read operations 计入 R2 Class B。 | 只查 R2 Data Catalog 中的 Iceberg / Parquet；用 time filter、列选择、LIMIT 和 EXPLAIN 控制扫描量。 |
| Sandbox SDK | 本地开发可试；生产能力继承 Containers。 | 生产部署需要 Workers Paid 或 Enterprise；每个 SDK HTTP operation 默认算一次 subrequest，Free 50/request，Paid 1,000/request；高频操作用 WebSocket/RPC transport。 | AI 代码执行和 Agent 工具链很有价值；普通 API 不要为了“酷”先上沙箱。 |
| Style Guide | 免费阅读；Cloudflare docs 公开在 GitHub，使用 Starlight/Astro，搜索用 Algolia，开源文档可申请免费 DocSearch。 | Cloudflare docs hosting 使用 Workers；GitHub Actions 和 Workers CI/CD 都有 free tier。 | 本站继续对齐：公开 GitHub 仓库、Starlight、Workers Static Assets、资料索引、最后核对日期。 |

## 产品拆解

### Agent Lee

Agent Lee 是 Cloudflare Dashboard 内置 AI co-pilot。它能基于当前账号配置回答问题，查看 DNS records、zone settings、WAF rules、Workers routes、R2 bucket names、Tunnel 配置等信息，也能做 DNS lookup、certificate checks 这类网络诊断。

关键边界：

- 当前处于 Beta，官方写明只对 Free plan 账号开放。
- 它可以发起 DNS、zone settings、security rules 等写操作，但执行前需要显式确认。
- 它不能写 Workers scripts，不能替代 Support 处理账单、账号恢复或故障事件，也不能跨账号操作。
- 它不该成为生产变更真源；生产配置仍然应该通过 Git、Wrangler、Terraform/Pulumi 或 Dashboard review 闭环。

普通项目可以把 Agent Lee 当成“账号内问答 + 快速诊断 + Dashboard 引导”，不要把它当成无审批的自动驾驶。

### Artifacts

Artifacts 是 Cloudflare 给 Workers、API 和 Git-compatible 工具准备的 versioned filesystem。它按 namespace / repository 建模，每个 repo 都是独立 Git service，有自己的 remote URL、tokens、Git history 和 durable state。Cloudflare 官方的 ArtifactFS 则是一个 Git-backed FUSE driver，可以快速挂载大 repo，再按需 hydration 文件内容。

适合的场景：

- AI agent 需要把代码库、生成文件、构建产物、检查点放进一个可版本化工作区。
- Sandbox / Containers 启动时不想等完整 clone。
- CI/CD 或任务系统需要在 Cloudflare 上管理许多短生命周期 repo。

不适合的场景：

- 普通文档站、普通静态资源、用户上传文件，仍然优先 R2 / D1 / Git。
- 只是存一个 JSON 配置，不要把 Artifacts 当 KV。

### Email Service

Email Service 分成两个方向：Email Routing 处理入站邮件，Email Sending 发送事务邮件。官方 Agents 仓库已经给出 email agent 示例：通过 `send_email` binding 发出邮件，通过 routing rule 把入站邮件交给 Worker / Agent，并可用 `EMAIL_SECRET` 做回复路由签名。

普通项目使用顺序：

1. 先配置域名 DNS、SPF、DKIM、DMARC 和 routing。
2. 只需要收邮件或转发，先用 Email Routing。
3. 需要注册验证、magic link、收据、通知，再评估 Workers Paid 的 Email Sending。
4. 有用户回复链路时，把入站邮件交给 Worker，并用 D1 / Durable Objects / R2 记录上下文。

它不是营销邮件平台。批量发送、退订、投诉、硬退信、合规和发信声誉要单独处理。

### Flagship

Flagship 是 Cloudflare 的 feature flag 平台。它把 flag 配置传播到 Cloudflare global network，Worker 或 SDK 在本地评估，不需要每次回中心服务。官方 SDK 仓库是 OpenFeature-compliant provider，Workers 上推荐用 native binding，因为可以跳过 HTTP 和 auth token 管理。

适合：

- 新功能灰度、按用户 / 国家 / plan 定向。
- kill switch。
- API 行为迁移和 AI 功能开关。

不适合：

- 一两个固定环境变量，不要为了开关而引入 feature flag 系统。
- 权限系统不要只靠 Flagship；真正鉴权仍然要在业务数据和后端逻辑里完成。

### Network

Network settings 是 zone 级网络开关，覆盖 gRPC、IP geolocation、IPv6、Onion Routing、Pseudo IPv4、True-Client-IP、WebSockets 等。它们通常不构成一个独立架构，而是服务于入口层兼容性。

常见判断：

- WebSockets：实时连接需要时开启，但 WAF 只检查初始 HTTP 101 请求，连接建立后不会检查后续 stream 内容。
- gRPC：Free/Pro/Business/Enterprise 都可用；要求端口 443、TLS、HTTP/2 和正确 content type。WAF managed rules 不检查 gRPC stream 内容，Access 也不支持通过反向代理保护 gRPC。
- IP Geolocation：可以用 `CF-IPCountry` 或 Managed Transform 增加位置 header。
- True-Client-IP：Enterprise-only；普通项目通常使用 `CF-Connecting-IP` 和相关 Managed Transform。

### Network Flow

Network Flow 用 NetFlow、sFlow、IPFIX 做网络流量可视化和规则告警。它从 Magic Network Monitoring 演进而来，免费版本对所有 Cloudflare 账号开放，但有 routers、rules 和 flows/sec 限制。

适合：

- 有自有路由器或企业网络流量。
- 需要看大流量来源、协议分布、DDoS 指标和网络异常。
- 已经在评估 Magic Transit 或企业网络防护。

普通网站通常先用 Web Analytics、Dashboard Analytics、Workers Logs、Security Events 和 GraphQL Analytics API。没有路由器流量源时，Network Flow 不是第一站。

### R2 SQL

R2 SQL 是查询 R2 Data Catalog 中 Iceberg table 的 serverless query engine，目前是 open beta。它不是数据库，也不是 D1 替代品；它适合对 R2 上的 Parquet / Iceberg 数据做只读分析。

成本控制重点：

- 计费按 compressed data scanned，不按返回结果大小。
- 每次查询最小 10 MB。
- R2 SQL data scanned 费用之外，还会产生 R2 Class B read operations 和 R2 Data Catalog 相关费用。
- `EXPLAIN`、`SHOW`、`DESCRIBE` 这类 metadata-only operations 不扫描数据，但 R2 / Data Catalog 请求仍然可能适用。

写查询时优先使用 time-range filters、明确列名、`LIMIT`、approx aggregates、compaction 和 `EXPLAIN`。不要把它当实时事务库。

### Sandbox SDK

Sandbox SDK 让 Workers 应用可以启动安全隔离的代码执行环境，背后基于 Workers、Durable Objects 和 Containers。官方 GitHub 仓库定位很清楚：运行 untrusted code、执行 commands、管理 files、跑 background processes、暴露 services。

适合：

- AI code executor。
- 代码评审 bot。
- 数据分析 notebook / 代码解释器。
- 临时开发环境。
- 需要隔离执行用户代码的 Agent。

边界：

- 生产部署需要 Workers Paid 或 Enterprise。
- 费用跟 Containers、Workers、Durable Objects、Workers Logs 都有关。
- 默认 HTTP transport 下 `exec()`、`readFile()`、`writeFile()` 等每个操作都算 subrequest；高频操作要用 WebSocket / RPC transport。
- 沙箱里跑不可信代码时，还要设计 outbound policy、secret 注入、文件持久化和清理策略。

### Style Guide

Cloudflare Style Guide 对这个仓库很有参考价值，因为它不是只讲文风，也讲文档系统怎么组织：content types、frontmatter、navigation、notes、accessibility、AI consumability、metadata、links、site framework 和 hosting。

Cloudflare docs 自身的公开做法：

- 内容放在 GitHub public repository。
- 文档框架使用 Starlight / Astro。
- 搜索使用 Algolia；开源文档可以申请免费 DocSearch。
- 构建使用 GitHub Actions，并逐步迁到 Workers CI/CD。
- 托管使用 Cloudflare Workers。

本站已经和这条路线一致：GitHub 开源、Astro/Starlight、Workers Static Assets、Pagefind 搜索、资料索引、最后核对日期。后续可以继续补的是 AI consumability：给每个专题稳定标题、短描述、事实来源、产品边界和可验证链接。

## Codex / Agent 写作流程

Cloudflare 官方给 Codex、Agent setup、Skills、MCP 和 docs-for-agents 单独做了入口。对本站后续维护来说，流程应该固定下来：

```text
需求
  └─ 读本仓库文档结构和 AGENTS 规则
      └─ 先查产品级 llms.txt / index.md
          └─ 核对 pricing / limits / changelog
              └─ 找 Cloudflare 官方 GitHub 或成熟开源项目
                  └─ 改文章
                      └─ build / typecheck / H1 检查
                          └─ wrangler deploy
                              └─ 线上验证
```

关键点：

- 对价格、limits、免费额度、beta 状态、API shape，不让 Codex 靠记忆写。
- 优先读官方 Markdown：`developers.cloudflare.com/<product>/llms.txt` 和页面 `index.md`。
- GitHub 仓库用于学习真实结构和维护状态，不代替官方 pricing / limits 页面。
- 部署配置以仓库里的 `wrangler.jsonc` 为真源。
- 文章里要区分“官方事实”和“本站判断”。

## GitHub 开源参考

| 仓库 | 值得看什么 |
| --- | --- |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，适合继续学习 Codex 教程站的学习路线、章节组织和资料索引。 |
| [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs) | Cloudflare 官方文档源文件；可以直接追踪 Agent Lee、Artifacts、Email Service、Flagship、Network、Network Flow、R2 SQL、Sandbox SDK、Style Guide 的更新。 |
| [cloudflare/artifact-fs](https://github.com/cloudflare/artifact-fs) | Artifacts 生态里的 Git-backed FUSE driver，适合看大 repo 快速挂载和按需 hydration。 |
| [cloudflare/flagship](https://github.com/cloudflare/flagship) | Flagship 官方 SDK，OpenFeature provider，Workers binding 是推荐路径。 |
| [cloudflare/sandbox-sdk](https://github.com/cloudflare/sandbox-sdk) | Sandbox SDK 官方源码和示例，适合看 Workers + Containers + Durable Objects 的沙箱模式。 |
| [cloudflare/agents email guide](https://github.com/cloudflare/agents/blob/main/docs/email.md) | Agents SDK 里 Email Service 的发信、收信、回复路由和 binding 示例。 |
| [cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox) | 自托管在 Cloudflare Workers 上的邮箱 + AI agent 示例，组合了 Email Routing、Durable Objects、R2、Agents SDK 和 Workers AI。 |
| [cloudflare/skills](https://github.com/cloudflare/skills) | 官方 Agent Skills，适合把 Cloudflare 平台判断规则交给 Codex / Claude Code / Cursor。 |
| [cloudflare/mcp](https://github.com/cloudflare/mcp) | Code Mode MCP Server，适合理解 Cloudflare API 操作怎样暴露给 agent。 |
| [cloudflare/mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare) | Domain-specific MCP servers，覆盖 docs、bindings、builds、observability、AI Gateway 等。 |

## 官方资料

- [Agent Lee](https://developers.cloudflare.com/agent-lee/)
- [Artifacts](https://developers.cloudflare.com/artifacts/)
- [Artifacts Pricing](https://developers.cloudflare.com/artifacts/platform/pricing/)
- [Artifacts Limits](https://developers.cloudflare.com/artifacts/platform/limits/)
- [How Artifacts works](https://developers.cloudflare.com/artifacts/concepts/how-artifacts-works/)
- [Email Service](https://developers.cloudflare.com/email-service/)
- [Email Service Pricing](https://developers.cloudflare.com/email-service/platform/pricing/)
- [Email Service Limits](https://developers.cloudflare.com/email-service/platform/limits/)
- [Flagship](https://developers.cloudflare.com/flagship/)
- [Flagship Concepts](https://developers.cloudflare.com/flagship/concepts/)
- [Flagship Limits](https://developers.cloudflare.com/flagship/reference/limits/)
- [Network settings](https://developers.cloudflare.com/network/)
- [gRPC connections](https://developers.cloudflare.com/network/grpc-connections/)
- [True-Client-IP Header](https://developers.cloudflare.com/network/true-client-ip-header/)
- [Network Flow](https://developers.cloudflare.com/network-flow/)
- [Network Flow free version](https://developers.cloudflare.com/network-flow/network-flow-free/)
- [R2 SQL](https://developers.cloudflare.com/r2-sql/)
- [R2 SQL Pricing](https://developers.cloudflare.com/r2-sql/platform/pricing/)
- [R2 SQL limitations and best practices](https://developers.cloudflare.com/r2-sql/reference/limitations-best-practices/)
- [Sandbox SDK](https://developers.cloudflare.com/sandbox/)
- [Sandbox SDK Pricing](https://developers.cloudflare.com/sandbox/platform/pricing/)
- [Sandbox SDK Limits](https://developers.cloudflare.com/sandbox/platform/limits/)
- [Claude Managed Agents on Sandbox](https://developers.cloudflare.com/sandbox/tutorials/claude-managed-agents/)
- [Cloudflare Style Guide](https://developers.cloudflare.com/style-guide/)
- [Cloudflare docs site stack](https://developers.cloudflare.com/style-guide/how-we-docs/our-site/)
- [Codex + Cloudflare](https://developers.cloudflare.com/agent-setup/codex/)
- [Cloudflare Docs for Agents](https://developers.cloudflare.com/docs-for-agents/)
