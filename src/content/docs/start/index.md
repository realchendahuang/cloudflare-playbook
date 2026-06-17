---
title: 学习路线
description: Cloudflare Playbook 的推荐阅读顺序和学习目标。
---

这份 Playbook 的目标不是让你背产品名，而是建立一套能用于真实项目的判断顺序。

## 第一轮：先建立地图

1. 读 [产品地图](/platform/)，知道 Cloudflare 主要产品各自解决什么问题。
2. 读 [Workers](/platform/workers/) 和 [Pages](/platform/pages/)，理解计算和部署入口。
3. 读 [数据产品](/platform/data/)，初步区分 D1、KV、R2、Durable Objects 和 Queues。
4. 读 [免费与付费边界](/platform/free-paid/)，先知道免费额度和 $5 Workers Paid 到底覆盖什么。

## 第二轮：按架构模式学习

| 目标 | 优先阅读 |
| --- | --- |
| 做文档站、官网、博客 | [静态内容站](/architecture/static-site/) |
| 做接口代理、Webhook、轻量后端 | [API 网关](/architecture/api-gateway/) |
| 做房间、协作、状态同步 | [实时应用](/architecture/realtime-app/) |

## 第三轮：进入实战案例

案例优先覆盖最常见的组合：

- Worker API + D1：轻量接口和关系型数据。
- R2 签名上传：文件上传、下载和权限控制。
- Pages 文档站部署：把内容站发布到 Cloudflare Pages。

## 第四轮：建立协作规则

| 目标 | 优先阅读 |
| --- | --- |
| 用 Codex 持续维护这个仓库 | [Codex 协作](/best-practices/codex-cloudflare/) |
| 选择普通项目的 Cloudflare 组合 | [独立开发者推荐栈](/best-practices/indie-stack/) |
| 控制免费额度和付费边界 | [成本控制](/best-practices/cost/) |

## 每篇文章怎么读

每篇文章都会尽量回答四个问题：

- 这个产品或架构解决什么问题。
- 普通项目什么时候该用，什么时候不该用。
- 最小配置和最小代码是什么。
- 如何验证上线结果，以及风险在哪里。
