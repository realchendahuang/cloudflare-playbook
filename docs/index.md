---
title: Cloudflare Playbook
outline: deep
---

<script setup>
import { Cloud, Bot, Rocket, Wallet, Zap, Package, AlertTriangle, Globe, Search, ClipboardList, Link, Compass, Cpu, Database, Shield, Brain, Lock, Server, ListFilter, Code, FileText, Boxes, GitBranch, ArrowLeftRight, Container, Clock, Table, Key, HardDrive, Layers, Scan, UserCheck, LockKeyhole, ShieldAlert, Gauge, Umbrella, Braces, BrainCircuit, Network, Image, Video, Radio, MonitorPlay } from 'lucide-vue-next'
</script>

<section class="onepage-hero">
  <p class="onepage-kicker">Cloudflare Playbook</p>
  <h1 class="onepage-title">Vibe Coding 时代的 Cloudflare 实战手册</h1>
  <p class="onepage-subtitle">用 AI 写代码，用 Cloudflare 免费部署到全球。涵盖功能模块、部署流程、免费额度与常见坑。</p>
</section>

<div class="quick-grid">
  <a href="#cloudflare-功能模块"><div class="card-icon"><Cloud /></div><div class="card-body"><strong>功能模块</strong><span>每个模块是什么、能干嘛、怎么用</span></div></a>
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

## 1. Cloudflare 功能模块 {#cloudflare-功能模块}

Cloudflare 的能力可以按站点基础、计算、数据存储、AI、媒体、安全、观测七类理解。每个模块说清楚什么时候你会用到、坑在哪。

### <Compass class="cat-icon" /> 站点基础 {#站点基础}

#### <Globe class="svc-icon" /> DNS {#dns}
权威 DNS 服务，负责把域名指向网站、API、邮箱等资源。

你买了域名之后，通常先把 NS（Name Server）改到 Cloudflare，让 Cloudflare 接管这个域名的解析。之后 A、AAAA、CNAME、MX、TXT 这些记录都在这里配，子域名、邮箱验证、CNAME flattening、DNSSEC 也都属于这一层。做项目时先把 DNS 搞对，后面的 Pages、Workers、R2 自定义域名才接得上。

#### <Lock class="svc-icon" /> SSL/TLS {#ssl-tls}
浏览器到 Cloudflare、Cloudflare 到源站之间的 HTTPS 加密。

HTTPS 那把小锁主要由这里管。接入 Cloudflare 后，边缘证书通常会自动签发和续期；如果你还有自己的源站，就要注意加密模式：`Full (strict)` 要求源站证书有效，`Flexible` 只加密浏览器到 Cloudflare 这一段，容易引出跳转循环和安全误判。普通静态站和 Workers 项目基本不用折腾证书链；有自建源站时才需要认真看这里。

#### <Server class="svc-icon" /> Cache / CDN {#cache-cdn}
静态资源、页面和部分响应的全球边缘缓存。

Cloudflare 会在边缘节点缓存适合缓存的内容，让用户从更近的位置拿文件，不必每次回源站。静态资源、图片、构建后的 JS/CSS 最适合走缓存；登录后的个人数据、实时接口、带权限的响应不要乱缓存。需要精细控制时，用 Cache Rules 配路径、Header、TTL 和绕过规则。

#### <ListFilter class="svc-icon" /> Rules {#rules}
重定向、缓存、Header、源站、配置覆盖的规则系统。

想把旧域名 301 到新域名、给某些路径加安全 Header、控制缓存策略、改写 URL、把不同路径转到不同源站，优先看 Rules。它适合处理边缘层的请求策略；只有当逻辑需要读写数据库、调用外部 API、按业务状态判断时，才应该写 Worker。

### <Cpu class="cat-icon" /> 计算 {#计算}

#### <Code class="svc-icon" /> Workers {#workers}
Cloudflare 的 serverless 运行时，用来跑 JS/TS、Wasm、部分 Python 等后端逻辑。

这是 vibe coding 里最常用的计算层。AI 生成的 Hono API、鉴权接口、Webhook、BFF、MCP Server、轻量 AI 编排，基本都可以放到 Workers。它适合短请求和高并发边缘逻辑；图片处理、大文件转码、长时间任务、原生系统依赖不要硬塞进普通 Worker，应该考虑 Workflows、Queues、R2、Containers 或外部服务。

#### <Package class="svc-icon" /> Workers Static Assets {#workers-static-assets}
Worker 项目里的静态资源托管，把前端文件和 Worker 代码作为一个整体部署。

AI 生成 Vite、React、Vue、Svelte、静态文档站或带 API 的前端项目时，这个很顺：HTML/CSS/JS/图片作为静态资源托管，`/api` 之类的动态逻辑走 Worker。默认请求命中静态文件时不执行 Worker；找不到静态文件时才交给 Worker 处理。前后端强绑定、想用一套 Worker 配置管理路由和 API 时，用它比拆成两套服务更清楚。

#### <FileText class="svc-icon" /> Pages {#pages}
面向前端项目的部署平台，主打 Git 集成、预览部署和静态站发布。

连上 GitHub/GitLab 后，push 就能构建和发布，适合官网、博客、文档站、活动页、原型页面。Pages Functions 本质上也是 Workers 能力；如果你要的是“前端 + API + 多个绑定”一体化项目，现在更推荐看 Workers Static Assets。已有 Pages 项目、依赖预览部署和 Git 工作流时，继续用 Pages 也没问题。

#### <Boxes class="svc-icon" /> Durable Objects {#durable-objects}
有状态对象，适合需要强一致协调、会话状态和 WebSocket 的场景。

Workers 本身是无状态的，每次请求可能落到不同地方；但聊天房间、协作画板、在线游戏房间、计数器、Agent 会话，都需要一个“同一时间说了算”的地方。Durable Objects 的每个实例可以代表一个房间、用户、文档或 Agent，带私有持久化存储，也能处理 WebSocket。它不是拿来存所有业务表的通用数据库；它更像“某个实体的状态和协调中心”。

#### <GitBranch class="svc-icon" /> Workflows {#workflows}
持久化的多步骤任务，用来跑会失败、会等待、会重试的流程。

AI 生成的业务经常不是一次请求能做完：先调 API，再写库，再发邮件，再等人工确认，最后发布结果。Workflows 把流程拆成 durable steps，自动保留状态、支持 sleep、等待外部事件和失败重试。订单处理、数据管道、用户生命周期邮件、AI 审核流都适合；普通同步 API 不需要它。

#### <ArrowLeftRight class="svc-icon" /> Queues {#queues}
异步消息队列，用来保证任务投递、削峰、批处理和重试。

有些事不该让用户等：发邮件、处理上传文件、写审计日志、批量同步数据、触发后台生成。把消息放进 Queues，消费者 Worker 再慢慢处理，可以批量、延迟、重试，也可以接死信队列。需要立刻返回最终结果的接口别用队列；队列适合“我先收下，后台处理”的任务。

#### <Container class="svc-icon" /> Containers {#containers}
在 Cloudflare 上跑容器，适合 Workers 跑不了的语言、库和长进程。

如果 AI 生成的项目依赖系统库、长时间进程、传统 HTTP 服务、原生二进制，Workers 运行时可能不合适，这时 Containers 是更自然的选择。它和 Workers 是配套关系：Worker 可以负责边缘入口和路由，容器承接重后端。代价是启动、资源和计费都比普通 Workers 重；轻 API 不要一上来就容器化。

#### <Clock class="svc-icon" /> Cron Triggers {#cron-triggers}
按 cron 表达式定时触发 Worker 的计划任务。

每小时同步一次数据、每天清理一次 D1、定时刷新缓存、周期性检查第三方 API，都可以用 Cron Triggers。它只负责“到点触发一次 Worker”；如果触发后要跑很多步骤、等待人工审批、失败后恢复上下文，就把真正流程放到 Workflows。

### <Database class="cat-icon" /> 数据存储 {#数据存储}

#### <Table class="svc-icon" /> D1 {#d1}
Cloudflare 托管的 serverless SQL 数据库，语法接近 SQLite。

AI 生成应用时，用户、订单、文章、配置这些结构化数据可以优先放 D1。它和 Workers、Pages 绑定很自然，也能用 Drizzle ORM 或直接 SQL。要注意的是：D1 更适合中小型应用和边缘应用的关系数据，不是 Postgres 的完整替代品。查询要建索引，别让一次 SELECT 扫完整张表；高并发写入、复杂事务、Postgres/MySQL 特性需求明显时，用 Hyperdrive 连外部数据库更稳。

#### <Key class="svc-icon" /> KV {#kv}
全球分布式键值存储，适合读多写少、低延迟读取的数据。

配置、短链映射、feature flag、缓存结果、边缘读取的小块 JSON，都适合 KV。它的重点是“全球读快”，不是“写完立刻所有地方一致”。库存、余额、秒杀名额、实时计数这种需要强一致的东西不要放 KV；这类状态要用 D1 或 Durable Objects。

#### <HardDrive class="svc-icon" /> R2 {#r2}
S3 兼容对象存储，用来存文件、图片、视频、附件、备份和数据集。

vibe coding 里一碰到用户上传、图片托管、导出文件、备份文件，先想到 R2。它兼容 S3 API，很多现成 SDK 和工具能直接接。R2 的重点是对象，不是表；文件元数据、权限、业务关系放 D1，文件本体放 R2。要做图片变换或视频播放，再配 Images、Stream 或 Worker 处理。

#### <Zap class="svc-icon" /> Hyperdrive {#hyperdrive}
连接外部 Postgres/MySQL 的边缘连接池和查询加速层。

如果数据库已经在 Supabase、Neon、RDS、自建 Postgres/MySQL，不想迁移，但 Worker 访问数据库又怕连接慢、连接数爆掉，就用 Hyperdrive。它在 Cloudflare 边缘做连接池，也可以缓存查询结果，减少每次跨区域连库的成本。它不是一个新数据库；它是“让 Workers 更好地连你已有数据库”的中间层。

#### <Search class="svc-icon" /> Vectorize {#vectorize}
Cloudflare 的向量数据库，用来存 embedding 并做相似度检索。

做 RAG、语义搜索、相似推荐时会用到它：先把文档切块，转成 embedding，存进 Vectorize；用户提问时再查最相近的向量，把相关文本喂给 LLM。Vectorize 存的是向量和元数据，不是原始文件仓库；原文可以放 R2 或 D1。它不是只有 Paid 才能用，Free 和 Paid 都有对应额度，具体看最新 pricing。

#### <Layers class="svc-icon" /> DO Storage {#do-storage}
Durable Objects 自带的持久化存储，跟某个对象实例绑定。

每个 Durable Object 都可以有自己的存储，用来保存这个对象的状态，比如房间成员、协作文档快照、Agent 会话、连接状态、计数器。它的价值是“单实体强一致 + 本地状态”，不是拿来替代 D1 做全局报表，也不是拿来存大量文件。

#### <LockKeyhole class="svc-icon" /> Secrets Store {#secrets-store}
集中管理密钥和敏感配置。

API Key、Webhook secret、数据库密码、第三方服务 token，不应该写在代码里，也不应该散落在每个项目配置里。Secrets Store 适合把这些敏感值集中管理，再绑定给 Workers 等服务使用。普通项目也可以先用 Worker secrets；团队协作、多个服务共享密钥、需要审计和轮换时，再看 Secrets Store。

#### <ArrowLeftRight class="svc-icon" /> Pipelines {#pipelines}
把事件流和日志持续写入目标存储的数据管道。

当你有持续产生的数据，比如应用事件、行为日志、分析事件，需要稳定写到 R2 等地方做后续分析，就看 Pipelines。它更像数据基础设施，不是普通业务数据库。小项目刚上线不一定需要；等到日志、事件、数据湖这些词真的出现时再引入。

### <Brain class="cat-icon" /> AI {#ai}

#### <BrainCircuit class="svc-icon" /> Workers AI {#workers-ai}
Cloudflare 的 serverless AI 推理平台。

你可以从 Worker、Pages 或 REST API 调用 Cloudflare 托管的模型，做 LLM、embedding、文本分类、语音转文字、图片理解等任务。它的好处是部署和鉴权简单，和 Workers、Vectorize、AI Gateway 组合顺。要注意模型列表和能力会变化，不要假设所有 OpenAI/Anthropic 的能力这里都有；复杂推理、多模态高级能力或强模型需求，可能还是要接外部模型。

#### <Network class="svc-icon" /> AI Gateway {#ai-gateway}
AI API 的统一网关，负责观测、缓存、限流和成本控制。

同时用 OpenAI、Anthropic、Workers AI、Groq、Mistral 这类 provider 时，不要让代码里散落一堆 API 调用，先接 AI Gateway。它能记录请求、看延迟和错误、做缓存、限流、重试、fallback，也能帮你控制花费。做 AI 应用时，这一层非常值钱：它不是模型本身，而是模型调用的控制台和保险丝。

#### <Scan class="svc-icon" /> Vectorize {#vectorize-ai}
向量数据库，见数据存储。

AI 问答系统的检索层。原文放 R2 或 D1，embedding 放 Vectorize，查询时先检索再交给模型回答。

#### <Search class="svc-icon" /> AI Search {#ai-search}
Cloudflare 托管的 AI 搜索能力。

如果你想快速给网站、文档、知识库加语义搜索和问答体验，可以看 AI Search。它比自己手动拼 Workers AI + Vectorize + crawler 更省事，但灵活度也更受产品边界影响。想完全掌控切块、索引、召回和回答逻辑，就自己用 Workers AI + Vectorize 搭。

#### <Bot class="svc-icon" /> Agents SDK {#agents-sdk}
构建有状态 AI Agent 的框架，底层基于 Durable Objects。

做多轮对话、工具调用、Agent 记忆、实时 WebSocket、定时任务时，用 Agents SDK 比自己手写状态管理舒服。每个 Agent 可以有自己的状态和存储，适合客服助手、个人助理、自动化机器人、协作型 AI 工具。只是简单调一次 LLM，就不需要上 Agents SDK。

### <Image class="cat-icon" /> 媒体 {#媒体}

#### <Image class="svc-icon" /> Images {#images}
图片托管、优化、变体和边缘转换服务。

如果项目里有用户头像、商品图、封面图、内容配图，Images 可以负责上传、存储、压缩、裁剪、格式转换和按需生成不同尺寸。R2 更像通用文件桶，适合存原始对象；Images 更像图片交付管线，适合直接面向页面展示。只存少量静态图片时，用静态资源或 R2 就够；图片量大、尺寸多、要自动优化时再看 Images。

#### <Video class="svc-icon" /> Stream {#stream}
视频存储、编码、播放和分发服务。

上传视频后，Stream 负责转码、生成自适应码流、托管播放器和全球分发，适合课程、产品演示、UGC 视频、会员内容。它解决的是“让视频稳定播放”，不是简单存一个 mp4 文件。只是给用户下载原始视频，用 R2 更直接；要网页内播放、转码、多清晰度和观看体验，就用 Stream。

#### <Radio class="svc-icon" /> Realtime {#realtime}
实时音视频和低延迟通信能力。

这一组对应 Dashboard 里的 Realtime，包括 RealtimeKit、TURN 服务器、无服务器 SFU、MoQ 中继等能力。做多人会议、语音房、直播连麦、实时互动时会碰到它。普通 WebSocket 协作先看 Workers + Durable Objects；真正涉及音视频链路、NAT 穿透、SFU 转发和低延迟媒体传输时，再进入 Realtime。

#### <MonitorPlay class="svc-icon" /> Browser Rendering {#browser-rendering}
在 Workers 里调用无头浏览器进行渲染、截图和自动化。

需要把网页转成截图、生成 PDF、跑页面渲染检查、抓取自己可访问页面的最终 DOM 时，可以用 Browser Rendering。它适合“需要真实浏览器环境”的任务，不适合普通 HTML 拼接，也不应该拿来绕过登录、付费墙或网站限制。能用服务端模板直接生成的内容，不必上浏览器渲染。

### <Shield class="cat-icon" /> 安全 {#安全}

#### <UserCheck class="svc-icon" /> Turnstile {#turnstile}
Cloudflare 的验证码替代方案，用来判断请求是不是来自真实用户。

登录、注册、评论、表单、试用申请都能接 Turnstile。它的思路不是逼用户选图，而是尽量在后台判断风险，必要时才让用户交互。接入时前端放 widget，后端校验 token；只在前端放组件但后端不验，等于没接。

#### <LockKeyhole class="svc-icon" /> Access {#access}
Zero Trust 里的应用访问控制，给内部工具和后台加身份验证。

你做了一个 admin 后台、内部数据看板、临时运维工具，不想自己写登录系统，就用 Access。它会在请求进源站或 Worker 前先做身份验证和策略判断，可以接 Google、GitHub、SAML、OIDC 等身份源。对 vibe coding 的内部工具来说，这是最省事的“先挡在门口”的方案。

#### <ShieldAlert class="svc-icon" /> WAF {#waf}
Web 应用防火墙，在请求到达应用前拦截常见攻击。

WAF 可以用托管规则、自定义规则、速率限制等方式处理 SQL 注入、XSS、恶意扫描、异常路径、已知漏洞利用。AI 生成的代码可能有低级安全问题，WAF 能做一层边缘兜底，但不能替代代码修复：鉴权、权限校验、参数校验还是应用自己要做好。

#### <Gauge class="svc-icon" /> Rate Limiting {#rate-limiting}
按路径、IP、Header、请求特征限制访问频率。

登录接口、短信验证码、公开 API、AI 调用入口、上传接口，都应该考虑限流。它能防止恶意刷接口、爬虫吃光额度、单个 IP 打爆 Worker。限流不是业务权限系统；它解决“访问太频繁”，不解决“这个人有没有权限”。

#### <Umbrella class="svc-icon" /> DDoS 防护 {#ddos-防护}
Cloudflare 网络层和应用层的 DDoS 防护。

Cloudflare 会在边缘网络自动吸收和缓解大量攻击流量，HTTP 层也有对应的检测和规则。大多数小项目不需要专门配置它；真正被打时，重点是确认域名已代理到 Cloudflare、源站 IP 没暴露、缓存和 WAF 策略没有把正常用户误伤。

#### <Braces class="svc-icon" /> API Shield {#api-shield}
面向 API 的安全能力集合，包括 schema 校验、mTLS、发现和滥用检测。

有正式公开 API、移动端 API、合作方 API 时，可以用 API Shield 做 OpenAPI schema 校验、客户端证书、API 发现和风险分析。不符合 schema 的请求可以在边缘直接拦掉，减少打到 Worker 或源站的垃圾流量。它偏正式 API 治理，小项目早期不一定要上；接口稳定、调用方变多之后价值更明显。

### <Gauge class="cat-icon" /> 观测 {#观测}

#### <Search class="svc-icon" /> Log Explorer {#log-explorer}
Cloudflare Dashboard 里的日志搜索工具。

线上请求出问题时，先看这里。Log Explorer 可以按时间、路径、状态码、Ray ID、服务类型等条件搜索日志，用来判断错误发生在 Cloudflare 边缘、Worker 代码、缓存规则、WAF，还是源站。它适合临时排查；长期留存和外部分析交给 Logpush。

#### <GitBranch class="svc-icon" /> Trace {#trace}
模拟请求经过 Cloudflare 配置后的处理路径。

你想知道一个 URL 会命中哪些规则、是否走缓存、是否触发 Worker、是否被安全规则影响，就用 Trace。它适合验证配置为什么这样生效，不是完整的应用 APM。遇到“为什么这个路径没有按预期跳转/缓存/转发”时，Trace 比肉眼翻规则更靠谱。

#### <ArrowLeftRight class="svc-icon" /> Logpush {#logpush}
把 Cloudflare 日志持续推送到外部目的地。

需要长期留存日志、接入 SIEM、放到 R2/S3/BigQuery/Splunk 等系统分析时，用 Logpush。它解决的是“日志要出 Cloudflare，进入我的数据系统”。小项目不用一开始就配；等你真的需要合规审计、长期趋势、跨系统排查时再上。

#### <Gauge class="svc-icon" /> Web Analytics {#web-analytics}
隐私友好的站点访问和前端性能分析。

看页面访问量、来源、国家地区、设备、Web Vitals 和前端性能时用它。它不依赖传统第三方广告追踪模型，也可以通过 JS snippet 接到非 Cloudflare 代理的网站。官网、文档站、博客、产品页都适合先接这个，复杂增长分析再考虑专门分析工具。

#### <ClipboardList class="svc-icon" /> Observability {#observability}
Workers 和 Pages 的运行观测入口。

API 上线后，要看请求量、错误率、延迟、异常日志、部署版本表现，就来这里。Workers Logs、Invocation Logs、metrics、traces 都属于这条线。它回答“代码运行得怎么样”；Log Explorer 更偏“请求和边缘层发生了什么”。

#### <Table class="svc-icon" /> Analytics Engine {#analytics-engine}
Workers 里的自定义指标和事件分析引擎。

如果你想在 Worker 里写入业务事件，比如按钮点击、接口耗时、模型调用成本、用户行为，再用 SQL 聚合分析，就看 Analytics Engine。它适合高基数事件分析，不适合当事务数据库，也不适合存需要逐条强一致查询的业务记录。

---

## 2. AI 编程工作流

AI 写 Cloudflare 项目，最容易出问题的地方不是语法，而是选错运行时、绑定、存储和计费口径。正确工作流是：先让 AI 理解 Cloudflare 的边界，再让它写代码。

### 先定架构，再让 AI 写代码

开始前先把这几件事说清楚：

- 项目类型：静态站、API、全栈应用、Agent、图床、监控、实时协作。
- 数据形态：结构化数据用 D1，文件用 R2，读多写少缓存用 KV，单实体强一致状态用 Durable Objects。
- 任务形态：同步请求用 Workers，异步任务用 Queues，多步骤长流程用 Workflows，系统依赖和长进程用 Containers。
- 安全边界：公开接口要限流，表单和注册要 Turnstile，内部后台优先用 Access。
- 成本边界：先按 Free 额度设计，确认需要更长 CPU、更高 subrequests、更多日志或 Containers 时再上 Workers Paid。

一个好用的提示词结构是：

```text
我要做一个 Cloudflare 项目：
- 类型：
- 用户会上传/读取什么数据：
- 是否需要登录：
- 是否需要后台任务：
- 是否需要 AI：
- 期望免费额度内先跑起来：

请先给我 Cloudflare 产品组合，再给目录结构、wrangler 配置、数据表、API 路由和部署步骤。
不要把密钥写进代码，不要把需要强一致的数据放 KV，不要缓存登录后的私有响应。
```

### 选型顺序

不要从框架开始选，从运行形态开始选：

- 纯静态文档、官网、博客：Pages 或 Workers Static Assets。
- 前端 + 少量 API：Workers Static Assets + Workers。
- REST API、Webhook、MCP Server：Workers + Hono/itty-router/原生 Fetch。
- 需要 SQL：Workers + D1；已有 Postgres/MySQL：Workers + Hyperdrive。
- 文件上传和下载：Workers + R2；图片展示再加 Images。
- 后台任务：用户请求写入 Queues，消费者 Worker 慢慢处理。
- 多步骤流程：Workflows 管状态、重试、sleep 和等待外部事件。
- 聊天、协作、房间、Agent 状态：Durable Objects。
- RAG：R2/D1 存原文，Vectorize 存 embedding，Workers AI 或外部模型生成回答。
- 多 provider AI 调用：AI Gateway 放在模型调用前面，统一观测、缓存、限流。

### 资料入口

写代码前先让 AI 参考这些入口：

- [Cloudflare Workers Examples](https://developers.cloudflare.com/workers/examples/)：单点功能示例，比如 CORS、缓存、WebSocket、Turnstile。
- [cloudflare/templates](https://github.com/cloudflare/templates)：官方起步模板，适合直接拆目录和配置。
- [create-cloudflare](https://developers.cloudflare.com/pages/get-started/c3/)：官方脚手架，适合新项目起步。
- [cloudflare/agents](https://github.com/cloudflare/agents)：Agents SDK 示例，适合看 Durable Objects + Agent 状态怎么组织。
- [Workers Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/)：查 D1、R2、KV、Vectorize、AI、Queues 等绑定怎么写。
- [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/)：写前先看限制，尤其是 CPU、subrequests、Worker size。

### 本地循环

AI 生成代码后，不要直接部署。按这个循环走：

1. 本地安装依赖，跑 `pnpm build` 或对应框架的 build。
2. 用 `wrangler dev` 或框架 dev server 跑本地服务。
3. 先测最小路径：主页、健康检查、一个读接口、一个写接口。
4. 需要绑定的资源先建出来：D1、R2、KV、Queues、Vectorize、Durable Objects。
5. 密钥用 `wrangler secret put` 或 Secrets Store，不写进 `.env.example` 之外的文件。
6. 让 AI 根据实际报错修，不要让它凭空重构。
7. 部署后用 Workers Logs、Log Explorer、Trace 和真实 URL 验证。

### 给 AI 的项目规则

项目里最好长期保留一份 AI 规则文件，比如 `AGENTS.md`、`CLAUDE.md` 或 `.cursorrules`。里面写清楚：

- 运行环境是 Cloudflare Workers，不是普通 Node.js server。
- 能用 Web API 就用 Web API；Node.js 兼容能力要查官方支持列表。
- 所有 Cloudflare 资源通过 bindings 访问，不在代码里拼账号密钥。
- D1 查询必须考虑索引和 rows_read。
- KV 只能放最终一致、读多写少的数据。
- R2 只存对象，权限、归属、索引放 D1。
- Worker 里不要做长时间 CPU 重活；重任务拆到 Queues、Workflows 或 Containers。
- 登录态、个人数据、后台 API 默认不缓存。
- 公开表单、登录、上传和 AI 调用入口要有 Turnstile、限流或鉴权。

---

## 3. 开发与部署

Cloudflare 项目的开发部署，可以按“选入口、配资源、本地跑、上线、观测”五步走。

### 选部署入口

新项目优先这样选：

- 静态站：Pages 最简单；如果以后要和 Worker API 强绑定，用 Workers Static Assets。
- 前端 + API：Workers Static Assets，把前端资源和 Worker 放在一个项目里部署。
- 纯 API：Workers，入口就是 `fetch` handler 或 Hono app。
- 传统后端或原生依赖：Containers，再用 Worker 做边缘入口。
- 已经用 Pages 且跑得稳定：继续用 Pages，不必为了“新”迁移。

选入口时先看动态逻辑有多少：内容越静态，Pages 越省心；业务逻辑越靠近请求入口，Workers 越适合。

### 新项目起步

官方推荐用 create-cloudflare 起项目：

```bash
npm create cloudflare@latest
```

如果项目已经存在，核心是补好 `wrangler.jsonc`：

```json
{
  "name": "my-worker",
  "main": "src/index.ts",
  "compatibility_date": "2026-06-21",
  "assets": {
    "directory": "./dist"
  }
}
```

只做静态站时，`assets.directory` 指向构建输出目录。需要 API 时，在 Worker 里处理动态路由，静态资源交给 assets。

### 资源绑定

常见绑定按用途加：

- D1：用户、订单、文章、配置、任务状态。
- R2：图片、附件、导出文件、备份。
- KV：缓存、短链映射、feature flag、公开配置。
- Queues：邮件、上传处理、AI 生成、异步同步。
- Durable Objects：房间、协作文档、在线状态、Agent 会话。
- Vectorize：RAG 和语义搜索。
- Analytics Engine：自定义事件和高基数指标。
- Browser Run：截图、PDF、页面渲染检查。

资源名和 binding 名要稳定。AI 生成代码时，`env.DB`、`env.BUCKET`、`env.QUEUE` 这些名字一旦定下来，就让配置和代码保持一致。

### 本地开发

推荐保留这几个命令：

```bash
pnpm dev
pnpm build
pnpm deploy
```

前端框架用自己的 dev server 做 UI 调试；涉及 bindings、Workers runtime、Queues、D1、R2 时，用 Wrangler 或 Cloudflare Vite 插件跑更接近线上环境。D1 migration、R2 bucket、KV namespace 这些不要等到部署时报错才建。

### 上线前检查

上线前至少检查：

- `pnpm build` 能过。
- 自定义域名 DNS 已接到 Cloudflare。
- 生产密钥已通过 secrets 配好。
- D1 migration 已执行到生产库。
- R2 bucket 的 CORS、公开访问或签名 URL 策略已明确。
- 缓存规则不会缓存登录态和私有 API。
- Workers Logs 能看到新版本的请求和错误。
- 预算和 CPU limit 已设置，避免异常请求吃光额度。

### 部署和回滚

Workers 项目用：

```bash
wrangler deploy
```

Pages 项目可以走 Git 集成，也可以 Direct Upload。生产项目建议保留 GitHub Actions 或 Cloudflare Builds，让每次上线都能追到 commit。

上线后如果出问题，先不要盲改。Cloudflare 的 Workers 和 Pages 都支持版本、部署记录和回滚；先回到上一版，再用日志定位原因。对真实用户项目，回滚速度比现场修 bug 更重要。

---

## 4. 免费额度

以下数字来自 [Workers 定价页](https://developers.cloudflare.com/workers/platform/pricing/)、[Limits 文档](https://developers.cloudflare.com/workers/platform/limits/) 和各产品自己的 pricing/limits 页，按 2026 年 6 月的政策核对。

先记住一个判断方式：Cloudflare 的“免费”不是一种口径。有的服务达到 Free 上限后直接报错，有的服务 Free 可用、Paid 后继续按量计费，有的服务不按用量计费，而是跟随域名套餐、Zero Trust 计划或单独产品开通。

### 计算

| 服务 | 免费额度 | 超出后 | 关键限制 |
| --- | --- | --- | --- |
| Workers | 10 万请求/天，CPU 10ms/请求 | 报错 Error 1027，不收费 | Worker 大小 3 MB（gzip 后），50 子请求/请求，100 个 Worker/账号 |
| Workflows | 10 万 invocation/天（共享 Workers 请求），CPU 10ms/invocation，1 GB 状态存储 | 报错，需升级 Paid；Paid 后按 Workers 请求、CPU 和存储计费 | 等待、sleep、空闲时不计 CPU；Free 默认保留状态 3 天 |
| Pages 静态 | 无限请求，500 次构建/月（1 个并发） | — | 单站点 20,000 文件，单文件 25 MiB，100 自定义域名 |
| Pages Functions | 同 Workers（共享 Workers 配额） | 同 Workers | 按 Workers 计费，不是独立产品 |
| Workers Static Assets | 静态资源请求免费且无限；动态请求走 Workers 配额 | 动态部分同 Workers | 20,000 文件/Worker，单文件 25 MiB |
| Durable Objects | 10 万请求/天，13,000 GB-s/天 | 报错，需升级 Paid | Free 只能用 SQLite 后端；KV 后端必须 Paid |
| Queues | 1 万操作/天 | 报错，需升级 Paid | 单消息 128 KB；Free 保留 24h，Paid 可配最长 14 天 |
| Cron Triggers | 5 个/账号 | 需要 Workers Paid 提升到 250 个/账号 | 触发后的代码仍按 Workers 请求和 CPU 计 |
| Containers | Free 不可用 | 需要 Workers Paid，包含 25 GiB-时内存、375 vCPU-分、200 GB-时磁盘 | 适合 Workers 跑不了的长进程和原生依赖 |

### 数据与存储

| 服务 | 免费额度 | 超出后 | 关键限制 |
| --- | --- | --- | --- |
| D1 | 5 GB 存储，500 万行读取/天，10 万行写入/天 | 报错，需升级 Paid | `rows_read` 是扫描行数不是返回行数；加索引能省很多 |
| KV | 1 GB 存储，10 万读取/天，1000 写入/天 | 报错，需升级 Paid | 单 key 25 MiB；同一 key 写入 1 次/秒；最终一致不是强一致 |
| R2 | 10 GB 存储，100 万 A 类操作/月，1000 万 B 类操作/月 | **按标准价计费**：$0.015/GB-月、$4.50/M A 类、$0.36/M B 类 | 出口流量永久免费；R2 免费额度和 Workers 计划无关 |
| Hyperdrive | 10 万查询/天 | 报错，需升级 Paid（Paid 无限） | 连接已有的外部 Postgres/MySQL，不是 Cloudflare 的数据库 |
| Vectorize | 3000 万查询维度/月，500 万存储维度 | Free 内用于原型；Paid 后超出按量计费 | 按“向量数量 × 维度”算，不按文档条数算 |
| DO Storage | SQLite 后端：500 万行读取/天，10 万行写入/天，5 GB 总存储 | 报错，需升级 Paid | 和 Durable Objects 绑定；SQLite 存储计费从 2026 年 1 月开始 |
| Secrets Store | 账号级密钥管理能力，不是用量型数据库 | 按绑定服务和权限体系使用 | 用来集中管理密钥；不要把 API Key 写进代码 |
| Pipelines | Streams、SQL transforms、Sinks 各 1 GB/月 | Free 超出不可继续按量；Paid 包含 50 GB/月，之后按 GB 计费 | 写入 R2 或 R2 Data Catalog 时，对应存储费用另算 |

### 网络与安全

| 服务 | Free 口径 | 说明 |
| --- | --- | --- |
| DNS | 所有计划包含 | 常规 DNS 查询不单独计费 |
| SSL/TLS | 所有计划包含 | Universal SSL 自动签发；高级证书和企业能力另算 |
| Cache / CDN | 所有计划包含 | 静态资源缓存不额外计费；高级缓存策略随计划变化 |
| Rules | 基础规则可用 | Redirect、Cache、Configuration、Transform 等规则按类型和套餐有数量差异 |
| WAF | 基础防护可用 | 托管规则、自定义规则、Bot 等高级能力随套餐变化 |
| Rate Limiting | 基础限流能力可用 | 规则数量和高级匹配能力随套餐变化 |
| Turnstile | 免费无限 | 验证码替代方案，不按月度挑战次数收费 |
| Access | 50 用户免费 | 超过需要 Cloudflare One 订阅 |
| DDoS 防护 | 所有计划默认开启 | L3/L4/L7 防护不是按请求单独计费 |
| API Shield | 按安全能力开放 | Schema 校验、mTLS、API Discovery 等能力要看当前计划 |

### AI

| 服务 | 免费额度 | 超出后 |
| --- | --- | --- |
| Workers AI | 每天 10,000 Neurons（Free 和 Paid 都有） | Free 报错；Paid 按 $0.011/千 Neurons |
| AI Gateway | 核心能力免费；持久日志 Free 为 10 万条总量 | Paid 每个 gateway 1000 万条日志；Logpush 只在 Paid 可用 |
| Vectorize | 3000 万查询维度/月，500 万存储维度 | Paid 包含 5000 万查询维度/月、1000 万存储维度，超出按量 |
| AI Search | Open beta 期免费；Free：100 个实例、2 万查询/月、每天最多抓取 500 页 | Paid 查询不限量；Workers AI 和 AI Gateway 用量仍单独计 |
| Agents SDK | 没有单独免费额度 | 按底层 Workers、Durable Objects、D1、Vectorize、Workers AI 等资源计费 |

### 媒体

| 服务 | 免费额度 | 超出后 | 关键限制 |
| --- | --- | --- | --- |
| Images | 5000 次 unique transformations/月 | Free 新转换返回 9422，不自动收费；Paid 后 $0.50/1000 次 | Images 内置存储和交付只在 Images Paid 可用 |
| Stream | 没有固定免费分钟包 | 存储 $5/1000 分钟；交付 $1/1000 分钟 | 上传和编码免费；按视频时长计，不按文件大小计 |
| Realtime | SFU + TURN 合计 1000 GB/月免费 | $0.05/GB | 只按 Cloudflare 边缘到客户端的流量计费 |
| Browser Run | 10 分钟/天，Browser Sessions 最多 3 个并发浏览器 | Paid 包含 10 小时/月和 10 个并发浏览器，之后按量 | Quick Actions 只计浏览器时间；Browser Sessions 还计并发浏览器 |

### 观测与日志

| 服务 | 免费额度 | 超出后 | 关键限制 |
| --- | --- | --- | --- |
| Workers Logs / Observability | 20 万事件/天，保留 3 天 | Paid 包含 2000 万事件/月，保留 7 天；超出 $0.60/百万事件 | 用来排查 Worker 和 Pages Functions 运行问题 |
| Workers Logpush | Free 不可用 | Paid 包含 1000 万请求/月，之后 $0.05/百万请求 | 把 Workers Trace Events 推到外部目的地 |
| Log Explorer | 独立日志产品，不按 Workers Free 额度 | 按 Log Explorer 计费页核对 | 适合跨产品查日志，不等同于 Workers Logs |
| Web Analytics | 免费使用 | — | 看站点访问、来源和 Web Vitals，不依赖传统第三方追踪 |
| Analytics Engine | 10 万 data points/天，1 万 read queries/天 | Paid 包含 1000 万 data points/月、100 万 read queries/月 | 当前官方说明为暂不计费，价格信息用于提前估算 |
| Trace | Dashboard 排查工具 | — | 用来模拟请求命中规则、缓存、Worker、安全策略的路径 |

### 容易踩到的平台限制

这些不一定都写在定价表里，但在 [Limits 文档](https://developers.cloudflare.com/workers/platform/limits/) 或对应产品 limits 页里写得很清楚，Free 和 Paid 都适用：

| 限制 | Free | Paid |
| --- | --- | --- |
| 单 Worker 内存 | 128 MB | 128 MB |
| Subrequests/请求 | 50 | 10,000 |
| Cache API calls/请求 | 50 | 1,000 |
| 环境变量数量/Worker | 64 | 128 |
| Worker 大小（gzip 后） | 3 MB | 10 MB |
| Worker 启动时间 | 1 秒 | 1 秒 |
| 同时打开的子请求连接 | 6 | 6 |
| 单请求日志大小 | 256 KB | 256 KB |
| 每账号 Worker 数 | 100 | 500 |
| Cron Triggers/账号 | 5 | 250 |
| 静态资源文件数/Worker | 20,000 | 100,000 |
| 请求 body 大小 | 100 MB | 100 MB（受 Cloudflare 计划限制，非 Workers 计划） |

> 数字来自 Cloudflare 官方文档，可能随时调整。部署前至少核对 [Workers 定价页](https://developers.cloudflare.com/workers/platform/pricing/)、[Limits 文档](https://developers.cloudflare.com/workers/platform/limits/)、[R2 Pricing](https://developers.cloudflare.com/r2/pricing/)、[Images Pricing](https://developers.cloudflare.com/images/pricing/)、[Stream Pricing](https://developers.cloudflare.com/stream/pricing/)、[Realtime Pricing](https://developers.cloudflare.com/realtime/sfu/pricing/)、[Browser Run Pricing](https://developers.cloudflare.com/browser-run/pricing/) 和 [AI Search Limits & Pricing](https://developers.cloudflare.com/ai-search/platform/limits-pricing/)。

---

## 5. $5 套餐

Workers Paid Plan 是 Workers 平台的每账号最低月费，$5/月起，包含一组月度额度，超出后按量计费。**和 Cloudflare 的 Free/Pro/Business 计划是分开的**，可以同时持有。

### 包含的额度（按月）

| 服务 | Free | Paid ($5/月) 包含 | 超出后 |
| --- | --- | --- | --- |
| Workers 请求 | 10 万/天 | 1000 万/月 | $0.30/百万请求 |
| Workers CPU 时间 | 10ms/请求 | 3000 万 ms/月 | $0.02/百万 CPU ms |
| 单请求 CPU 上限 | 10ms | 5 分钟（默认 30s，可调） | — |
| Cron / Queue CPU 上限 | 10ms | Queue Consumer 15 分钟；Cron 30 秒（间隔 < 1 小时）或 15 分钟（间隔 >= 1 小时） | 长任务仍要控制成本和失败重试 |
| Workers Logs | 20 万事件/天，保留 3 天 | 2000 万事件/月，保留 7 天 | $0.60/百万事件 |
| Workers Logpush | 不可用 | 1000 万请求/月 | $0.05/百万请求 |
| Workflows 请求和 CPU | 同 Workers 请求和 CPU | 同 Workers 请求和 CPU | 不单独收步骤调用费 |
| Workflows 存储 | 1 GB | 1 GB | $0.20/GB-月 |
| KV 读取 | 10 万/天 | 1000 万/月 | $0.50/百万 |
| KV 写入 | 1000/天 | 100 万/月 | $5.00/百万 |
| KV 存储 | 1 GB | 1 GB | $0.50/GB-月 |
| D1 行读取 | 500 万/天 | 250 亿/月 | $0.001/百万行 |
| D1 行写入 | 10 万/天 | 5000 万/月 | $1.00/百万行 |
| D1 存储 | 5 GB | 5 GB | $0.75/GB-月 |
| Durable Objects 请求 | 10 万/天 | 100 万/月 | $0.15/百万 |
| Durable Objects 时长 | 1.3 万 GB-s/天 | 40 万 GB-s/月 | $12.50/百万 GB-s |
| DO SQLite Storage | 500 万行读取/天，10 万行写入/天，5 GB | 250 亿行读取/月，5000 万行写入/月，5 GB | 读取 $0.001/百万行，写入 $1/百万行，存储 $0.20/GB-月 |
| Queues 操作 | 1 万/天 | 100 万/月 | $0.40/百万操作 |
| Workers AI Neurons | 1 万/天 | 1 万/天（和 Free 相同） | $0.011/千 Neurons |
| AI Gateway 持久日志 | 10 万条总量 | 每个 gateway 1000 万条 | 核心网关免费；高级能力按对应产品计 |
| AI Gateway Logpush | 不可用 | 1000 万请求/月 | $0.05/百万请求 |
| AI Search 查询 | 2 万/月 | 不限量（open beta） | Workers AI 和 AI Gateway 另算 |
| AI Search 实例 | 100 个/账号 | 5000 个/账号 | open beta 期免费 |
| AI Search 文件和抓取 | 每实例 10 万文件；每天最多抓取 500 页 | 每实例 100 万文件，hybrid search 为 50 万；抓取不限量 | 单文件最大 4 MB |
| Vectorize 查询维度 | 3000 万/月 | 5000 万/月 | $0.01/百万 |
| Vectorize 存储维度 | 500 万 | 1000 万 | $0.05/1 亿 |
| Hyperdrive 查询 | 10 万/天 | 无限 | — |
| Pipelines | Streams / SQL transforms / Sinks 各 1 GB/月 | Streams 不限量；SQL transforms 和 Sinks 各 50 GB/月 | SQL transforms $0.04/GB；Sinks 按格式 $0.03-$0.06/GB |
| Analytics Engine | 10 万 data points/天，1 万 read queries/天 | 1000 万 data points/月，100 万 read queries/月 | 当前暂不计费，官方价格用于提前估算 |
| Browser Run | 10 分钟/天，3 并发浏览器 | 10 小时/月，10 并发浏览器 | $0.09/小时；并发浏览器 $2/个 |
| Containers | 不可用 | 25 GiB-时内存、375 vCPU-分、200 GB-时盘 | 按量 |
| Containers 出口流量 | 不可用 | 北美/欧洲 1 TB；大洋洲、韩国、台湾 500 GB；其他地区 500 GB | 超出按地区 $0.025-$0.05/GB |

### 同时提升的平台上限

| 上限 | Free | Paid ($5/月) |
| --- | --- | --- |
| 单 Worker gzip 后大小 | 3 MB | 10 MB |
| Workers 数量/账号 | 100 | 500 |
| Cron Triggers/账号 | 5 | 250 |
| Static Assets 文件数/Worker version | 20,000 | 100,000 |
| Subrequests/请求 | 50 | 10,000 |
| Cache API calls/请求 | 50 | 1,000 |
| 环境变量数量/Worker | 64 | 128 |

几个关键点：

- **R2 的免费额度和 Workers 计划无关**。所有人都能用 10 GB 存储 + 100 万 A 类 + 1000 万 B 类操作，不管买不买 $5 套餐。超出按 $0.015/GB-月、$4.50/M A 类、$0.36/M B 类算。
- **普通 Workers 不收出口流量费**。Workers 自身没有额外数据传输费用；但 Containers 有独立的出口流量额度和按量价格，不能混着算。
- **Pages 静态请求永远免费无限**。只有 Pages Functions 走 Workers 配额。
- **静态资源请求不计入 Workers 请求配额**，即使跑在 Workers Static Assets 上。
- **Service Bindings 不额外计请求费**。一个 Worker 通过 Service Binding 调另一个 Worker，不会因为内部拆分多收一次请求费。
- **Workers AI 的 1 万 Neurons/天 在 Free 和 Paid 一样**。Paid 的好处是超出后能继续用并按量付费，Free 超出直接报错。
- **Vectorize 的 Free 和 Paid 额度不同**。Free 适合原型，Paid 包含更高的查询维度和存储维度额度。
- **Durable Objects 的 SQLite 存储从 2026 年 1 月开始计费**。它按 D1 类似的 rows read / rows written / storage 口径算。
- **Images、Stream、Realtime 不是 Workers Paid 套餐的一部分**。它们有自己的免费额度或独立价格，不要和 $5 套餐混在一起算。

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
- 需要更高的平台上限（Worker 包大小、subrequests、Cron Triggers、Static Assets 文件数）
- 需要完整的 Workers Logs 排查问题（7 天保留 vs 3 天）
- 需要用 Durable Objects 的 KV 后端、Workers Logpush、Containers、Browser Run、更多 AI Search 查询或更高的 Pipelines 额度
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

### 把 Workers 当 Node.js 服务器

Workers 是 Web runtime，不是常驻 Node.js 进程。不要默认可以用本地文件系统、长连接数据库池、后台常驻线程或所有 Node 包。能用 Fetch、Web Crypto、URL、Streams 这类 Web API 就用 Web API；确实需要 Node 兼容时，先查 [Node.js compatibility](https://developers.cloudflare.com/workers/runtime-apis/nodejs/)。

### CPU 时间和等待时间搞混

等待外部 API、D1、R2、KV 的网络时间通常不算 CPU；真正算 CPU 的是代码执行。解析大 JSON、图片处理、PDF 生成、加密压缩、复杂 SSR 才容易撞 CPU。Free 只有 10ms CPU，重活不要硬塞进同步请求。

### D1 rows_read 被低估

D1 计费看扫描行数，不是返回行数。没有索引的查询，即使只返回一条，也可能扫完整张表。列表页、搜索页、后台筛选页上线前先看索引。

### KV 被当成主数据库

KV 是最终一致，适合读多写少的配置、缓存、短链映射。余额、库存、权限、订单状态、实时计数不要放 KV。需要强一致就用 D1 或 Durable Objects。

### R2 只存文件，不管业务关系

R2 是对象存储。文件归属、权限、状态、标题、标签、审核结果应该放 D1，R2 只放文件本体。公开下载要想清楚 public bucket、签名 URL、Worker 代理三种方式的区别。

### 缓存了不该缓存的内容

静态资源可以大胆缓存；登录后的页面、带 Cookie 的 API、用户私有数据不要乱缓存。Cache Rules 和 Worker `cacheTtl` 都要按路径分开写，不能一条规则覆盖整个站。

### Pages Functions 和 Workers 配额分开理解

Pages 静态请求免费无限，但 Pages Functions 按 Workers 计费和限制。一个 Pages 项目如果开始写后端逻辑，就要按 Workers 的 CPU、请求数、subrequests、日志额度来估算。

### Cron 默认不是业务时区

Cron Triggers 按 cron 表达式定时触发，实际业务经常要按用户时区、自然日、节假日处理。不要把“每天 0 点”写死成业务逻辑，最好在任务里显式处理时区。

### Queues 消费要幂等

异步队列要按“可能重试”设计。发邮件、扣库存、写订单状态时，要有任务 ID、幂等键或状态检查。否则一次重试就可能重复发送或重复写入。

### Durable Objects 长连接忘了 hibernation

Durable Objects 很适合 WebSocket 和房间状态，但长连接会影响 duration 成本。聊天室、协作、游戏房间要优先看 WebSocket Hibernation，别让空闲连接一直烧 duration。

### AI Gateway 记录了不该记录的内容

AI Gateway 很适合观测、缓存和限流，但 prompt、response、metadata 可能包含用户隐私或商业数据。生产环境要明确日志保留、脱敏策略、缓存策略和访问权限。

### Browser Run 不是万能爬虫

Browser Run 适合截图、PDF、渲染检查和自己有权限访问的页面自动化。普通 HTML 生成不要上无头浏览器；也不要拿它绕过登录、付费墙或网站限制。

---

## 8. 国内访问

Cloudflare 免费全球网络不等于中国大陆加速。大陆访问质量受运营商、线路、DNS、监管和目标服务形态影响，不能只看海外测速。

### 先分清两件事

Cloudflare 普通 Free/Pro/Business 网络，可以服务全球用户，但不保证中国大陆访问稳定。Cloudflare 的 [China Network](https://developers.cloudflare.com/china-network/) 是企业级能力，通过 Cloudflare 和京东云数据中心服务中国大陆访问，接入前需要企业计划和对应配置。

如果网站面向中国大陆正式运营，还要考虑 ICP。Cloudflare China Network 文档里单独列了 [ICP](https://developers.cloudflare.com/china-network/concepts/icp/) 概念：在中国大陆运营网站通常需要取得并展示 ICP 备案/许可证编号。

### 普通项目怎么做

个人文档、开源项目、工具站可以先这样处理：

- 用自己的域名，不要只给 `workers.dev` 或 `pages.dev`。
- 页面尽量静态化，减少首屏 API 依赖。
- 字体、图片、JS 不要依赖一堆第三方域名。
- 图片压缩，静态资源文件不要过大。
- 给关键资源设置清楚的缓存策略。
- 用国内外多地监控看真实可用性，不只看自己电脑。
- 如果中国大陆是核心用户，准备国内镜像或符合要求的国内部署方案。

### 不要这样做

不要承诺“Cloudflare 一定能让国内访问很快”。不要把生产业务只押在 `workers.dev`、`pages.dev` 或未验证的单线路访问上。不要为了加速绕开备案、许可证或内容合规要求。

### 推荐判断

如果中国大陆只是少量读者，Cloudflare 免费方案通常可以先用，重点是保持页面轻、依赖少、可缓存。如果中国大陆是主要市场，就不要把它当作普通 CDN 问题，要按“域名、备案、合规、国内网络、海外网络、备份线路”一起设计。

---

## 9. 排查问题

排查 Cloudflare 问题，先把问题定位到层级：DNS、TLS、Rules/Cache/WAF、Worker 代码、绑定资源、源站。不要一上来就改代码。

### 先收集信息

每次排查先保存这些信息：

- 出问题的完整 URL。
- 发生时间和时区。
- HTTP 状态码。
- `cf-ray` 或 Ray ID。
- 是否只在某个地区、运营商、浏览器、登录态出现。
- 最近一次部署 commit 和 Cloudflare deployment/version。
- 是否命中缓存、WAF、Rate Limiting、Access 或 Worker。

本地快速看响应头：

```bash
curl -I https://example.com/path
```

### 分层排查

DNS 问题先看 NS 是否已经切到 Cloudflare、记录是橙云还是灰云、CNAME/A/AAAA 是否正确。`1016` 常见于 origin DNS 解析失败。

TLS 问题先看 SSL/TLS 模式。自建源站建议用 `Full (strict)`，源站证书必须有效。`525`、`526` 通常和源站 TLS 握手或证书校验有关。

缓存问题先看 `cf-cache-status`、Cache Rules、响应头里的 `cache-control`。如果登录态页面被缓存，先 purge，再改规则。

安全拦截先看 Security Events、WAF、Rate Limiting、Bot、Access。`1020` 通常是 Cloudflare 安全规则拦截。

Worker 运行时报错先看 Workers Logs。`1101` 多半是代码异常，`1102` 是 CPU 超限，`1027` 是 Free 请求额度耗尽。

源站问题看 `520`、`521`、`522`、`523`、`524`。这些通常不是 Worker 语法问题，而是源站连接、超时、DNS 或 TLS。

### 工具顺序

先用 Dashboard 里的 Metrics 看错误率和状态码，再用 Workers Logs 看具体异常。请求路径和规则不符合预期时，用 Trace。需要跨产品查日志时，用 Log Explorer。怀疑平台问题时，先看 [Cloudflare Status](https://www.cloudflarestatus.com/)。

常用命令：

```bash
wrangler tail
wrangler deployments list
wrangler rollback
```

生产环境不要只看本地 dev。很多问题只会在线上 bindings、真实域名、真实 TLS、真实缓存规则下出现。

---

## 10. 完整案例

### 静态文档站

适合 README、知识库、产品文档、个人博客。

组合：VitePress / Astro / Docusaurus + Pages 或 Workers Static Assets + Web Analytics + Cache Rules。

上线顺序：

1. 构建成静态文件。
2. 部署到 Pages 或 Workers Static Assets。
3. 绑定自定义域名。
4. 开 Web Analytics。
5. 给静态资源设置长期缓存，HTML 保持较短缓存或默认策略。

这个模式成本最低，静态请求免费无限，适合作为 Cloudflare 入门项目。

### API 和 Webhook 服务

适合支付回调、GitHub webhook、MCP Server、轻量后端接口。

组合：Workers + Hono/原生 Fetch + D1/KV + Queues + Rate Limiting + Workers Logs。

上线顺序：

1. Worker 先实现健康检查和核心路由。
2. Webhook secret 放进 Workers secrets。
3. 请求先写 D1 或投递 Queues，耗时任务异步处理。
4. 对公开路径加限流。
5. 用 Workers Logs 验证真实请求。

这个模式的关键是快进快出，不让用户请求等后台重活。

### 全栈工具或 SaaS 原型

适合管理后台、内部工具、订阅产品、轻量 CRM。

组合：Workers Static Assets + Workers API + D1 + R2 + Turnstile + Access + Queues。

上线顺序：

1. 前端静态资源和 API 放同一个 Worker 项目。
2. 用户、权限、业务表放 D1。
3. 上传文件放 R2，元数据放 D1。
4. 内部后台用 Access，公开注册/表单用 Turnstile。
5. 邮件、导出、AI 生成等任务放 Queues。
6. 有真实用户后升级 Workers Paid，拿更高 CPU、日志和平台上限。

这个模式适合 vibe coding 快速验证，但要尽早把鉴权、数据库索引和备份想清楚。

### 图床和文件分享

适合图片上传、附件分发、公开下载、私有文件分享。

组合：Workers + R2 + D1 + Images + Signed URL / Access。

上线顺序：

1. R2 存文件本体。
2. D1 存文件归属、权限、大小、hash、状态。
3. Worker 负责上传鉴权和下载鉴权。
4. 图片展示接 Images 做裁剪、压缩、格式转换。
5. 私有文件不要直接公开 bucket，用 Worker 或签名 URL 控制访问。

这个模式不要把权限写在 R2 object key 里，权限应该是业务数据。

### AI Agent / RAG 应用

适合知识库问答、客服助手、个人助理、自动化工作流。

组合：Workers + Agents SDK + Durable Objects + Workers AI / 外部模型 + AI Gateway + Vectorize + R2/D1。

上线顺序：

1. 原文放 R2 或 D1。
2. 切块后 embedding 放 Vectorize。
3. 模型调用统一走 AI Gateway。
4. Agent 会话状态放 Durable Objects。
5. 长流程用 Workflows，后台处理用 Queues。
6. 记录每次检索、模型、token、延迟和错误，方便以后优化成本。

这个模式最容易成本失控。先做小数据集和小模型验证，再扩展索引和上下文窗口。

### 实时协作和聊天室

适合聊天室、协作文档、在线白板、轻量多人状态。

组合：Workers + Durable Objects + WebSocket + DO Storage。涉及音视频时，再加 Realtime。

上线顺序：

1. 每个房间或文档对应一个 Durable Object。
2. WebSocket 连接进房间对象。
3. 房间状态和快照放 DO Storage。
4. 高频广播尽量只传增量。
5. 空闲连接用 WebSocket Hibernation 降低成本。

文字协作和音视频不是一回事。普通 WebSocket 不等于实时音视频；音视频会议、连麦、NAT 穿透和 SFU 要看 Realtime。

### 状态页和监控

适合 uptime 监控、接口探活、状态页、告警机器人。

组合：Cron Triggers + Workers + Queues + D1/KV + Webhook/Email + Analytics Engine。

上线顺序：

1. Cron 定时触发探测。
2. 探测结果写 D1。
3. 状态页读缓存后的聚合结果。
4. 异常通知放 Queues，避免探测任务阻塞。
5. 自定义指标写 Analytics Engine。

这个模式要注意 Cron 频率、请求量和告警去重。监控系统自己也要有降噪逻辑。

---

## 官方资源

| 资源 | 用法 |
| --- | --- |
| [Workers Best Practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/) | 查 Workers 官方最佳实践 |
| [Workers Examples](https://developers.cloudflare.com/workers/examples/) | 找单点功能示例 |
| [create-cloudflare](https://developers.cloudflare.com/pages/get-started/c3/) | 用官方脚手架创建新项目 |
| [Workers Bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/) | 查 D1、R2、KV、Queues、AI 等绑定写法 |
| [Workers Limits](https://developers.cloudflare.com/workers/platform/limits/) | 查 CPU、subrequests、包大小、静态资源等平台限制 |
| [Wrangler](https://developers.cloudflare.com/workers/wrangler/) | 查本地开发、资源管理和部署命令 |
| [Pages](https://developers.cloudflare.com/pages/) | 查静态站和 Pages Functions 部署方式 |
| [China Network](https://developers.cloudflare.com/china-network/) | 查中国大陆网络和 ICP 相关要求 |
| [Cloudflare Support](https://developers.cloudflare.com/support/) | 查错误码、DNS、TLS、缓存和源站排查 |
| [Log Explorer](https://developers.cloudflare.com/logs/log-explorer/) | 查跨产品日志查询能力 |
| [AI Gateway](https://developers.cloudflare.com/ai-gateway/) | 查模型调用观测、缓存和日志策略 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | 找官方起步模板 |
| [cloudflare/agents](https://github.com/cloudflare/agents) | 看 Agents SDK 官方示例 |
| [Cloudflare Pricing](https://developers.cloudflare.com/workers/platform/pricing/) | 查最新定价和免费额度 |
