---
title: 账单与预算
description: Cloudflare 账单、免费额度、Workers Paid、按量计费和预算提醒的判断。
---

这页只解决最常见的账单判断：哪些能免费跑，5 美元/月的 Workers Paid 买到什么，哪些付费和 Workers Paid 没关系，什么时候要看用量。

## 先记住

| 判断 | 结论 |
| --- | --- |
| Workers Paid 是不是 Cloudflare Pro？ | 不是。Workers Paid 是账号级开发者平台订阅；Pro / Business 是单个域名的站点计划。 |
| 静态站一定要付费吗？ | 不一定。Workers Static Assets / Pages 的静态资产请求免费且不限量，只有动态请求才进入 Workers 计费口径。 |
| 预算提醒会不会自动封顶？ | 不会。它只发邮件提醒，不能暂停 Worker、R2、Images、Stream 或其他按量产品。 |
| 可计费用量是不是完整账单？ | 不是。它主要看按量超额费用，不覆盖固定订阅和大部分计划费用。 |
| R2 出站带宽免费是不是完全免费？ | 不是。R2 不收出站带宽费，但存储量、写入类操作和读取类操作仍要看。 |

## 四类费用

| 类型 | 常见产品 | 怎么判断 |
| --- | --- | --- |
| 域名计划 | Free、Pro、Business、Enterprise | 影响单个域名的 WAF、缓存、规则、证书和安全能力。 |
| Workers Paid | Workers、Pages 动态函数、KV、D1、Queues、Durable Objects、Logs 等 | 每账号最低 5 美元/月，主要买动态请求、CPU、日志和开发者平台额度。 |
| 单独付费能力 | Load Balancing、Argo、Images Paid、Stream、日志查询等 | 不要看到开关就买；先确认固定费、按量费和是否真的需要。 |
| 按量计费 | Workers 超额用量、R2 操作、Images、Stream、Vectorize、Analytics Engine 等 | 付费前先开预算提醒，再做限流、缓存和配额。 |

## Workers Paid 放在哪里

Workers Paid 值得付费的信号很具体：

| 信号 | 为什么 |
| --- | --- |
| Worker 请求接近 100,000 次/天。 | Free 是日额度；Paid 变成月度额度，并允许继续按量扩展。 |
| CPU 经常超过 10 ms。 | 服务端渲染、AI 前处理、批量解析和复杂代理会先撞 CPU。 |
| Workers Logs 3 天留存不够。 | Paid 的日志额度和留存更适合生产排障。 |
| D1、KV、Queues、Durable Objects 已经成为核心路径。 | 这些产品在 Paid 下会进入更高额度或更完整能力。 |
| 需要更多定时任务、Worker 数量、外部调用或更大构建包。 | 这是开发者平台工程化能力，不是域名计划能力。 |

Workers Paid 不会提升 WAF、Bot、缓存规则、SSL/TLS、DNS 记录数、负载均衡或企业网络能力。

## 付费前检查

| 要开的能力 | 先问什么 |
| --- | --- |
| Workers Paid | 动态请求和 CPU 是否真实撞线，还是静态资源误进 Worker？ |
| R2 | 免费的每月 10 GB 标准存储、100 万次写入类操作、1000 万次读取类操作是否够用？热点下载有没有缓存？ |
| Images / Stream | 图片转换、图片交付、视频存储和播放分钟数是否估过？ |
| Load Balancing / Argo | 现在的问题是可用性、路由还是源站性能？有没有更简单的缓存和回源优化？ |
| 日志查询 / 日志推送 | 是真的需要长期审计，还是 Workers Logs 已经够排障？ |
| Pro / Business | 需要的是域名计划能力，还是开发者平台能力？不要把 Pro 和 Workers Paid 混在一起买。 |

## 账单怎么盯

最低做法：启用付费前开预算提醒；每周看一次可计费用量；每个账期看发票。异常增长先回到架构里找动态请求、CPU、R2 操作、媒体播放和 AI 调用。迁走流量、删除 DNS 或停止使用某个功能，不等于取消订阅；固定订阅仍要到账单订阅页里处理。

## 常见误区

| 误区 | 更准确的说法 |
| --- | --- |
| 免费额度够大，所以不用看账单。 | 免费额度不是无限额度，公开项目要知道最先撞哪条线。 |
| Workers Paid 可以解决所有 Cloudflare 配额。 | 它只覆盖开发者平台，不覆盖域名计划、单独付费能力、企业能力和媒体产品。 |
| 预算提醒会保护我不超支。 | 它只是提醒；真正的保护是静态优先、限流、队列、配额和权限。 |
| 所有请求都进 Worker 方便统计。 | 静态资产应该直接命中 Assets / Pages，动态路径才进 Worker。 |
| R2 / Images / Stream 只看流量。 | 它们还要看存储、操作、转换、播放分钟数或交付次数。 |
