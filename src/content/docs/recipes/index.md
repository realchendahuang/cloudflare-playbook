---
title: 实战案例
description: 最常复用的 Cloudflare 产品组合案例。
---

最后核对日期：2026-06-18。

案例只保留高频组合。先学会两件事：结构化数据进 D1，文件对象进 R2。

## 当前案例

| 案例 | 核心产品 | 适合先学什么 |
| --- | --- | --- |
| [Worker API + D1](/recipes/worker-api-d1/) | Workers、D1 | 小 API、评论、表单和后台数据写入。 |
| [R2 签名上传](/recipes/r2-signed-upload/) | Workers、R2 | 文件、图片、附件和导出物上传。 |

这两个案例覆盖大多数早期项目的两条主线：**结构化数据写入**和**文件对象上传**。

## 选择顺序

1. 先看 [Worker API + D1](/recipes/worker-api-d1/)：理解 Worker 如何接收请求、校验输入，并用 D1 保存关系数据。
2. 再看 [R2 签名上传](/recipes/r2-signed-upload/)：理解文件为什么放 R2，为什么不能把 R2 密钥放到浏览器。
3. 做真实项目时，把 D1 里的业务记录和 R2 的对象 key 关联起来。

## 接下来补什么

| 方向 | 为什么值得补 |
| --- | --- |
| 静态内容站部署 | 文档站、官网、博客最常见，能吃满免费静态能力。 |
| 写接口保护 | 评论、登录、表单、上传和 AI 调用都需要限流、验证和日志。 |
| Queues 后台任务 | 邮件、通知、导入、审核和批处理不能卡住用户请求。 |
| Durable Objects 实时房间 | WebSocket、房间状态和多人协作需要单实体一致性。 |
| Access + Tunnel 后台 | 预览环境、后台和内部工具不应该裸露公网。 |
| AI 搜索 | 内容规模足够后，再把 Pagefind、AI Gateway 和 AI Search 组合起来。 |

## 官方资料

- [Workers Examples](https://developers.cloudflare.com/workers/examples/)
- [Workers Tutorials](https://developers.cloudflare.com/workers/tutorials/)
- [D1 Tutorials](https://developers.cloudflare.com/d1/tutorials/)
- [Build a Comments API](https://developers.cloudflare.com/d1/tutorials/build-a-comments-api/)
- [R2 Tutorials](https://developers.cloudflare.com/r2/tutorials/)
- [Securely access and upload assets with R2](https://developers.cloudflare.com/workers/tutorials/upload-assets-with-r2/)
- [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/)
