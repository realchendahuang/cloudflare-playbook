---
title: 官方资料
description: Cloudflare 官方资料入口和查证顺序。
---

最后核对日期：2026-06-18。

Cloudflare 产品变化很快。额度、价格、限制和部署口径，以官方文档为准；本站只保留面向实践的判断。

## 先从这里查

| 你要查什么 | 先打开 |
| --- | --- |
| 全部 Cloudflare 文档入口 | [Developer Docs](https://developers.cloudflare.com/) |
| 所有产品的 Markdown 索引 | [llms.txt](https://developers.cloudflare.com/llms.txt) |
| 最近变更 | [Changelog](https://developers.cloudflare.com/changelog/) |
| 价格、额度、账单 | [Billing](https://developers.cloudflare.com/billing/)、[Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/) |
| 官方课程和场景 | [Learning Paths](https://developers.cloudflare.com/learning-paths/llms.txt)、[Use cases](https://developers.cloudflare.com/use-cases/llms.txt) |

完整产品域导航见 [Cloudflare 文档地图](/reference/cloudflare-docs-map/)。

## 开源参考

这些仓库适合看实现和资料来源。额度和价格仍以官方 pricing / limits 为准。

| 参考 | 用来看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs) | Cloudflare 官方文档源码和页面编辑历史。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Miniflare 和 Workers 开发工具链。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | Workers / Pages 项目模板和示例入口。 |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 本站最早参考的 Codex Guide 项目结构。 |
| [withastro/starlight](https://github.com/withastro/starlight) | 当前文档框架。 |
| [Pagefind/pagefind](https://github.com/Pagefind/pagefind) | 静态站内搜索。 |
| [twikoojs/twikoo](https://github.com/twikoojs/twikoo)、[twikoojs/twikoo-cloudflare](https://github.com/twikoojs/twikoo-cloudflare) | 评论组件和 Cloudflare Workers 后端。 |

## 查证顺序

| 场景 | 顺序 |
| --- | --- |
| 免费额度和价格 | 官方 pricing / limits -> Cloudflare changelog -> [免费额度大全](/platform/free-paid/) |
| 产品怎么选 | 本站产品页 -> 官方产品 `llms.txt` -> 官方概念页 |
| API、命令、字段 | 官方 API / Wrangler 文档 -> 对应产品文档 |
| 最新变更 | Changelog -> 对应产品文档 |

常用官方页统一放到 [Cloudflare 文档地图](/reference/cloudflare-docs-map/)；免费额度优先看 [免费额度大全](/platform/free-paid/)。
