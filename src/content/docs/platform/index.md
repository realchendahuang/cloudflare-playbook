---
title: 产品地图
description: Cloudflare 主要产品的功能分层和选择方式。
---

# 产品地图

Cloudflare 可以先按“计算、数据、网络、安全、AI、可观测性、部署”来理解。

## 一张简化地图

```text
用户请求
  │
  ├─ DNS / CDN / WAF / DDoS
  │
  ├─ Pages / Workers
  │    ├─ D1 / KV / R2 / Durable Objects / Queues
  │    ├─ Workers AI / AI Gateway / Vectorize
  │    └─ Logs / Analytics / Tail Workers
  │
  └─ 源站、第三方 API、数据库或内部服务
```

## 按问题选产品

| 你要解决的问题 | 优先看 |
| --- | --- |
| 部署纯静态站、前端应用、文档站 | Pages |
| 部署静态站并带少量 API | Workers Static Assets |
| 写边缘 API、代理、Webhook、鉴权 | Workers |
| 存关系型数据 | D1 |
| 存配置、缓存、低频更新数据 | KV |
| 存文件、图片、备份、导出物 | R2 |
| 做房间、协作、强一致对象状态 | Durable Objects |
| 做异步任务、削峰、后台处理 | Queues |
| 做普通文档搜索 | Pagefind |
| 做自然语言知识库搜索 | AI Search |
| 做推理、向量检索、AI 入口控制 | Workers AI、Vectorize、AI Gateway |

## 这个仓库的示范栈

本站自己就是一个 Cloudflare 最佳实践案例：

```text
Astro + Starlight
  ├─ Pagefind 搜索
  └─ 静态资产 dist

Cloudflare Worker
  ├─ Workers Static Assets
  └─ /api/comments

Cloudflare D1
  └─ 评论数据
```

具体取舍见 [本站技术栈](/best-practices/site-stack/)。

## 本节怎么扩展

产品页先写“什么时候用”，再写“最小配置”，最后写“常见误区”。具体代码放到 [实战案例](/recipes/) 里，避免产品页变得太散。
