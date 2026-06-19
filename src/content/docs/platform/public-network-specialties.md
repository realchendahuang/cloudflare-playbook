---
title: 公共网络能力
description: 终端 DNS、趋势研究、时间同步、Web3、区域交付和广告测量怎么判断。
---

这些能力当补充阅读。先把 DNS、SSL/TLS、Cache、WAF、DDoS、Workers 和数据能力跑通，再按真实场景补。

## 先判断场景

| 你遇到的问题 | 看什么 | 边界 |
| --- | --- | --- |
| 给设备或团队终端换 DNS resolver。 | 1.1.1.1。 | 域名记录仍在 DNS 后台管理。 |
| 做行业研究、趋势报告、安全背景分析。 | Radar。 | 站点访问趋势看 Web Analytics。 |
| 服务器、设备、签名和日志依赖可靠时间。 | Time Services。 | 这是基础时间服务。 |
| 业务确实需要 IPFS 或 Ethereum RPC。 | Web3 Gateways。 | 有 Web3 场景再评估。 |
| 面向中国大陆用户做合规和性能交付。 | China Network。 | 需要合规、合同和计划评估。 |
| 已经使用 Google 广告 / 分析标签。 | Google tag gateway。 | 通用第三方脚本治理看 Zaraz。 |
