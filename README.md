# Cloudflare Playbook

Cloudflare Playbook 是一个面向普通开发者、独立开发者和小团队的 Cloudflare 最佳实践知识库。它不只罗列产品名，而是帮助读者理解 Workers、Pages、D1、KV、R2、Durable Objects、Queues、AI、安全、缓存、部署和可观测性在真实项目里应该怎么选、怎么组合、怎么验证。

这个仓库使用 Astro + Starlight 搭建文档站，并使用 Cloudflare Workers Static Assets + D1 承载评论 API。它不是只放静态页面，而是一个 Worker-first 的 Cloudflare 最佳实践样板。

## 当前定位

- **产品地图**：解释 Cloudflare 主要产品各自解决什么问题。
- **架构模式**：整理静态站点、API 网关、SaaS 后端、实时应用、AI 应用、文件服务等常见组合。
- **最佳实践**：沉淀成本、安全、缓存、可观测性、部署和回滚经验。
- **实战案例**：用可复现步骤展示如何把产品组合落到代码和配置里。
- **资料索引**：优先链接 Cloudflare 官方文档、变更日志和可验证来源。

## 当前技术栈

```text
Astro + Starlight
  ├─ Markdown / MDX 文档
  ├─ Pagefind 站内搜索
  └─ dist 静态资产

Cloudflare Worker
  ├─ Workers Static Assets 托管文档站
  └─ /api/comments 评论接口

Cloudflare D1
  └─ comments 评论表
```

搜索先使用 Starlight 默认的 Pagefind，评论使用 Worker API + D1。等内容规模变大后，再评估 Cloudflare AI Search 做自然语言搜索。

## 内容结构

```text
Cloudflare Playbook
├─ start              # 学习路线和入门顺序
├─ platform           # Workers、Pages、数据、AI 等产品地图
├─ architecture       # 常见 Cloudflare 架构模式
├─ best-practices     # 安全、成本、缓存、部署等实践原则
├─ recipes            # 可复现的实战案例
└─ reference          # 官方资料和事实来源
```

## 本地开发

环境要求：

- Node.js >= 22.12.0
- pnpm 10+

```bash
pnpm install
pnpm dev
```

构建静态站点：

```bash
pnpm build
```

本地预览构建产物：

```bash
pnpm preview
```

## D1 评论数据库

第一次部署前需要创建 D1 数据库，并把输出的 `database_id` 填入 `wrangler.jsonc`。

```bash
pnpm exec wrangler d1 create cloudflare-playbook
pnpm exec wrangler d1 migrations apply cloudflare-playbook --remote
```

本地调试评论 API 时，可以先应用本地迁移：

```bash
pnpm exec wrangler d1 migrations apply cloudflare-playbook --local
pnpm worker:dev
```

## 部署到 Cloudflare Workers

构建并部署：

```bash
pnpm build
pnpm run deploy
```

`wrangler.jsonc` 是部署配置真源，当前包含：

```text
assets.directory = ./dist
assets.run_worker_first = /api/*
d1_databases.binding = DB
routes.pattern = cloudflare-playbook.chendahuang.top
```

## 写作原则

- 官方事实优先：限制、价格、API、配置字段必须回到 Cloudflare 官方文档核对。
- 面向普通人：先解释“什么时候用”和“什么时候不用”，再给配置和代码。
- 保持可复现：案例需要包含环境、输入、关键配置、验证方式和风险提示。
- 不确定就标注：无法确认的内容写成 `TODO`，不要写成确定结论。
- 过时就更新：Cloudflare 产品变化快，旧结论要及时修订或删除。

## 贡献方向

欢迎补充：

- 某个 Cloudflare 产品的入门解释。
- 一个真实架构的产品组合图和取舍说明。
- 一个可跑通的 Workers / Pages / D1 / R2 / Durable Objects 案例。
- 成本、安全、缓存、日志、回滚相关的踩坑记录。
- 官方文档更新后的同步修订。
