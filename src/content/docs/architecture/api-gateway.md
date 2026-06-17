---
title: API 网关
description: 用 Workers 做鉴权、路由、限流、异步任务和内部服务编排的架构模式。
---

最后核对日期：2026-06-17。

API 网关适合把公开 API、Webhook、第三方代理、内部服务和轻量后端收敛到一个清楚的边界。它不是“把所有业务塞进一个 Worker”，而是让入口层只负责接入、安全、路由和组合，把数据、异步任务和内部服务放到各自合适的 Cloudflare 产品上。

Cloudflare 官方 Use cases 把 API 方案拆成三类：Secure API gateway、Edge-native APIs、Microservices mesh。普通项目可以把它们收敛成一条路线：**先有一个清楚的 Worker API 入口，再按需求接 D1 / KV / R2 / Queues / Durable Objects / Service Bindings / API Shield / Access**。

## 请求路径

```text
客户端 / Webhook / 第三方系统
  │
  ▼
Cloudflare 边界
  ├─ DNS / SSL / DDoS
  ├─ WAF / Rate Limiting / API Shield / Access
  │
  ▼
入口 Worker
  ├─ 校验身份、签名、来源、content-type、body 大小
  ├─ 读取 KV 配置或缓存
  ├─ 查询 / 写入 D1
  ├─ 把慢任务写入 Queues
  ├─ 通过 R2 处理文件
  ├─ 通过 Service Bindings 调内部 Worker
  └─ 转发到源站、SaaS API 或私有服务
```

这条路径的关键是：**Cloudflare 边界处理通用安全，入口 Worker 处理业务安全，绑定资源处理状态，队列处理慢任务，内部服务不直接暴露公网。**

## 适用场景

| 场景 | 推荐组合 | 不适合的做法 |
| --- | --- | --- |
| 表单 / 评论 / 留言 | Worker + D1 + Turnstile + Rate Limiting。 | 匿名直接写库，或只在前端做校验。 |
| Webhook 网关 | Worker + HMAC 签名校验 + Queues + D1 状态表。 | Webhook 里同步做所有下游调用。 |
| 文件上传 API | Worker 鉴权 + R2 + D1 metadata + 短期签名 URL。 | 把 R2 access key 发给浏览器。 |
| 小型 SaaS API | Worker + D1 + KV 配置 + Workers Logs。 | 一开始拆成很多服务、很多数据库。 |
| 多内部服务 | 入口 Worker + Service Bindings + Access / Tunnel。 | 让内部 Worker 拥有公开 URL。 |
| 高成本 AI API | Worker + AI Gateway + 用户配额 + 缓存。 | 匿名无限调用模型。 |
| 客户或移动端 API | Worker + API Shield + schema validation + JWT / mTLS。 | 没有 schema、没有限流、没有观测。 |

## 三种架构形态

| 形态 | 什么时候用 | Cloudflare 组合 |
| --- | --- | --- |
| Secure API gateway | 已有源站或第三方 API，需要在边缘做安全和统一入口。 | WAF、Rate Limiting、API Shield、Workers、Access、mTLS。 |
| Edge-native APIs | 新项目直接跑在 Cloudflare 上，数据也在平台内。 | Workers、D1、KV、R2、Queues、Durable Objects。 |
| Microservices mesh | 内部服务变多，需要不暴露公网地互相调用。 | Service Bindings、Tunnel、Access、Workers VPC、Cloudflare One。 |

普通项目的默认起点是 Edge-native APIs。只有当你已有源站、第三方 API 或内部网络时，才需要把 Secure API gateway 和 Microservices mesh 补进来。

## 产品分层

| 层 | 产品 | 适合放什么 | 升级信号 |
| --- | --- | --- | --- |
| 边界安全 | WAF、Rate Limiting、API Shield、Access、mTLS。 | 通用攻击、防刷、schema、身份和机器认证。 | API 面向客户、移动端、机器调用或有合规要求。 |
| 入口计算 | Workers。 | 路由、鉴权、输入清洗、响应转换、轻量业务逻辑。 | 请求路径变复杂，开始需要分层。 |
| 内部服务 | Service Bindings。 | Auth、billing、搜索、通知等内部 Worker。 | 多个入口复用同一段逻辑，或需要独立部署。 |
| 读多写少 | KV。 | 租户配置、feature flags、公开索引、低频变化缓存。 | 读取多、允许最终一致。 |
| 关系数据 | D1。 | 用户、订单、评论、表单、状态表、审计记录。 | 需要 SQL、索引、迁移和事务语义。 |
| 对象文件 | R2。 | 上传文件、导出包、图片原文件、备份。 | 文件大、下载多、不能放进 Git 或静态包。 |
| 强一致状态 | Durable Objects。 | 限流桶、单资源锁、房间状态、顺序协调。 | 同一个资源的并发写入需要严格顺序。 |
| 异步任务 | Queues / Workflows。 | Webhook retry、邮件、导入、AI 后处理、外部 API 调用。 | 用户请求不该等待任务完成。 |
| 观测 | Workers Logs、Analytics Engine、Logpush、API Shield Analytics。 | 错误、延迟、命中、配额、客户用量。 | 需要按客户、路径、状态码或业务事件复盘。 |

## 拆分时机

一个 Worker 可以撑过很长时间。拆分不是为了显得架构漂亮，而是为了边界更清楚。

| 信号 | 处理方式 |
| --- | --- |
| 只有 5 到 10 个 API 路径 | 一个 Worker + 清晰模块即可。 |
| 多个入口复用 auth / billing / quota | 把复用逻辑拆成内部 Worker，用 Service Bindings 调用。 |
| 某个路径有独立发布节奏 | 独立 Worker，入口 Worker 只转发或 RPC 调用。 |
| 某个资源需要强一致 | 用 Durable Objects，不用 KV 或全局变量模拟锁。 |
| 某个任务超过用户请求耐心 | 写入 Queues，让 Consumer 后台处理。 |
| 外部数据库迁移成本高 | 入口 Worker 仍在边缘，外部数据库通过 Hyperdrive 优化连接。 |

Service Bindings 的价值是让 Worker 调 Worker 不经过公开 URL。官方文档也强调它适合共享内部服务、隔离公网访问和独立部署；在 Workers Standard 计费下，Service Binding 调用不会额外增加请求费，只累计相关 Worker 的 CPU 时间。

## 最小落地步骤

1. 先用一个 Worker 接 `/api/*`，只做路由、鉴权、输入校验和少量业务逻辑。
2. 所有写接口先定义响应格式、错误码、幂等策略和日志字段。
3. 业务数据需要 SQL 时接 D1，配置和读多写少缓存再接 KV。
4. 文件进入 R2，Worker 只做鉴权、签名、元数据和必要的流式转发。
5. 邮件、Webhook retry、导入、AI 后处理这类慢任务写入 Queues。
6. 同一个资源有并发顺序问题时，再用 Durable Objects。
7. 多个入口复用逻辑时，再拆 Service Bindings。
8. API 面向客户、移动端或机器调用时，补 API Shield、mTLS、Access 和更细的 Rate Limiting。

## 最小 Worker 入口

这个示例只表达边界，不是完整框架。真实项目可以用 Hono、itty-router、chanfana 或框架路由，但入口逻辑仍然应该清楚。

```ts
type Env = {
  DB: D1Database;
  JOBS: Queue;
  CONFIG: KVNamespace;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 入口层先拒绝非 API 请求，避免静态页面和 API 边界混在一起。
    if (!url.pathname.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }

    // 写接口先做服务端鉴权，不能依赖前端是否隐藏了按钮。
    const authorization = request.headers.get("Authorization");
    if (!authorization) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }

    // 明确路由分支，让每条 API 的成本、权限和数据访问都能被复盘。
    if (url.pathname === "/api/comments" && request.method === "POST") {
      const body = await request.json<{ content: string }>();

      // D1 负责关系数据写入，插入语句使用 prepared statement。
      await env.DB.prepare("INSERT INTO comments (content) VALUES (?1)").bind(body.content).run();

      // 慢任务进入队列，不阻塞用户请求。
      await env.JOBS.send({ type: "comment.created" });

      return Response.json({ ok: true }, { status: 201 });
    }

    return Response.json({ error: "not_found" }, { status: 404 });
  },
};
```

如果这个入口开始变大，优先把 handler 按路径拆到文件；当多个入口复用同一套 auth / quota / billing，再拆成 Service Binding。

## 安全边界

| 风险 | 最小做法 | 升级做法 |
| --- | --- | --- |
| 匿名刷写接口 | WAF Rate Limiting、Turnstile、登录态或签名。 | API Shield、per-session rate limit、Bot 管理。 |
| API schema 漂移 | 应用层校验 request body 和 response。 | API Shield schema validation，先 `log` 再 `block`。 |
| 机器调用伪造 | HMAC、JWT、service token。 | mTLS、Access service tokens、JWT validation。 |
| 内部服务暴露 | Service Binding 或 Tunnel，不给内部 Worker 公网入口。 | Access policy、Workers VPC、Cloudflare One。 |
| 成本被刷 | 入口限流、配额、缓存、AI Gateway。 | Analytics Engine、Logpush、预算提醒和分客户计量。 |
| 敏感日志泄漏 | 不记录 token、cookie、密钥、正文隐私。 | Logpush 过滤、SIEM、字段级规范。 |

Workers Rate Limiting API 适合在代码里按用户、客户、路径或资源做业务级限流。它的计数是快速、异步更新的，不适合作为严格账务系统；需要精确强一致配额时，再用 Durable Objects 或 D1 事务设计。

## 成本边界

API 网关最容易低估的不是请求费，而是动态路径被滥用后的组合成本。

| 成本项 | 怎么控制 |
| --- | --- |
| Worker 请求 | 静态资产不要进 Worker；API 路径才进动态逻辑。 |
| CPU | 避免大 JSON、大循环、同步重计算；高成本逻辑缓存或异步化。 |
| Subrequests | 聚合外部 API 要设置并发、超时和缓存。 |
| D1 rows read | 常用查询建索引，不做无界 full scan。 |
| R2 operations | 下载次数也是 Class B；热文件要评估缓存和访问路径。 |
| Queues operations | 小消息通常写、读、删至少 3 次操作；重试也会增加操作。 |
| Logs | 结构化、采样、过滤，不把每个请求正文写进日志。 |
| AI | 所有模型调用先经过 AI Gateway，按用户或 API key 设置配额。 |

## 观测方式

| 目标 | 看哪里 |
| --- | --- |
| Worker 是否报错 | Workers Logs、`wrangler tail`、Invocation Status。 |
| 某条 API 是否被刷 | WAF Security Events、Rate Limiting 命中、429 响应。 |
| API endpoint 是否遗漏 | API Shield Discovery / Endpoint Management。 |
| 上游慢在哪里 | Worker 日志记录上游耗时、状态码和错误分类。 |
| 客户用量 | Analytics Engine 或 D1 记录 customer / route / quota。 |
| 长期取证 | Workers Trace Events Logpush 或企业 Logpush。 |

## 验证清单

| 检查 | 怎么验证 |
| --- | --- |
| 鉴权 | 无 token、错 token、过期 token 都应该被拒绝。 |
| 输入 | 非法 JSON、超大 body、错误 content-type 都有明确响应。 |
| 幂等 | 重复 Webhook 或重复提交不会重复扣费、发信或写关键状态。 |
| 数据 | D1 写入后能查到，索引字段查询不会 full scan。 |
| 异步 | Queue 消费失败能重试，超过上限有死信或可追踪状态。 |
| 内部服务 | 没有公开 URL 也能被入口 Worker 通过 Service Binding 调用。 |
| 限流 | 触发阈值后返回 429，日志能看到 actor、route 和原因。 |
| 观测 | 至少能区分入口错误、鉴权错误、业务错误、上游错误和限流。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/templates/chanfana-openapi-template](https://github.com/cloudflare/templates/tree/main/chanfana-openapi-template) | Worker + Hono + OpenAPI 3.1 自动生成和请求校验，适合学习 schema-first API。 |
| [cloudflare/templates/react-router-hono-fullstack-template](https://github.com/cloudflare/templates/tree/main/react-router-hono-fullstack-template) | Workers Static Assets + Hono `/api/*` 的 full-stack 组织方式。 |
| [cloudflare/templates/d1-template](https://github.com/cloudflare/templates/tree/main/d1-template) | Worker + D1 binding + migration 的最小入口。 |
| [cloudflare/workers-oauth-provider](https://github.com/cloudflare/workers-oauth-provider) | 在 Workers 上实现 OAuth 2.1 provider，适合学习 API 鉴权边界。 |
| [cloudflare/workers-sdk Queues template](https://github.com/cloudflare/workers-sdk/tree/main/packages/create-cloudflare/templates/queues/ts) | Producer / Consumer / `wrangler.jsonc` 的 Queues 最小组合。 |
| [cloudflare/queues-web-crawler](https://github.com/cloudflare/queues-web-crawler) | Worker + Queues + Browser Rendering + KV 的异步任务参考。 |

## 官方资料

- [Serverless global APIs](https://developers.cloudflare.com/reference-architecture/diagrams/serverless/serverless-global-apis/)
- [APIs and microservices](https://developers.cloudflare.com/use-cases/apis/)
- [Deploy APIs at the edge](https://developers.cloudflare.com/use-cases/apis/deploy-apis/)
- [Protect your APIs](https://developers.cloudflare.com/use-cases/apis/protect-apis/)
- [Connect your internal network services](https://developers.cloudflare.com/use-cases/apis/internal-services/)
- [Monitor your APIs](https://developers.cloudflare.com/use-cases/apis/monitor-apis/)
- [Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [Workers Rate Limiting API](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Workers pricing: Service bindings](https://developers.cloudflare.com/workers/platform/pricing/#service-bindings)
