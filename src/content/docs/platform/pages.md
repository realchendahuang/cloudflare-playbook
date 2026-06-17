---
title: Pages
description: Cloudflare Pages 的取舍、Functions 边界和 Workers Static Assets 迁移判断。
---

最后核对日期：2026-06-18。

Pages 适合前端和内容项目的 Git 协作部署：push 自动构建，PR / 分支有预览地址，静态资产请求免费且不限量。它不是更强的 Workers；如果项目核心是 API、D1、R2、Queues、Durable Objects 或 AI，优先看 [Workers Static Assets](/platform/static-assets/)。

## 先判断

| 场景 | 建议 | 原因 |
| --- | --- | --- |
| 开源文档站、官网、博客 | 用 Pages 很顺。 | Git 集成和预览部署省心。 |
| 纯前端应用 | 适合。 | 静态请求免费且不限量。 |
| 少量表单、Webhook、轻 API | 可以。 | Pages Functions 足够起步。 |
| 静态站 + 大量 Worker API | 不优先。 | 动态能力多时用 Static Assets 更清楚。 |
| 用户上传、附件、下载包 | 不放 Pages。 | 文件进 R2，Pages 只放构建产物。 |

## 免费阶段怎么用

Pages 的免费价值在静态发布、Git 集成和预览部署。静态资产请求免费且不限量；一旦使用 Pages Functions，就进入 Workers 的动态请求和 CPU 口径。

| 边界 | 判断 |
| --- | --- |
| 静态资产 | 文档、官网、博客和前端 bundle 应尽量停在静态层。 |
| Functions | 少量表单、Webhook 和 API 可以起步，复杂平台能力优先迁到 Workers Static Assets。 |
| 构建和预览 | 高频提交、大型构建、多分支预览会先撞到构建侧限制。 |
| 文件和附件 | Pages 只放构建产物，大文件、图片原图、上传和下载包放 R2。 |
| 预览安全 | 默认预览地址不是权限系统，有敏感内容必须加 Access。 |

完整数字见 [免费额度大全](/platform/free-paid/)。

## 和 Workers Static Assets 怎么选

| 问题 | Pages | Workers Static Assets |
| --- | --- | --- |
| 部署来源 | Git / Pages 项目设置。 | `wrangler.jsonc` 和 Worker 项目。 |
| PR 预览 | 内置。 | 需要自己组织。 |
| 静态请求成本 | 免费且不限量。 | 免费且不限量。 |
| 动态能力 | Pages Functions，适合少量 API。 | Worker 原生入口，适合多绑定组合。 |
| 更适合 | 内容协作、官网、文档。 | 静态站 + API / 数据 / AI。 |

简单判断：内容协作优先 Pages，平台能力优先 Workers Static Assets。

## Functions 边界

| 判断 | 做法 |
| --- | --- |
| 只有少量 API | Pages Functions 可以。 |
| 静态请求不该触发 Functions | 控制动态路径，避免把整站阅读流量打进 Functions。 |
| 鉴权或后台路径 | 请求耗尽时倾向 fail closed。 |
| 已经需要复杂路由和多个绑定 | 迁到 Workers Static Assets。 |

## 常见坑

| 误区 | 更好的做法 |
| --- | --- |
| Pages 永远比 Workers 简单。 | 内容协作简单；平台能力多时 Workers Static Assets 更清楚。 |
| 加了 Functions 还不管路由。 | 只让 `/api/*` 等动态路径触发 Functions。 |
| 把大文件和用户上传塞进 Pages。 | 大文件进 R2，Pages 只放构建产物。 |
| 预览部署默认安全。 | 预览地址默认公开，有敏感内容要用 Access。 |
| 把大型迁移都写进 Pages 规则。 | 规则很多时用 Cloudflare Rules / Bulk Redirects。 |

## 起步路线

1. 纯文档、官网、博客用 Pages + Git Integration。
2. 表单、Webhook、轻 API 用少量 Pages Functions。
3. 文件上传、附件和媒体放 R2。
4. 预览部署有敏感内容时加 Access。
5. API、队列、DO、AI 组合变多后迁到 Workers Static Assets。

## 事实来源

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Pages Functions Pricing](https://developers.cloudflare.com/pages/functions/pricing/)
- [Pages Functions Routing](https://developers.cloudflare.com/pages/functions/routing/)
- [Pages Preview Deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)
- [Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
