---
title: AI 产品
description: Cloudflare AI Gateway、Workers AI、AI Search、Vectorize 和 Agents SDK 的普通项目选型、免费边界和成本判断。
---

最后核对日期：2026-06-18。

Cloudflare 的 AI 产品不要按“模型越大越好”来选，而要按项目问题来选：先管住模型入口和成本，再决定是否需要托管搜索、向量库或有状态 Agent。

## 先别急着上 AI

| 你要解决什么 | 先用 | 不急着用 |
| --- | --- | --- |
| 文档站搜索 | Pagefind | AI Search / Vectorize |
| 调用外部模型 | Worker + AI Gateway | 浏览器直连模型 provider |
| 低运维模型推理 | Workers AI | 自建 GPU 服务 |
| 自然语言问答 / 托管 RAG | AI Search | 自己搭 embedding、向量库和抓取管道 |
| 自定义召回、权限过滤、推荐 | Vectorize | 把所有搜索都塞进 AI Search |
| 长期执行、工具调用、可恢复任务 | Agents SDK | 普通聊天 UI |

普通项目的默认路线：**Pagefind 起步；只要调用模型就先接 AI Gateway；需要自然语言搜索再看 AI Search；只有召回、权限和数据管道需要自己控制时再上 Vectorize；只有任务会自主执行时再用 Agents SDK。**

## 产品怎么选

| 产品 | 解决的问题 | 什么时候用 |
| --- | --- | --- |
| AI Gateway | 模型调用入口、日志、缓存、限流、成本观察。 | 任何 LLM / Workers AI / 多 provider 调用开始之前。 |
| Workers AI | 在 Cloudflare 上调用开源模型。 | 需要文本、embedding、语音、图片、分类等推理能力，又不想运维模型服务。 |
| AI Search | 托管 RAG、网站 / R2 / 文件数据源、自然语言搜索。 | 文档和知识库变多，Pagefind 不能满足自然语言问答时。 |
| Vectorize | 向量数据库，自管 embedding、metadata、namespace 和召回。 | 多租户权限、推荐、相似度、异常检测或自定义 RAG 明确时。 |
| Agents SDK | 有状态 Agent runtime。 | 需要工具循环、长期状态、计划任务、实时连接和任务恢复时。 |

## 免费与付费边界

| 产品 | Free / 免费边界 | Workers Paid / 付费边界 | 成本提醒 |
| --- | --- | --- | --- |
| AI Gateway | 所有计划可用；核心能力免费，包含 dashboard analytics、caching、rate limiting；Free 日志为所有 gateway 合计 100,000 logs。 | Paid 为 10,000,000 logs/gateway；Logpush 只在 Workers Paid。 | DLP scanning 免费；Guardrails 会按 Workers AI 计费；Unified Billing 买 credits 有 5% fee。 |
| Workers AI | Free / Paid 都有 10,000 Neurons/day 免费分配。 | 超过每日免费分配需要 Workers Paid，之后按 $0.011 / 1,000 Neurons 计费。 | 不同模型输入、输出、图片、语音成本差异很大，不要只看“调用次数”。 |
| AI Search | 2026-04-16 后新实例 open beta 内免费；Free 有 100 instances/account、100,000 files/instance、20,000 queries/month、500 crawled pages/day。 | Paid 有 5,000 instances/account、unlimited queries、unlimited crawled pages/day。 | Workers AI 和 AI Gateway 用量单独计费；正式计费前官方会提前至少 30 天沟通。 |
| Vectorize | 30M queried vector dimensions/month、5M stored vector dimensions。 | 50M queried vector dimensions/month included、10M stored vector dimensions included，超出按 dimensions 计费。 | 不按 CPU、内存、index hours 或 index 数计费；空 index 不产生 stored dimensions。 |
| Agents SDK | 费用来自 Workers、Durable Objects、Workers AI、AI Gateway、AI Search、Browser Run 等底层产品。 | 请求、CPU、日志、AI、对象状态和浏览器任务可能一起推高成本。 | 不要把普通聊天、总结和搜索包装成 Agent。 |

## 推荐路线

| 阶段 | 推荐组合 | 升级信号 |
| --- | --- | --- |
| 关键词搜索 | Pagefind | 用户开始问自然语言问题，或者关键词搜不到同义表达。 |
| 模型代理 | Worker + AI Gateway + 外部模型 / Workers AI | 需要看成本、缓存、失败率、限流和用户维度。 |
| 文档问答 | AI Search + AI Gateway | 内容量大、需要网站抓取、R2 数据源或托管索引。 |
| 自定义 RAG | Workers + Vectorize + R2 / D1 + AI Gateway | 需要自定义 chunk、metadata、租户隔离、召回和 rerank。 |
| 长期 Agent | Agents SDK + AI Search / Vectorize + AI Gateway | 任务会跨多轮执行、要调用工具、要恢复状态。 |

## 成本控制

| 风险 | 做法 |
| --- | --- |
| 公开入口被刷 | 所有模型请求先经过 Worker 和 AI Gateway，再加身份、限流和 Turnstile。 |
| 输出太长 | 给功能设置最大输出长度，优先短回答、短摘要和小模型。 |
| 日志过多 | Free AI Gateway 日志只有 100,000 total logs；生产要采样，敏感内容不要长期保存。 |
| RAG 成本失控 | 先把内容结构化，只有需要自然语言检索时再做 embedding、rerank 和生成。 |
| 搜索权限混乱 | 私有资料不要直接暴露 public search endpoint；先用 Worker 包鉴权和审计。 |
| Agent 过度设计 | 固定流程用 Workflows，后台任务用 Queues，普通问答用搜索或 Copilot。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 一开始就上 Vectorize。 | 先判断 AI Search 是否已经够用；自定义召回明确后再拆。 |
| 浏览器直接调用模型。 | 通过 Worker + AI Gateway 转发，密钥不进前端。 |
| 只看模型单价。 | 同时看输入、输出、Neurons、缓存、失败重试和日志。 |
| 技术文档只用向量搜索。 | 技术内容经常需要关键词命中；Pagefind 或 hybrid search 很重要。 |
| 把聊天都做成 Agent。 | 只有需要状态、工具、计划任务和恢复执行时才用 Agents SDK。 |
| 以为 AI Search open beta 永久免费。 | 记录日期和 limits，正式计费前重新核对。 |

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [cloudflare/cloudflare-docs AI Gateway source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ai-gateway) | 追踪 AI Gateway pricing、limits、日志、缓存、限流和 DLP。 |
| [cloudflare/cloudflare-docs Workers AI source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/workers-ai) | 追踪 Workers AI pricing、模型和限制。 |
| [cloudflare/cloudflare-docs AI Search source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ai-search) | 追踪 AI Search limits、pricing、数据源和搜索模式。 |
| [cloudflare/cloudflare-docs Vectorize source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/vectorize) | 追踪 Vectorize pricing、limits 和向量检索边界。 |
| [cloudflare/cloudflare-docs Agents source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/agents) | 追踪 Agents SDK 概念、limits 和运行边界。 |
| [cloudflare/ai](https://github.com/cloudflare/ai) | Cloudflare AI packages and examples。 |
| [cloudflare/agents](https://github.com/cloudflare/agents) | Agents SDK monorepo 和示例。 |
| [cloudflare/ai-search-snippet](https://github.com/cloudflare/ai-search-snippet) | AI Search 前端 snippet 参考。 |

## 事实来源

- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- [AI Gateway Limits](https://developers.cloudflare.com/ai-gateway/reference/limits/)
- [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [AI Search Limits & pricing](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)
- [Vectorize Pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)
- [Vectorize Limits](https://developers.cloudflare.com/vectorize/platform/limits/)
- [Agents Limits](https://developers.cloudflare.com/agents/platform/limits/)
- [What are agents?](https://developers.cloudflare.com/agents/concepts/what-are-agents/)
