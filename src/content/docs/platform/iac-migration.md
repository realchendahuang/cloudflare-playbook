---
title: 迁移与 IaC
description: Cloudflare 迁移、Terraform、Pulumi、Wrangler、R2 remote state 和参考架构的普通项目落地顺序。
---

最后核对日期：2026-06-17。

Cloudflare 的迁移和 IaC 不应该从“我要不要把所有东西都写成 Terraform”开始，而应该从更小的问题开始：哪些配置会反复改、哪些配置一旦改错会影响生产、哪些配置需要多人 review。

```text
迁移与 IaC
  ├─ 已有配置
  │    ├─ Dashboard / API / Wrangler 现状盘点
  │    └─ cf-terraforming 生成配置和 import 命令
  ├─ 配置真源
  │    ├─ Terraform / Pulumi 管账号、Zone、DNS、Rules、安全配置
  │    └─ Wrangler 管本地开发、构建、部署、D1 migrations、tail
  ├─ 状态管理
  │    ├─ 本地实验可用 local state
  │    └─ 团队和生产用 remote state，可用 R2 S3 backend
  └─ 迁移顺序
       └─ DNS -> SSL/TLS -> Cache/Rules/WAF -> Workers/Data -> 观测/账单
```

## 一句话判断

普通项目的默认策略是：**一开始用 Dashboard 和 Wrangler 可以；一旦域名、DNS、WAF、Rules、Access、R2/D1/KV 资源变多，就把“低频但高风险的配置”纳入 IaC；Worker 代码、构建、D1 schema migrations 和调试仍优先交给 Wrangler。**

## 分阶段路线

Cloudflare 官方 Terraform 文档强调 Terraform 要成为它管理资源的真源；Workers IaC 文档则提醒 Wrangler 仍然很适合上传和管理 Workers。普通项目不要在第一天就追求“全量 IaC”，更稳的是分阶段。

| 阶段 | 适合状态 | 该做什么 | 不要做什么 |
| --- | --- | --- | --- |
| 0. 手动起步 | 单人项目、配置少、还在试错。 | Dashboard 配域名、安全和缓存；`wrangler.jsonc` 进 Git；每次改动写进变更记录。 | 为了形式感写复杂 Terraform module。 |
| 1. 快照阶段 | 已经有线上域名、WAF、Rules、D1/R2/KV。 | 导出现状，记录 zone ID、account ID、关键规则、DNS、订阅和绑定。 | 直接写 `.tf` 后 `apply`。 |
| 2. 接管阶段 | 想把已有配置纳入 Terraform。 | `cf-terraforming generate` 生成 HCL，人工整理后逐条 `terraform import`，直到 `plan` 无变化。 | 把机器生成的资源名当最终命名。 |
| 3. 真源阶段 | 多人维护或配置影响生产。 | Terraform / Pulumi 管 DNS、Rules、WAF、Access、资源声明；Wrangler 管 Worker 构建、部署、D1 migrations 和 tail。 | Dashboard、Terraform、Pulumi、Wrangler 同时改同一个资源。 |
| 4. 守门阶段 | 已经有生产流程和 PR review。 | CI 跑 fmt、validate、plan；state 放远端；token 最小权限；规则改动必须 reviewer 看过。 | 让 CI 持有全账号无限权限。 |

## 工具怎么选

| 场景 | 推荐工具 | 不推荐 |
| --- | --- | --- |
| 单人项目、刚起步 | Dashboard + `wrangler.jsonc` + Git 记录变更 | 第一周就把所有资源抽成复杂模块 |
| DNS、Rules、WAF、Access 多人维护 | Terraform | Dashboard 和 Terraform 同时改同一条规则 |
| 团队偏 TypeScript / Python / Go | Pulumi | 为了“代码更灵活”把简单配置写成复杂逻辑 |
| Worker 开发和部署 | Wrangler | 让 Terraform 替代本地开发、tail、D1 migrations |
| 已有 Cloudflare 配置要接入 Terraform | `cf-terraforming` + 手动 review + `terraform import` | 直接 `terraform apply` 让它重建已有资源 |
| 生产 state | Remote state，R2 可做 S3-compatible backend | 把 `terraform.tfstate` 提交进 Git |

## 配置真源矩阵

真源不是“哪个工具更高级”，而是每类变更应该从哪里发起、在哪里 review、出问题时看哪里回滚。

| 资源 / 动作 | 推荐真源 | 为什么 |
| --- | --- | --- |
| DNS records | Terraform / Pulumi | 入口层高风险，适合 review、plan、回滚。 |
| SSL/TLS、Cache、Redirect、Origin、Configuration Rules | Terraform / Pulumi | 规则顺序和匹配条件需要代码审查。 |
| WAF、Rate Limiting、Access policy | Terraform / Pulumi | 安全策略要保留审计和变更历史。 |
| Worker 本地开发、构建、静态资产部署 | Wrangler | Wrangler 负责 bundling、assets upload、local bindings 和部署体验。 |
| Worker 版本与 deployment | 小项目用 Wrangler；平台化团队可用 Terraform / API | Terraform 管 Worker 时要同步 `compatibility_date`、flags、bindings 和 modules。 |
| D1 database 资源 | Terraform / Pulumi / Wrangler 都可 | 小项目 Wrangler 快；团队化后资源声明进 IaC。 |
| D1 schema migrations | Wrangler | 官方 Pulumi 示例也是通过 Wrangler 执行迁移，并用 migrations 目录 hash 控制重跑。 |
| R2 / KV / Queue / Vectorize 资源 | Terraform / Pulumi 或 Wrangler | 团队化后资源声明进 IaC；数据内容和 schema 不要混进 state。 |
| Secrets | Wrangler secret / Pulumi ESC / CI secret store | 不把 secret 明文写进 `.tf`、state、脚本参数或日志。 |
| 临时排障和日志 | Wrangler / Dashboard | `wrangler tail`、Workers Logs 和 Dashboard 更适合排障，不是 IaC 的职责。 |

## Terraform

Terraform 适合管理 Cloudflare 的账号级和 Zone 级配置，比如 DNS records、rulesets、WAF、Rate Limiting、Redirects、Cache Rules、Origin Rules、Access、Load Balancing、R2/KV/D1 资源创建等。

官方 best practices 里最值得普通项目吸收的是这几条：

| 原则 | 落地方式 |
| --- | --- |
| Terraform 管一个资源，就让 Terraform 成为这个资源的真源。 | 不要同一条 DNS record、同一个 ruleset 同时由 Dashboard、API、Wrangler 和 Terraform 修改。 |
| 目录按 account、zone、product 拆。 | `accounts/main/zone/dns`、`accounts/main/zone/rules`、`accounts/main/users` 这种结构比一个巨大 `main.tf` 更稳。 |
| 模块少用或谨慎用。 | Cloudflare 资源变化快，过度封装会让 plan 变难读、排错变困难。 |
| staging / production 尽量隔离。 | 官方建议用不同账号和域名隔离环境，因为一些账号级资源会共享。 |
| 凭据不要明文。 | 本地用环境变量或密钥工具，CI 用 secret store，不把 token 写进 `.tf` 或 state。 |

一个更适合小团队的目录可以长这样：

```text
infra/
  ├─ production/
  │    ├─ dns/
  │    ├─ rules/
  │    ├─ security/
  │    └─ data/
  ├─ staging/
  │    ├─ dns/
  │    ├─ rules/
  │    └─ data/
  └─ shared/
       └─ account/
```

## Wrangler 与 Terraform 的边界

Workers 官方 IaC 文档明确提醒：Wrangler 很适合上传和管理 Workers，但有些场景需要 Terraform、API SDK 或 CI/CD 自动化。本站的判断是把边界切清楚。

| 工作 | 推荐真源 | 原因 |
| --- | --- | --- |
| Worker 本地开发 | Wrangler | `wrangler dev`、本地 bindings、类型生成和调试体验更直接。 |
| Worker 静态资产部署 | Wrangler / 项目部署脚本 | 构建产物、assets upload、版本发布天然靠部署工具。 |
| D1 schema migrations | Wrangler | Terraform 创建 D1 database，但 schema migrations 仍要跑 `wrangler d1 migrations apply`。 |
| DNS / WAF / Rules / Access | Terraform / Pulumi | 这些是低频、高风险、需要 review 的配置。 |
| R2 / KV / D1 资源创建 | Terraform / Pulumi 或 Wrangler | 小项目用 Wrangler 很快；团队化后放 IaC 更容易 review。 |
| 线上日志排查 | Wrangler | `wrangler tail` 和 Workers Logs 更适合排障。 |

如果用 Terraform 管 Worker deployment，要注意三个点：

1. Worker bundling 通常仍由 Wrangler 或 esbuild 完成。
2. Terraform 或 API 上传 Worker 时，要把 `compatibility_date`、compatibility flags、bindings 等配置同步过去。
3. Worker versions 是不可变的，变更会创建新 version；官方建议使用 `content_file`，避免把大段内容直接塞进 state。

Terraform 里的 Worker bindings 也和 Wrangler 配置不同：Wrangler 常见写法是 `kv_namespaces`、`r2_buckets`、`d1_databases` 这类顶层配置；Terraform 的 Workers IaC 文档把 binding 放进统一的 `bindings` 数组，并用 `type` 区分 `kv_namespace`、`r2_bucket`、`d1`、`service`、`queue`、`vectorize`、`ai`、`hyperdrive`、`analytics_engine`、`plain_text`、`secret_text` 等类型。这里最容易出错的是“只复制 Worker 代码，忘记复制 binding 和兼容日期”。

Durable Objects 还有一个额外坑：migrations 跟 deployment 绑定。官方文档给的判断是，某些首次部署场景用 Terraform 一步完成会失败，这时只用 Terraform 管 `cloudflare_worker` 或 deployment 外壳，把版本和 DO migration 交给 Wrangler，反而更稳。

## 已有配置迁入 Terraform

Terraform 只能管理它创建过，或者被明确 import 进 state 的资源。已有 Cloudflare 配置如果来自 Dashboard、API 或历史脚本，不能直接写完 `.tf` 就 `apply`。

更稳的迁移顺序是：

1. 先导出现状，保留人工可读快照。
2. 用 `cf-terraforming generate` 生成某一类资源的 HCL。
3. 人工整理资源名、变量和目录，不要直接把机器生成文件当最终代码。
4. 用 `cf-terraforming import` 生成 `terraform import` 命令。
5. 逐条导入 state。
6. 跑 `terraform plan`，目标是 `No changes`。
7. 之后再小步修改，走 PR review。

不要一次性迁移所有产品。优先顺序建议是：

| 优先级 | 资源 | 为什么 |
| --- | --- | --- |
| P0 | DNS records、SSL/TLS、Page Rules / Redirects 迁移 | 入口层改错影响最大。 |
| P0 | WAF、Rate Limiting、Access | 安全策略需要 review 和回滚。 |
| P1 | Cache Rules、Origin Rules、Transform Rules | 行为会影响缓存命中、回源和 URL。 |
| P1 | R2/KV/D1 资源声明 | 资源本身纳入 IaC，数据和 schema 另走迁移流程。 |
| P2 | Worker deployment | 只有团队确实需要统一发布模型时再上。 |

## R2 Remote State

Cloudflare 官方 Terraform 文档给了 R2 作为 S3-compatible backend 的方案。它适合想把 Terraform state 放在 Cloudflare 里的团队。

落地时要记住：

- R2 bucket 先用 Wrangler、API 或 Dashboard 创建。
- R2 API token 要是 bucket scoped，并且只给 state bucket 读写权限。
- backend 使用 S3 兼容配置，`region` 通常为 `auto`。
- state 里可能有敏感信息，不要公开 bucket，不要把 access key 写入仓库。
- 从本地 state 迁到 remote state 时，用 `terraform init -reconfigure`。

本站建议：单人实验可以先 local state；生产和多人协作才上 remote state。R2 能做 remote backend，但如果团队已经在用 Terraform Cloud 或其他后端，不需要为了“全家桶”强行迁到 R2。

## Ruleset 的 `ref`

Terraform 管 Cloudflare ruleset 时，修改规则可能导致 Cloudflare 生成新的 rule ID。官方 troubleshooting 页面建议给每条 rule 设置稳定的 `ref`。

实际建议：

| 场景 | 做法 |
| --- | --- |
| 新写 ruleset | 每条规则从一开始就写 `ref`。 |
| 从现有配置导入 | 优先用 `cf-terraforming`，它会生成 `ref` 值。 |
| 已经有监控依赖 rule ID | 先补 `ref`，再改规则内容。 |
| 改 `ref` | 当成重建规则处理，先评估影响。 |

## Pulumi

Pulumi 适合团队已经熟悉 TypeScript、Python、Go、.NET、Java 或 YAML，并且希望用通用语言组织 IaC 的场景。Cloudflare 官方 Pulumi 文档强调它可以通过 Pulumi Cloudflare package 管理 Cloudflare resources。

Pulumi 的优势是语言生态强，配置可以和项目代码共用类型、函数和包。代价是自由度也会带来复杂度。普通项目不要因为“能写代码”就把配置写成大量分支逻辑。

Pulumi 与 Wrangler 可以组合：

| 工作 | 方式 |
| --- | --- |
| Zone、Queue、D1、Access 等资源 | Pulumi Cloudflare provider。 |
| Worker deploy | Pulumi 里调用 Wrangler，或仍由项目 CI 单独执行。 |
| D1 migrations | Pulumi command 触发 `wrangler d1 migrations apply`，并用 migrations 目录 hash 控制重跑。 |
| 暂不支持的资源 | 动态 provider 或直接 API，但要控制复杂度。 |
| secrets | Pulumi ESC 可以给 Wrangler 和 `.dev.vars` 提供外部化密钥。 |

普通项目的结论：已经用 Terraform 就继续 Terraform；团队更喜欢 TypeScript/Python IaC，再考虑 Pulumi。不要在同一个资源域里混用 Terraform 和 Pulumi。

## CI / PR 守门

IaC 的价值不只是“代码化”，而是把危险变更放进可审查流程。普通项目可以从很小的守门开始。

| 守门项 | 最小做法 | 失败时说明什么 |
| --- | --- | --- |
| 格式 | `terraform fmt -check` 或 Pulumi 语言格式化。 | 代码还没到 review 口径。 |
| 配置验证 | `terraform validate` / Pulumi preview。 | schema、变量、provider 配置或类型有问题。 |
| 漂移检查 | 定期跑 `terraform plan`，期望无意外变更。 | Dashboard / API 可能绕过 IaC 改了资源。 |
| 导入验收 | 已有资源导入后，`plan` 应该接近 `No changes`。 | HCL 和远端资源还没对齐，不能 apply。 |
| 权限 | CI token 只给目标账号、zone 和产品最小权限。 | token 泄露时的爆炸半径太大。 |
| state | state 远端存储，访问受限；不进 Git。 | state 可能泄露资源 ID、配置和敏感字段。 |
| 规则变更 | WAF、Rules、Access、DNS 需要 reviewer 看匹配条件和顺序。 | 高风险入口层变更没有人类检查。 |

这里不需要一开始上完整平台工程。只要做到“plan 可读、state 受保护、token 最小权限、同一资源只有一个真源”，就已经比手动改 Dashboard 稳很多。

## Reference Architecture

Cloudflare Reference Architecture 不是产品教程，而是“怎么把产品组合成架构”的资料库。它包括：

- Reference Architectures
- Design Guides
- Implementation Guides
- Diagrams
- Find by solution

普通项目最值得看的不是企业网络大图，而是这些方向：

| 方向 | 适合什么时候看 |
| --- | --- |
| Fullstack applications | 设计 Workers + D1/R2/KV/Queues 组合时。 |
| Serverless global APIs | 设计 API 网关、鉴权、缓存、后台任务时。 |
| Storing user generated content | 设计 R2 上传、签名访问、图片处理时。 |
| Optimizing image delivery with R2 and Images | 图片链路变复杂时。 |
| Distributed web performance architecture | 页面性能、缓存和图片优化需要系统治理时。 |
| Designing ZTNA access policies | 后台、内网工具和团队访问策略变复杂时。 |

它的正确用法是“借结构”，不是照搬企业架构。先看图谱理解产品组合，再回到本站对应专题做小项目版本。

## 参考架构到本站专题

官方 Reference Architecture 的内容分成 Reference architectures、Diagrams、Design guides 和 Implementation guides。普通项目最实用的读法，是把它映射成本站的产品专题和架构专题。

| 官方解决方案 | 先看本站专题 | 普通项目降维方式 |
| --- | --- | --- |
| Fullstack Applications | [静态内容站](/architecture/static-site/)、[Worker API + D1](/recipes/worker-api-d1/)、[数据产品](/platform/data/) | 先用 Static Assets + Worker API + D1/R2/KV，不急着做平台化。 |
| Serverless global APIs | [API 网关](/architecture/api-gateway/)、[Workers](/platform/workers/)、[Queues](/platform/queues/) | API 先清楚鉴权、缓存、限流、日志，再加队列和后台任务。 |
| Storing user generated content | [R2](/platform/r2/)、[R2 签名上传](/recipes/r2-signed-upload/)、[媒体与性能](/platform/media-performance/) | 用户文件走 R2，上传用签名 URL，图片需要变体时再接 Images。 |
| Control and data plane for Durable Objects | [实时应用](/architecture/realtime-app/)、[Durable Objects](/platform/durable-objects/) | 强一致状态进 DO，列表、索引和历史数据不要都塞进单个对象。 |
| Distributed web performance architecture | [Cache / CDN](/platform/cache/)、[源站保护与流量洪峰](/platform/origin-surge/) | 先提高 cache hit ratio 和静态化，只有明确回源瓶颈再看 Argo / Cache Reserve。 |
| Designing ZTNA access policies | [Zero Trust 与企业网络](/platform/zero-trust-networking/)、[安全边界](/best-practices/security/) | 后台和预览环境先用 Access，策略从少量清晰规则开始。 |
| Secure application delivery | [WAF](/platform/waf/)、[Rules](/platform/rules/)、[DDoS Protection](/platform/ddos/) | 登录、评论、上传、API 先加最小规则；不要直接复制企业规则集。 |
| AI / RAG diagrams | [AI 产品](/platform/ai/)、[免费与付费边界](/platform/free-paid/) | 文档站先 Pagefind，内容和查询价值明确后再上 AI Search / Vectorize / Workers AI。 |

## Migration Guides

Cloudflare Migration Guides 官方页目前说明这个 section 还在建设中，内容会继续增加。因此迁移时不要只等统一迁移指南，应该组合使用产品文档：

| 迁移对象 | 主要资料 |
| --- | --- |
| 静态站 | Pages limits、Workers Static Assets、Migrate from Pages to Workers。 |
| DNS | DNS quick scan、proxy status、DNSSEC、TTL、CNAME flattening。 |
| Page Rules | Page Rules migration guide、Redirect Rules、Configuration Rules、Origin Rules、Cache Rules。 |
| 存储 | R2 S3 API、presigned URLs、public buckets、R2 consistency。 |
| Worker 项目 | Wrangler、Static Assets routing、bindings、compatibility date。 |
| 安全策略 | WAF、Rate Limiting、Ruleset Engine、Turnstile、Access。 |

本站建议的迁移顺序：

1. 先把域名和 DNS 记录盘点清楚。
2. 降低迁移窗口内关键 DNS-only 记录 TTL。
3. 处理 DNSSEC，避免 nameserver 切换后解析失败。
4. 接入 Cloudflare 后先开 Full (strict)，确认源站证书。
5. 把缓存、重定向、WAF 从旧平台逐项迁移。
6. 再迁静态站、Worker API、R2 存储和 D1/KV 数据。
7. 最后补 Web Analytics、Workers Logs、Budget alerts 和 IaC。

## 本站当前选择

本站当前仍然是单 Worker + Static Assets + Starlight 文档站，资源数量很少。因此：

| 模块 | 当前选择 | 后续触发条件 |
| --- | --- | --- |
| Worker 部署 | Wrangler。 | 保持现状。 |
| 配置真源 | `wrangler.jsonc` + Git。 | 只有 DNS、WAF、Rules、Access 变多后再加 Terraform。 |
| State | 暂不需要 Terraform state。 | 多人维护 Cloudflare 配置后再上 remote state。 |
| 数据迁移 | 文档和评论分开管理。 | D1 schema 变化变多后再写迁移策略页。 |
| 参考架构 | 先用本站自己的小项目架构。 | 内容扩到 SaaS、AI 搜索、上传、后台后再引入对应参考架构。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| IaC 等于所有东西都 Terraform。 | 只把低频、高风险、需要 review 的配置纳入 IaC。 |
| Terraform 可以替代 Wrangler。 | Wrangler 仍适合本地开发、构建、部署、D1 migrations 和日志。 |
| 先写 `.tf` 再 apply，就能接管已有资源。 | 先 generate，再 import，直到 plan 无变化。 |
| 模块越多越专业。 | Cloudflare 配置变化快，简单目录常比复杂模块更稳。 |
| Dashboard 方便，Terraform 也方便，所以混着改。 | 同一个资源只能有一个真源。 |
| state 只是缓存文件。 | state 是生产配置映射，可能包含敏感信息，要保护。 |
| Reference Architecture 就是小项目模板。 | 它是理解产品组合的地图，小项目要降维落地。 |
| 用 Terraform 上传 Worker 就万事大吉。 | Worker bundling、bindings、compatibility date、DO migrations 和 D1 migrations 都要单独对齐。 |
| CI 有 token 就行。 | token 要最小权限，最好按账号、zone、产品和操作拆开。 |

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，适合学习教程站如何组织学习路线和资料索引。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | Cloudflare Terraform Provider，适合追踪资源支持、examples、issues 和 v5 变化。 |
| [cloudflare/cf-terraforming](https://github.com/cloudflare/cf-terraforming) | 从现有 Cloudflare 配置生成 Terraform HCL 和 import 命令的迁移工具。 |
| [pulumi/pulumi-cloudflare](https://github.com/pulumi/pulumi-cloudflare) | Pulumi Cloudflare provider 源码，适合追踪 Pulumi 资源覆盖。 |
| [cloudflare/cloudflare-docs Terraform source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/terraform) | 官方 Terraform 文档源文件，适合追踪 best practices、import、R2 backend 和 troubleshooting。 |
| [Terraform best practices source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/terraform/advanced-topics/best-practices.mdx) | Terraform 目录、状态管理、少用 modules、单一真源等建议的官方源文件。 |
| [Terraform import source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/terraform/advanced-topics/import-cloudflare-resources.mdx) | `cf-terraforming generate/import` 和已有资源接管流程的官方源文件。 |
| [Terraform R2 backend source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/terraform/advanced-topics/remote-backend.mdx) | R2 S3-compatible backend、bucket scoped token、`terraform init -reconfigure` 的官方源文件。 |
| [Workers IaC source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/platform/infrastructure-as-code.mdx) | Workers Terraform/API SDK、bundling、bindings、versions/deployments 和兼容配置提醒。 |
| [cloudflare/cloudflare-docs Pulumi source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/pulumi) | 官方 Pulumi 文档源文件，适合追踪 Pulumi + Wrangler、ESC secrets 和教程。 |
| [Pulumi + Wrangler source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pulumi/tutorial/dynamic-provider-and-wrangler.mdx) | Pulumi 调用 Wrangler 创建 Worker、执行 D1 migrations、动态 provider 的官方示例。 |
| [Pulumi ESC source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pulumi/tutorial/manage-secrets.mdx) | Pulumi ESC 管理 `CLOUDFLARE_API_TOKEN`、Worker secrets 和 `.dev.vars` 的官方示例。 |
| [cloudflare/cloudflare-docs Reference Architecture source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/reference-architecture) | 官方参考架构文档源文件，适合追踪 diagrams、design guides 和 implementation guides。 |
| [Reference Architecture how-to-use source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/reference-architecture/how-to-use.mdx) | Reference architectures、diagrams、design guides、implementation guides 的分类说明。 |
| [Reference Architecture by-solution source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/reference-architecture/by-solution.mdx) | 按 Connectivity Cloud、Zero Trust、Performance、Security、Developer Platform 映射解决方案。 |
| [cloudflare/cloudflare-docs Migration Guides source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/migration-guides) | 官方 Migration Guides 源文件，适合追踪迁移文档扩展。 |

## 官方资料

- [Cloudflare Terraform provider](https://developers.cloudflare.com/terraform/)
- [Terraform Best practices](https://developers.cloudflare.com/terraform/advanced-topics/best-practices/)
- [Import Cloudflare resources](https://developers.cloudflare.com/terraform/advanced-topics/import-cloudflare-resources/)
- [Terraform Remote R2 backend](https://developers.cloudflare.com/terraform/advanced-topics/remote-backend/)
- [Terraform Provider customization](https://developers.cloudflare.com/terraform/advanced-topics/provider-customization/)
- [Terraform rule ID changes](https://developers.cloudflare.com/terraform/troubleshooting/rule-id-changes/)
- [Workers Infrastructure as Code](https://developers.cloudflare.com/workers/platform/infrastructure-as-code/)
- [Pulumi](https://developers.cloudflare.com/pulumi/)
- [Pulumi + Wrangler](https://developers.cloudflare.com/pulumi/tutorial/dynamic-provider-and-wrangler/)
- [Manage secrets with Pulumi ESC](https://developers.cloudflare.com/pulumi/tutorial/manage-secrets/)
- [Reference Architectures](https://developers.cloudflare.com/reference-architecture/)
- [Reference Architecture how to use](https://developers.cloudflare.com/reference-architecture/how-to-use/)
- [Reference Architecture by solution](https://developers.cloudflare.com/reference-architecture/by-solution/)
- [Migration Guides](https://developers.cloudflare.com/migration-guides/)
- [Migrate from Pages to Workers](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/)
- [Page Rules migration guide](https://developers.cloudflare.com/rules/reference/page-rules-migration/)
