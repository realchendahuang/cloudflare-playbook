---
title: Workers Static Assets
description: Cloudflare Workers Static Assets 的定位、Pages 取舍和常见避坑。
---

最后核对日期：2026-06-18。

Workers Static Assets 用来托管构建好的静态文件：HTML、CSS、JavaScript、图片、字体和前端构建产物。

普通项目先记一条：**能提前构建出来的内容，就尽量让 Static Assets 直接返回；只有真正需要运行代码的路径才进 Worker。**

## 先判断

| 场景 | 建议 |
| --- | --- |
| 文档站、官网、博客、产品页 | 优先用，静态请求免费且不限量。 |
| SPA + 少量 API | 适合，静态页面走 Assets，`/api/*` 走 Worker。 |
| 静态站还需要 D1、R2、KV、Queues、AI | 适合，Workers 项目更容易统一绑定。 |
| 纯静态站，团队依赖 Git 预览部署 | Pages 也可以。 |
| 用户上传、图片原图、附件、导出文件 | 不适合，放 R2。 |
| 视频、大安装包、超过 25 MiB 的文件 | 不适合，放 R2 或 Stream。 |

## 免费阶段怎么用

Static Assets 的关键不是“能不能免费”，而是“有没有让静态请求真的停在静态层”。页面、CSS、JS、字体、图片索引和 Pagefind 文件都应该由资产层直接返回；评论、表单、Webhook、后台接口再进入 Worker。

| 边界 | 判断 |
| --- | --- |
| 静态资产请求 | 命中资产层时免费且不限量，是文档站和官网的主流量入口。 |
| 部署产物 | 适合放构建结果，不适合放用户上传、附件、导出包和媒体库。 |
| 动态 Worker 请求 | 只有进入 Worker 脚本才按 Workers 请求和 CPU 计算。 |
| 文件大小和数量 | 大量图片、下载包、原始附件和视频应进入 R2 / Stream。 |

完整数字见 [免费额度大全](/platform/free-paid/)。

## 最省钱的路径

| 请求 | 推荐走法 |
| --- | --- |
| 页面、CSS、JS、字体、Pagefind 索引 | Static Assets 直接返回。 |
| 评论、搜索 API、Webhook、后台接口 | 只让对应路径进入 Worker。 |
| 用户上传文件 | Worker 做鉴权，文件进 R2。 |
| 公开下载文件 | 页面用 Static Assets，文件本体进 R2。 |
| SPA 前端路由 | 用静态回退，API 路径单独处理。 |

## 和 Pages 怎么选

| 问题 | Workers Static Assets | Pages |
| --- | --- | --- |
| 部署真源 | `wrangler.jsonc` 和 Worker 项目。 | Git / Pages 项目设置。 |
| 静态请求成本 | 免费且不限量。 | 免费且不限量。 |
| API 和绑定 | Worker 原生，适合 D1、R2、KV、DO、Queues、AI。 | Pages Functions 适合轻量 API。 |
| 预览部署 | 需要自己组织。 | PR / 分支预览更顺。 |
| 更适合 | 静态站 + API / Worker 生态能力。 | 纯静态站、官网、内容协作。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 所有请求都先跑 Worker。 | 静态资产直接返回，只让动态路径进 Worker。 |
| 把用户上传文件放进 Static Assets。 | 用户文件进 R2。 |
| 把大文件塞进 `dist`。 | 超过 25 MiB 就换 R2 / Stream。 |
| 把开发文件和调试文件打进构建产物。 | 构建前排除开发文件、调试产物、迁移残留和密钥文件。 |
| 用静态站规则管大型迁移。 | 规则很多时用 Cloudflare Rules / Bulk Redirects。 |

## 事实来源

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
