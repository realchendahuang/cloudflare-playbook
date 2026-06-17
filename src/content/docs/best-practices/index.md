---
title: 最佳实践
description: Cloudflare 项目的安全、成本、缓存、数据、部署和 Agent 协作实践入口。
---

最后核对日期：2026-06-17。

最佳实践页沉淀跨产品的判断顺序，避免每个案例都重复解释同一组问题。这里不追求“把所有 Cloudflare 产品都用上”，而是让普通项目知道先做什么、什么时候升级、哪些边界必须验证。

```text
入口先正确
  -> 静态优先
  -> 写接口设边界
  -> 数据按形态归位
  -> 成本可观察
  -> 变更可回滚
  -> Agent 必须查官方资料
```

## 最佳实践的定位

Cloudflare 官方的 Use cases 和 Solution guides 是从目标出发：保护 API、强制 HTTPS、保护表单、阻止账号接管、阻止恶意 bot。本站的最佳实践会把这些官方目标翻译成普通项目的执行顺序。

| 你在做什么 | 先读什么 | 读完要能判断什么 |
| --- | --- | --- |
| 给文档站、官网、博客选技术栈 | [本站技术栈](/best-practices/site-stack/) | 为什么当前用 Astro / Starlight / Workers Static Assets / Pagefind / Twikoo。 |
| 给个人项目或早期 SaaS 选 Cloudflare 产品 | [独立开发者推荐栈](/best-practices/indie-stack/) | 什么阶段只用免费能力，什么阶段再上 Workers Paid、Queues、Durable Objects。 |
| 用 Codex 长期维护 Cloudflare 项目 | [Codex 协作](/best-practices/codex-cloudflare/) | 什么时候查 `llms.txt`、什么时候看 GitHub 源仓库、什么时候用 Wrangler 验证。 |
| 上线前检查安全边界 | [安全边界](/best-practices/security/) | 公开入口、写接口、后台、API、密钥、观测分别应该放在哪一层。 |
| 控制账单和免费额度风险 | [成本控制](/best-practices/cost/) | 哪些请求、CPU、存储、构建、AI、日志和安全能力会触发成本。 |
| 先理解额度全图 | [免费与付费边界](/platform/free-paid/) | Free、Workers Paid、Pro/Business/Enterprise、usage-based billing 的边界。 |

## 按阶段阅读

| 阶段 | 推荐动作 | 不要急着做 |
| --- | --- | --- |
| 接入域名 | DNS 托管、Web 记录 Proxied、SSL/TLS Full (strict)、源站保护。 | 直接写复杂 Worker 或复制企业网络架构。 |
| 发布内容 | 静态站优先 Workers Static Assets 或 Pages；搜索优先 Pagefind。 | 让每个静态请求都进入 Worker 脚本。 |
| 增加写接口 | 登录、评论、表单、上传、Webhook 先做鉴权、限流、Turnstile 或签名校验。 | 匿名无限写入、无限 AI 调用、无限文件上传。 |
| 存数据 | 关系数据进 D1，文件进 R2，配置和读多写少数据进 KV，房间状态进 Durable Objects。 | 用一个产品硬扛所有数据形态。 |
| 做异步 | 邮件、导入、通知、审核、转码、AI 批处理放 Queues 或 Cron。 | 在用户请求里同步跑慢任务。 |
| 产品化 | 加 Workers Paid、Workers Logs、Access、API Shield、Analytics Engine、AI Search 或 Vectorize。 | 在没有真实压力前购买复杂度。 |

## 按风险域检查

| 风险域 | 最小做法 | 对应专题 |
| --- | --- | --- |
| 入口风险 | Web 记录走 Cloudflare，源站不暴露公网，TLS 链路完整。 | [安全边界](/best-practices/security/)、[Fundamentals](/platform/fundamentals/) |
| 静态成本 | 静态资源直接由 Assets / Pages 服务，`run_worker_first` 只给必要路径。 | [成本控制](/best-practices/cost/)、[Workers Static Assets](/platform/static-assets/) |
| 写入滥用 | 登录、评论、表单、上传、搜索、AI 调用设置限流和服务端验证。 | [安全边界](/best-practices/security/)、[WAF](/platform/waf/) |
| 数据性能 | D1 高频查询建索引并验证 query plan；R2 浏览器访问配置 CORS 和短期授权。 | [数据产品](/platform/data/)、[D1](/platform/d1/)、[R2](/platform/r2/) |
| 密钥泄露 | 生产密钥使用 `wrangler secret` 或 Secrets Store，不进源码、配置和日志。 | [Codex 协作](/best-practices/codex-cloudflare/)、[安全边界](/best-practices/security/) |
| 部署漂移 | `wrangler.jsonc` 是部署真源；环境、bindings、routes、custom domain 要可复核。 | [本站技术栈](/best-practices/site-stack/)、[Codex 协作](/best-practices/codex-cloudflare/) |
| 账单失控 | 先看 Billable Usage、Budget alerts、Pricing / Limits，再决定优化或付费。 | [成本控制](/best-practices/cost/)、[Billing](/platform/billing/) |
| Agent 误写 | Codex 先读官方 Markdown、产品级 `llms.txt`、GitHub 源目录，再动代码或文章。 | [Codex 协作](/best-practices/codex-cloudflare/)、[Cloudflare 文档地图](/reference/cloudflare-docs-map/) |

## Workers 项目底线

官方 Workers Best Practices 里最适合写进项目规则的底线是：

| 主题 | 本站收敛后的规则 |
| --- | --- |
| 兼容性日期 | 新项目用当前日期；旧项目升级前单独验证。 |
| Node 兼容 | 依赖 Node 内置模块或现代 npm 包时显式启用 `nodejs_compat`。 |
| 类型 | 不手写 `Env`，用 `wrangler types` 从真实配置生成。 |
| 密钥 | 生产密钥用 `wrangler secret` 或 Secrets Store；本地密钥文件不提交。 |
| 环境 | staging、production 的 bindings 和 vars 明确声明，不假设自动继承。 |
| 路由 | Custom domain 表示 Worker 是 origin；route 表示 Worker 在已有源站前面。 |
| 大 body | 代理、大文件、下载和上传优先 stream，并在读取前限制大小。 |
| 静态资产 | 静态请求尽量直接命中 Assets，只有动态路径进入 Worker 脚本。 |

## 每次交付前检查

每次修改 Cloudflare 项目，至少检查这些问题：

- 这次改动有没有查官方 docs、产品级 `llms.txt` 或页面级 Markdown。
- 涉及价格、额度、限制、配置字段、计划边界时，是否回到官方 Pricing / Limits。
- 静态资源是否绕开 Worker 脚本，动态路径是否有明确路由。
- 写接口是否有身份、速率、大小、幂等或人工处理边界。
- D1 查询是否有必要索引，R2 浏览器访问是否有 CORS 和授权边界。
- 生产密钥是否没有进入仓库、前端包、日志和 Markdown。
- 是否运行构建、类型检查、部署，并验证线上 URL。
- 是否把来源写进文章或 [官方资料](/reference/)。

## 和本站当前阶段的关系

Cloudflare Playbook 当前是开源文档站，所以最佳实践的优先级很明确：

| 模块 | 当前选择 | 原因 |
| --- | --- | --- |
| 文档页面 | Astro + Starlight + Workers Static Assets | 静态内容优先，部署在 Cloudflare Worker 上，后续可继续接 API。 |
| 搜索 | Pagefind | 构建期索引，不占后端请求，不制造额外账单。 |
| 评论 | Twikoo + twikoo-cloudflare + D1 | 复用成熟组件，评论服务托管在 Cloudflare。 |
| 主题 | Starlight Theme Next + Cloudflare 主题变量 | 复用成熟主题，只做品牌色收敛。 |
| 后续增强 | Turnstile、AI Gateway、AI Search / Vectorize | 等评论量、搜索需求和内容规模真实出现后再加。 |

## 官方资料

- [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Cloudflare Use cases Solution guides](https://developers.cloudflare.com/use-cases/solutions/)
- [Workers Static Assets Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [WAF Rate limiting best practices](https://developers.cloudflare.com/waf/rate-limiting-rules/best-practices/)
- [DDoS proactive defense](https://developers.cloudflare.com/ddos-protection/best-practices/proactive-defense/)
- [Protect your origin server](https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/)
- [D1 use indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/)
- [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/)
- [Cloudflare Docs for agents](https://developers.cloudflare.com/docs-for-agents/)

## GitHub 开源参考

- [cloudflare-docs Workers best practices source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workers/best-practices)
- [cloudflare-docs D1 best practices source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/d1/best-practices)
- [cloudflare-docs WAF rate limiting best practices source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/waf/rate-limiting-rules/best-practices.mdx)
- [cloudflare-docs Use cases solution guides source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/use-cases/solutions)
- [cloudflare/templates](https://github.com/cloudflare/templates)
- [cloudflare/skills](https://github.com/cloudflare/skills)
- [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk)
- [cloudflare/mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare)
- [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide)
