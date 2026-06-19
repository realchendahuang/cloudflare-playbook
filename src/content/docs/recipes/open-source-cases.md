---
title: 开源项目案例索引
description: 从 GitHub 上的 Cloudflare 开源项目反推可复用的实战架构。
---

## 常见组合

| 现象 | 对独立开发者的启发 |
| --- | --- |
| Workers 是最常见入口 | API、Webhook、短链、监控、AI 代理、邮箱处理都可以先从一个 Worker 开始。 |
| Pages / Static Assets 承接前端 | 文档站、博客、工具前端和管理台优先静态化，动态逻辑再进 Worker。 |
| D1 + R2 经常成对出现 | D1 放用户、文章、评论、权限、元数据；R2 放图片、附件、导出物和大文件。 |
| KV 主要做读多写少状态 | 状态页历史、配置、缓存、短链映射等可以用 KV，但强一致状态不要依赖 KV。 |
| Durable Objects 支撑实时和单实体状态 | 协作画布、WebSocket 房间、邮箱隔离、轻量 SQLite 边缘数据库都在用 DO。 |
| AI 项目还在早期但组合清晰 | Workers AI / AI Gateway / Vectorize 适合先做单点能力：聊天、摘要、PDF 问答、语义搜索。 |

## 内容、博客和 CMS

| 项目 | Cloudflare 组合 | 可以借鉴什么 |
| --- | --- | --- |
| [openRin/Rin](https://github.com/openRin/Rin) | Pages、Workers、D1、R2。 | 边缘原生博客：前后端分离、文章管理、图片上传、评论、GitHub Actions 自动部署。 |
| [SonicJs-Org/sonicjs](https://github.com/SonicJs-Org/sonicjs) | Workers、D1、R2、Hono。 | Headless CMS：内容 API、管理后台、文件对象和关系数据的分层。 |
| [twikoojs/twikoo-cloudflare](https://github.com/twikoojs/twikoo-cloudflare) | Workers、D1、R2。 | 评论系统迁移到 Cloudflare：把原来的 Node 服务拆成 Worker + D1 + 对象存储，并处理 Workers 兼容性边界。 |
| [yestool/imgUU](https://github.com/yestool/imgUU) | Astro SSR、D1、R2、GitHub 登录。 | 图床/图片上传：登录、图片元数据、对象存储、前端上传体验的组合。 |

## 监控、短链和网络工具

| 项目 | Cloudflare 组合 | 可以借鉴什么 |
| --- | --- | --- |
| [lyc8503/UptimeFlare](https://github.com/lyc8503/UptimeFlare) | Workers。 | 免费、无服务器的可用性监控和状态页，适合学习定时检查与状态展示。 |
| [eidam/cf-workers-status-page](https://github.com/eidam/cf-workers-status-page) | Workers、Cron Triggers、KV。 | 状态页的最小闭环：定时检测、状态历史、通知渠道和静态展示。 |
| [xyTom/Url-Shorten-Worker](https://github.com/xyTom/Url-Shorten-Worker) | Workers。 | 短链接服务：边缘路由、重定向、管理入口和自定义域名。 |
| [serverless-dns/serverless-dns](https://github.com/serverless-dns/serverless-dns) | Workers。 | DNS over HTTPS 解析服务：用 Worker 承接网络协议类 API。 |

## 文件、图床和 R2 管理

| 项目 | Cloudflare 组合 | 可以借鉴什么 |
| --- | --- | --- |
| [G4brym/R2-Explorer](https://github.com/G4brym/R2-Explorer) | Workers、R2、KV。 | 给 R2 做 Web 管理界面：目录、上传、下载、权限和桶配置。 |
| [longern/FlareDrive](https://github.com/longern/FlareDrive) | Pages、R2、WebDAV。 | 免费文件盘：前端管理界面、对象存储、分享和 WebDAV 入口。 |
| [abersheeran/r2-webdav](https://github.com/abersheeran/r2-webdav) | Workers、R2。 | 给 R2 暴露 WebDAV 协议，适合学习对象存储和传统文件协议的适配。 |
| [wesbos/R2-video-streaming](https://github.com/wesbos/R2-video-streaming) | R2、Workers。 | R2 视频分发：大文件、Range 请求、缓存和播放体验。 |

## 数据后台和边缘数据库

| 项目 | Cloudflare 组合 | 可以借鉴什么 |
| --- | --- | --- |
| [JacobLinCool/d1-manager](https://github.com/JacobLinCool/d1-manager) | Pages、D1。 | D1 管理台：表结构、数据浏览、SQL 查询和低成本数据库后台。 |
| [outerbase/starbasedb](https://github.com/outerbase/starbasedb) | Durable Objects、SQLite。 | 基于 DO 的边缘 SQLite 服务，适合理解单实体强一致状态和 scale-to-zero 数据服务。 |
| [shuaiplus/nodewarden](https://github.com/shuaiplus/nodewarden) | Workers、D1、R2。 | 密码库后端：加密数据、用户数据、附件对象和无服务器自托管。 |
| [cloudflare/workers-oauth-provider](https://github.com/cloudflare/workers-oauth-provider) | Workers。 | 在 Worker 上实现 OAuth Provider，适合给 API、MCP、内部工具补授权层。 |

## 实时协作和强一致状态

| 项目 | Cloudflare 组合 | 可以借鉴什么 |
| --- | --- | --- |
| [tldraw/tldraw-sync-cloudflare](https://github.com/tldraw/tldraw-sync-cloudflare) | Workers、Durable Objects。 | 协作画布：每个文档/房间用 DO 承接同步状态。 |
| [napolab/y-durableobjects](https://github.com/napolab/y-durableobjects) | Workers、Durable Objects、Yjs。 | Yjs 协作服务：用 DO 替代常驻 Node WebSocket 服务。 |
| [mdhruvil/gitflare](https://github.com/mdhruvil/gitflare) | Durable Objects。 | 纯无服务器 Git 托管实验：把仓库/对象状态放进 DO 的边界思路。 |
| [akazwz/WebRTC-Screen-Mirror](https://github.com/akazwz/WebRTC-Screen-Mirror) | Workers、Durable Objects、WebSocket。 | WebRTC 信令：用 Worker/DO 只管房间和信令，不承载媒体流。 |

## AI、RAG 和 Agent

| 项目 | Cloudflare 组合 | 可以借鉴什么 |
| --- | --- | --- |
| [cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox) | Workers、Durable Objects、R2、Email Routing、Agents SDK、Workers AI、Access。 | AI 邮箱客户端：邮箱隔离、附件存储、Agent 工具调用、生产访问控制。 |
| [RihanArfan/chat-with-pdf](https://github.com/RihanArfan/chat-with-pdf) | NuxtHub、Workers AI、Vectorize。 | PDF 问答/RAG：文件解析、向量检索、模型回答和前端体验。 |
| [akazwz/workersai](https://github.com/akazwz/workersai) | Workers、Durable Objects、KV、AI Gateway。 | 全栈 AI 聊天：会话状态、模型网关、语音能力和边缘部署。 |
| [justlovemaki/CloudFlare-AI-Insight-Daily](https://github.com/justlovemaki/CloudFlare-AI-Insight-Daily) | Workers、AI 模型、GitHub Pages。 | 内容聚合与摘要自动化：定时抓取、模型处理、静态发布流水线。 |

## 起手式和模板

| 项目 | Cloudflare 组合 | 可以借鉴什么 |
| --- | --- | --- |
| [cloudflare/templates](https://github.com/cloudflare/templates) | Workers 官方模板。 | 新项目脚手架：从官方模板看 bindings、Wrangler 配置和目录组织。 |
| [kriasoft/react-starter-kit](https://github.com/kriasoft/react-starter-kit) | Cloudflare Workers、React、Hono、tRPC、Drizzle。 | 较完整的 SaaS 起手式：前端、API、认证、支付和部署流水线。 |
| [jose-donato/race-stack](https://github.com/jose-donato/race-stack) | Cloudflare Pages、D1、Remix。 | Remix 全栈模板：Pages Functions + D1 的 Web 应用形态。 |
| [atinux/nuxthub-better-auth](https://github.com/atinux/nuxthub-better-auth) | NuxtHub、D1、KV。 | Nuxt + 认证 + Cloudflare 数据层的最小示例。 |

## 怎么把案例转成自己的方案

| 你的目标 | 优先参考 | 再回到本站读 |
| --- | --- | --- |
| 做文档站、博客、轻 CMS | Rin、SonicJS、Twikoo Cloudflare。 | [文档站技术栈](/best-practices/site-stack/)、[静态内容站](/architecture/static-site/)、[D1](/platform/d1/)、[R2](/platform/r2/) |
| 做状态页、短链、Webhook 小服务 | UptimeFlare、cf-workers-status-page、Url-Shorten-Worker。 | [接口入口](/architecture/api-gateway/)、[Workers](/platform/workers/)、[KV](/platform/kv/) |
| 做文件上传、图床、网盘 | R2-Explorer、FlareDrive、imgUU。 | [R2](/platform/r2/)、[R2 签名上传](/recipes/r2-signed-upload/)、[成本控制](/best-practices/cost/) |
| 做协作、房间、强一致状态 | tldraw sync、y-durableobjects、starbasedb。 | [实时应用](/architecture/realtime-app/)、[Durable Objects](/platform/durable-objects/) |
| 做 AI 问答、摘要、Agent | agentic-inbox、chat-with-pdf、workersai。 | [AI 能力](/platform/ai/)、[Queues](/platform/queues/)、[观测与日志](/platform/observability/) |

## 使用这些项目时先检查

| 检查项 | 为什么 |
| --- | --- |
| 许可证 | 自用、商用、二次分发和 SaaS 托管的边界可能不同。 |
| 最后提交和 Issue | 开源热度不等于可维护性，要看最近是否还在修 bug。 |
| 真实 Cloudflare 依赖 | 有些项目只是“可部署到 Cloudflare”，不一定把 D1、R2、DO 当核心架构。 |
| 账单风险 | R2 操作、AI 调用、Cron 频率、Worker CPU、外部 API 都可能带来成本。 |
| 安全边界 | 登录、后台、文件上传、Webhook、邮件、密码库类项目先补 Access、Turnstile、限流和密钥管理。 |
