---
title: 公共网络能力
description: 终端 DNS、趋势研究、时间同步、Web3、区域交付和广告测量怎么判断。
---

最后核对日期：2026-06-18。具体价格、计划和可用区域以官方页面为准。

这些能力不是 Cloudflare 项目的默认主干。普通项目先把 DNS、SSL/TLS、Cache、WAF、DDoS、Workers 和数据产品跑通，再按真实场景补。

## 先判断是不是你的问题

| 你遇到的问题 | 看什么 | 不要误会 |
| --- | --- | --- |
| 给设备或团队终端换 DNS resolver。 | 1.1.1.1。 | 它不是域名记录后台。 |
| 做行业研究、趋势报告、安全背景分析。 | Radar。 | 它不是站点访问日志。 |
| 服务器、设备、签名和日志依赖可靠时间。 | Time Services。 | 不要写成业务逻辑。 |
| 业务确实需要 IPFS 或 Ethereum RPC。 | Web3 Gateways。 | 不要为了“架构完整”而开。 |
| 面向中国大陆用户做合规和性能交付。 | China Network。 | 它不是免费加速开关。 |
| 已经使用 Google 广告 / 分析标签。 | Google tag gateway。 | 它不是通用第三方脚本治理。 |

## 普通项目顺序

1. 网站主线先做好 DNS、SSL/TLS、Cache、WAF、DDoS、Workers 和数据产品。
2. 需要趋势材料时，用 Radar。
3. 需要广告测量时，再看 Google tag gateway。
4. Web3、China Network 这种后置能力，等真实业务出现后再核对价格、合规和限制。

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| 1.1.1.1 是域名后台。 | 域名记录管理看 Cloudflare DNS。 |
| Radar 能看本站全部用户。 | 站点数据看 Web Analytics、Workers Logs 或业务数据。 |
| Web3 免费包等于随便用。 | 启用前看 dashboard、limits 和预算提醒。 |
| China Network 是免费优化中国访问。 | 它有合同、ICP备案、产品兼容和监管边界。 |
| Google tag gateway 可以替代 Zaraz。 | 它只服务 Google measurement tags。 |

## 事实来源

- [1.1.1.1 overview](https://developers.cloudflare.com/1.1.1.1/)
- [Cloudflare Radar](https://developers.cloudflare.com/radar/)
- [Time Services](https://developers.cloudflare.com/time-services/)
- [Web3 limits](https://developers.cloudflare.com/web3/reference/limits/)
- [Cloudflare China Network](https://developers.cloudflare.com/china-network/)
- [Google tag gateway for advertisers](https://developers.cloudflare.com/google-tag-gateway/)
