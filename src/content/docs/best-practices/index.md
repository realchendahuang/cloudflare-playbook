---
title: 最佳实践
---

## 按需求阅读

评估免费阶段能不能跑起来，先看 [免费额度大全](/platform/free-paid/)。给个人项目或早期 SaaS 选能力搭配，先看 [独立开发者推荐栈](/best-practices/indie-stack/)。控制账单和额度风险，看 [成本控制](/best-practices/cost/)。

文档站、教程站或开源站的技术栈，直接看 [文档站技术栈](/best-practices/site-stack/)。想参考开源项目怎么落地，看 [实战案例](/recipes/)。上线前处理入口安全，看 [上线安全](/best-practices/security/)。

## 上线前看这些

- 入口风险：网站记录走 Cloudflare，源站不暴露公网，浏览器到源站都走 TLS。相关页面是 [上线安全](/best-practices/security/) 和 [Fundamentals](/platform/fundamentals/)。
- 静态成本：静态资源直接由 Assets / Pages 返回，动态路径交给 Worker。相关页面是 [成本控制](/best-practices/cost/) 和 [Workers Static Assets](/platform/static-assets/)。
- 写入滥用：登录、评论、表单、上传、搜索、AI 调用设置限流和服务端验证。相关页面是 [上线安全](/best-practices/security/) 和 [WAF](/platform/waf/)。
- 数据性能：数据放对位置，常查路径有索引，文件权限和生命周期清楚。相关页面是 [数据能力](/platform/data/)、[D1](/platform/d1/) 和 [R2](/platform/r2/)。
- 密钥泄露：生产密钥使用 Secrets，不进仓库、配置、日志和前端包。
- 账单失控：核查用量、预算提醒和超额项，再决定优化或付费。相关页面是 [成本控制](/best-practices/cost/) 和 [账单与预算](/platform/billing/)。
