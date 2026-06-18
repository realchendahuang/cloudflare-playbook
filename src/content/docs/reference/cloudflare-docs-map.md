---
title: Cloudflare 文档地图
description: 基于 Cloudflare 官方 llms.txt 的阅读顺序和来源入口。
---

最后核对日期：2026-06-18。

Cloudflare 官方文档很大，直接从产品名开始读很容易迷路。这张地图只保留阅读顺序和官方入口，具体额度先回到 [免费额度大全](/platform/free-paid/)。

## 怎么用这张地图

| 你现在的问题 | 先读哪里 |
| --- | --- |
| 想知道免费能跑到什么程度 | [免费额度大全](/platform/free-paid/) |
| 不知道 Cloudflare 产品怎么分层 | [Cloudflare 产品大图谱](/platform/) |
| 要把文档站、官网或博客放上去 | [静态内容站](/architecture/static-site/) |
| 要做小 API、Webhook、评论或表单 | [API 网关](/architecture/api-gateway/) |
| 要选 D1、KV、R2、Queues、Durable Objects | [数据产品](/platform/data/) |
| 要做搜索、AI 摘要或自动化工具 | [AI 产品](/platform/ai/) |
| 要保护后台、预览环境或内网工具 | [Zero Trust 与企业网络](/platform/zero-trust-networking/) |
| 要控制成本 | [成本控制](/best-practices/cost/) |

## 阅读顺序

| 顺序 | 先读什么 | 为什么 |
| --- | --- | --- |
| 先读 | Fundamentals、Billing、DNS、SSL/TLS、Cache、WAF、DDoS、Rules | 所有项目都会碰到入口、域名、安全、缓存和账单。 |
| 先读 | Workers、Static Assets、Pages、D1、KV、R2、Queues、Durable Objects | 这是独立开发者最常用的开发者平台主线。 |
| 按需读 | AI Gateway、Workers AI、AI Search、Vectorize、Agents、Browser Run | 搜索、AI 应用和自动化需求明确后再读。 |
| 按需读 | Analytics、Web Analytics、Logs、Notifications | 排障、访问趋势和账单提醒会很快用到。 |
| 按需读 | Turnstile、API Shield、Bots、Security Center、Secrets Store、Access / Tunnel | 有公开写入口、后台、API 或密钥治理时再深入。 |
| 后置 | Images、Stream、Realtime、Hyperdrive、Workflows、Pipelines、Containers | 有明确业务形态后再深入。 |
| 后置 | Terraform、Pulumi、Reference Architecture、Migration Guides、Learning Paths | 团队化、迁移和基础设施管理需求出现后再读。 |
| 最后读 | Web3、China Network、Magic Transit、BYOIP、Cloudflare WAN、Network Interconnect | 更偏企业网络、合规或特定业务场景。 |

## 产品域入口

| 产品域 | 官方入口 | 本站入口 | 先判断 |
| --- | --- | --- | --- |
| 基础接入 | [Fundamentals](https://developers.cloudflare.com/fundamentals/llms.txt)、[DNS](https://developers.cloudflare.com/dns/llms.txt)、[SSL/TLS](https://developers.cloudflare.com/ssl/llms.txt) | [基础概念](/platform/fundamentals/)、[DNS](/platform/dns/)、[SSL/TLS](/platform/ssl-tls/) | 域名是否接入、哪些记录代理、源站是否只接受 Cloudflare。 |
| 账单与额度 | [Billing](https://developers.cloudflare.com/billing/llms.txt)、[Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/) | [账单与预算](/platform/billing/)、[免费额度大全](/platform/free-paid/) | 免费层能不能验证，是否真的需要 5 USD/month Workers Paid。 |
| 静态与前端 | [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)、[Pages](https://developers.cloudflare.com/pages/llms.txt) | [Workers Static Assets](/platform/static-assets/)、[Pages](/platform/pages/) | 静态请求要停在静态层，动态接口才进 Worker。 |
| 计算与 API | [Workers](https://developers.cloudflare.com/workers/llms.txt)、[Rules](https://developers.cloudflare.com/rules/llms.txt) | [Workers](/platform/workers/)、[Rules](/platform/rules/)、[API 网关](/architecture/api-gateway/) | API、Webhook、后台接口是否需要边缘动态代码。 |
| 数据与存储 | [D1](https://developers.cloudflare.com/d1/llms.txt)、[KV](https://developers.cloudflare.com/kv/llms.txt)、[R2](https://developers.cloudflare.com/r2/llms.txt)、[Queues](https://developers.cloudflare.com/queues/llms.txt)、[Durable Objects](https://developers.cloudflare.com/durable-objects/llms.txt) | [数据产品](/platform/data/) | 关系数据、配置缓存、对象文件、异步任务和强一致状态不要混用。 |
| AI 与搜索 | [AI Gateway](https://developers.cloudflare.com/ai-gateway/llms.txt)、[Workers AI](https://developers.cloudflare.com/workers-ai/llms.txt)、[AI Search](https://developers.cloudflare.com/ai-search/llms.txt)、[Vectorize](https://developers.cloudflare.com/vectorize/llms.txt) | [AI 产品](/platform/ai/) | 文档站先 Pagefind；自然语言搜索有真实需求后再接托管 AI。 |
| 安全 | [WAF](https://developers.cloudflare.com/waf/llms.txt)、[DDoS](https://developers.cloudflare.com/ddos-protection/llms.txt)、[Turnstile](https://developers.cloudflare.com/turnstile/llms.txt)、[API Shield](https://developers.cloudflare.com/api-shield/llms.txt) | [安全与网络](/platform/security-networking/)、[WAF](/platform/waf/)、[DDoS](/platform/ddos/) | 登录、评论、上传、Webhook 先加最小防护和限流。 |
| 内网与团队访问 | [Cloudflare One](https://developers.cloudflare.com/cloudflare-one/llms.txt)、[Tunnel](https://developers.cloudflare.com/tunnel/llms.txt) | [Zero Trust 与企业网络](/platform/zero-trust-networking/) | 后台、预览环境、内网工具不要裸露公网。 |
| 媒体与实时 | [Images](https://developers.cloudflare.com/images/llms.txt)、[Stream](https://developers.cloudflare.com/stream/llms.txt)、[Realtime](https://developers.cloudflare.com/realtime/llms.txt) | [媒体与性能](/platform/media-performance/)、[Realtime](/platform/realtime/) | 大文件、图片、视频和音视频实时不要塞进静态站。 |
| 后置能力 | [Reference Architecture](https://developers.cloudflare.com/reference-architecture/llms.txt)、[Migration Guides](https://developers.cloudflare.com/migration-guides/llms.txt)、[Use cases](https://developers.cloudflare.com/use-cases/llms.txt) | [架构模式](/architecture/)、[迁移与 IaC](/platform/iac-migration/) | 先确认项目规模，再引入企业网络、专线、Bot 高级能力或 IaC。 |

## 整理原则

| 原则 | 说明 |
| --- | --- |
| 先场景，后产品 | 读者要先知道自己要解决什么问题，再看产品。 |
| 先免费边界，后高级能力 | 优先确认 Free 和 5 USD/month Workers Paid 能做什么。 |
| 先判断，后配置 | 这份 Playbook 解释取舍；具体 API、命令和字段回到官方文档。 |
| 官方事实与本站判断分开 | 数字、限制和计划边界以 Cloudflare 官方页面为准。 |
| 少放实现细节 | 只有实战案例页保留代码和命令，概念页尽量只保留判断框架。 |

## 事实来源

- [Cloudflare Developer Documentation llms.txt](https://developers.cloudflare.com/llms.txt)
- [Docs for agents](https://developers.cloudflare.com/docs-for-agents/)
- [Markdown for agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)
- [Cloudflare Changelog](https://developers.cloudflare.com/changelog/)
- [Cloudflare Use cases](https://developers.cloudflare.com/use-cases/llms.txt)
- [Cloudflare Learning Paths](https://developers.cloudflare.com/learning-paths/llms.txt)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Cloudflare Billing](https://developers.cloudflare.com/billing/)
