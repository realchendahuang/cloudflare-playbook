---
title: AI 产品
description: Workers AI、AI Gateway、Vectorize 和 Agents SDK 的选择方式。
---

# AI 产品

Cloudflare 的 AI 产品可以先按“推理、检索、网关、状态”来理解。

## 产品定位

| 产品 | 解决的问题 |
| --- | --- |
| Workers AI | 在 Cloudflare 上运行模型推理 |
| AI Gateway | 统一管理 AI 请求、缓存、观测和成本 |
| Vectorize | 存储向量并做语义检索 |
| Agents SDK | 构建有状态 AI Agent |

## 普通项目的推荐顺序

1. 只是调用外部模型：先看 AI Gateway，获得日志、缓存和成本控制。
2. 要做 RAG：再加入 Vectorize。
3. 要在边缘直接跑模型：看 Workers AI。
4. 要做长期状态和工具编排：再看 Agents SDK。

## 风险提醒

AI 相关内容变化快，模型、价格、限制和 SDK API 都必须以官方文档为准。
