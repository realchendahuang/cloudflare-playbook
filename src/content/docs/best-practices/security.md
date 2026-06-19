---
title: 上线安全
---

## 默认顺序

| 顺序 | 操作 | 原因 |
| --- | --- | --- |
| 1 | 域名接入 Cloudflare，公开网站记录开启代理。 | 让 CDN、DDoS、WAF、SSL/TLS 和安全事件有机会生效。 |
| 2 | SSL/TLS 默认 Full (strict)，开启 HTTPS。 | 边缘到源站之间也要走 HTTPS 和有效证书。 |
| 3 | 静态内容尽量缓存，动态写入交给 Worker。 | 减少回源和动态计算成本，也减少攻击面。 |
| 4 | 登录、评论、搜索、上传、第三方回调、AI 调用先做身份、配额或限流。 | 这些入口容易产生异常成本、凭证填充攻击和滥用风险。 |
| 5 | 表单和匿名写操作叠加 Turnstile 服务端验证。 | 前端只负责展示，服务端校验成功后才继续写入。 |
| 6 | 后台、预览环境和内部工具用 Access / Tunnel 保护。 | 管理入口通过 Access 或 Tunnel 进入。 |
| 7 | 生产密钥走 Cloudflare Secrets 或 Secrets Store。 | 密钥不能进入仓库、前端包、日志和公开文档。 |
| 8 | 定期查看 Security Insights、Security Events 和 Workers Logs。 | 规则改完要能看到触发、误伤、错误和趋势。 |

## 按入口场景选择

| 入口场景 | 处理方式 |
| --- | --- |
| 文档站 / 官网 | DNS、SSL/TLS、CDN、DDoS、Workers Static Assets、基础 WAF。 |
| 评论 / 留言 | Worker 接口、D1、Turnstile、限流、最小管理入口。 |
| 文件上传 | Worker 鉴权、R2 private bucket、短期签名 URL、对象大小限制。 |
| 小型 SaaS 接口 | 身份、权限、请求格式、幂等、D1 索引。 |
| 管理后台 | Access + Tunnel、最小成员权限。 |
| AI / 搜索接口 | 登录态或配额、AI Gateway、速率限制、日志采样。 |

## 写接口检查项

| 安全问题 | 处理方式 |
| --- | --- |
| 谁能写 | 登录态、Access、服务签名、回调签名或 Turnstile。 |
| 能写多少 | WAF 限流、业务配额、对象大小、频率限制。 |
| 失败处理 | 幂等标识、重试策略、队列、回滚或人工处理。 |
| 追踪方式 | 结构化日志、Cloudflare 请求编号、业务 ID、安全事件。 |

Turnstile 走服务端 Siteverify；验证失败就停止写库、发邮件或触发 AI。

## 后台、接口、密钥

| 对象 | 基础要求 |
| --- | --- |
| 后台 | 先建 Access 应用，再发布 Tunnel 公开主机名。没有 Access 策略的入口仍然是公开入口。 |
| 接口 | 先在应用层做好鉴权、请求格式、幂等、限流和错误日志；接口稳定后再看更完整的接口防护。 |
| 密钥 | 前端永远拿不到服务端密钥；单 Worker 用 Secrets，多项目共享再看 Secrets Store。 |
| 复盘 | 定期看安全巡检、安全事件和 Workers Logs，先处理源站暴露、后台放宽和写入口无限制。 |

## 应急动作

1. 确认请求是否真的经过 Cloudflare：看 DNS 代理状态、Cloudflare 请求编号和安全事件。
2. 提高静态资源缓存率，避免静态访问进入 Worker 或源站。
3. 对具体路径配置 WAF / 限流，避免全站封禁造成误伤。
4. 登录、评论、搜索、上传、AI 调用配置 Turnstile、配额或登录态。
5. Under Attack Mode 只当短期止血，不当长期配置。
