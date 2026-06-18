---
title: 静态内容站
description: 用 Cloudflare Pages 或 Workers Static Assets 部署文档站、官网、博客和知识库的架构模式。
---

最后核对日期：2026-06-18。

静态内容站是最容易从 Cloudflare 获益的架构。文档站、官网、博客、作品集和知识库，都应该先把阅读路径做成静态资产；评论、表单、搜索增强、文件权限和后台任务再交给 Worker。

核心判断：**阅读路径不要消耗动态请求，写入和计算只放在必要路径上。**

## 一句话判断

| 需求 | 默认选择 | 不要先做什么 |
| --- | --- | --- |
| 纯文档站、官网、博客 | Pages 或 Workers Static Assets。 | 不要先做全站 SSR。 |
| 文档站 + API / 评论 / 表单 | Workers Static Assets + 动态接口。 | 不要让所有静态页面先经过 Worker。 |
| 大量图片、附件、导出物 | R2 + 缓存策略。 | 不要把大文件塞进站点 bundle 或 D1。 |
| 普通站内搜索 | Pagefind。 | 内容少时不要先做 AI Search / Vectorize。 |
| 私有后台或预览环境 | Access / Tunnel。 | 不要自写简陋登录并裸露公网。 |

## 部署入口

| 入口 | 适合 | 判断 |
| --- | --- | --- |
| Workers Static Assets | 文档站旁边还会有 API、D1、R2、Queues、AI Gateway 或评论服务。 | Worker 和静态资产同一部署模型，长期更适合 Cloudflare-first 项目。 |
| Pages | 纯静态文档、官网、博客、营销页、PR 预览优先的项目。 | Git 工作流轻，静态资产请求同样免费；Functions 进入 Workers 计费口径。 |

早期只写内容，Pages 很顺；如果同一仓库里还要放 Worker API、D1、R2、AI Search 或队列，Workers Static Assets 更适合作为长期入口。

## 路径边界

| 路径 | 推荐处理方式 | 成本和风险 |
| --- | --- | --- |
| `/`、`/docs/*`、`/assets/*` | 静态资产直接返回。 | 静态资产请求免费且不限量，不进入 Worker 脚本。 |
| `/pagefind/*` | 构建期搜索索引。 | 用户搜索在浏览器本地完成，不消耗后端请求。 |
| 动态接口 | Worker。 | 进入 Workers 请求和 CPU 计费，需要日志、限流和错误处理。 |
| `/files/*` | Worker + R2。 | Worker 做权限和签名，文件本体不要进静态站 bundle。 |
| `/admin/*` | Worker + Access / Tunnel。 | 后台必须先有身份边界。 |

## 成本边界

| 成本项 | 实践判断 |
| --- | --- |
| 静态资产请求 | 文档、官网、博客的主流量应该停在 Workers Static Assets / Pages。 |
| Worker 动态请求 | 评论、表单、Webhook、小 API 可以先跑；公开写入口要限流。 |
| 构建产物 | 站点 bundle 只放页面和前端资源；大量图片、附件、导出物进 R2。 |
| R2 | R2 不是完全免费，公开下载热点要看读取操作。 |
| D1 | 评论、表单、小型后台适合；高频分析和大表扫描不适合。 |

成本纪律很简单：静态阅读不要消耗动态请求，文件不要进数据库，用户上传不要进 Git。

## 上线前只查这几件事

| 检查 | 判断 |
| --- | --- |
| 静态页面 | 首页、文章页、404、CSS / JS / 图片都能访问。 |
| 搜索 | 搜索索引存在，线上搜索能命中文章。 |
| 动态路径 | 只有 API、评论、上传、后台等必要路径进入 Worker。 |
| 文件上传 | Worker 生成签名或受控入口，R2 bucket 不开放任意写入。 |
| 管理后台 | Access / Tunnel 先挡在前面，再实现业务权限。 |
| 日志 | 能定位问题，不记录密钥、登录凭证和正文隐私。 |

官方核对入口：[Deploy frontend applications](https://developers.cloudflare.com/use-cases/web-apps/deploy-frontend/)、[Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)、[Pages Limits](https://developers.cloudflare.com/pages/platform/limits/)。
