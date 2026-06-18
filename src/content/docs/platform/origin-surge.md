---
title: 源站保护与流量洪峰
description: 源站保护、合法峰值和回源压力的取舍。
---

最后核对日期：2026-06-18。

源站快被打满时，先判断流量类型：**恶意流量先做 DDoS、WAF、自动化流量防护和限流；合法峰值才看排队；回源请求和连接压力才看回源优化；WordPress 动态 HTML 慢才看 APO。**

## 免费阶段先做什么

| 问题 | 先做 |
| --- | --- |
| 源站暴露公网，被直接扫或攻击。 | 网站记录开启代理，源站防火墙只放 Cloudflare 回源，再补 WAF、DDoS、限流、Turnstile。 |
| 静态站、文档站、官网流量变大。 | 静态资产交给 CDN、静态资产层或 Pages。 |
| 接口、评论、表单偶尔有峰值。 | 缓存、限流、Turnstile、队列和 D1 / KV，把写入和慢任务拆开。 |
| 缓存命中低，源站连接数高。 | 先修缓存响应头、缓存规则、版本化文件名、HTML 缓存边界。 |
| WordPress 首字节慢。 | 先确认主题、插件、PHP / MySQL 和页面缓存。 |

## 一句话判断

| 需求 | 优先看什么 | 不要误用什么 |
| --- | --- | --- |
| 静态站、文档站、官网。 | 缓存 / CDN、静态资产层、Pages。 | 不需要排队，也不需要 APO。 |
| 秒杀、报名、抢票、发售等合法用户峰值。 | Waiting Room。 | 不要把 Waiting Room 当 DDoS 防护。 |
| 恶意请求、自动化提交、撞库、爬虫滥用。 | DDoS、WAF、自动化流量防护、限流、Turnstile。 | 不要先上排队。 |
| 源站回源请求多、连接数高。 | Smart Shield。 | 不要在缓存策略混乱时先买高级包。 |
| 全球用户离源站远，动态回源慢。 | Argo / Smart Shield + Argo。 | 先确认瓶颈是回源路径。 |
| WordPress 动态 HTML 慢。 | Automatic Platform Optimization。 | APO 不是通用动态站缓存。 |

## 产品边界

| 产品 | 实践判断 |
| --- | --- |
| Waiting Room | 管合法用户排队，不管恶意攻击。只放最容易被打满的入口。 |
| Smart Shield | 减少回源请求和源站连接，前提是缓存策略已经整理过。 |
| Argo Smart Routing | 优化回源路径，不解决应用逻辑、数据库慢查询和缓存缺失。 |
| APO | WordPress 专用，依赖 WordPress 插件和 WordPress 缓存语义。 |
| 专用回源 IP | 企业源站防火墙治理问题，先隐藏源站 IP。 |

官方核对入口：[Waiting Room](https://developers.cloudflare.com/waiting-room/)、[Smart Shield](https://developers.cloudflare.com/smart-shield/) 和 [Automatic Platform Optimization](https://developers.cloudflare.com/automatic-platform-optimization/)。
