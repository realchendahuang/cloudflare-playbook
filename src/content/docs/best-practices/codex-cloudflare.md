---
title: Codex 协作
description: 用 Codex 维护 Cloudflare 项目时的资料来源、工具边界和交付原则。
---

最后核对日期：2026-06-18。

Cloudflare 官方已经把 Codex、Cloudflare Skills、MCP、Wrangler 和 agent-friendly docs 放在同一套工作流里。这里不复刻安装命令，只整理普通项目真正需要遵守的协作原则。

一句话：**Codex 可以帮你写代码和文章，但不能替你猜 Cloudflare 的价格、限制、配置字段和产品状态。**

## 工具分工

| 工具 | 负责什么 | 不负责什么 |
| --- | --- | --- |
| Cloudflare Skills | 给 Codex 提供 Cloudflare 产品边界和项目判断。 | 替代官方 pricing、limits 和 changelog。 |
| Cloudflare Docs MCP | 读取当前官方文档。 | 直接修改你的 Cloudflare 账号资源。 |
| Cloudflare Code Mode MCP | 通过 Cloudflare API 管理账号资源。 | 替代代码审查、架构判断和权限治理。 |
| Domain-specific MCP servers | 针对绑定、构建、观测、日志等产品域给出实时信息。 | 跨产品做完整架构设计。 |
| Wrangler | 本地开发、类型、迁移、部署和日志闭环。 | 替代仓库里的配置真源。 |
| 官方 GitHub 仓库 | 需要追踪文档修改历史、模板或 SDK 结构时再查看。 | 替代项目自己的约束和读者需求。 |

## 推荐顺序

| 步骤 | Codex 应该做什么 |
| --- | --- |
| 1. 先读项目 | 看目录、现有文章、`package.json`、`wrangler.jsonc` 和部署方式。 |
| 2. 再查官方 | 价格、额度、limits、beta 状态、配置字段和权限名回到 Cloudflare Markdown 文档。 |
| 3. 再看开源 | 必要时查看官方仓库，核对文档历史、模板结构和工具边界。 |
| 4. 再做修改 | 只改当前问题需要的文章、配置或代码。 |
| 5. 最后验证 | 构建、类型检查、部署和线上页面都要形成闭环。 |

如果 Context7、Docs MCP 或外部检索工具不可用，就降级到 Cloudflare 官方 Markdown 页面和 `cloudflare/cloudflare-docs` 源仓库；不能因为工具失败就靠记忆补数字。

## 必须查官方的内容

| 内容 | 为什么 |
| --- | --- |
| 免费额度和付费边界 | Cloudflare 的 Free、Workers Paid、zone plan、add-on 和 Enterprise 经常被混在一起。 |
| pricing 和 limits | 这些数字会变化，不能靠旧知识。 |
| beta、open beta、private beta、deprecated | 产品状态会影响是否适合放进普通项目。 |
| Wrangler 配置字段 | 新能力经常先出现在最新 Wrangler 和配置 schema 里。 |
| Workers binding | D1、R2、KV、AI、Durable Objects、Queues 的 binding 形态必须按当前文档核对。 |
| Cloudflare API | 账号资源操作要看官方 API、MCP 或 OpenAPI schema。 |
| 安全策略 | WAF、Access、Turnstile、API Shield、Secrets Store 的默认动作和计划边界必须核对。 |

## 写内容的规则

| 规则 | 落地方式 |
| --- | --- |
| 先讲读者问题 | 不从产品名开始堆，先回答“普通项目要不要用”。 |
| 先讲免费边界 | 能 0 元验证就先 0 元验证，5 USD/month Workers Paid 只在真实瓶颈出现后再讲。 |
| 少放实现细节 | 概念页不放命令、配置示例和 API 字段表；实战案例页才保留必要代码。 |
| 只写读者需要看到的内容 | 前端文案面向读者，不写维护者的临时计划、约束和过程。 |
| 来源要清楚 | 文章末尾保留官方文档、Pricing / Limits 和关键事实来源。 |

## 写 Worker 代码的底线

| 主题 | 最低要求 |
| --- | --- |
| 兼容性日期 | 新项目使用当前日期；旧项目升级前单独验证。 |
| Node 兼容 | 依赖 Node 内置模块或现代 npm 包时显式开启。 |
| 类型 | 绑定类型从 Wrangler 配置生成，不手写一份容易漂移的 `Env`。 |
| 密钥 | 生产密钥放 Cloudflare secrets 或 Secrets Store，不进入仓库、文档和日志。 |
| 静态资产 | 文档、官网、SPA 默认走 Workers Static Assets 或 Pages，避免让静态请求进入 Worker 脚本。 |
| 大响应 | 代理、大文件和下载优先流式处理，不把整个 body 读进内存。 |
| 全局状态 | 全局只放可复用、无用户私密信息的对象。 |
| 日志 | 记录 request id、路径、状态、耗时和错误类型，不记录 token、cookie、密钥和正文隐私。 |

## 交付检查

| 检查项 | 要确认什么 |
| --- | --- |
| 官方来源 | 是否查过 Cloudflare Markdown、`llms.txt`、Pricing / Limits 或线上官方文档。 |
| 变更范围 | 是否只改了当前任务需要的页面、配置或代码。 |
| 免费额度 | 是否说明 Free、Workers Paid、usage-based 和 Enterprise 的边界。 |
| 静态与动态 | 静态资产和 Worker 动态请求是否分清。 |
| 安全 | 是否避免泄露密钥、token、cookie、内部路径和临时说明。 |
| 验证 | 是否完成构建、类型检查、部署和线上核对。 |

## 事实来源

- [Codex + Cloudflare](https://developers.cloudflare.com/agent-setup/codex/)
- [Cloudflare Agent Setup Prompt](https://developers.cloudflare.com/agent-setup/prompt.md)
- [Cloudflare Docs for Agents](https://developers.cloudflare.com/docs-for-agents/)
- [Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)
- [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [MCP servers for Cloudflare](https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/)
- [Cloudflare API OpenAPI specification](https://github.com/cloudflare/api-schemas)
