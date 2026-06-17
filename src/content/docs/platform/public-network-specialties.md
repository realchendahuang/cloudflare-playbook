---
title: 公共网络与专项服务
description: 1.1.1.1、Radar、Time Services、Web3、China Network 和 Google tag gateway 的产品边界、免费边界和普通项目取舍。
---

最后核对日期：2026-06-17。

这组产品不是普通网站或 SaaS 的默认主干，而是 Cloudflare 平台里很容易被忽略、也很容易被误解的专项能力。它们分别服务于终端网络、互联网趋势研究、时间同步、Web3 网关、中国大陆访问和广告标签治理。

## 一句话判断

```text
低频专项入口
  ├─ 用户侧网络：1.1.1.1 / WARP / Time Services
  ├─ 研究与情报：Radar / Radar API / URL Scanner
  ├─ 行业专项：Web3 gateways / Google tag gateway
  └─ 区域专项：China Network / ICP / JD Cloud
```

| 需求 | 优先看 | 判断 |
| --- | --- | --- |
| 给个人设备、路由器或团队终端换 DNS resolver。 | 1.1.1.1 | 免费公共 DNS resolver，不是托管域名的 Authoritative DNS。 |
| 查全球流量、攻击、DNS、BGP、outage、域名排名趋势。 | Radar | Radar dashboard 和 Radar API 都适合研究、报告和监控，不是你账号自己的账单数据。 |
| 给系统和安全链路做时间同步。 | Time Services | NTP / NTS / Roughtime 是公共时间服务，通常由操作系统或基础设施配置，不写进应用业务代码。 |
| 访问 IPFS 或 Ethereum，但不想自运维节点。 | Web3 | Web3 是 add-on / usage-based 能力，启用前要看 dashboard pricing 和 limits。 |
| 面向中国大陆用户做低延迟和合规交付。 | China Network | Enterprise 独立订阅，必须评估 ICP、IPv6、JD Cloud 网络和产品兼容清单。 |
| 让 Google measurement tags 走第一方域名。 | Google tag gateway | 免费，但属于广告和测量场景；按 zone 生效，不是通用脚本治理产品。 |

## 免费与付费边界

| 产品 | 免费边界 | 付费或合同边界 | 普通项目建议 |
| --- | --- | --- | --- |
| 1.1.1.1 | 官方标注 available on all plans，面向终端和路由器的公共 resolver；标准 1.1.1.1 免费，Families 也提供公共过滤地址。 | 这不是你 zone 的 DNS 托管服务；域名记录、Proxy、DNSSEC 等仍看 Cloudflare DNS。 | 可以写进“本地网络调试建议”，不要把它当项目架构依赖。 |
| Radar | 官方标注 available on all plans；Radar API free；数据按 CC BY-NC 4.0 提供。 | URL Scanner 等 API 需要 account token；扫描可见性、留存和 Enterprise-only location scan 要按页面核对。 | 用于趋势研究、竞品报告、安全态势，不用于替代账号日志和账单。 |
| Time Services | NTP 文档写明 Cloudflare offers its version of NTP for free；`time.cloudflare.com` 可作为时间源。 | 官方页面没有把它包装成账号内计费产品；NTS / Roughtime 按协议和客户端支持评估。 | 服务器时间同步交给 OS / 云平台 / NTP client，应用层只依赖可信系统时间。 |
| Web3 | 总览标注 Add-on feature；limits 页列出 Free / Pro / Business 的 included usage，例如 IPFS Gateway 50 GB data transfer、Ethereum Gateway 500,000 HTTP requests。 | IPFS Gateway 和 Ethereum Gateway 都标注 paid add-on；Enterprise 可预览为 non-contract service；具体价格进入 dashboard 核对。 | 只有明确要接 IPFS / Ethereum 再启用，启用后用 Access policy / service token 或 WAF 控制内部网关。 |
| China Network | 不是普通 Free / Pro / Business 能力。 | Enterprise plan 的 separate subscription；需要 ICP filing / license，每个 apex domain 都要合规；不是所有 Cloudflare 产品都支持。 | 面向中国大陆有真实业务、合规和预算后再评估，不要把它当全球 CDN 的免费增强项。 |
| Google tag gateway | 官方写明 free to use；通过 gateway 的请求不计入 CDN、WAF、Bot Management 等其他 Cloudflare 产品用量或账单。 | 配置在 zone level，对 zone 下 hostnames、subdomains、custom hostnames 生效；不能按子域名用 Configuration Rules 开关。 | 只在广告测量和 Google tag 场景使用；子域名差异交给 Google Tag Manager triggers。 |

## 1.1.1.1

1.1.1.1 是 Cloudflare 的公共 DNS resolver。它解决的是“用户设备向谁查询域名”的问题，不解决“你的域名在哪里托管记录”的问题。

| 场景 | 该不该用 |
| --- | --- |
| 个人电脑、手机、路由器 DNS resolver | 可以。标准地址是 `1.1.1.1` / `1.0.0.1`，IPv6 为 `2606:4700:4700::1111` / `2606:4700:4700::1001`。 |
| 家庭或终端恶意站点过滤 | 可以看 1.1.1.1 for Families：malware blocking 用 `1.1.1.2` / `1.0.0.2`，malware + adult content 用 `1.1.1.3` / `1.0.0.3`。 |
| 加密 DNS 查询 | 支持 DoT、DoH、ODoH；浏览器、系统和移动端配置方式不同。 |
| Cloudflare zone 的 DNS 记录管理 | 不用它。域名托管、记录、代理状态和 DNSSEC 走 Cloudflare DNS。 |
| 应用后端固定依赖 1.1.1.1 | 一般不建议。后端解析应遵循运行环境和 VPC / 内网 DNS 设计。 |

实践上，1.1.1.1 可以放到“本地调试和终端安全”的章节里：如果用户反馈某地 DNS 污染、解析慢、运营商缓存异常，可以让用户临时切到公共 resolver 做对照测试。但它不应该成为应用代码里的硬编码依赖。

## Radar

Radar 是 Cloudflare 对全球互联网流量、攻击、路由、DNS、outage 和技术趋势的公开数据入口。它很适合这个仓库用来解释趋势和风险，但要明确两条边界：

1. Radar 反映的是 Cloudflare 基础设施看到的聚合趋势，不等于你自己账号的完整访问日志。
2. Radar API free，但仍要按 API token、数据许可、查询参数和特定功能限制来用。

| 能力 | 普通项目用途 |
| --- | --- |
| Radar dashboard | 看国家/地区、ASN、HTTP、DNS、攻击、outage、域名排名等趋势。 |
| Radar API | 做报告、图表、定期趋势抓取和自动化监控。 |
| URL Scanner | 分析 URL、域名、IP、ASN、证书、请求链、截图和恶意 verdict。 |
| Alerts | 关注国家、地区或 ASN 变化。 |
| Embedded charts | 在文章和报告里嵌入趋势图。 |

URL Scanner 还有一个内容安全细节：默认扫描报告是 Public，可出现在 recent scans 和搜索结果里；如果扫描包含敏感地址，要使用 Unlisted 等配置并核对留存策略。

## Time Services

Time Services 包含 NTP、NTS 和 Roughtime。它们不是文档站、评论系统或普通 Worker API 的业务功能，但它们对安全基础设施很重要：TLS、证书、日志时间、审计、token 过期和分布式系统都依赖可靠时间。

| 协议 | 作用 | 使用建议 |
| --- | --- | --- |
| NTP | 同步系统时间。 | 服务器和设备可配置 `time.cloudflare.com`，Linux 发行版也可能已经通过 pool.ntp.org 使用 Cloudflare time servers。 |
| NTS | 给 NTP client-server 模式增加认证。 | 安全要求更高的系统可看 Chrony、NTPsec、ntpd-rs 等客户端支持。 |
| Roughtime | 提供认证时间，目标是防止时间被中间人回拨。 | 更偏安全协议和专项客户端，不是普通 Web 应用默认依赖。 |

普通项目的最佳实践很简单：应用里不要自己造时间同步，先确保部署环境的系统时间可靠；日志和审计统一使用 UTC 或清晰时区；token、签名和缓存过期逻辑不要依赖客户端时间。

## Web3

Cloudflare Web3 提供 IPFS Gateway 和 Ethereum Gateway。它的价值是不用自己运维 IPFS / Ethereum 节点，就能通过 HTTP 接口访问这些网络。

| 能力 | 作用 | 边界 |
| --- | --- | --- |
| IPFS Gateway | 只读访问 IPFS 内容。 | paid add-on；Free / Pro / Business limits 表列出 15 个 gateways 和 50 GB included data transfer。 |
| Ethereum Gateway | 读写 Ethereum network。 | paid add-on；Free / Pro / Business limits 表列出 15 个 gateways 和 500,000 included HTTP requests。 |
| Universal Gateway | IPFS 更通用的 gateway 类型。 | limits 表显示 Enterprise 支持。 |
| Access / service tokens | 限制内部 gateway 访问。 | 内部应用调用时应优先加访问控制，不把网关裸露给所有流量。 |

这类能力不适合为了“架构完整”提前启用。只有业务确实要解析 IPFS 内容、读链上数据或提交链上交易，才应该把 Web3 加进项目；并且要单独估算 gateway 用量、缓存策略和访问控制。

## China Network

China Network 解决的是中国大陆境内访问性能和合规交付问题。它不是普通 Cloudflare CDN 的免费开关，而是 Enterprise 独立订阅，并且由 Cloudflare 与 JD Cloud 的中国大陆数据中心承载。

| 检查项 | 为什么重要 |
| --- | --- |
| Enterprise separate subscription | 没有企业合同和预算，不应把它放进普通项目默认路线。 |
| ICP filing / license | 每个要接入的 apex domain 都需要有效 ICP；未备案网站可能被关闭。 |
| IPv6 mandatory | 中国大陆公网服务要求 IPv6，China Network 会自动启用 IPv6 满足要求。 |
| 产品兼容清单 | 不是所有 Cloudflare 产品和特性都在 China Network 可用。 |
| 合规和内容审查 | 中国大陆境内内容必须遵守当地监管要求。 |

对普通开发者来说，更现实的路径是：先确认是否真的有中国大陆用户、是否有 ICP、是否有企业预算。没有这些条件时，不要把 China Network 写成“必须做”的最佳实践。

## Google tag gateway

Google tag gateway for advertisers 的核心是把 Google measurement tags 通过你的域名加载和转发，改善广告信号恢复和第一方测量路径。它不是通用评论组件、不是通用前端脚本代理，也不是 Cloudflare Zaraz 的替代品。

| 细节 | 判断 |
| --- | --- |
| 价格 | 官方写明 free to use。 |
| 账单 | 通过 gateway 的请求不计入 CDN、WAF、Bot Management 等其他产品用量或账单。 |
| 配置范围 | zone-level，启用后覆盖 zone 下 hostnames、subdomains、custom hostnames。 |
| 子域名差异 | 不能用 Cloudflare Configuration Rules 针对子域名开关；差异化触发用 Google Tag Manager triggers。 |
| 权限 | Dashboard 配置需要相应 account 或 domain 管理角色。 |

本站目前不依赖广告测量，所以不启用它；如果未来要分析广告投放和转化，再把它和 Zaraz、consent、隐私文案一起评估。

## 本站当前选择

| 能力 | 当前处理 |
| --- | --- |
| 1.1.1.1 | 放在资料和排障建议里，不作为部署依赖。 |
| Radar | 可用于写趋势分析和安全背景，不替代本站 Web Analytics / Workers Logs。 |
| Time Services | 不做应用功能；部署环境保持可靠系统时间。 |
| Web3 | 当前不需要。没有 IPFS / Ethereum 需求时不启用 add-on。 |
| China Network | 当前不需要。没有 ICP、企业合同和中国大陆专项预算时不纳入默认架构。 |
| Google tag gateway | 当前不需要。没有广告测量需求时不启用。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| 1.1.1.1 是我域名的 DNS 后台。 | 1.1.1.1 是 resolver；域名托管和代理状态看 Cloudflare DNS。 |
| Radar 可以看我站点的全部日志。 | Radar 是聚合互联网趋势；站点日志看 Web Analytics、Workers Logs、Logpush 或 GraphQL Analytics API。 |
| 时间同步和应用业务无关。 | 安全、日志、签名、缓存和过期都依赖可靠时间；但时间同步应交给系统层。 |
| Web3 有 included usage，所以一定免费。 | Web3 页面明确标注 add-on / paid add-on；启用前必须看 dashboard pricing 和 limits。 |
| China Network 是免费优化中国访问。 | 它是 Enterprise separate subscription，并且有 ICP、IPv6、产品兼容和监管边界。 |
| Google tag gateway 能按子域名随便开关。 | 它是 zone-level 配置；子域名逻辑要在 Google Tag Manager 里处理。 |

## GitHub 开源参考

| 仓库 | 值得参考的点 |
| --- | --- |
| [cloudflare/cloudflare-docs 1.1.1.1 source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/1.1.1.1) | 官方 1.1.1.1 文档源文件，适合追踪 resolver、Families、DoH / DoT / ODoH 和隐私边界。 |
| [cloudflare/cloudflare-docs Radar source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/radar) | 官方 Radar 文档源文件，适合追踪 Radar API、URL Scanner、alerts、data concepts 和 investigations。 |
| [cloudflare/radar-notebooks](https://github.com/cloudflare/radar-notebooks) | 官方 Radar notebook 示例，适合把 Radar API 数据转成图表和分析报告。 |
| [cloudflare/cloudflare-docs Time Services source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/time-services) | 官方 Time Services 文档源文件，适合追踪 NTP、NTS、Roughtime 和客户端配置。 |
| [cloudflare/cloudflare-docs Web3 source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/web3) | 官方 Web3 文档源文件，适合追踪 IPFS Gateway、Ethereum Gateway、limits 和访问限制。 |
| [cloudflare/cloudflare-docs China Network source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/china-network) | 官方 China Network 文档源文件，适合追踪 ICP、可用产品、Global Acceleration 和 JD Cloud 网络边界。 |
| [cloudflare/cloudflare-docs Google tag gateway source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/google-tag-gateway) | 官方 Google tag gateway 文档源文件，适合追踪免费边界、zone-level 限制和 Google 侧配置。 |
| [cloudflare/cloudflare-python](https://github.com/cloudflare/cloudflare-python) | 官方 Python SDK，适合自动化查询 Radar 和 Cloudflare API。 |
| [cloudflare/cloudflare-go](https://github.com/cloudflare/cloudflare-go) | 官方 Go SDK，适合服务端自动化和平台集成。 |
| [cloudflare/cloudflare-typescript](https://github.com/cloudflare/cloudflare-typescript) | 官方 TypeScript SDK，适合 Workers / Node 项目里调用 Cloudflare API。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | Terraform Provider 已覆盖包括 Google tag gateway 在内的多类资源，适合把企业配置纳入 IaC。 |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，适合继续对照教程站如何组织学习路线、专题页和资料索引。 |

## 事实来源

- [1.1.1.1 overview](https://developers.cloudflare.com/1.1.1.1/)
- [1.1.1.1 IP addresses](https://developers.cloudflare.com/1.1.1.1/ip-addresses/)
- [1.1.1.1 encryption](https://developers.cloudflare.com/1.1.1.1/encryption/)
- [1.1.1.1 privacy](https://developers.cloudflare.com/1.1.1.1/privacy/)
- [Cloudflare Radar](https://developers.cloudflare.com/radar/)
- [Make your first Radar API request](https://developers.cloudflare.com/radar/get-started/first-request/)
- [Radar URL Scanner](https://developers.cloudflare.com/radar/investigate/url-scanner/)
- [Time Services](https://developers.cloudflare.com/time-services/)
- [Using Cloudflare's Time Service](https://developers.cloudflare.com/time-services/ntp/usage/)
- [Network Time Security](https://developers.cloudflare.com/time-services/nts/)
- [Roughtime](https://developers.cloudflare.com/time-services/roughtime/)
- [Web3](https://developers.cloudflare.com/web3/)
- [Web3 limits](https://developers.cloudflare.com/web3/reference/limits/)
- [Restrict gateway access](https://developers.cloudflare.com/web3/how-to/restrict-gateway-access/)
- [Cloudflare China Network](https://developers.cloudflare.com/china-network/)
- [China Network available products and features](https://developers.cloudflare.com/china-network/reference/available-products/)
- [Internet Content Provider (ICP)](https://developers.cloudflare.com/china-network/concepts/icp/)
- [Google tag gateway for advertisers](https://developers.cloudflare.com/google-tag-gateway/)
