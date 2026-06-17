---
title: 迁移与 IaC
description: Cloudflare 迁移、Terraform、Pulumi、Wrangler、R2 remote state 和参考架构的普通项目取舍。
---

最后核对日期：2026-06-18。

IaC 不是把所有 Cloudflare 配置都写成 Terraform。普通项目先问一个更小的问题：这个配置改错会不会影响入口、安全、账单或生产数据？会，就逐步纳入可 review 的真源；不会，就先保持简单。

## 该不该上 IaC

| 场景 | 判断 | 先做什么 |
| --- | --- | --- |
| 单人项目、刚接入 Cloudflare | 不急 | Dashboard + Wrangler + Git 记录变更。 |
| DNS、WAF、Rules、Access 变多 | 应该上 | 先导出现状，再按资源逐步接管。 |
| 多人维护生产域名 | 应该上 | 低频高风险配置走 Terraform / Pulumi + PR review。 |
| Worker 开发和部署 | 不一定 | Wrangler 仍然是最直接的构建和部署入口。 |
| 已有大量 Dashboard 配置 | 谨慎迁移 | 先 generate/import，不要直接 apply。 |
| 团队已经用 Terraform | 继续 Terraform | 同一资源不要混用 Dashboard 和 Terraform 修改。 |
| 团队更熟 TypeScript / Python / Go | 可评估 Pulumi | 别为了语言灵活性把简单配置写复杂。 |
| 生产 state 需要共享 | 需要 remote state | R2 可做 S3-compatible backend，但 state 必须受保护。 |

## 工具边界

| 工具 | 适合管什么 | 不适合做什么 |
| --- | --- | --- |
| Dashboard | 早期试错、少量低风险配置 | 多人生产变更的唯一真源。 |
| Wrangler | Worker 本地开发、构建、部署、D1 migrations、tail | 替代 Terraform 管所有账号和 Zone 配置。 |
| Terraform | DNS、Rules、WAF、Access、账号和 Zone 级资源 | 不 import 就强行接管已有资源。 |
| Pulumi | 团队希望用通用语言管理 Cloudflare 资源 | 把简单配置写成大量分支和抽象。 |
| cf-terraforming | 从现有 Cloudflare 配置生成 Terraform HCL 和 import 命令 | 把生成文件不 review 就当最终代码。 |
| R2 remote state | 团队共享 Terraform state | 存公开 bucket、把 access key 写进仓库。 |
| Reference Architecture | 理解产品组合和架构边界 | 当成小项目照抄模板。 |

## 纳入 IaC 的优先级

| 优先级 | 资源 | 原因 |
| --- | --- | --- |
| P0 | DNS records、SSL/TLS、Redirects | 入口层改错影响最大。 |
| P0 | WAF、Rate Limiting、Access | 安全策略需要 review 和回滚。 |
| P1 | Cache Rules、Origin Rules、Transform Rules | 会影响缓存、回源、URL 和成本。 |
| P1 | R2、KV、D1、Queues 等资源声明 | 资源归属要清楚，数据内容不要进 state。 |
| P2 | Worker deployment | 只有团队需要统一发布模型时再上。 |
| P2 | Reference Architecture 落地清单 | 有多产品组合和多人协作后再整理。 |

## 迁移顺序

| 阶段 | 目标 | 验收标准 |
| --- | --- | --- |
| 1 | 盘点现状 | 账号、Zone、DNS、Rules、安全策略、资源和订阅有快照。 |
| 2 | 选第一批资源 | 先从 DNS / WAF / Rules / Access 这类高风险低频配置开始。 |
| 3 | 生成配置 | 机器生成只当草稿，人工整理命名和目录。 |
| 4 | 导入 state | Terraform 能识别已有远端资源，不会重建生产资源。 |
| 5 | 对齐 plan | 目标是没有意外变更。 |
| 6 | 小步修改 | 每次只改少量规则，走 review。 |
| 7 | 锁定真源 | 被 IaC 管的资源不再手工改 Dashboard。 |

## 真源原则

| 资源 / 动作 | 推荐真源 | 判断 |
| --- | --- | --- |
| DNS、WAF、Rules、Access | Terraform / Pulumi | 入口和安全层要可 review。 |
| Worker 代码、构建、静态资产部署 | Wrangler / 项目部署脚本 | 构建产物和发布节奏更适合部署工具。 |
| D1 schema migrations | Wrangler | 资源创建和 schema 迁移是两件事。 |
| R2 / KV / D1 / Queue 资源创建 | 小项目可 Wrangler；团队后进 IaC | 数据内容和业务 schema 不要混进 Terraform state。 |
| Secrets | Wrangler secret / CI secret store / Pulumi ESC | 不写入源码、state、日志或脚本参数。 |
| 临时排障和日志 | Dashboard / Wrangler / Logs | 不是 IaC 职责。 |

## 最容易踩的坑

| 误区 | 更好的做法 |
| --- | --- |
| IaC 等于所有东西都 Terraform | 只把低频、高风险、需要 review 的配置纳入 IaC。 |
| 写完 `.tf` 就能接管已有资源 | Terraform 只能管理它创建过或 import 进 state 的资源。 |
| Dashboard 和 Terraform 混着改 | 同一个资源只能有一个真源。 |
| 生成配置可以直接进生产 | 生成结果必须人工命名、拆目录、review。 |
| state 只是缓存文件 | state 是生产资源映射，可能包含敏感信息。 |
| Terraform 能替代 Wrangler | Wrangler 仍适合 Worker 构建、部署、D1 migrations 和日志。 |
| 模块越多越专业 | Cloudflare 资源变化快，少量清晰目录通常更稳。 |
| Reference Architecture 是小项目模板 | 它是产品组合地图，小项目要降维。 |
| CI token 给全账号权限 | token 应按账号、Zone、产品和操作最小化。 |

## 普通项目路线

| 阶段 | 做什么 | 不做什么 |
| --- | --- | --- |
| 0 | Dashboard 配域名、安全和缓存；Wrangler 部署 Worker | 为了形式感搭复杂 IaC。 |
| 1 | 把 `wrangler.jsonc`、关键设置和变更记录进 Git | 把 secrets 写进仓库。 |
| 2 | 资源多后，先把 DNS / WAF / Rules / Access 纳入 IaC | 一次性迁完所有产品。 |
| 3 | 多人维护后，上 remote state、review、最小权限 token | 让 CI 拥有全账号万能 token。 |
| 4 | 产品组合复杂后，再看 Reference Architecture | 直接照搬企业网络或 SASE 大图。 |

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，适合学习教程站的信息组织。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | Cloudflare Terraform Provider。 |
| [cloudflare/cf-terraforming](https://github.com/cloudflare/cf-terraforming) | 生成 Terraform 配置和 import 命令。 |
| [pulumi/pulumi-cloudflare](https://github.com/pulumi/pulumi-cloudflare) | Pulumi Cloudflare provider。 |
| [cloudflare/cloudflare-docs Terraform source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/terraform) | 官方 Terraform 文档源文件。 |
| [Workers IaC source](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/workers/platform/infrastructure-as-code.mdx) | Workers IaC 官方源文件。 |
| [cloudflare/cloudflare-docs Reference Architecture source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/reference-architecture) | 官方参考架构源文件。 |
| [cloudflare/cloudflare-docs Migration Guides source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/migration-guides) | 官方迁移指南源文件。 |

## 官方资料

- [Cloudflare Terraform provider](https://developers.cloudflare.com/terraform/)
- [Terraform Best practices](https://developers.cloudflare.com/terraform/advanced-topics/best-practices/)
- [Import Cloudflare resources](https://developers.cloudflare.com/terraform/advanced-topics/import-cloudflare-resources/)
- [Terraform Remote R2 backend](https://developers.cloudflare.com/terraform/advanced-topics/remote-backend/)
- [Workers Infrastructure as Code](https://developers.cloudflare.com/workers/platform/infrastructure-as-code/)
- [Pulumi](https://developers.cloudflare.com/pulumi/)
- [Reference Architecture how to use](https://developers.cloudflare.com/reference-architecture/how-to-use/)
- [Migration Guides](https://developers.cloudflare.com/migration-guides/)
