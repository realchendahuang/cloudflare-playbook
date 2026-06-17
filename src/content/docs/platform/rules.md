---
title: Rules
description: Cloudflare Rules 的 Redirects、Transform、Configuration、Origin、Snippets、Page Rules 迁移、执行顺序和排查方法。
---

最后核对日期：2026-06-17。Rules 的配额、执行顺序、Beta 状态和迁移策略会变化，上线前以 Cloudflare Rules、Ruleset Engine 和对应产品页面为准。

## 一句话判断

Cloudflare Rules 是把“某类请求应该怎么被 Cloudflare 处理”写成规则的入口层：

```text
请求进入 Cloudflare
  ├─ Redirects: 是否先跳转
  ├─ Transform Rules: 是否改 URL / header
  ├─ Configuration Rules: 是否改 Cloudflare 设置
  ├─ Origin Rules: 是否改回源方式
  ├─ Cache Rules: 是否缓存
  ├─ Snippets: 是否跑轻量 JavaScript
  └─ Cloud Connector: 是否路由到对象存储或云服务
```

普通项目的默认策略是：**优先用现代 Rules，不再新写 Page Rules；能用 declarative rule 解决的，不先上 Worker；需要状态、数据库、复杂业务逻辑时再用 Worker。**

Rules 功能通常要求域名或子域名的 DNS 记录是 Proxied，让流量先经过 Cloudflare。DNS-only 记录不会进入这套规则处理链。

## 规则分层

普通项目可以把 Rules 分成四层看，而不是把所有规则都放在同一个心智抽屉里：

```text
入口规范化
  ├─ URL normalization
  ├─ Single Redirects / Bulk Redirects
  └─ Transform Rules: URL rewrite

Cloudflare 行为配置
  ├─ Configuration Rules
  ├─ Cache Rules
  ├─ Compression Rules
  └─ Custom Errors

回源路径
  ├─ Origin Rules
  ├─ Cloud Connector
  └─ Transform Rules: request header

轻量逻辑
  ├─ Snippets
  └─ Workers
```

这四层的判断顺序是：先把 URL 和域名规范化，再决定 Cloudflare 怎么处理请求，再决定回哪个源，最后才写 JavaScript。能用规则声明清楚的，不要先写 Worker；需要 D1、KV、R2、Queues、状态、测试和完整日志时，再进入 Worker。

## 先选规则类型

| 需求 | 优先产品 | 什么时候不要用它 |
| --- | --- | --- |
| 域名跳转、路径跳转、HTTP 到 HTTPS。 | Single Redirects。 | 成千上万条静态映射用 Bulk Redirects；复杂判断用 Snippets 或 Worker。 |
| 大批旧 URL 迁移。 | Bulk Redirects。 | 需要正则、字符串替换、动态目标 URL 时不适合。 |
| 改请求路径、query string、request / response header。 | Transform Rules。 | 需要读取响应体、做签名校验、访问外部服务时不够。 |
| 按路径或国家调整安全等级、Automatic HTTPS Rewrites、RUM、Zaraz 等设置。 | Configuration Rules。 | 不是 Cloudflare zone setting 的东西不要硬塞。 |
| 某个路径回源到不同主机、端口、SNI。 | Origin Rules。 | Free / Pro / Business 主要能改 destination port；Host/SNI/DNS record override 是 Enterprise 能力。 |
| 静态资源、HTML、API 的缓存策略。 | Cache Rules。 | 用户态、登录态、带敏感 cookie 的响应默认不要缓存。 |
| 轻量 JavaScript 改 header、JWT 校验、复杂 redirect、简单自定义响应。 | Snippets。 | 需要持久化、绑定、Cron、复杂计算、日志和完整部署流程时用 Workers。 |
| 把路径路由到 R2、S3、GCS、Azure Blob。 | Cloud Connector。 | 需要自定义缓存或改路径时，还要配 Cache Rules / Transform Rules。 |
| 定制 Cloudflare 或源站错误页。 | Custom Errors。 | 免费计划不可用；WAF 自定义响应可能优先于 Error Pages。 |

## 计划边界

| 能力 | Free | Pro | Business | Enterprise |
| --- | ---: | ---: | ---: | ---: |
| Single Redirects | 10 | 25 | 50 | 300 |
| Transform Rules | 10 | 25 | 50 | 300 |
| Configuration Rules | 10 | 25 | 50 | 300 |
| Origin Rules | 10 | 25 | 50 | 300 |
| Compression Rules | 10 | 25 | 50 | 300 |
| Cloud Connector | 10 | 25 | 50 | 300 |
| Bulk Redirect Rules | 15 | 15 | 15 | 50 |
| Bulk Redirect Lists | 5 | 5 | 5 | 25 |
| URL redirects across Bulk Redirect lists | 10,000 | 25,000 | 50,000 | 1,000,000 |
| Snippets | 不可用 | 25 | 50 | 300 |
| Custom Error Rules | 不可用 | 25 | 50 | 300 |

Transform Rules 和 Single Redirects 的 regex support 从 Business 起可用。Origin Rules 里改 Host header、SNI、DNS record override 是 Enterprise 能力；改 destination port 在所有计划可用。

这些是 zone / account 计划边界，不是 Workers Paid。每月 $5 的 Workers Paid 不会把 Rules 配额从 Free 提到 Pro。

## 执行顺序

Cloudflare 官方在多个 Rules 页面里给出的现代 Rules 执行顺序是：

```text
Single Redirects
  -> URL Rewrite Rules
  -> Configuration Rules
  -> Origin Rules
  -> Bulk Redirects
  -> Managed Transforms
  -> Request Header Transform Rules
  -> Cache Rules
  -> Snippets
  -> Cloud Connector
  -> Page Rules
```

实践里要记住三件事：

1. 现代 Rules 优先级高于 Page Rules。新配置不要再依赖 Page Rules 当主线。
2. 非终止动作通常是后面的规则覆盖前面的规则；同一产品里规则顺序很重要。
3. Redirect、Block、Challenge 这类终止动作命中后会立即执行，后面的规则不会继续按普通方式叠加。

更完整的 Ruleset Engine request phase 还会把 WAF、Rate Limiting、API Shield、Access 等产品夹在现代 Rules 中间。普通项目最容易忽略的是：URL Rewrite Rules 比 Origin Rules 更早执行，WAF Custom Rules 又在 Origin Rules 之后、Bulk Redirects 之前执行。写规则时不要只看 Dashboard 左侧菜单，要按 phase 顺序理解请求会变成什么样。

## First Match 与 Stackable

Page Rules 和现代 Rules 最大的差异，是匹配语义变了。

| 维度 | Page Rules | 现代 Rules |
| --- | --- | --- |
| 匹配方式 | URL pattern。 | Rules language filter expression。 |
| 命中语义 | first match wins。 | 多条规则可以叠加，同一 phase 后面的非终止动作可覆盖前面的动作。 |
| 动作组织 | 一个 Page Rule 里混多个 setting。 | Redirect、Transform、Origin、Cache、Configuration 等分产品和 phase 执行。 |
| 排查方式 | 容易被 URL pattern 和顺序绕晕。 | 用 Cloudflare Trace 看模拟请求，用 Log Explorer 看真实历史请求。 |
| Worker 关系 | Worker 可能抑制 Page Rules actions。 | Worker 不会抑制现代 Rules features。 |

迁移时不要机械地把一个 Page Rule 改成一个现代 Rule。正确做法是先拆动作：跳转归 Redirects，缓存归 Cache Rules，回源归 Origin Rules，Cloudflare 设置归 Configuration Rules，header / URL 改写归 Transform Rules。

## Page Rules 迁移

Page Rules 已经不是新项目的最佳入口。Cloudflare 官方迁移指南明确建议新实现使用现代 Rules features。

| 旧 Page Rules 设置 | 现代入口 |
| --- | --- |
| Always Use HTTPS / Forwarding URL | Single Redirects |
| Browser Cache TTL / Cache Everything / Cache on Cookie | Cache Rules |
| Host Header Override / Resolve Override | Origin Rules |
| Automatic HTTPS Rewrites / Security Level / Email Obfuscation / Rocket Loader / Zaraz | Configuration Rules |
| IP Geolocation Header / True Client IP Header | Managed Transforms |
| URL path rewrite / header 修改 | Transform Rules |

迁移时不要只照搬 URL pattern。现代 Rules 使用 filter expression，例如 `http.host`、`http.request.uri.path`、`http.request.full_uri`、`http.cookie` 等字段。Page Rules 是“first match wins”，现代 Rules 可以叠加，且固定阶段执行，所以迁移后一定要用 Trace 验证。

迁移清单：

| 步骤 | 做什么 | 为什么 |
| --- | --- | --- |
| 1 | 导出现有 Page Rules，按 action 分组。 | 一个旧规则可能要拆到多个现代产品。 |
| 2 | 先迁移终止动作：Forwarding URL、Always Use HTTPS。 | Redirect 早执行，最容易改变后续请求路径。 |
| 3 | 再迁移路径改写和回源：Transform Rules、Origin Rules。 | URL rewrite 会影响后续 Origin Rules 的匹配。 |
| 4 | 再迁移缓存：Cache Rules。 | Cache Rules 与 Page Rules 的默认缓存行为不完全一致。 |
| 5 | 最后迁移配置类 setting：Configuration Rules、Managed Transforms。 | 这些通常是补充开关，不应先改变路径。 |
| 6 | 对每条关键路径跑 Trace。 | 确认 phase 顺序、命中规则和最终 action。 |
| 7 | 保留短窗口观察后删除 Page Rules。 | 避免现代 Rules 和 Page Rules 同时命中造成误判。 |

## Ruleset Engine 心智模型

Ruleset Engine 是现代 Rules、WAF、DDoS overrides 等能力背后的统一模型。它有三个核心概念：

| 概念 | 作用 |
| --- | --- |
| Phase | 请求生命周期里的一个阶段，例如 redirect、rewrite、cache、WAF 等。 |
| Ruleset | 一组有版本的规则，被部署到某个 phase。 |
| Rule | 一个 filter expression 加一个 action；`execute` action 可以执行另一个 ruleset。 |

表达式语言大致像这样：

```text
(http.host eq "example.com" and starts_with(http.request.uri.path, "/api/"))
```

普通项目先学这些就够用：

| 能力 | 例子 |
| --- | --- |
| 字段 | `http.host`、`http.request.uri.path`、`http.request.full_uri`、`http.cookie`、`ip.geoip.country`。 |
| 操作符 | `eq`、`contains`、`in`、`wildcard`、`matches`。 |
| 函数 | `starts_with()`、`ends_with()`、`lower()` 等。 |

正则能力和部分字段、动作会受产品和计划限制。能用 `starts_with`、`contains`、`wildcard` 解决的，不要为了炫技直接上复杂正则。

## Raw 字段避坑

URL Rewrite Rules 会改变后续规则看到的请求形态。比如你把 `/downloads/file.zip` 改写成 `/file.zip` 后，后面的 Origin Rules 如果还用 `http.request.uri.path starts_with "/downloads/"`，就可能不再命中。

这种场景优先用 raw 字段表达“原始请求长什么样”：

| 普通字段 | Raw 字段 | 适合场景 |
| --- | --- | --- |
| `http.request.uri.path` | `raw.http.request.uri.path` | URL rewrite 后仍要按原始路径匹配。 |
| `http.request.full_uri` | `raw.http.request.full_uri` | Page Rules URL pattern 迁移到 filter expression。 |
| `http.request.uri.query` | `raw.http.request.uri.query` | query string 被重写或规范化后仍要看原始参数。 |

简单规则可以直接用普通字段；只要前面有 URL normalization、URL rewrite 或 query rewrite，后面的匹配条件就要主动判断是否应该换成 raw 字段。

## Snippets vs Workers

Snippets 和 Workers 都能跑 JavaScript，但定位不同：

| 问题 | Snippets | Workers |
| --- | --- | --- |
| 成本口径 | Pro+ 计划内包含，不按 Workers 请求计费。 | 使用 Workers 免费额度或 Workers Paid / usage-based 口径。 |
| 适合 | header 修改、JWT 校验、简单 redirect、A/B、维护页、轻量缓存。 | API、数据库、KV/R2/D1/DO 绑定、Cron、队列、复杂业务逻辑。 |
| 限制 | 5 ms execution time、2 MB memory、32 KB package；Free 不可用。 | 运行时能力完整，限制看 Workers plan。 |
| 工程化 | Dashboard / API / Terraform。 | Wrangler、Git、版本、日志、类型和完整部署流程。 |

如果你只是给某类请求加 header、做轻量校验或简单分流，Snippets 可能比 Worker 更省心。如果你已经需要 D1、R2、KV、队列、日志和测试，直接用 Worker。

## 常见组合

| 场景 | 推荐组合 |
| --- | --- |
| 文档站域名规范化 | Single Redirects：`www` 到 apex 或 apex 到 `www`，保留 path 和 query。 |
| 旧博客迁移 | Bulk Redirects 放静态旧链接，Transform Rules 处理可模式化的新路径。 |
| API 后端分流 | URL Rewrite Rules 改路径，Origin Rules 改端口或回源主机；复杂鉴权交给 Worker。 |
| 静态站缓存 | Cache Rules 控制 HTML 和静态 hash 资源，Transform Rules 补安全响应头。 |
| R2 / S3 路径接入 | Cloud Connector 路由，Transform Rules 去掉路径前缀，Cache Rules 设置缓存。 |
| 临时维护 | Snippets 返回维护页，或 Custom Errors 定制错误页。 |
| 排查规则冲突 | Cloudflare Trace 模拟请求，Log Explorer 看真实历史流量。 |

## Trace 与真实日志

Cloudflare Trace 当前是 Beta，但对 Rules 排查很有价值。它回答的是“如果这个请求来了，Cloudflare 会怎么处理”。Log Explorer 回答的是“真实线上请求当时发生了什么”。

| 问题 | 优先工具 |
| --- | --- |
| 新规则上线前是否会命中？ | Cloudflare Trace。 |
| 为什么某条规则没有触发？ | Trace 看模拟路径，再看表达式字段。 |
| 某个真实用户为什么被跳转、缓存或挑战？ | Log Explorer / Security Events / Ray ID。 |
| 是否有大量真实流量命中某条规则？ | Log Explorer 或 Logpush。 |
| Trace 看不到某些自动 bypass？ | 回到对应产品文档；Trace 不展示所有自动绕过。 |

Trace 有边界：它不等于线上历史日志，不支持所有产品，也不会展示某些为 DCV、证书验证等 operational reason 自动 bypass 的规则。线上事故复盘不要只贴 Trace 截图，要同时保留 Ray ID、时间窗口和真实日志。

## 排查清单

| 问题 | 先看什么 |
| --- | --- |
| 规则完全没生效 | DNS 记录是否 Proxied；规则是否启用；表达式字段是否匹配真实请求。 |
| 跳转不符合预期 | Single Redirects 是否先于 Bulk Redirects；是否有终止动作提前命中。 |
| header 被覆盖 | Managed Transforms、Request Header Transform Rules、Response Header Transform Rules 的顺序。 |
| 缓存规则不对 | Cache Rules 是否被现代 Rules / Worker / 源站 header 影响；是否有用户态 bypass。 |
| Page Rules 行为变了 | 是否已经被现代 Rules 覆盖；迁移后是否理解 first match 与 stackable 的差异。 |
| 线上事故复盘 | Trace 看模拟路径，Log Explorer 看真实请求历史。 |
| URL rewrite 后 Origin Rules 不命中 | 后续规则是否应该改用 `raw.http.request.uri.path`。 |
| HTTP DCV / Pages 域名验证失败 | Redirects 是否误伤 `/.well-known/*`。 |
| Challenge loop | Rules 是否误伤 `/cdn-cgi/challenge-platform/*`。 |

两个路径建议默认排除在宽泛 redirect / rewrite / challenge 之外：

| 路径 | 为什么 |
| --- | --- |
| `/.well-known/*` | HTTP DCV、Pages domain validation、custom hostname validation 等会用到。 |
| `/cdn-cgi/challenge-platform/*` | Cloudflare Challenge 通行流程会用到，误伤后可能产生 challenge loop。 |

## API 与 IaC

Rules 是很适合进入 IaC 的配置层。Dashboard 适合探索和临时验证；生产关键规则最好能从 Terraform、Rulesets API 或至少导出的 JSON 快照还原。

建议把规则分成三类管理：

| 类型 | 管理方式 | 判断 |
| --- | --- | --- |
| 域名规范化、缓存、回源 | Terraform / Rulesets API。 | 影响全站路径和成本，必须可审计。 |
| 临时活动跳转、维护页 | Dashboard 创建，事后沉淀。 | 有明确过期时间，避免长期遗留。 |
| 安全临时处置 | Dashboard 快速加规则，再补 IaC。 | 事故响应优先，但事后要回到真源。 |

如果同一条规则既存在 Dashboard 手工版本，又存在 Terraform 版本，后续一定会混乱。开源项目可以简单一点：把关键规则写进文档和 IaC，把临时规则写到事故记录里。

## GitHub 开源参考

| 仓库 / 源文件 | 用途 |
| --- | --- |
| [cloudflare/cloudflare-docs Rules source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/rules) | 官方 Rules 文档源文件，适合追踪 Redirects、Transform、Origin、Snippets、Trace 和 Page Rules 迁移。 |
| [cloudflare/cloudflare-docs Ruleset Engine source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ruleset-engine) | 官方 Ruleset Engine 文档源文件，适合理解 phases、rulesets、rules、actions 和表达式语言。 |
| [cloudflare/cloudflare-docs Cache Rules source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/cache/how-to/cache-rules) | Cache Rules 源文件，适合追踪缓存规则、Page Rules 缓存迁移和 Trace 排查。 |
| [cloudflare/cloudflare-docs Snippets source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/rules/snippets) | Snippets 源文件，适合追踪 Snippets vs Workers、limits、examples 和执行顺序。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 用 Terraform 管理 rulesets、redirects、transform rules、origin rules 和 cache rules。 |
| [cloudflare/cloudflare-go](https://github.com/cloudflare/cloudflare-go) | Cloudflare 官方 Go SDK，适合看 Rulesets API 的自动化调用方式。 |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，适合对照教程站的信息架构和学习路线。 |

## 官方资料

- [Cloudflare Rules](https://developers.cloudflare.com/rules/)
- [Rules examples](https://developers.cloudflare.com/rules/examples/)
- [Redirects](https://developers.cloudflare.com/rules/url-forwarding/)
- [Transform Rules](https://developers.cloudflare.com/rules/transform/)
- [Configuration Rules](https://developers.cloudflare.com/rules/configuration-rules/)
- [Origin Rules](https://developers.cloudflare.com/rules/origin-rules/)
- [Cloudflare Snippets](https://developers.cloudflare.com/rules/snippets/)
- [Snippets vs Workers](https://developers.cloudflare.com/rules/snippets/when-to-use/)
- [Cloud Connector](https://developers.cloudflare.com/rules/cloud-connector/)
- [Compression Rules](https://developers.cloudflare.com/rules/compression-rules/)
- [Custom Errors](https://developers.cloudflare.com/rules/custom-errors/)
- [URL normalization](https://developers.cloudflare.com/rules/normalization/)
- [Trace a request](https://developers.cloudflare.com/rules/trace-request/)
- [Cloudflare Trace limitations](https://developers.cloudflare.com/rules/trace-request/limitations/)
- [Troubleshoot Rules](https://developers.cloudflare.com/rules/reference/troubleshooting/)
- [Page Rules migration guide](https://developers.cloudflare.com/rules/reference/page-rules-migration/)
- [Ruleset Engine](https://developers.cloudflare.com/ruleset-engine/)
- [Rules language](https://developers.cloudflare.com/ruleset-engine/rules-language/)
- [Phases list](https://developers.cloudflare.com/ruleset-engine/reference/phases-list/)
