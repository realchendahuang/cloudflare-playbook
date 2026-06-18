---
title: API 网关
description: 用 Workers 做接口、第三方回调、表单、上传和轻量后端入口的架构模式。
---

最后核对日期：2026-06-18。

API 网关只解决一件事：把动态入口收清楚。Worker 负责入口；数据、文件、慢任务和强一致状态分别交给合适的产品。

## 先判断是不是这类问题

| 场景 | 默认组合 | 先别做什么 |
| --- | --- | --- |
| 表单 / 评论 / 留言 | Worker + D1 + Turnstile + 限流。 | 匿名直接写库，或只在前端做校验。 |
| 第三方回调 | Worker + 签名校验 + Queues。 | 回调里同步做所有下游调用。 |
| 文件上传 | Worker + R2 + 短期签名链接。 | 把 R2 访问凭证发给浏览器。 |
| 小型 SaaS 接口 | Worker + D1 + KV 配置 + Workers Logs。 | 一开始拆成很多服务、很多数据库。 |
| AI 代理接口 | Worker + AI Gateway + 用户配额 + 缓存。 | 匿名无限调用模型。 |
| 内部服务入口 | Worker + Access / Tunnel。 | 让内部服务直接暴露公网。 |

## 落地顺序

| 顺序 | 做什么 |
| --- | --- |
| 1 | 先用一个 Worker 接住动态接口，只做入口判断和少量业务逻辑。 |
| 2 | 业务数据接 D1，文件接 R2，读多写少配置再接 KV。 |
| 3 | 邮件、导入、AI 后处理、回调重试写入 Queues。 |
| 4 | 同一个资源有并发顺序问题时，再用 Durable Objects。 |
| 5 | 面向客户、移动端或机器调用时，再补更细的安全策略。 |

## 边界

| 风险 | 最小做法 |
| --- | --- |
| 匿名刷写接口 | WAF 限流、Turnstile、登录态或签名。 |
| 请求格式漂移 | 应用层校验请求；客户接口再看 API Shield。 |
| 内部服务暴露 | Access / Tunnel，不给内部服务公网入口。 |
| 成本被刷 | 入口限流、配额、缓存、AI Gateway 和预算提醒。 |
| 敏感日志泄漏 | 不记录密钥、登录凭证和正文隐私。 |
| D1 扫描过大 | 常用查询建索引，不做无界全表扫描。 |
| R2 操作量过高 | 热文件要评估缓存，下载和读取次数也会计入操作。 |

官方核对入口：[APIs and microservices](https://developers.cloudflare.com/use-cases/apis/)、[Deploy APIs at the edge](https://developers.cloudflare.com/use-cases/apis/deploy-apis/)、[Protect your APIs](https://developers.cloudflare.com/use-cases/apis/protect-apis/)。
