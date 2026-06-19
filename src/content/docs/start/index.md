---
title: 学习路线
---

## 入门阅读

先读 [免费额度大全](/platform/free-paid/)，了解免费阶段适用范围，以及 5 美元/月 Workers Paid 的覆盖能力。然后读 [Cloudflare 能力清单](/platform/)，把能力按入口、计算、数据、安全、AI、观测和后续场景分组。最后读 [静态内容站](/architecture/static-site/)，因为文档站、官网、博客和前端应用是最常见入口。

## 第一轮：先上线

第一轮先把入口跑稳：

1. [Fundamentals](/platform/fundamentals/)：账号、域名、代理状态、源站和权限。
2. [DNS](/platform/dns/)：哪些记录走 Cloudflare 代理，哪些保持不代理。
3. [SSL/TLS](/platform/ssl-tls/)：为什么生产环境优先 Full (strict)。
4. [Cache / CDN](/platform/cache/)：静态资源减少回源的方式，以及需要绕过缓存的内容类型。
5. [DDoS Protection](/platform/ddos/)、[WAF](/platform/waf/)、[Rules](/platform/rules/)：基础防护和规则配置方式。
6. [账单与预算](/platform/billing/)：Workers Paid、域名计划、附加产品和按量计费的边界。

## 第二轮：开发者平台

部署静态内容、文档站、前端应用，读 [Workers Static Assets](/platform/static-assets/) 和 [Pages](/platform/pages/)。写接口、第三方回调、边缘逻辑，读 [Workers](/platform/workers/)。

关系型数据读 [D1](/platform/d1/)；读多写少的配置、会话、缓存型数据读 [KV](/platform/kv/)；文件、图片、附件、对象读 [R2](/platform/r2/)。异步任务、削峰、后台处理读 [Queues](/platform/queues/)；单实体强一致状态、房间、协作读 [Durable Objects](/platform/durable-objects/)。

## 第三轮：按当前场景读

- 文档站、官网、前端应用：[静态内容站](/architecture/static-site/)、[Workers Static Assets](/platform/static-assets/)。
- 接口、第三方回调、轻量后端入口：[接口入口](/architecture/api-gateway/)、[Workers](/platform/workers/)。
- 评论、表单、登录保护：[WAF](/platform/waf/)、[安全与网络](/platform/security-networking/)、[D1](/platform/d1/)。
- 文件上传、附件、下载：[R2](/platform/r2/)、[R2 签名上传](/recipes/r2-signed-upload/)。
- 房间、协作、状态同步：[实时应用](/architecture/realtime-app/)、[Durable Objects](/platform/durable-objects/)。
- AI 搜索、自然语言问答、模型网关：[AI 能力](/platform/ai/)。
- 访问后台、保护内网工具：[Zero Trust 与企业网络](/platform/zero-trust-networking/)。
