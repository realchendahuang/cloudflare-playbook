---
title: Workers Static Assets
description: Cloudflare Workers Static Assets 的定位、免费边界、限制、Pages 取舍和常见避坑。
---

最后核对日期：2026-06-18。

Workers Static Assets 用来托管构建好的静态文件：HTML、CSS、JavaScript、图片、字体和前端构建产物。

普通项目先记一条：**能提前构建出来的内容，就尽量让 Static Assets 直接返回；只有真正需要运行代码的路径才进 Worker。**

## 该不该用

| 场景 | 判断 |
| --- | --- |
| 文档站、官网、博客、产品页 | 优先用。静态请求免费且不限量。 |
| SPA + 少量 API | 适合。静态页面走 Assets，`/api/*` 走 Worker。 |
| 静态站还需要 D1、R2、KV、Queues、AI | 适合。Workers 项目更容易统一管理绑定。 |
| 纯静态站，团队依赖 Git 预览部署 | 可以用 Pages。 |
| 用户上传、图片原图、附件、导出文件 | 不适合。放 R2。 |
| 视频、大安装包、超过 25 MiB 的文件 | 不适合。放 R2 或 Stream。 |

## 免费边界

| 能力 | Free | Workers Paid | 判断 |
| --- | --- | --- | --- |
| 静态资产请求 | 免费且不限量 | 免费且不限量 | 文档站主流量应该停在这里。 |
| 静态资产存储 | 无额外费用 | 无额外费用 | 只适合部署产物，不适合用户文件库。 |
| 文件数 | 20,000 files / Worker version | 100,000 files / Worker version | 大文档站要注意 Pagefind、图片和构建碎片数量。 |
| 单文件大小 | 25 MiB | 25 MiB | 大文件不要进构建产物。 |
| 动态 Worker 请求 | 100,000 requests/day | 10M requests/month included | 只有进入 Worker 脚本才算。 |
| Worker CPU | 10 ms / invocation | 30M CPU ms/month included | SSR、鉴权、动态渲染才需要重点估算。 |

最容易踩的坑是 `run_worker_first`。只要请求先进入 Worker，就会进入 Workers 额度；Free 超出后会返回 429，不会自动退回静态资产层。

## 最省钱的路径

| 请求 | 推荐走法 |
| --- | --- |
| 页面、CSS、JS、字体、Pagefind 索引 | Static Assets 直接返回。 |
| 评论、搜索 API、Webhook、后台接口 | 只让对应路径进入 Worker。 |
| 用户上传文件 | Worker 做鉴权，文件进 R2。 |
| 公开下载文件 | 页面用 Static Assets，文件本体进 R2。 |
| SPA 前端路由 | 用 SPA fallback；API 路径单独处理。 |

## 和 Pages 怎么选

| 问题 | Workers Static Assets | Pages |
| --- | --- | --- |
| 静态请求成本 | 免费且不限量 | 免费且不限量 |
| 部署真源 | `wrangler.jsonc` | Git / Pages 项目设置 |
| API 和绑定 | Worker 原生，适合 D1、R2、KV、DO、Queues、AI | Pages Functions 适合轻量 API |
| 预览部署 | 需要自己组织 | PR / 分支预览更顺 |
| 适合项目 | 静态站 + API / Worker 生态能力 | 纯静态站、官网、内容协作 |

简单判断：只做内容协作，Pages 很舒服；项目会长出 API、数据库、对象存储、队列或 AI，就优先 Workers Static Assets。

## 配置取舍

| 配置 | 建议 |
| --- | --- |
| `assets.directory` | 指向构建产物目录，常见是 `dist`、`build`、`public`。 |
| `assets.binding` | 只有 Worker 代码需要读取静态资产时再配置。 |
| `not_found_handling` | 文档站用 `404-page`，SPA 用 `single-page-application`。 |
| `html_handling` | 文档站通常用 `auto-trailing-slash`。 |
| `run_worker_first` | 不要全站开启，只匹配必要动态路径。 |
| `.assetsignore` | 排除源码、map、迁移残留和不该公开的文件。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 所有请求都先跑 Worker | 静态资产直接返回，只让动态路径进 Worker。 |
| 把用户上传文件放进 Static Assets | 用户文件进 R2。 |
| 把大文件塞进 `dist` | 单文件超过 25 MiB 就换 R2 / Stream。 |
| 以为 `_headers` 会影响 API 响应 | Worker 生成的响应在代码里设置 header。 |
| 用 `_redirects` 管大型迁移 | 规则多时用 Bulk Redirects。 |
| 从 Pages 迁移时把 `_worker.js` 上传成静态文件 | 移出构建产物，或写入 `.assetsignore`。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/templates](https://github.com/cloudflare/templates) | 官方 Workers 模板集合。 |
| [cloudflare/templates/vite-react-template](https://github.com/cloudflare/templates/tree/main/vite-react-template) | SPA + Worker API 项目结构。 |
| [cloudflare/templates/astro-blog-starter-template](https://github.com/cloudflare/templates/tree/main/astro-blog-starter-template) | Astro 内容站如何部署到 Workers。 |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、C3、Vite plugin 和 Static Assets 实现。 |
| [cloudflare/cloudflare-docs Static Assets source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workers/static-assets) | 官方 Static Assets 文档源文件。 |

## 事实来源

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Configuration and Bindings](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Headers](https://developers.cloudflare.com/workers/static-assets/headers/)
- [Redirects](https://developers.cloudflare.com/workers/static-assets/redirects/)
- [Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
