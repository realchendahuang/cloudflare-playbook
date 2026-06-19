---
title: Pages
---

## 适用场景

开源文档站、官网、博客适合 Pages，因为 Git 集成和预览部署内置。纯前端应用也适合 Pages，静态请求免费且不限量。

少量表单、第三方回调、轻接口可以用 Pages Functions，直接放在 Pages 项目里。静态站旁边有大量 Worker 接口时，更适合 Workers Static Assets，把动态能力和 Worker 绑定放在同一项目。用户上传、附件、下载包放 R2，Pages 只放构建产物。

## 免费阶段用法

文档、官网、博客和前端 bundle 应尽量停在静态层。少量表单、第三方回调和接口可以用动态函数起步；多绑定场景优先迁到 Workers Static Assets。高频提交、大型构建、多分支预览可能先达到构建侧限制。Pages 只放构建产物，大文件、图片原图、上传和下载包放 R2。预览地址按敏感程度加 Access。

## Workers Static Assets 对比

| 对比项 | Pages | Workers Static Assets |
| --- | --- | --- |
| 部署来源 | Git / Pages 项目设置。 | Worker 项目配置。 |
| PR 预览 | 内置。 | 需要自己组织。 |
| 动态能力 | Pages 动态函数，适合少量接口。 | Worker 原生入口，适合多绑定组合。 |
| 更适合 | 内容协作、官网、文档。 | 静态站 + 接口 / 数据 / AI。 |

## 动态函数

只有少量接口时，用 Pages 动态函数。静态请求不该触发动态函数，要控制动态路径，避免把整站阅读流量打进动态函数。鉴权或后台路径请求耗尽时倾向 fail closed。已经需要多路由和多个绑定时，迁到 Workers Static Assets。
