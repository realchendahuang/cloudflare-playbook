---
title: 最佳实践
description: Cloudflare 项目的免费额度、安全、成本、数据、部署和 Agent 协作实践入口。
---

最后核对日期：2026-06-18。

最佳实践不是把 Cloudflare 产品尽量用满，而是先把免费额度、安全边界和升级信号讲清楚。普通项目最容易出问题的地方通常不是“少用了哪个高级产品”，而是静态请求被误打进 Worker、写接口没有限流、文件放错位置、日志和 AI 没有预算边界。

## 先记住一条

**免费额度先服务架构顺序，不是用来堆产品名。**

| 资源 / 能力 | 默认放置 | 免费阶段判断 |
| --- | --- | --- |
| 文档、官网、博客、前端资源 | Workers Static Assets / Pages | 静态资产请求免费且不限量，主流量应该停在这里。 |
| 小 API、Webhook、评论、表单 | Workers Free | 100,000 requests/day 和 10 ms CPU/invocation 足够早期验证。 |
| 评论、表单、小后台数据 | D1 | 5M rows read/day、100k rows written/day、5 GB storage。 |
| 图片、附件、导出文件 | R2 Standard | 10 GB-month、1M Class A、10M Class B，egress 免费。 |
| 配置、开关、读多写少缓存 | KV | 100k reads/day、1k writes/day、1 GB storage。 |
| 邮件、通知、导入、后处理 | Queues | 10,000 operations/day，适合把慢任务移出请求路径。 |
| 房间、会话、限流器、实时状态 | Durable Objects | 100,000 requests/day、13,000 GB-s/day，适合强一致小状态。 |
| 后台、预览环境、内网工具 | Access + Tunnel | Zero Trust Free 适合 50 users 内的小团队 PoC。 |
| AI 和自然语言搜索 | Pagefind -> AI Gateway / AI Search | 先静态搜索，AI 有明确价值后再引入托管能力。 |

完整额度表见 [免费额度大全](/platform/free-paid/)。写预算、报价单或 README 时，不要只引用二手整理，最终要回到官方 pricing / limits 页面核对。

## 读者入口

| 你要解决的问题 | 先读什么 | 读完要能判断什么 |
| --- | --- | --- |
| 不知道一个项目能不能 0 元跑起来 | [免费额度大全](/platform/free-paid/) | Free、Workers Paid、zone plan、add-on 和 usage-based 的边界。 |
| 给个人项目或早期 SaaS 选产品 | [独立开发者推荐栈](/best-practices/indie-stack/) | 哪些能力先免费验证，什么时候再买 Workers Paid 或更高计划。 |
| 控制账单和额度风险 | [成本控制](/best-practices/cost/) | 请求、CPU、存储、构建、日志、AI 和安全能力怎么触发成本。 |
| 给文档站、教程站或开源站选技术栈 | [本站技术栈](/best-practices/site-stack/) | 为什么优先选择成熟文档框架、静态搜索和托管评论组件。 |
| 上线前检查安全边界 | [安全边界](/best-practices/security/) | 公开入口、写接口、后台、API、密钥和观测应该放在哪一层。 |
| 用 Codex 长期维护 Cloudflare 项目 | [Codex 协作](/best-practices/codex-cloudflare/) | 什么时候查官方 Markdown / `llms.txt`，什么时候回到 Pricing / Limits，什么时候用 Wrangler 验证。 |

## 推荐顺序

| 阶段 | 先做什么 | 不要急着做 |
| --- | --- | --- |
| 接入域名 | DNS 托管、Web 记录 Proxied、SSL/TLS Full (strict)、源站保护。 | 直接复制复杂企业网络架构。 |
| 发布内容 | 静态站优先 Workers Static Assets 或 Pages；搜索优先 Pagefind。 | 让所有静态请求都进入 Worker 脚本。 |
| 增加写接口 | 登录、评论、表单、上传、Webhook 先做鉴权、限流、Turnstile 或签名校验。 | 匿名无限写入、无限 AI 调用、无限文件上传。 |
| 存数据 | 关系数据进 D1，文件进 R2，读多写少数据进 KV，强一致状态进 Durable Objects。 | 用一个产品硬扛所有数据形态。 |
| 做异步 | 邮件、导入、通知、审核、转码、AI 批处理放 Queues 或 Cron。 | 在用户请求里同步跑慢任务。 |
| 产品化 | 加 Workers Paid、Workers Logs、Access、API Shield、Analytics Engine、AI Search 或 Vectorize。 | 在没有真实压力前购买复杂度。 |

## 上线前检查

| 风险域 | 最小做法 | 对应专题 |
| --- | --- | --- |
| 入口风险 | Web 记录走 Cloudflare，源站不暴露公网，TLS 链路完整。 | [安全边界](/best-practices/security/)、[Fundamentals](/platform/fundamentals/) |
| 静态成本 | 静态资源直接由 Assets / Pages 服务，动态路径明确进入 Worker。 | [成本控制](/best-practices/cost/)、[Workers Static Assets](/platform/static-assets/) |
| 写入滥用 | 登录、评论、表单、上传、搜索、AI 调用设置限流和服务端验证。 | [安全边界](/best-practices/security/)、[WAF](/platform/waf/) |
| 数据性能 | D1 高频查询建索引；R2 浏览器访问配置 CORS、权限和生命周期。 | [数据产品](/platform/data/)、[D1](/platform/d1/)、[R2](/platform/r2/) |
| 密钥泄露 | 生产密钥使用 Secrets，不进仓库、配置、日志和前端包。 | [Codex 协作](/best-practices/codex-cloudflare/)、[安全边界](/best-practices/security/) |
| 部署漂移 | 配置、bindings、routes、custom domain 和环境变量要有可复核真源。 | [本站技术栈](/best-practices/site-stack/)、[Codex 协作](/best-practices/codex-cloudflare/) |
| 账单失控 | 先看 Billable Usage、Budget alerts、Pricing / Limits，再决定优化或付费。 | [成本控制](/best-practices/cost/)、[Billing](/platform/billing/) |
| Agent 误写 | Codex 先读官方 Markdown、产品级 `llms.txt`、Pricing / Limits，再动代码或文章。 | [Codex 协作](/best-practices/codex-cloudflare/)、[Cloudflare 文档地图](/reference/cloudflare-docs-map/) |

## Workers 项目底线

| 主题 | 项目规则 |
| --- | --- |
| 兼容性日期 | 新项目用当前日期；旧项目升级前单独验证。 |
| Node 兼容 | 依赖 Node 内置模块或现代 npm 包时显式启用 `nodejs_compat`。 |
| 类型 | 不手写 `Env`，用真实配置生成绑定类型。 |
| 密钥 | 生产密钥用 Cloudflare Secrets；本地密钥文件不提交。 |
| 环境 | staging、production 的 bindings 和 vars 明确声明，不假设自动继承。 |
| 路由 | Custom domain 表示 Worker 是 origin；route 表示 Worker 在已有源站前面。 |
| 大 body | 代理、大文件、下载和上传优先 stream，并在读取前限制大小。 |
| 静态资产 | 静态请求尽量直接命中 Assets，只有动态路径进入 Worker 脚本。 |

## 交付检查

每次修改 Cloudflare 项目，至少检查这些问题：

- 是否查过官方 docs、产品级 `llms.txt` 或页面级 Markdown。
- 涉及价格、额度、限制、配置字段、计划边界时，是否回到官方 Pricing / Limits。
- 静态资源是否绕开 Worker 脚本，动态路径是否有明确路由。
- 写接口是否有身份、速率、大小、幂等或人工处理边界。
- D1 查询是否有必要索引，R2 浏览器访问是否有 CORS 和授权边界。
- 生产密钥是否没有进入仓库、前端包、日志和 Markdown。
- 是否运行构建、类型检查、部署，并验证线上 URL。
- 是否把来源写进文章或 [官方资料](/reference/)。

## 官方资料

- [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/)
- [Cloudflare Use cases Solution guides](https://developers.cloudflare.com/use-cases/solutions/)
- [Workers Static Assets Billing and Limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [WAF Rate limiting best practices](https://developers.cloudflare.com/waf/rate-limiting-rules/best-practices/)
- [DDoS proactive defense](https://developers.cloudflare.com/ddos-protection/best-practices/proactive-defense/)
- [Protect your origin server](https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/)
- [D1 use indexes](https://developers.cloudflare.com/d1/best-practices/use-indexes/)
- [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/)
- [Cloudflare Docs for agents](https://developers.cloudflare.com/docs-for-agents/)
