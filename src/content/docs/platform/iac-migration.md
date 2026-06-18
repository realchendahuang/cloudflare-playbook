---
title: 迁移与 IaC
description: Cloudflare 迁移、Terraform、Pulumi、Wrangler 和配置真源管理。
---

最后核对日期：2026-06-18。

IaC 不是把所有 Cloudflare 配置都写成 Terraform。先问一个更小的问题：这个配置改错会不会影响入口、安全、账单或生产数据？会，就逐步纳入可复核的配置真源；不会，就先保持简单。

## 先判断

| 场景 | 建议 | 先做什么 |
| --- | --- | --- |
| 单人项目、刚接入 Cloudflare | 不急。 | Dashboard + Wrangler + Git 记录变更。 |
| DNS、WAF、Rules、Access 变多 | 应该上。 | 先盘点现状，再按资源逐步接管。 |
| 多人维护生产域名 | 应该上。 | 入口和安全配置要有人复核。 |
| Worker 开发和部署 | 不一定。 | Wrangler 仍然是最直接的构建和部署入口。 |
| 已有大量 Dashboard 配置 | 谨慎迁移。 | 先导出现状，不要直接 apply。 |
| 团队已有 Terraform / Pulumi | 可以沿用。 | 同一资源不要混用 Dashboard 和 IaC 修改。 |

## 工具边界

| 工具 | 适合 | 不适合 |
| --- | --- | --- |
| Dashboard | 早期试错、低风险配置。 | 多人生产变更唯一真源。 |
| Wrangler | Worker 本地开发、构建、部署、D1 migrations、日志。 | 管所有账号和 Zone 配置。 |
| Terraform / Pulumi | DNS、Rules、WAF、Access、账号和 Zone 级资源。 | 不导入现有资源就强行接管。 |
| 生成/导入工具 | 把已有配置变成迁移草稿。 | 不复核就直接进生产。 |
| Remote state | 团队共享 IaC 状态。 | 公开存放或把密钥写进仓库。 |

## 先纳入哪些配置

| 顺序 | 资源 | 原因 |
| --- | --- | --- |
| 先纳入 | DNS records、SSL/TLS、Redirects | 入口层改错影响最大。 |
| 先纳入 | WAF、Rate Limiting、Access | 安全策略需要复核和回滚。 |
| 再纳入 | Cache Rules、Origin Rules、Transform Rules | 会影响缓存、回源、URL 和成本。 |
| 再纳入 | R2、KV、D1、Queues 等资源声明 | 资源归属要清楚；数据内容不要进 state。 |
| 最后看 | Worker deployment | 只有团队需要统一发布模型时再上。 |

## 迁移原则

先盘点，再导入，再小步 apply。生成配置只当草稿，不复核不要进生产；被 IaC 管住的资源，就不要再从 Dashboard 手工改。DNS、WAF、Rules、Access 这类低频高风险配置最值得先纳入；Worker 代码、D1 migrations、临时排障和日志仍然交给 Wrangler / Dashboard 更直接。

## 最容易踩坑

| 误区 | 更好的做法 |
| --- | --- |
| IaC 等于所有东西都 Terraform。 | 只把低频、高风险、需要复核的配置纳入 IaC。 |
| 写完配置就能接管已有资源。 | 先 import / 导入 state，再看 plan。 |
| Dashboard 和 IaC 混着改。 | 同一个资源只能有一个真源。 |
| 生成配置可以直接进生产。 | 生成结果必须人工命名、拆目录和复核。 |
| state 只是缓存文件。 | state 是生产资源映射，可能包含敏感信息。 |
| Terraform 能替代 Wrangler。 | Wrangler 仍适合 Worker 构建、部署、D1 migrations 和日志。 |
| 模块越多越专业。 | 少量清晰目录通常更稳。 |
| CI 访问凭证给全账号权限。 | 访问凭证按账号、Zone、产品和操作最小化。 |

## 事实来源

- [Cloudflare Terraform provider](https://developers.cloudflare.com/terraform/)
- [Terraform Best practices](https://developers.cloudflare.com/terraform/advanced-topics/best-practices/)
- [Import Cloudflare resources](https://developers.cloudflare.com/terraform/advanced-topics/import-cloudflare-resources/)
- [Terraform Remote R2 backend](https://developers.cloudflare.com/terraform/advanced-topics/remote-backend/)
- [Workers Infrastructure as Code](https://developers.cloudflare.com/workers/platform/infrastructure-as-code/)
- [Pulumi](https://developers.cloudflare.com/pulumi/)
- [Reference Architecture how to use](https://developers.cloudflare.com/reference-architecture/how-to-use/)
