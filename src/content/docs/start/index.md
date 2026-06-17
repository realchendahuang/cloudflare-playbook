---
title: 学习路线
description: Cloudflare Playbook 的推荐阅读顺序、官方资料入口和项目落地路径。
---

最后核对日期：2026-06-18。

这份 Playbook 的目标不是让你背产品名，而是建立一套能用于真实项目的判断顺序。读 Cloudflare 时先问项目要解决什么，再决定该读哪个产品。

## 先读这三页

| 先读 | 为什么 |
| --- | --- |
| [免费额度大全](/platform/free-paid/) | 先知道哪些能力可以 0 元起步，5 USD/month Workers Paid 买到什么，哪些能力另算。 |
| [Cloudflare 产品大图谱](/platform/) | 先把产品按入口、计算、数据、安全、AI、观测和企业能力分组。 |
| [静态内容站](/architecture/static-site/) | 文档站、官网、博客和前端应用是普通项目最常见的入口。 |

只记一条：**先跑免费路径，再为真实瓶颈买复杂度。**

## 官方资料怎么读

Cloudflare 官方文档已经为人和 AI Agent 都准备了结构化入口。不要只从搜索结果跳单页，先看索引，再看产品专题。

| 资料入口 | 适合解决的问题 |
| --- | --- |
| [全站 `llms.txt`](https://developers.cloudflare.com/llms.txt) | 先看 Cloudflare 当前有哪些产品、产品属于哪个大类。 |
| 产品级 `llms.txt` | 阅读某个产品前，先拿到该产品所有 Markdown 页面索引。 |
| 页面级 `index.md` | 需要引用、整理或让 Agent 阅读时，直接读取官方 Markdown。 |
| [Docs for agents](https://developers.cloudflare.com/docs-for-agents/) | 用 Codex、Claude Code、Cursor 等工具维护 Cloudflare 项目时，学习官方推荐的资料读取方式。 |
| [Learning Paths](https://developers.cloudflare.com/learning-paths/llms.txt) | 按官方课程顺序学习 DNS、安全、R2、Workers、Durable Objects、Workflows 等主题。 |
| [Use cases](https://developers.cloudflare.com/use-cases/llms.txt) | 从真实目标反推产品组合，比如保护 API、部署前端、实时应用、AI 应用。 |
| [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs) | 查看官方文档源文件、目录结构、历史修改和原始页面。 |

本站的 [Cloudflare 文档地图](/reference/cloudflare-docs-map/) 已按官方 `llms.txt` 把产品域、阅读优先级和来源入口集中到一页，适合先扫一遍。

## 第一轮：入口和账单

先解决域名、证书、代理、缓存、安全默认值和账单边界。不要急着写 Worker。

| 先读 | 要判断什么 |
| --- | --- |
| [Fundamentals](/platform/fundamentals/) | Account、Zone、Proxied、DNS-only、源站、Ray ID 和 API Token 的边界。 |
| [DNS](/platform/dns/) | 哪些记录走 Cloudflare 代理，哪些保持 DNS-only。 |
| [SSL/TLS](/platform/ssl-tls/) | 为什么生产环境优先 Full (strict)。 |
| [Cache / CDN](/platform/cache/) | 静态资源怎么减少回源，什么时候不要缓存。 |
| [DDoS Protection](/platform/ddos/)、[WAF](/platform/waf/)、[Rules](/platform/rules/) | 基础防护和规则边界。 |
| [免费额度大全](/platform/free-paid/) | Free、Workers Paid、zone plan、add-on 和 usage-based 的差异。 |

读完这一轮，你应该能解释：一个域名为什么要进 Cloudflare Zone，哪些请求会经过 Cloudflare，哪些能力免费可用，哪些能力会进入按量计费或更高套餐。

## 第二轮：开发者平台主线

不要把所有产品都当数据库或后端框架看。先按用途分层。

| 你要做什么 | 优先阅读 |
| --- | --- |
| 部署静态内容、文档站、前端应用 | [Workers Static Assets](/platform/static-assets/) 和 [Pages](/platform/pages/) |
| 写 API、Webhook、BFF、边缘逻辑 | [Workers](/platform/workers/) |
| 存关系型数据 | [D1](/platform/d1/) |
| 存读多写少的配置、会话、缓存型数据 | [KV](/platform/kv/) |
| 存文件、图片、附件、对象 | [R2](/platform/r2/) |
| 做异步任务、削峰、后台处理 | [Queues](/platform/queues/) |
| 做单实体强一致状态、房间、协作 | [Durable Objects](/platform/durable-objects/) |

读完这一轮，你要能把需求拆成三句话：入口在哪里，状态放哪里，异步工作怎么处理。

## 第三轮：按架构模式读

产品熟悉后，再按架构模式读。这样不会陷入“Cloudflare 产品很多，不知道先用哪个”的状态。

| 目标 | 优先阅读 | 关键判断 |
| --- | --- | --- |
| 做文档站、官网、博客 | [静态内容站](/architecture/static-site/) | 内容是否主要是静态文件，是否需要少量边缘逻辑。 |
| 做接口代理、Webhook、轻量后端 | [API 网关](/architecture/api-gateway/) | 是否需要鉴权、限流、缓存、转发和日志。 |
| 做房间、协作、状态同步 | [实时应用](/architecture/realtime-app/) | 是否需要 WebSocket、房间状态、单实体一致性。 |

普通项目优先从静态内容站和轻量 API 开始。只有明确需要共享状态、实时连接或后台队列时，再引入 Durable Objects 和 Queues。

## 第四轮：从 Use cases 反推项目

Cloudflare 官方 Use cases 更接近真实项目入口。可以把它当成“我要做什么”的索引，再回到本站专题做取舍。

| 项目目标 | 本站优先阅读 |
| --- | --- |
| 文档站、官网、前端应用 | [静态内容站](/architecture/static-site/)、[Workers Static Assets](/platform/static-assets/) |
| API、Webhook、微服务入口 | [API 网关](/architecture/api-gateway/)、[Workers](/platform/workers/) |
| 评论、表单、登录保护 | [WAF](/platform/waf/)、[安全与网络](/platform/security-networking/)、[D1](/platform/d1/) |
| 文件上传、附件、下载 | [R2](/platform/r2/)、[R2 签名上传](/recipes/r2-signed-upload/) |
| AI 搜索、RAG、模型网关 | [AI 产品](/platform/ai/) |
| 多租户 SaaS、客户自定义域名 | [平台化与多租户](/platform/platforms-saas/) 和 [DNS](/platform/dns/) |
| 访问后台、保护内网工具 | [Zero Trust 与企业网络](/platform/zero-trust-networking/) |

## 第五轮：跑通少数案例

案例只选高频组合，目标是把“产品知识”变成“能上线的最小路径”。

| 案例 | 适合学习 |
| --- | --- |
| [Worker API + D1](/recipes/worker-api-d1/) | 轻量接口、关系型数据和最小查询。 |
| [R2 签名上传](/recipes/r2-signed-upload/) | 文件上传、下载、权限控制和 CORS。 |
| [静态内容站](/architecture/static-site/) | 把内容站发布到 Cloudflare，并理解 Pages 与 Workers 的取舍。 |

跑案例时同时检查四件事：资源是否创建、环境变量是否正确、线上路径是否可访问、免费额度是否足够。

## 长期维护

| 协作目标 | 优先阅读 |
| --- | --- |
| 用 Codex 持续整理 Cloudflare 文档 | [Codex 协作](/best-practices/codex-cloudflare/) |
| 选择普通项目的 Cloudflare 组合 | [独立开发者推荐栈](/best-practices/indie-stack/) |
| 控制免费额度和付费边界 | [成本控制](/best-practices/cost/) |
| 查看官方资料地图 | [Cloudflare 文档地图](/reference/cloudflare-docs-map/) |

每次写文章时，按这个顺序核对来源：官方 `llms.txt`、产品级 Markdown、Pricing / Limits、官方 GitHub 源文件、相关开源模板。

## 不建议的学习方式

- 不要从产品名开始背，要从项目目标开始反推产品组合。
- 不要把免费额度当成无限额度，先看日额度、月额度、CPU、请求、读写次数和构建次数。
- 不要一开始就照企业架构做，小项目优先用更少的产品把路径跑通。
- 不要让 Agent 只凭记忆写 Cloudflare 配置，涉及限制、价格、字段和部署命令时必须查官方资料。

## 官方资料

- [Cloudflare Developer Documentation `llms.txt`](https://developers.cloudflare.com/llms.txt)
- [Cloudflare Learning Paths `llms.txt`](https://developers.cloudflare.com/learning-paths/llms.txt)
- [Cloudflare Use cases `llms.txt`](https://developers.cloudflare.com/use-cases/llms.txt)
- [Cloudflare Docs for agents](https://developers.cloudflare.com/docs-for-agents/)
- [Codex + Cloudflare](https://developers.cloudflare.com/agent-setup/codex/)
- [Cloudflare Agent Setup Prompt](https://developers.cloudflare.com/agent-setup/prompt.md)

## GitHub 开源参考

- [cloudflare/cloudflare-docs](https://github.com/cloudflare/cloudflare-docs)
- [cloudflare-docs Learning Paths 源目录](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/learning-paths)
- [cloudflare-docs Use cases 源目录](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/use-cases)
- [cloudflare/templates](https://github.com/cloudflare/templates)
- [cloudflare/skills](https://github.com/cloudflare/skills)
- [cloudflare/mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare)
- [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide)
