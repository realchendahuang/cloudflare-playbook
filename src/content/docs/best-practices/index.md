---
title: 最佳实践
description: Cloudflare 项目的免费额度、安全、成本、数据和部署实践入口。
---

最佳实践先讲清免费额度、安全边界和升级信号。最容易出问题的地方，是静态请求误进 Worker、写入口没有限流、文件放错位置、日志和 AI 没有预算边界。

## 默认放置

**免费额度先服务架构顺序。**

| 资源 / 能力 | 默认放置 | 免费阶段判断 |
| --- | --- | --- |
| 文档、官网、博客、前端资源 | Workers Static Assets / Pages | 主流量应该停在静态层。 |
| 小接口、第三方回调、评论、表单 | Workers Free | 早期验证通常够用，先控制 CPU 和公开入口。 |
| 评论、表单、小后台数据 | D1 | 关系数据和小型业务实体优先放这里。 |
| 图片、附件、导出文件 | R2 Standard | 文件对象离开 D1、Git 和站点包。 |
| 配置、开关、读多写少缓存 | KV | 适合读多写少，不适合强一致事务。 |
| 邮件、通知、导入、后处理 | Queues | 慢任务移出用户请求。 |
| 房间、会话、限流器、实时状态 | Durable Objects | 只放需要强一致的小状态。 |
| 后台、预览环境、内网工具 | Access + Tunnel | 后台入口需要身份边界。 |
| AI 和自然语言搜索 | Pagefind -> AI Gateway / AI Search | 先静态搜索，AI 有明确价值后再上。 |

完整额度表见 [免费额度大全](/platform/free-paid/)。

## 读者入口

| 你要解决的问题 | 先读什么 |
| --- | --- |
| 不知道一个项目能不能 0 元跑起来 | [免费额度大全](/platform/free-paid/) |
| 给个人项目或早期 SaaS 选产品 | [独立开发者推荐栈](/best-practices/indie-stack/) |
| 控制账单和额度风险 | [成本控制](/best-practices/cost/) |
| 给文档站、教程站或开源站选技术栈 | [文档站技术栈](/best-practices/site-stack/) |
| 上线前检查安全边界 | [安全边界](/best-practices/security/) |
| 用 Codex 维护 Cloudflare 项目 | [Codex 协作](/best-practices/codex-cloudflare/) |

## 推荐顺序

| 阶段 | 先做什么 | 边界 |
| --- | --- | --- |
| 接入域名 | DNS 托管、网站记录开启代理、SSL/TLS Full (strict)、源站保护。 | 复制企业网络架构。 |
| 发布内容 | 静态站优先 Workers Static Assets 或 Pages；搜索优先 Pagefind。 | 让所有静态请求进入 Worker 脚本。 |
| 增加写接口 | 登录、评论、表单、上传、第三方回调先做鉴权、限流、Turnstile 或签名校验。 | 匿名无限写入、无限 AI 调用、无限文件上传。 |
| 存数据 | 关系数据进 D1，文件进 R2，读多写少数据进 KV，强一致状态进 Durable Objects。 | 用一个产品硬扛所有数据形态。 |
| 做异步 | 邮件、导入、通知、审核、转码、AI 批处理放 Queues 或 Cron。 | 在用户请求里同步跑慢任务。 |
| 产品化 | 再看 Workers Paid、Workers Logs、Access、高级接口防护、指标分析、AI Search 或 Vectorize。 | 真实压力出现后再升级。 |

## 上线前看这些

| 风险域 | 最小做法 | 对应专题 |
| --- | --- | --- |
| 入口风险 | 网站记录走 Cloudflare，源站不暴露公网，TLS 链路完整。 | [安全边界](/best-practices/security/)、[Fundamentals](/platform/fundamentals/) |
| 静态成本 | 静态资源直接由 Assets / Pages 服务，动态路径明确进入 Worker。 | [成本控制](/best-practices/cost/)、[Workers Static Assets](/platform/static-assets/) |
| 写入滥用 | 登录、评论、表单、上传、搜索、AI 调用设置限流和服务端验证。 | [安全边界](/best-practices/security/)、[WAF](/platform/waf/) |
| 数据性能 | 数据放对位置，常查路径有索引，文件权限和生命周期清楚。 | [数据产品](/platform/data/)、[D1](/platform/d1/)、[R2](/platform/r2/) |
| 密钥泄露 | 生产密钥使用 Secrets，不进仓库、配置、日志和前端包。 | [安全边界](/best-practices/security/) |
| 账单失控 | 先看用量、预算提醒和官方价格限制，再决定优化或付费。 | [成本控制](/best-practices/cost/)、[账单与预算](/platform/billing/) |

官方实践入口统一放到 [Cloudflare 文档地图](/reference/cloudflare-docs-map/)；额度、价格和计划边界回到 [免费额度大全](/platform/free-paid/)。
