---
title: 静态内容站
description: 用 Cloudflare Pages 或 Workers Static Assets 部署文档站、官网、博客和知识库的架构模式。
---

最后核对日期：2026-06-17。

静态内容站是普通人最容易从 Cloudflare 获益的架构。文档站、官网、博客、作品集和知识库都可以先把阅读路径做成静态资产：页面、CSS、JS、图片和搜索索引直接从 Cloudflare 网络返回；评论、表单、搜索增强、文件权限和后台任务再交给 Worker。

这类站点的核心不是“没有后端”，而是把后端放在真正需要写入、鉴权、计算或访问数据的路径上。

## 架构

```text
Git / CI / 本地构建
  │
  └─ 生成 dist
      │
      ▼
Cloudflare
  ├─ 静态阅读路径
  │    ├─ Workers Static Assets / Pages
  │    ├─ Cache / CDN
  │    └─ Web Analytics
  │
  ├─ 动态写入路径
  │    ├─ Worker API
  │    ├─ D1 / KV / Queues
  │    └─ Turnstile / WAF / Rate Limiting
  │
  └─ 文件与搜索增强
       ├─ R2 / Images
       └─ AI Search / Vectorize
```

Cloudflare 官方 “Deploy frontend applications” 页面现在把前端部署重点放在 Workers：Git 集成、预览部署、300+ edge locations、静态资源和 API routes 可以放在同一次部署里。Pages 仍然适合纯静态站和 PR 预览；一旦项目需要同仓库 Worker API、D1、R2、AI Gateway 或队列，Workers Static Assets 更适合作为长期真源。

## 两种部署入口

| 入口 | 适合 | 不适合 | 判断 |
| --- | --- | --- | --- |
| Workers Static Assets | 文档站 + API、SPA + Hono、评论、表单、文件权限、AI 搜索代理。 | 只想要最简单 Git 静态托管，且不需要 Worker 绑定。 | `wrangler.jsonc` 成为配置真源，静态资产和 Worker 一起部署。 |
| Pages | 纯静态文档、官网、博客、营销页、PR 预览优先的项目。 | 绑定越来越多、API 越来越重、希望 Worker-first 管理所有能力。 | Git 工作流轻，静态资产请求同样免费；Functions 请求按 Workers 口径。 |

这不是二选一的信仰题。早期只写内容，可以用 Pages；如果项目本身要展示 Cloudflare Worker 最佳实践，或者后续会接 D1、R2、AI Search、Queues，就优先用 Workers Static Assets。

## 请求路径

| 路径 | 推荐处理方式 | 成本和风险 |
| --- | --- | --- |
| `/`、`/docs/*`、`/assets/*` | 静态资产直接返回。 | 静态资产请求免费且不限量，不进入 Worker 脚本。 |
| `/pagefind/*` | 构建期搜索索引。 | 用户搜索在浏览器本地完成，不消耗后端请求。 |
| `/api/*` | Worker API。 | 进入 Workers 请求和 CPU 计费，需要日志、限流和错误处理。 |
| `/comments/*` | Twikoo Cloudflare Worker 或独立评论 Worker。 | 评论数据进 D1，写入口要考虑 Turnstile 和管理策略。 |
| `/files/*` | Worker + R2。 | Worker 做权限和签名，文件本体不要塞进静态站 bundle。 |
| `/admin/*` | Worker + Access / Tunnel。 | 后台必须先有身份边界，再谈业务功能。 |

最容易踩坑的是 `run_worker_first`。它可以让请求先进入 Worker，但 Free 额度下匹配路径会真实调用 Worker；超过免费请求限制时会返回错误，而不是自动退回静态资产服务。所以它应该用于少数明确动态路径，不应该套住整站阅读流量。

## 产品组合

| 场景 | 推荐组合 | 判断 |
| --- | --- | --- |
| 纯文档站、官网、博客 | Astro / Starlight / VitePress / Docusaurus + Pages 或 Workers Static Assets | 先把构建、部署、域名、缓存和 404 跑通。 |
| 文档站 + 普通搜索 | Starlight / Astro + Pagefind | 免费、静态、低复杂度；内容少时不要先上向量库。 |
| 文档站 + 自然语言搜索 | Workers Static Assets + AI Search 或 Vectorize + AI Gateway | 内容足够多、用户开始用自然语言提问时再加。 |
| 内容站 + 评论 / 表单 | Workers Static Assets + Twikoo Cloudflare 或 Worker API + D1 | 写入口单独保护，阅读路径继续保持静态。 |
| 文件下载和附件 | Workers Static Assets + R2 | R2 存对象，Worker 管权限、签名、元数据和缓存策略。 |
| 私有管理台 | Workers Static Assets + Access / Tunnel + D1 | 不自写弱登录，不把后台裸露公网。 |

## 本仓库的路径

这个仓库作为 Cloudflare 最佳实践开源站，当前技术栈应该服务内容和示范价值：

| 能力 | 当前选择 | 原因 |
| --- | --- | --- |
| 文档框架 | Astro + Starlight | Markdown / MDX 友好，侧边栏、SEO、搜索和开源协作都成熟。 |
| 主题 | Starlight Theme Next + Cloudflare 橙色主题变量 | 复用成熟文档主题，只做品牌色收敛。 |
| 搜索 | Pagefind | 构建期索引，读者搜索不打 Worker API。 |
| 部署 | Workers Static Assets | 静态站和后续 Worker 能力保持同一部署模型。 |
| 评论 | Twikoo + twikoo-cloudflare + D1 | 复用成熟评论组件，服务托管在 Cloudflare。 |
| 后续增强 | AI Search / Vectorize | 等内容规模和问题形态明确后再引入。 |

## 成本边界

| 成本项 | 免费 / included 口径 | 实践判断 |
| --- | --- | --- |
| 静态资产请求 | Workers Static Assets 和 Pages 的静态资产请求免费且不限量。 | 文档、官网、博客的主流量应该停在这一层。 |
| Workers Free | 100,000 requests/day，10 ms CPU/invocation。 | 评论、表单、Webhook、小 API 可以先跑；公开写入口要限流。 |
| Workers Paid | 每账号每月最低 `$5`，包含 10M requests/month、30M CPU ms/month。 | API 稳定有人用、CPU 超 Free、日志和队列变重要时再升。 |
| Static Asset 文件 | Free 20,000 files/Worker version，Paid 100,000 files/Worker version，单文件 25 MiB。 | 大量图片、附件、导出物进 R2，不进站点 bundle。 |
| Pages 文件 | Free 20,000 files/site，Paid 100,000 files/site，单文件 25 MiB。 | 纯静态站够用；大文件仍然放 R2。 |
| R2 | Standard free tier 有 10 GB-month、1M Class A、10M Class B，egress 免费。 | R2 不是完全免费，公开下载热点要看 Class B。 |
| D1 | Free 5M rows read/day、100k rows written/day、5 GB total storage。 | 评论、表单、小型后台适合；高频分析和大表扫描不适合。 |

成本纪律很简单：静态阅读不要消耗动态请求，文件不要进数据库，用户上传不要进 Git，AI 搜索不要在内容还少的时候提前上线。

## 安全边界

| 边界 | 做法 |
| --- | --- |
| 公开阅读 | 尽量只走静态资产、缓存和 Web Analytics。 |
| 评论 / 表单 | Worker API、D1、Turnstile、Rate Limiting、管理策略分开设计。 |
| 文件上传 | Worker 生成签名或受控入口，R2 bucket 不开放任意写入。 |
| 管理后台 | Access / Tunnel 先挡在前面，再实现业务权限。 |
| 密钥 | 前端不放密钥，生产密钥用 Wrangler secrets 或 Cloudflare Secrets Store。 |
| 日志 | 记录路径、状态、耗时和 request id，不记录 token、cookie 和正文隐私。 |

## 验证清单

| 检查 | 怎么看 |
| --- | --- |
| 静态资源是否上线 | 访问首页、随机文章、`404.html`、CSS / JS / 图片路径。 |
| 标题是否重复 | 每个生成页面只应有一个 `<h1>`。 |
| 搜索是否可用 | 构建后检查 Pagefind 索引文件，线上搜索关键字能命中文章。 |
| Worker 是否只跑必要路径 | 对普通文章和 `/api/*` 分别请求，观察 Workers Logs 或响应头。 |
| 缓存是否合理 | 静态 hash 资源长缓存，HTML 保持可更新。 |
| 评论是否独立 | 评论服务异常时，文档阅读路径不应该被拖垮。 |
| 大文件是否离站点 | 附件、图片原图、导出物从 R2 或媒体产品提供，不进入 `dist`。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，适合看教程站的信息架构和学习路线组织。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | Cloudflare 官方 Workers 模板集合，覆盖 Astro、Vite、D1、R2、Hono、React Router 等项目结构。 |
| [cloudflare/templates/astro-blog-starter-template](https://github.com/cloudflare/templates/tree/main/astro-blog-starter-template) | Astro 静态内容站部署到 Workers Static Assets 的官方模板。 |
| [cloudflare/templates/vite-react-template](https://github.com/cloudflare/templates/tree/main/vite-react-template) | React + Vite + Hono + Workers 的 full-stack 模板，适合看 `/api/*` 分层。 |
| [cloudflare/templates/react-router-hono-fullstack-template](https://github.com/cloudflare/templates/tree/main/react-router-hono-fullstack-template) | React Router + Hono + shadcn/ui + Workers 的完整前后端模板。 |
| [twikoojs/twikoo-cloudflare](https://github.com/twikoojs/twikoo-cloudflare) | Twikoo 评论服务在 Cloudflare Workers + D1 上的部署实现。 |
| [cloudflare/cloudflare-docs Static Assets source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workers/static-assets) | 官方 Static Assets 文档源文件，适合追踪路由、计费和配置变更。 |
| [cloudflare/cloudflare-docs Pages source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/pages) | 官方 Pages 文档源文件，适合追踪 Pages limits、Functions 和迁移说明。 |

## 官方资料

- [Deploy frontend applications](https://developers.cloudflare.com/use-cases/web-apps/deploy-frontend/)
- [Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Static Assets billing and limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Static Assets routing](https://developers.cloudflare.com/workers/static-assets/routing/)
- [Static Assets SPA routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Static Assets SSG and custom 404](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
- [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
