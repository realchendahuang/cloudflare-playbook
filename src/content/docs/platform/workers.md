---
title: Workers
description: Cloudflare Workers 的普通项目取舍、免费额度、付费边界和架构分工。
---

最后核对日期：2026-06-18。

Workers 是 Cloudflare 的请求级计算层，不是一台长期运行的小服务器。普通项目先记三句话：静态资产请求免费且不限量；动态 Worker 才按请求和 CPU 进入计费；状态、文件和后台任务不要硬塞进 Worker 内存里。

## 该不该用

| 场景 | 判断 | 推荐组合 |
| --- | --- | --- |
| 文档站、官网、博客 | 用，但静态内容优先走资产层 | [Static Assets](/platform/static-assets/) + 少量 `/api/*` Worker |
| 小 API、Webhook、表单 | 很适合 | Worker + D1/KV/Queues |
| API 网关、鉴权、代理 | 很适合 | Worker + WAF / Rate Limiting / Turnstile |
| 大文件上传下载 | 只让 Worker 做入口控制 | Worker + R2 + 签名 URL |
| 强一致房间、会话、协作状态 | Worker 只做入口 | Worker + Durable Objects |
| 批处理、导入、通知、重试 | 不要靠 Worker 请求硬跑 | Worker + Queues / Workflows |
| 传统后台常驻进程 | 不优先 | Containers 或外部服务 |
| SSR 或重计算页面 | 谨慎 | 先估 CPU，再决定是否上 Paid |

## 免费与付费边界

| 能力 | Workers Free | Workers Paid / Standard | 普通项目判断 |
| --- | --- | --- | --- |
| Worker 请求 | 100,000 requests/day，UTC 0 点重置 | 10M requests/month included，超出 $0.30/million | 免费足够早期 API；公开 API 要配缓存、限流和监控。 |
| CPU | 10 ms/invocation | 30M CPU ms/month included，超出 $0.02/million；默认 30s，可设到 5min | 代理、表单、轻 API 很省；SSR、解析大 JSON、AI 前处理要估算。 |
| 静态资产请求 | 免费且不限量 | 免费且不限量 | 前端、文档、图片索引等能静态化的都不要进 Worker。 |
| 数据传输 / 带宽 | 无额外 data transfer 或 throughput charge | 同左 | 成本主要看动态请求、CPU、存储和产品操作。 |
| Static Asset 文件数 | 20,000 files/Worker version | 100,000 files/Worker version | 大量媒体不要打进站点包，放 R2/Images/Stream。 |
| Static Asset 单文件 | 25 MiB | 25 MiB | 文档构建产物通常没问题，大附件别放这里。 |
| Workers Logs | 200,000 events/day，保留 3 days | 20M events/month included，保留 7 days | 日志能用，但不要把它当长期审计库。 |
| Workers Paid 基础费 | 不需要 | $5/month minimum | 当动态请求、CPU、日志或 Durable Objects 进入生产后再买。 |

## 最容易踩的限制

| 限制 | 当前边界 | 该怎么设计 |
| --- | --- | --- |
| Memory | 128 MB/isolate | 上传、下载、上游大响应尽量流式处理。 |
| Subrequests | Free 50/request；Paid 默认 10,000/request | 聚合多个上游时要限并发，必要时进队列。 |
| 同时等待响应头的出站连接 | 6/request | 批量抓取不要一次性打满。 |
| Worker 压缩后大小 | Free 3 MB；Paid 10 MB | 少引重型 Node 包，先看 bundle 体积。 |
| Startup time | 1 second | 大 schema、模型、初始化逻辑不要放顶层。 |
| 环境变量 | Free 64/Worker；Paid 128/Worker；单个 5 KB | 配置要收敛，密钥放 secrets。 |
| HTTP request body | 取决于 zone 计划：Free/Pro 100 MB，Business 200 MB，Enterprise 默认 500 MB | 大文件直接走 R2，不要让 Worker 缓冲完整 body。 |
| `waitUntil()` | 响应后最多延长 30 秒 | 只放日志、缓存、短 webhook；长期任务交给 Queues / Workflows。 |

## 架构分工

| 需求 | 放哪里 | 原因 |
| --- | --- | --- |
| 静态页面、前端资源、文档站 | Static Assets | 免费不限量，缓存友好。 |
| 路由、鉴权、轻 API、Webhook | Worker | 请求级逻辑最合适。 |
| 用户、评论、订单、关系数据 | D1 | 不要放全局变量或 KV。 |
| 公开配置、缓存、索引、读多写少数据 | KV | 接受最终一致时才用。 |
| 文件、图片、导出包、大对象 | R2 | Worker 只做权限和元数据。 |
| 房间、协作、强一致单实体状态 | Durable Objects | 普通 Worker 不是状态机。 |
| 邮件、通知、导入、重试 | Queues / Workflows | 请求结束后仍要可靠执行的任务不要靠 `waitUntil()`。 |
| Worker 之间内部调用 | Service Bindings | 不走公网 URL，也不用把内部服务暴露出来。 |

## 入口怎么选

| 入口 | 适合场景 | 注意 |
| --- | --- | --- |
| Static Assets | 前端和文档站 | 匹配静态文件时不调用 Worker。 |
| Custom Domain | Worker 本身就是 origin | Cloudflare 自动建 DNS 和证书；同 zone Worker 可以通过 Custom Domain 被调用。 |
| Route | 在已有源站前加一层 Worker | 需要 Proxied DNS；同 zone route 之间不要靠普通 `fetch()` 互调。 |
| Service Bindings | 内部 Worker-to-Worker 调用 | 适合认证、评论、AI 代理、后台 API 拆分。 |

## 普通项目路线

| 阶段 | 做什么 | 目标 |
| --- | --- | --- |
| 0 | 前端和文档先用 Static Assets | 把免费不限量的静态层吃满。 |
| 1 | 只有 `/api/*`、`/auth/*`、`/admin/*` 进 Worker | 控制动态请求数量。 |
| 2 | 数据按类型进 D1、KV、R2、Durable Objects | 不把 Worker 当数据库。 |
| 3 | 写入口加 Turnstile、Rate Limiting、日志 | 先防滥用，再谈增长。 |
| 4 | 后台和内部工具用 Access 保护 | 不让管理入口裸奔。 |
| 5 | 批处理和重试上 Queues / Workflows | 不用请求生命周期硬撑后台任务。 |
| 6 | 请求、CPU、日志或 DO 进入生产后上 Paid | $5 Paid 要跟真实用量绑定。 |

## 不要这样用

| 误区 | 更好的做法 |
| --- | --- |
| 所有访问都先 `run_worker_first` | 只让真正需要动态逻辑的路径进入 Worker。 |
| 只看请求数，不看 CPU | Workers Paid 同时看请求和 CPU。 |
| 把 KV 当强一致数据库 | 关系数据用 D1，强一致单实体用 Durable Objects。 |
| 上传文件先读成完整 ArrayBuffer | Worker 做入口控制，文件流向 R2。 |
| 把 SSR、搜索、评论、AI、后台任务全塞一个 Worker | 先按路径和数据边界拆，再用 Service Bindings / Queues。 |
| 密钥写进 `vars` 或源码 | 非敏感配置用 `vars`，密钥用 secrets。 |
| 日志记录 token、cookie、正文 | 只记 request id、Ray ID、状态、耗时和匿名化标识。 |

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [cloudflare/workers-sdk](https://github.com/cloudflare/workers-sdk) | Wrangler、Create Cloudflare、Miniflare、Vite plugin。 |
| [cloudflare/workerd](https://github.com/cloudflare/workerd) | Workers runtime 的开源实现。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | 官方 Workers 模板。 |
| [cloudflare/workers-rs](https://github.com/cloudflare/workers-rs) | Rust / WebAssembly Workers 生态。 |
| [cloudflare/workers-oauth-provider](https://github.com/cloudflare/workers-oauth-provider) | Workers 上的 OAuth 2.1 provider 示例。 |

## 事实来源

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [How Workers works](https://developers.cloudflare.com/workers/reference/how-workers-works/)
- [Workers Static Assets billing and limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)
- [Routes](https://developers.cloudflare.com/workers/configuration/routing/routes/)
- [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
