---
title: 官方资料
description: Cloudflare Playbook 的官方资料入口和查证顺序。
---

最后核对日期：2026-06-18。

Cloudflare 产品变化很快，涉及额度、价格、限制、API、兼容性日期和配置字段时，以官方文档为准。这页不再堆链接，只保留普通项目真正会反复用到的入口。完整产品域导航见 [Cloudflare 文档地图](/reference/cloudflare-docs-map/)。

## 先从这里查

| 你要查什么 | 先打开 |
| --- | --- |
| 全部 Cloudflare 文档入口 | [Developer Docs](https://developers.cloudflare.com/) |
| 所有产品的 Markdown 索引 | [llms.txt](https://developers.cloudflare.com/llms.txt) |
| 大模型离线索引或批量检索 | [llms-full.txt](https://developers.cloudflare.com/llms-full.txt) |
| 某个产品的完整页面列表 | 对应产品的 `llms.txt`，例如 [Workers llms.txt](https://developers.cloudflare.com/workers/llms.txt) |
| 最近变更 | [Changelog](https://developers.cloudflare.com/changelog/) |
| 价格、额度、账单 | [Billing](https://developers.cloudflare.com/billing/)、[Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/) |
| Agent / Codex 怎么读文档 | [Docs for agents](https://developers.cloudflare.com/docs-for-agents/)、[Codex + Cloudflare](https://developers.cloudflare.com/agent-setup/codex/) |
| 官方源码 | [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs) |

## 查证顺序

| 场景 | 顺序 |
| --- | --- |
| 免费额度和价格 | 官方 pricing / limits 页面 -> Cloudflare changelog -> 本站 [免费额度大全](/platform/free-paid/) |
| 产品怎么选 | 本站产品页 -> 官方产品 `llms.txt` -> 官方概念页 |
| API、命令、字段 | 官方 API / Wrangler 文档 -> 官方 GitHub 源文件 -> 本站只保留判断 |
| 最新变更 | Changelog -> 对应产品文档 -> GitHub 源文件提交记录 |
| AI Agent 检索 | 先用 Markdown 或 `llms.txt`，不要抓 HTML 页面 |

Cloudflare 官方文档页面会提示 Agent 优先请求 Markdown，因为 HTML 会浪费上下文。本站也按这个原则整理：概念页只保留判断，具体命令、参数和字段回到官方文档。

## 必读官方页

| 主题 | 官方入口 | 本站入口 |
| --- | --- | --- |
| 免费额度 | [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)、[Workers Limits](https://developers.cloudflare.com/workers/platform/limits/) | [免费额度大全](/platform/free-paid/) |
| 静态站 | [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)、[Pages Limits](https://developers.cloudflare.com/pages/platform/limits/) | [Workers Static Assets](/platform/static-assets/)、[Pages](/platform/pages/) |
| 数据和文件 | [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)、[KV Pricing](https://developers.cloudflare.com/kv/platform/pricing/)、[R2 Pricing](https://developers.cloudflare.com/r2/pricing/) | [数据产品](/platform/data/) |
| 状态和异步 | [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)、[Queues Pricing](https://developers.cloudflare.com/queues/platform/pricing/) | [Durable Objects](/platform/durable-objects/)、[Queues](/platform/queues/) |
| 安全 | [WAF](https://developers.cloudflare.com/waf/)、[DDoS Protection](https://developers.cloudflare.com/ddos-protection/)、[Turnstile Plans](https://developers.cloudflare.com/turnstile/plans/) | [安全与网络](/platform/security-networking/) |
| AI 和搜索 | [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)、[Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)、[AI Search Limits](https://developers.cloudflare.com/ai-search/platform/limits-pricing/) | [AI 产品](/platform/ai/) |
| 观测和账单 | [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)、[Budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/) | [观测与日志](/platform/observability/)、[Billing](/platform/billing/) |

## GitHub 参考

| 仓库 | 用途 |
| --- | --- |
| [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs) | 官方文档源文件，核对文字、限制和链接。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Miniflare、Workers SDK 和模板来源。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | 官方项目模板，看常见组合方式。 |
| [cloudflare/skills](https://github.com/cloudflare/skills) | Cloudflare 官方 Agent Skills，看平台实践如何给 Agent 使用。 |
| [cloudflare/mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare) | Cloudflare MCP server 集合，看 Agent 如何查文档、观测和调用 API。 |
| [twikoojs/twikoo-cloudflare](https://github.com/twikoojs/twikoo-cloudflare) | 本站评论系统的 Workers + D1 参考实现。 |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，学习教程站的信息架构。 |

## 写作规范

| 规则 | 说明 |
| --- | --- |
| 写最后核对日期 | 价格、额度、限制和产品状态都可能变化。 |
| 官方事实和本站判断分开 | 数字来自官方，取舍是本站面向普通项目的判断。 |
| 不复制官方文档 | 只解释怎么选、什么时候用、哪里会花钱。 |
| 不把命令和字段塞进概念页 | 实战案例可以有命令；平台页只保留决策。 |
| 发现过时内容直接删 | 不保留迁就旧版本的解释。 |
