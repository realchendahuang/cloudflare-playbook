---
title: 安全边界
description: Cloudflare 项目上线前需要检查的入口、写接口、后台、API、密钥和观测边界。
---

最后核对日期：2026-06-18。

安全边界先回答四个问题：入口是否经过 Cloudflare，写入口能不能被刷，后台是否公开，密钥和日志是否可控。先做能验证的最小边界，再按真实风险升级。

## 默认顺序

| 顺序 | 先做什么 | 为什么 |
| --- | --- | --- |
| 1 | 域名接入 Cloudflare，公开 Web 记录保持 Proxied。 | 让 CDN、DDoS、WAF、SSL/TLS 和 Security Events 有机会生效。 |
| 2 | SSL/TLS 默认 Full (strict)，开启 HTTPS。 | 不让边缘到源站之间降级成弱链路。 |
| 3 | 静态内容尽量缓存，动态写入单独进 Worker。 | 减少回源和动态计算成本，也减少攻击面。 |
| 4 | 登录、评论、搜索、上传、Webhook、AI 调用先做身份或速率边界。 | 这些入口最容易被刷成本、刷库和触发滥用。 |
| 5 | 表单和匿名写操作叠加 Turnstile 服务端验证。 | 前端组件只是开始，服务端验证通过后才继续写入。 |
| 6 | 后台、预览环境和内部工具用 Access / Tunnel 保护。 | 后台入口不要裸露公网。 |
| 7 | 生产密钥走 Cloudflare Secrets 或 Secrets Store。 | 密钥不能进入仓库、前端包、日志和公开文档。 |
| 8 | 定期查看 Security Insights、Security Events 和 Workers Logs。 | 规则改完要能看到命中、误伤、错误和趋势。 |

## 按项目类型选择

| 项目 | 默认组合 | 暂时不要急着上 |
| --- | --- | --- |
| 文档站 / 官网 | DNS、SSL/TLS、CDN、DDoS、Workers Static Assets、基础 WAF。 | 复杂后台、完整 API Shield、自建评论 UI。 |
| 评论 / 留言 | Worker API、D1、Turnstile、Rate Limiting、最小管理入口。 | 匿名无限写入、高成本 AI 审核。 |
| 文件上传 | Worker 鉴权、R2 private bucket、短期签名 URL、对象大小限制。 | 公开写入 bucket、把 R2 key 下发浏览器。 |
| 小型 SaaS API | 身份、权限、请求格式、幂等、D1 索引。 | 过早拆微服务、过早 Enterprise 安全套件。 |
| 管理后台 | Access + Tunnel、最小成员权限。 | 裸露公网后台、自写弱登录。 |
| AI / 搜索接口 | 登录态或配额、AI Gateway、速率限制、日志采样。 | 匿名无限模型调用、无预算提醒。 |

## 写接口四问

写接口包括评论、表单、注册、登录、上传、Webhook、AI 调用、发邮件和数据库修改。上线前只问四件事：

| 问题 | 要求 |
| --- | --- |
| 谁能写 | 登录态、Access、服务签名、Webhook 签名或 Turnstile。 |
| 能写多少 | WAF Rate Limiting、业务配额、对象大小、频率限制。 |
| 写失败怎么办 | 幂等标识、重试策略、队列、回滚或人工处理。 |
| 怎么追踪 | 结构化日志、Ray ID、业务 ID、Security Events。 |

Turnstile 的关键点是：**前端组件不等于保护完成**。服务端必须调用 Siteverify，验证失败就不要继续写库、发邮件或触发 AI。

## 后台、API、密钥

| 边界 | 先做到 |
| --- | --- |
| 后台 | 先建 Access application，再发布 Tunnel public hostname。没有 Access policy 的入口仍然是公开入口。 |
| API | 先在应用层做好鉴权、请求格式、幂等、限流和错误日志；接口稳定后再看 API Shield。 |
| 密钥 | 前端永远拿不到服务端密钥；单 Worker 用 Secrets，多项目共享再看 Secrets Store。 |
| 复盘 | 定期看 Security Insights、Security Events 和 Workers Logs，优先处理源站暴露、后台放宽和写入口无限制。 |

## 应急动作

遇到异常流量、刷接口或源站压力时，按这个顺序处理：

1. 确认请求是否真的经过 Cloudflare：看 DNS proxy status、Ray ID、Security Events。
2. 静态资源先提高缓存命中，避免把静态访问打进 Worker 或源站。
3. 对具体路径加 WAF / Rate Limiting，不要一上来全站粗暴封。
4. 登录、评论、搜索、上传、AI 调用优先加 Turnstile、配额或登录态。
5. Under Attack Mode 只当短期止血，不当长期配置。

官方核对入口：[源站保护](https://developers.cloudflare.com/fundamentals/security/protect-your-origin-server/)、[WAF](https://developers.cloudflare.com/waf/)、[Turnstile](https://developers.cloudflare.com/turnstile/)、[Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/)。
