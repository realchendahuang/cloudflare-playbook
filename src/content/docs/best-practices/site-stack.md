---
title: 本站技术栈
description: Cloudflare Playbook 当前阶段使用的文档、搜索、评论、主题和部署组合。
---

最后核对日期：2026-06-17。

这不是一个单纯的文档站选型，而是这个仓库自己的 Cloudflare 最佳实践样板：正文尽量静态化，交互能力拆到独立 Worker，费用边界先落在免费额度内，未来再按需求接入 AI Search、R2、Queues 或更多 Worker API。

## 一句话结论

当前最合适的组合是：

```text
内容层
  └─ Astro + Starlight + Markdown / MDX
      ├─ Starlight 负责导航、SEO、搜索入口和文档体验
      ├─ Starlight Theme Next 负责成熟主题骨架
      └─ Cloudflare 橙色主题变量负责品牌识别

构建层
  └─ astro build
      ├─ 生成 dist 静态资产
      └─ Starlight 默认生成 Pagefind 搜索索引

部署层
  └─ Cloudflare Worker
      ├─ Workers Static Assets 托管 dist
      ├─ ASSETS binding 服务静态页面
      └─ wrangler.jsonc 作为部署真源

评论层
  └─ Twikoo 官方前端组件
      └─ twikoo-cloudflare Worker
          └─ Cloudflare D1 保存评论数据
```

核心判断：**让读文档这条主路径保持静态，让评论、搜索增强和未来 API 走明确的动态边界。** 这比把所有东西都塞进同一个前端组件、同一个 Worker 入口或一套自写 UI 更稳。

## 请求路径

```text
读者
  └─ cloudflare-playbook.chendahuang.top
      └─ Cloudflare edge
          ├─ 命中静态文件
          │    └─ Workers Static Assets 直接返回 HTML / CSS / JS / Pagefind 索引
          ├─ 进入评论区
          │    └─ Twikoo 懒加载
          │        └─ comments.cloudflare-playbook.chendahuang.top
          │            └─ 评论 Worker
          │                └─ D1
          └─ 未来自然语言搜索
               └─ 独立搜索 API
                   └─ AI Search / AI Gateway
```

这条路径对应 Cloudflare 官方的计费边界：静态资产请求免费且不限量，只有请求进入 Worker 脚本、D1、AI、日志或其它动态产品时才进入对应额度。

## 选择原则

| 原则 | 本站落地 |
| --- | --- |
| 不手搓文档框架 | 用 Astro + Starlight，而不是自己写导航、搜索、目录、SEO 和主题结构。 |
| 不手搓评论系统 | 用 Twikoo + twikoo-cloudflare，而不是自己写评论 UI、后台、表结构和管理逻辑。 |
| 静态请求不进 Worker | 文档正文、CSS、JS、Pagefind 索引都交给 Workers Static Assets。 |
| 动态能力单独隔离 | 评论服务独立域名、独立 Worker、独立 D1，便于限流、观测和迁移。 |
| 费用先可解释 | 完整免费额度和 `$5 Workers Paid` 见 [免费与付费边界](/platform/free-paid/)。 |
| Codex 先查官方 | 写 Cloudflare 内容时按 [Codex 协作](/best-practices/codex-cloudflare/) 的顺序查官方 Markdown、`llms.txt`、GitHub 源仓库和 Wrangler 配置。 |

## 为什么这套栈

| 需求 | 当前方案 | 判断 |
| --- | --- | --- |
| 文档与教程 | Astro + Starlight | Starlight 默认提供文档导航、站内搜索和 SEO；Markdown / MDX 对开源协作友好。 |
| 普通站内搜索 | Pagefind | 构建后生成静态索引，无服务端组件，不消耗 Worker 动态请求。 |
| 主题 | Starlight Theme Next + Cloudflare 主题变量 | 复用成熟 Starlight 主题，只在品牌色、间距和边界上做收敛。 |
| 评论 | Twikoo + twikoo-cloudflare | 评论组件、管理面板、安全能力和 Cloudflare Worker / D1 后端都来自现成项目。 |
| 部署 | Workers Static Assets | Astro 静态产物直接随 Worker 部署；后续要加 API、D1、R2、AI 时仍然在 Workers 模型里。 |
| 自然语言搜索 | AI Search，后置引入 | 当前内容量先用 Pagefind；等读者开始问“我该用 D1 还是 KV”这类问题，再引入 AI Search。 |
| Agent 可读性 | Cloudflare Docs for agents 的资料组织方式 | 文章保留核对日期、官方来源、GitHub 源仓库和免费/付费边界，方便 Codex 继续维护。 |

## 为什么不是 VuePress

VuePress 可以部署到 Cloudflare，也适合写普通教程。但这个仓库的目标不是“能出一个文档站”就结束，而是把站点本身做成 Cloudflare 架构样板。

当前更偏向 Astro + Starlight 的原因：

- Starlight 的文档体验和 Pagefind 搜索默认可用，少维护一层主题与搜索集成。
- Astro 静态输出天然适合 Workers Static Assets，Cloudflare 官方 Astro 指南也说明纯静态 Astro 不需要 Cloudflare adapter，直接上传静态资产即可。
- 后续如果加 Worker API、AI Search、R2 上传、D1 示例和 MCP 示例，Workers 模型比纯文档生成器更贴合本站定位。

## 为什么不是纯 Cloudflare Pages

Cloudflare Pages 仍然是纯静态站、博客、PR 预览和 Git 部署的好选择。本站选择 Workers Static Assets，是因为它要把 Cloudflare 的开发者平台能力放在同一个开源仓库里演示：

| 选择 | 适合场景 | 本站判断 |
| --- | --- | --- |
| Pages | 纯静态站、营销页、博客、Preview Deployments。 | 很好，但不是本站的架构真源。 |
| Workers Static Assets | 静态内容 + API + bindings + 自定义 Worker 行为。 | 更适合这个仓库展示 Workers、D1、R2、AI、Queues 等能力。 |

普通读者可以这样判断：如果你的项目只是内容站，Pages 足够；如果你想把内容、API、评论、搜索增强和 Cloudflare bindings 放在一个 Worker-first 项目里，优先看 Workers Static Assets。

## 搜索路线

第一阶段只用 Pagefind：

- 构建时生成索引。
- 搜索在浏览器中完成。
- 不需要数据库、后端 API、AI 模型或额外存储。
- 评论区通过 `data-pagefind-ignore` 排除，避免把用户评论混进文档搜索。

第二阶段再看 AI Search：

- 内容量足够大，关键词搜索开始不够用。
- 读者需要用自然语言问“这个项目应该用 KV、D1 还是 Durable Objects？”。
- 需要混合搜索、结果过滤、MCP endpoint、UI snippet 或 Agent 工具调用。
- 能接受 AI Search 自身的免费 / paid limits，以及 Workers AI、AI Gateway、日志等可能叠加的用量。

这也是本站的成本控制原则：**先让静态搜索解决 80% 的问题，再为明确的自然语言检索需求付复杂度。**

## 评论系统

当前评论系统使用 Twikoo：

| 模块 | 当前实现 | 原因 |
| --- | --- | --- |
| 评论 UI | `twikoo` 官方包 | 复用成熟前端组件、管理面板、回复、点赞、审核和安全能力。 |
| 评论后端 | `twikoo-cloudflare` | 直接托管在 Cloudflare Workers，数据进入 D1。 |
| 数据库 | D1 | 评论、配置、计数这类关系数据足够清晰。 |
| 页面集成 | `src/components/TwikooFooter.astro` | 用 Starlight Footer 扩展点接入，避免改主题内部代码。 |
| 加载方式 | IntersectionObserver 懒加载 | 评论不拖慢正文首屏。 |
| 路径处理 | 显式传入规范化 `path` | 避免 `/a` 和 `/a/` 被当成两篇文章。 |

后续评论量上来以后，再补三个边界：Turnstile 或 WAF 限流、评论审核策略、R2 图片上传。没有真实评论压力前，不提前自建评论系统。

## 免费额度影响

这套架构专门为免费额度友好设计：

| 路径 | 当前消耗 | 说明 |
| --- | --- | --- |
| 阅读文档 | Workers Static Assets | 静态资产请求免费且不限量。 |
| 搜索文档 | Pagefind 静态索引 | 浏览器本地搜索，不打 Worker API。 |
| 打开评论区 | 评论 Worker + D1 | 只有评论读写进入动态额度。 |
| 部署构建 | 本地 `pnpm build` + `wrangler deploy` | 站点构建成本不转嫁给线上请求路径。 |
| 未来 AI 搜索 | AI Search / AI Gateway / Workers AI | 等需求明确后再按 [免费与付费边界](/platform/free-paid/) 估算。 |

`$5 Workers Paid` 不等于 Cloudflare Pro。它主要放大 Workers、KV、D1、Queues、Durable Objects、日志和相关开发者平台额度；WAF、Bot、zone 计划、Enterprise 网络能力和部分 add-on 仍然要分开看。

## 当前仓库落地

| 文件 / 依赖 | 职责 |
| --- | --- |
| `astro.config.mjs` | Starlight 配置、导航、主题、Footer 扩展和 GitHub 链接。 |
| `package.json` | 固定 Astro、Starlight、Starlight Theme Next、Twikoo、twikoo-cloudflare、Wrangler 等依赖。 |
| `src/styles/cloudflare-theme.css` | Cloudflare 橙色主题变量和少量品牌样式收敛。 |
| `src/components/TwikooFooter.astro` | 保留默认 Footer，并懒加载 Twikoo 评论组件。 |
| `wrangler.jsonc` | 文档站 Worker、Static Assets、custom domain 和 observability 配置。 |
| `src/worker.ts` | 文档站 Worker 入口，把静态资产交给 `ASSETS` binding。 |
| `wrangler.comments.jsonc` | 评论 Worker、D1 binding、custom domain 和 Node 兼容配置。 |
| `comments-worker/src/index.js` | 复用 `twikoo-cloudflare` 的 Worker 入口。 |
| `comments-worker/schema.sql` | Twikoo Cloudflare 版 D1 表结构。 |

## 不要做什么

| 不推荐 | 原因 |
| --- | --- |
| 为本站重写设计系统 | 文档站核心价值是内容、来源和判断；主题只做必要品牌收敛。 |
| 自写评论组件 | 评论涉及存储、审核、安全、管理后台和反垃圾，成熟库更合适。 |
| 一开始做 AI 搜索 | 内容量不够时，AI Search 会增加配置和成本解释负担。 |
| 让所有静态请求都先进 Worker | 会浪费 Workers Free / Paid 的动态请求和 CPU 边界。 |
| 把内部需求写成前端文案 | 读者只需要看到产品化内容，不需要看到实现备注或管理口径。 |

## GitHub 开源参考

| 仓库 | 本站借鉴点 |
| --- | --- |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，学习路线、教程入口、专题组织和资料索引值得参考。 |
| [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs) | Cloudflare 官方文档源仓库，价格、limits、Codex、Docs for agents 和 Workers 最佳实践都优先追踪这里。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | Cloudflare 官方 Workers 模板集合，学习 full-stack Workers 项目结构。 |
| [cloudflare/skills](https://github.com/cloudflare/skills) | Cloudflare 官方 Agent Skills，给 Codex 提供平台边界和产品选择规则。 |
| [cloudflare/mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare) | Cloudflare domain-specific MCP servers，后续做观测、构建和平台操作时参考。 |
| [withastro/starlight](https://github.com/withastro/starlight) | 文档框架来源，站内搜索、导航、页面结构和主题扩展都基于它。 |
| [trueberryless-org/starlight-theme-next](https://github.com/trueberryless-org/starlight-theme-next) | 当前主题来源，避免从零手写文档站 UI。 |
| [twikoojs/twikoo](https://github.com/twikoojs/twikoo) | 评论前端、管理能力和安全能力来源。 |
| [twikoojs/twikoo-cloudflare](https://github.com/twikoojs/twikoo-cloudflare) | 评论服务托管到 Workers + D1 的来源。 |

## 事实来源

- [Starlight Site Search](https://starlight.astro.build/guides/site-search/)
- [Pagefind Docs](https://pagefind.app/docs/)
- [Astro Cloudflare Deployment](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Cloudflare Astro on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Workers Static Assets Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Cloudflare AI Search](https://developers.cloudflare.com/ai-search/)
- [AI Search Limits and Pricing](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)
- [Codex + Cloudflare](https://developers.cloudflare.com/agent-setup/codex/)
- [Docs for agents](https://developers.cloudflare.com/docs-for-agents/)
