---
title: 平台化与多租户
---

## 先判断

| 场景 | 先用什么 |
| --- | --- |
| 文档站、官网、后台 | Workers / Static Assets / D1 / R2 / Access。 |
| 多租户业务数据 | 租户模型、资源隔离、权限和审计。 |
| 客户绑定自己的域名 | Cloudflare for SaaS / Custom Hostnames。 |
| 客户长期部署自己的代码 | Workers for Platforms。 |
| 需要短期执行不可信代码 | Dynamic Workers 或 Sandbox 相关能力。 |

## 先问清楚

核心信号是客户域名、客户代码、租户限额、下线流程、滥用处理和计费模型。

## 推荐路线

| 阶段 | 做法 |
| --- | --- |
| 早期 SaaS | 先用普通 Workers、D1、R2、KV 和 Access，把租户模型做清楚。 |
| 客户域名成为主要卖点 | 做 Custom Hostname onboarding、验证、证书状态和清理后台。 |
| 客户代码成为产品功能 | 评估 Workers for Platforms，并设计隔离、限额、日志和出站控制。 |
| 不可信代码执行成为主要流程 | 把稳定标识、最小权限、预算和审计作为第一版设计。 |
