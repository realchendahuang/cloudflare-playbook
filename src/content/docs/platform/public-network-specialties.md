---
title: 公共网络能力
description: 终端 DNS、趋势研究、时间同步、Web3、区域交付和广告测量怎么判断。
---

这些能力不是 Cloudflare 项目的默认主干。先把 DNS、SSL/TLS、Cache、WAF、DDoS、Workers 和数据产品跑通，再按真实场景补。

## 先判断是不是你的问题

| 你遇到的问题 | 看什么 | 不要误会 |
| --- | --- | --- |
| 给设备或团队终端换 DNS resolver。 | 1.1.1.1。 | 它不是域名记录后台。 |
| 做行业研究、趋势报告、安全背景分析。 | Radar。 | 它不是站点访问日志。 |
| 服务器、设备、签名和日志依赖可靠时间。 | Time Services。 | 不要写成业务逻辑。 |
| 业务确实需要 IPFS 或 Ethereum RPC。 | Web3 Gateways。 | 不要为了“架构完整”而开。 |
| 面向中国大陆用户做合规和性能交付。 | China Network。 | 它不是免费加速开关。 |
| 已经使用 Google 广告 / 分析标签。 | Google tag gateway。 | 它不是通用第三方脚本治理。 |
