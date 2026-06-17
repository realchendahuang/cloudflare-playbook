---
title: Fundamentals
description: Cloudflare 的账号、Zone、代理状态、源站保护、API Token、排障头和全局操作边界。
---

最后核对日期：2026-06-17。

Fundamentals 不是一个单独产品，而是 Cloudflare 的底层操作系统。它解释的是：账号怎么组织、域名怎么接入、哪些流量真正经过 Cloudflare、源站怎么保护、API Token 怎么授权、排障时该看哪些请求头。

对普通项目来说，先读 Fundamentals，比一上来背 Workers、D1、WAF 更重要。因为后面的产品几乎都绕不开这条链路：

```text
User profile
  └─ Account
      ├─ Members / Roles / Billing / Audit Logs
      ├─ Account-level products: Workers / Pages / Bulk Redirects
      └─ Zone: example.com
          ├─ DNS records
          │   ├─ Proxied: HTTP/HTTPS 进入 Cloudflare
          │   └─ DNS-only: 只做解析，流量直达目标
          └─ Zone-level products: DNS / SSL / WAF / Cache / Rules
```

## 请求路径

Fundamentals 真正要解决的是“请求到底有没有经过 Cloudflare”。普通 Web 项目的默认路径应该长这样：

```text
visitor
  └─ DNS query
      └─ active Cloudflare zone
          ├─ DNS-only record -> 直接到第三方服务或源站
          └─ Proxied record
              └─ Cloudflare Anycast edge
                  ├─ SSL/TLS / WAF / DDoS / Rules / Cache / Workers
                  └─ origin: 只接受 Cloudflare IP 或 Tunnel 流量
```

私有应用、企业 IP 网络和非 HTTP 服务不是这条默认路径：私有应用优先看 Tunnel / Access / Cloudflare One Client；企业自有网段看 Magic Transit / Network Interconnect；普通 SSH、数据库、邮件不要指望橙云代理。

## 一句话判断

Cloudflare 的最佳实践不是“把所有开关都打开”，而是先确认四件事：

1. 这个能力是账号级、组织级，还是 Zone 级。
2. 这条 DNS 记录是 Proxied，还是 DNS-only。
3. 源站是否只接受来自 Cloudflare 的请求。
4. 自动化脚本是否使用最小权限 API Token。
5. 排障时是否同时保留 Ray ID、源站日志、Audit Logs 和修改时间线。

## Profile、Account、Zone

| 概念 | 管什么 | 普通项目怎么理解 |
| --- | --- | --- |
| User profile | 登录邮箱、语言、通知偏好、2FA、个人 API Token。 | 这是“人”的身份，不是项目本身。 |
| Account | 成员、权限、账单、Workers、Pages、账号级资源。 | 一个团队或个人的资源容器。开源项目最好用组织邮箱或长期可交接账号管理。 |
| Zone | 一个接入 Cloudflare 的域名或子域名。 | DNS、SSL/TLS、WAF、Cache、Rules 大多围绕 Zone 配置。 |
| Organization | 多个账号的上层容器。 | Enterprise-only，且官方标注为 public beta；普通项目先按 Account / Zone 理解即可。 |

账号管理的核心是可交接。Cloudflare 官方 Fundamentals 的账户连续性建议强调：不要让唯一管理员、唯一邮箱、唯一 2FA 设备成为长期风险；账单信息、域名注册邮箱和恢复方式都要能被组织接管。

普通项目至少要做这几件事：

| 风险 | 底线做法 |
| --- | --- |
| 唯一管理员离职或失联 | 至少保留两个可信 Super Administrator，并定期确认 2FA backup codes 可用。 |
| 登录邮箱跟业务域名绑死 | 账号主邮箱不要依赖同一个可能故障的业务域名邮箱。 |
| 域名注册主体不清 | 域名 registrant、Cloudflare 账号、账单信息都应该归属长期可交接主体。 |
| 合伙人或外包共用一个账号 | 邀请成员并分配权限，不共享登录邮箱、密码和 2FA。 |
| 配置被改后没人知道 | 重要账号开启通知，事故时看 Audit Logs 和成员操作时间线。 |

## Scope 决策

很多 Cloudflare 配置问题，本质是改错了层级。先判断 scope，再找产品页面。

| 你要改什么 | 常见 scope | 判断方法 |
| --- | --- | --- |
| 登录邮箱、2FA、个人 API Token、通知偏好 | User profile | 和某个“人”绑定，换账号后不自动迁移。 |
| 成员、账单、Workers、Pages、R2、D1、KV、账号级 lists | Account | 进入 Dashboard 后还没选具体域名时看到的资源，多数是账号级。 |
| DNS、SSL/TLS、WAF、Cache、Rules、域名 Analytics | Zone | 必须先选 `example.com` 这种域名才能配置。 |
| 单个 Tunnel、Access application、Access service token | Resource | 资源级权限仍在扩展，适合把高风险后台管理权限收窄。 |
| 多账号集中治理 | Organization | Enterprise public beta，普通项目不要把它当默认组织模型。 |

成员权限也按这个模型组合：一个 policy 由 actor、scope 和 role 组成；用户可以有多个 policy，权限会和 User Groups 继承的权限叠加。排查“为什么某个人能改这个配置”时，要同时看 Members 和 User Groups，不要只看单个成员页。

## 域名接入

最常见的接入方式是 Full DNS setup：把 Cloudflare 变成这个域名的 authoritative DNS provider。流程可以压成这张清单：

| 步骤 | 要点 |
| --- | --- |
| 添加站点 | 标准接入通常添加 apex domain，例如 `example.com`，不是 `api.example.com` 这种二级子域。Enterprise subdomain setup 是例外。 |
| 核对 DNS | Quick scan 不保证扫全。必须人工检查 apex、`www`、API、邮件、验证记录。 |
| 邮件记录 | MX、邮件相关 CNAME / TXT 通常保持 DNS-only。 |
| 处理 DNSSEC | 如果旧 DNS 已启用 DNSSEC，切 nameserver 前先在注册商关闭旧 DS record，Cloudflare active 后再重新启用。 |
| 修改 nameserver | 到注册商把 nameserver 改成 Cloudflare 分配的两个 nameserver。 |
| 配置 SSL/TLS | 普通项目目标是 Full (strict)，边缘证书和源站证书都要完整。 |
| 验证状态 | Zone 变成 Active 后，再看关键 Web 记录是否是 Proxied。 |

不要用“改 nameserver”来临时排障。官方文档给了更低风险的顺序：需要绕开缓存时先用 Development Mode；需要绕开 Cloudflare 代理时再考虑暂停 Cloudflare 或把单条记录改成 DNS-only。暂停 Cloudflare 会让 Rules、WAF、Cloudflare 侧 SSL/TLS 等能力失效。

| 目标 | 优先做法 | 不推荐的做法 |
| --- | --- | --- |
| 排查缓存问题 | 开 Development Mode 或写临时 Cache Rule。 | 修改 nameserver 或全站 Pause。 |
| 临时让单个主机绕过代理 | 只把那条 DNS 记录改成 DNS-only。 | 把整个 zone 暂停。 |
| 验证 Cloudflare 是否参与问题 | 用 Ray ID、`/cdn-cgi/trace`、源站日志和 Cloudflare Trace。 | 直接把生产入口绕开，导致 WAF / SSL / Rules 同时失效。 |
| 迁移 DNS provider | 先导出旧 DNS，核对 apex、`www`、API、邮件、验证记录。 | 只相信 Quick scan。 |
| 避免 DNSSEC 中断 | 切 nameserver 前处理旧 DS record，active 后再启用 Cloudflare DNSSEC。 | 带着旧 DNSSEC 直接切换。 |

## Proxied 与 DNS-only

| 状态 | DNS 返回什么 | 能用哪些 Cloudflare 能力 | 适合 |
| --- | --- | --- | --- |
| Proxied | Cloudflare Anycast IP。 | CDN、WAF、DDoS、Cache、Rules、SSL/TLS、Ray ID、请求头增强。 | 网站、API、文档站、公开 Web 应用。 |
| DNS-only | 真实目标记录。 | 只做 DNS 解析。 | 邮件、域名验证、SSH、数据库、某些第三方 SaaS 验证。 |

只要记录是 Proxied，访客不会直接看到源站 IP，源站收到的请求也会来自 Cloudflare IP ranges。源站防火墙的正确方向是：允许 Cloudflare IP，拒绝直接访问源站的外部流量。

## 源站保护

Cloudflare 能保护入口，但前提是源站不要绕开 Cloudflare 裸露出去。

| 层级 | 做法 | 适合程度 |
| --- | --- | --- |
| DNS 层 | 审计 DNS-only 记录，避免暴露真实源站 IP。 | 所有项目 |
| 网络层 | 源站只 allowlist Cloudflare IP ranges。 | 所有 Proxied Web 源站 |
| 应用层 | 校验自定义 HTTP header 或 JWT。 | 需要确认请求来自 Cloudflare 配置链路的项目 |
| 传输层 | Authenticated Origin Pulls。 | 需要更强源站认证的项目 |
| 隧道 | Cloudflare Tunnel。 | 不想开放公网端口的后台、内网服务 |

如果源站 IP 曾经公开解析过，接入 Cloudflare 后仍然可能被历史 DNS 数据找到。更稳的做法是换源站 IP，并保证新 IP 不再出现在公开 DNS-only 记录、错误日志、文档或截图里。

源站保护可以按强度分层：

| 强度 | 做法 | 注意 |
| --- | --- | --- |
| 基础 | Web 记录 Proxied，邮件、验证、非 HTTP 记录 DNS-only。 | 邮件服务不要和 Web 源站共用同一台机器，退信可能泄露 IP。 |
| 推荐 | 源站防火墙 allowlist Cloudflare IP ranges，再拒绝其他公网来源。 | Cloudflare IP ranges 不常变，但要有自动同步或定期复核机制。 |
| 加强 | Transform Rules / Workers 加源站认证 header，源站校验 Host 和 secret header。 | Basic auth / secret header 只能算应用层补强，必须在 HTTPS 下使用。 |
| 更强 | Authenticated Origin Pulls 或 Cloudflare Tunnel。 | AOP 需要 Full / Full (strict)；Tunnel 适合不想暴露公网端口的服务。 |
| 企业网络 | Magic Transit、Network Interconnect、Dedicated CDN Egress IPs。 | 面向企业网络和合同预算，不是普通 Web 项目的默认起点。 |

如果源站在 AWS VPC，注意不要把 `172.64.0.0/13` 当成 RFC 1918 私网段路由到内部网络。Cloudflare 官方特别指出它是 Cloudflare 公共 egress IP 空间；错误路由可能导致 521 / 522 这类边缘到源站连接失败。

## 成员与权限

Cloudflare 的权限要按 scope 理解：账号级角色影响账号资源，域名级角色影响指定 Zone，资源级角色仍在逐步扩展。

| 角色 / 权限 | 普通项目判断 |
| --- | --- |
| Super Administrator | 能管理成员、账单、购买和账号级 API Token。人数要少，但不能只有一个。 |
| Administrator | 可以管理大部分账号设置，但不等同于 Super Administrator。 |
| Billing | 只处理账单和订阅，适合财务或合伙人。 |
| Workers Platform Admin | 能管理 Workers、Pages、KV、D1、R2、Durable Objects 等开发者平台资源。 |
| Domain DNS | 只管理某个域名的 DNS，适合把域名操作权限收窄。 |
| Domain Read Only | 审计、协作、排障时使用。 |

普通开源项目的底线：日常开发不要用 Super Administrator 用户的 Global API Key；DNS 自动化、部署自动化、账单查看应该拆成不同权限。

Audit Logs v2 是账号级证据源，Dashboard 和 API 的用户发起操作会自动记录，Cloudflare 系统发起的部分动作也会记录。官方当前口径是日志保留 18 个月，Dashboard 查询为了性能主要看最近 90 天；更长时间或归档需求用 API / Logpush。事故复盘时，不要只问“谁最后改了 DNS”，还要看 action、actor、interface、resource、zone、相关 Ray ID 和修改结果。

## API Token

Cloudflare 官方已经很明确：新项目尽量用 API Token，不要用 Global API Key。

| 项目 | 推荐做法 |
| --- | --- |
| API Token | 按 Account / Zone / User 权限创建，限定具体资源，必要时加 IP 过滤和过期时间。 |
| Account API Token | 适合服务账号化的自动化，但要确认目标 API 支持 account-owned token。 |
| Global API Key | Legacy，不适合新项目；它拥有用户全资源、全权限，无法做细粒度限制。 |
| Token Secret | 只显示一次，创建后立刻放进密码管理器、CI Secret 或 `wrangler secret`。 |

排查 API 时，先找到 Account ID 和 Zone ID。Zone 级 API 要用 Zone ID，Workers / Pages / D1 / R2 这类账号资源经常要 Account ID。Token 创建后可以用 verify endpoint 验证是否有效，但真正的权限仍要用目标 API 调一次确认。

| 自动化场景 | 推荐 token | 权限边界 |
| --- | --- | --- |
| 个人临时脚本 | User API Token | 限定单个 zone、单类权限和短 TTL。 |
| GitHub Actions / CI/CD | Account API Token | 适合不绑定具体员工的长期集成；确认目标产品在 compatibility matrix 里支持。 |
| DNS 记录维护 | Zone DNS Edit / Read | 只给目标 zone，不给全账号所有域名。 |
| Workers 部署 | Workers 相关账号权限 + 需要的资源权限 | 不顺手给 Super Administrator；部署失败再按错误补权限。 |
| 账单和用量查询 | Billing / Analytics 读权限 | 和写配置 token 分开。 |

新 token 会有可扫描前缀：User API Token 使用 `cfut_`，Account API Token 使用 `cfat_`。可以给 token 增加 Client IP filtering 和 TTL；默认情况下 token 长期有效且不限来源 IP。Cloudflare API 还有全局速率限制，当前官方写法是 Client API 每个 user / account token 每 5 分钟 1,200 次、每 IP 每秒 200 次；自动化脚本要处理 `429` 和 `retry-after`，不要在失败时无限重试。

## 流量与排障

请求经过 Cloudflare 后，会多出一组非常关键的可观测信息。

| 信号 | 怎么用 |
| --- | --- |
| Cloudflare Ray ID / `Cf-Ray` | 每个经过 Cloudflare 的请求都会带 Ray ID，适合在 Security Events、日志、用户报错之间串联线索。它不保证全局唯一，但排障价值很高。 |
| `CF-Connecting-IP` | 源站获取真实访客 IP 的首选请求头之一。前提是源站只信任来自 Cloudflare IP 的请求。 |
| `True-Client-IP` | Enterprise 侧常见，语义和 `CF-Connecting-IP` 类似，只是 header 名不同。 |
| `X-Forwarded-For` | 可以辅助看代理链，但不要比 `CF-Connecting-IP` 更信任它。 |
| `Accept-Encoding` | Cloudflare 会把到源站的 `Accept-Encoding` 设为 `br, gzip`；Worker 里可从 `request.cf.clientAcceptEncoding` 看原始值。 |
| `/cdn-cgi/` | Cloudflare 管理的特殊路径，常用于 trace、challenge、图片变换、Web Analytics 等；不要把它当成自己应用路由。 |

安全扫描器和爬虫规则应该排除 `/cdn-cgi/`。如果使用 `/cdn-cgi/image/` 做图片变换，`robots.txt` 里要在禁止 `/cdn-cgi/` 前显式允许图片路径。

排障时按证据类型拆开，不要把所有问题都归到一个 Dashboard 截图里：

| 问题 | 最小证据包 |
| --- | --- |
| 用户访问失败 | URL、UTC 时间窗口、浏览器响应头里的 `Cf-Ray`、状态码、用户地区和网络。 |
| WAF / Rules 误伤 | Ray ID、Security Events、触发的规则、请求路径、请求方法和 User-Agent。 |
| 源站 52x | Ray ID、源站访问日志、源站错误日志、Cloudflare IP allowlist、SSL/TLS 模式和端口。 |
| 配置被改 | Audit Logs v2 里的 actor、action、interface、resource、zone 和时间线。 |
| API 自动化失败 | Account ID / Zone ID、token 类型、目标权限、HTTP 状态码、`Ratelimit` / `retry-after` 响应头。 |
| Worker 子请求异常 | `CF-Worker`、`cf.worker.upstream_zone`、Worker 日志、目标 hostname 和是否跨 zone。 |

`CF-Connecting-IP` 和 `True-Client-IP` 的语义相近，后者主要是 Enterprise 兼容旧设备的 header 名。恢复真实访客 IP 时优先读取 `CF-Connecting-IP`，但前提是源站只接受 Cloudflare IP；如果源站仍允许公网直连，这些 header 可以被伪造。

## 错误与连接限制

很多 Cloudflare 错误不是“Cloudflare 坏了”，而是边缘到源站之间的连接失败。最常见的排查顺序是：

| 现象 | 先看哪里 |
| --- | --- |
| 522 | Cloudflare 到源站 TCP 连接或 ACK 超时，先看源站防火墙、端口、负载和 Cloudflare IP allowlist。 |
| 524 | 源站建立连接后响应太慢，常见于长请求、慢 SQL、同步任务。 |
| 525 / 526 | SSL 握手或证书验证问题，先看源站证书、SSL/TLS 模式和 Full (strict)。 |
| 520 | 泛化源站错误，先看源站日志、连接复用、空响应、异常关闭。 |

关键默认限制需要记住几条：Cloudflare 到源站 TCP 连接超时约 19 秒，Proxy Read Timeout 默认 120 秒，Proxy Write Timeout 默认 30 秒，URL 最大 16 KB，请求头和响应头总量各 128 KB。长任务不要硬塞进同步 HTTP 请求，应该改成队列、状态查询或后台任务。

Cloudflare 生成的错误响应还会根据 `Accept` header 返回 HTML、JSON、Problem JSON 或 Markdown。结构化错误响应对所有计划可用；自定义错误规则属于付费能力。

| 客户端 | 建议 |
| --- | --- |
| 浏览器页面 | 默认 HTML 错误页足够，让用户能把 Ray ID 截图发回来。 |
| API 客户端 | 请求 `Accept: application/json` 或 `application/problem+json`，用 `error_code`、`error_name`、`retryable` 和 `retry_after` 做程序判断。 |
| Agent / 文档工具 | 请求 `Accept: text/markdown`，方便把错误放进自动化诊断流程。 |
| 已配置 Error Page 的站点 | Error Page 会覆盖内容协商；如果还想给 API / Agent 返回结构化内容，需要用付费 Custom Error Rules 按 `Accept` 匹配。 |

## 网络端口

Cloudflare HTTP proxy 只代理一组固定端口。

| 类型 | 端口 |
| --- | --- |
| HTTP | `80`, `8080`, `8880`, `2052`, `2082`, `2086`, `2095` |
| HTTPS | `443`, `2053`, `2083`, `2087`, `2096`, `8443` |

非标准端口里，`2052`, `2053`, `2082`, `2083`, `2086`, `2087`, `2095`, `2096`, `8880`, `8443` 默认不缓存。非 HTTP 服务不要指望普通橙云代理解决，要么 DNS-only，要么看 [Spectrum](/platform/traffic-routing/)、Tunnel 或 Zero Trust。

## Under Attack mode

Under Attack mode 是 L7 DDoS 压力下的最后手段，不是日常安全默认值。它会让访问者先经过额外检查，可能影响第三方分析、无 JS 客户端和正常用户体验。

更好的顺序是：

1. Web 入口保持 Proxied，源站隐藏。
2. 高风险路径加 WAF Custom Rules、Rate Limiting、Turnstile。
3. 只在明确被打时，对全站或特定路径开启 Under Attack mode。
4. 事件过去后关闭，回到可观测、可解释的规则组合。

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 以为域名接入 Cloudflare 就等于所有服务都受保护。 | 只有 Proxied 的 HTTP/HTTPS 流量才进入 Cloudflare 代理层。 |
| 把邮件、SSH、数据库记录也开橙云。 | 非 Web 服务通常 DNS-only，另用 Tunnel、Access 或专门产品保护。 |
| 源站同时允许公网直连。 | 源站 allowlist Cloudflare IP，并轮换曾经公开过的源站 IP。 |
| 用 Global API Key 跑自动化。 | 用最小权限 API Token，并绑定资源、IP 和过期时间。 |
| 所有人都给 Super Administrator。 | 按账号、Zone、产品拆权限，只保留少量 Super Admin。 |
| 看到 52x 就只查 Cloudflare。 | 同时拿 Ray ID、源站日志、SSL/TLS 模式、端口和连接限制一起查。 |
| 用 Pause Cloudflare 处理缓存问题。 | 缓存问题先用 Development Mode 或 Cache Rules 验证。 |

## GitHub 开源参考

| 仓库 | 值得参考的点 |
| --- | --- |
| [cloudflare/cloudflare-docs Fundamentals source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/fundamentals) | 官方 Fundamentals 文档源文件，适合追踪账号、域名、API、请求头和排障规则变更。 |
| [cloudflare/cloudflare-docs Fundamentals API source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/fundamentals/api) | API Token、Account API Token、速率限制、token rotation 和权限模板的官方源文件。 |
| [cloudflare/cloudflare-docs Members source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/fundamentals/manage-members) | 角色、scope、policy 和 User Groups 的官方源文件。 |
| [cloudflare/cloudflare-docs Fundamentals reference source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/fundamentals/reference) | Ray ID、HTTP headers、`/cdn-cgi/`、connection limits、network ports、error responses 的官方源文件。 |
| [cloudflare/cloudflare-docs DNS source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/dns) | DNS、Proxy status、DNSSEC、Full setup 的官方源文件。 |
| [cloudflare/cloudflare-docs Rules source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/rules) | Rules、Trace、Redirects、Origin Rules、Custom Errors 的官方源文件。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 把 Zone、DNS、rulesets、账号资源变成 IaC 的主流参考。 |
| [cloudflare/cloudflare-go](https://github.com/cloudflare/cloudflare-go) | 自动化 Cloudflare API 的官方 Go SDK，适合看 token scope 和资源模型。 |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，适合学习教程站的信息架构和学习路线组织方式。 |

## 官方资料

- [Cloudflare Fundamentals](https://developers.cloudflare.com/fundamentals/)
- [How Cloudflare works](https://developers.cloudflare.com/fundamentals/concepts/how-cloudflare-works/)
- [Accounts, zones, and user profiles](https://developers.cloudflare.com/fundamentals/concepts/accounts-and-zones/)
- [Traffic flow through Cloudflare](https://developers.cloudflare.com/fundamentals/concepts/traffic-flow-cloudflare/)
- [Cloudflare IP addresses](https://developers.cloudflare.com/fundamentals/concepts/cloudflare-ip-addresses/)
- [Account and domain management best practices](https://developers.cloudflare.com/fundamentals/reference/best-practices/)
- [Add a site to Cloudflare](https://developers.cloudflare.com/fundamentals/manage-domains/add-site/)
- [Pause Cloudflare](https://developers.cloudflare.com/fundamentals/manage-domains/pause-cloudflare/)
- [Policies](https://developers.cloudflare.com/fundamentals/manage-members/policies/)
- [Roles](https://developers.cloudflare.com/fundamentals/manage-members/roles/)
- [Role scopes](https://developers.cloudflare.com/fundamentals/manage-members/scope/)
- [Audit Logs v2](https://developers.cloudflare.com/fundamentals/account/account-security/audit-logs/)
- [Create API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Account API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/account-owned-tokens/)
- [Restrict tokens](https://developers.cloudflare.com/fundamentals/api/how-to/restrict-tokens/)
- [API rate limits](https://developers.cloudflare.com/fundamentals/api/reference/limits/)
- [Global API key](https://developers.cloudflare.com/fundamentals/api/get-started/keys/)
- [Cloudflare Ray ID](https://developers.cloudflare.com/fundamentals/reference/cloudflare-ray-id/)
- [Cloudflare HTTP headers](https://developers.cloudflare.com/fundamentals/reference/http-headers/)
- [/cdn-cgi/ endpoint](https://developers.cloudflare.com/fundamentals/reference/cdn-cgi-endpoint/)
- [Error responses](https://developers.cloudflare.com/fundamentals/reference/error-responses/)
- [Connection limits](https://developers.cloudflare.com/fundamentals/reference/connection-limits/)
- [Network ports](https://developers.cloudflare.com/fundamentals/reference/network-ports/)
- [Protect your origin server](https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/)
