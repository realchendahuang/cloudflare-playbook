---
title: Cloudflare Playbook
outline: deep
---

<section class="onepage-hero">
  <p class="onepage-kicker">CLOUDFLARE PLAYBOOK</p>
  <h1 class="onepage-title">独立开发者的 Cloudflare 单页实战手册</h1>
  <p class="onepage-subtitle">从免费额度、能力清单、推荐栈、开源项目到上线检查，按一个页面组织，方便阅读和搜索。</p>
</section>

<div class="quick-grid">
  <a href="#先看结论"><strong>先看结论</strong><span>先拿默认选型，再按需求调整。</span></a>
  <a href="#按场景选型"><strong>按场景选型</strong><span>博客、图床、邮箱、AI、监控怎么选。</span></a>
  <a href="#开源项目案例"><strong>开源项目</strong><span>按用途整理可参考项目。</span></a>
  <a href="#官方资源"><strong>官方资源</strong><span>文档、模板和项目池。</span></a>
</div>

## 先看结论

如果你是独立开发者，Cloudflare 可以先按这套默认栈理解：

| 需求 | 默认方案 | 什么时候升级 |
| --- | --- | --- |
| 官网、文档、博客 | Pages 或 Workers Static Assets | 需要统一 Worker 工程时切到 Static Assets |
| 小后端、Webhook、API | Workers + Hono | CPU、日志、队列和数据访问进入瓶颈 |
| 关系数据 | D1 | 需要复杂事务、多区域主库或已有 Postgres |
| 文件和图片 | R2 | 需要图片处理、视频流、生命周期管理 |
| 缓存和配置 | KV | 需要强一致状态时换 D1 或 Durable Objects |
| 实时房间和协作 | Durable Objects | 单房间、单文档、单用户状态需要强一致 |
| 防滥用 | Turnstile + WAF + Access | 后台、上传、登录、Webhook 必须补入口保护 |

<div class="callout-strip">
先解决上线、成本和安全，再考虑复杂架构。早期项目最重要的是跑得起来、查得到问题、账单不会失控。
</div>

## 按场景选型

<div class="scenario-grid">
  <a class="scenario-card" href="#博客-文档和-cms"><strong>博客 / 文档 / CMS</strong><span>Pages、Workers、D1、R2。</span></a>
  <a class="scenario-card" href="#图床-文件和-r2"><strong>图床 / 文件 / R2</strong><span>R2 放对象，D1 放元数据。</span></a>
  <a class="scenario-card" href="#邮箱和验证码"><strong>邮箱 / 验证码</strong><span>Email Routing、D1、R2、Agent。</span></a>
  <a class="scenario-card" href="#短链-api-和-webhook"><strong>短链 / API / Webhook</strong><span>Workers 做入口，KV 或 D1 存状态。</span></a>
  <a class="scenario-card" href="#监控和分析"><strong>监控 / 分析</strong><span>Cron、Workers、D1、通知渠道。</span></a>
  <a class="scenario-card" href="#ai-agent-和-rag"><strong>AI / Agent / RAG</strong><span>Workers AI、AI Gateway、Vectorize、DO。</span></a>
</div>

## 免费额度

| 能力 | 免费层适合什么 | 注意点 |
| --- | --- | --- |
| Pages / Static Assets | 静态站、文档站、产品页 | 构建次数和项目协作边界要看当前官方文档 |
| Workers | 表单、Webhook、小 API、AI 代理入口 | CPU、请求量、日志和外部 API 才是常见边界 |
| D1 | 轻量关系数据、评论、配置、用户元数据 | 查官方限制，不要把它当无限数据库 |
| R2 | 图片、附件、导出文件、音视频原件 | 关注存储、操作次数、出入口路径 |
| KV | 配置、短链映射、读多写少缓存 | 写入传播不是强一致，不适合库存和余额 |
| Durable Objects | 房间、协作、单用户状态、WebSocket | 模型很好，但要按对象粒度设计 |

## 学习路线

1. 先学 DNS、SSL/TLS、Cache，知道 Cloudflare 如何接管入口。
2. 再学 Pages / Static Assets，把静态站上线。
3. 学 Workers，处理表单、Webhook、API、鉴权和转发。
4. 学 D1、KV、R2，把数据、配置和文件分开放。
5. 学 Turnstile、Access、WAF，补登录、后台和上传入口安全。
6. 最后看 Durable Objects、Queues、AI Gateway、Workers AI 和 Vectorize。

## 能力清单

### 起步入口

| 能力 | 一句话 |
| --- | --- |
| DNS | 域名解析入口，Cloudflare 的基础。 |
| SSL/TLS | 浏览器到 Cloudflare、Cloudflare 到源站的加密。 |
| Cache / CDN | 静态资源、页面和 API 响应的缓存策略。 |
| Rules | 重定向、缓存、Header、Origin 规则的统一入口。 |

### 开发者平台

| 能力 | 一句话 |
| --- | --- |
| Workers | 边缘函数，适合 API、Webhook、鉴权、AI 入口。 |
| Workers Static Assets | Worker 项目里的静态文件托管。 |
| Pages | Git 集成的静态站和全栈前端部署。 |

### 数据与状态

| 能力 | 一句话 |
| --- | --- |
| D1 | SQLite 风格关系数据库。 |
| KV | 全球读多写少键值存储。 |
| R2 | S3 兼容对象存储。 |
| Durable Objects | 单实体强一致状态和 WebSocket 房间。 |
| Queues | 异步任务和削峰。 |

## Workers

Workers 是 Cloudflare 项目的动态入口。它适合做小 API、Webhook、上传签名、鉴权、AI 调用代理和第三方服务转发。

上线前要检查：

- 不把密钥写进前端包。
- 外部 API 调用要加超时和日志。
- 写接口要有 Turnstile、限流或身份判断。
- 静态资源不要绕过 CDN 都打到 Worker。

## Pages 和 Static Assets

Pages 更像“Git 推送就部署”的站点入口。Static Assets 更适合“前端和 Worker 在一个工程里”的全栈项目。

| 选择 | 适合 |
| --- | --- |
| Pages | 文档站、官网、博客、普通前端项目 |
| Static Assets | 前端和 Worker API 强绑定的项目 |

## D1、KV、R2 和 Durable Objects

| 数据类型 | 放哪里 |
| --- | --- |
| 用户、权限、文章、评论、订单元数据 | D1 |
| 短链映射、配置、缓存、读多写少状态 | KV |
| 图片、附件、导出物、大文件 | R2 |
| 房间、协作、WebSocket、单实体强一致状态 | Durable Objects |

## 安全边界

最容易出问题的入口：

- 后台登录。
- 文件上传。
- 表单和评论。
- Webhook。
- 邮箱和验证码。
- AI 调用和模型代理。

默认组合：

```text
Access 保护后台
Turnstile 保护匿名写入
WAF / Rate Limiting 限制明显滥用
Secrets 存生产密钥
Workers Logs 看真实错误
```

## 成本控制

| 风险 | 检查方式 |
| --- | --- |
| Worker 被静态资源拖垮 | 静态文件交给 Pages / Static Assets |
| R2 操作次数异常 | 上传、列表、下载路径分开统计 |
| AI 调用不可控 | AI Gateway 统一观测和限额 |
| Cron 太频繁 | 先按业务真实频率跑 |
| 日志成本上升 | 本地开发和生产日志分级 |

## 开源项目案例

### 博客、文档和 CMS

| 项目 | Cloudflare 组合 | 可借鉴点 |
| --- | --- | --- |
| [openRin/Rin](https://github.com/openRin/Rin) | Pages、Workers、D1、R2 | 边缘原生博客和文章管理 |
| [microfeed/microfeed](https://github.com/microfeed/microfeed) | Cloudflare 自托管 CMS | 多内容类型发布 |
| [SonicJs-Org/sonicjs](https://github.com/SonicJs-Org/sonicjs) | Workers、D1、R2、Hono | Headless CMS 架构 |

### 图床、文件和 R2

| 项目 | Cloudflare 组合 | 可借鉴点 |
| --- | --- | --- |
| [G4brym/R2-Explorer](https://github.com/G4brym/R2-Explorer) | Workers、R2、KV | R2 Web 管理界面 |
| [ling-drag0n/CloudPaste](https://github.com/ling-drag0n/CloudPaste) | Workers、多存储 | 文件分享和 WebDAV |
| [yestool/imgUU](https://github.com/yestool/imgUU) | Astro SSR、D1、R2 | 图床和 GitHub 登录 |

### 邮箱和验证码

| 项目 | Cloudflare 组合 | 可借鉴点 |
| --- | --- | --- |
| [cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox) | Workers、R2、Email、Agents SDK | AI 邮箱客户端 |
| [maillab/cloud-mail](https://github.com/maillab/cloud-mail) | Cloudflare 邮箱服务 | 自托管邮箱能力 |
| [dreamhunter2333/cloudflare_temp_email](https://github.com/dreamhunter2333/cloudflare_temp_email) | D1、邮件、前后端 | 临时邮箱 |

### 短链、API 和 Webhook

| 项目 | Cloudflare 组合 | 可借鉴点 |
| --- | --- | --- |
| [xyTom/Url-Shorten-Worker](https://github.com/xyTom/Url-Shorten-Worker) | Workers | 短链接服务 |
| [ccbikai/Sink](https://github.com/ccbikai/Sink) | Cloudflare 全栈 | 短链和分析面板 |
| [cloudflare/workers-oauth-provider](https://github.com/cloudflare/workers-oauth-provider) | Workers | OAuth Provider |

### 监控和分析

| 项目 | Cloudflare 组合 | 可借鉴点 |
| --- | --- | --- |
| [lyc8503/UptimeFlare](https://github.com/lyc8503/UptimeFlare) | Workers | 可用性监控 |
| [eidam/cf-workers-status-page](https://github.com/eidam/cf-workers-status-page) | Workers、Cron、KV | 状态页 |
| [benvinegar/counterscale](https://github.com/benvinegar/counterscale) | Workers、D1 | Web Analytics |

### AI、Agent 和 RAG

| 项目 | Cloudflare 组合 | 可借鉴点 |
| --- | --- | --- |
| [cloudflare/agents](https://github.com/cloudflare/agents) | Durable Objects、Agents SDK | Agent 示例集合 |
| [cloudflare/vibesdk](https://github.com/cloudflare/vibesdk) | Cloudflare 全栈 | AI 编程平台 |
| [RihanArfan/chat-with-pdf](https://github.com/RihanArfan/chat-with-pdf) | NuxtHub、Workers AI、Vectorize | PDF 问答 |

## 官方资源

| 资源 | 用法 |
| --- | --- |
| [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/) | 查 Workers 官方最佳实践 |
| [Workers Examples](https://developers.cloudflare.com/workers/examples/) | 找单点功能示例 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | 找官方起步模板 |
