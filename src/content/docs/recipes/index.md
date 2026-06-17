---
title: 实战案例
description: 可复现的 Cloudflare 产品组合案例、选择顺序和验收标准。
---

最后核对日期：2026-06-17。

案例用于把产品地图和架构模式落到可运行项目里。这里不追求覆盖所有官方教程，只保留普通项目最容易复用的组合。

## 当前案例

| 案例 | 核心产品 | 适合先学什么 |
| --- | --- | --- |
| [Worker API + D1](/recipes/worker-api-d1/) | Workers、D1 | 小 API、评论、表单和后台数据写入。 |
| [R2 签名上传](/recipes/r2-signed-upload/) | Workers、R2 | 文件、图片、附件和导出物上传。 |

这两个案例先写，是因为它们覆盖了大多数早期项目的两条主线：**结构化数据写入**和**文件对象上传**。评论、表单、后台配置、用户资料、附件、图片、导出文件，最终都会落到这两类问题上。

## 选择顺序

1. 先看 [Worker API + D1](/recipes/worker-api-d1/)：理解 Worker 如何接收请求、校验输入、调用 binding 资源，并用 D1 保存关系数据。
2. 再看 [R2 签名上传](/recipes/r2-signed-upload/)：理解文件为什么放 R2，为什么不能把 R2 密钥放到浏览器，以及 CORS 和短期授权怎么配。
3. 做真实项目时，把 D1 案例里的业务记录和 R2 案例里的对象 key 关联起来。例如评论附件、用户头像、导出文件、AI 生成结果，都应该有 D1 metadata 和 R2 object。

## 接下来补什么

| 方向 | 为什么值得补 |
| --- | --- |
| 静态内容站部署 | 文档站、官网、博客最常见，能吃满免费静态能力。 |
| 写接口保护 | 评论、登录、表单、上传和 AI 调用都需要限流、验证和日志。 |
| Queues 后台任务 | 邮件、通知、导入、审核和批处理不能卡住用户请求。 |
| Durable Objects 实时房间 | WebSocket、房间状态和多人协作需要单实体一致性。 |
| Access + Tunnel 后台 | 预览环境、后台和内部工具不应该裸露公网。 |
| AI 搜索 | 内容规模足够后，再把 Pagefind、AI Gateway 和 AI Search 组合起来。 |

## 和官方教程的关系

官方教程通常面向某个产品或任务。本站案例会多做三件事：

1. 把多个产品放到同一个普通项目场景里。
2. 明确什么时候不用某个产品，避免为了案例而堆 Cloudflare 产品。
3. 把免费额度、Workers Paid、密钥、日志、CORS、误用风险写进同一个页面。

例如，官方 D1 comments tutorial 适合学习 D1 + Worker 的基础路径；本站的 Worker API + D1 案例会补上输入边界、数据写入和滥用防护。官方 R2 upload tutorial 适合学习 R2 上传；本站的 R2 签名上传案例会补上浏览器直传、私有文件和授权边界。

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
