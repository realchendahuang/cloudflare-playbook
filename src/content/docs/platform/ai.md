---
title: AI 能力
description: AI Gateway、Workers AI、AI Search、Vectorize 和 Agents 该怎么选。
---

## 先判断

| 你要解决什么 | 先用什么 | 边界 |
| --- | --- | --- |
| 文档站关键词搜索 | Pagefind。 | AI Search / Vectorize。 |
| 调用模型并保护密钥 | Worker + AI Gateway。 | 浏览器直连模型供应商。 |
| 低运维模型推理 | Workers AI。 | 自建 GPU 服务。 |
| 自然语言问答和托管检索 | AI Search。 | 自己先搭内容向量管道。 |
| 自定义召回、权限过滤、推荐 | Vectorize。 | 把所有搜索都塞进 AI Search。 |
| 长期任务、工具调用、可恢复执行 | Agents。 | 普通聊天 UI。 |

## 成本先看什么

| 风险 | 做法 |
| --- | --- |
| 公开入口被刷 | 模型请求先过 Worker，再加身份、限流和 Turnstile。 |
| 输出过长 | 给功能设置最大输出长度，优先短回答、短摘要和小模型。 |
| 日志过多 | 日志采样，敏感内容只保留必要字段。 |
| 自然语言搜索成本失控 | 先整理内容结构，再决定是否做向量检索。 |
| 搜索权限混乱 | 私有资料走权限过滤和访问控制。 |
| 自动化工具做重了 | 固定流程用 Workflows，后台任务用 Queues，普通问答用搜索。 |
