---
title: 官方资料
description: Cloudflare Playbook 的官方资料索引。
---

Cloudflare 产品变化很快，涉及限制、价格、API、兼容性日期和配置字段时，以官方资料为准。

## 本站整理入口

- [Cloudflare 文档地图](/reference/cloudflare-docs-map/)：基于官方 `llms.txt` 的 9 大类、103 个产品 / 文档集合、6,145 个 Markdown 页面索引。

## 核心入口

- [Cloudflare Developer Docs](https://developers.cloudflare.com/)
- [Cloudflare Developer Documentation llms.txt](https://developers.cloudflare.com/llms.txt)
- [Cloudflare Developer Documentation llms-full.txt](https://developers.cloudflare.com/llms-full.txt)
- [Cloudflare Changelog](https://developers.cloudflare.com/changelog/)
- [Cloudflare Docs for Agents](https://developers.cloudflare.com/docs-for-agents/)
- [Codex + Cloudflare](https://developers.cloudflare.com/agent-setup/codex/)
- [Cloudflare Agent Setup Prompt](https://developers.cloudflare.com/agent-setup/prompt.md)
- [Workers Docs](https://developers.cloudflare.com/workers/)
- [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Workers Static Assets Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers Builds Limits & Pricing](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)
- [Pages Docs](https://developers.cloudflare.com/pages/)
- [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- [D1 Docs](https://developers.cloudflare.com/d1/)
- [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [D1 Limits](https://developers.cloudflare.com/d1/platform/limits/)
- [R2 Docs](https://developers.cloudflare.com/r2/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [KV Docs](https://developers.cloudflare.com/kv/)
- [KV Pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- [KV Limits](https://developers.cloudflare.com/kv/platform/limits/)
- [How KV works](https://developers.cloudflare.com/kv/concepts/how-kv-works/)
- [Wrangler KV commands](https://developers.cloudflare.com/kv/reference/kv-commands/)
- [Durable Objects Docs](https://developers.cloudflare.com/durable-objects/)
- [Durable Objects Pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Queues Docs](https://developers.cloudflare.com/queues/)
- [Queues Pricing](https://developers.cloudflare.com/queues/platform/pricing/)
- [Workers AI Docs](https://developers.cloudflare.com/workers-ai/)
- [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [AI Gateway Docs](https://developers.cloudflare.com/ai-gateway/)
- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- [Vectorize Docs](https://developers.cloudflare.com/vectorize/)
- [Vectorize Pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)
- [AI Search Docs](https://developers.cloudflare.com/ai-search/)
- [Web Analytics Docs](https://developers.cloudflare.com/web-analytics/)
- [Analytics Engine Pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)
- [DNS FAQ](https://developers.cloudflare.com/dns/faq/)
- [Cache Plans](https://developers.cloudflare.com/cache/plans/)
- [WAF Docs](https://developers.cloudflare.com/waf/)
- [WAF Managed Rules](https://developers.cloudflare.com/waf/managed-rules/)
- [DDoS Protection Docs](https://developers.cloudflare.com/ddos-protection/)
- [DDoS Protection About](https://developers.cloudflare.com/ddos-protection/about/)
- [Turnstile Plans](https://developers.cloudflare.com/turnstile/plans/)
- [Turnstile Server-side Validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Images Pricing](https://developers.cloudflare.com/images/pricing/)
- [Stream Pricing](https://developers.cloudflare.com/stream/pricing/)
- [Browser Run Pricing](https://developers.cloudflare.com/browser-run/pricing/)
- [Cloudflare Free Plan](https://www.cloudflare.com/plans/free/)
- [Starlight Site Search](https://starlight.astro.build/guides/site-search/)

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，学习 Codex 教程站的内容分层、学习路线和资料索引方式。 |
| [cloudflare/skills](https://github.com/cloudflare/skills) | Cloudflare 官方 Agent Skills，适合给 Codex / Claude Code / Cursor / OpenCode 注入平台实践。 |
| [cloudflare/mcp](https://github.com/cloudflare/mcp) | Cloudflare Code Mode MCP Server，用少量工具覆盖 Cloudflare API。 |
| [cloudflare/mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare) | Cloudflare domain-specific MCP servers，覆盖 docs、bindings、builds、observability、AI Gateway 等。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Miniflare、Workers SDK 源码和 issue 入口。 |
| [cloudflare/workerd](https://github.com/cloudflare/workerd) | Workers JavaScript/Wasm runtime 的开源实现，适合理解运行时和 compatibility date。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | Cloudflare Workers 官方模板集合。 |
| [cloudflare/workers-rs](https://github.com/cloudflare/workers-rs) | Rust / WebAssembly 写 Workers 的生态入口。 |
| [cloudflare/workers-oauth-provider](https://github.com/cloudflare/workers-oauth-provider) | 在 Workers 上实现 OAuth 2.1 provider 的库，适合学习 API 鉴权边界。 |
| [cloudflare/agents](https://github.com/cloudflare/agents) | Agents SDK、Code Mode 和构建 Cloudflare agent 的实现参考。 |
| [cloudflare/templates/d1-template](https://github.com/cloudflare/templates/tree/main/d1-template) | Worker + D1 binding + migrations 的最小官方模板。 |
| [cloudflare/templates/d1-starter-sessions-api-template](https://github.com/cloudflare/templates/tree/main/d1-starter-sessions-api-template) | D1 Sessions API 和 Read Replication 官方模板。 |
| [cloudflare/templates/to-do-list-kv-template](https://github.com/cloudflare/templates/tree/main/to-do-list-kv-template) | Workers Static Assets + Remix + KV 的官方模板。 |
| [cloudflare/d1-northwind](https://github.com/cloudflare/d1-northwind) | D1 示例应用，适合学习数据导入、查询和前端组合。 |
| [cloudflare/workerskv.gui](https://github.com/cloudflare/workerskv.gui) | KV namespace 数据浏览器示例。 |
| [cloudflare/kv-worker-migrate](https://github.com/cloudflare/kv-worker-migrate) | 历史 KV namespace 迁移工具，适合了解迁移成本和一致性注意事项。 |
| [twikoojs/twikoo](https://github.com/twikoojs/twikoo) | 本站评论系统的开源来源。 |

## 写作规范

- 涉及时间敏感信息时写明最后核对日期。
- 官方事实和个人经验分开写。
- 不复制大段官方文档，只引用链接并解释实践场景。
- 发现过时内容时直接更新或删除。
