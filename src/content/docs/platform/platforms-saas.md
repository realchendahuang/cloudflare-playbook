---
title: 平台化与多租户
description: 什么时候才需要客户域名、客户代码和平台化能力。
---

平台化解决的不是“用户很多”，而是“客户把自己的域名、代码或运行环境交给你管理”。早期 SaaS 先做好数据隔离、权限、账单、日志和限流。

## 先判断

| 你要做什么 | 先用什么 | 先别上什么 |
| --- | --- | --- |
| 文档站、官网、后台 | Workers / Static Assets / D1 / R2 / Access。 | Cloudflare for Platforms。 |
| 多租户业务数据 | 租户模型、资源隔离、权限和审计。 | 因为“客户多”就运行客户代码。 |
| 客户绑定自己的域名 | Cloudflare for SaaS / Custom Hostnames。 | 给每个客户手工建 zone。 |
| 客户长期部署自己的代码 | Workers for Platforms。 | 给每个客户手工维护一个独立 Worker。 |
| 需要短期执行不可信代码 | Dynamic Workers 或 Sandbox 相关能力。 | 把不可信代码放进主 Worker。 |

## 简单判断

平台化前先确认三件事：客户是否真的需要自己的域名，客户是否要上传或运行自己的代码，你是否已经能管理验证、证书、下线、租户限额、滥用处理和计费边界。只要这些还不清楚，就先用普通 Workers、D1、R2、KV 和 Access 做 SaaS。

## 推荐路线

| 阶段 | 做法 |
| --- | --- |
| 早期 SaaS | 先用普通 Workers、D1、R2、KV 和 Access，把租户模型做清楚。 |
| 客户域名成为核心卖点 | 做 Custom Hostname onboarding、验证、证书状态和清理后台。 |
| 客户代码成为产品能力 | 再看 Workers for Platforms，先设计隔离、limits、日志和出站控制。 |
| 不可信代码执行成为核心流程 | 把稳定标识、最小权限、预算和审计作为第一版需求。 |
