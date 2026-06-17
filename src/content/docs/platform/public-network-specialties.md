---
title: 公共网络与专项服务
description: 1.1.1.1、Radar、Time Services、Web3、China Network 和 Google tag gateway 的普通项目取舍。
---

最后核对日期：2026-06-18。

这一组不是普通网站的默认主干。它们更像 Cloudflare 的专项工具：有的服务终端网络，有的服务趋势研究，有的服务中国大陆交付、Web3 网关或广告测量。普通项目先把 DNS、SSL/TLS、Cache、WAF、DDoS、Workers、数据产品和账单边界做好，再看这里。

## 一句话判断

| 需求 | 看什么 | 普通项目判断 |
| --- | --- | --- |
| 给个人设备、路由器或团队终端换 DNS resolver。 | 1.1.1.1 | 免费公共 resolver，不是你域名的 DNS 托管后台。 |
| 查全球流量、攻击、DNS、BGP、outage 和域名趋势。 | Radar | 适合研究和报告，不替代账号日志、账单和 Web Analytics。 |
| 给系统做可信时间同步。 | Time Services | 交给操作系统或基础设施，不写进应用业务代码。 |
| 访问 IPFS 或 Ethereum，不想自运维节点。 | Web3 Gateways | 有 usage-based billing，只有明确链上或 IPFS 需求才启用。 |
| 面向中国大陆用户做性能和合规交付。 | China Network | Enterprise separate subscription，还要 ICP、IPv6 和产品兼容检查。 |
| 让 Google measurement tags 走第一方域名。 | Google tag gateway | 免费广告测量专项，不是通用脚本治理。 |

## 免费与付费边界

| 产品 | 免费 / 计划边界 | 什么时候值得看 |
| --- | --- | --- |
| 1.1.1.1 | Available on all plans，标准公共 DNS resolver 免费，Families 提供公共过滤地址。 | 终端排障、家庭网络、团队设备 DNS 对照测试。 |
| Radar | Available on all plans；Radar API free，数据以 CC BY-NC 4.0 提供。 | 写趋势分析、安全背景、行业报告或自动化趋势监控。 |
| Time Services | Cloudflare 提供 NTP、NTS、Roughtime；NTP 服务公开可用。 | 服务器、设备、日志、证书、签名和审计依赖可靠时间时。 |
| Web3 Gateways | IPFS / Ethereum 在 Free / Pro / Business 可用，但标注 usage-based billing；Free / Pro / Business included usage 分别有 IPFS 50 GB transfer、Ethereum 500,000 HTTP requests。 | 业务确实需要 IPFS 内容或 Ethereum RPC，而不是为了“架构完整”。 |
| China Network | Enterprise plan 的 separate subscription；不是 Free / Pro / Business 默认能力。 | 有中国大陆真实业务、ICP、企业预算和本地合规要求。 |
| Google tag gateway | 官方写明 free to use；通过 gateway 的请求不计入 CDN、WAF、Bot Management 等用量或账单。 | 已经使用 Google 广告 / 分析标签，并需要第一方测量路径。 |

## 产品边界

| 产品 | 解决什么 | 不解决什么 |
| --- | --- | --- |
| 1.1.1.1 | 用户设备向谁解析域名。 | 不管理你的 DNS records、Proxy 状态、DNSSEC 或 zone 配置。 |
| Radar | 聚合互联网趋势、URL 扫描和研究数据。 | 不等于你的站点日志、用户行为分析或计费报表。 |
| Time Services | NTP / NTS / Roughtime 时间服务。 | 不替代应用里的权限、签名和审计设计。 |
| Web3 | HTTP 访问 IPFS / Ethereum 网络。 | 不替代区块链业务设计、钱包安全、缓存和访问控制。 |
| China Network | 中国大陆数据中心里的性能和安全交付。 | 不自动解决 ICP、内容合规、产品兼容和企业预算。 |
| Google tag gateway | Google measurement tags 第一方加载与转发。 | 不替代 Zaraz、Consent、CSP 或通用第三方脚本治理。 |

## 推荐顺序

| 顺序 | 动作 | 原因 |
| --- | --- | --- |
| 1 | 先判断它是不是当前项目的主问题。 | 这些都是专项能力，不是“所有 Cloudflare 项目都要开”。 |
| 2 | 再看免费边界和计划边界。 | Web3、China Network、企业功能容易被误读成普通免费能力。 |
| 3 | 最后看使用风险。 | URL 扫描可见性、Web3 网关裸露、China Network 合规、广告测量隐私都需要单独判断。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| 1.1.1.1 是我域名的 DNS 后台。 | 1.1.1.1 是 resolver；域名托管和代理状态看 Cloudflare DNS。 |
| Radar 可以看我站点的全部日志。 | Radar 是聚合互联网趋势；站点日志看 Web Analytics、Workers Logs、Logpush 或 GraphQL Analytics API。 |
| 时间同步和应用无关。 | 安全、日志、签名和缓存都依赖可靠时间；但同步本身应在系统层完成。 |
| Web3 有 included usage，所以一定免费。 | Web3 Gateways 标注 usage-based billing；启用前必须看 dashboard 和 limits。 |
| China Network 是免费优化中国访问。 | 它是 Enterprise separate subscription，并且有 ICP、IPv6、产品兼容和监管边界。 |
| Google tag gateway 能按子域名随便开关。 | 它是 zone-level 配置；子域名差异通常交给 Google Tag Manager triggers。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs 1.1.1.1 source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/1.1.1.1) | resolver、Families、DoH / DoT / ODoH 和隐私边界。 |
| [cloudflare/cloudflare-docs Radar source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/radar) | Radar API、URL Scanner、alerts 和数据概念。 |
| [cloudflare/radar-notebooks](https://github.com/cloudflare/radar-notebooks) | 用 Radar API 做图表和报告。 |
| [cloudflare/cloudflare-docs Time Services source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/time-services) | NTP、NTS、Roughtime 和客户端配置。 |
| [cloudflare/cloudflare-docs Web3 source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/web3) | IPFS Gateway、Ethereum Gateway、limits 和访问限制。 |
| [cloudflare/cloudflare-docs China Network source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/china-network) | ICP、可用产品、Global Acceleration 和 JD Cloud 网络边界。 |
| [cloudflare/cloudflare-docs Google tag gateway source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/google-tag-gateway) | 免费边界、zone-level 限制和 Google 侧配置。 |

## 事实来源

- [1.1.1.1 overview](https://developers.cloudflare.com/1.1.1.1/)
- [Cloudflare Radar](https://developers.cloudflare.com/radar/)
- [Radar URL Scanner](https://developers.cloudflare.com/radar/investigate/url-scanner/)
- [Time Services](https://developers.cloudflare.com/time-services/)
- [Web3 limits](https://developers.cloudflare.com/web3/reference/limits/)
- [Restrict gateway access](https://developers.cloudflare.com/web3/how-to/restrict-gateway-access/)
- [Cloudflare China Network](https://developers.cloudflare.com/china-network/)
- [China Network available products and features](https://developers.cloudflare.com/china-network/reference/available-products/)
- [Internet Content Provider (ICP)](https://developers.cloudflare.com/china-network/concepts/icp/)
- [Google tag gateway for advertisers](https://developers.cloudflare.com/google-tag-gateway/)
