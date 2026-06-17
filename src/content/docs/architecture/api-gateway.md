---
title: API 网关
description: 用 Workers 做 API、Webhook、表单、上传和轻量后端入口的架构模式。
---

最后核对日期：2026-06-18。

API 网关适合把公开 API、Webhook、表单、上传、第三方代理和轻量后端收敛到一个清楚边界。它不是“把所有业务塞进一个 Worker”，而是让入口层负责接入、安全、路由和组合，把数据、文件、异步任务和强一致状态放到各自合适的 Cloudflare 产品上。

## 一句话判断

| 场景 | 推荐组合 | 不适合的做法 |
| --- | --- | --- |
| 表单 / 评论 / 留言 | Worker + D1 + Turnstile + Rate Limiting。 | 匿名直接写库，或只在前端做校验。 |
| Webhook 网关 | Worker + 签名校验 + Queues + D1 状态表。 | Webhook 里同步做所有下游调用。 |
| 文件上传 API | Worker 鉴权 + R2 + D1 metadata + 短期签名 URL。 | 把 R2 access key 发给浏览器。 |
| 小型 SaaS API | Worker + D1 + KV 配置 + Workers Logs。 | 一开始拆成很多服务、很多数据库。 |
| 内部服务入口 | Worker + Access / Tunnel / Service Bindings。 | 让内部服务直接暴露公网。 |
| 高成本 AI API | Worker + AI Gateway + 用户配额 + 缓存。 | 匿名无限调用模型。 |
| 客户或移动端 API | Worker + API Shield + schema validation + JWT / mTLS。 | 没有 schema、没有限流、没有观测。 |

## 三种形态

Cloudflare 官方 Use cases 把 API 方案拆成三类。普通项目不用一开始全做，先看你在哪个阶段。

| 形态 | 什么时候用 | Cloudflare 组合 |
| --- | --- | --- |
| Edge-native APIs | 新项目直接跑在 Cloudflare 上。 | Workers、D1、KV、R2、Queues、Durable Objects。 |
| Secure API gateway | 已有源站或第三方 API，需要统一安全入口。 | WAF、Rate Limiting、API Shield、Workers、Access、mTLS。 |
| Microservices mesh | 内部服务变多，需要不暴露公网地互相调用。 | Service Bindings、Tunnel、Access、Workers VPC、Cloudflare One。 |

普通项目默认从 Edge-native APIs 起步。只有当你已有源站、第三方 API 或内部网络时，才需要补另外两类。

## 产品分工

| 问题 | 优先产品 | 判断 |
| --- | --- | --- |
| 入口逻辑在哪里跑 | Workers | 负责鉴权、输入检查、响应整理和轻量业务逻辑。 |
| 关系数据放哪里 | D1 | 用户、订单、评论、表单、状态表和审计记录。 |
| 文件放哪里 | R2 | 上传文件、导出包、图片原文件和备份。 |
| 配置和低频缓存放哪里 | KV | 租户配置、feature flags、公开索引、低频变化缓存。 |
| 慢任务怎么处理 | Queues / Workflows | 邮件、导入、AI 后处理、Webhook retry 和外部 API 调用。 |
| 强一致状态怎么处理 | Durable Objects | 限流桶、单资源锁、房间状态和顺序协调。 |
| 内部服务怎么隔离 | Service Bindings / Tunnel / Access | 不让内部服务拥有公开入口。 |
| 怎么观察成本和错误 | Workers Logs、Analytics Engine、API Shield Analytics | 按客户、路径、状态码或业务事件复盘。 |

## 拆分时机

一个 Worker 可以撑过很长时间。拆分不是为了显得架构漂亮，而是为了边界更清楚。

| 信号 | 处理方式 |
| --- | --- |
| 只有少量 API 路径 | 一个 Worker + 清晰模块即可。 |
| 多个入口复用鉴权、账单或配额 | 把复用逻辑拆成内部 Worker。 |
| 某个路径有独立发布节奏 | 独立 Worker，入口 Worker 只做转发或调用。 |
| 同一个资源的并发写入需要严格顺序 | 用 Durable Objects，不用 KV 或全局变量模拟锁。 |
| 用户请求不该等待任务完成 | 写入 Queues，让后台处理。 |
| 外部数据库迁移成本高 | 入口留在 Workers，外部数据库再用 Hyperdrive 优化连接。 |

## 落地顺序

| 顺序 | 先做什么 |
| --- | --- |
| 1 | 用一个 Worker 接住动态接口，只做路由、鉴权、输入校验和少量业务逻辑。 |
| 2 | 所有写接口定义响应格式、错误码、幂等策略和日志字段。 |
| 3 | 业务数据需要 SQL 时接 D1，配置和读多写少缓存再接 KV。 |
| 4 | 文件进入 R2，Worker 只做鉴权、签名、元数据和必要转发。 |
| 5 | 邮件、Webhook retry、导入、AI 后处理这类慢任务写入 Queues。 |
| 6 | 同一个资源有并发顺序问题时，再用 Durable Objects。 |
| 7 | 多个入口复用逻辑时，再拆内部 Worker。 |
| 8 | API 面向客户、移动端或机器调用时，补 API Shield、mTLS、Access 和更细的 Rate Limiting。 |

## 安全和成本边界

| 风险 | 最小做法 |
| --- | --- |
| 匿名刷写接口 | WAF Rate Limiting、Turnstile、登录态或签名。 |
| API schema 漂移 | 应用层校验请求；客户 API 再加 API Shield。 |
| 机器调用伪造 | HMAC、JWT、service token；高风险再看 mTLS。 |
| 内部服务暴露 | Service Binding 或 Tunnel，不给内部服务公网入口。 |
| 成本被刷 | 入口限流、配额、缓存、AI Gateway 和 Budget alerts。 |
| 敏感日志泄漏 | 不记录 token、cookie、密钥和正文隐私。 |
| D1 扫描过大 | 常用查询建索引，不做无界 full scan。 |
| R2 操作量过高 | 热文件要评估缓存，下载次数也是 Class B。 |
| 队列操作量过高 | 小消息通常写、读、删至少三次操作，重试也会增加操作。 |

## 上线前检查

| 检查 | 判断 |
| --- | --- |
| 鉴权 | 无 token、错 token、过期 token 都应该被拒绝。 |
| 输入 | 非法 JSON、超大 body、错误 content-type 都有明确响应。 |
| 幂等 | 重复 Webhook 或重复提交不会重复扣费、发信或写关键状态。 |
| 数据 | D1 写入后能查到，常用查询不会全表扫描。 |
| 异步 | Queue 消费失败能重试，超过上限有死信或可追踪状态。 |
| 内部服务 | 内部 Worker 或源站不需要公开 URL。 |
| 限流 | 触发阈值后返回 429，日志能看到 actor、route 和原因。 |
| 观测 | 至少能区分入口错误、鉴权错误、业务错误、上游错误和限流。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/templates/chanfana-openapi-template](https://github.com/cloudflare/templates/tree/main/chanfana-openapi-template) | Worker + OpenAPI 的 schema-first API。 |
| [cloudflare/templates/react-router-hono-fullstack-template](https://github.com/cloudflare/templates/tree/main/react-router-hono-fullstack-template) | Workers Static Assets + Hono API 的 full-stack 组织方式。 |
| [cloudflare/templates/d1-template](https://github.com/cloudflare/templates/tree/main/d1-template) | Worker + D1 binding + migration 的最小入口。 |
| [cloudflare/workers-oauth-provider](https://github.com/cloudflare/workers-oauth-provider) | Workers 上的 OAuth 2.1 provider，适合学习 API 鉴权边界。 |
| [cloudflare/queues-web-crawler](https://github.com/cloudflare/queues-web-crawler) | Worker + Queues + Browser Rendering + KV 的异步任务参考。 |

## 官方资料

- [APIs and microservices](https://developers.cloudflare.com/use-cases/apis/)
- [Deploy APIs at the edge](https://developers.cloudflare.com/use-cases/apis/deploy-apis/)
- [Protect your APIs](https://developers.cloudflare.com/use-cases/apis/protect-apis/)
- [Connect your internal network services](https://developers.cloudflare.com/use-cases/apis/internal-services/)
- [Monitor your APIs](https://developers.cloudflare.com/use-cases/apis/monitor-apis/)
- [Serverless global APIs](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/serverless-global-apis/)
- [Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [Workers Rate Limiting API](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Workers pricing: Service bindings](https://developers.cloudflare.com/workers/platform/pricing/#service-bindings)
