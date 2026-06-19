# Cloudflare Playbook

一份面向独立开发者和一人公司的 Cloudflare 实战指南：从免费套餐、Pages、Workers、R2、D1、KV、Email 到完整项目部署，能省钱的地方狠狠省。

这份手册主要回答几类问题：

- Cloudflare 免费额度到底能跑什么。
- 独立开发者项目应该先接哪些能力。
- Workers Paid、域名计划、R2、D1、AI、日志这些费用怎么分开看。
- 文档站、官网、轻社区、小型 SaaS、文件工具、实时应用和 AI 搜索该怎么搭。
- 安全、成本、缓存、日志、上传、评论和后台入口先守住哪些边界。

线上阅读：[cloudflare-playbook.chendahuang.top](https://cloudflare-playbook.chendahuang.top/)

## 推荐阅读顺序

| 顺序 | 先读 | 解决的问题 |
| --- | --- | --- |
| 1 | [免费额度大全](src/content/docs/platform/free-paid.md) | 0 元能跑到哪里，5 美元 Workers Paid 买到什么。 |
| 2 | [学习路线](src/content/docs/start/index.md) | 第一次系统看 Cloudflare 时该按什么顺序读。 |
| 3 | [能力清单](src/content/docs/platform/index.md) | 把 Cloudflare 能力整理成独立开发者项目能用的分类。 |
| 4 | [架构模式](src/content/docs/architecture/index.md) | 按项目类型组合能力。 |
| 5 | [最佳实践](src/content/docs/best-practices/index.md) | 处理成本、安全、数据、日志和上线边界。 |
| 6 | [实战案例](src/content/docs/recipes/index.md) | 看具体场景怎么落地。 |

## 内容地图

### 开始

| 章节 | 内容 |
| --- | --- |
| [免费额度大全](src/content/docs/platform/free-paid.md) | Cloudflare 免费层、5 美元 Workers Paid、常见能力额度和升级信号。 |
| [学习路线](src/content/docs/start/index.md) | 按免费额度、上线入口、动态功能、数据能力和安全边界读。 |

### 能力清单

| 章节 | 内容 |
| --- | --- |
| [能力清单](src/content/docs/platform/index.md) | 按入口、性能、安全、开发者平台等常用视角整理阅读路径。 |
| [Fundamentals](src/content/docs/platform/fundamentals.md) | 账号、域名、代理状态、源站保护、权限和排障入口。 |
| [Workers](src/content/docs/platform/workers.md) | 动态接口、第三方回调、评论、表单、代理和轻后端入口。 |
| [Workers Static Assets](src/content/docs/platform/static-assets.md) | 文档站、官网、博客和前端构建产物的静态资产层。 |
| [Pages](src/content/docs/platform/pages.md) | Git 协作、预览部署、纯静态站和轻量动态函数边界。 |
| [DNS](src/content/docs/platform/dns.md) | 哪些记录走代理，哪些保持 DNS only，域名迁移怎么核对。 |
| [SSL/TLS](src/content/docs/platform/ssl-tls.md) | Universal SSL、Full (strict)、源站证书和 HSTS 的起步顺序。 |
| [Cache / CDN](src/content/docs/platform/cache.md) | 静态资源缓存、HTML 边界、R2 公开文件和用户态绕过。 |
| [流量调度](src/content/docs/platform/traffic-routing.md) | 负载均衡、健康检查、四层入口、路径优化和私网调度。 |
| [源站保护与流量洪峰](src/content/docs/platform/origin-surge.md) | 源站被打满、合法峰值、回源压力、Waiting Room、Smart Shield、APO。 |
| [公共网络能力](src/content/docs/platform/public-network-specialties.md) | 1.1.1.1、Radar、Time Services、Web3、China Network、Google tag gateway。 |
| [治理、合规与学习路径](src/content/docs/platform/governance-compliance-learning.md) | 合规、脚本安全、支持渠道、学习材料和团队治理。 |
| [进阶协议与工具](src/content/docs/platform/edge-protocols-utilities.md) | Web3、Time Services、Randomness Beacon、Privacy Gateway、Tenant API 等补充能力。 |
| [进阶开发者能力](src/content/docs/platform/developer-network-additions.md) | 事务邮件、灰度发布、构建产物、代码执行、R2 查询和助手协作。 |
| [WAF](src/content/docs/platform/waf.md) | 后台、登录、评论、上传、搜索和写接口的应用安全过滤。 |
| [DDoS Protection](src/content/docs/platform/ddos.md) | DDoS 防护、源站暴露、Under Attack Mode 和入口确认。 |
| [Rules](src/content/docs/platform/rules.md) | 跳转、改写、回源、缓存规则和旧 Page Rules 迁移。 |
| [数据能力](src/content/docs/platform/data.md) | D1、KV、R2、Queues、Durable Objects、Hyperdrive、AI Search 的数据形态选择。 |
| [D1](src/content/docs/platform/d1.md) | 评论、表单、小后台、轻业务表和关系数据边界。 |
| [KV](src/content/docs/platform/kv.md) | 读多写少配置、缓存、公开索引和一致性边界。 |
| [R2](src/content/docs/platform/r2.md) | 文件、图片、附件、备份、导入导出和对象存储成本。 |
| [Durable Objects](src/content/docs/platform/durable-objects.md) | 房间、会话、限流器、锁和单实体强一致状态。 |
| [Queues](src/content/docs/platform/queues.md) | 邮件、通知、导入、回调重试和后台异步任务。 |
| [Realtime](src/content/docs/platform/realtime.md) | 文本实时、音视频实时、RealtimeKit、Realtime SFU 和 TURN。 |
| [平台化与多租户](src/content/docs/platform/platforms-saas.md) | 客户域名、客户代码、Cloudflare for SaaS、Workers for Platforms、Dynamic Workers。 |
| [扩展计算与数据管道](src/content/docs/platform/extended-compute-data.md) | Hyperdrive、Workflows、Pipelines、Containers、R2 Data Catalog。 |
| [AI 能力](src/content/docs/platform/ai.md) | Pagefind、AI Gateway、Workers AI、AI Search、Vectorize、Agents 的选择顺序。 |
| [媒体与性能](src/content/docs/platform/media-performance.md) | 图片、视频、第三方脚本、Browser Run 和性能成本边界。 |
| [迁移与配置管理](src/content/docs/platform/iac-migration.md) | DNS、WAF、规则、Access、资源声明和配置真源。 |
| [观测与日志](src/content/docs/platform/observability.md) | Web Analytics、Workers Logs、业务事件、日志留存和敏感字段边界。 |
| [安全与网络](src/content/docs/platform/security-networking.md) | 入口代理、源站保护、写接口、Access / Tunnel、密钥和安全事件。 |
| [Zero Trust 与企业网络](src/content/docs/platform/zero-trust-networking.md) | Access、Tunnel、Gateway、设备 Client、私网访问和团队访问边界。 |
| [自有网络与专线](src/content/docs/platform/private-networking.md) | 自有公网 IP、私有网络、专线、企业网络和网络团队场景。 |
| [账单与预算](src/content/docs/platform/billing.md) | Workers Paid、域名计划、按量计费、预算提醒和账单异常排查。 |

### 架构模式

| 章节 | 内容 |
| --- | --- |
| [架构模式总览](src/content/docs/architecture/index.md) | 静态阅读、动态写入、数据和文件路径怎么组合。 |
| [静态内容站](src/content/docs/architecture/static-site.md) | 文档站、官网、博客、作品集、知识库和前端应用。 |
| [接口入口](src/content/docs/architecture/api-gateway.md) | 表单、评论、第三方回调、上传、小型 SaaS 接口、AI 代理和内部服务入口。 |
| [实时应用](src/content/docs/architecture/realtime-app.md) | 聊天、在线人数、协作状态、房间、限流器和媒体实时边界。 |

### 最佳实践

| 章节 | 内容 |
| --- | --- |
| [最佳实践总览](src/content/docs/best-practices/index.md) | 免费额度、安全边界、升级信号和上线前检查。 |
| [文档站方案](src/content/docs/best-practices/site-stack.md) | 文档站、搜索、评论、自然语言搜索和轻社区选择。 |
| [独立开发者推荐栈](src/content/docs/best-practices/indie-stack.md) | 个人项目、开源项目、早期 SaaS、AI 工具、文件工具和后台任务组合。 |
| [安全边界](src/content/docs/best-practices/security.md) | 入口、写接口、后台、密钥、日志、Turnstile、WAF 和应急动作。 |
| [成本控制](src/content/docs/best-practices/cost.md) | 动态请求、CPU、D1、R2、AI、日志、预算提醒和付费判断。 |

### 实战案例

| 章节 | 内容 |
| --- | --- |
| [案例总览](src/content/docs/recipes/index.md) | 可复用的 Workers、D1、R2、上传、评论和接口案例入口。 |
| [Worker 接口 + D1](src/content/docs/recipes/worker-api-d1.md) | 轻量评论接口、输入校验、预编译 SQL、D1 数据边界和生产检查。 |
| [R2 签名上传](src/content/docs/recipes/r2-signed-upload.md) | Worker 代理上传、预签名 URL、私有下载、权限设计和生产检查。 |
