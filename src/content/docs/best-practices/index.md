---
title: 最佳实践
description: Cloudflare 项目的免费额度、安全、成本、数据和部署检查入口。
---

这个页面只做问题分流和上线检查。具体数字看 [免费额度大全](/platform/free-paid/)，具体产品定位看 [产品索引](/platform/)。

## 按问题阅读

| 你要解决的问题 | 先读什么 |
| --- | --- |
| 不知道一个项目能不能 0 元跑起来 | [免费额度大全](/platform/free-paid/) |
| 给个人项目或早期 SaaS 选产品 | [独立开发者推荐栈](/best-practices/indie-stack/) |
| 控制账单和额度风险 | [成本控制](/best-practices/cost/) |
| 给文档站、教程站或开源站选技术栈 | [文档站技术栈](/best-practices/site-stack/) |
| 上线前检查安全边界 | [安全边界](/best-practices/security/) |

## 上线前看这些

| 风险域 | 最小做法 | 对应专题 |
| --- | --- | --- |
| 入口风险 | 网站记录走 Cloudflare，源站不暴露公网，TLS 链路完整。 | [安全边界](/best-practices/security/)、[Fundamentals](/platform/fundamentals/) |
| 静态成本 | 静态资源直接由 Assets / Pages 服务，动态路径明确进入 Worker。 | [成本控制](/best-practices/cost/)、[Workers Static Assets](/platform/static-assets/) |
| 写入滥用 | 登录、评论、表单、上传、搜索、AI 调用设置限流和服务端验证。 | [安全边界](/best-practices/security/)、[WAF](/platform/waf/) |
| 数据性能 | 数据放对位置，常查路径有索引，文件权限和生命周期清楚。 | [数据产品](/platform/data/)、[D1](/platform/d1/)、[R2](/platform/r2/) |
| 密钥泄露 | 生产密钥使用 Secrets，不进仓库、配置、日志和前端包。 | [安全边界](/best-practices/security/) |
| 账单失控 | 先看用量、预算提醒和价格限制，再决定优化或付费。 | [成本控制](/best-practices/cost/)、[账单与预算](/platform/billing/) |
