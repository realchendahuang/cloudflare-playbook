---
title: 学习路线
description: 从免费额度、入口、安全、数据和架构模式开始读 Cloudflare。
---

## 先读这三页

| 先读 | 为什么 |
| --- | --- |
| [免费额度大全](/platform/free-paid/) | 先知道 0 元能跑什么，5 美元/月 Workers Paid 买到什么。 |
| [Cloudflare 能力清单](/platform/) | 把能力按入口、计算、数据、安全、AI、观测和后续场景分组。 |
| [静态内容站](/architecture/static-site/) | 文档站、官网、博客和前端应用是最常见入口。 |

## 第一轮：先上线

| 先读 | 要判断什么 |
| --- | --- |
| [Fundamentals](/platform/fundamentals/) | 账号、域名、代理状态、源站和权限边界。 |
| [DNS](/platform/dns/) | 哪些记录走 Cloudflare 代理，哪些保持不代理。 |
| [SSL/TLS](/platform/ssl-tls/) | 为什么生产环境优先 Full (strict)。 |
| [Cache / CDN](/platform/cache/) | 静态资源怎么减少回源，哪些内容要绕过缓存。 |
| [DDoS Protection](/platform/ddos/)、[WAF](/platform/waf/)、[Rules](/platform/rules/) | 基础防护和规则怎么放。 |
| [账单与预算](/platform/billing/) | Workers Paid、域名计划、附加产品和按量计费怎么分开看。 |

## 第二轮：开发者平台

| 你要做什么 | 优先阅读 |
| --- | --- |
| 部署静态内容、文档站、前端应用 | [Workers Static Assets](/platform/static-assets/) 和 [Pages](/platform/pages/) |
| 写接口、第三方回调、边缘逻辑 | [Workers](/platform/workers/) |
| 存关系型数据 | [D1](/platform/d1/) |
| 存读多写少的配置、会话、缓存型数据 | [KV](/platform/kv/) |
| 存文件、图片、附件、对象 | [R2](/platform/r2/) |
| 做异步任务、削峰、后台处理 | [Queues](/platform/queues/) |
| 做单实体强一致状态、房间、协作 | [Durable Objects](/platform/durable-objects/) |

## 第三轮：按项目目标读

| 项目目标 | 优先阅读 |
| --- | --- |
| 文档站、官网、前端应用 | [静态内容站](/architecture/static-site/)、[Workers Static Assets](/platform/static-assets/) |
| 接口、第三方回调、轻量后端入口 | [接口入口](/architecture/api-gateway/)、[Workers](/platform/workers/) |
| 评论、表单、登录保护 | [WAF](/platform/waf/)、[安全与网络](/platform/security-networking/)、[D1](/platform/d1/) |
| 文件上传、附件、下载 | [R2](/platform/r2/)、[R2 签名上传](/recipes/r2-signed-upload/) |
| 房间、协作、状态同步 | [实时应用](/architecture/realtime-app/)、[Durable Objects](/platform/durable-objects/) |
| AI 搜索、自然语言问答、模型网关 | [AI 能力](/platform/ai/) |
| 访问后台、保护内网工具 | [Zero Trust 与企业网络](/platform/zero-trust-networking/) |

## 少绕路的做法

- 从项目目标反推能力组合，不从服务名开始记。
- 涉及限制、价格和部署命令时，先核对最新口径。
