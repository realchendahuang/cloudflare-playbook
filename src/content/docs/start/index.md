---
title: 学习路线
description: 从免费额度、入口、安全、数据和架构模式开始读 Cloudflare。
---

最后核对日期：2026-06-18。

这条路线只解决一个问题：普通项目该按什么顺序理解 Cloudflare。先从免费额度和最常见的静态站开始，再看 Worker、数据、安全和少数架构模式。

## 先读这三页

| 先读 | 为什么 |
| --- | --- |
| [免费额度大全](/platform/free-paid/) | 先知道 0 元能跑什么，5 USD/month Workers Paid 买到什么。 |
| [Cloudflare 产品大图谱](/platform/) | 把产品按入口、计算、数据、安全、AI、观测和后置能力分组。 |
| [静态内容站](/architecture/static-site/) | 文档站、官网、博客和前端应用是最常见入口。 |

只记一条：**先跑免费路径，再为真实瓶颈买复杂度。**

## 第一轮：入口和账单

先解决域名、证书、代理、缓存、安全默认值和账单边界。不要急着写 Worker。

| 先读 | 要判断什么 |
| --- | --- |
| [Fundamentals](/platform/fundamentals/) | Account、Zone、Proxied、DNS-only、源站和 API Token 的边界。 |
| [DNS](/platform/dns/) | 哪些记录走 Cloudflare 代理，哪些保持 DNS-only。 |
| [SSL/TLS](/platform/ssl-tls/) | 为什么生产环境优先 Full (strict)。 |
| [Cache / CDN](/platform/cache/) | 静态资源怎么减少回源，什么时候不要缓存。 |
| [DDoS Protection](/platform/ddos/)、[WAF](/platform/waf/)、[Rules](/platform/rules/) | 基础防护和规则边界。 |
| [账单与预算](/platform/billing/) | Workers Paid、域名计划、附加产品和按量计费怎么分开看。 |

## 第二轮：开发者平台主线

不要把所有产品都当数据库或后端框架。先按用途分层。

| 你要做什么 | 优先阅读 |
| --- | --- |
| 部署静态内容、文档站、前端应用 | [Workers Static Assets](/platform/static-assets/) 和 [Pages](/platform/pages/) |
| 写 API、Webhook、BFF、边缘逻辑 | [Workers](/platform/workers/) |
| 存关系型数据 | [D1](/platform/d1/) |
| 存读多写少的配置、会话、缓存型数据 | [KV](/platform/kv/) |
| 存文件、图片、附件、对象 | [R2](/platform/r2/) |
| 做异步任务、削峰、后台处理 | [Queues](/platform/queues/) |
| 做单实体强一致状态、房间、协作 | [Durable Objects](/platform/durable-objects/) |

读完这一轮，你要能回答三句话：入口在哪里，状态放哪里，异步工作怎么处理。

## 第三轮：按项目目标读

| 项目目标 | 优先阅读 |
| --- | --- |
| 文档站、官网、前端应用 | [静态内容站](/architecture/static-site/)、[Workers Static Assets](/platform/static-assets/) |
| API、Webhook、微服务入口 | [API 网关](/architecture/api-gateway/)、[Workers](/platform/workers/) |
| 评论、表单、登录保护 | [WAF](/platform/waf/)、[安全与网络](/platform/security-networking/)、[D1](/platform/d1/) |
| 文件上传、附件、下载 | [R2](/platform/r2/)、[R2 签名上传](/recipes/r2-signed-upload/) |
| 房间、协作、状态同步 | [实时应用](/architecture/realtime-app/)、[Durable Objects](/platform/durable-objects/) |
| AI 搜索、RAG、模型网关 | [AI 产品](/platform/ai/) |
| 访问后台、保护内网工具 | [Zero Trust 与企业网络](/platform/zero-trust-networking/) |

## 跑两个案例

| 案例 | 适合学习 |
| --- | --- |
| [Worker API + D1](/recipes/worker-api-d1/) | 轻量接口、关系型数据和最小查询。 |
| [R2 签名上传](/recipes/r2-signed-upload/) | 文件上传、下载和权限控制。 |

案例不用全背。重点是知道结构化数据进 D1，文件对象进 R2，公开写入口要有限流、验证和日志。

## 不建议的学习方式

- 不要从产品名开始背，要从项目目标反推产品组合。
- 不要把免费额度当无限额度，先看请求、CPU、读写次数、存储和构建次数。
- 不要一开始照企业架构做，小项目优先用更少的产品把路径跑通。
- 不要只凭记忆写 Cloudflare 配置，涉及限制、价格、字段和部署命令时回到官方文档。

## 官方入口

- [Cloudflare Developer Documentation `llms.txt`](https://developers.cloudflare.com/llms.txt)
- [Cloudflare Learning Paths `llms.txt`](https://developers.cloudflare.com/learning-paths/llms.txt)
- [Cloudflare Use cases `llms.txt`](https://developers.cloudflare.com/use-cases/llms.txt)
- [Cloudflare 文档地图](/reference/cloudflare-docs-map/)
