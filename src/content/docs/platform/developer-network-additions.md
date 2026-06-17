---
title: 后置开发者能力
description: 后期才需要评估的开发者、邮件、实验和网络能力。
---

最后核对日期：2026-06-18。

这一页收纳“有用，但不是默认栈”的能力。先把首页和 [免费额度大全](/platform/free-paid/) 里的主线能力跑通，再回来看这些。

## 先别急着用

| 你想做的事 | 先别急的原因 |
| --- | --- |
| 让 AI 或助手改生产配置。 | 助手只能辅助判断，生产变更仍要人工确认和可追踪记录。 |
| 保存 Agent 工作区、构建产物或临时文件树。 | 文件、图片和附件先用 R2。 |
| 发邮件。 | 事务邮件可以评估；营销邮件还要处理退订、投诉、声誉和合规。 |
| 做功能灰度。 | 简单项目先用配置、发布流程和回滚策略。 |
| 调整网络兼容性开关。 | 多数不是独立架构能力，改错会影响线上行为。 |
| 看路由器和企业网络流量。 | 站点先看 Web Analytics、Workers Logs 和 Security Events。 |
| 查询 R2 里的分析数据。 | R2 SQL 不是 D1 替代品，先确认数据已经适合分析。 |
| 执行不可信代码。 | 这会引入容器、安全和成本边界，没有明确需求不要上。 |

## 什么时候值得看

| 需求 | 可以看 |
| --- | --- |
| 要发事务邮件或处理入站邮件。 | Email Service。 |
| 要给新功能做关闭开关、灰度和定向发布。 | Flagship。 |
| 要做代码评测、临时代码环境或不可信代码执行。 | Sandbox SDK。 |
| R2 里已经是可分析的数据湖格式。 | R2 SQL。 |
| 团队开始管理文件树或构建产物。 | Artifacts。 |
| 要写文档、教程或适合助手阅读的文档。 | Cloudflare Style Guide。 |

## 付费判断

| 问题 | 判断 |
| --- | --- |
| 这是不是 Workers Paid 解锁的能力？ | Artifacts、任意收件人 Email Sending、生产 Sandbox 往往和 Workers Paid 相关。 |
| 这是不是按量扫描、执行或发送？ | R2 SQL、Email、Sandbox 都要先估量。 |
| 这是不是会影响生产行为？ | Flagship、Email、网络设置要有人工确认。 |

具体额度统一看 [免费额度大全](/platform/free-paid/)。

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| 助手可以替代人工确认。 | 生产变更仍要有可追踪记录。 |
| Artifacts 是 R2。 | 文件、图片和附件先用 R2。 |
| 功能开关可以替代权限。 | 功能开关控制体验，授权仍在业务后端。 |
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
