---
title: Pages
description: Cloudflare Pages 的普通项目取舍、免费边界、Functions 计费和 Workers Static Assets 迁移判断。
---

最后核对日期：2026-06-18。

Cloudflare Pages 适合前端和内容项目的 Git 协作部署：push 自动构建，PR / 分支自动生成预览地址，静态资产请求免费且不限量。它不是比 Workers 更强的运行时；一旦项目天然需要 Worker API、D1、R2、KV、Durable Objects、Queues 或 AI，优先看 [Workers Static Assets](/platform/static-assets/)。

## 该不该用

| 场景 | 判断 | 原因 |
| --- | --- | --- |
| 开源文档站、官网、博客、作品集 | 适合 | Git 集成和预览部署很省心。 |
| 前端应用需要 PR 预览 | 适合 | Pages 会给分支和 PR 生成预览地址。 |
| 纯静态站 | 适合 | 静态资产请求免费且不限量。 |
| 少量表单、Webhook、轻 API | 可以 | Pages Functions 足够处理轻动态逻辑。 |
| 静态站 + 大量 Worker API / D1 / R2 / AI | 不优先 | Worker-first 项目用 Static Assets 更集中。 |
| WebSocket、Cron、复杂路由、多 Worker 编排 | 不优先 | Workers 是更自然的入口。 |
| 用户上传文件、大附件、下载包 | 不适合放 Pages | 文件进 R2，Pages 只放构建产物。 |

## 免费与限制

| 能力 | Free | 更高计划 / 备注 | 普通项目判断 |
| --- | ---: | --- | --- |
| 静态资产请求 | 免费且不限量 | 免费且不限量 | 主流量尽量停留在静态层。 |
| Pages Functions 请求 | 计入 Workers Free 100,000 requests/day | 计入 Workers Paid / Standard 用量 | Functions 和 Workers 共用请求池。 |
| 构建次数 | 500 builds/month | Pro 5,000；Business 20,000 | 高频提交要避免无意义构建。 |
| 并发构建 | 1 | Pro 5；Business 20 | 小项目通常够用。 |
| 单次构建时长 | 20 minutes | 20 minutes | 构建慢先优化依赖、图片和索引。 |
| 自定义域名 / project | 100 | Pro 250；Business 500；Enterprise 500 起 | 多租户不要靠 Pages custom domain 硬扛。 |
| 文件数 / site | 20,000 | Paid 100,000，需启用 `PAGES_WRANGLER_MAJOR_VERSION=4` | 大量媒体、附件和碎片索引放 R2。 |
| 单文件大小 | 25 MiB | 25 MiB | 大文件不要进构建产物。 |
| `_headers` 规则 | 100 | 单个 header 2,000 characters | 复杂 header 用 Rules 或 Functions。 |
| `_redirects` 规则 | 2,000 static + 100 dynamic | 超过用 Bulk Redirects | 大规模迁移不要堆 `_redirects`。 |
| `_routes.json` 规则 | include/exclude 合计 100 | 每条最多 100 characters | 只让动态路径进 Functions。 |
| 预览部署 | active preview deployments 不限 | 默认公开，可用 Access 保护 | 预览里有敏感内容时必须加 Access。 |
| 项目数 / account | soft limit 100 | 可申请提高 | 临时 demo 不要长期堆着。 |

## 和 Workers Static Assets 怎么选

| 问题 | Pages | Workers Static Assets |
| --- | --- | --- |
| 部署真源 | Git / Pages 项目设置 | `wrangler.jsonc` 和 Worker 项目 |
| PR 预览 | 内置 | 需要自己用环境、版本或 CI 组织 |
| 静态请求成本 | 免费且不限量 | 免费且不限量 |
| 动态能力 | Pages Functions，文件路由模型 | Worker 原生入口和绑定模型 |
| 绑定和平台能力 | 适合少量绑定 | 更适合 D1/R2/KV/DO/Queues/AI 组合 |
| 后续复杂度 | 动态变多后容易迁移 | 一开始就是 Worker-first |

简单判断：内容协作优先 Pages，平台能力优先 Workers Static Assets。

## 部署方式

| 方式 | 适合场景 | 注意 |
| --- | --- | --- |
| Git Integration | 开源项目、团队协作、PR 预览、自动构建 | 只支持 GitHub / GitLab 自动 CI；fork PR 不会生成预览。 |
| Direct Upload | 已有自己的 CI，或只想上传预构建产物 | 选择 Direct Upload 后不能切到 Git Integration，通常要新建项目。 |
| Drag and drop | 临时静态 demo | 不支持编译 `functions` 目录，文件数限制更低。 |
| Git 项目手动部署 | 想保留 Git 项目但不每次 push 自动构建 | 可以关闭自动部署后改用 Wrangler 创建部署。 |

## Functions 边界

| 能力 | 判断 |
| --- | --- |
| 文件路由 | `/functions` 目录决定动态路由，适合少量 API。 |
| 静态回退 | 没匹配 Function 时，会回到静态资产或 Pages 默认静态行为。 |
| `_routes.json` | 有 Functions 后要控制触发路径，否则静态请求可能也进入 Functions。 |
| fail open / closed | Free Functions 请求耗尽时可配置；鉴权和后台路径应倾向 fail closed。 |
| Advanced Mode | `_worker.js` 会接管所有请求；必须自己把静态资产转回 ASSETS。普通项目不要优先用。 |
| Functions 请求计费 | 按 Workers 请求计费，静态资产请求不计入。 |

## 常见坑

| 误区 | 更好的做法 |
| --- | --- |
| Pages 永远比 Workers 简单 | 内容协作简单；平台能力复杂时 Worker-first 更清楚。 |
| 加了 Functions 还不管路由 | 用 `_routes.json` 只让 `/api/*` 等路径触发 Functions。 |
| 把大文件和用户上传塞进 Pages | 大文件进 R2，Pages 只放构建产物。 |
| Direct Upload 和 Git Integration 随便切 | 项目创建前选清楚，切换通常要新建项目。 |
| 预览部署默认安全 | 预览地址默认公开，有敏感内容要用 Access。 |
| Advanced Mode 是默认最佳实践 | 它会接管所有请求，只有文件路由不够用时再考虑。 |
| `_headers` 会影响 Functions 响应 | Functions 响应头要在函数里设置。 |
| 大量重定向都写进 `_redirects` | 超过 Pages 限制时用 Bulk Redirects。 |

## 普通项目路线

| 阶段 | 做什么 | 什么时候换路线 |
| --- | --- | --- |
| 0 | 纯文档、官网、博客用 Pages + Git Integration | 需要大量 Worker API 时。 |
| 1 | 表单、Webhook、轻 API 用少量 Pages Functions | Functions 路由和绑定变复杂时。 |
| 2 | 文件上传、附件和媒体放 R2 | 构建产物接近文件数或单文件上限时。 |
| 3 | 预览部署有敏感内容时加 Access | 协作成员变多或有客户预览时。 |
| 4 | API、队列、DO、AI 组合变多后迁到 Workers Static Assets | Worker 已经成为核心运行时。 |

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [cloudflare/cloudflare-docs Pages source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/pages) | 官方 Pages 文档源文件。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Pages Functions、Direct Upload 和本地 dev 实现。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | 官方模板集合。 |
| [withastro/adapters Cloudflare](https://github.com/withastro/adapters/tree/main/packages/cloudflare) | Astro 部署到 Cloudflare 的适配器。 |
| [sveltejs/kit adapter-cloudflare](https://github.com/sveltejs/kit/tree/main/packages/adapter-cloudflare) | SvelteKit Cloudflare 适配器。 |

## 事实来源

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Pages Functions Pricing](https://developers.cloudflare.com/pages/functions/pricing/)
- [Pages Functions Routing](https://developers.cloudflare.com/pages/functions/routing/)
- [Pages Advanced Mode](https://developers.cloudflare.com/pages/functions/advanced-mode/)
- [Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
- [Pages Preview Deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Pages Known Issues](https://developers.cloudflare.com/pages/platform/known-issues/)
- [Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
