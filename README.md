# Cloudflare Playbook

面向独立开发者和小型团队的 Cloudflare 实战指南，覆盖免费额度、Pages、Workers、R2、D1、KV、Email 和项目部署。

主要回答：

- Cloudflare 免费额度适用范围。
- 独立开发者项目的基础能力组合。
- Workers Paid、域名计划、R2、D1、AI、日志等费用边界。
- 常见场景该使用哪些 Cloudflare 能力。
- 安全、成本、缓存、日志、上传、评论和后台入口的处理方式。

线上阅读：[cloudflare-playbook.chendahuang.top](https://cloudflare-playbook.chendahuang.top/)

## 推荐阅读顺序

| 顺序 | 推荐阅读 |
| --- | --- |
| 1 | [免费额度大全](src/content/docs/platform/free-paid.md) |
| 2 | [学习路线](src/content/docs/start/index.md) |
| 3 | [能力清单](src/content/docs/platform/index.md) |
| 4 | [架构模式](src/content/docs/architecture/index.md) |
| 5 | [最佳实践](src/content/docs/best-practices/index.md) |
| 6 | [实战案例](src/content/docs/recipes/index.md) |

## 内容地图

### 开始

- [免费额度大全](src/content/docs/platform/free-paid.md)
- [学习路线](src/content/docs/start/index.md)

### 能力清单

#### 起步入口

- [能力清单](src/content/docs/platform/index.md)
- [Fundamentals](src/content/docs/platform/fundamentals.md)
- [DNS](src/content/docs/platform/dns.md)
- [SSL/TLS](src/content/docs/platform/ssl-tls.md)
- [Cache / CDN](src/content/docs/platform/cache.md)
- [Rules](src/content/docs/platform/rules.md)

#### 开发者平台

- [Workers](src/content/docs/platform/workers.md)
- [Workers Static Assets](src/content/docs/platform/static-assets.md)
- [Pages](src/content/docs/platform/pages.md)

#### 数据与状态

- [数据能力](src/content/docs/platform/data.md)
- [D1](src/content/docs/platform/d1.md)
- [KV](src/content/docs/platform/kv.md)
- [R2](src/content/docs/platform/r2.md)
- [Durable Objects](src/content/docs/platform/durable-objects.md)
- [Queues](src/content/docs/platform/queues.md)
- [Realtime](src/content/docs/platform/realtime.md)

#### 安全与网络

- [WAF](src/content/docs/platform/waf.md)
- [DDoS Protection](src/content/docs/platform/ddos.md)
- [安全与网络](src/content/docs/platform/security-networking.md)
- [Zero Trust 与企业网络](src/content/docs/platform/zero-trust-networking.md)
- [流量调度](src/content/docs/platform/traffic-routing.md)
- [源站保护与流量洪峰](src/content/docs/platform/origin-surge.md)
- [自有网络与专线](src/content/docs/platform/private-networking.md)

#### 进阶能力

- [AI 能力](src/content/docs/platform/ai.md)
- [媒体与性能](src/content/docs/platform/media-performance.md)
- [平台化与多租户](src/content/docs/platform/platforms-saas.md)
- [扩展计算与数据管道](src/content/docs/platform/extended-compute-data.md)
- [公共网络能力](src/content/docs/platform/public-network-specialties.md)
- [进阶协议与工具](src/content/docs/platform/edge-protocols-utilities.md)
- [进阶开发者能力](src/content/docs/platform/developer-network-additions.md)

#### 成本与治理

- [免费额度大全](src/content/docs/platform/free-paid.md)
- [账单与预算](src/content/docs/platform/billing.md)
- [观测与日志](src/content/docs/platform/observability.md)
- [迁移与配置管理](src/content/docs/platform/iac-migration.md)
- [治理、合规与学习路径](src/content/docs/platform/governance-compliance-learning.md)

### 架构模式

- [架构模式总览](src/content/docs/architecture/index.md)
- [静态内容站](src/content/docs/architecture/static-site.md)
- [接口入口](src/content/docs/architecture/api-gateway.md)
- [实时应用](src/content/docs/architecture/realtime-app.md)

### 最佳实践

- [最佳实践总览](src/content/docs/best-practices/index.md)
- [文档站方案](src/content/docs/best-practices/site-stack.md)
- [独立开发者推荐栈](src/content/docs/best-practices/indie-stack.md)
- [上线安全](src/content/docs/best-practices/security.md)
- [成本控制](src/content/docs/best-practices/cost.md)

### 实战案例

- [案例总览](src/content/docs/recipes/index.md)
- [Cloudflare 帖子合集](src/content/docs/recipes/cloudflare-posts.md)
- [开源项目案例](src/content/docs/recipes/open-source-cases.md)
- [Worker 接口 + D1](src/content/docs/recipes/worker-api-d1.md)
- [R2 签名上传](src/content/docs/recipes/r2-signed-upload.md)
