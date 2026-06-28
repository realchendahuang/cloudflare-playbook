---
title: Cloudflare Email
outline: deep
---

<script setup>
import { Mail, Send, Inbox, Shield, Gauge, AlertTriangle, Link, Brain, ListFilter, Network, Rocket, Bot } from '@lucide/vue'
</script>

<section class="onepage-hero">
  <p class="onepage-kicker">Email</p>
  <h1 class="onepage-title">Cloudflare Email</h1>
  <p class="onepage-subtitle">Cloudflare 的邮件收发服务——出站 Email Sending 发送事务邮件（Public Beta，需 Workers Paid），入站 Email Routing 把邮件交给 Workers 处理或转发邮箱（GA，Free 可用）。自动 DKIM/SPF/DMARC 对齐、托管 IP 声誉、退信自动重试与抑制。因为入站处理程序就是 Workers，能直接调 Workers AI、R2、Queues、Durable Objects，所以"邮件 + AI Agent"是它在发布期主推的一个用例方向。</p>
</section>

<div class="quick-grid">
  <a href="#邮件在-agent-体系里的角色"><div class="card-icon"><Brain /></div><div class="card-body"><strong>邮件与 Agent</strong><span>发布期主推的用例方向</span></div></a>
  <a href="#产品定位"><div class="card-icon"><Mail /></div><div class="card-body"><strong>产品定位</strong><span>Sending + Routing 统一入口</span></div></a>
  <a href="#三种发送方式怎么选"><div class="card-icon"><Send /></div><div class="card-body"><strong>三种发送方式</strong><span>Binding / REST / SMTP 怎么选</span></div></a>
  <a href="#接收-email-routing--email-workers"><div class="card-icon"><Inbox /></div><div class="card-body"><strong>接收 + Email Workers</strong><span>收信即触发 Agent</span></div></a>
  <a href="#agent-能拿邮件做什么"><div class="card-icon"><Bot /></div><div class="card-body"><strong>Agent 能做什么</strong><span>分类/总结/自动回复/存档</span></div></a>
  <a href="#deliverability-自动化"><div class="card-icon"><Gauge /></div><div class="card-body"><strong>Deliverability</strong><span>声誉、退信、子域隔离</span></div></a>
  <a href="#坑与避坑"><div class="card-icon"><AlertTriangle /></div><div class="card-body"><strong>坑与避坑</strong><span>会踩的边界和误判</span></div></a>
  <a href="#dns-与-postmaster-要知道的事"><div class="card-icon"><Shield /></div><div class="card-body"><strong>DNS / Postmaster</strong><span>DKIM selector 差异、IP 段</span></div></a>
  <a href="#限制总表"><div class="card-icon"><ListFilter /></div><div class="card-body"><strong>限制总表</strong><span>大小、收件人、规则数</span></div></a>
  <a href="#开源项目与生态"><div class="card-icon"><Network /></div><div class="card-body"><strong>开源项目</strong><span>可一键部署的邮件 Agent</span></div></a>
  <a href="#起步路径"><div class="card-icon"><Rocket /></div><div class="card-body"><strong>起步路径</strong><span>子域 → Binding → AI 路由</span></div></a>
  <a href="#官方资源"><div class="card-icon"><Link /></div><div class="card-body"><strong>官方资源</strong><span>文档、博客、示例</span></div></a>
</div>

## 邮件在 Agent 体系里的角色

先说清楚边界：Cloudflare Email Service 的**基础定位是邮件收发基础设施**（官方文档原话："Send transactional emails and route incoming emails to Workers or email addresses"），事务邮件、认证邮件、通知、自定义地址这些都是它的常规用法。

但 Cloudflare 在 2026 年 4 月 Email Service 公测发布时（Agents Week），明确把"邮件 + Agent"作为主推方向。发布博客标题就是 "Cloudflare Email Service: now in public beta. **Ready for your agents**"，原话：

> "Email is the most accessible interface in the world. It is ubiquitous. There's no need for a custom chat application, no custom SDK for each channel. Everyone already has an email address."
> "With Email Routing, you can receive email to your application or agent. With Email Sending, you can reply to emails or send outbounds to notify your users when your agents are done doing work."
> "Email is becoming a core interface for agents, and developers need infrastructure purpose-built for it."

之所以邮件适合 Agent，官方给的几个理由：

- **不用让用户装任何客户端**——邮件地址全世界都有，Agent 不需要为每个渠道做 SDK。
- **入站邮件直接触发 Worker**——等于一个自带协议解析的入口，地址模式还能做路由（`support@` 走客服、`agent+user123@` 走某个实例）。
- **异步天然合适**——Agent 可以跑很久再回，可以调度后续，这点比实时聊天更适合 Agent 的节奏。
- **收发在同一平台闭环**——Email Routing 收、Workers AI 处理、Email Sending 回，不跨服务不跨鉴权。

需要分清的是：这是官方在发布期主推的**用例方向**和一个参考实现（agentic-inbox），不是说 Email Service 只有 Agent 这一种用法。下面既讲邮件服务本身的能力与边界，也讲它和 Agent 结合这个方向怎么落地。

来源：[Email for Agents 发布博客](https://blog.cloudflare.com/email-for-agents/)、[Email Service 文档](https://developers.cloudflare.com/email-service/)。

---

## 产品定位

Cloudflare Email Service 把"发信"和"收信"合并到 Dashboard 同一个入口（**Compute → Email Service**）管理，底层共用一套 DNS、认证和投递基础设施。两个方向独立成熟度：

| 方向 | 产品 | 状态 | 计划 |
| --- | --- | --- | --- |
| 出站（发送） | Email Sending | Public Beta（2026 年 6 月） | Workers **Paid** |
| 入站（接收） | Email Routing | GA | Free 和 Paid 都可用 |

一个常被忽略的免费点：**发送给你已验证的目标地址（verified destination addresses）在所有计划上都免费**，包括 Free。只有"发送给任意外部地址"才需要 Workers Paid。这意味着本地开发、自测、给团队成员发信这条链路零成本。

和 Cloudflare 其它产品的关系一句话：**Email Sending 是 Workers 的一种 binding，Email Workers 是 Email Routing 的处理程序**——两件事都长在 Workers 体系里，能直接调 R2、Queues、Workers AI、D1、Durable Objects，不需要跨服务鉴权。这是"邮件 + AI 全链路闭环"能成立的底层原因。

---

## 三种发送方式怎么选

三种发送方式走的是**同一条投递管线**，差别只在"邮件怎么进管线"——附件、自定义 header、DKIM 签名这些能力三种方式都一致，区别在认证方式、集成形态和适用场景。具体代码 AI 会写，这里只讲怎么选。

| 方式 | 推荐场景 | 认证 | 集成形态 | 计划 |
| --- | --- | --- | --- | --- |
| **Workers Binding** | 新 Workers 项目、Agent | 无需 Key（binding 直连） | `env.EMAIL.send()` | Paid |
| **REST API** | 任意后端（Node/Python/Go） | API Token（Bearer） | HTTP POST，有官方三语言 SDK | Paid |
| **SMTP** | 遗留系统、传统邮件客户端 | API Token（用户名 `api_token`） | `smtps://smtp.mx.cloudflare.net:465` | Paid |

选型判断：

- **新项目和 Agent 首选 Workers Binding。** 不用管 API Token 轮换和鉴权头，binding 在 wrangler 里声明完代码里直接调，和调 R2、D1 一样自然。Agent 发邮件几乎只能走这条——`@cloudflare/think` 和 Agentic Inbox 都用 binding。
- **非 Workers 后端用 REST API。** 有官方 Node/Python/Go SDK，比手撸 SMTP 可靠。需要管 Token 权限和轮换。
- **SMTP 只在"代码改不动"时用。** 老系统、第三方邮件客户端、CMS 插件这类只能填 SMTP 参数的场景。功能不弱（附件、自定义 header 都支持），但连接方式最传统，且**只支持 465 Implicit TLS**，填 587 / 25 都连不上。

三种方式的字段能力一致（`to`/`from`/`subject`/`html`/`text`/`cc`/`bcc`/`replyTo`/`attachments`/`headers`），所以业务侧逻辑可以在三种方式之间无缝切换，不会因为换发送方式丢功能。

---

## 接收：Email Routing + Email Workers

入站这一侧由 Email Routing 负责——把发到你域名的邮件按规则交给 Email Worker 处理。已经 GA，Free 也能用。对 Agent 来说，这一步是"邮件变成触发事件"的关键。

### 入口与规则

- 统一入口：Dashboard → **Compute → Email Service**（Routing 和 Sending 在一起管理）。
- 支持自定义地址 + Catch-all 规则，**每域名最多 200 条规则**，每条把一个邮件模式映射到一个目标。
- 每账户最多 200 个目标地址（verified destination addresses），全域名共享。
- 每区域（zone）最多 30 个域名启用 Email（Routing + Sending 合计，含根域）。

### Email Worker：邮件变成代码事件

Email Worker 是一个 Workers，导出一个 `email()` 处理函数——签名和 `fetch()` 同级。一封邮件进来，Cloudflare 把解析好的邮件对象交给这个函数：收发地址、headers、原始 MIME 流、字节数。函数里可以做四类动作：

| 动作 | 含义 | 注意 |
| --- | --- | --- |
| **解析** | 用 PostalMime 把原始 MIME 解成 text/html/附件 | `message.raw` 是流，要解析才能用 |
| **转发** `forward()` | 把原邮件转发到验证过的目标地址 | 只能加 `X-` 前缀的自定义 header |
| **回复** `reply()` | 给原发件人回一封新邮件，线程化 | 限制最硬，见下 |
| **拒收** `setReject()` | 拒掉这封邮件 |  |

`reply()` 的硬限制（违反就抛异常，别让 AI 自由发挥）：

- 原邮件必须通过 **DMARC 验证**——防伪造发件人。
- **每次 `email()` 事件只能 reply 一次**——想发多封要自己用出站 binding 发。
- 回复收件人必须等于原邮件发件人，回复发件域必须等于收信域。
- 原邮件 `References` 头不能超过 100 条（长线程会被拒）。

转发和回复是两件不同的事：转发是把原邮件搬到另一个邮箱（归档/备份/人工接管），回复是给原发件人发新邮件（Agent 自动回复用户）。Agent 自动回复走 `reply()`，人工接管走 `forward()`，别混。

### 用邮件地址给 Agent 路由

这是 Email Routing 给 Agent 体系最值钱的能力。不用给每个 Agent 单独配入口，一个域名就能铺开：

| 地址模式 | 路由到 |
| --- | --- |
| `support@yourdomain.com` | 客服 Agent 实例 |
| `sales@yourdomain.com` | 销售 Agent 实例 |
| `agent+user123@yourdomain.com` | 子地址路由到某个具体 Agent 实例 |

子地址（`+` 后缀）是关键——同一个 Agent 入口，用子地址区分不同用户/会话/任务，邮件路由层就解决了"哪封邮件给哪个 Agent 实例"，不用在代码里再分发。

来源：[Email Routing](https://developers.cloudflare.com/email-routing/)、[Email Workers](https://developers.cloudflare.com/email-routing/email-workers/)。

---

## Agent 能拿邮件做什么

把上面几节拼起来，从 Agent 视角看邮件能撑起哪些工作流。不同形态的取舍比 API 细节更值得想清楚。

### 邮件即工单（Email as Ticket）

一封邮件进来 → Email Worker 触发 → Workers AI 分类（投诉/咨询/bug/销售线索）→ 按分类路由到对应处理流程 → Durable Object 持久化会话状态 → 必要时 `reply()` 自动回复、`forward()` 升级人工。整个工单系统的入口就是 `support@yourdomain.com`，用户不用学任何新工具。

关键点：**收件箱就是 Agent 的记忆**。用 Durable Object 存每个会话，后续邮件进来 Agent 能接上之前上下文，不用单独建向量库存历史。这是 Cloudflare 官方明确推荐的模式。

### 邮件即定时任务触发器

邮件不一定是用户发的——监控、定时报告、外部 webhook 都可以发邮件到一个 Agent 地址。Agent 收到 → 解析内容 → 决定动作。比如 `reports@yourdomain.com` 收到每日销售报表邮件 → Agent 提取数据 → 生成总结 → 发到指定的个人邮箱。用邮件当粘合层，比配一堆 webhook 简单。

### 邮件即 AI 互动通道

学习助手、写作教练、个人助理这类 Agent，让用户直接发邮件给 `tutor@yourdomain.com` → Agent 解析题目/需求 → Workers AI 生成回复 → `reply()` 回邮件。用户不需要装 app、不需要开网页、不需要学任何接口——邮件客户端全世界都有。这是"AI Native 但零学习成本"的形态。

### 附件即数据

Email Worker 能解出附件，直接存 R2、入库 D1、入 Queues 做异步处理。典型场景：用户发邮件附一张发票/一份文档 → Agent 提取 → Workers AI 或 OCR 处理 → 结构化结果存 D1 → 回复确认。附件处理不阻塞 SMTP 会话的做法是入 Queues，让消费者 Worker 慢慢处理。

### 出站：Agent 主动发邮件

Agent 不只是被动收，也能主动发——跑完一个长任务后发通知、定时发周报、检测到异常发告警。出站用 Workers Binding，没有 API Key 管理负担。和 Agents SDK 的调度能力结合（`getScheduledTasks`），Agent 可以"每周一 9 点发上周总结到 owner@yourdomain.com"，全在 Cloudflare 内。

### 给外部 Agent 暴露邮箱（MCP）

Cloudflare 把邮件能力做进了 MCP server——外部 AI 工具（Claude Code、Cursor、Copilot 等）可以通过 MCP 发现并调用邮件 API。也就是说部署在 Cloudflare 的邮箱能被本地编程 Agent 当工具用：Agent 在 build 完成后直接调邮件 MCP 端点发通知，无需自己配 SMTP。这是把 Cloudflare 邮箱变成**整个 AI 工具链的共享发件通道**。

来源：[Email for Agents 博客](https://blog.cloudflare.com/email-for-agents/)、[cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox)。

---

## Deliverability 自动化

投递能力是 Email Service 默认就帮你做掉的一大块，不需要自己维护 IP 声誉、退信逻辑、投诉回路。对 Agent 场景尤其重要——Agent 自动发信量大、内容模式固定，更容易触发 ISP 的垃圾邮件启发式，靠 Cloudflare 托管声誉比自己搞稳得多。

Cloudflare 自动处理：

- **DKIM 签名 + ARC**：所有出站邮件自动签名。
- **SPF / DKIM / DMARC 对齐**：保证 DMARC 通过。
- **托管 IP 声誉 + 全球边缘投递**：共享 Cloudflare 的发送基础设施，低延迟。
- **Soft bounce 指数退避重试**：邮箱满、对端临时不可用、限流 / greylisting 这类自动重试。
- **Hard bounce 立即抑制**：不存在地址、不存在域、对端永久拒绝、内容被判垃圾——不重试，直接进 suppression list。
- **ISP 投诉处理**：通过 Feedback Loop 自动收投诉并抑制相关地址。

### 推荐指标

官方给的健康线，超过会影响后续投递：

| 指标 | 健康线 |
| --- | --- |
| 投递率 | > 95% |
| 硬退信率 | < 2% |
| 投诉率 | < 0.1% |

### 子域隔离

**事务邮件和营销邮件用不同子域**，让一类邮件的声誉不连累另一类。官方范本：

| 子域 | 用途 |
| --- | --- |
| `notifications.yourdomain.com` | 事务邮件（订单、密码重置、Agent 通知） |
| `marketing.yourdomain.com` | 营销 / 推广 |
| `yourdomain.com` | 重要账户通信 |

Agent 自动发的邮件本质上也是事务邮件，归到 `notifications` 子域。营销邮件投诉率天然偏高，隔离出去才不会把 Agent 的订单确认 / 工单回复也拖进垃圾箱。

### 新域名 warmup

新账户有保守的每日发送配额，会随发送行为、投递率、账户信誉逐步上调。新发送域建议从小流量开始，单独 onboard，逐步放量，别一上来就批量发。

来源：[Deliverability 文档](https://developers.cloudflare.com/email-service/concepts/deliverability/)。

---

## Bounce 与 Suppression List

退信分两类，处理方式不同，Agent 自动发信时要知道这个机制——否则会出现"明明地址是对的，邮件就是发不出去"，因为地址早被自动抑制了。

| 类型 | 含义 | 处理 |
| --- | --- | --- |
| **Soft bounce** | 临时失败（邮箱满、对端临时不可用、限流） | 指数退避自动重试 |
| **Hard bounce** | 永久失败（不存在地址 / 域、对端永久拒绝、被判垃圾） | 不重试，地址自动进 suppression list |

Suppression List 的规矩：

- Hard bounce 产生的抑制是自动的，保护发件声誉。
- ISP 垃圾投诉产生的抑制通过 Postmaster 集成自动入列，**这类抑制的移除受限**，防止滥用。
- 你可以手动添加 / 移除地址，但 spam 投诉类的不一定能手动移除。
- 建议每月 review 一次 suppression list。

Agent 场景的坑：用户改了邮箱、或者某次软退信后被错误抑制，Agent 会一直"发不出去"却不知道为什么。排查路径是先看 Dashboard 投递事件确认是否在 suppression list，再决定是否手动移除。

---

## 坑与避坑

这一节单独拎出来，是 Agent 用邮件最容易踩的边界。

### 1. SMTP 只认 465，587/25/STARTTLS 全连不上

遗留系统接 SMTP 时最常踩的坑——填 587（STARTTLS）或 25 都连不上。Cloudflare 只开 **465 Implicit TLS** 一种。用户名固定写 `api_token`（字面量，不是邮箱不是 Token ID），密码是 API Token（需 Email Sending: Edit 权限）。老客户端如果只支持 587 STARTTLS 不支持 465 SMTPS，得换客户端或用 REST API 中转。

### 2. 发送域必须先 Onboard

`from` 的域名必须在 Dashboard → Email Service → Email Sending 里 Onboard 过，否则 SMTP 返回 `550 5.7.1`、Binding 抛 `E_SENDER_NOT_VERIFIED`。常见于"域名 DNS 都配好了但忘了点 Onboard"。

### 3. `reply()` 一次事件只能回一封

想让 Agent 收一封邮件后回多封（比如先回确认、再回结果）——`reply()` 做不到，每次 `email()` 事件只能 reply 一次。要多封得自己用出站 binding 发，别在 `reply()` 里硬塞。

### 4. 收件人 50 是 to+cc+bcc 合计

不是每个字段各 50，是三个字段加起来 ≤ 50。群发场景要拆批次，或者用 Queues 异步逐封发。

### 5. 附件有 32 个上限，总大小 5 MiB

标准出站 5 MiB 含附件和 MIME 编码——别按"原始附件 5MB"算，MIME 编码会膨胀约 33%。只有发给已验证目标地址才能到 25 MiB。Agent 自动带附件发信时尤其注意，附件多了用 R2 存链接而不是塞邮件。

### 6. SPF 放行段是 /19，不是 SPF 记录里的 /20

收件方 IT 加白名单时，SPF 记录里写的是 `104.30.0.0/20`，但官方文档化的出站前缀是 `104.30.0.0/19`。只放行 /20 会漏掉部分出站 IP，导致"有些邮件能收到有些收不到"。给 IT 的话术：放行 /19。

### 7. DKIM selector 发送和接收不一样

排查"邮件为什么没签名成功"时别查错 selector。Email Sending 用 `cf-bounce._domainkey`，Email Routing 用 `cf2024-1._domainkey`。dig 验证时按产品查对应的那个。

### 8. Agentic Inbox 没有每邮箱授权

部署 Agentic Inbox 做团队邮箱时要注意：它**没有 per-mailbox 授权**——任何通过 Cloudflare Access 策略的人能访问所有邮箱。Access 策略是唯一信任边界。多人场景要么每人一套独立部署，要么接受"全员可读所有邮箱"。

### 9. `reply()` 要 DMARC 通过

伪造发件人的邮件（DMARC 失败）不能 `reply()`。这是防垃圾的特性，但也意味着真实用户的邮件如果 DMARC 配置有问题（少见但存在），Agent 回不了。排查时看原邮件 DMARC 结果。

### 10. 每日发送配额不公开

新账户配额保守、随信誉增长，但**官方没公布具体数字**。Agent 自动发信上量前先小流量测，别一上来就批量发触发限额。

---

## DNS 与 Postmaster 要知道的事

Onboard 发送域时 Cloudflare 会自动加这些记录，但搞清楚值和差异，排查投递问题、向收件方 IT 解释时用得上。具体记录 AI 会配，这里讲"有什么、差异在哪"。

### DKIM selector 差异

Email Sending 和 Email Routing 用**不同的 DKIM selector**，dig 时别查错：

| 产品 | DKIM selector |
| --- | --- |
| Email Sending | `cf-bounce._domainkey` |
| Email Routing | `cf2024-1._domainkey` |

Email Routing 转发时还会用 `email.cloudflare.net` 的重写签名（Sender Rewriting，保护 SPF）。

### SPF

两边都 include 同一个目标，但配在不同层级：

| 产品 | SPF 配在哪 | 记录 |
| --- | --- | --- |
| Email Sending | `cf-bounce` 子域 | `v=spf1 include:_spf.mx.cloudflare.net ~all` |
| Email Routing | 根域 | `v=spf1 include:_spf.mx.cloudflare.net ~all` |

`_spf.mx.cloudflare.net` 底层是 `v=spf1 ip4:104.30.0.0/20 ~all`。

### Outbound 主机名与 IP 段

出站 `HELO/EHLO` 用三个域名之一：`cloudflare-email.net` / `.org` / `.com`，每个都有 PTR 反解。收件方 IT 要加白名单时给这两段：

| 协议 | 段 |
| --- | --- |
| IPv4 | `104.30.0.0/19` |
| IPv6 | `2405:8100:c000::/38` |

### MX（入站）

Email Routing 入站用多个 `*.mx.cloudflare.net` MX，不同优先级。Email Sending 单独使用时**不需要在域名上配 MX**——MX 是入站用的。

来源：[Postmaster 参考](https://developers.cloudflare.com/email-service/reference/postmaster/)、[域名配置](https://developers.cloudflare.com/email-service/configuration/domains/)。

---

## 观测与 Analytics

Dashboard 里 Email Service 提供的观测面，排查"用户说没收到邮件"时直接用：

- **投递指标**：bounce rate、投递成功事件、投递成功率、spam 指标。
- **事件调试**：按收件人 / 时间查投递事件，定位是 bounce、suppress 还是已投递。
- **自定义指标**：接 Workers Analytics Engine 做自己的邮件指标（按业务维度统计 Agent 发信量、分类结果）。
- **告警**：可在 observability 配置里设阈值告警。

排查"邮件没收到"的标准路径：先看 Dashboard 投递事件确认是否投递成功 → 若成功则问题在收件方（垃圾箱 / ISP 策略）→ 若 bounce 看 bounce 类型 → 若在 suppression list 先确认是否该移除。

---

## 限制总表

| 限制 | 值 | 备注 |
| --- | --- | --- |
| 出站消息总大小 | 5 MiB | 含附件与 MIME 编码 |
| 出站消息（验证目标地址） | 25 MiB | 仅发给已验证地址时 |
| 入站消息大小 | 25 MiB | 超过即拒收 |
| 收件人 | 50 / 封 | to + cc + bcc 合计 |
| SMTP RCPT TO | 50 / 会话 | |
| 附件数 | 32 / 封 | |
| 自定义 header | 16 KB | 全部合计 |
| Subject | 998 字符 | RFC 5322 |
| 路由规则 | 200 / 域名 | |
| 每区域启用 Email 的域名 | 30 | Routing + Sending 合计，含根域 |
| 每账户目标地址 | 200 | 全域名共享 |
| `reply()` References | 100 条 | 超过抛异常 |
| 每日发送配额 | 无固定值 | 新账户保守起步，随信誉增长 |

来源：[Platform limits](https://developers.cloudflare.com/email-service/platform/limits/)。

---

## 开源项目与生态

这一节是 AI Native 视角下最实用的部分——能直接部署或参考的项目，不用从零写。

### cloudflare/agentic-inbox（首选，一键部署）

**自托管的 AI 邮件客户端，完全跑在 Cloudflare Workers 上。** 这是 Cloudflare 官方给"Email for Agents"做参考实现的开源应用，集中体现了邮件 + Agent 全链路的能力组合。

- **能力**：收发邮件 + Web 界面管理 + 内置 AI Agent。收信自动生成回复草稿（需人工确认才发），侧栏 Agent 面板带 9 个邮件工具（读、搜、起草、发送）。
- **架构**：Hono Worker 做 API+SSR；每个邮箱一个 Durable Object + SQLite 隔离；附件存 R2；AI Agent 是一个 `AIChatAgent` Durable Object 接 Workers AI。
- **AI 闭环**：Email Routing 收信 → Mailbox DO 存上下文 → EmailAgent 读邮件生成草稿 → 人工确认 → send_email binding 发出。完整示范了"邮件即工单 + AI 处理 + 人工兜底"。
- **MCP 暴露**：自带 `/mcp` 端点，外部 AI 工具（Claude Code、Cursor）能通过 MCP 操作邮箱——等于把部署的邮箱变成整个 AI 工具链的共享邮件后端。
- **部署**：README 有 **Deploy to Cloudflare 按钮**，自动配 R2 / DO / Workers AI；手动 `npm run deploy`。部署后要配 Cloudflare Access（生产鉴权）、Email Routing catch-all 规则、Email Service binding。
- **注意**：无 per-mailbox 授权，Access 策略是唯一信任边界（见坑第 8 条）。Apache 2.0 协议。
- **仓库**：[cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox)

这个项目是"邮件 + Agent 全链路"的完整样本——部署一套 Agentic Inbox 比读文档更直观地展示收信 → AI 草稿 → 人工确认 → 发信的闭环。

### Cloudflare 官方 Email Skill

Cloudflare 官方的 [cloudflare/skills](https://github.com/cloudflare/skills) 仓库里，email 能力归在 **`agents-sdk` skill** 下——这个 skill 教 AI 编程工具怎么用 binding、REST API、Email Routing、deliverability 最佳实践。装上之后 Claude Code / Cursor / Codex 这类工具就知道 Cloudflare 邮件怎么写，不会把你当成在配传统 SMTP。

安装方式见主手册 [AI 编程工作流](/#ai-编程工作流)。

### Email Workers 示例库

官方文档的 [examples/email-routing](https://developers.cloudflare.com/email-service/examples/email-routing/) 和 [examples/email-sending](https://developers.cloudflare.com/email-service/examples/email-sending/) 下有 PostalMime 解析、附件处理、SMTP 各语言库（Nodemailer / Python smtplib / PHPMailer）的现成示例。直接引用这些示例作为实现参考，比从零描述需求更准确。

### 和 Agents SDK 的关系

Email 不是孤立产品——它是 Agents SDK 工具层的一部分。[Cloudflare Agents](/agents) 讲了 Agent 的整体能力（公网入口、持久状态、定时、工具调用、休眠唤醒），邮件是其中"通信入口"和"出站通知"的具体实现。Agentic Inbox 用的就是 Agents SDK 的 `AIChatAgent`。理解 Agent 整体体系可看那一篇，邮件在其中的角色在本页展开。

---

## 起步路径

从 AI Native 视角，最小可上线路径：

1. **先部署 Agentic Inbox 看全貌。** 点 Deploy to Cloudflare 按钮，配好 Access + Email Routing catch-all + send_email binding。半天能跑起来一个带 AI 的邮件客户端，直观理解"邮件即工单 + AI 草稿 + 人工确认"长什么样。
2. **Onboard 一个子域做 Sending**（隔离风险）。`notifications.yourdomain.com`，Cloudflare 自动配 DKIM / SPF。事务邮件和营销邮件分开子域。
3. **用 Workers Binding 实现 Agent 逻辑。** 推荐模式：邮件进来 → Workers AI 分类 → Durable Object 存上下文 → `reply()` / `forward()` / 存 R2。具体形态参考 [Agent 能拿邮件做什么](#agent-拿邮件做什么) 一节。
4. **接收端用子地址路由多实例。** `agent+user123@yourdomain.com` 路由到对应用户的 Agent 实例，邮件层解决分发。
5. **需要兼容旧系统再加 SMTP。** 老客户端填 465 + `api_token` + Token。

这条路径下来，收发 + 智能处理全在 Cloudflare 内闭环，无需第三方邮件服务，密钥管理也只在 Cloudflare 这一层。

---

## 官方资源

| 资源 | 用法 |
| --- | --- |
| [Email for Agents 博客](https://blog.cloudflare.com/email-for-agents/) | 官方产品定位，邮件作为 Agent 接口的论点 |
| [Email Service 概览](https://developers.cloudflare.com/email-service/) | 产品总览、三种发送方式、Beta 状态 |
| [Email Routing](https://developers.cloudflare.com/email-routing/) | 入站接收、规则、Catch-all |
| [Email Workers](https://developers.cloudflare.com/email-routing/email-workers/) | `email()` 处理函数、forward / reply |
| [Workers API（发送）](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/) | Binding 字段、错误码 |
| [REST API（发送）](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/) | 端点、SDK |
| [SMTP（发送）](https://developers.cloudflare.com/email-service/api/send-emails/smtp/) | 465 Implicit TLS、错误码 |
| [Deliverability](https://developers.cloudflare.com/email-service/concepts/deliverability/) | 自动化项、推荐指标、子域隔离 |
| [Postmaster 参考](https://developers.cloudflare.com/email-service/reference/postmaster/) | DKIM selector、SPF、HELO、IP 段 |
| [Platform limits](https://developers.cloudflare.com/email-service/platform/limits/) | 全部硬限制 |
| [cloudflare/agentic-inbox](https://github.com/cloudflare/agentic-inbox) | 一键部署的 AI 邮件客户端参考应用 |
| [cloudflare/skills](https://github.com/cloudflare/skills) | 官方 AI 编程 skill，email 能力在 agents-sdk 下 |
