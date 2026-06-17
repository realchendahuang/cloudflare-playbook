---
title: API 网关
description: 用 Workers 做鉴权、代理、缓存和轻量后端的架构模式。
---

最后核对日期：2026-06-17。

API 网关适合把多个后端、第三方 API 或内部服务包装成一个统一入口。

## 架构

```text
客户端
  │
  ▼
Worker
  ├─ 校验身份
  ├─ 读取 KV 配置
  ├─ 查询 D1
  ├─ 写入 Queue
  └─ 转发源站或第三方 API
```

Cloudflare 官方 Serverless global APIs 架构里，把入口 Worker 放在 API Shield / Router 的位置：先做验证、鉴权和转换，再通过 Service Bindings 调用更小的内部 Worker，读多写少数据走 KV，关系型数据走 D1，外部数据库再看 Hyperdrive。

## 常见能力

- 鉴权：校验 token、签名、来源和权限。
- 限流：低风险计数可以从 WAF / Rate Limiting 起步；强一致桶再用 Durable Objects。
- 缓存：缓存公开接口或低频变化数据。
- 观测：记录请求状态、上游延迟和错误分类。
- 解耦：通过 Queues 处理邮件、通知、webhook retry、外部 API 等后台任务。
- 内部服务：通过 Service Bindings 调用其他 Worker，避免把内部服务暴露到公网 URL。

## 判断标准

如果逻辑可以在一次请求里完成，并且状态需求不复杂，Workers 通常足够。如果需要强一致对象状态，再引入 Durable Objects。

## 产品分层

| 层 | 产品 | 适合放什么 |
| --- | --- | --- |
| 入口层 | Workers + WAF / Rate Limiting / Turnstile | 路由、鉴权、输入清洗、防刷。 |
| 服务层 | Service Bindings | Auth、billing、通知、搜索等内部 Worker。 |
| 配置层 | KV | 租户配置、feature flags、公开索引、低频变化数据。 |
| 数据层 | D1 | 用户、订单、评论、表单、状态表。 |
| 强一致层 | Durable Objects | 限流桶、房间、单资源锁、顺序协调。 |
| 异步层 | Queues | webhook、邮件、导入、日志汇总、外部 API retry。 |

## 最小落地步骤

1. 先用一个 Worker 暴露 `/api/*`，只做路由、鉴权和少量业务逻辑。
2. 业务数据需要 SQL 时接 D1，读多写少配置再接 KV。
3. 请求不能阻塞用户响应的工作放进 Queues。
4. 内部服务变多时，再把公共逻辑拆成 Service Bindings。
5. 出现单资源并发冲突时，再引入 Durable Objects。

## 风险

| 风险 | 判断 |
| --- | --- |
| 一个 Worker 写成所有业务的大泥球 | 先按路径和职责拆模块；需要独立发布时再拆 Service Binding。 |
| KV 当数据库 | KV 最终一致，不能承载强一致写入和锁。 |
| API 里同步调用太多外部服务 | 用户请求路径只保留必要步骤，其余进 Queues。 |
| 鉴权只在前端做 | 所有写接口和敏感读接口都要在 Worker 服务端验证。 |

## 验证方式

| 检查 | 怎么看 |
| --- | --- |
| 鉴权 | 无 token、错 token、过期 token 都应该被拒绝。 |
| 输入 | 非法 JSON、超大 body、错误 content-type 都要有明确响应。 |
| 数据 | D1 写入后能查到，重复请求不会重复写入关键业务。 |
| 异步 | Queue 消费失败能重试，超过上限进入死信或可追踪状态。 |
| 观测 | 日志至少能区分入口错误、业务错误、上游错误和限流。 |

## 官方资料

- [Serverless global APIs](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/serverless-global-apis/)
- [Deploy APIs at the edge](https://developers.cloudflare.com/use-cases/apis/deploy-apis/)
- [Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [Choose a data or storage product](https://developers.cloudflare.com/workers/platform/storage-options/)
- [Workers source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workers)
