---
title: DDoS 防护
description: DDoS 防护、源站保护、临时防护模式和升级判断。
---

最后核对日期：2026-06-18。

Cloudflare 的 DDoS 防护是入口层能力。不需要先研究规则细节，先确认公开 Web 流量真的经过 Cloudflare，源站不能被直连，静态资源能被缓存。

## 一句话判断

| 问题 | 判断 |
| --- | --- |
| 免费计划有没有 DDoS 防护？ | 有。普通项目先把入口接正确，比研究高级规则更重要。 |
| Workers Paid 会不会增强 DDoS？ | 不会。Workers Paid 只影响开发者平台额度。 |
| 只把域名放进 Cloudflare 就安全吗？ | 不一定。DNS-only、源站直连和泄露 IP 都可能绕过 Cloudflare。 |
| DDoS 能不能解决评论垃圾内容？ | 不能。写入口要配合 WAF、Rate Limiting、Turnstile 和业务权限。 |

## 默认顺序

1. 公开 Web 记录保持 Proxied。
2. 源站只接受 Cloudflare 回源和可信运维入口。
3. 静态资源放到 Static Assets、Pages、R2 或 Cache。
4. DDoS 防护保持默认。
5. 写入口加 WAF、限流和 Turnstile。
6. 开基础告警和账单提醒。

## 源站保护最重要

| 动作 | 判断 |
| --- | --- |
| Web 记录使用 Proxied | 让请求进入 Cloudflare 防护链路。 |
| 审计 DNS-only 记录 | 旧子域、邮件、监控和配置可能泄露源站 IP。 |
| 邮件和 Web 源站分离 | MX、退信和邮件日志很容易暴露服务器地址。 |
| 源站防火墙收窄入口 | 只允许 Cloudflare IP ranges、可信运维入口或 Tunnel。 |
| 被打过后换源站 IP | 旧 IP 已经泄露时，单纯接入 Cloudflare 不够。 |
| 后台走 Tunnel / Access | 管理入口不要裸露公网。 |

如果源站可以被公网直连，Cloudflare 只能保护走 Cloudflare 的那部分流量。

## DDoS、WAF、Rate Limiting 的分工

| 能力 | 解决什么 |
| --- | --- |
| DDoS 防护 | 大规模异常流量、连接压力和协议层攻击。 |
| Cache / CDN | 减少攻击或突发流量对源站的回源压力。 |
| WAF | 已知漏洞、危险路径、明确业务边界。 |
| 限流 | 登录、评论、搜索、上传和写接口被刷。 |
| Turnstile | 需要人机判断的表单和写入口。 |

## 临时防护模式慎用

| 用法 | 判断 |
| --- | --- |
| 全站开启 | 只适合正在被打且暂时无法定位路径时短时间使用。 |
| 按路径开启 | 更推荐，用在登录、后台、写接口或被打路径。 |
| 长期开启 | 不推荐。攻击结束后回到 WAF 和限流的精确规则。 |
| 替代源站保护 | 不行。源站直连问题必须单独处理。 |

官方核对入口：[DDoS Protection](https://developers.cloudflare.com/ddos-protection/)、[Under Attack mode](https://developers.cloudflare.com/fundamentals/reference/under-attack-mode/)、[Protect your origin server](https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/)。
