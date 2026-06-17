---
title: AI 产品
description: Cloudflare AI Gateway、Workers AI、AI Search、Vectorize 和 Agents SDK 的定位、免费额度、组合方式和开源参考。
---

最后核对日期：2026-06-17。

Cloudflare 的 AI 产品不要按“模型越大越好”来理解，而要按链路拆开：请求从哪里进、模型在哪里跑、知识库怎么检索、状态存在哪里、成本和日志怎么观察。

```text
用户请求
  └─ Worker / Pages Function
      ├─ AI Gateway: 观测、缓存、限流、fallback、日志、成本
      ├─ Workers AI: Cloudflare 上的模型推理
      ├─ AI Search: 托管 RAG / 文档搜索 / Agent 检索工具
      ├─ Vectorize: 自己控制 embedding、索引、metadata 和召回
      └─ Agents SDK: 有状态 Agent、工具、WebSocket、计划任务、持久记忆
```

## 一句话判断

普通项目的 AI 最佳实践是：**先用 AI Gateway 管住请求和成本；文档搜索先用 Pagefind，内容规模上来后优先 AI Search；只有需要自定义召回和数据管道时再上 Vectorize；只有真正需要长期状态、工具循环和主动执行时再上 Agents SDK。**

## 产品定位

| 产品 | 解决的问题 | 普通项目什么时候用 |
| --- | --- | --- |
| AI Gateway | 把外部模型、Workers AI 和多 provider 调用统一到一个可观测入口。 | 只要项目开始调用 LLM，就先接它。 |
| Workers AI | 在 Cloudflare 上调用开源模型，按 Neurons 计费。 | 需要低运维模型推理、embedding、语音、图片、分类等能力。 |
| AI Search | 托管 RAG：数据源、切块、embedding、向量索引、关键词/混合搜索、MCP 和 UI snippet。 | 文档站、知识库、Agent 记忆和多租户搜索。 |
| Vectorize | Cloudflare 向量数据库，自己管理 embedding、metadata、namespace 和查询。 | 需要自定义 RAG、推荐、相似度、分类或异常检测。 |
| Agents SDK | 基于 Durable Objects 的有状态 Agent runtime。 | 需要持久会话、工具调用、WebSocket、计划任务、长流程恢复。 |

## 推荐顺序

| 阶段 | 推荐组合 | 为什么 |
| --- | --- | --- |
| 只是想接模型 | Worker + AI Gateway + 外部模型或 Workers AI | 先把日志、token、错误、缓存和限流看清楚。 |
| 文档站搜索 | Pagefind 起步；内容多后 AI Search | Pagefind 免费、静态；AI Search 适合自然语言和 Agent 检索。 |
| 托管 RAG | AI Search + AI Gateway + Workers AI / 外部模型 | 少维护切块、索引、向量库和网页抓取。 |
| 自定义 RAG | Workers + Vectorize + R2/D1 + AI Gateway | 自己控制 embedding、metadata、namespace、召回和重排。 |
| 有状态 Agent | Agents SDK + AI Search / Vectorize + AI Gateway + Workers AI | Agent 需要状态、工具、计划任务和可恢复执行。 |

## 免费与付费边界

| 产品 | Free / 免费边界 | Workers Paid / 付费边界 | 成本提醒 |
| --- | --- | --- | --- |
| AI Gateway | 所有计划可用；核心能力免费，包括 dashboard analytics、caching、rate limiting。Persistent logs 为 100,000 total logs across all gateways；Free 计划 10 gateways/account。 | Persistent logs 为 10,000,000 logs/gateway；Paid 计划 20 gateways/account；Logpush 仅 Workers Paid，10M requests/month included，超出 $0.05/million。 | Guardrails 使用 Workers AI 的 Llama Guard，按 Workers AI 计费；Unified Billing 购买 credits 有 5% fee。 |
| Workers AI | Free / Paid 都有 10,000 Neurons/day 免费分配。 | 超过每日 10,000 Neurons 需要 Workers Paid，并按 $0.011 / 1,000 Neurons 计费。 | 价格页现在也展示 token 等价价格；不同模型输入/输出成本差异很大。 |
| AI Search | Available on all plans。2026-04-16 后创建的新实例 open beta 内免费；Free 有 100 instances/account、100,000 files/instance、4 MB/file、20,000 queries/month、500 crawled pages/day、5 metadata fields。 | Paid 有 5,000 instances/account、1M files/instance 或 hybrid search 500K、unlimited queries、unlimited crawled pages/day、4 MB/file、5 metadata fields。 | Workers AI 和 AI Gateway usage 单独计费；官方说明正式计费前至少提前 30 天沟通。 |
| Vectorize | 30M queried vector dimensions/month，5M stored vector dimensions。 | 50M queried vector dimensions/month included，超出 $0.01/million；10M stored vector dimensions included，超出 $0.05/100M。 | 不按 CPU、内存、index hours 或 index 数计费；空 index 不产生 stored dimensions。 |
| Agents SDK | 成本继承 Workers、Durable Objects、Workers AI、AI Gateway、AI Search、Browser Run 等底层产品。 | 高并发、更多脚本、更多日志和 AI 用量通常会推向 Workers Paid 和相关按量产品。 | 每个 Agent 有独立状态和生命周期，别把普通聊天 UI 过早升级成 Agent。 |

## AI Gateway

AI Gateway 的价值不是“换一个模型 URL”，而是把 AI 调用变成可治理的入口。

| 能力 | 用法 |
| --- | --- |
| Analytics | 看请求数、token、成本、缓存命中和错误。 |
| Logging | 保存 prompt、response、错误和自定义 metadata，便于排查和评估。 |
| Caching | 对重复请求命中 Cloudflare cache；cacheable request size 为 25 MB，cache TTL 上限为 1 month。 |
| Rate limiting | 限制用户、团队、路径或 provider 的请求节奏。 |
| Dynamic routing / fallback | Provider 失败或配额不足时切到备用模型。 |
| DLP | 对 prompt / response 做敏感数据扫描；没有 Zero Trust 订阅时也有两个预定义 profile。 |
| Guardrails | 检查有害内容，但会产生 Workers AI 用量。 |
| Custom metadata | 每个请求最多 5 entries，适合写入 user、team、feature、environment。 |

普通项目默认把所有模型调用都从 Worker 经过 AI Gateway，不要从浏览器直接带 provider key 调模型。

## Workers AI

Workers AI 适合“不想自己管 GPU、模型服务、伸缩和空闲成本”的项目。它能从 Workers、Pages 或 REST API 调用模型，官方说明有 50+ 开源模型，覆盖文本生成、embedding、语音、图片、分类、翻译等任务。

| 任务类型 | 官方默认速率限制 |
| --- | ---: |
| Text generation | 300 requests/minute |
| Text embeddings | 3,000 requests/minute |
| Summarization | 1,500 requests/minute |
| Text classification | 2,000 requests/minute |
| Automatic speech recognition | 720 requests/minute |
| Text-to-image | 720 requests/minute |

这些是默认限制，部分模型有单独限制；Wrangler 本地模式里的 model inference 也会计入这些限制。上线前要按具体模型页再核对。

## AI Search

AI Search 是托管 RAG，不只是“向量库”。新实例包含 managed storage、built-in vector index 和 web crawling。它可以从网站、R2 bucket 或直接上传文件建立索引，再通过 REST API、Workers binding、public endpoint、MCP endpoint 或 UI snippets 查询。

| 搜索模式 | 适合 |
| --- | --- |
| Vector search | 用户说法和文档措辞不完全一样，需要语义召回。 |
| Keyword search | 需要精确命中错误码、命令、API 字段、配置名。 |
| Hybrid search | 文档站、技术知识库、排障场景；同时保留语义和精确匹配。 |

本站当前内容量还不大，Pagefind 是更省的第一选择。等 Cloudflare 文档整理到 P1/P2 大量专题后，再把 Markdown、官方链接、GitHub 源仓和本站内容接进 AI Search，做自然语言问答和 Agent 检索。

## Vectorize

Vectorize 是自己搭 RAG 或相似度系统时的向量层。它不保存你的完整文档语义结构，通常只保存向量、id、metadata 和 namespace；原文仍应放在 R2、D1、KV 或 Git 内容仓库里。

| 限制 | 当前值 |
| --- | ---: |
| Indexes/account | Free 100；Workers Paid 50,000 |
| Max dimensions/vector | 1,536 |
| Max vectors/index | 10,000,000 |
| Namespaces/index | Free 1,000；Workers Paid 50,000 |
| Metadata/vector | 10 KiB |
| Max metadata indexes/index | 10 |
| Max topK with values or metadata | 50 |
| Max topK without values and metadata | 100 |
| Upsert batch size | Workers 1,000；HTTP API 5,000 |

Vectorize 适合你要自己控制这些问题的时候：

- embedding 模型怎么选。
- chunk 怎么切。
- metadata 怎么设计。
- 多租户用 namespace 还是 metadata filter。
- 召回后怎么 rerank。
- 原文和权限怎么回查。

不需要这些控制权时，AI Search 更省维护。

## Agents SDK

Agents SDK 是有状态 Agent runtime，不是普通聊天组件。它把 Agent 映射到 Durable Objects，让每个 Agent session 有 durable identity、local SQL storage、real-time connection、scheduled work 和 recoverable execution。

| 能力 | 判断 |
| --- | --- |
| Persistent state | 需要记住任务进度、用户偏好、会话上下文。 |
| WebSocket / realtime | 需要状态变化实时推送给前端。 |
| Scheduled tasks | Agent 要在未来时间继续执行。 |
| Tools / MCP | Agent 要调用外部系统、浏览器、沙箱、AI Search、支付等工具。 |
| Durable execution | 任务会跨越多轮请求，不能因单次 HTTP 结束而丢失。 |

官方限制里最重要的几条：每个 Agent 最多 1 GB state；每次 HTTP 请求、WebSocket message 或 scheduled task 会刷新 30 秒 compute time；单个 step 的 wall-clock duration 可以等待外部数据库或 LLM response。Agents 能支撑大量实例，但普通项目不要因为“听起来高级”就把可预测的 CRUD、搜索、总结任务都写成 Agent。

## 本站后续搜索路线

| 阶段 | 技术栈 | 触发条件 |
| --- | --- | --- |
| 现在 | Pagefind | Markdown 规模小，关键词搜索足够。 |
| 文档明显变多 | AI Search + website / R2 data source | 需要自然语言搜索、混合检索、MCP endpoint 或站内问答。 |
| 需要自定义召回 | Vectorize + R2/D1 + Workers AI embedding | 要控制 chunk、metadata、namespace、rerank 和权限过滤。 |
| 需要知识库 Agent | Agents SDK + AI Search / Vectorize + AI Gateway | Agent 要长期记忆、工具调用、任务恢复和多轮执行。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 一开始就上 Vectorize。 | 先判断 AI Search 是否已经覆盖托管 RAG；自定义需求明确后再拆出来。 |
| 浏览器直接调用模型 provider。 | 通过 Worker + AI Gateway 转发，密钥不进前端。 |
| 只看模型单价，不看输出长度。 | 观察 input/output tokens、Neurons、缓存命中和失败重试。 |
| 技术文档只用向量搜索。 | 技术内容要考虑 hybrid search，错误码和配置字段需要关键词命中。 |
| 把所有聊天都做成 Agent。 | 只有需要状态、工具、计划任务、恢复执行时才用 Agents SDK。 |
| 开启日志后不管隐私。 | AI Gateway logs 要控制保存内容，敏感数据配合 DLP、metadata 和日志策略。 |
| 以为 AI Search open beta 永久免费。 | 记录官方日期和 limits；正式计费前再核对 pricing。 |

## GitHub 开源参考

| 仓库 | 值得参考的点 |
| --- | --- |
| [cloudflare/cloudflare-docs AI Gateway source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ai-gateway) | AI Gateway 官方文档源文件，适合追踪 pricing、limits、provider、fallback 和 observability。 |
| [cloudflare/cloudflare-docs Workers AI source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workers-ai) | Workers AI 模型、pricing、limits、binding、batch、function calling 和教程源文件。 |
| [cloudflare/cloudflare-docs AI Search source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ai-search) | AI Search 托管 RAG、search modes、limits/pricing、MCP 和 UI snippets 源文件。 |
| [cloudflare/cloudflare-docs Vectorize source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/vectorize) | Vectorize pricing、limits、metadata filtering、Wrangler commands 和 API 源文件。 |
| [cloudflare/cloudflare-docs Agents source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/agents) | Agents SDK、MCP、tools、runtime、limits 和 examples 官方源文件。 |
| [cloudflare/ai](https://github.com/cloudflare/ai) | Cloudflare AI packages and examples，包含 Workers AI provider、AI Gateway adapter 和示例。 |
| [cloudflare/agents](https://github.com/cloudflare/agents) | Agents SDK monorepo，适合看 runtime、examples、packages 和 release。 |
| [cloudflare/agents-starter](https://github.com/cloudflare/agents-starter) | 官方 Agent starter，使用 Workers AI，不需要 provider API key。 |
| [cloudflare/ai-search-snippet](https://github.com/cloudflare/ai-search-snippet) | AI Search 的前端 snippet 组件，适合后续把托管搜索嵌入文档站。 |
| [cloudflare/skills](https://github.com/cloudflare/skills) | Cloudflare 官方 Agent Skills，适合给 Codex 注入 Workers AI、Vectorize、Agents SDK 等平台判断。 |
| [cloudflare/mcp](https://github.com/cloudflare/mcp) | Cloudflare Code Mode MCP，覆盖 AI Gateway、Vectorize、Workers 等 API。 |

## 官方资料

- [AI Gateway](https://developers.cloudflare.com/ai-gateway/)
- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- [AI Gateway Limits](https://developers.cloudflare.com/ai-gateway/reference/limits/)
- [Workers AI](https://developers.cloudflare.com/workers-ai/)
- [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Workers AI Limits](https://developers.cloudflare.com/workers-ai/platform/limits/)
- [AI Search](https://developers.cloudflare.com/ai-search/)
- [AI Search Limits & pricing](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)
- [AI Search search modes](https://developers.cloudflare.com/ai-search/concepts/search-modes/)
- [Vectorize](https://developers.cloudflare.com/vectorize/)
- [Vectorize Pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)
- [Vectorize Limits](https://developers.cloudflare.com/vectorize/platform/limits/)
- [Agents](https://developers.cloudflare.com/agents/)
- [Agents Limits](https://developers.cloudflare.com/agents/platform/limits/)
- [What are agents?](https://developers.cloudflare.com/agents/concepts/what-are-agents/)
