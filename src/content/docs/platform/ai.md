---
title: AI 产品
description: Cloudflare AI Gateway、Workers AI、AI Search、Vectorize 和 Agents 的普通项目选型、免费边界和成本判断。
---

最后核对日期：2026-06-18。

Cloudflare 的 AI 产品不要按“模型越大越好”来选。普通项目先管住模型入口、密钥和成本，再决定是否需要托管搜索、向量库或有状态 Agent。

## 先判断

| 你要解决什么 | 先用 | 不急着用 |
| --- | --- | --- |
| 文档站搜索 | Pagefind | AI Search / Vectorize |
| 调用外部模型 | Worker + AI Gateway | 浏览器直连模型 provider |
| 低运维模型推理 | Workers AI | 自建 GPU 服务 |
| 自然语言问答 / 托管 RAG | AI Search | 自己搭 embedding 和向量库 |
| 自定义召回、权限过滤、推荐 | Vectorize | 把所有搜索都塞进 AI Search |
| 长期执行、工具调用、可恢复任务 | Agents | 普通聊天 UI |

默认路线：**Pagefind 起步；只要调用模型就先接 AI Gateway；自然语言搜索明确有价值再看 AI Search；只有召回和权限需要自己控制时再上 Vectorize；只有任务会自主执行时再用 Agents。**

## 产品边界

| 产品 | 解决什么 | 什么时候用 |
| --- | --- | --- |
| AI Gateway | 模型调用入口、日志、缓存、限流、成本观察。 | 任何 LLM / Workers AI / 多 provider 调用之前。 |
| Workers AI | 在 Cloudflare 上调用模型。 | 需要推理能力，又不想运维模型服务。 |
| AI Search | 托管 RAG、网站 / R2 / 文件数据源、自然语言搜索。 | 文档和知识库变多，Pagefind 不够时。 |
| Vectorize | 向量数据库，自管 embedding、metadata、namespace 和召回。 | 多租户权限、推荐、相似度、自定义 RAG 明确时。 |
| Agents | 有状态任务运行能力。 | 需要工具循环、长期状态、计划任务和恢复执行时。 |

## 免费与付费边界

| 产品 | Free / 免费边界 | Workers Paid / 付费边界 | 成本提醒 |
| --- | --- | --- | --- |
| AI Gateway | 核心能力免费；Free persistent logs 为所有 gateway 合计 100,000 logs。 | Paid 为 10M logs/gateway；Logpush 需要 Workers Paid。 | 日志不是越多越好，敏感内容要采样和脱敏。 |
| Workers AI | Free / Paid 都有 10,000 Neurons/day 免费分配。 | 超过每日免费分配需要 Workers Paid，再按 Neurons 计费。 | 不同模型成本差异很大，不要只看调用次数。 |
| AI Search | 新实例 open beta 内免费；Free 有 queries、files、instances 和 crawled pages 边界。 | Paid 提升查询、实例、文件和爬取边界。 | Workers AI 和 AI Gateway 用量另算。 |
| Vectorize | 有 queried / stored vector dimensions 免费包。 | Paid 提升 dimensions included usage，超出按量。 | 文档没整理好之前，上向量库只会放大混乱。 |
| Agents | 费用来自 Workers、DO、AI、Gateway、Browser Run 等底层产品。 | 多个底层产品会叠加成本。 | 不要把普通聊天、总结和搜索包装成 Agent。 |

## 成本控制

| 风险 | 做法 |
| --- | --- |
| 公开入口被刷 | 所有模型请求先经过 Worker 和 AI Gateway，再加身份、限流和 Turnstile。 |
| 输出太长 | 给功能设置最大输出长度，优先短回答、短摘要和小模型。 |
| 日志过多 | 生产日志采样，敏感内容不要长期保存。 |
| RAG 成本失控 | 先把内容结构化，只有自然语言检索真的有价值时再做 embedding。 |
| 搜索权限混乱 | 私有资料不要直接暴露 public search endpoint。 |
| Agent 过度设计 | 固定流程用 Workflows，后台任务用 Queues，普通问答用搜索。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 一开始就上 Vectorize。 | 先判断 AI Search 或 Pagefind 是否够用。 |
| 浏览器直接调用模型。 | 通过 Worker + AI Gateway 转发，密钥不进前端。 |
| 只看模型单价。 | 同时看输入、输出、Neurons、缓存、失败重试和日志。 |
| 技术文档只用向量搜索。 | 技术内容经常需要关键词命中。 |
| 把聊天都做成 Agent。 | 只有需要状态、工具、计划任务和恢复执行时才用 Agents。 |
| 以为 AI Search open beta 永久免费。 | 记录日期和 limits，正式计费前重新核对。 |

## 事实来源

- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- [AI Gateway Limits](https://developers.cloudflare.com/ai-gateway/reference/limits/)
- [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [AI Search Limits & pricing](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)
- [Vectorize Pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)
- [Vectorize Limits](https://developers.cloudflare.com/vectorize/platform/limits/)
- [Agents Limits](https://developers.cloudflare.com/agents/platform/limits/)
