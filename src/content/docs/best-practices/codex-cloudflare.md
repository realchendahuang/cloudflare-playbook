---
title: Codex 协作
description: 用 Codex 写 Cloudflare 项目时的资料来源、工具边界和交付流程。
---

最后核对日期：2026-06-17。

Cloudflare 官方已经把 Codex、Cloudflare Skills、MCP、Wrangler 和 agent-friendly docs 放在同一套工作流里。对这个仓库来说，最佳实践不是让 AI 直接“凭感觉写 Cloudflare”，而是让 Codex 先接入官方知识源，再用 Wrangler 和线上验证闭环。

## 推荐工作流

```text
需求
  └─ 读项目规则和现有代码
      └─ 查 Cloudflare 官方 docs / llms.txt
          └─ 参考 GitHub 开源实现
              └─ 修改代码或文章
                  └─ pnpm build / typecheck
                      └─ wrangler deploy
                          └─ 线上验证
```

## 工具分工

| 工具 | 用途 | 适合做什么 |
| --- | --- | --- |
| Cloudflare Skills | 给 Codex 提供平台级判断规则。 | 判断 Workers、D1、R2、KV、Durable Objects、AI、WAF 等产品怎么选。 |
| Cloudflare Docs MCP | 获取当前官方文档。 | 查限制、价格、配置字段、兼容性日期、最佳实践。 |
| Cloudflare Code Mode MCP | 用少量工具覆盖 Cloudflare API。 | 管理 DNS、Workers、D1、R2、WAF、日志等平台资源。 |
| Domain-specific MCP servers | 针对某个产品域的专用工具。 | Workers bindings、builds、observability、AI Gateway、DNS analytics 等。 |
| Wrangler | 本地开发、部署、迁移和日志。 | `wrangler deploy`、`wrangler d1 execute`、`wrangler tail`、`wrangler types`。 |
| GitHub 开源仓库 | 学习真实项目结构。 | 看官方模板、SDK、MCP、Skills、评论系统和参考教程。 |

## Cloudflare 官方建议

Cloudflare 的 Codex setup 页给出的重点可以收敛成四件事：

1. 在项目根目录启动 Codex，确保它能看到 `wrangler.jsonc`、源码和文档。
2. 安装 Cloudflare plugin 或 Cloudflare Skills，让 Codex 按 Cloudflare 的产品边界工作。
3. 连接 Cloudflare MCP servers，尤其是 docs、bindings、builds、observability。
4. 部署和迁移仍然走 Wrangler，配置真源仍然放在仓库里。

官方 Agent Setup Prompt 还给了更直接的操作口径：Cloudflare Skills 提供平台判断，Cloudflare Code Mode API MCP 负责调用 Cloudflare API，Cloudflare Docs MCP 负责拉当前文档，Wrangler 负责本地开发、部署、迁移和日志。Codex 如果担心拿到过时信息，应优先走 Docs MCP，或者直接读取 `developers.cloudflare.com/llms.txt` 和产品级 `llms.txt`。

官方站对 Agent 读取文档还有一个很实用的约定：任意 Cloudflare docs 页面都可以追加 `/index.md` 读取干净的 Markdown；每个顶级产品也有自己的 `llms.txt`，适合先拿索引再深入。涉及价格、免费额度、limits、beta 状态、配置字段、权限名和 API shape 时，不要让 Codex 靠训练记忆回答，必须回到这些官方入口核对。

| 官方能力 | 普通项目怎么用 |
| --- | --- |
| Cloudflare Skills | 让 Codex 先知道 Workers、D1、R2、KV、WAF、DDoS、Terraform 等产品边界。 |
| Code Mode API MCP | 管 DNS、WAF、Zero Trust、账号资源这类 Cloudflare API 操作；官方描述它用较小上下文覆盖大量 Cloudflare API。 |
| Docs MCP | 查最新 limits、pricing、配置字段、兼容性日期和产品状态。 |
| Bindings MCP | 写 Workers 时核对 D1、R2、KV、AI、Durable Objects 等 binding。 |
| Builds MCP | 查看 Workers Builds 状态，定位构建失败。 |
| Observability MCP | 查 Worker 日志、错误和线上运行状态。 |
| Wrangler | `deploy`、`tail`、`d1 migrations`、`secret`、`types` 这类本地和部署动作；统一 `cf` CLI 还在技术预览时，生产交付仍以 Wrangler 为稳定闭环。 |

官方 Workers Best Practices 也给出了一组很适合写进项目规则的底线：

| 主题 | 实践 |
| --- | --- |
| 兼容性日期 | 新项目把 `compatibility_date` 设为当前日期，旧项目定期升级。 |
| Node 兼容 | 依赖 Node 内置模块的项目启用 `nodejs_compat`。 |
| 类型 | 不手写 `Env`，用 `wrangler types` 从配置生成绑定类型。 |
| 密钥 | 生产密钥用 `wrangler secret` 或 Cloudflare secret，不写进源码和配置。 |
| 静态资产 | 新项目优先 Workers Static Assets；静态请求不要进入 Worker 脚本。 |
| 流式处理 | 大响应、大文件和代理场景优先 stream，不要把整个 body 读进内存。 |
| 全局状态 | 不把 request-scoped state 放在全局变量，避免跨请求泄漏。 |
| 可观测性 | 日志结构化，错误要能从 Workers Logs / Observability 定位。 |

## 额度核对口径

Codex 写 Cloudflare 项目时，最容易犯的错不是语法，而是把“可用”“免费”“Workers Paid 可用”“Enterprise-only”混在一起。后续每篇文章都按这个顺序核对：

| 口径 | 要核对什么 |
| --- | --- |
| Free plan | 是否有每日、每月、每账号、每 zone、每 namespace 限制。 |
| Workers Paid | 是否真由 `$5/month` Workers Paid 解锁，还是仍然需要 Pro、Business、Enterprise 或单独 add-on。 |
| Usage-based | 超出 included usage 后按什么维度收费：request、CPU ms、GB-month、operation、email、data scanned、log event。 |
| Beta / Preview | 是否处于 beta、open beta、private beta，是否当前暂不计费，是否有正式计费前通知。 |
| 产品组合 | 一个功能是否会叠加多个产品费用，比如 Sandbox SDK 可能同时涉及 Containers、Workers、Durable Objects 和 Workers Logs。 |

## 资料优先级

| 优先级 | 来源 | 用法 |
| --- | --- | --- |
| 1 | Cloudflare 官方文档 Markdown / `llms.txt` | 限制、价格、API、配置字段以这里为准。 |
| 2 | Cloudflare 官方 GitHub 仓库 | 学项目结构、模板、SDK 和当前推荐方式。 |
| 3 | 原始教程仓库 | 学内容组织、读者路径和开源文档维护方式。 |
| 4 | 社区项目 | 学真实取舍，但不要直接照抄架构。 |

## GitHub 开源参考

| 仓库 | 值得参考的点 |
| --- | --- |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，适合学习“学习路线、入口地图、配置专题、实践方法、实战案例、资料索引”的内容分层。 |
| [cloudflare/skills](https://github.com/cloudflare/skills) | Cloudflare 官方 Agent Skills，覆盖 Workers、Pages、D1、R2、AI、安全、Wrangler 等主题。 |
| [cloudflare/mcp](https://github.com/cloudflare/mcp) | Cloudflare Code Mode MCP Server，用少量工具覆盖大量 Cloudflare API。 |
| [cloudflare/mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare) | Cloudflare domain-specific MCP servers，适合按产品域做观测、构建、绑定和日志操作。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Miniflare、Workers SDK 的源头，遇到 CLI 行为和 issue 时优先看。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | 官方 Workers 模板集合，适合学习 full-stack Workers 项目结构和测试方式。 |
| [cloudflare/agents](https://github.com/cloudflare/agents) | Agents SDK 和 Code Mode 相关实现，适合后续写 AI agent / MCP 案例。 |
| [twikoojs/twikoo](https://github.com/twikoojs/twikoo) | 本站评论系统来源，适合验证评论组件能力、管理后台和部署方式。 |

## 交付检查

每次让 Codex 修改 Cloudflare 项目，至少检查：

- 是否查过官方 docs 或 `llms.txt`，尤其是价格、限制、配置字段。
- 是否优先读取 Markdown 版官方文档，也就是 `index.md` 或产品级 `llms.txt`。
- 是否沿用现有 `wrangler.jsonc`、`package.json`、目录结构和部署方式。
- 是否避免把密钥、实现细节、临时说明写进前端文案。
- 是否把静态资产和动态 Worker 请求分开。
- 是否运行 `pnpm build`、必要时运行 `pnpm typecheck`。
- 是否部署到 Cloudflare 后验证线上 URL。
- 是否把参考来源放进文章末尾或资料索引。

## 事实来源

- [Codex + Cloudflare](https://developers.cloudflare.com/agent-setup/codex/)
- [Cloudflare Agent Setup Prompt](https://developers.cloudflare.com/agent-setup/prompt.md)
- [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Cloudflare Docs for Agents](https://developers.cloudflare.com/docs-for-agents/)
- [Cloudflare Skills](https://github.com/cloudflare/skills)
- [Cloudflare MCP Server](https://github.com/cloudflare/mcp)
- [Cloudflare MCP Server Collection](https://github.com/cloudflare/mcp-server-cloudflare)
- [MCP servers for Cloudflare](https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/)
