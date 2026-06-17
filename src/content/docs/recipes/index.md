---
title: 实战案例
description: 可复现的 Cloudflare 产品组合案例、选择顺序和验收标准。
---

最后核对日期：2026-06-17。

案例用于把产品地图和架构模式落到代码、配置、部署和验证里。这里的重点不是展示炫技代码，而是把“普通项目最容易遇到的 Cloudflare 组合”拆成能复现、能上线、能核对成本和风险的最小路径。

```text
官方 Use cases
  -> 官方 Tutorials / Examples / Templates
  -> 本站普通项目案例
  -> 本地验证
  -> 线上验证
  -> 成本、安全、限制复盘
```

## 当前案例

| 案例 | 核心产品 | 适合先学什么 |
| --- | --- | --- |
| [Worker API + D1](/recipes/worker-api-d1/) | Workers、Hono、D1 | API 路由、D1 binding、SQL migration、prepared statement、CRUD 验证。 |
| [R2 签名上传](/recipes/r2-signed-upload/) | Workers、Hono、R2 | Worker 代理上传、presigned URL 直传、CORS、私有下载授权。 |

这两个案例先写，是因为它们覆盖了大多数早期项目的两条主线：**结构化数据写入**和**文件对象上传**。评论、表单、后台配置、用户资料、附件、图片、导出文件，最终都会落到这两类问题上。

## 选择顺序

1. 先看 [Worker API + D1](/recipes/worker-api-d1/)：理解 Worker 如何接收请求、校验输入、调用 binding 资源，并用 D1 保存关系数据。
2. 再看 [R2 签名上传](/recipes/r2-signed-upload/)：理解文件为什么放 R2，为什么不能把 R2 密钥放到浏览器，以及 CORS 和短期授权怎么配。
3. 做真实项目时，把 D1 案例里的业务记录和 R2 案例里的对象 key 关联起来。例如评论附件、用户头像、导出文件、AI 生成结果，都应该有 D1 metadata 和 R2 object。

## 从官方资料反推案例

Cloudflare 官方资料有三类适合做案例来源：

| 官方资料 | 适合怎么用 |
| --- | --- |
| Use cases | 从“我要做什么”反推产品组合，比如部署 API、存储数据、保护表单、实时协作、AI 应用。 |
| Tutorials | 学完整步骤和官方推荐命令，比如 D1 comments API、R2 upload、Queues rate limits、Realtime chat。 |
| Examples | 学某个 Worker API 的小切片，比如 JSON response、CORS proxy、Cache API、WebSockets、Turnstile、security headers。 |
| Templates | 学真实项目结构、`wrangler.jsonc`、测试、框架组合和部署方式。 |

本站案例会优先选择“能代表常见普通项目”的组合，而不是把官方 tutorials 按顺序搬一遍。

## 案例路线图

| 优先级 | 案例方向 | 为什么重要 | 当前状态 |
| --- | --- | --- | --- |
| P0 | Worker API + D1 | 所有写接口、评论、表单、小后台都会遇到。 | 已收录。 |
| P0 | R2 签名上传 | 文件、图片、附件、导出结果不能塞进 D1 或 Git。 | 已收录。 |
| P1 | 静态内容站部署 | 文档站、官网、博客是最常见入口，且能吃满免费静态能力。 | 已放在 [静态内容站](/architecture/static-site/) 架构页。 |
| P1 | Turnstile + Rate Limiting 写接口保护 | 评论、登录、表单、上传和 AI 调用都需要边界。 | 已在 [安全边界](/best-practices/security/) 和 [WAF](/platform/waf/) 拆解，后续可独立成案例。 |
| P1 | Queues 后台任务 | 邮件、通知、导入、审核、AI 批处理不能卡住用户请求。 | 已在 [Queues](/platform/queues/) 整理，后续可独立成案例。 |
| P1 | Durable Objects 实时房间 | WebSocket、房间状态、协作和多人应用需要单实体一致性。 | 已在 [实时应用](/architecture/realtime-app/) 拆解，后续可独立成案例。 |
| P2 | AI Gateway + AI Search / Vectorize | 文档问答、RAG、模型成本控制会成为本站后续增强方向。 | 已在 [AI 产品](/platform/ai/) 拆解，等内容规模足够再写案例。 |
| P2 | Access + Tunnel 管理后台 | 预览环境、后台、内部工具不要裸露公网。 | 已在 [Zero Trust 与企业网络](/platform/zero-trust-networking/) 拆解。 |

## 每个案例必须回答的问题

| 维度 | 必须写清楚 |
| --- | --- |
| 背景 | 为什么普通项目会遇到这个问题，不做会有什么代价。 |
| 架构 | 请求路径、产品组合、数据流向和信任边界。 |
| 配置 | `wrangler.jsonc`、bindings、环境变量、secrets、资源创建命令。 |
| 代码 | 最小可运行实现；函数和关键逻辑要有中文注释。 |
| 本地验证 | `wrangler dev`、D1/R2/Queues 本地或 remote binding 的验证命令。 |
| 远程验证 | `wrangler deploy` 后的线上 URL、curl、日志或 Dashboard 结果。 |
| 成本 | Free / Workers Paid / usage-based 触发点。 |
| 安全 | 输入校验、鉴权、CORS、Turnstile、Rate Limiting、密钥和日志边界。 |
| 限制 | 文件大小、CPU、subrequests、读写次数、队列语义、一致性和缓存。 |
| 来源 | 官方 docs、产品级 `llms.txt`、pricing / limits 和必要的教程页。 |

## 案例验收标准

一篇案例只有同时满足下面条件，才算进入本站“可复现案例”：

- 读者可以从空项目开始创建资源。
- 所有 Cloudflare 资源都有明确 binding 或配置位置。
- 本地验证和远程验证都给出命令。
- 写接口或上传接口有输入边界，不把密钥暴露给浏览器。
- 涉及 D1 时使用 prepared statement，并说明索引和 migration。
- 涉及 R2 时说明 bucket 公开 / 私有、CORS、对象 key 和授权方式。
- 涉及异步任务时说明重试、死信队列和幂等。
- 涉及实时状态时说明 Durable Objects 的单实体边界。
- 涉及 AI 时说明 AI Gateway、模型成本、token / Neuron / 向量检索边界。
- 文末保留官方资料，具体版本和命令回到官方文档核对。

## 和官方教程的关系

官方教程通常面向某个产品或任务。本站案例会多做三件事：

1. 把多个产品放到同一个普通项目场景里。
2. 明确什么时候不用某个产品，避免为了案例而堆 Cloudflare 产品。
3. 把免费额度、Workers Paid、密钥、日志、CORS、误用风险写进同一个页面。

例如，官方 D1 comments tutorial 适合学习 D1 + Worker 的基础路径；本站的 Worker API + D1 案例会把 Hono、输入校验、prepared statement、migration、本地/远程验证和滥用防护合到一起。官方 R2 upload tutorial 适合学习 R2 上传；本站的 R2 签名上传案例会同时比较 Worker 代理上传和 presigned URL 直传。

## 官方资料

- [Workers Examples](https://developers.cloudflare.com/workers/examples/)
- [Workers Tutorials](https://developers.cloudflare.com/workers/tutorials/)
- [Workers Templates](https://developers.cloudflare.com/workers/get-started/quickstarts/)
- [Workers `llms.txt`](https://developers.cloudflare.com/workers/llms.txt)
- [D1 Tutorials](https://developers.cloudflare.com/d1/tutorials/)
- [Build a Comments API](https://developers.cloudflare.com/d1/tutorials/build-a-comments-api/)
- [D1 Examples](https://developers.cloudflare.com/d1/examples/)
- [R2 Tutorials](https://developers.cloudflare.com/r2/tutorials/)
- [Securely access and upload assets with R2](https://developers.cloudflare.com/workers/tutorials/upload-assets-with-r2/)
- [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/)
- [Cloudflare Use cases](https://developers.cloudflare.com/use-cases/llms.txt)
