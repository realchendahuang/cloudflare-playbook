# Cloudflare Playbook

Cloudflare Playbook 是一个面向普通开发者、独立开发者和小团队的 Cloudflare 最佳实践内容库。

它帮助你回答这些问题：

- Cloudflare 免费额度到底能跑什么。
- 一个普通项目应该先用哪些产品。
- Workers Paid、域名计划、R2、D1、AI、日志这些费用怎么分开看。
- 文档站、官网、轻社区、小型 SaaS、文件工具、实时应用和 AI 搜索该怎么组合产品。
- 安全、成本、缓存、日志、上传、评论和后台入口应该先守住哪些边界。

线上阅读：[cloudflare-playbook.chendahuang.top](https://cloudflare-playbook.chendahuang.top/)

## 推荐阅读顺序

| 顺序 | 先读 | 解决的问题 |
| --- | --- | --- |
| 1 | [免费额度大全](https://cloudflare-playbook.chendahuang.top/platform/free-paid/) | 0 元能跑到哪里，5 美元 Workers Paid 买到什么。 |
| 2 | [学习路线](https://cloudflare-playbook.chendahuang.top/start/) | 第一次读 Cloudflare 时该按什么顺序看。 |
| 3 | [产品索引](https://cloudflare-playbook.chendahuang.top/platform/) | 把 Cloudflare 官方产品压成普通项目能用的分类。 |
| 4 | [架构模式](https://cloudflare-playbook.chendahuang.top/architecture/) | 按项目类型组合产品。 |
| 5 | [最佳实践](https://cloudflare-playbook.chendahuang.top/best-practices/) | 处理成本、安全、数据、日志和上线边界。 |
| 6 | [实战案例](https://cloudflare-playbook.chendahuang.top/recipes/) | 看具体场景怎么落地。 |
| 7 | [官方资料索引](https://cloudflare-playbook.chendahuang.top/reference/) | 回到 Cloudflare 官方文档和可验证来源。 |

## 内容地图

### 开始

| 章节 | 内容 |
| --- | --- |
| [免费额度大全](https://cloudflare-playbook.chendahuang.top/platform/free-paid/) | Cloudflare 免费层、5 美元 Workers Paid、常见产品额度和升级信号。 |
| [学习路线](https://cloudflare-playbook.chendahuang.top/start/) | 从免费额度、上线入口、动态能力、数据产品、安全边界一路读下去。 |

### 产品地图

| 章节 | 内容 |
| --- | --- |
| [产品索引](https://cloudflare-playbook.chendahuang.top/platform/) | 按 Application performance、Application security、Core platform、Developer platform 等官方大类压缩阅读路径。 |
| [Fundamentals](https://cloudflare-playbook.chendahuang.top/platform/fundamentals/) | 账号、域名、代理状态、源站保护、权限和排障入口。 |
| [Workers](https://cloudflare-playbook.chendahuang.top/platform/workers/) | 动态接口、第三方回调、评论、表单、代理和轻后端入口。 |
| [Workers Static Assets](https://cloudflare-playbook.chendahuang.top/platform/static-assets/) | 文档站、官网、博客和前端构建产物的静态资产层。 |
| [Pages](https://cloudflare-playbook.chendahuang.top/platform/pages/) | Git 协作、预览部署、纯静态站和轻量动态函数边界。 |
| [DNS](https://cloudflare-playbook.chendahuang.top/platform/dns/) | 哪些记录走代理，哪些保持 DNS only，域名迁移怎么核对。 |
| [SSL/TLS](https://cloudflare-playbook.chendahuang.top/platform/ssl-tls/) | Universal SSL、Full (strict)、源站证书和 HSTS 的起步顺序。 |
| [Cache / CDN](https://cloudflare-playbook.chendahuang.top/platform/cache/) | 静态资源缓存、HTML 边界、R2 公开文件和用户态绕过。 |
| [流量调度](https://cloudflare-playbook.chendahuang.top/platform/traffic-routing/) | 负载均衡、健康检查、四层入口、路径优化和私网调度。 |
| [源站保护与流量洪峰](https://cloudflare-playbook.chendahuang.top/platform/origin-surge/) | 源站被打满、合法峰值、回源压力、Waiting Room、Smart Shield、APO。 |
| [公共网络能力](https://cloudflare-playbook.chendahuang.top/platform/public-network-specialties/) | 1.1.1.1、Radar、Time Services、Web3、China Network、Google tag gateway。 |
| [治理、合规与学习路径](https://cloudflare-playbook.chendahuang.top/platform/governance-compliance-learning/) | 合规、脚本安全、官方支持、学习材料和团队治理。 |
| [后置协议与工具](https://cloudflare-playbook.chendahuang.top/platform/edge-protocols-utilities/) | Web3、Time Services、Randomness Beacon、Privacy Gateway、Tenant API 等补充能力。 |
| [后置开发者能力](https://cloudflare-playbook.chendahuang.top/platform/developer-network-additions/) | 事务邮件、功能灰度、构建产物、代码执行、R2 查询和助手协作。 |
| [WAF](https://cloudflare-playbook.chendahuang.top/platform/waf/) | 后台、登录、评论、上传、搜索和写接口的应用安全过滤。 |
| [DDoS Protection](https://cloudflare-playbook.chendahuang.top/platform/ddos/) | DDoS 防护、源站暴露、Under Attack Mode 和入口确认。 |
| [Rules](https://cloudflare-playbook.chendahuang.top/platform/rules/) | 跳转、改写、回源、缓存规则和旧 Page Rules 迁移。 |
| [数据产品](https://cloudflare-playbook.chendahuang.top/platform/data/) | D1、KV、R2、Queues、Durable Objects、Hyperdrive、AI Search 的数据形态选择。 |
| [D1](https://cloudflare-playbook.chendahuang.top/platform/d1/) | 评论、表单、小后台、轻业务表和关系数据边界。 |
| [KV](https://cloudflare-playbook.chendahuang.top/platform/kv/) | 读多写少配置、缓存、公开索引和一致性边界。 |
| [R2](https://cloudflare-playbook.chendahuang.top/platform/r2/) | 文件、图片、附件、备份、导入导出和对象存储成本。 |
| [Durable Objects](https://cloudflare-playbook.chendahuang.top/platform/durable-objects/) | 房间、会话、限流器、锁和单实体强一致状态。 |
| [Queues](https://cloudflare-playbook.chendahuang.top/platform/queues/) | 邮件、通知、导入、回调重试和后台异步任务。 |
| [Realtime](https://cloudflare-playbook.chendahuang.top/platform/realtime/) | 文本实时、音视频实时、RealtimeKit、Realtime SFU 和 TURN。 |
| [平台化与多租户](https://cloudflare-playbook.chendahuang.top/platform/platforms-saas/) | 客户域名、客户代码、Cloudflare for SaaS、Workers for Platforms、Dynamic Workers。 |
| [扩展计算与数据管道](https://cloudflare-playbook.chendahuang.top/platform/extended-compute-data/) | Hyperdrive、Workflows、Pipelines、Containers、R2 Data Catalog。 |
| [AI 产品](https://cloudflare-playbook.chendahuang.top/platform/ai/) | Pagefind、AI Gateway、Workers AI、AI Search、Vectorize、Agents 的选择顺序。 |
| [媒体与性能](https://cloudflare-playbook.chendahuang.top/platform/media-performance/) | 图片、视频、第三方脚本、Browser Run 和性能成本边界。 |
| [迁移与配置管理](https://cloudflare-playbook.chendahuang.top/platform/iac-migration/) | DNS、WAF、规则、Access、资源声明和配置真源。 |
| [观测与日志](https://cloudflare-playbook.chendahuang.top/platform/observability/) | Web Analytics、Workers Logs、业务事件、日志留存和敏感字段边界。 |
| [安全与网络](https://cloudflare-playbook.chendahuang.top/platform/security-networking/) | 入口代理、源站保护、写接口、Access / Tunnel、密钥和安全事件。 |
| [Zero Trust 与企业网络](https://cloudflare-playbook.chendahuang.top/platform/zero-trust-networking/) | Access、Tunnel、Gateway、设备 Client、私网访问和团队访问边界。 |
| [自有网络与专线](https://cloudflare-playbook.chendahuang.top/platform/private-networking/) | 自有公网 IP、私有网络、专线、企业网络和网络团队场景。 |
| [账单与预算](https://cloudflare-playbook.chendahuang.top/platform/billing/) | Workers Paid、域名计划、按量计费、预算提醒和账单异常排查。 |

### 架构模式

| 章节 | 内容 |
| --- | --- |
| [架构模式总览](https://cloudflare-playbook.chendahuang.top/architecture/) | 静态阅读路径、动态写入路径、数据和文件路径的组合顺序。 |
| [静态内容站](https://cloudflare-playbook.chendahuang.top/architecture/static-site/) | 文档站、官网、博客、作品集、知识库和前端应用。 |
| [接口入口](https://cloudflare-playbook.chendahuang.top/architecture/api-gateway/) | 表单、评论、第三方回调、上传、小型 SaaS 接口、AI 代理和内部服务入口。 |
| [实时应用](https://cloudflare-playbook.chendahuang.top/architecture/realtime-app/) | 聊天、在线人数、协作状态、房间、限流器和媒体实时边界。 |

### 最佳实践

| 章节 | 内容 |
| --- | --- |
| [最佳实践总览](https://cloudflare-playbook.chendahuang.top/best-practices/) | 免费额度、安全边界、升级信号和上线前检查。 |
| [文档站方案](https://cloudflare-playbook.chendahuang.top/best-practices/site-stack/) | 文档站、搜索、评论、自然语言搜索和轻社区选择。 |
| [独立开发者推荐栈](https://cloudflare-playbook.chendahuang.top/best-practices/indie-stack/) | 个人项目、开源项目、早期 SaaS、AI 工具、文件工具和后台任务组合。 |
| [安全边界](https://cloudflare-playbook.chendahuang.top/best-practices/security/) | 入口、写接口、后台、密钥、日志、Turnstile、WAF 和应急动作。 |
| [成本控制](https://cloudflare-playbook.chendahuang.top/best-practices/cost/) | 动态请求、CPU、D1、R2、AI、日志、预算提醒和付费判断。 |

### 实战案例

| 章节 | 内容 |
| --- | --- |
| [案例总览](https://cloudflare-playbook.chendahuang.top/recipes/) | 可复用的 Workers、D1、R2、上传、评论和接口案例入口。 |
| [Worker 接口 + D1](https://cloudflare-playbook.chendahuang.top/recipes/worker-api-d1/) | 轻量评论接口、输入校验、预编译 SQL、D1 数据边界和生产检查。 |
| [R2 签名上传](https://cloudflare-playbook.chendahuang.top/recipes/r2-signed-upload/) | Worker 代理上传、预签名 URL、私有下载、权限设计和生产检查。 |

### 资料索引

| 章节 | 内容 |
| --- | --- |
| [官方资料](https://cloudflare-playbook.chendahuang.top/reference/) | 官方文档、变更日志、GitHub 仓库、示例模板和学习资料。 |
| [Cloudflare 文档地图](https://cloudflare-playbook.chendahuang.top/reference/cloudflare-docs-map/) | 把 Cloudflare 官方文档大类压缩成可阅读的产品路径。 |
