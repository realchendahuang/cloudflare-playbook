---
title: Codex 协作
description: 用 Codex 维护 Cloudflare 项目时，哪些事情必须查官方资料。
---

最后核对日期：2026-06-18。

Codex 可以帮你写代码、整理文档、改配置和部署，但不能替你猜 Cloudflare 的价格、限制、配置字段和产品状态。涉及数字和部署边界时，一律回到官方文档。

## 先记住

| 场景 | 做法 |
| --- | --- |
| 写文章 | 先讲读者要解决的问题，不从产品名开始堆。 |
| 写代码 | 先读仓库配置、`package.json`、`wrangler.jsonc` 和现有模式。 |
| 查额度 | 回到官方 pricing / limits，再整理到 [免费额度大全](/platform/free-paid/)。 |
| 查产品状态 | 看官方 `llms.txt`、产品 Markdown 和 Changelog。 |
| 改资源 | 用 Wrangler 或官方 API，避免手工复制 dashboard 状态。 |
| 发布后 | 构建、类型检查、部署和线上页面都要确认。 |

## 必须查官方的内容

| 内容 | 为什么 |
| --- | --- |
| 免费额度和付费边界 | Free、Workers Paid、域名计划、附加产品和企业能力经常被混在一起。 |
| pricing 和 limits | 数字会变化，不能靠旧知识。 |
| beta、deprecated、计划边界 | 产品状态会影响是否适合公开项目和长期维护。 |
| Wrangler 配置字段 | 新能力经常先出现在最新 Wrangler 和配置规则里。 |
| Workers 资源连接 | D1、R2、KV、AI、Durable Objects、Queues 的连接方式要按当前文档核对。 |
| 安全策略 | WAF、Access、Turnstile、API Shield、Secrets Store 的默认动作和计划边界必须核对。 |

## 写内容的底线

| 规则 | 做法 |
| --- | --- |
| 先讲读者问题 | 先回答“要不要用”，再回答“用哪个”。 |
| 先讲免费边界 | 能 0 元验证就先 0 元验证。 |
| 少放实现细节 | 概念页不放命令、配置字段和 API 表；案例页只保留必要代码。 |
| 文案面向读者 | 只保留读者需要判断和执行的内容。 |
| 来源清楚 | 文章末尾保留官方文档和关键事实来源。 |

## 写 Worker 代码的底线

| 主题 | 最低要求 |
| --- | --- |
| 兼容性日期 | 新项目使用当前日期；旧项目升级前单独验证。 |
| 类型 | 绑定类型从真实配置生成，不手写一份容易漂移的 `Env`。 |
| 密钥 | 生产密钥放 Cloudflare Secrets，不进入仓库、文档和日志。 |
| 静态资产 | 文档、官网、SPA 默认走 Workers Static Assets 或 Pages。 |
| 大响应 | 代理、大文件和下载优先流式处理。 |
| 日志 | 记录请求编号、路径、状态、耗时和错误类型，不记录密钥、登录凭证和正文隐私。 |

## 官方资料

- [Codex + Cloudflare](https://developers.cloudflare.com/agent-setup/codex/)
- [Cloudflare Agent Setup Prompt](https://developers.cloudflare.com/agent-setup/prompt.md)
- [Cloudflare Docs for Agents](https://developers.cloudflare.com/docs-for-agents/)
- [Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)
- [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [MCP servers for Cloudflare](https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/)
