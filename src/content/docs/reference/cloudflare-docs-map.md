---
title: Cloudflare 文档地图
description: 基于 Cloudflare 官方 llms.txt 的全量产品文档索引、阅读优先级和整理进度。
---

最后核对日期：2026-06-17。

本页用于承接“把 Cloudflare 官方文档系统整理一遍”的长期工作。当前已经读取：

- Cloudflare 官方总索引：[developers.cloudflare.com/llms.txt](https://developers.cloudflare.com/llms.txt)
- 103 个产品 / 文档集合的产品级 `llms.txt`
- 这些产品级索引合计覆盖 6,145 个官方 Markdown 页面

这不是复制官方文档全文，而是把官方文档先整理成可读、可维护、可逐步精读的地图。后续每个产品专题都会按“解决什么问题、免费/付费边界、普通项目是否需要、常见组合、关键官方页面”继续扩写。

## 阅读优先级

| 优先级 | 产品域 | 为什么先读 |
| --- | --- | --- |
| P0 | Fundamentals、Billing、DNS、SSL/TLS、Cache、WAF、DDoS、Rules | 所有项目都会碰到入口、域名、安全、缓存和账单。 |
| P0 | Workers、Static Assets、Pages、D1、KV、R2、Queues、Durable Objects | 独立开发者最常用的开发者平台主线。 |
| P1 | AI Gateway、Workers AI、AI Search、Vectorize、Agents、Browser Run | AI 应用和搜索能力主线。 |
| P1 | Analytics、Web Analytics、Logs、Log Explorer、GraphQL、Notifications | 观测、日志和问题定位。 |
| P1 | Turnstile、API Shield、Bots、Security Center、Secrets Store、Access / Tunnel | 表单、API、后台和密钥安全。 |
| P2 | Images、Stream、Realtime、Hyperdrive、Workflows、Pipelines、Containers | 有明确业务形态后再深入。 |
| P2 | Terraform、Pulumi、Reference Architecture、Migration Guides、Learning Paths | 团队化、迁移和基础设施即代码。 |
| P3 | Web3、China Network、Magic Transit、BYOIP、Cloudflare WAN、Network Interconnect | 更偏企业、网络或特定场景。 |

## 总览统计

| 官方分类 | 产品 / 文档集合数 | 索引页数 |
| --- | ---: | ---: |
| Application performance | 15 | 580 |
| Application security | 12 | 540 |
| Cloudflare One | 5 | 851 |
| Consumer services | 3 | 72 |
| Core platform | 21 | 948 |
| Developer platform | 35 | 2,496 |
| Docs collections | 1 | 322 |
| Network security | 5 | 94 |
| Other | 6 | 242 |
| 合计 | 103 | 6,145 |

## Application Performance

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [Argo Smart Routing](https://developers.cloudflare.com/argo-smart-routing/llms.txt) | 4 | 全球链路优化，普通项目先不急。 |
| [Automatic Platform Optimization](https://developers.cloudflare.com/automatic-platform-optimization/llms.txt) | 14 | WordPress 站点专项优化。 |
| [Cache / CDN](https://developers.cloudflare.com/cache/llms.txt) | 77 | 必读，静态资源、HTML 缓存、Cache Rules 都在这里。 |
| [China Network](https://developers.cloudflare.com/china-network/llms.txt) | 9 | 面向中国大陆访问优化，通常是企业需求。 |
| [DNS](https://developers.cloudflare.com/dns/llms.txt) | 129 | 必读，域名接入、记录、代理状态、DNSSEC 都在这里。 |
| [Google tag gateway for advertisers](https://developers.cloudflare.com/google-tag-gateway/llms.txt) | 1 | 广告和标签数据治理场景。 |
| [Health Checks](https://developers.cloudflare.com/health-checks/llms.txt) | 6 | 多源站或负载均衡时再看。 |
| [Load Balancing](https://developers.cloudflare.com/load-balancing/llms.txt) | 59 | 多区域源站、故障切换和权重流量。 |
| [Smart Shield](https://developers.cloudflare.com/smart-shield/llms.txt) | 19 | 源站保护能力，明确有源站压力后再看。 |
| [Spectrum](https://developers.cloudflare.com/spectrum/llms.txt) | 17 | TCP/UDP 非 HTTP 服务代理。 |
| [Speed](https://developers.cloudflare.com/speed/llms.txt) | 42 | 性能优化入口，图片、协议、浏览器体验相关。 |
| [SSL/TLS](https://developers.cloudflare.com/ssl/llms.txt) | 131 | 必读，HTTPS、证书、源站加密和 TLS 策略。 |
| [Waiting Room](https://developers.cloudflare.com/waiting-room/llms.txt) | 27 | 秒杀、活动页和流量洪峰。 |
| [Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/llms.txt) | 16 | 文档站、官网、博客优先使用。 |
| [Web3](https://developers.cloudflare.com/web3/llms.txt) | 29 | Web3 gateway 场景，普通项目低优先级。 |

## Application Security

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [API Shield](https://developers.cloudflare.com/api-shield/llms.txt) | 36 | 公开 API、移动端 API、客户数据 API 需要关注。 |
| [Bots](https://developers.cloudflare.com/bots/llms.txt) | 45 | 爬虫、撞库、黄牛、刷接口明显时再深入。 |
| [Client-side security](https://developers.cloudflare.com/client-side-security/llms.txt) | 26 | 第三方脚本风险和前端供应链安全。 |
| [Challenges](https://developers.cloudflare.com/cloudflare-challenges/llms.txt) | 17 | Challenge 平台，和 Turnstile / WAF 相关。 |
| [DDoS Protection](https://developers.cloudflare.com/ddos-protection/llms.txt) | 150 | 必读，理解 Cloudflare 免费入口层价值。 |
| [DMARC Management](https://developers.cloudflare.com/dmarc-management/llms.txt) | 5 | 邮件域名防伪，做品牌或邮件发送时看。 |
| [Firewall Rules (deprecated)](https://developers.cloudflare.com/firewall/llms.txt) | 27 | 历史资料，优先看 WAF custom rules。 |
| [Key Transparency Auditor](https://developers.cloudflare.com/key-transparency/llms.txt) | 5 | E2EE 公钥透明度，专项场景。 |
| [Secrets Store](https://developers.cloudflare.com/secrets-store/llms.txt) | 8 | 多 Worker、多环境密钥管理。 |
| [Security Center](https://developers.cloudflare.com/security-center/llms.txt) | 16 | 安全态势总览。 |
| [Turnstile](https://developers.cloudflare.com/turnstile/llms.txt) | 45 | 表单、评论、登录、防刷优先看。 |
| [WAF](https://developers.cloudflare.com/waf/llms.txt) | 160 | 必读，Custom Rules、Managed Rules、Rate Limiting 都是常用安全边界。 |

## Cloudflare One

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [Cloudflare Network Firewall](https://developers.cloudflare.com/cloudflare-network-firewall/llms.txt) | 31 | 企业网络防火墙。 |
| [Cloudflare One](https://developers.cloudflare.com/cloudflare-one/llms.txt) | 689 | Access、Gateway、WARP、Zero Trust 总入口；后台保护优先看 Access/Tunnel。 |
| [Cloudflare WAN](https://developers.cloudflare.com/cloudflare-wan/llms.txt) | 100 | 企业 WAN 替换。 |
| [Data Localization Suite](https://developers.cloudflare.com/data-localization/llms.txt) | 25 | 数据驻留和合规。 |
| [Multi-Cloud Networking](https://developers.cloudflare.com/multi-cloud-networking/llms.txt) | 6 | 多云网络自动化。 |

## Consumer Services

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [1.1.1.1 (DNS Resolver)](https://developers.cloudflare.com/1.1.1.1/llms.txt) | 37 | 终端 DNS 解析器，偏用户侧。 |
| [Radar](https://developers.cloudflare.com/radar/llms.txt) | 23 | 互联网趋势和威胁数据查询。 |
| [WARP Client](https://developers.cloudflare.com/warp-client/llms.txt) | 12 | 终端客户端和 Zero Trust 入口。 |

## Core Platform

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [AI Crawl Control](https://developers.cloudflare.com/ai-crawl-control/llms.txt) | 28 | 控制 AI 爬虫访问。 |
| [Analytics](https://developers.cloudflare.com/analytics/llms.txt) | 93 | Cloudflare 总体分析能力。 |
| [Billing](https://developers.cloudflare.com/billing/llms.txt) | 33 | 必读，账单、预算、用量和订阅。 |
| [Cloudflare Fundamentals](https://developers.cloudflare.com/fundamentals/llms.txt) | 126 | 必读，账号、zone、proxy、规则等基础概念。 |
| [Log Explorer](https://developers.cloudflare.com/log-explorer/llms.txt) | 9 | Dashboard 日志查询。 |
| [Logs](https://developers.cloudflare.com/logs/llms.txt) | 97 | Logpush、日志字段和外部日志目的地。 |
| [Network](https://developers.cloudflare.com/network/llms.txt) | 9 | 网络设置。 |
| [Notifications](https://developers.cloudflare.com/notifications/llms.txt) | 10 | 告警通知。 |
| [Pulumi](https://developers.cloudflare.com/pulumi/llms.txt) | 7 | Pulumi 管理 Cloudflare。 |
| [Randomness Beacon](https://developers.cloudflare.com/randomness-beacon/llms.txt) | 9 | drand 随机数。 |
| [Reference Architecture](https://developers.cloudflare.com/reference-architecture/llms.txt) | 71 | 架构图和企业级集成参考。 |
| [Registrar](https://developers.cloudflare.com/registrar/llms.txt) | 22 | 域名注册和续费。 |
| [Resource Tagging](https://developers.cloudflare.com/resource-tagging/llms.txt) | 7 | 资源标签、权限和账单归因。 |
| [Rules](https://developers.cloudflare.com/rules/llms.txt) | 183 | 必读，Redirect、Transform、Cache、Origin、Configuration Rules 等。 |
| [Ruleset Engine](https://developers.cloudflare.com/ruleset-engine/llms.txt) | 43 | 规则底层模型，WAF/Rules 深入时看。 |
| [Support](https://developers.cloudflare.com/support/llms.txt) | 112 | 支持、故障和排错。 |
| [Tenant](https://developers.cloudflare.com/tenant/llms.txt) | 9 | 多租户账号管理。 |
| [Terraform](https://developers.cloudflare.com/terraform/llms.txt) | 29 | 团队化和 IaC 优先看。 |
| [Time Services](https://developers.cloudflare.com/time-services/llms.txt) | 9 | NTP/NTS/Roughtime。 |
| [Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/llms.txt) | 31 | 内网服务暴露和后台保护常用。 |
| [Version Management](https://developers.cloudflare.com/version-management/llms.txt) | 11 | 配置版本、灰度和回滚。 |

## Developer Platform

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [Agent Lee](https://developers.cloudflare.com/agent-lee/llms.txt) | 1 | Dashboard 内置 AI 助手。 |
| [Agent Memory](https://developers.cloudflare.com/agent-memory/llms.txt) | 8 | Agent 记忆能力。 |
| [Agents](https://developers.cloudflare.com/agents/llms.txt) | 92 | 构建有状态 AI Agent、MCP、实时交互。 |
| [AI](https://developers.cloudflare.com/ai/llms.txt) | 13 | Cloudflare AI 总入口。 |
| [AI Gateway](https://developers.cloudflare.com/ai-gateway/llms.txt) | 83 | AI 请求观测、缓存、限流、fallback；AI 项目优先。 |
| [AI Search](https://developers.cloudflare.com/ai-search/llms.txt) | 51 | 托管 RAG 和自然语言搜索。 |
| [Artifacts](https://developers.cloudflare.com/artifacts/llms.txt) | 24 | 文件树、构建产物、Agent 工作区。 |
| [Browser Run](https://developers.cloudflare.com/browser-run/llms.txt) | 46 | 截图、PDF、抓取、浏览器自动化。 |
| [Cloudflare for Platforms](https://developers.cloudflare.com/cloudflare-for-platforms/llms.txt) | 87 | 多租户平台和 Workers for Platforms。 |
| [Containers](https://developers.cloudflare.com/containers/llms.txt) | 28 | Worker 无法覆盖的容器运行时。 |
| [D1](https://developers.cloudflare.com/d1/llms.txt) | 52 | 独立开发者必读，Serverless SQL。 |
| [Durable Objects](https://developers.cloudflare.com/durable-objects/llms.txt) | 52 | 强一致对象、房间、WebSocket、限流器。 |
| [Dynamic Workers](https://developers.cloudflare.com/dynamic-workers/llms.txt) | 15 | 动态加载用户代码。 |
| [Email Service](https://developers.cloudflare.com/email-service/llms.txt) | 38 | 事务邮件发送和邮件路由。 |
| [Flagship](https://developers.cloudflare.com/flagship/llms.txt) | 15 | 边缘 feature flags。 |
| [Hyperdrive](https://developers.cloudflare.com/hyperdrive/llms.txt) | 55 | 连接外部 Postgres/MySQL。 |
| [Cloudflare Images](https://developers.cloudflare.com/images/llms.txt) | 56 | 图片存储、变换和分发。 |
| [KV](https://developers.cloudflare.com/kv/llms.txt) | 29 | 读多写少的全局 key-value。 |
| [MoQ](https://developers.cloudflare.com/moq/llms.txt) | 3 | Live media 协议。 |
| [Pages](https://developers.cloudflare.com/pages/llms.txt) | 118 | 静态站和 Pages Functions，理解和 Workers Static Assets 的边界。 |
| [Pipelines](https://developers.cloudflare.com/pipelines/llms.txt) | 32 | 实时数据流进 R2。 |
| [Privacy Gateway](https://developers.cloudflare.com/privacy-gateway/llms.txt) | 6 | Oblivious HTTP。 |
| [Privacy Proxy](https://developers.cloudflare.com/privacy-proxy/llms.txt) | 12 | MASQUE forward proxy。 |
| [Queues](https://developers.cloudflare.com/queues/llms.txt) | 38 | 异步任务和削峰。 |
| [R2](https://developers.cloudflare.com/r2/llms.txt) | 97 | 对象存储和 S3 兼容，独立开发者必读。 |
| [R2 SQL](https://developers.cloudflare.com/r2-sql/llms.txt) | 15 | 查询 R2 Data Catalog 数据。 |
| [Realtime](https://developers.cloudflare.com/realtime/llms.txt) | 712 | RealtimeKit、SFU、TURN，实时音视频方向。 |
| [Sandbox SDK](https://developers.cloudflare.com/sandbox/llms.txt) | 62 | 安全代码执行环境。 |
| [Stream](https://developers.cloudflare.com/stream/llms.txt) | 64 | 视频存储、编码、播放。 |
| [Vectorize](https://developers.cloudflare.com/vectorize/llms.txt) | 21 | 向量数据库和语义检索。 |
| [Workers](https://developers.cloudflare.com/workers/llms.txt) | 415 | 必读，Cloudflare 开发者平台核心。 |
| [Workers AI](https://developers.cloudflare.com/workers-ai/llms.txt) | 59 | 模型推理、embedding、价格和模型列表。 |
| [Workers VPC](https://developers.cloudflare.com/workers-vpc/llms.txt) | 17 | Worker 连接私有网络。 |
| [Workflows](https://developers.cloudflare.com/workflows/llms.txt) | 33 | 长流程、重试、状态编排。 |
| [Zaraz](https://developers.cloudflare.com/zaraz/llms.txt) | 47 | 第三方脚本和标签治理。 |

## Docs Collections

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [Learning Paths](https://developers.cloudflare.com/learning-paths/llms.txt) | 322 | 官方学习路径，适合反推本站教程路线。 |

## Network Security

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [BYOIP](https://developers.cloudflare.com/byoip/llms.txt) | 20 | 自带 IP 段，企业网络场景。 |
| [Magic Transit](https://developers.cloudflare.com/magic-transit/llms.txt) | 44 | L3/L4 网络防护。 |
| [Network Error Logging](https://developers.cloudflare.com/network-error-logging/llms.txt) | 4 | 网络错误报告。 |
| [Network Flow](https://developers.cloudflare.com/network-flow/llms.txt) | 21 | 网络流量分析。 |
| [Network Interconnect](https://developers.cloudflare.com/network-interconnect/llms.txt) | 5 | 私有互联。 |

## Other

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [Agent setup](https://developers.cloudflare.com/agent-setup/llms.txt) | 7 | Codex、Claude Code、Cursor 等接入 Cloudflare。 |
| [Docs for agents](https://developers.cloudflare.com/docs-for-agents/llms.txt) | 1 | AI agent 如何读取 Cloudflare 文档。 |
| [Migration Guides](https://developers.cloudflare.com/migration-guides/llms.txt) | 1 | 从其他平台迁移。 |
| [Security dashboard](https://developers.cloudflare.com/security/llms.txt) | 10 | Security dashboard 新 UI。 |
| [Style Guide](https://developers.cloudflare.com/style-guide/llms.txt) | 164 | 贡献 Cloudflare docs 的写作规范。 |
| [Use cases](https://developers.cloudflare.com/use-cases/llms.txt) | 59 | 官方场景解决方案。 |

## 整理进度

| 状态 | 范围 | 说明 |
| --- | --- | --- |
| 已完成 | 官方总索引 | 已读取 `developers.cloudflare.com/llms.txt` 并按 9 个官方分类归档。 |
| 已完成 | 产品级索引 | 已读取 103 个产品级 `llms.txt`，统计出 6,145 个官方 Markdown 页面。 |
| 已完成首版 | Workers 精读 | 已整理运行模型、Static Assets、免费/付费边界、配置习惯、代码习惯和开源参考。 |
| 已完成首版 | D1 精读 | 已整理 Serverless SQL 定位、免费/付费边界、索引、迁移、备份、Read Replication 和开源参考。 |
| 已完成首版 | KV 精读 | 已整理读多写少模型、免费/付费边界、最终一致、cacheTtl、API 习惯、批量操作和开源参考。 |
| 已完成首版 | R2 精读 | 已整理对象存储定位、免费/付费边界、Class A/B、一致性、Workers API、公开访问、签名 URL 和开源参考。 |
| 已完成首版 | Durable Objects 精读 | 已整理单实体强一致状态、免费/付费边界、SQLite storage、WebSocket Hibernation、Alarms、迁移和开源参考。 |
| 已完成首版 | Queues 精读 | 已整理异步任务定位、免费/付费边界、at least once、批处理、重试、死信队列、Pull Consumer 和开源参考。 |
| 已完成首版 | Workers Static Assets 精读 | 已整理静态资产免费边界、文件限制、路由模型、ASSETS binding、`_headers` / `_redirects`、Pages 取舍和开源参考。 |
| 已完成首版 | Pages 精读 | 已整理 Git 部署、预览部署、Direct Upload、免费边界、Pages Functions、`_routes.json`、Advanced Mode、域名和开源参考。 |
| 已完成首版 | DNS 精读 | 已整理 DNS query 免费边界、records/zone 限制、Full/Partial/Secondary setup、proxy status、TTL、DNSSEC、CNAME flattening、Wildcard 和迁移清单。 |
| 已完成首版 | SSL/TLS 精读 | 已整理 Universal SSL、Origin CA、Full (strict)、HTTPS 重定向、HSTS、TLS 1.3、Authenticated Origin Pulls、常见错误和开源参考。 |
| 已完成首版 | Cache / CDN 精读 | 已整理默认缓存行为、Cache Rules、TTL、Purge、Workers Cache API、Cache Reserve、计划边界和开源参考。 |
| 已完成首版 | WAF 精读 | 已整理 Custom Rules、Managed Rules、Rate Limiting、Ruleset Engine、Skip/Allow、误伤排查、计划边界和开源参考。 |
| 已完成首版 | DDoS Protection 精读 | 已整理 unmetered DDoS、HTTP DDoS、Network-layer DDoS、Under Attack、源站保护、误伤排查、计划边界和开源参考。 |
| 已完成首版 | Billing 精读 | 已整理账单类型、免费额度入口、Workers Paid、usage-based billing、Billable Usage dashboard、Budget alerts、threshold billing、权限、发票和开源参考。 |
| 已完成首版 | Rules 精读 | 已整理 Redirects、Transform、Configuration、Origin、Snippets、Cloud Connector、Custom Errors、Page Rules 迁移、执行顺序、Trace 排查、计划边界和开源参考。 |
| 已完成首版 | Fundamentals 精读 | 已整理 Profile / Account / Zone、域名接入、Proxied / DNS-only、源站保护、成员权限、API Token、Ray ID、请求头、`/cdn-cgi/`、连接限制、端口和 Under Attack。 |
| 已完成首版 | AI 产品精读 | 已整理 AI Gateway、Workers AI、AI Search、Vectorize、Agents SDK 的定位、免费/付费边界、搜索路线、常见误区和开源参考。 |
| 进行中 | P1 产品精读 | 观测、日志、安全增强、媒体、企业网络、迁移和 IaC。 |
| 待开始 | 后续专题 | P2/P3 产品、迁移指南、参考架构、Terraform / Pulumi 和更多真实案例。 |

## 整理规则

- 每篇专题都要写最后核对日期。
- 官方事实、个人判断和本站实践分开写。
- 价格、额度、限制、配置字段只引用官方页面。
- 不复制官方正文，改写成普通项目的判断框架。
- 遇到 Enterprise、Beta、Deprecated、Preview，要显式标注边界。

## 事实来源

- [Cloudflare Developer Documentation llms.txt](https://developers.cloudflare.com/llms.txt)
- [Cloudflare Fundamentals llms.txt](https://developers.cloudflare.com/fundamentals/llms.txt)
- [Cloudflare Billing llms.txt](https://developers.cloudflare.com/billing/llms.txt)
- [Cloudflare Rules llms.txt](https://developers.cloudflare.com/rules/llms.txt)
- [Cloudflare Ruleset Engine llms.txt](https://developers.cloudflare.com/ruleset-engine/llms.txt)
- [Cloudflare AI Gateway llms.txt](https://developers.cloudflare.com/ai-gateway/llms.txt)
- [Cloudflare Workers AI llms.txt](https://developers.cloudflare.com/workers-ai/llms.txt)
- [Cloudflare AI Search llms.txt](https://developers.cloudflare.com/ai-search/llms.txt)
- [Cloudflare Vectorize llms.txt](https://developers.cloudflare.com/vectorize/llms.txt)
- [Cloudflare Agents llms.txt](https://developers.cloudflare.com/agents/llms.txt)
- [Docs for agents](https://developers.cloudflare.com/docs-for-agents/)
- [Cloudflare Docs for Agents llms.txt](https://developers.cloudflare.com/docs-for-agents/llms.txt)
