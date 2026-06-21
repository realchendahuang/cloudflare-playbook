---
title: Cloudflare Playbook
outline: deep
---

<section class="onepage-hero">
  <p class="onepage-kicker">CLOUDFLARE PLAYBOOK</p>
  <h1 class="onepage-title">Vibe coding 时代的 Cloudflare 实战手册——用 AI 写代码，用 Cloudflare 免费部署到全球。</h1>
</section>

<div class="quick-grid">
  <a href="#_1-服务介绍"><strong>服务介绍</strong><span>每个服务是什么、能干嘛、怎么用。</span></a>
  <a href="#_2-ai-编程工作流"><strong>AI 编程工作流</strong><span>Skill、MCP、Rules 的搭配方案。</span></a>
  <a href="#_3-开发与部署"><strong>开发与部署</strong><span>从本地开发到上线的完整流程。</span></a>
  <a href="#_4-免费额度"><strong>免费额度</strong><span>每个服务免费多少，超出怎么算。</span></a>
  <a href="#_5-5-套餐"><strong>$5 套餐</strong><span>值不值得买，什么时候买。</span></a>
  <a href="#_6-开源项目"><strong>开源项目</strong><span>按用途整理可参考的项目。</span></a>
  <a href="#_7-常见坑"><strong>常见坑</strong><span>实际踩过的坑和解法。</span></a>
  <a href="#_8-国内访问"><strong>国内访问</strong><span>国内用户访问 CF 的注意事项。</span></a>
  <a href="#_9-排查问题"><strong>排查问题</strong><span>出错时怎么定位和排查。</span></a>
  <a href="#_10-完整案例"><strong>完整案例</strong><span>按应用类型分类的部署方案。</span></a>
  <a href="#官方资源"><strong>官方资源</strong><span>文档、模板和项目池。</span></a>
</div>

## 1. 服务介绍

Cloudflare 的服务按起步入口、计算、数据与存储、安全、AI 五类整理。每个服务给「是什么 / 能干嘛 / 实战」三行——浓缩官方文档，加实战注释。

### 起步入口

#### DNS
- **是什么**：域名解析入口，Cloudflare 的基础
- **能干嘛**：域名解析、子域名管理
- **实战**：所有项目的第一步，把域名 NS 指向 CF 就行。免费无限

#### SSL/TLS
- **是什么**：浏览器到边缘、边缘到源站的加密
- **能干嘛**：自动 HTTPS、证书管理
- **实战**：默认自动开启不用管。自定义证书链才需要手动配

#### Cache / CDN
- **是什么**：静态资源、页面和 API 响应的全球缓存
- **能干嘛**：静态站加速、API 响应缓存
- **实战**：静态资源缓存不额外计费。动态内容别缓存，用 Rules 精细控制

#### Rules
- **是什么**：重定向、缓存、Header、Origin 规则的统一入口
- **能干嘛**：URL 重写、Header 注入、缓存控制
- **实战**：简单重定向和 Header 操作用 Rules，别为这些写 Worker

### 计算

#### Workers
- **是什么**：跑在 Cloudflare 全球边缘的 JavaScript/TypeScript 函数
- **能干嘛**：API、Webhook、鉴权、代理、SSR、AI 入口
- **实战**：vibe coding 里最常打交道的服务。AI 生成的 Hono/Express API 直接部署到这里。CPU 10ms 上限（Free），长任务切 Workflows 或 Containers

#### Workers Static Assets
- **是什么**：Worker 项目里的静态文件托管，前端和 Worker API 强绑定
- **能干嘛**：SPA、静态站 + API 全栈项目
- **实战**：AI 生成 Next.js/Vite 前端时配这个部署最顺。静态请求免费无限，只有动态 API 走 Workers 配额

#### Pages
- **是什么**：Git 集成的静态站和全栈前端部署
- **能干嘛**：文档站、官网、博客、prototype
- **实战**：纯静态站首选。和 Worker 深度集成时用 Static Assets 更顺——Pages Functions 本质就是 Worker

#### Durable Objects
- **是什么**：单实体强一致状态 + WebSocket，跑在边缘的有状态对象
- **能干嘛**：房间、协作、WebSocket、单用户状态、计数器
- **实战**：Agents SDK 底层靠 DO。做实时协作或 Agent 状态时绕不开。Free 只能用 SQLite 后端

#### Workflows
- **是什么**：多步骤、长时运行的持久化任务，自带重试和状态机
- **能干嘛**：订单处理、数据迁移、AI 编排
- **实战**：AI 生成的多步 API 调用流程，用 Workflows 比在 Worker 里手写重试逻辑稳

#### Queues
- **是什么**：异步消息队列，解耦生产者和消费者
- **能干嘛**：后台任务、削峰、邮件发送、Webhook 批处理
- **实战**：不想让用户等的任务（发邮件、生成图片）扔进 Queues。单消息 128 KB 上限

#### Containers
- **是什么**：跑 Docker 容器，长时进程，原生 TCP
- **能干嘛**：重计算、传统应用、需要原生 TCP 的服务
- **实战**：AI 生成的 Python/Go 后端如果用了 Workers 跑不了的库，上 Containers。比 Workers 重，启动慢

#### Cron Triggers
- **是什么**：定时触发 Worker
- **能干嘛**：定时同步、清理、报告、轮询
- **实战**：定时抓数据、清理 D1。复杂定时任务别硬塞 Cron，用 Workflows

### 数据与存储

#### D1
- **是什么**：SQLite 风格的边缘关系数据库
- **能干嘛**：用户、文章、评论、配置等结构化数据
- **实战**：AI 生成应用默认数据库。注意 rows_read 是扫描行数不是返回行数，加索引能省额度

#### KV
- **是什么**：全球读多写少的键值存储，最终一致
- **能干嘛**：短链映射、配置、缓存
- **实战**：别拿它当数据库——不是强一致，同一 key 1 次/秒写入限制。存配置和缓存最合适

#### R2
- **是什么**：S3 兼容对象存储，出口流量永久免费
- **能干嘛**：图片、附件、导出、备份
- **实战**：vibe coding 里存用户上传文件的首选。免费额度和 Workers 计划无关，不买 $5 也能用

#### Hyperdrive
- **是什么**：连接已有的外部 Postgres/MySQL 并在边缘加速
- **能干嘛**：已有外部数据库不想迁移
- **实战**：从别处迁移到 CF 时过渡用。想要 CF 原生数据库用 D1

#### Vectorize
- **是什么**：向量数据库
- **能干嘛**：RAG、语义搜索
- **实战**：做 AI 问答系统时存 embedding。需要 Workers Paid

#### DO Storage
- **是什么**：Durable Objects 自带的单实体强一致存储
- **能干嘛**：房间状态、计数器、会话
- **实战**：和 DO 绑定不独立用。大规模数据存储别用

### 安全

#### Turnstile
- **是什么**：免费验证码，替代 reCAPTCHA
- **能干嘛**：表单、登录、注册、评论
- **实战**：无限免费无月度上限。AI 生成登录页时直接接 Turnstile

#### Access
- **是什么**：零信任访问控制
- **能干嘛**：后台、管理面板、内部工具
- **实战**：想给 admin 页面加层认证但不想写登录系统，用 Access。50 用户免费

#### WAF
- **是什么**：Web 应用防火墙
- **能干嘛**：防 SQL 注入、XSS 等常见攻击
- **实战**：基础规则集免费默认开。自定义规则要付费

#### Rate Limiting
- **是什么**：请求频率限制
- **能干嘛**：防滥用、防爬
- **实战**：API 上线前加一层，防 AI 爬虫和恶意请求

#### DDoS 防护
- **是什么**：自动 L3/L4/L7 防护
- **能干嘛**：所有项目默认开启
- **实战**：不可关，不用管

#### API Shield
- **是什么**：API 保护层
- **能干嘛**：schema 验证、防滥用
- **实战**：有公开 API 时配 schema 验证，挡掉格式错误的请求

### AI

#### Workers AI
- **是什么**：在 Cloudflare 边缘跑模型推理
- **能干嘛**：文本生成、图片分类、Embedding、Whisper 语音转文字
- **实战**：每天 1 万 Neurons 免费。注意可用模型列表，不是所有模型都有

#### AI Gateway
- **是什么**：AI API 调用的代理和观测层
- **能干嘛**：统一管理多个 AI 提供商的调用、缓存、限流
- **实战**：同时用 OpenAI + Anthropic + Workers AI 时，用 AI Gateway 统一入口加缓存省钱

#### Vectorize
- **是什么**：向量数据库（见数据与存储）
- **能干嘛**：RAG、语义搜索
- **实战**：AI 问答系统的存储层。需要 Workers Paid

#### Agents SDK
- **是什么**：构建有状态 AI Agent 的框架
- **能干嘛**：多轮对话、工具调用、持久化 Agent
- **实战**：底层用 Durable Objects 存状态。做 AI Agent 应用时这是 CF 官方推荐路径

---

## 2. AI 编程工作流

> 持续更新中。将覆盖：Cloudflare 相关 skill 的安装与组合、MCP server 配置、Rules 文件（CLAUDE.md / .cursorrules）编写，以及不同类型项目的工具链搭配方案。

---

## 3. 开发与部署

> 持续更新中。

---

## 4. 免费额度

以下数字来自 [Workers 定价页](https://developers.cloudflare.com/workers/platform/pricing/)、[Limits 文档](https://developers.cloudflare.com/workers/platform/limits/) 和各服务自己的 pricing/limits 页，按 2026 年 6 月的政策核对。免费额度有两种行为：**达到上限报错**（Workers/D1/KV/DO/Queues/Hyperdrive）和**超出按量计费**（R2），下表会标明。

### 计算

| 服务 | 免费额度 | 超出后 | 关键限制 |
| --- | --- | --- | --- |
| Workers | 10 万请求/天，CPU 10ms/请求 | 报错 Error 1027，不收费 | Worker 大小 3 MB（gzip 后），50 子请求/请求，100 个 Worker/账号 |
| Pages 静态 | 无限请求，500 次构建/月（1 个并发） | — | 单站点 20,000 文件，单文件 25 MiB，100 自定义域名 |
| Pages Functions | 同 Workers（共享 Workers 配额） | 同 Workers | 按 Workers 计费，不是独立产品 |
| Workers Static Assets | 静态资源请求免费且无限；动态请求走 Workers 配额 | 动态部分同 Workers | 20,000 文件/Worker，单文件 25 MiB |

### 数据与存储

| 服务 | 免费额度 | 超出后 | 关键限制 |
| --- | --- | --- | --- |
| D1 | 5 GB 存储，500 万行读取/天，10 万行写入/天 | 报错，需升级 Paid | `rows_read` 是扫描行数不是返回行数；加索引能省很多 |
| KV | 1 GB 存储，10 万读取/天，1000 写入/天 | 报错，需升级 Paid | 单 key 25 MiB；同一 key 写入 1 次/秒；最终一致不是强一致 |
| R2 | 10 GB 存储，100 万 A 类操作/月，1000 万 B 类操作/月 | **按标准价计费**：$0.015/GB-月、$4.50/M A 类、$0.36/M B 类 | 出口流量永久免费；R2 免费额度和 Workers 计划无关 |
| Durable Objects | 10 万请求/天，13,000 GB-s/天 | 报错，需升级 Paid | Free 只能用 SQLite 后端；KV 后端必须 Paid |
| Queues | 1 万操作/天 | 报错，需升级 Paid | 单消息 128 KB；Free 保留 24h，Paid 可配最长 14 天 |
| Hyperdrive | 10 万查询/天 | 报错，需升级 Paid（Paid 无限） | 连接已有的外部 Postgres/MySQL，不是 Cloudflare 的数据库 |

### 网络与安全

| 服务 | 免费额度 | 说明 |
| --- | --- | --- |
| DNS | 无限 | 所有计划都包含 |
| SSL/TLS | 无限 | 自动证书 |
| CDN / Cache | 无限 | 静态资源缓存不额外计费 |
| WAF | 基础规则集 | 付费版有更多规则和自定义 |
| Turnstile | 无限 | 验证码完全免费，无月度上限 |
| Access | 50 用户免费 | 超过需要 Cloudflare One 订阅 |
| DDoS 防护 | 无限 | 所有计划默认开启，不可关 |
| Email Routing | 无限 | 收信路由免费；发信走 Email Service / Workers |

### AI

| 服务 | 免费额度 | 超出后 |
| --- | --- | --- |
| Workers AI | 每天 10,000 Neurons（Free 和 Paid 都有） | Free 报错；Paid 按 $0.011/千 Neurons |
| AI Gateway | 免费 | 作为代理层不额外收费 |
| Vectorize | 5000 万查询维度/月，1000 万存储维度 | **需 Workers Paid**；超出 $0.01/M 查询维度，$0.05/100M 存储维度 |

### 容易踩到的平台限制

这些不在定价页上，但在 [Limits 文档](https://developers.cloudflare.com/workers/platform/limits/) 里写得很清楚，Free 和 Paid 都适用：

| 限制 | Free | Paid |
| --- | --- | --- |
| 单 Worker 内存 | 128 MB | 128 MB |
| Worker 大小（gzip 后） | 3 MB | 10 MB |
| Worker 启动时间 | 1 秒 | 1 秒 |
| 同时打开的子请求连接 | 6 | 6 |
| 单请求日志大小 | 256 KB | 256 KB |
| 每账号 Worker 数 | 100 | 500 |
| Cron Triggers/账号 | 5 | 250 |
| 静态资源文件数/Worker | 20,000 | 100,000 |
| 请求 body 大小 | 100 MB | 100 MB（受 Cloudflare 计划限制，非 Workers 计划） |

> 数字来自 Cloudflare 官方文档，可能随时调整。部署前核对 [Workers 定价页](https://developers.cloudflare.com/workers/platform/pricing/) 和 [Limits 文档](https://developers.cloudflare.com/workers/platform/limits/)。

---

## 5. $5 套餐

Workers Paid Plan 每月 $5，是一次性开通费用，包含一组月度额度，超出后按量计费。**和 Cloudflare 的 Free/Pro/Business 计划是分开的**，可以同时持有。

### 包含的额度（按月）

| 服务 | Free | Paid ($5/月) 包含 | 超出后 |
| --- | --- | --- | --- |
| Workers 请求 | 10 万/天 | 1000 万/月 | $0.30/百万请求 |
| Workers CPU 时间 | 10ms/请求 | 3000 万 ms/月 | $0.02/百万 CPU ms |
| 单请求 CPU 上限 | 10ms | 5 分钟（默认 30s，可调） | — |
| Workers Logs | 20 万事件/天，保留 3 天 | 2000 万事件/月，保留 7 天 | $0.60/百万事件 |
| Workers Logpush | 不可用 | 1000 万请求/月 | $0.05/百万请求 |
| KV 读取 | 10 万/天 | 1000 万/月 | $0.50/百万 |
| KV 写入 | 1000/天 | 100 万/月 | $5.00/百万 |
| KV 存储 | 1 GB | 1 GB | $0.50/GB-月 |
| D1 行读取 | 500 万/天 | 250 亿/月 | $0.001/百万行 |
| D1 行写入 | 10 万/天 | 5000 万/月 | $1.00/百万行 |
| D1 存储 | 5 GB | 5 GB | $0.75/GB-月 |
| Durable Objects 请求 | 10 万/天 | 100 万/月 | $0.15/百万 |
| Durable Objects 时长 | 1.3 万 GB-s/天 | 40 万 GB-s/月 | $12.50/百万 GB-s |
| Queues 操作 | 1 万/天 | 100 万/月 | $0.40/百万操作 |
| Workers AI Neurons | 1 万/天 | 1 万/天（和 Free 相同） | $0.011/千 Neurons |
| Vectorize 查询维度 | 5000 万/月 | 5000 万/月 | $0.01/百万 |
| Hyperdrive 查询 | 10 万/天 | 无限 | — |
| Containers | 不可用 | 25 GiB-时内存、375 vCPU-分、200 GB-时盘 | 按量 |

几个关键点：

- **R2 的免费额度和 Workers 计划无关**。所有人都能用 10 GB 存储 + 100 万 A 类 + 1000 万 B 类操作，不管买不买 $5 套餐。超出按 $0.015/GB-月、$4.50/M A 类、$0.36/M B 类算。
- **Workers Paid 不收出口流量费**。所有数据传输（egress）免费，这点和 S3、Vercel、AWS 明显不同。
- **Pages 静态请求永远免费无限**。只有 Pages Functions 走 Workers 配额。
- **静态资源请求不计入 Workers 请求配额**，即使跑在 Workers Static Assets 上。
- **Workers AI 的 1 万 Neurons/天 在 Free 和 Paid 一样**。Paid 的好处是超出后能继续用并按量付费，Free 超出直接报错。
- **Durable Objects 的 SQLite 存储计费 2026 年 1 月才开**，之前是免费的。

### 计费示例（来自官方定价页）

| 场景 | 月请求 | 平均 CPU | 月账单 |
| --- | --- | --- | --- |
| 1500 万请求，7ms CPU/请求 | 1500 万 | 7ms | **$8.00**（$5 + $1.50 请求 + $1.50 CPU） |
| 1 亿请求，7ms CPU/请求 | 1 亿 | 7ms | **$45.40**（$5 + $27 请求 + $13.40 CPU） |
| 1500 万请求，80% 是静态资源 | 1500 万 | — | **$5.00**（静态资源请求免费且无限） |
| Cron 每小时跑 1 次，每次 3 分钟 CPU | 720 | 3 分钟 | **$6.99**（$5 + $1.99 CPU） |

> 静态资源请求免费是 Workers Static Assets 的关键优势：只要把前端放在 Static Assets 上，只有真正调用 Worker 的动态请求才计费。

### 什么时候值

- 请求量超过免费额度（日均超过 10 万请求）
- 需要更长的 CPU 时间（处理大文件、复杂计算、AI 推理、SSR）
- 需要完整的 Workers Logs 排查问题（7 天保留 vs 3 天）
- 需要用 Durable Objects 的 KV 后端、Vectorize、Workers Logpush、Containers
- 项目已经有真实用户，需要稳定性保障

### 什么时候不值

- 个人博客、文档站 — Pages 静态请求免费无限
- 早期验证阶段 — 先跑通再付费
- 只有静态内容 — Pages 完全够
- 只用 R2 存文件 — R2 免费额度和 $5 套餐无关，不买也能用

### 怎么防账单失控

在 `wrangler.jsonc` 里加 CPU 上限，单次请求超过就会被强制终止，不会因为一个 bug 把额度吃光：

```json
{
  "limits": {
    "cpu_ms": 30000
  }
}
```

或者在 dashboard 里 **Workers & Pages** > 选 Worker > **Settings** > **CPU Limits** 设置。

---

## 6. 开源项目

下面按用途整理了一些可以拿来参考或直接部署的开源项目。官方也维护了两个值得关注的仓库：

- [cloudflare/templates](https://github.com/cloudflare/templates) — 官方起步模板，覆盖 Worker、D1、R2、Queues、AI 等常见组合
- [cloudflare/agents](https://github.com/cloudflare/agents) — 官方 Agent 示例集合，基于 Agents SDK 和 Durable Objects

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

---

## 7. 常见坑

> 持续更新中。

---

## 8. 国内访问

> 持续更新中。

---

## 9. 排查问题

> 持续更新中。

---

## 10. 完整案例

> 持续更新中。按应用类型分类：静态站 / API / 全栈应用 / Agent / 图床等。

---

## 官方资源

| 资源 | 用法 |
| --- | --- |
| [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/) | 查 Workers 官方最佳实践 |
| [Workers Examples](https://developers.cloudflare.com/workers/examples/) | 找单点功能示例 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | 找官方起步模板 |
| [Cloudflare Pricing](https://developers.cloudflare.com/workers/platform/pricing/) | 查最新定价和免费额度 |
