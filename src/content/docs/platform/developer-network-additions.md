---
title: 开发者与网络补充专项
description: Agent Lee、Artifacts、Email Service、Flagship、Network、Network Flow、R2 SQL、Sandbox SDK 和 Style Guide 的取舍。
---

最后核对日期：2026-06-18。

这一页收纳“有用，但不是默认栈”的 Cloudflare 能力。普通项目先不要从这里开始，先把首页和 [免费额度大全](/platform/free-paid/) 里的主线能力跑通。

## 先别急着用

| 产品 | 先别急的原因 |
| --- | --- |
| Agent Lee | Dashboard 助手，不是生产变更流程。 |
| Artifacts | 更偏 Agent / Sandbox / CI 工作区，不是普通对象存储。 |
| Email Service | 事务邮件可以评估，营销邮件要考虑退订、投诉、声誉和合规。 |
| Flagship | 功能灰度有价值，但简单项目先用配置和发布流程。 |
| Network settings | 多数是 zone 级兼容性开关，不是独立架构。 |
| Network Flow | 面向路由器和企业网络流量，普通站点先看 Web Analytics 和日志。 |
| R2 SQL | 查询 R2 数据湖，不是 D1 替代品。 |
| Sandbox SDK | 只有要执行不可信代码时才值得承担容器和安全复杂度。 |

## 什么时候值得看

| 需求 | 可以看 |
| --- | --- |
| 要发事务邮件或处理入站邮件。 | Email Service。 |
| 要给新功能做 kill switch、灰度和定向发布。 | Flagship。 |
| AI code executor、代码评测、临时开发环境。 | Sandbox SDK。 |
| R2 里已经是可分析的数据湖格式。 | R2 SQL。 |
| 团队开始用 Agent 管理文件树或构建产物。 | Artifacts。 |
| 写文档、教程、Agent-friendly docs。 | Cloudflare Style Guide。 |

## 付费判断

| 问题 | 判断 |
| --- | --- |
| 这是不是 Workers Paid 解锁的能力？ | Artifacts、任意收件人 Email Sending、生产 Sandbox 往往和 Workers Paid 相关。 |
| 这是不是按量扫描、执行或发送？ | R2 SQL、Email、Sandbox 都要先估量。 |
| 这是不是会影响生产行为？ | Flagship、Email、Network settings 要进 review。 |

具体额度不要在这里背，统一看 [免费额度大全](/platform/free-paid/) 和官方 pricing / limits。

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| Agent Lee 可以替代 review。 | 生产变更仍要有可追踪真源。 |
| Artifacts 是 R2。 | 普通文件、图片和附件先用 R2。 |
| Feature flag 可以替代权限。 | Flag 控制开关，授权仍在业务后端。 |
| R2 SQL 是数据库。 | 它是只读分析查询入口，按扫描量看成本。 |
| Sandbox SDK 很酷所以先上。 | 没有不可信代码执行需求时不要引入。 |

## 事实来源

- [Agent Lee](https://developers.cloudflare.com/agent-lee/)
- [Artifacts Pricing](https://developers.cloudflare.com/artifacts/platform/pricing/)
- [Email Service Pricing](https://developers.cloudflare.com/email-service/platform/pricing/)
- [Flagship Limits](https://developers.cloudflare.com/flagship/reference/limits/)
- [Network settings](https://developers.cloudflare.com/network/)
- [Network Flow free version](https://developers.cloudflare.com/network-flow/network-flow-free/)
- [R2 SQL Pricing](https://developers.cloudflare.com/r2-sql/platform/pricing/)
- [Sandbox SDK Pricing](https://developers.cloudflare.com/sandbox/platform/pricing/)
- [Cloudflare Style Guide](https://developers.cloudflare.com/style-guide/)
