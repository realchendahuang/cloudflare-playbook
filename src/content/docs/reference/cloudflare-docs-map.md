---
title: Cloudflare 文档地图
description: Cloudflare 官方文档的阅读顺序和来源入口。
---

最后核对日期：2026-06-18。

Cloudflare 官方文档很大，直接从产品名开始读很容易迷路。这张地图只保留阅读顺序和官方入口，具体额度回到 [免费额度大全](/platform/free-paid/)。

## 怎么用这张地图

| 你现在的问题 | 先读哪里 |
| --- | --- |
| 想知道免费能跑到什么程度 | [免费额度大全](/platform/free-paid/) |
| 不知道 Cloudflare 产品怎么分层 | [Cloudflare 产品大图谱](/platform/) |
| 要把文档站、官网或博客放上去 | [静态内容站](/architecture/static-site/) |
| 要做小接口、第三方回调、评论或表单 | [API 网关](/architecture/api-gateway/) |
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
| 按需读 | Turnstile、API Shield、Bots、Security Center、Secrets Store、Access / Tunnel | 有公开写入口、后台、接口或密钥治理时再深入。 |
| 后置 | Images、Stream、Realtime、Hyperdrive、Workflows、Pipelines、Containers | 有明确业务形态后再深入。 |
| 后置 | Terraform、Pulumi、Reference Architecture、Migration Guides、Learning Paths | 团队化、迁移和基础设施管理需求出现后再读。 |
| 最后读 | Web3、China Network、Magic Transit、BYOIP、Cloudflare WAN、Network Interconnect | 更偏企业网络、合规或特定业务场景。 |

## 官方入口

| 主题 | 官方入口 | 本站入口 |
| --- | --- | --- |
| 全站文档 | [Developer Docs](https://developers.cloudflare.com/)、[llms.txt](https://developers.cloudflare.com/llms.txt)、[Changelog](https://developers.cloudflare.com/changelog/) | [官方资料](/reference/) |
| 基础、账单、域名 | [Fundamentals](https://developers.cloudflare.com/fundamentals/)、[Billing](https://developers.cloudflare.com/billing/)、[DNS](https://developers.cloudflare.com/dns/) | [Cloudflare 产品大图谱](/platform/) |
| 开发者平台 | [Workers](https://developers.cloudflare.com/workers/)、[Pages](https://developers.cloudflare.com/pages/)、[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) | [学习路线](/start/) |
| 数据、安全、AI | [Storage options](https://developers.cloudflare.com/workers/platform/storage-options/)、[WAF](https://developers.cloudflare.com/waf/)、[Cloudflare AI](https://developers.cloudflare.com/ai/) | [数据产品](/platform/data/)、[安全与网络](/platform/security-networking/)、[AI 产品](/platform/ai/) |

## 开源仓库入口

这些仓库适合追源码、示例和文档变更历史。额度和价格仍以官方价格和限制页面为准。

| 仓库 | 用来看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs) | Cloudflare 官方文档源码、页面结构和历史变更。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Miniflare、Workers 本地开发工具链。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | Workers / Pages 项目模板和示例。 |
| [withastro/starlight](https://github.com/withastro/starlight) | 本站文档框架和主题扩展方式。 |
| [Pagefind/pagefind](https://github.com/Pagefind/pagefind) | 静态站内搜索方案。 |
| [twikoojs/twikoo-cloudflare](https://github.com/twikoojs/twikoo-cloudflare) | 托管在 Cloudflare Workers 上的评论后端。 |

## 整理原则

| 原则 | 说明 |
| --- | --- |
| 先场景，后产品 | 读者要先知道自己要解决什么问题，再看产品。 |
| 先免费边界，后高级能力 | 优先确认 Free 和 5 美元/月 Workers Paid 能做什么。 |
| 先判断，后配置 | 这份 Playbook 解释取舍；具体接口、命令和字段回到官方文档。 |
| 官方事实与本站判断分开 | 数字、限制和计划边界以 Cloudflare 官方页面为准。 |
| 少放实现细节 | 只有实战案例页保留代码和命令，概念页尽量只保留判断框架。 |

官方核对入口：[Cloudflare Developer Documentation](https://developers.cloudflare.com/)、[llms.txt](https://developers.cloudflare.com/llms.txt)、[Docs for agents](https://developers.cloudflare.com/docs-for-agents/)、[Cloudflare Changelog](https://developers.cloudflare.com/changelog/)。
