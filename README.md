# Cloudflare Playbook

Cloudflare Playbook 是一个面向普通开发者、独立开发者和小团队的 Cloudflare 最佳实践知识库。它帮助读者理解 Workers、Pages、D1、KV、R2、Durable Objects、Queues、AI、安全、缓存、部署和可观测性在真实项目里应该怎么选、怎么组合、怎么验证。

这个仓库使用 Astro + Starlight 搭建文档站，通过 Cloudflare Workers Static Assets 部署，并使用 Starlight 生态主题与 Twikoo 评论组件。它定位为面向 Cloudflare 实践的开源知识库样板。

> Cloudflare 提供了覆盖计算、存储、网络、安全、AI 和可观测性的完整平台。对独立开发者和早期团队来说，理解这些产品的边界和组合方式，可以显著降低项目启动和运维成本。

线上站点：[cloudflare-playbook.chendahuang.top](https://cloudflare-playbook.chendahuang.top/)

## 当前定位

- **产品地图**：解释 Cloudflare 主要产品各自解决什么问题。
- **架构模式**：整理静态站点、API 网关、SaaS 后端、实时应用、AI 应用、文件服务等常见组合。
- **最佳实践**：沉淀成本、安全、缓存、可观测性、部署和回滚经验。
- **实战案例**：用可复现步骤展示如何把产品组合落到代码和配置里。
- **资料索引**：优先链接 Cloudflare 官方文档、变更日志和可验证来源。

## 文档主页

所有文档既可以在 GitHub 仓库里直接看，也可以在网站里看。

| 文档 | 仓库文件 | 网站 |
| --- | --- | --- |
| 首页 | [src/content/docs/index.mdx](src/content/docs/index.mdx) | [打开](https://cloudflare-playbook.chendahuang.top/) |
| 学习路线 | [src/content/docs/start/index.md](src/content/docs/start/index.md) | [打开](https://cloudflare-playbook.chendahuang.top/start/) |
| Cloudflare 产品大图谱 | [src/content/docs/platform/index.md](src/content/docs/platform/index.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/) |
| Fundamentals | [src/content/docs/platform/fundamentals.md](src/content/docs/platform/fundamentals.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/fundamentals/) |
| Workers | [src/content/docs/platform/workers.md](src/content/docs/platform/workers.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/workers/) |
| Workers Static Assets | [src/content/docs/platform/static-assets.md](src/content/docs/platform/static-assets.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/static-assets/) |
| Pages | [src/content/docs/platform/pages.md](src/content/docs/platform/pages.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/pages/) |
| DNS | [src/content/docs/platform/dns.md](src/content/docs/platform/dns.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/dns/) |
| SSL/TLS | [src/content/docs/platform/ssl-tls.md](src/content/docs/platform/ssl-tls.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/ssl-tls/) |
| Cache / CDN | [src/content/docs/platform/cache.md](src/content/docs/platform/cache.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/cache/) |
| 流量调度与四层入口 | [src/content/docs/platform/traffic-routing.md](src/content/docs/platform/traffic-routing.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/traffic-routing/) |
| 源站保护与流量洪峰 | [src/content/docs/platform/origin-surge.md](src/content/docs/platform/origin-surge.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/origin-surge/) |
| 公共网络与专项服务 | [src/content/docs/platform/public-network-specialties.md](src/content/docs/platform/public-network-specialties.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/public-network-specialties/) |
| 治理、合规与学习路径 | [src/content/docs/platform/governance-compliance-learning.md](src/content/docs/platform/governance-compliance-learning.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/governance-compliance-learning/) |
| 低频协议与平台工具 | [src/content/docs/platform/edge-protocols-utilities.md](src/content/docs/platform/edge-protocols-utilities.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/edge-protocols-utilities/) |
| 开发者与网络补充专项 | [src/content/docs/platform/developer-network-additions.md](src/content/docs/platform/developer-network-additions.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/developer-network-additions/) |
| WAF | [src/content/docs/platform/waf.md](src/content/docs/platform/waf.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/waf/) |
| DDoS Protection | [src/content/docs/platform/ddos.md](src/content/docs/platform/ddos.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/ddos/) |
| Rules | [src/content/docs/platform/rules.md](src/content/docs/platform/rules.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/rules/) |
| 数据产品 | [src/content/docs/platform/data.md](src/content/docs/platform/data.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/data/) |
| D1 | [src/content/docs/platform/d1.md](src/content/docs/platform/d1.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/d1/) |
| KV | [src/content/docs/platform/kv.md](src/content/docs/platform/kv.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/kv/) |
| R2 | [src/content/docs/platform/r2.md](src/content/docs/platform/r2.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/r2/) |
| Durable Objects | [src/content/docs/platform/durable-objects.md](src/content/docs/platform/durable-objects.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/durable-objects/) |
| Queues | [src/content/docs/platform/queues.md](src/content/docs/platform/queues.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/queues/) |
| Realtime | [src/content/docs/platform/realtime.md](src/content/docs/platform/realtime.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/realtime/) |
| 平台化与多租户 | [src/content/docs/platform/platforms-saas.md](src/content/docs/platform/platforms-saas.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/platforms-saas/) |
| 扩展计算与数据管道 | [src/content/docs/platform/extended-compute-data.md](src/content/docs/platform/extended-compute-data.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/extended-compute-data/) |
| AI 产品 | [src/content/docs/platform/ai.md](src/content/docs/platform/ai.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/ai/) |
| 媒体与性能 | [src/content/docs/platform/media-performance.md](src/content/docs/platform/media-performance.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/media-performance/) |
| 迁移与 IaC | [src/content/docs/platform/iac-migration.md](src/content/docs/platform/iac-migration.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/iac-migration/) |
| 观测与日志 | [src/content/docs/platform/observability.md](src/content/docs/platform/observability.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/observability/) |
| 安全与网络 | [src/content/docs/platform/security-networking.md](src/content/docs/platform/security-networking.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/security-networking/) |
| Zero Trust 与企业网络 | [src/content/docs/platform/zero-trust-networking.md](src/content/docs/platform/zero-trust-networking.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/zero-trust-networking/) |
| 自有网络与专线 | [src/content/docs/platform/private-networking.md](src/content/docs/platform/private-networking.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/private-networking/) |
| 免费额度大全 | [src/content/docs/platform/free-paid.md](src/content/docs/platform/free-paid.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/free-paid/) |
| Billing | [src/content/docs/platform/billing.md](src/content/docs/platform/billing.md) | [打开](https://cloudflare-playbook.chendahuang.top/platform/billing/) |
| 架构模式总览 | [src/content/docs/architecture/index.md](src/content/docs/architecture/index.md) | [打开](https://cloudflare-playbook.chendahuang.top/architecture/) |
| 静态内容站 | [src/content/docs/architecture/static-site.md](src/content/docs/architecture/static-site.md) | [打开](https://cloudflare-playbook.chendahuang.top/architecture/static-site/) |
| API 网关 | [src/content/docs/architecture/api-gateway.md](src/content/docs/architecture/api-gateway.md) | [打开](https://cloudflare-playbook.chendahuang.top/architecture/api-gateway/) |
| 实时应用 | [src/content/docs/architecture/realtime-app.md](src/content/docs/architecture/realtime-app.md) | [打开](https://cloudflare-playbook.chendahuang.top/architecture/realtime-app/) |
| 最佳实践总览 | [src/content/docs/best-practices/index.md](src/content/docs/best-practices/index.md) | [打开](https://cloudflare-playbook.chendahuang.top/best-practices/) |
| 本站技术栈 | [src/content/docs/best-practices/site-stack.md](src/content/docs/best-practices/site-stack.md) | [打开](https://cloudflare-playbook.chendahuang.top/best-practices/site-stack/) |
| 独立开发者推荐栈 | [src/content/docs/best-practices/indie-stack.md](src/content/docs/best-practices/indie-stack.md) | [打开](https://cloudflare-playbook.chendahuang.top/best-practices/indie-stack/) |
| Codex 协作 | [src/content/docs/best-practices/codex-cloudflare.md](src/content/docs/best-practices/codex-cloudflare.md) | [打开](https://cloudflare-playbook.chendahuang.top/best-practices/codex-cloudflare/) |
| 安全边界 | [src/content/docs/best-practices/security.md](src/content/docs/best-practices/security.md) | [打开](https://cloudflare-playbook.chendahuang.top/best-practices/security/) |
| 成本控制 | [src/content/docs/best-practices/cost.md](src/content/docs/best-practices/cost.md) | [打开](https://cloudflare-playbook.chendahuang.top/best-practices/cost/) |
| 实战案例总览 | [src/content/docs/recipes/index.md](src/content/docs/recipes/index.md) | [打开](https://cloudflare-playbook.chendahuang.top/recipes/) |
| Worker API + D1 | [src/content/docs/recipes/worker-api-d1.md](src/content/docs/recipes/worker-api-d1.md) | [打开](https://cloudflare-playbook.chendahuang.top/recipes/worker-api-d1/) |
| R2 签名上传 | [src/content/docs/recipes/r2-signed-upload.md](src/content/docs/recipes/r2-signed-upload.md) | [打开](https://cloudflare-playbook.chendahuang.top/recipes/r2-signed-upload/) |
| 官方资料索引 | [src/content/docs/reference/index.md](src/content/docs/reference/index.md) | [打开](https://cloudflare-playbook.chendahuang.top/reference/) |
| Cloudflare 文档地图 | [src/content/docs/reference/cloudflare-docs-map.md](src/content/docs/reference/cloudflare-docs-map.md) | [打开](https://cloudflare-playbook.chendahuang.top/reference/cloudflare-docs-map/) |

## 当前技术栈

```text
Astro + Starlight
  ├─ Markdown / MDX 文档
  ├─ Pagefind 站内搜索
  ├─ Starlight Theme Next 主题
  ├─ Twikoo 评论组件
  └─ dist 静态资产

Cloudflare Worker
  ├─ Workers Static Assets 托管文档站
  └─ Twikoo Cloudflare Worker 承载评论服务

Cloudflare D1
  └─ 保存 Twikoo 评论数据
```

搜索先使用 Starlight 默认的 Pagefind，评论使用 Twikoo 连接 Cloudflare Worker 和 D1。等内容规模变大后，再评估 Cloudflare AI Search 做自然语言搜索。

## 本地开发

环境要求：

- Node.js >= 22.12.0
- pnpm 10+

```bash
pnpm install
pnpm dev
```

构建静态站点：

```bash
pnpm build
```

本地预览构建产物：

```bash
pnpm preview
```

## 部署到 Cloudflare Workers

构建并部署：

```bash
pnpm build
pnpm run deploy
```

`wrangler.jsonc` 是部署配置真源，当前包含：

```text
assets.directory = ./dist
routes.pattern = cloudflare-playbook.chendahuang.top
```

评论服务使用单独的 Worker 配置：

```text
wrangler.comments.jsonc
comments.cloudflare-playbook.chendahuang.top
```

## 写作原则

- 官方事实优先：限制、价格、API、配置字段必须回到 Cloudflare 官方文档核对。
- 面向普通人：先解释“什么时候用”和“什么时候不用”，再给配置和代码。
- 保持可复现：案例需要包含环境、输入、关键配置、验证方式和风险提示。
- 不确定就标注：无法确认的内容写成 `TODO` 或说明待核对。
- 过时就更新：Cloudflare 产品变化快，旧结论要及时修订或删除。

## 贡献方向

欢迎补充：

- 某个 Cloudflare 产品的入门解释。
- 一个真实架构的产品组合图和取舍说明。
- 一个可跑通的 Workers / Pages / D1 / R2 / Durable Objects 案例。
- 成本、安全、缓存、日志、回滚相关的踩坑记录。
- 官方文档更新后的同步修订。
