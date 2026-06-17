---
title: 实战案例
description: 可复现的 Cloudflare 产品组合案例。
---

最后核对日期：2026-06-17。

案例用于把产品地图和架构模式落到代码、配置、部署和验证里。每个案例都尽量保留“能照着做”的最小路径，同时把生产环境需要补上的权限、成本和风险边界写清楚。

## 当前案例

| 案例 | 核心产品 | 适合先学什么 |
| --- | --- | --- |
| [Worker API + D1](/recipes/worker-api-d1/) | Workers、Hono、D1 | API 路由、D1 binding、SQL migration、prepared statement、CRUD 验证 |
| [R2 签名上传](/recipes/r2-signed-upload/) | Workers、Hono、R2 | Worker 代理上传、presigned URL 直传、CORS、私有下载授权 |

## 选择顺序

- 先看 [Worker API + D1](/recipes/worker-api-d1/)：理解 Worker 如何接收请求、校验输入、调用绑定资源。
- 再看 [R2 签名上传](/recipes/r2-signed-upload/)：理解文件为什么放 R2，元数据为什么更适合放 D1。
- 做真实项目时，把 D1 案例里的用户/状态数据和 R2 案例里的文件 key 关联起来。

## 案例标准

- 背景：为什么要做。
- 架构：请求路径和产品组合。
- 配置：Wrangler、绑定、环境变量。
- 代码：最小可运行实现。
- 部署：本地开发、预览、生产。
- 验证：命令、页面、日志或截图。
- 风险：成本、安全、限制和失败场景。
