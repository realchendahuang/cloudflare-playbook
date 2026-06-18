---
title: 学习路线
description: 从免费额度、入口、安全、数据和架构模式开始读 Cloudflare。
---

这条路线只解决一个问题：第一次读 Cloudflare 时该按什么顺序看。先看免费额度，再看上线入口、动态能力、数据和安全。

## 先读这三页

| 先读 | 为什么 |
| --- | --- |
| [免费额度大全](/platform/free-paid/) | 先知道 0 元能跑什么，5 美元/月 Workers Paid 买到什么。 |
| [Cloudflare 产品索引](/platform/) | 把产品按入口、计算、数据、安全、AI、观测和后置能力分组。 |
| [静态内容站](/architecture/static-site/) | 文档站、官网、博客和前端应用是最常见入口。 |

只记一条：**先跑免费路径，再为真实瓶颈买复杂度。**

## 第一轮：先上线

先解决域名、证书、代理、缓存和账单边界。Worker 放到动态功能出现后再看。

| 先读 | 要判断什么 |
| --- | --- |
| [Fundamentals](/platform/fundamentals/) | 账号、域名、代理状态、源站和权限边界。 |
| [DNS](/platform/dns/) | 哪些记录走 Cloudflare 代理，哪些保持不代理。 |
| [SSL/TLS](/platform/ssl-tls/) | 为什么生产环境优先 Full (strict)。 |
| [Cache / CDN](/platform/cache/) | 静态资源怎么减少回源，什么时候不要缓存。 |
| [DDoS Protection](/platform/ddos/)、[WAF](/platform/waf/)、[Rules](/platform/rules/) | 基础防护和边缘规则。 |
| [账单与预算](/platform/billing/) | Workers Paid、域名计划、附加产品和按量计费怎么分开看。 |

## 第二轮：开发者平台主线

不要把所有产品都当数据库或后端框架。先按用途分层。

| 你要做什么 | 优先阅读 |
| --- | --- |
| 部署静态内容、文档站、前端应用 | [Workers Static Assets](/platform/static-assets/) 和 [Pages](/platform/pages/) |
| 写接口、第三方回调、边缘逻辑 | [Workers](/platform/workers/) |
| 存关系型数据 | [D1](/platform/d1/) |
| 存读多写少的配置、会话、缓存型数据 | [KV](/platform/kv/) |
| 存文件、图片、附件、对象 | [R2](/platform/r2/) |
| 做异步任务、削峰、后台处理 | [Queues](/platform/queues/) |
| 做单实体强一致状态、房间、协作 | [Durable Objects](/platform/durable-objects/) |

读完这一轮，只要能回答三句话：入口在哪里，数据放哪里，慢任务怎么移出用户请求。

## 第三轮：按项目目标读

| 项目目标 | 优先阅读 |
| --- | --- |
| 文档站、官网、前端应用 | [静态内容站](/architecture/static-site/)、[Workers Static Assets](/platform/static-assets/) |
| 接口、第三方回调、轻量后端入口 | [接口入口](/architecture/api-gateway/)、[Workers](/platform/workers/) |
| 评论、表单、登录保护 | [WAF](/platform/waf/)、[安全与网络](/platform/security-networking/)、[D1](/platform/d1/) |
| 文件上传、附件、下载 | [R2](/platform/r2/)、[R2 签名上传](/recipes/r2-signed-upload/) |
| 房间、协作、状态同步 | [实时应用](/architecture/realtime-app/)、[Durable Objects](/platform/durable-objects/) |
| AI 搜索、自然语言问答、模型网关 | [AI 产品](/platform/ai/) |
| 访问后台、保护内网工具 | [Zero Trust 与企业网络](/platform/zero-trust-networking/) |

## 容易走偏的方式

- 从项目目标反推产品组合，不从产品名开始背。
- 免费额度不是无限额度，先看请求、CPU、读写次数、存储和构建次数。
- 早期用更少的产品把路径跑通，再按真实瓶颈升级。
- 涉及限制、价格和部署命令时，回到官方文档核对。

## 官方入口

官方资料从 [Cloudflare 文档地图](/reference/cloudflare-docs-map/) 进入；额度和价格先看 [免费额度大全](/platform/free-paid/)。
