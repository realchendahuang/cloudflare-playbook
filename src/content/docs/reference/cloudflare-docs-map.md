---
title: Cloudflare 文档地图
description: 基于 Cloudflare 官方 llms.txt 的全量产品文档索引、阅读优先级和整理进度。
---

最后核对日期：2026-06-18。

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
| [Argo Smart Routing](https://developers.cloudflare.com/argo-smart-routing/llms.txt) | 4 | 已完成首版专题；Paid add-on，Smart Shield，回源路径优化和 Argo for Packets。 |
| [Automatic Platform Optimization](https://developers.cloudflare.com/automatic-platform-optimization/llms.txt) | 14 | 已完成首版专题；WordPress 动态 HTML 边缘缓存、插件、价格和验证头。 |
| [Cache / CDN](https://developers.cloudflare.com/cache/llms.txt) | 77 | 已完成首版专题；默认缓存行为、Cache Rules、Edge / Browser TTL、Purge by URL、Tiered Cache、Cache Reserve 和 Workers Cache API。 |
| [China Network](https://developers.cloudflare.com/china-network/llms.txt) | 9 | 已完成首版专题；Enterprise separate subscription、ICP、IPv6、JD Cloud 和可用产品边界。 |
| [DNS](https://developers.cloudflare.com/dns/llms.txt) | 129 | 已完成首版专题；DNS query 免费边界、records/zone、Proxied / DNS-only、TTL、DNSSEC、CNAME flattening、Wildcard 和迁移清单。 |
| [Google tag gateway for advertisers](https://developers.cloudflare.com/google-tag-gateway/llms.txt) | 1 | 已完成首版专题；免费第一方 Google tag gateway、zone-level 配置和子域名限制。 |
| [Health Checks](https://developers.cloudflare.com/health-checks/llms.txt) | 6 | 已完成首版专题；Standalone Health Checks，Pro 起可用，和 LB monitors 区分。 |
| [Load Balancing](https://developers.cloudflare.com/load-balancing/llms.txt) | 59 | 已完成首版专题；paid add-on，多源站、health monitors、traffic steering、PNLB。 |
| [Smart Shield](https://developers.cloudflare.com/smart-shield/llms.txt) | 19 | 已完成首版专题；Smart Tiered Cache、Connection Reuse、Argo、Cache Reserve 和 Dedicated CDN Egress IPs。 |
| [Spectrum](https://developers.cloudflare.com/spectrum/llms.txt) | 17 | 已完成首版专题；paid plans，TCP/UDP 非 HTTP 代理，协议/计划/限制。 |
| [Speed](https://developers.cloudflare.com/speed/llms.txt) | 42 | 已完成首版专题；Observatory、RUM、Origin Analytics、synthetic tests、Core Web Vitals 和性能建议。 |
| [SSL/TLS](https://developers.cloudflare.com/ssl/llms.txt) | 131 | 已完成首版专题；Universal SSL、Origin CA、Full (strict)、Automatic SSL/TLS、HTTPS 重定向、HSTS、TLS 1.3 和 AOP。 |
| [Waiting Room](https://developers.cloudflare.com/waiting-room/llms.txt) | 27 | 已完成首版专题；Business 起可用，合法峰值排队、events、queueing methods 和 JSON response。 |
| [Cloudflare Web Analytics](https://developers.cloudflare.com/web-analytics/llms.txt) | 16 | 已完成首版专题；available on all plans、proxied sites no limit、non-proxied 10 sites、rules limits 和 RUM 边界。 |
| [Web3](https://developers.cloudflare.com/web3/llms.txt) | 29 | 已完成首版专题；IPFS / Ethereum paid add-on、included usage、limits 和 gateway 访问控制。 |

## Application Security

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [API Shield](https://developers.cloudflare.com/api-shield/llms.txt) | 36 | 已完成首版专题；Endpoint Management、Schema validation、Free 100 endpoints / 5 schemas / 200 kB、Enterprise API Shield 边界。 |
| [Bots](https://developers.cloudflare.com/bots/llms.txt) | 45 | 已完成首版专题；Bot Fight Mode、Super Bot Fight Mode、Enterprise Bot Management、AI bots、AI Labyrinth、robots.txt 和 bot score 边界。 |
| [Client-side security](https://developers.cloudflare.com/client-side-security/llms.txt) | 26 | 已完成首版专题；script monitoring、alerts、content security rules、Advanced 能力和前端供应链边界。 |
| [Challenges](https://developers.cloudflare.com/cloudflare-challenges/llms.txt) | 17 | 已完成首版专题；Challenge Pages、Turnstile、JavaScript Detections、`cf_clearance`、Challenge Passage 和 challenge loop 限制。 |
| [DDoS Protection](https://developers.cloudflare.com/ddos-protection/llms.txt) | 150 | 已完成首版专题；all plans unmetered L3/L4/L7 防护、HTTP DDoS managed ruleset、overrides、Adaptive DDoS、Under Attack、origin protection。 |
| [DMARC Management](https://developers.cloudflare.com/dmarc-management/llms.txt) | 5 | 已完成首版专题；SPF、DKIM、DMARC、reports、DNS lookup limits 和 Cloudflare DNS 边界。 |
| [Firewall Rules (deprecated)](https://developers.cloudflare.com/firewall/llms.txt) | 27 | 已完成首版专题；旧 Filters / Firewall Rules API 迁移资料，新项目改用 WAF Custom Rules / Ruleset Engine。 |
| [Key Transparency Auditor](https://developers.cloudflare.com/key-transparency/llms.txt) | 5 | 已完成首版专题；E2EE public key distribution、append-only log、auditor API、epoch / namespace、本地验证边界。 |
| [Secrets Store](https://developers.cloudflare.com/secrets-store/llms.txt) | 8 | 已完成首版专题；open beta、账号级密钥中心、Workers / AI Gateway integration、China Network 不可用。 |
| [Security Center](https://developers.cloudflare.com/security-center/llms.txt) | 16 | 已完成首版专题；Security Insights 自动扫描、Free 7 天、Pro/Business 3 天、Enterprise daily、findings 巡检。 |
| [Turnstile](https://developers.cloudflare.com/turnstile/llms.txt) | 45 | 已完成首版专题；Free 20 widgets、10 hostnames/widget、unlimited challenges、Siteverify、token 5 分钟单次验证。 |
| [WAF](https://developers.cloudflare.com/waf/llms.txt) | 160 | 已完成首版专题；Custom Rules、Managed Rules、Rate Limiting、phases、Security Events、Skip / exception、计划边界和误伤排查。 |

## Cloudflare One

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [Cloudflare Network Firewall](https://developers.cloudflare.com/cloudflare-network-firewall/llms.txt) | 31 | 已完成首版专题；FWaaS、IDS、packet captures、Magic Transit / Cloudflare WAN 关系和普通项目不默认使用的边界。 |
| [Cloudflare One](https://developers.cloudflare.com/cloudflare-one/llms.txt) | 689 | 已完成首版专题；Access、Gateway、Tunnel、Cloudflare One Client、Zero Trust Free / Paid 边界和后台保护顺序。 |
| [Cloudflare WAN](https://developers.cloudflare.com/cloudflare-wan/llms.txt) | 100 | 已完成首版专题；Enterprise-only、站点网络、on-ramps、Network Firewall 关系和普通项目取舍。 |
| [Data Localization Suite](https://developers.cloudflare.com/data-localization/llms.txt) | 25 | 已完成首版专题；Enterprise-only paid add-on、Geo Key Manager、CMB、Regional Services 和 compatibility。 |
| [Multi-Cloud Networking](https://developers.cloudflare.com/multi-cloud-networking/llms.txt) | 6 | 已完成首版专题；Cloudflare One closed beta / Enterprise-only、多云资源发现、AWS / Azure / GCP on-ramp、Cloudflare WAN、resource catalog 和 Terraform 变更审阅。 |

## Consumer Services

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [1.1.1.1 (DNS Resolver)](https://developers.cloudflare.com/1.1.1.1/llms.txt) | 37 | 已完成首版专题；public resolver、Families、DoH / DoT / ODoH、IP 地址和隐私边界。 |
| [Radar](https://developers.cloudflare.com/radar/llms.txt) | 23 | 已完成首版专题；Radar dashboard/API、免费 API、URL Scanner、趋势和威胁数据。 |
| [WARP Client](https://developers.cloudflare.com/warp-client/llms.txt) | 12 | 已完成首版专题；Cloudflare One Client、Traffic and DNS mode、DNS-only mode、device posture 和 Gateway 策略入口。 |

## Core Platform

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [AI Crawl Control](https://developers.cloudflare.com/ai-crawl-control/llms.txt) | 28 | 已完成首版专题；available on all plans、AI crawler analytics、robots.txt compliance、crawler allow/block、Pay Per Crawl private beta。 |
| [Analytics](https://developers.cloudflare.com/analytics/llms.txt) | 93 | 已完成首版专题；Dashboard Analytics、GraphQL Analytics API、ABR sampling、Analytics Engine、integration 和账单口径边界。 |
| [Billing](https://developers.cloudflare.com/billing/llms.txt) | 33 | 已完成首版专题；账单类型、Workers Paid、usage-based billing、Billable Usage、Budget alerts、threshold billing、权限和发票。 |
| [Cloudflare Fundamentals](https://developers.cloudflare.com/fundamentals/llms.txt) | 126 | 已完成首版专题；Profile / Account / Zone、Full DNS setup、Proxied / DNS-only、源站保护、API Token、Ray ID、请求头和连接限制。 |
| [Log Explorer](https://developers.cloudflare.com/log-explorer/llms.txt) | 9 | 已完成首版专题；paid add-on、无免费版、按 ingest / stored GB 计费、查询不额外收费、datasets / SQL / API。 |
| [Logs](https://developers.cloudflare.com/logs/llms.txt) | 97 | 已完成首版专题；Logpush、datasets、destinations、4 jobs/zone、no backfill、Workers Trace Events Logpush 例外。 |
| [Network](https://developers.cloudflare.com/network/llms.txt) | 9 | 已完成首版专题；gRPC、IP Geolocation、IPv6、WebSockets、Pseudo IPv4、True-Client-IP、Onion Routing 和计划边界。 |
| [Notifications](https://developers.cloudflare.com/notifications/llms.txt) | 10 | 已完成首版专题；available on all plans、Free email、Pro+ webhooks、Business+ PagerDuty、traffic alerts 和 notification history。 |
| [Pulumi](https://developers.cloudflare.com/pulumi/llms.txt) | 7 | 已完成首版专题；Pulumi Cloudflare provider、Pulumi + Wrangler、ESC secrets、D1 migrations 和 Terraform 取舍。 |
| [Randomness Beacon](https://developers.cloudflare.com/randomness-beacon/llms.txt) | 9 | 已完成首版专题；drand 公共随机数、公开可验证随机性、适用场景和 GitHub 开源参考。 |
| [Reference Architecture](https://developers.cloudflare.com/reference-architecture/llms.txt) | 71 | 已完成首版专题；Reference Architectures、Design Guides、Implementation Guides、diagrams 和小项目降维使用。 |
| [Registrar](https://developers.cloudflare.com/registrar/llms.txt) | 22 | 已完成首版专题；at-cost registration、renewal、DNSSEC、WHOIS redaction、supported TLDs 和企业域名保护。 |
| [Resource Tagging](https://developers.cloudflare.com/resource-tagging/llms.txt) | 7 | 已完成首版专题；all plans、public beta、10,000 tags/account、API 限制和资源归因实践。 |
| [Rules](https://developers.cloudflare.com/rules/llms.txt) | 183 | 已完成首版专题；Redirect、Transform、Configuration、Origin、Cache、Snippets、Cloud Connector、Custom Errors、Trace 和 Page Rules 迁移。 |
| [Ruleset Engine](https://developers.cloudflare.com/ruleset-engine/llms.txt) | 43 | 已完成首版专题；phases、rulesets、rules、actions、expressions、execute / skip / override 和 Terraform 管理边界。 |
| [Support](https://developers.cloudflare.com/support/llms.txt) | 112 | 已完成首版专题；support channels、Free / paid plan 边界、case 信息清单、SLA / SLO 和状态页。 |
| [Tenant](https://developers.cloudflare.com/tenant/llms.txt) | 9 | 已完成首版专题；Channel / Alliance partner provisioning，和普通 SaaS 多租户区分。 |
| [Terraform](https://developers.cloudflare.com/terraform/llms.txt) | 29 | 已完成首版专题；provider、best practices、cf-terraforming、import、R2 remote state、ruleset `ref` 和 Wrangler 边界。 |
| [Time Services](https://developers.cloudflare.com/time-services/llms.txt) | 9 | 已完成首版专题；NTP、NTS、Roughtime 和系统时间同步边界。 |
| [Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/llms.txt) | 31 | 已完成首版专题；published applications、private networks、Access 关系、cloudflared replicas 和源站不暴露公网。 |
| [Version Management](https://developers.cloudflare.com/version-management/llms.txt) | 11 | 已完成首版专题；Enterprise-only、dashboard-only、staging / rollback、Terraform 和 Wrangler 限制。 |

## Developer Platform

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [Agent Lee](https://developers.cloudflare.com/agent-lee/llms.txt) | 1 | 已完成首版专题；Free plan beta、Dashboard AI co-pilot、account-aware answers、写操作审批和网络诊断。 |
| [Agent Memory](https://developers.cloudflare.com/agent-memory/llms.txt) | 8 | 已完成首版专题；private beta、暂不计费、30 天通知、ingest / recall limits 和 Agent 记忆边界。 |
| [Agents](https://developers.cloudflare.com/agents/llms.txt) | 92 | 已完成首版专题；有状态 Agent、Durable Objects runtime、MCP / tools、WebSocket、scheduled work、1 GB state 和 AI Search / Vectorize 组合。 |
| [AI](https://developers.cloudflare.com/ai/llms.txt) | 13 | 已完成首版专题；AI Gateway、Workers AI、AI Search、Vectorize、Agents SDK 的总入口和普通项目选型顺序。 |
| [AI Gateway](https://developers.cloudflare.com/ai-gateway/llms.txt) | 83 | 已完成首版专题；all plans core features free、persistent logs、caching、rate limiting、fallback、DLP / guardrails 和 Logpush。 |
| [AI Search](https://developers.cloudflare.com/ai-search/llms.txt) | 51 | 已完成首版专题；托管 RAG、built-in storage / vector index、web crawling、Free / Paid limits、hybrid search、MCP endpoint 和 UI snippet。 |
| [Artifacts](https://developers.cloudflare.com/artifacts/llms.txt) | 24 | 已完成首版专题；Workers Paid repo artifacts、Git protocol、ArtifactFS、pricing、limits、namespaces/repos。 |
| [Browser Run](https://developers.cloudflare.com/browser-run/llms.txt) | 46 | 已完成首版专题；Free 10 minutes/day、Paid 10 hours/month、Playwright / Puppeteer / CDP、Quick Actions、`/crawl` 和 Queues / R2 组合。 |
| [Cloudflare for Platforms](https://developers.cloudflare.com/cloudflare-for-platforms/llms.txt) | 87 | 已完成首版专题；Cloudflare for SaaS、Workers for Platforms、custom hostnames、dispatch namespace、isolation、limits / pricing。 |
| [Containers](https://developers.cloudflare.com/containers/llms.txt) | 28 | 已完成首版专题；Workers Paid、instance types、GiB-hours / vCPU-minutes / disk、egress、Durable Objects / logs 叠加成本和运行时补位。 |
| [D1](https://developers.cloudflare.com/d1/llms.txt) | 52 | 已完成首版专题；Serverless SQL、Free 5M rows read / 100k rows written / day、Workers Paid 月额度、索引、迁移、备份和 Read Replication。 |
| [Durable Objects](https://developers.cloudflare.com/durable-objects/llms.txt) | 52 | 已完成首版专题；单实体强一致、SQLite-backed DO、requests / GB-s、WebSocket Hibernation、Alarms、storage billing 和迁移。 |
| [Dynamic Workers](https://developers.cloudflare.com/dynamic-workers/llms.txt) | 15 | 已完成首版专题；运行时代码加载、stable ID、unique Dynamic Workers/day、capability bindings、globalOutbound、AI code mode 和 sandbox 边界。 |
| [Email Service](https://developers.cloudflare.com/email-service/llms.txt) | 38 | 已完成首版专题；Email Routing Free/Paid、Email Sending Workers Paid、3,000 outbound/month、inbound unlimited、limits。 |
| [Flagship](https://developers.cloudflare.com/flagship/llms.txt) | 15 | 已完成首版专题；edge feature flags、Workers binding、OpenFeature SDK、local evaluation、limits。 |
| [Hyperdrive](https://developers.cloudflare.com/hyperdrive/llms.txt) | 55 | 已完成首版专题；外部 Postgres / MySQL、连接池、查询缓存、100k queries/day Free、Paid unlimited 和 D1 取舍。 |
| [Cloudflare Images](https://developers.cloudflare.com/images/llms.txt) | 56 | 已完成首版专题；Images transformations、storage / delivery pricing、5,000 unique transformations、R2 原图和安全限制。 |
| [KV](https://developers.cloudflare.com/kv/llms.txt) | 29 | 已完成首版专题；读多写少、Free 100k reads / 1k writes / day、eventual consistency、cacheTtl、bulk API 和 wrangler commands。 |
| [MoQ](https://developers.cloudflare.com/moq/llms.txt) | 3 | 已完成首版专题；Media over QUIC、draft feature matrix、live media 协议边界和 moq-rs。 |
| [Pages](https://developers.cloudflare.com/pages/llms.txt) | 118 | 已完成首版专题；Git 部署、预览部署、Direct Upload、Free 500 builds/month、Pages Functions、`_routes.json`、Advanced Mode 和迁移边界。 |
| [Pipelines](https://developers.cloudflare.com/pipelines/llms.txt) | 32 | 已完成首版专题；streams、SQL transforms、R2 JSON / Parquet / Iceberg sinks、open beta、pricing / limits 和数据湖边界。 |
| [Privacy Gateway](https://developers.cloudflare.com/privacy-gateway/llms.txt) | 6 | 已完成首版专题；OHTTP relay、Enterprise-only、closed beta、隐私边界和 limitations。 |
| [Privacy Proxy](https://developers.cloudflare.com/privacy-proxy/llms.txt) | 12 | 已完成首版专题；MASQUE forward proxy、Enterprise managed service、single-hop / double-hop 和隐私分离模型。 |
| [Queues](https://developers.cloudflare.com/queues/llms.txt) | 38 | 已完成首版专题；Free 10k operations/day、operations 计费、at least once、batching、retries、DLQ、Pull consumers 和 metrics。 |
| [R2](https://developers.cloudflare.com/r2/llms.txt) | 97 | 已完成首版专题；Standard storage free tier、Class A / B、无 egress charge、Workers API、public buckets、signed URLs、consistency 和 lifecycle。 |
| [R2 SQL](https://developers.cloudflare.com/r2-sql/llms.txt) | 15 | 已完成首版专题；R2 Data Catalog SQL engine、open beta、1 GB / 10 GB data scanned、`$0.0025/GB`、read-only limitations。 |
| [Realtime](https://developers.cloudflare.com/realtime/llms.txt) | 712 | 已完成首版专题；RealtimeKit、SFU、TURN 和 Durable Objects WebSocket 的边界、价格与落地顺序。 |
| [Sandbox SDK](https://developers.cloudflare.com/sandbox/llms.txt) | 62 | 已完成首版专题；Workers + Containers secure code execution、pricing inherits Containers、subrequest limits、RPC transport、GitHub SDK。 |
| [Stream](https://developers.cloudflare.com/stream/llms.txt) | 64 | 已完成首版专题；视频上传、编码、播放、直播、signed URLs、按 minutes stored / delivered 计费和 R2 取舍。 |
| [Vectorize](https://developers.cloudflare.com/vectorize/llms.txt) | 21 | 已完成首版专题；queried / stored vector dimensions、metadata、namespace、topK、batch upsert、自定义 RAG 和 AI Search 取舍。 |
| [Workers](https://developers.cloudflare.com/workers/llms.txt) | 415 | 已完成首版专题；Free 100k requests/day / 10 ms CPU、Workers Paid $5 minimum、Static Assets、bindings、limits、observability、Wrangler 和开源参考。 |
| [Workers AI](https://developers.cloudflare.com/workers-ai/llms.txt) | 59 | 已完成首版专题；模型推理、embeddings、10,000 Neurons/day、per-model pricing、rate limits、binding / REST API 和 AI Gateway 组合。 |
| [Workers VPC](https://developers.cloudflare.com/workers-vpc/llms.txt) | 17 | 已完成首版专题；Worker 访问私有 API、数据库和服务，Open Beta 免费但仍按 Workers 请求/CPU。 |
| [Workflows](https://developers.cloudflare.com/workflows/llms.txt) | 33 | 已完成首版专题；durable steps、sleep、retry、waitForEvent、state retention、storage billing、Queues / Durable Objects 取舍。 |
| [Zaraz](https://developers.cloudflare.com/zaraz/llms.txt) | 47 | 已完成首版专题；第三方脚本治理、consent、1M free events/month、paid events、Monitoring 和前端性能边界。 |

## Docs Collections

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [Learning Paths](https://developers.cloudflare.com/learning-paths/llms.txt) | 322 | 已完成首版专题；官方 guided modules，可反推本站学习路线。 |

## Network Security

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [BYOIP](https://developers.cloudflare.com/byoip/llms.txt) | 20 | 已完成首版专题；自带 IP 段、address maps、service bindings、RPKI 和 route leak detection。 |
| [Magic Transit](https://developers.cloudflare.com/magic-transit/llms.txt) | 44 | 已完成首版专题；企业 IP 网络 L3/L4 DDoS、防护、tunnels、traffic steering 和 Network Firewall。 |
| [Network Error Logging](https://developers.cloudflare.com/network-error-logging/llms.txt) | 4 | 已完成首版专题；all plan types、浏览器网络失败报告、last-mile 排障、隐私和 opt-out 边界。 |
| [Network Flow](https://developers.cloudflare.com/network-flow/llms.txt) | 21 | 已完成首版专题；NetFlow/sFlow/IPFIX、free version all accounts、10 routers、25 rules、250 flows/sec、threshold practice。 |
| [Network Interconnect](https://developers.cloudflare.com/network-interconnect/llms.txt) | 5 | 已完成首版专题；Direct / Partner / Cloud Interconnect、dataplane、MTU、维护和冗余。 |

## Other

| 产品 | 页数 | 普通项目判断 |
| --- | ---: | --- |
| [Agent setup](https://developers.cloudflare.com/agent-setup/llms.txt) | 7 | 已完成首版专题；Codex、Claude Code、Cursor、GitHub Copilot、OpenCode、Windsurf 接入 Cloudflare Skills / MCP / Wrangler 的流程。 |
| [Docs for agents](https://developers.cloudflare.com/docs-for-agents/llms.txt) | 1 | 已完成首版专题；agent-friendly docs、Markdown / index.md、产品级 llms.txt、Cloudflare Docs MCP 和资料核对顺序。 |
| [Migration Guides](https://developers.cloudflare.com/migration-guides/llms.txt) | 1 | 已完成首版专题；迁移总入口、Pages to Workers、DNS / Rules / 存储 / Worker / 安全策略迁移顺序。 |
| [Security dashboard](https://developers.cloudflare.com/security/llms.txt) | 10 | 已完成首版专题；新 Security dashboard、Overview、Analytics、Web assets、Security rules、Settings、Security Insights 和 scan frequency。 |
| [Style Guide](https://developers.cloudflare.com/style-guide/llms.txt) | 164 | 已完成首版专题；Cloudflare docs writing/style IA、components、frontmatter、AI consumability 和 docs site architecture。 |
| [Use cases](https://developers.cloudflare.com/use-cases/llms.txt) | 59 | 已完成首版专题；官方跨产品 solution guides，可反推真实项目组合。 |

## 整理进度

| 状态 | 范围 | 说明 |
| --- | --- | --- |
| 已完成 | 官方总索引 | 已读取 `developers.cloudflare.com/llms.txt` 并按 9 个官方分类归档。 |
| 已完成 | 产品级索引 | 已读取 103 个产品级 `llms.txt`，统计出 6,145 个官方 Markdown 页面。 |
| 已完成首版 | Workers 精读 | 已整理运行模型、Static Assets、免费/付费边界、配置习惯、代码习惯和开源参考。 |
| 已完成复核 | Workers 文案收敛 | 已把 [Workers](/platform/workers/) 收敛为普通项目取舍、免费与付费边界、关键限制、架构分工、入口选择和常见误区；保留 Workers Pricing / Limits、How Workers works、Static Assets billing、Service bindings、Routes 和 Custom Domains 来源，删除运行模型图、fetch 代码、Wrangler 配置样例、`ctx.waitUntil()` 长说明、Node.js 兼容长表和后续精读列表。 |
| 已完成首版 | D1 精读 | 已整理 Serverless SQL 定位、免费/付费边界、索引、迁移、备份、Read Replication 和开源参考。 |
| 已完成复核 | D1 二次精读 | 已把 [D1](/platform/d1/) 收敛为适用场景、免费/付费边界、rows read/write 成本坑、设计原则、产品取舍和常见误区，保留 Pricing / Limits、Indexes、Migrations、Time Travel、Read Replication 和 GitHub 源文件索引，删除查询代码、Wrangler 命令、API 方法清单、排障长表和过细实现说明。 |
| 已完成首版 | KV 精读 | 已整理读多写少模型、免费/付费边界、最终一致、cacheTtl、API 习惯、批量操作和开源参考。 |
| 已完成复核 | KV 二次精读 | 已把 [KV](/platform/kv/) 收敛为适用场景、免费/付费边界、最终一致与同 key 写入坑、设计原则、产品取舍和常见误区，保留 Pricing / Limits、How KV works、Read / Write / List 和 GitHub 源文件索引，删除运行模型图、查询代码、Wrangler 命令、环境配置、事件订阅、排障长表和过细 API 说明。 |
| 已完成首版 | R2 精读 | 已整理对象存储定位、免费/付费边界、Class A/B、一致性、Workers API、公开访问、签名 URL 和开源参考。 |
| 已完成复核 | R2 二次精读 | 已把 [R2](/platform/r2/) 收敛为适用场景、免费/付费边界、Class A / B 成本直觉、设计原则、产品取舍和常见误区，保留 R2 Pricing / Limits、Workers API、S3 compatibility、Public buckets、Presigned URLs、Lifecycle / Storage classes 和 GitHub 源文件索引，删除 API 示例、CORS 命令、事件流程和过细排障说明。 |
| 已完成复核 | 实战案例二次精读 | 已把 Worker API + D1、R2 签名上传从案例骨架补成资源准备、配置、最小代码、验证、风险和官方 / GitHub 来源。 |
| 已完成首版 | Durable Objects 精读 | 已整理单实体强一致状态、免费/付费边界、SQLite storage、WebSocket Hibernation、Alarms、迁移和开源参考。 |
| 已完成复核 | Durable Objects 二次精读 | 已把 [Durable Objects](/platform/durable-objects/) 收敛为适用场景、免费/付费边界、成本坑、设计原则、产品取舍和常见误区，保留 Pricing / Limits、Lifecycle、WebSocket Hibernation、Migrations、FAQ 和 GitHub 源文件索引，删除运行模型、配置代码、RPC 示例、WebSocket 示例、排障长表和过细 API 说明。 |
| 已完成首版 | Queues 精读 | 已整理异步任务定位、免费/付费边界、at least once、批处理、重试、死信队列、Pull Consumer 和开源参考。 |
| 已完成复核 | Queues 二次精读 | 已把 [Queues](/platform/queues/) 收敛为适用场景、免费/付费边界、关键坑、设计原则和产品取舍，保留 Queues Pricing / Limits、Delivery guarantees、DLQ、Pull Consumers、Changelog 和 GitHub 源文件索引，删除 Producer / Consumer 代码、配置细节和生命周期长说明。 |
| 已完成首版 | Workers Static Assets 精读 | 已整理静态资产免费边界、文件限制、路由模型、ASSETS binding、`_headers` / `_redirects`、Pages 取舍和开源参考。 |
| 已完成复核 | Workers Static Assets 二次精读 | 已把 [Workers Static Assets](/platform/static-assets/) 收敛为选型、免费边界、Pages 取舍和常见误区，保留官方 pricing / limits 与 GitHub 源文件索引，删除过细代码示例和路由实现说明。 |
| 已完成复核 | Pages 文案收敛 | 已把 [Pages](/platform/pages/) 收敛为普通项目取舍、免费限制、Pages vs Workers Static Assets、部署方式、Functions 边界和常见误区；保留 Pages Limits、Functions Pricing / Routing、Advanced Mode、Direct Upload、Preview Deployments、Known Issues 和 Pages to Workers 迁移来源，删除运行模型图、Wrangler 配置样例、Functions 代码、`_routes.json` 示例、Advanced Mode 代码、静态服务行为长表、Headers / Redirects 细节和本站内部选择。 |
| 已完成首版 | DNS 精读 | 已整理 DNS query 免费边界、records/zone 限制、Full/Partial/Secondary setup、proxy status、TTL、DNSSEC、CNAME flattening、Wildcard 和迁移清单。 |
| 已完成复核 | DNS 文案收敛 | 已把 [DNS](/platform/dns/) 收敛为普通项目接入判断、免费与计划边界、Full / Partial / Secondary setup 取舍、记录放置、Proxied / DNS-only、TTL / DNSSEC / CNAME flattening / Wildcard 的最低必要判断和迁移顺序；删除运行模型图、API / curl / Terraform 示例、dig 验证命令和过细排障说明。 |
| 已完成首版 | SSL/TLS 精读 | 已整理 Universal SSL、Origin CA、Full (strict)、HTTPS 重定向、HSTS、TLS 1.3、Authenticated Origin Pulls、常见错误和开源参考。 |
| 已完成复核 | SSL/TLS 文案收敛 | 已把 [SSL/TLS](/platform/ssl-tls/) 收敛为普通项目配置顺序、免费与计划边界、加密模式选择、证书选择、HTTPS / HSTS、源站保护和常见误区；保留 Universal SSL、Origin CA、Full (strict)、Strict SSL-Only Origin Pull、Always Use HTTPS、Automatic HTTPS Rewrites、HSTS、Minimum TLS、AOP、features / plans 和 Browser compatibility 来源，删除请求链路图、验证命令、Cloudflare API 示例、服务器配置细节、过细证书工具参考和排障长表。 |
| 已完成首版 | Cache / CDN 精读 | 已整理默认缓存行为、Cache Rules、TTL、Purge、Workers Cache API、Cache Reserve、计划边界和开源参考。 |
| 已完成复核 | Cache / CDN 文案收敛 | 已把 [Cache / CDN](/platform/cache/) 收敛为普通项目缓存判断、免费与计划边界、默认缓存行为、推荐策略、Cache Rules、Purge、Tiered Cache / R2、Cache Reserve、Workers Cache API 边界和常见误区；保留 Cache plans、Get started、Default cache behavior、Origin Cache Control、Cache Rules、Purge cache、Tiered Cache、Cache Reserve、Cache Deception Armor、R2 cache 和 Workers Cache API 来源，删除请求链路图、Worker 代码、curl / API purge 示例、Cache Reserve 细节案例、过细 header 行为和排障命令。 |
| 已完成首版 | WAF 精读 | 已整理 Custom Rules、Managed Rules、Rate Limiting、Ruleset Engine、Skip/Allow、误伤排查、计划边界和开源参考。 |
| 已完成复核 | WAF 文案收敛 | 已把 [WAF](/platform/waf/) 收敛为普通项目判断、免费与计划边界、Managed Rules / Custom Rules / Rate Limiting 取舍、Skip / exception、升级信号和常见误区；保留 WAF overview、Concepts、Custom Rules、Managed Rules、Rate Limiting、Security Events、Security Analytics、WAF phases、Feature interoperability 和 troubleshooting 来源，删除请求处理流程图、Ruleset Engine 阶段图、规则表达式示例、curl / Terraform 示例、API / IaC 长段落、本站内部选择和过细排障表。 |
| 已完成首版 | DDoS Protection 精读 | 已整理 unmetered DDoS、HTTP DDoS、Network-layer DDoS、Under Attack、源站保护、误伤排查、计划边界和开源参考。 |
| 已完成复核 | DDoS Protection 文案收敛 | 已把 [DDoS Protection](/platform/ddos/) 收敛为普通项目入口判断、免费与计划边界、HTTP / Network-layer DDoS 分工、推荐默认顺序、源站保护、Under Attack 慎用、升级信号和常见误区；保留 DDoS overview、About、Attack coverage、How DDoS protection works、Managed rulesets、HTTP / Network-layer DDoS、Adaptive DDoS、Proactive defense、Analytics、Alerts、Under Attack、Protect origin 和 Cloudflare IP addresses 来源，删除请求链路图、验证命令、curl / API / Terraform 示例、DDoS managed rulesets 配置片段、本站内部选择和过细排障表。 |
| 已完成首版 | Billing 精读 | 已整理账单类型、免费额度入口、Workers Paid、usage-based billing、Billable Usage dashboard、Budget alerts、threshold billing、权限、发票和开源参考。 |
| 已完成复核 | Billing 二次精读 | 已把 [Billing](/platform/billing/) 对齐 Cloudflare Billing、How billing works、Usage-based billing、How charges accrue、Billable Usage、Budget alerts、Optimize costs、Threshold billing、Billing permissions / policy、Invoices、Cancel / Change plan、Payment failure、Additional payment method auto-retry、Stablecoin payments、Workers Pricing 和 Static Assets billing，补齐账单生命周期、请求成本路径、付款失败 / 预授权、threshold 一次触发、取消降级清单和 GitHub 源文件索引。 |
| 已完成复核 | 免费额度总览 | 已把 [首页](/) 和 [免费与付费边界](/platform/free-paid/) 对齐 Workers Pricing / Limits、DNS records quota、Cache Rules、Default cache behavior、Pages Limits、D1 Pricing、R2 Pricing、Turnstile Plans、DDoS Protection、WAF Custom Rules、Rate Limiting Rules、Workers AI、AI Gateway、AI Search、Images、Browser Run、Zaraz、Billable Usage 和 Budget alerts，补齐首页第一屏速查、免费额度大全和来源链接校正。 |
| 已完成复核 | 免费额度首页强化 | 已把 [首页](/) 改为先讲 0 元项目组合、免费额度大全、免费额度使用规则和 `$5/month` Workers Paid 买不到什么；[免费与付费边界](/platform/free-paid/) 新增先读规则，强调 Static Assets 命中、日额度 / 月额度、Budget alerts、R2 操作量、D1 扫描行数和 AI 限流。 |
| 已完成首版 | Rules 精读 | 已整理 Redirects、Transform、Configuration、Origin、Snippets、Cloud Connector、Custom Errors、Page Rules 迁移、执行顺序、Trace 排查、计划边界和开源参考。 |
| 已完成复核 | Rules 二次精读 | 已把 [Rules](/platform/rules/) 对齐 Cloudflare Rules、Ruleset Engine、Page Rules migration、Trace、Troubleshooting、Snippets vs Workers、Origin Rules 和 Cache Rules，补齐规则分层、first match vs stackable、迁移清单、raw 字段避坑、Trace / Log Explorer 边界、排查保留路径和 IaC 真源。 |
| 已完成首版 | Fundamentals 精读 | 已整理 Profile / Account / Zone、域名接入、Proxied / DNS-only、源站保护、成员权限、API Token、Ray ID、请求头、`/cdn-cgi/`、连接限制、端口和 Under Attack。 |
| 已完成复核 | Fundamentals 二次精读 | 已把 [Fundamentals](/platform/fundamentals/) 对齐 Cloudflare Fundamentals、account continuity、traffic flow、Cloudflare IPs、Onboard domain、Pause Cloudflare、Members policies / scopes、Audit Logs v2、API Token、Account API Token、Rate limits、Ray ID、HTTP headers、`/cdn-cgi/`、Error responses、Connection limits、Network ports 和 Protect origin，补齐请求路径、scope 决策、账号连续性、源站保护分层、权限叠加、自动化 token 边界和排障证据包。 |
| 已完成复核 | Fundamentals 文案收敛 | 已把 [Fundamentals](/platform/fundamentals/) 收敛为账号 / Account / Zone 三层模型、域名接入顺序、Proxied 与 DNS-only、源站保护、权限和自动化、排障证据包、产品跳转和常见误区；保留官方 Fundamentals、Accounts / Zones、Traffic flow、Cloudflare IPs、Onboard domain、Pause Cloudflare、Origin protection、Policies / Scopes、Audit Logs、API Token、Global API Key、Rate limits 和 Ray ID 来源，删除 ASCII 流程图、请求头清单、`/cdn-cgi/` 细节、端口长表、52x 长表、Under Attack 步骤和过细 API 操作说明。 |
| 已完成首版 | AI 产品精读 | 已整理 AI Gateway、Workers AI、AI Search、Vectorize、Agents SDK 的定位、免费/付费边界、搜索路线、常见误区和开源参考。 |
| 已完成复核 | AI 产品文案收敛 | 已把 [AI 产品](/platform/ai/) 收敛为普通项目选型、免费边界、推荐路线、成本控制和常见误区；保留 AI Gateway Pricing / Limits、Workers AI Pricing、AI Search Limits & pricing、Vectorize Pricing / Limits、Agents Limits 和 What are agents 来源，删除链路图、Spend limits 细节、Workers AI 速率长表、AI Search API / MCP / 迁移细节、Vectorize 参数长表、Agents runtime / fibers / Session API / diagnostics 说明和本站后续技术路线。 |
| 已完成首版 | 观测与日志精读 | 已整理 Web Analytics、Dashboard Analytics、GraphQL Analytics API、ABR sampling、Workers Logs、Workers Trace Events Logpush、常规 Logpush、Log Explorer、Notifications、Analytics Engine 的免费/付费边界、事实口径、采样、留存、日志写法和开源参考。 |
| 已完成复核 | 观测与日志文案收敛 | 已把 [观测与日志](/platform/observability/) 收敛为免费额度先看、普通项目路线、事实源、日志边界、升级信号和常见误区；保留 Workers Logs / Real-time logs / Workers Trace Events Logpush、Web Analytics、GraphQL Analytics API、Analytics Engine、Logpush / Log Explorer、Notifications 与 Budget alerts 来源，删除配置片段、长期日志实现细节、本站内部选择和过细命令说明。 |
| 已完成首版 | 安全增强精读 | 已整理 Turnstile、Cloudflare Challenges、API Shield、Bots、Access / Tunnel、Secrets Store、Security Center、AI Crawl Control、Key Transparency、Firewall Rules deprecated 的免费/付费边界、落地顺序和开源参考。 |
| 已完成复核 | 安全增强二次精读 | 已把 [安全与网络](/platform/security-networking/) 收敛为普通项目安全基线、免费层边界、风险入口、升级信号、产品取舍和常见误区，保留 WAF / DDoS / Turnstile / API Shield / Bots / Security Insights / Access / Tunnel / Secrets Store 的官方来源，删除请求链路图、Turnstile token 细节、API Shield 长计划表、Key Transparency 长说明、Security dashboard 面板拆解、本站内部选择和过细配置说明。 |
| 已完成首版 | 媒体与性能精读 | 已整理 Images、Stream、Speed / Observatory、Zaraz、Browser Run 的定位、免费/付费边界、落地顺序和开源参考。 |
| 已完成复核 | 媒体与性能文案收敛 | 已把 [媒体与性能](/platform/media-performance/) 收敛为媒体资产放置、免费与付费边界、产品取舍、成本控制、升级信号和常见误区；保留 Images、Stream、Speed / Observatory、Zaraz、Browser Run 的 pricing / limits 和 GitHub 源文件，删除链路图、二次精读结论、本站当前选择、Images / Stream / Browser Run 的过细实现说明、API 细节和浏览器任务流程图。 |
| 已完成首版 | 迁移与 IaC 精读 | 已整理 Terraform、Pulumi、Wrangler、cf-terraforming、R2 remote state、Reference Architecture 和 Migration Guides 的落地边界。 |
| 已完成首版 | 企业网络精读 | 已整理 Cloudflare One、Access、Gateway、Tunnel、Cloudflare One Client、Zero Trust Free / Pay-as-you-go / Contract、Cloudflare WAN 和 Network Firewall 的边界。 |
| 已完成复核 | 企业网络文案收敛 | 已把 [Zero Trust 与企业网络](/platform/zero-trust-networking/) 收敛为普通项目取舍、免费 PoC 起步、Access / Tunnel / Gateway 责任边界、账号限制、企业网络升级信号和常见误区；保留 Cloudflare One、account limits、Access、Tunnel、Gateway、Client modes、Cloudflare WAN 和 Network Firewall 来源，删除 SASE 全图、价格长表、上线证据清单、Access 策略模型、Gateway 细节、Client modes 长表、Multi-Cloud Networking 和本站内部选择。 |
| 已完成首版 | 扩展计算与数据管道精读 | 已整理 Hyperdrive、Workflows、Pipelines、Containers 和 R2 Data Catalog 的定位、免费/付费边界、limits、计费维度和开源参考。 |
| 已完成复核 | 扩展计算与数据管道文案收敛 | 已把 [扩展计算与数据管道](/platform/extended-compute-data/) 收敛为扩展产品启用前问题、免费与付费边界、产品取舍、成本风险、升级信号和常见误区；保留 Hyperdrive、Workflows、Pipelines、R2 Data Catalog、Containers 的 pricing / limits 与 beta 计费口径，删除运行模型图、本站内部选择、Wrangler 配置、Python / DAG、Pipelines 迁移、容器 lifecycle / rollout / outbound / binding 等过细实现说明。 |
| 已完成首版 | Realtime 精读 | 已整理 RealtimeKit、Realtime SFU、TURN、Durable Objects WebSocket 的边界、Beta / GA 价格模型、SFU / TURN 免费额度、limits 和开源参考。 |
| 已完成首版 | 平台化与多租户精读 | 已整理 Cloudflare for SaaS、Workers for Platforms、Dynamic Workers、custom hostnames、dispatch namespace、worker isolation、outbound worker、免费/付费边界和 GitHub 开源参考。 |
| 已完成复核 | 平台化与多租户文案收敛 | 已把 [平台化与多租户](/platform/platforms-saas/) 收敛为普通项目取舍、六个启用前问题、产品选择、费用边界、Cloudflare for SaaS、Workers for Platforms、Dynamic Workers、推荐路线和常见误区；保留官方 Cloudflare for Platforms、SaaS plans、custom hostnames、Workers for Platforms pricing / limits / isolation / custom limits / outbound workers、Dynamic Workers pricing / egress control 和 GitHub 源仓库，删除 ASCII 平台图、请求链路图、API 字段表、dispatch namespace 组件长说明、隔离模式长表、Dynamic Workers loader 图、本站当前选择和过细实现步骤。 |
| 已完成首版 | 自有网络与专线精读 | 已整理 Magic Transit、BYOIP、Network Interconnect、Workers VPC、Network Firewall 标准/高级功能、Enterprise-only 边界、Workers VPC Open Beta 免费边界和 GitHub 开源参考。 |
| 已完成复核 | 自有网络与专线文案收敛 | 已把 [自有网络与专线](/platform/private-networking/) 收敛为普通项目取舍、免费与计划边界、产品选择、成本风险、Workers VPC 位置、升级信号和常见误区；保留 Magic Transit、BYOIP、Network Interconnect、Workers VPC、Network Firewall 的官方来源，删除 ASCII 网络图、本站当前选择、BGP / GRE / IPsec / MSS、BYOIP service binding、CNI dataplane、Tunnel 版本与防火墙端口等过细网络工程说明。 |
| 已完成首版 | 流量调度与四层入口精读 | 已整理 Load Balancing、Health Checks、Spectrum、Argo Smart Routing、usage-based billing、limits、plans、private network load balancing 和 GitHub 开源参考。 |
| 已完成首版 | 源站保护与流量洪峰精读 | 已整理 Waiting Room、Smart Shield、Automatic Platform Optimization、plans、advanced features、APO pricing、Smart Shield packages 和 GitHub 开源参考。 |
| 已完成首版 | 公共网络与专项服务精读 | 已整理 1.1.1.1、Radar、Time Services、Web3、China Network、Google tag gateway 的免费边界、付费边界、使用场景和 GitHub 开源参考。 |
| 已完成首版 | 治理、合规与学习路径精读 | 已整理 Data Localization Suite、Client-side security、DMARC Management、Registrar、Support、Learning Paths、Use cases 的计划边界、合规边界、排障清单和 GitHub 开源参考。 |
| 已完成首版 | 低频协议与平台工具精读 | 已整理 Network Error Logging、Randomness Beacon、Resource Tagging、Tenant、Version Management、Privacy Gateway、Privacy Proxy、MoQ、Agent Memory 的计划边界、普通项目取舍和 GitHub 开源参考。 |
| 已完成首版 | 开发者与网络补充专项精读 | 已整理 Agent Lee、Artifacts、Email Service、Flagship、Network、Network Flow、R2 SQL、Sandbox SDK、Style Guide 的免费/付费边界、Workers Paid 关系和 GitHub 开源参考。 |
| 已完成复核 | 2026-06-17 官方索引复核 | 重新读取 `developers.cloudflare.com/llms.txt` 和 103 个产品级 `llms.txt`；本地产品集合、官方产品集合和 6,145 页计数一致，无新增、删除或页数漂移。 |
| 已完成复核 | 数据产品入口二次精读 | 已把 [数据产品](/platform/data/) 从选择表扩展为数据形态、一致性、访问方式、常见组合、官方资料和 GitHub 源仓库索引。 |
| 已完成复核 | 数据产品入口三次精读 | 已把 [数据产品](/platform/data/) 对齐 storage options、D1、KV、R2、Durable Objects、Queues、Hyperdrive、Vectorize、Pipelines、Analytics Engine 和 cloudflare/templates，补齐选择决策树、常见组合、迁移信号、成本心智、误用清单和模板来源。 |
| 已完成复核 | 架构模式二次精读 | 已把 [架构模式](/architecture/) 对齐 Reference Architecture、How to use、Find by solution、Use cases 和 GitHub 源目录，补齐从需求到架构的判断顺序、Use cases 映射、架构写作标准、路线图、常见误判和开源参考。 |
| 已完成复核 | 额度与 Codex 基线二次精读 | 已把 [免费与付费边界](/platform/free-paid/) 对齐 Workers Pricing / Limits、Static Assets billing、usage-based billing 和 `cloudflare/cloudflare-docs` 源文件；同步强化 [Codex 协作](/best-practices/codex-cloudflare/) 的官方 Codex setup、Docs for agents、Skills、MCP 和 GitHub 来源。 |
| 已完成复核 | API 网关架构二次精读 | 已把 [API 网关](/architecture/api-gateway/) 对齐 Serverless global APIs 与 APIs and microservices，补齐请求路径、三种架构形态、拆分时机、安全/成本/观测边界和官方模板来源。 |
| 已完成复核 | 静态内容站与额度表二次精读 | 已把 [静态内容站](/architecture/static-site/) 对齐 Deploy frontend applications、Workers Static Assets、Pages Limits 和 Cloudflare 官方模板；同步给 [免费与付费边界](/platform/free-paid/) 增加免费额度大全和 GitHub 源仓库参考。 |
| 已完成复核 | 首页免费额度强化 | 已把 [首页](/) 前置为免费额度入口，按静态站、小 API、D1、KV、R2、Queues、Durable Objects、AI、安全、Zero Trust 和成本提醒整理 Free 边界、免费阶段玩法矩阵和 `$5 Workers Paid` 触发信号。 |
| 已完成复核 | 免费额度操作手册 | 已把 [免费与付费边界](/platform/free-paid/) 扩展为免费额度优先级、免费阶段玩法矩阵、Workers Paid 购买边界、完整额度速查和官方 pricing / limits 来源索引。 |
| 已完成复核 | 免费额度首页二次强化 | 已把 [首页](/) 的免费额度入口合并为一张核心大全表，覆盖 DNS、CDN、SSL/TLS、DDoS、WAF、Turnstile、Zero Trust、Static Assets、Pages、Workers、D1、KV、R2、Queues、Durable Objects、Workers Logs、AI Search、Vectorize、Images、Browser Run、Zaraz 和 Budget alerts；同步把 [免费与付费边界](/platform/free-paid/) 调整为核心速查 + 产品级大全，减少重复导读。 |
| 已完成复核 | 学习路线二次精读 | 已把 [学习路线](/start/) 对齐 Learning Paths、Use cases、Docs for agents、全站 `llms.txt` 和 cloudflare/cloudflare-docs 源目录，补齐官方资料读取方式、六轮阅读顺序、Use cases 到本站专题映射和学习检查表。 |
| 已完成复核 | 最佳实践入口二次精读 | 已把 [最佳实践](/best-practices/) 对齐 Workers Best Practices、Solution guides、Static Assets billing、WAF Rate Limiting、D1 indexes、R2 CORS 和 GitHub 源目录，补齐按阶段、按风险域、Workers 项目底线和交付检查。 |
| 已完成复核 | 独立开发者推荐栈二次精读 | 已把 [独立开发者推荐栈](/best-practices/indie-stack/) 对齐 Deploy frontend applications、APIs and microservices、Solution guides、Workers pricing、storage options、AI Gateway、Turnstile、Zero Trust setup 和 cloudflare/templates，补齐免费起步栈、三阶段路线、数据产品选择、安全最小集、常见组合和开源模板参考。 |
| 已完成复核 | 实战案例入口二次精读 | 已把 [实战案例](/recipes/) 对齐 Workers Tutorials / Examples / Templates、D1 Tutorials、R2 Tutorials、Use cases 和 cloudflare/templates，补齐案例选择顺序、路线图、验收标准、官方资料和 GitHub 源目录。 |
| 已完成复核 | 本站技术栈二次精读 | 已把 [本站技术栈](/best-practices/site-stack/) 对齐 Starlight Site Search、Pagefind、Workers Static Assets、Static Assets billing、Workers pricing / limits、AI Search、Docs for agents、Twikoo / twikoo-cloudflare 和 GitHub 源仓库，补齐 Worker-first 架构、搜索路线、评论边界、免费额度影响和落地文件清单。 |
| 已完成复核 | 实时应用架构二次精读 | 已把 [实时应用](/architecture/realtime-app/) 对齐 Add real-time features、Durable Objects WebSockets、control/data plane、lifecycle、pricing/limits 和 GitHub 示例，补齐实时类型判断、三层平面、对象切分、Hibernation、状态归位、成本边界和验证清单。 |
| 已完成复核 | 迁移与 IaC 文案收敛 | 已把 [迁移与 IaC](/platform/iac-migration/) 收敛为 IaC 启用判断、工具边界、纳入优先级、迁移顺序、真源原则和常见误区；保留 Terraform best practices、Import Cloudflare resources、Remote R2 backend、Workers Infrastructure as Code、Pulumi、Reference Architecture how-to-use 和 Migration Guides 来源，删除目录结构图、Terraform / Wrangler / R2 backend 命令示例、Ruleset `ref` 细节、Pulumi + Wrangler 长表、CI 守门长表、参考架构映射和本站内部选择。 |
| 已完成复核 | 平台文案收敛 | 已把 [Cloudflare 产品大图谱](/platform/) 改为产品入口和选型路线，删掉长链路图与百科式堆叠；同步压缩 [免费与付费边界](/platform/free-paid/) 的核对过程、重复导读和本站内部技术栈说明，并继续收敛 [Workers](/platform/workers/)、[Pages](/platform/pages/)、[迁移与 IaC](/platform/iac-migration/)、[安全与网络](/platform/security-networking/)、[KV](/platform/kv/)、[D1](/platform/d1/)、[Queues](/platform/queues/)、[R2](/platform/r2/)、[Durable Objects](/platform/durable-objects/) 与 [Zero Trust 与企业网络](/platform/zero-trust-networking/) 的代码、配置、价格长表和过细实现说明。 |
| 进行中 | 单产品复核与案例深化 | 持续补充真实项目拆解、参考架构和单产品深水区。 |

## 整理规则

- 每篇专题都要写最后核对日期。
- 官方事实、个人判断和本站实践分开写。
- 价格、额度、限制、配置字段只引用官方页面。
- 不复制官方正文，改写成普通项目的判断框架。
- 遇到 Enterprise、Beta、Deprecated、Preview，要显式标注边界。

## 事实来源

- [Cloudflare Developer Documentation llms.txt](https://developers.cloudflare.com/llms.txt)
- [Cloudflare Multi-Cloud Networking llms.txt](https://developers.cloudflare.com/multi-cloud-networking/llms.txt)
- [Cloudflare Fundamentals llms.txt](https://developers.cloudflare.com/fundamentals/llms.txt)
- [Cloudflare Billing llms.txt](https://developers.cloudflare.com/billing/llms.txt)
- [Cloudflare Rules llms.txt](https://developers.cloudflare.com/rules/llms.txt)
- [Cloudflare Ruleset Engine llms.txt](https://developers.cloudflare.com/ruleset-engine/llms.txt)
- [Cloudflare AI Gateway llms.txt](https://developers.cloudflare.com/ai-gateway/llms.txt)
- [Cloudflare Workers AI llms.txt](https://developers.cloudflare.com/workers-ai/llms.txt)
- [Cloudflare AI Search llms.txt](https://developers.cloudflare.com/ai-search/llms.txt)
- [Cloudflare Vectorize llms.txt](https://developers.cloudflare.com/vectorize/llms.txt)
- [Cloudflare Agents llms.txt](https://developers.cloudflare.com/agents/llms.txt)
- [Cloudflare Analytics llms.txt](https://developers.cloudflare.com/analytics/llms.txt)
- [Cloudflare Logs llms.txt](https://developers.cloudflare.com/logs/llms.txt)
- [Cloudflare Log Explorer llms.txt](https://developers.cloudflare.com/log-explorer/llms.txt)
- [Cloudflare Web Analytics llms.txt](https://developers.cloudflare.com/web-analytics/llms.txt)
- [Cloudflare Notifications llms.txt](https://developers.cloudflare.com/notifications/llms.txt)
- [Cloudflare Load Balancing llms.txt](https://developers.cloudflare.com/load-balancing/llms.txt)
- [Cloudflare Health Checks llms.txt](https://developers.cloudflare.com/health-checks/llms.txt)
- [Cloudflare Spectrum llms.txt](https://developers.cloudflare.com/spectrum/llms.txt)
- [Cloudflare Argo Smart Routing llms.txt](https://developers.cloudflare.com/argo-smart-routing/llms.txt)
- [Cloudflare Waiting Room llms.txt](https://developers.cloudflare.com/waiting-room/llms.txt)
- [Cloudflare Smart Shield llms.txt](https://developers.cloudflare.com/smart-shield/llms.txt)
- [Cloudflare Automatic Platform Optimization llms.txt](https://developers.cloudflare.com/automatic-platform-optimization/llms.txt)
- [1.1.1.1 llms.txt](https://developers.cloudflare.com/1.1.1.1/llms.txt)
- [Cloudflare Radar llms.txt](https://developers.cloudflare.com/radar/llms.txt)
- [Cloudflare Time Services llms.txt](https://developers.cloudflare.com/time-services/llms.txt)
- [Cloudflare Web3 llms.txt](https://developers.cloudflare.com/web3/llms.txt)
- [Cloudflare China Network llms.txt](https://developers.cloudflare.com/china-network/llms.txt)
- [Google tag gateway llms.txt](https://developers.cloudflare.com/google-tag-gateway/llms.txt)
- [Data Localization Suite llms.txt](https://developers.cloudflare.com/data-localization/llms.txt)
- [Client-side security llms.txt](https://developers.cloudflare.com/client-side-security/llms.txt)
- [DMARC Management llms.txt](https://developers.cloudflare.com/dmarc-management/llms.txt)
- [Cloudflare Registrar llms.txt](https://developers.cloudflare.com/registrar/llms.txt)
- [Cloudflare Support llms.txt](https://developers.cloudflare.com/support/llms.txt)
- [Learning Paths llms.txt](https://developers.cloudflare.com/learning-paths/llms.txt)
- [Use cases llms.txt](https://developers.cloudflare.com/use-cases/llms.txt)
- [Cloudflare Turnstile llms.txt](https://developers.cloudflare.com/turnstile/llms.txt)
- [Cloudflare API Shield llms.txt](https://developers.cloudflare.com/api-shield/llms.txt)
- [Cloudflare Bots llms.txt](https://developers.cloudflare.com/bots/llms.txt)
- [Cloudflare Challenges llms.txt](https://developers.cloudflare.com/cloudflare-challenges/llms.txt)
- [Cloudflare AI Crawl Control llms.txt](https://developers.cloudflare.com/ai-crawl-control/llms.txt)
- [Cloudflare Secrets Store llms.txt](https://developers.cloudflare.com/secrets-store/llms.txt)
- [Cloudflare Security Center llms.txt](https://developers.cloudflare.com/security-center/llms.txt)
- [Cloudflare Security dashboard llms.txt](https://developers.cloudflare.com/security/llms.txt)
- [Cloudflare One llms.txt](https://developers.cloudflare.com/cloudflare-one/llms.txt)
- [Cloudflare Tunnel llms.txt](https://developers.cloudflare.com/tunnel/llms.txt)
- [Cloudflare WAN llms.txt](https://developers.cloudflare.com/cloudflare-wan/llms.txt)
- [Cloudflare Network Firewall llms.txt](https://developers.cloudflare.com/cloudflare-network-firewall/llms.txt)
- [Magic Transit llms.txt](https://developers.cloudflare.com/magic-transit/llms.txt)
- [BYOIP llms.txt](https://developers.cloudflare.com/byoip/llms.txt)
- [Network Interconnect llms.txt](https://developers.cloudflare.com/network-interconnect/llms.txt)
- [Workers VPC llms.txt](https://developers.cloudflare.com/workers-vpc/llms.txt)
- [Cloudflare Images llms.txt](https://developers.cloudflare.com/images/llms.txt)
- [Cloudflare Stream llms.txt](https://developers.cloudflare.com/stream/llms.txt)
- [Cloudflare Speed llms.txt](https://developers.cloudflare.com/speed/llms.txt)
- [Cloudflare Zaraz llms.txt](https://developers.cloudflare.com/zaraz/llms.txt)
- [Cloudflare Browser Run llms.txt](https://developers.cloudflare.com/browser-run/llms.txt)
- [Cloudflare Hyperdrive llms.txt](https://developers.cloudflare.com/hyperdrive/llms.txt)
- [Cloudflare Workflows llms.txt](https://developers.cloudflare.com/workflows/llms.txt)
- [Cloudflare Pipelines llms.txt](https://developers.cloudflare.com/pipelines/llms.txt)
- [Cloudflare Containers llms.txt](https://developers.cloudflare.com/containers/llms.txt)
- [Cloudflare Realtime llms.txt](https://developers.cloudflare.com/realtime/llms.txt)
- [Cloudflare for Platforms llms.txt](https://developers.cloudflare.com/cloudflare-for-platforms/llms.txt)
- [Cloudflare Dynamic Workers llms.txt](https://developers.cloudflare.com/dynamic-workers/llms.txt)
- [Cloudflare Terraform llms.txt](https://developers.cloudflare.com/terraform/llms.txt)
- [Cloudflare Pulumi llms.txt](https://developers.cloudflare.com/pulumi/llms.txt)
- [Cloudflare Reference Architecture llms.txt](https://developers.cloudflare.com/reference-architecture/llms.txt)
- [Cloudflare Migration Guides llms.txt](https://developers.cloudflare.com/migration-guides/llms.txt)
- [Cloudflare Workers llms.txt](https://developers.cloudflare.com/workers/llms.txt)
- [Network Error Logging llms.txt](https://developers.cloudflare.com/network-error-logging/llms.txt)
- [Randomness Beacon llms.txt](https://developers.cloudflare.com/randomness-beacon/llms.txt)
- [Resource Tagging llms.txt](https://developers.cloudflare.com/resource-tagging/llms.txt)
- [Tenant llms.txt](https://developers.cloudflare.com/tenant/llms.txt)
- [Version Management llms.txt](https://developers.cloudflare.com/version-management/llms.txt)
- [Privacy Gateway llms.txt](https://developers.cloudflare.com/privacy-gateway/llms.txt)
- [Privacy Proxy llms.txt](https://developers.cloudflare.com/privacy-proxy/llms.txt)
- [MoQ llms.txt](https://developers.cloudflare.com/moq/llms.txt)
- [Agent Memory llms.txt](https://developers.cloudflare.com/agent-memory/llms.txt)
- [Agent Lee llms.txt](https://developers.cloudflare.com/agent-lee/llms.txt)
- [Artifacts llms.txt](https://developers.cloudflare.com/artifacts/llms.txt)
- [Email Service llms.txt](https://developers.cloudflare.com/email-service/llms.txt)
- [Flagship llms.txt](https://developers.cloudflare.com/flagship/llms.txt)
- [Network llms.txt](https://developers.cloudflare.com/network/llms.txt)
- [Network Flow llms.txt](https://developers.cloudflare.com/network-flow/llms.txt)
- [R2 SQL llms.txt](https://developers.cloudflare.com/r2-sql/llms.txt)
- [Sandbox SDK llms.txt](https://developers.cloudflare.com/sandbox/llms.txt)
- [Cloudflare Style Guide llms.txt](https://developers.cloudflare.com/style-guide/llms.txt)
- [Docs for agents](https://developers.cloudflare.com/docs-for-agents/)
- [Cloudflare Docs for Agents llms.txt](https://developers.cloudflare.com/docs-for-agents/llms.txt)
