---
title: Workers
description: Cloudflare Workers 的定位、适用场景和学习重点。
---

# Workers

Workers 是 Cloudflare 的边缘运行时，适合写轻量 API、代理、Webhook、鉴权中间层和边缘数据访问逻辑。

## 适合什么

- API 网关：统一鉴权、转发、限流、缓存。
- Webhook：接收第三方事件并写入队列或数据库。
- 边缘代理：改写请求、补充 Header、屏蔽源站细节。
- 轻量后端：配合 D1、KV、R2、Durable Objects 完成小型业务闭环。

## 先学什么

1. `fetch(request, env, ctx)` 的请求处理模型。
2. 通过 `env` 使用 D1、KV、R2、Queues 等绑定。
3. 使用 Wrangler 本地开发、配置环境和部署。
4. 用日志、测试和预览环境验证行为。

## 常见误区

- 不要把 Workers 当成传统长连接服务器。
- 不要把所有状态都塞进全局变量。
- 不要在没有缓存和限流设计的情况下代理高成本 API。

## 后续案例

- [Worker API + D1](/recipes/worker-api-d1/)
