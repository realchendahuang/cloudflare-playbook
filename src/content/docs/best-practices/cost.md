---
title: 成本控制
---

Cloudflare 账单分四条线看：域名计划、Workers Paid、附加产品和按量计费。预算提醒、用量面板和发票规则见 [账单与预算](/platform/billing/)；额度数字见 [免费额度大全](/platform/free-paid/)。

## 免费额度优先级

| 优先级 | 先盯什么 | 为什么 |
| --- | --- | --- |
| 1 | 静态资产请求 | Workers Static Assets / Pages 静态资产请求免费且不限量，读文档、官网、博客不消耗 Worker 请求。 |
| 2 | Worker 请求和 CPU | Workers Free 是 100,000 次动态请求/天、10 ms CPU/次调用；动态接口先看这里。 |
| 3 | 数据读写 | D1 看读取和写入行数，KV 看读写和列举次数，R2 看存储量、写入类操作和读取类操作。 |
| 4 | 写接口滥用 | 评论、表单、上传、搜索、第三方回调、AI 调用都要有身份、Turnstile、限流或配额。 |
| 5 | 日志和 AI | Workers Logs、AI Gateway、Workers AI、AI Search、Vectorize 都适合先验证，再扩大。 |
| 6 | 固定订阅和附加产品 | Workers Paid、Pro / Business、Images Paid、Stream、日志查询、Load Balancing 等要按产品单独判断。 |

## 免费友好的架构规则

| 规则 | 做法 |
| --- | --- |
| 静态优先 | 文档、官网、前端构建产物走 Workers Static Assets 或 Pages；只有接口交给 Worker。 |
| 数据归位 | 关系数据进 D1，文件进 R2，配置和缓存进 KV，强一致房间状态进 Durable Objects。 |
| 后台异步 | 邮件、通知、导入、转码、爬取、AI 批处理放 Queues 或定时任务。 |
| AI 先网关 | 模型调用先过 AI Gateway，观察请求数、模型用量、缓存和错误，再决定是否扩大。 |
| 大文件离站点 | 图片原图、附件、导出、视频离开静态站构建包；图片进 R2 / Images，视频进 Stream。 |
| 入口限流 | 登录、评论、搜索、上传、第三方回调先做最小限流和 Turnstile，再看更重的安全产品。 |
| 日志克制 | 生产日志记录请求编号、路径、状态、耗时和错误类型；不记录密钥、登录凭证和正文隐私。 |

## 付费判断

Workers Paid 只在动态请求、CPU、日志、定时任务、D1、KV、Queues、Durable Objects、Hyperdrive、Browser Run 或 Workers AI 已经在线上稳定使用时才值得开。它属于开发者平台订阅；WAF、缓存规则、证书、Bot、R2、Images、Stream、日志查询和企业日志按各自规则计费。

静态文档站、博客、官网、作品集，或者搜索用 Pagefind 就能解决时，先用免费层。详细数字和关键区分见 [免费额度大全](/platform/free-paid/)。
