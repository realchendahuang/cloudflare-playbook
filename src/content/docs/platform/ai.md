---
title: AI 产品
description: 普通项目什么时候用 AI Gateway、Workers AI、AI Search、Vectorize 和 Agents。
---

最后核对日期：2026-06-18。AI 额度、模型价格和 beta 状态变化快，具体数字统一看 [免费额度大全](/platform/free-paid/) 和官方页面。

Cloudflare 的 AI 产品先按“入口、搜索、执行”三件事来选。不要一开始就按产品名堆，也不要把普通问答都包装成 Agent。

## 先判断

| 你要解决什么 | 先用什么 | 先别用什么 |
| --- | --- | --- |
| 文档站关键词搜索 | Pagefind。 | AI Search / Vectorize。 |
| 调用模型并保护密钥 | Worker + AI Gateway。 | 浏览器直连模型 provider。 |
| 低运维模型推理 | Workers AI。 | 自建 GPU 服务。 |
| 自然语言问答和托管 RAG | AI Search。 | 自己先搭 embedding 管道。 |
| 自定义召回、权限过滤、推荐 | Vectorize。 | 把所有搜索都塞进 AI Search。 |
| 长期任务、工具调用、可恢复执行 | Agents。 | 普通聊天 UI。 |

默认路线：**Pagefind 起步；只要调用模型就先进 AI Gateway；自然语言搜索确定有价值后再看 AI Search；只有召回和权限要自己控制时再上 Vectorize；只有任务会自主执行时再用 Agents。**

## 成本先看什么

| 风险 | 做法 |
| --- | --- |
| 公开入口被刷 | 模型请求先过 Worker，再加身份、限流和 Turnstile。 |
| 输出过长 | 给功能设置最大输出长度，优先短回答、短摘要和小模型。 |
| 日志过多 | 日志采样，敏感内容不要长期保存。 |
| RAG 成本失控 | 先整理内容结构，再决定是否做 embedding。 |
| 搜索权限混乱 | 私有资料不要暴露成 public search endpoint。 |
| Agent 过度设计 | 固定流程用 Workflows，后台任务用 Queues，普通问答用搜索。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| 一开始就上 Vectorize。 | 先判断 Pagefind 或 AI Search 是否够用。 |
| 前端直接调用模型。 | 密钥必须留在 Worker 后面。 |
| 只看模型单价。 | 还要看输入、输出、缓存、失败重试和日志。 |
| 技术文档只用向量搜索。 | 技术内容经常需要关键词命中。 |
| 把聊天都做成 Agent。 | 只有需要状态、工具、计划任务和恢复执行时才用。 |
| open beta 就等于长期免费。 | beta 产品上线前要重新核对价格和限制。 |

## 事实来源

- [Cloudflare AI llms.txt](https://developers.cloudflare.com/ai/llms.txt)
- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [AI Search Limits & pricing](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)
- [Vectorize Pricing](https://developers.cloudflare.com/vectorize/platform/pricing/)
- [Agents Limits](https://developers.cloudflare.com/agents/platform/limits/)
