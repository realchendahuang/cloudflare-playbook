---
title: Workers Static Assets
---

## 适用场景

文档站、官网、博客、产品页优先使用 Workers Static Assets，静态请求免费且不限量。单页应用旁边只有少量接口时也适合：静态页面走资产层，动态接口走 Worker。

如果静态站还需要 D1、R2、KV、Queues、AI，Workers 项目更容易统一管理。纯静态站并且团队依赖 Git 预览部署时，Pages 也可以。用户上传、图片原图、附件、导出文件放 R2；视频、大安装包和超过 25 MiB 的文件放 R2 或 Stream。

## 免费阶段用法

免费阶段要把静态资产请求留在资产层。由资产层直接返回时免费且不限量，是文档站和官网的主流量入口。部署产物只放构建结果；用户上传、附件、导出包和媒体库进 R2。只有交给 Worker 脚本处理的请求，才按 Workers 请求和 CPU 计算。大量图片、下载包、原始附件和视频应进入 R2 / Stream。

## 成本优先路径

页面、CSS、JS、字体、Pagefind 索引直接由 Static Assets 返回。评论、搜索接口、第三方回调、后台接口只让对应路径交给 Worker。用户上传文件由 Worker 做鉴权，文件进 R2。公开下载文件的页面用 Static Assets，文件本体进 R2。单页应用前端路由用静态回退，接口路径单独处理。

## Pages 对比

| 对比项 | Workers Static Assets | Pages |
| --- | --- | --- |
| 部署来源 | Worker 项目配置。 | Git / Pages 项目设置。 |
| 接口和数据能力 | Worker 原生，适合 D1、R2、KV、Durable Objects、Queues、AI。 | Pages 动态函数适合轻量接口。 |
| 预览部署 | 需要自己组织。 | 分支和 PR 预览内置。 |
| 更适合 | 静态站 + 接口 / Worker 绑定和数据能力。 | 纯静态站、官网、内容协作。 |
