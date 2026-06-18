---
title: 实战案例
description: 最常复用的 Cloudflare 产品组合案例。
---

案例只保留高频组合。先学会两件事：结构化数据进 D1，文件对象进 R2。

## 当前案例

| 案例 | 核心产品 | 适合先学什么 |
| --- | --- | --- |
| [Worker 接口 + D1](/recipes/worker-api-d1/) | Workers、D1 | 小接口、评论、表单和后台数据写入。 |
| [R2 签名上传](/recipes/r2-signed-upload/) | Workers、R2 | 文件、图片、附件和导出物上传。 |

这两个案例覆盖大多数早期项目的两条主线：**结构化数据写入**和**文件对象上传**。

## 选择顺序

1. 先看 [Worker 接口 + D1](/recipes/worker-api-d1/)：理解 Worker 如何接收请求、校验输入，并用 D1 保存关系数据。
2. 再看 [R2 签名上传](/recipes/r2-signed-upload/)：理解文件为什么放 R2，为什么不能把 R2 密钥放到浏览器。
3. 做真实项目时，把 D1 里的业务记录和 R2 的对象标识关联起来。

官方案例入口：[Workers Examples](https://developers.cloudflare.com/workers/examples/)、[D1 Tutorials](https://developers.cloudflare.com/d1/tutorials/) 和 [R2 Tutorials](https://developers.cloudflare.com/r2/tutorials/)。
