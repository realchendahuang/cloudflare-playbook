---
title: 成本控制
description: Cloudflare 项目中常见成本来源和控制方式。
---

最后核对日期：2026-06-17。

成本控制的核心不是把项目省到不能用，而是知道什么行为触发计费，并在架构、配置和代码里留下边界。

## 先分清账单类型

| 成本类型 | 常见产品 | 判断问题 |
| --- | --- | --- |
| 请求 | Workers、Pages Functions、Durable Objects、Queues、R2 operations | 这次访问有没有打到动态代码、对象存储或队列？ |
| CPU | Workers、Cron、Queue Consumer | 代码是在算东西，还是在等外部 I/O？ |
| 存储 | D1、R2、KV、Durable Objects、Stream、Images | 数据是否应该长期保留，是否可以过期或归档？ |
| 构建 | Workers Builds、Pages Builds | 每次 push 是否都需要完整构建？ |
| 日志 | Workers Logs、Logpush、AI Gateway logs | 日志是否记录了必要上下文，是否需要长期保留？ |
| AI | Workers AI、AI Gateway、Vectorize、AI Search | 模型、上下文、输出长度和缓存命中率是否可观察？ |
| 安全 | WAF、Bot、Access、API Shield、Turnstile | 付费是在买更高配额、更细规则，还是买人工可维护性？ |

## 最小成本路线

```text
静态内容
  └─ Workers Static Assets / Pages
      └─ Pagefind 搜索
          └─ Web Analytics

动态能力
  └─ Workers
      ├─ D1: 关系数据
      ├─ R2: 文件对象
      ├─ KV: 配置和缓存
      └─ Queues: 异步任务

规模化以后
  ├─ AI Gateway / Workers AI / Vectorize
  ├─ Durable Objects
  ├─ Analytics Engine
  └─ WAF / Access / API Shield
```

早期最重要的取舍是：静态内容不要消耗动态请求，用户上传不要进入 Git 或构建产物，AI 和浏览器自动化必须先有用量观察。

## 核心规则

| 规则 | 做法 |
| --- | --- |
| 静态优先 | 文档、官网、前端 bundle 走 Workers Static Assets 或 Pages；只有 `/api/*` 进 Worker。 |
| 数据归位 | 关系数据进 D1，文件进 R2，配置和缓存进 KV，强一致房间状态进 Durable Objects。 |
| 后台异步 | 邮件、通知、导入、转码、爬取、AI 批处理放进 Queues 或 Cron，不要卡住用户请求。 |
| AI 先网关 | 所有模型调用先过 AI Gateway，观察请求数、token、缓存和错误，再决定是否扩大。 |
| 大文件离站点 | 图片原图、附件、导出、视频不要进静态站 bundle；图片进 R2/Images，视频进 Stream。 |
| 限流在边界 | 登录、评论、搜索、上传、Webhook 先做最小限流和 Turnstile，再讨论更复杂安全产品。 |
| 日志克制 | 生产日志记录 request id、路径、状态、耗时和错误类型；不记录密钥、token、邮箱正文。 |

## $5 是否值得付

Workers Paid 的每月 $5 值得付的典型信号：

- Worker 请求接近或超过 100,000/day。
- 单次 CPU 需求明显超过 Free 的 10 ms。
- 需要更多 subrequests、Cron Triggers、Worker 数量或更大的 Worker bundle。
- 需要更高 Workers Logs 额度和留存。
- D1、KV、Queues、Durable Objects 或 Browser Run 已经成为产品能力。
- Workers AI 每天 10,000 Neurons 不够用。

不急着付的典型信号：

- 只是静态文档站、博客或官网。
- 搜索可以用 Pagefind。
- 评论、表单、后台功能还没有真实用户。
- AI 搜索还只是设想，内容规模也不大。

## 观察清单

| 模块 | 先看什么 |
| --- | --- |
| Workers | 请求数、CPU time、错误率、subrequests、bundle size。 |
| D1 | rows read、rows written、慢查询、是否缺索引。 |
| R2 | storage、Class A、Class B、公开下载热点。 |
| KV | reads/writes/list/delete 是否符合读多写少。 |
| Queues | operations、失败重试、Dead Letter Queue。 |
| AI Gateway | 请求数、provider、模型、token、缓存命中、错误。 |
| Workers AI | Neurons/day、模型单价、输入输出长度。 |
| Browser Run | browser hours、并发浏览器、单任务耗时。 |
| Logs | 日志量、保留期、是否能定位错误。 |

## 本站当前做法

本站当前选择是“尽量把运行成本固定在免费边界内”：

| 能力 | 当前选择 | 成本含义 |
| --- | --- | --- |
| 文档页面 | Astro + Starlight + Workers Static Assets | 静态资产请求免费且不限量。 |
| 搜索 | Pagefind | 构建期生成索引，搜索不打后端。 |
| 评论 | Twikoo + Workers + D1 | 只有评论相关请求进入 Worker 和 D1。 |
| 主题 | Starlight Theme Next | 复用成熟主题，减少自维护 UI 成本。 |
| 未来 AI 搜索 | AI Gateway + AI Search 或 Vectorize | 内容规模足够后再引入。 |

## 事实来源

- [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)
- [D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Queues Pricing](https://developers.cloudflare.com/queues/platform/pricing/)
- [AI Gateway Pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/)
- [Workers AI Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Browser Run Pricing](https://developers.cloudflare.com/browser-run/pricing/)
