---
title: Cloudflare Playbook
outline: deep
---

<script setup>
import { Cloud, Bot, Rocket, Wallet, Zap, Package, AlertTriangle, Globe, Search, ClipboardList, Link, Compass, Cpu, Database, Shield, Brain, Lock, Server, ListFilter, Code, FileText, Boxes, GitBranch, ArrowLeftRight, Container, Clock, Table, Key, HardDrive, Layers, Scan, UserCheck, LockKeyhole, ShieldAlert, Gauge, Umbrella, Braces, BrainCircuit, Network } from 'lucide-vue-next'
</script>

<section class="onepage-hero">
  <p class="onepage-kicker">Cloudflare Playbook</p>
  <h1 class="onepage-title">Vibe Coding 时代的 Cloudflare 实战手册</h1>
  <p class="onepage-subtitle">用 AI 写代码，用 Cloudflare 免费部署到全球。涵盖服务介绍、部署流程、免费额度与常见坑。</p>
</section>

<div class="quick-grid">
  <a href="#_1-服务介绍"><div class="card-icon"><Cloud /></div><div class="card-body"><strong>服务介绍</strong><span>每个服务是什么、能干嘛、怎么用</span></div></a>
  <a href="#_2-ai-编程工作流"><div class="card-icon"><Bot /></div><div class="card-body"><strong>AI 编程工作流</strong><span>Skill、MCP、Rules 的搭配方案</span></div></a>
  <a href="#_3-开发与部署"><div class="card-icon"><Rocket /></div><div class="card-body"><strong>开发与部署</strong><span>从本地开发到上线的完整流程</span></div></a>
  <a href="#_4-免费额度"><div class="card-icon"><Wallet /></div><div class="card-body"><strong>免费额度</strong><span>每个服务免费多少，超出怎么算</span></div></a>
  <a href="#_5-5-套餐"><div class="card-icon"><Zap /></div><div class="card-body"><strong>$5 套餐</strong><span>值不值得买，什么时候买</span></div></a>
  <a href="#_6-开源项目"><div class="card-icon"><Package /></div><div class="card-body"><strong>开源项目</strong><span>按用途整理可参考的项目</span></div></a>
  <a href="#_7-常见坑"><div class="card-icon"><AlertTriangle /></div><div class="card-body"><strong>常见坑</strong><span>实际踩过的坑和解法</span></div></a>
  <a href="#_8-国内访问"><div class="card-icon"><Globe /></div><div class="card-body"><strong>国内访问</strong><span>国内用户访问 CF 的注意事项</span></div></a>
  <a href="#_9-排查问题"><div class="card-icon"><Search /></div><div class="card-body"><strong>排查问题</strong><span>出错时怎么定位和排查</span></div></a>
  <a href="#_10-完整案例"><div class="card-icon"><ClipboardList /></div><div class="card-body"><strong>完整案例</strong><span>按应用类型分类的部署方案</span></div></a>
  <a href="#官方资源"><div class="card-icon"><Link /></div><div class="card-body"><strong>官方资源</strong><span>文档、模板和项目池</span></div></a>
</div>

## 1. 服务介绍

Cloudflare 的服务按起步入口、计算、数据与存储、安全、AI 五类整理。每个服务说清楚什么时候你会用到、坑在哪。

### <Compass class="cat-icon" /> 起步入口 {#起步入口}

#### <Globe class="svc-icon" /> DNS {#dns}
域名解析入口，Cloudflare 最基础的服务。

你买了域名之后，第一件事就是把域名的 NS（Name Server）记录改到 Cloudflare。改完之后，域名的解析就归 CF 管了。所有项目都从这一步开始，免费无限，所有计划都包含。

#### <Lock class="svc-icon" /> SSL/TLS {#ssl-tls}
浏览器到 CF 边缘、CF 边缘到你源站的加密。

HTTPS 那把小锁就是它管的。默认自动开启，你不用做什么——域名解析到 CF 之后证书自动签发自动续期。除非你要用自定义证书链（比如企业内网场景），否则不用碰这个设置。

#### <Server class="svc-icon" /> Cache / CDN {#cache-cdn}
静态资源、页面和 API 响应的全球缓存。

你的文件存在 CF 的全球节点上，用户访问时从离他最近的节点拿，不用每次回源站。静态资源缓存不额外计费。做 vibe coding 时，AI 生成的静态站默认就能享受这个加速。动态内容（比如用户个人化数据）别缓存，用 Rules 精细控制哪些路径缓存、哪些不缓存。

#### <ListFilter class="svc-icon" /> Rules {#rules}
重定向、缓存、Header、Origin 规则的统一入口。

想把旧域名 301 到新域名、想给某些路径加个 Header、想控制某个路径缓存多久——这些不用写代码，在 Rules 里配就行。简单操作用 Rules，别为重定向和 Header 专门写 Worker，杀鸡不用牛刀。

### <Cpu class="cat-icon" /> 计算 {#计算}

#### <Code class="svc-icon" /> Workers {#workers}
跑在 CF 边缘的 JS/TS 函数，全球部署。

这是 vibe coding 里你最常打交道的服务。AI 帮你生成的 Hono、Express、或者纯 TS API，基本都能直接部署到 Workers。代码推上去之后自动分布到全球 300+ 节点，用户请求自动打到最近的节点。Free 计划 CPU 10ms/请求上限——对普通 API 够用，但如果要做图片处理、AI 推理这种重活，会撞到这个限制，这时候要么上 $5 套餐（CPU 上限提到 5 分钟），要么把重任务切到 Workflows 或 Containers。

#### <Package class="svc-icon" /> Workers Static Assets {#workers-static-assets}
Worker 项目里的静态文件托管，前端和 API 强绑定。

AI 生成 Next.js、Vite、或者任何前端框架的项目时，用这个部署最顺。前端文件（HTML/CSS/JS/图片）当静态资源托管，API 路由走 Worker——一个项目一套搞定。关键优势：静态资源请求免费且无限，不消耗 Workers 配额，只有真正调 API 的动态请求才计费。纯静态站（没有 API）用 Pages 更简单。

#### <FileText class="svc-icon" /> Pages {#pages}
Git 集成的静态站和全栈前端部署。

连 GitHub/GitLab 仓库，push 一下自动构建部署，适合文档站、官网、博客、prototype。和 Workers Static Assets 的区别：Pages 更偏 Git 集成工作流，Static Assets 更偏"一个 Worker 项目里前后端一起跑"。需要和 Worker 深度集成时用 Static Assets 更顺——Pages Functions 本质就是 Worker，不是独立产品。

#### <Boxes class="svc-icon" /> Durable Objects {#durable-objects}
单实体强一致状态 + WebSocket，跑在边缘的有状态对象。

Workers 本身是无状态的，每次请求可能打到不同节点。但有些场景需要状态——比如聊天房间、协作画板、在线游戏、或者一个 AI Agent 的对话状态。Durable Objects 就是解决这个的：每个 DO 实例代表一个"房间"或"对象"，状态强一致，支持 WebSocket 长连接。Agents SDK 底层就是用 DO 存 Agent 状态的，做实时协作或 Agent 时绕不开。Free 计划只能用 SQLite 后端，KV 后端必须 Paid。

#### <GitBranch class="svc-icon" /> Workflows {#workflows}
多步骤、长时运行的持久化任务，自带重试和状态机。

AI 生成的代码里经常有多步流程：先调 API A，再处理数据，再调 API B，最后存数据库。如果在 Worker 里手写，中间任何一步失败都要自己处理重试和状态恢复。Workflows 把这些封装好了——你定义步骤，它管重试、管状态、管持久化。订单处理、数据迁移、AI 编排都适用。单次同步请求别用，那是 Workers 的活。

#### <ArrowLeftRight class="svc-icon" /> Queues {#queues}
异步消息队列，解耦生产者和消费者。

有些事不想让用户等——发邮件、生成图片、处理上传文件。把任务扔进 Queues，Worker 在后台慢慢消费，用户立刻拿到"处理中"的响应。生产者和消费者解耦，高峰时自动削峰。单消息 128 KB 上限，需要同步返回结果别用。

#### <Container class="svc-icon" /> Containers {#containers}
跑 Docker 容器，长时进程，支持原生 TCP。

Workers 跑不了的东西——比如 Python/Go 后端用了原生库、需要长时进程、需要 TCP 连接——放 Containers 里。它就是 CF 上的 Docker。比 Workers 重，启动慢，按资源计费。AI 生成的后端如果用了 Workers 跑不了的库，上 Containers。轻量 API 还是用 Workers 更快更便宜。

#### <Clock class="svc-icon" /> Cron Triggers {#cron-triggers}
定时触发 Worker。

定时任务。每小时抓一次数据、每天清理一次 D1、每分钟轮询一个 API——配个 Cron Trigger 就行。Free 计划 5 个/账号，Paid 250 个。复杂的多步定时任务别硬塞 Cron，用 Workflows 更稳。

### <Database class="cat-icon" /> 数据与存储 {#数据与存储}

#### <Table class="svc-icon" /> D1 {#d1}
SQLite 风格的边缘关系数据库。

AI 生成应用时的默认数据库。语法和 SQLite 一样，会写 SQL 就能用，用 Drizzle ORM 或者直接 SQL 都行。有个坑要注意：D1 的计费按 rows_read（扫描行数）算，不是返回行数——一条 SELECT 如果没加索引扫了 10 万行，就算只返回 1 行也按 10 万行计费。所以索引一定要加好。复杂事务、高并发写入、需要 Postgres 特性时，D1 可能不够，考虑用 Hyperdrive 连外部数据库。

#### <Key class="svc-icon" /> KV {#kv}
全球读多写少的键值存储，最终一致。

存配置、存短链映射、存缓存——读多写少的场景用它最合适。但别拿它当主数据库：它是最终一致不是强一致（写入后不是立刻全球可见），同一 key 1 次/秒写入限制。库存、余额、计数这种需要强一致的场景不能用，用 D1 或 DO。存配置和缓存是它最合适的位置。

#### <HardDrive class="svc-icon" /> R2 {#r2}
S3 兼容对象存储，出口流量永久免费。

存文件——图片、视频、附件、导出、备份。S3 兼容意味着 AWS SDK 直接能用。最大的优势是出口流量永久免费：用户下载你 R2 里的文件不收流量费，这点和 S3、Vercel Blob 明显不同。vibe coding 里存用户上传文件的首选。免费额度（10 GB 存储 + 100 万 A 类操作 + 1000 万 B 类操作）和 Workers 计划无关，不买 $5 套餐也能用。结构化数据查询别用，那是 D1 的活。

#### <Zap class="svc-icon" /> Hyperdrive {#hyperdrive}
连接已有的外部 Postgres/MySQL 并在边缘加速。

你已经有数据库在别处（Supabase、Neon、自建 Postgres），不想迁移到 CF，但想让边缘访问更快。Hyperdrive 在边缘做连接池和查询缓存，减少每次回源的开销。从别处迁移到 CF 时过渡用最合适。想要 CF 原生数据库用 D1。

#### <Search class="svc-icon" /> Vectorize {#vectorize}
向量数据库。

做 RAG（检索增强生成）和语义搜索时用。把文本转成 embedding 存进 Vectorize，查询时找最相似的向量返回。做 AI 问答系统时这是存储层——存文档的 embedding，用户提问时检索相关文档喂给 LLM。需要 Workers Paid 才能用。

#### <Layers class="svc-icon" /> DO Storage {#do-storage}
Durable Objects 自带的单实体强一致存储。

和 Durable Objects 绑定，不独立用。每个 DO 实例有自己的 SQLite 存储，适合存房间状态、计数器、会话这种单实体数据。大规模数据存储别用，用 D1 或 R2。

### <Shield class="cat-icon" /> 安全 {#安全}

#### <UserCheck class="svc-icon" /> Turnstile {#turnstile}
免费验证码，替代 reCAPTCHA。

表单、登录、注册、评论都能加。无限免费无月度上限，不像 reCAPTCHA 有用量限制。AI 生成登录页时直接接 Turnstile，用户点一下就过，不用找图片选红绿灯。接法简单，前端嵌个 widget，后端验个 token 就行。

#### <LockKeyhole class="svc-icon" /> Access {#access}
零信任访问控制。

想给你的 admin 后台、内部工具加层认证，但不想写登录系统——用 Access。配好之后访问指定路径要先通过 CF 的身份验证（Google、GitHub、SAML 都支持）。50 用户免费，超过需要 Cloudflare One 订阅。vibe coding 做内部工具时，用它保护后台最省事。

#### <ShieldAlert class="svc-icon" /> WAF {#waf}
Web 应用防火墙。

防 SQL 注入、XSS、常见攻击。基础规则集免费默认开，不用管。自定义规则要付费。AI 生成的代码可能有安全漏洞，WAF 是一层兜底防护——但别指望它替代代码安全，该修的漏洞还是要修。

#### <Gauge class="svc-icon" /> Rate Limiting {#rate-limiting}
请求频率限制。

防滥用、防爬。API 上线前加一层 rate limit，防 AI 爬虫和恶意请求把额度吃光。可以按 IP、按路径配阈值。$5 套餐有更细的自定义规则。

#### <Umbrella class="svc-icon" /> DDoS 防护 {#ddos-防护}
自动 L3/L4/L7 防护。

所有项目默认开启，不可关，不用管。被 DDoS 攻击时 CF 自动帮你挡，不额外收费。

#### <Braces class="svc-icon" /> API Shield {#api-shield}
API 保护层。

schema 验证、防滥用。有公开 API 时配 schema 验证，挡掉格式错误的请求——不符合 schema 的请求直接被 CF 挡掉，不会打到你的 Worker。

### <Brain class="cat-icon" /> AI {#ai}

#### <BrainCircuit class="svc-icon" /> Workers AI {#workers-ai}
在 CF 边缘跑模型推理。

不用调外部 API，直接在 CF 边缘跑 LLM、图片分类、Embedding、语音转文字。每天 1 万 Neurons 免费（Free 和 Paid 都有），注意可用模型列表，不是所有模型都有。Free 超出报错，Paid 超出按 $0.011/千 Neurons 计费。做 AI 应用时，Workers AI 适合轻量推理，重活还是调外部 API（OpenAI、Anthropic）更稳。

#### <Network class="svc-icon" /> AI Gateway {#ai-gateway}
AI API 调用的代理和观测层。

同时用 OpenAI、Anthropic、Workers AI 时，用 AI Gateway 统一入口。它能帮你做三件事：缓存（相同 prompt 不重复调 API 省钱）、限流（防额度失控）、观测（看每次调用的延迟、token 数、成本）。免费，作为代理层不额外收费。AI 编程时配一个 AI Gateway 是好习惯，尤其是多 provider 场景。

#### <Scan class="svc-icon" /> Vectorize {#vectorize-ai}
向量数据库，见数据与存储。

AI 问答系统的存储层。需要 Workers Paid。

#### <Bot class="svc-icon" /> Agents SDK {#agents-sdk}
构建有状态 AI Agent 的框架。

做多轮对话、工具调用、持久化 Agent 时用。底层用 Durable Objects 存状态，Agent 的对话历史、工具调用结果都持久化在 DO 里。做 AI Agent 应用时这是 CF 官方推荐路径——不用自己搭状态管理，SDK 帮你封装好了。

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
