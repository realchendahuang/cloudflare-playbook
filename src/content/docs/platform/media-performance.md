---
title: 媒体与性能
description: 图片、视频、第三方脚本和浏览器任务的取舍。
---

最后核对日期：2026-06-18。媒体产品的价格和限制变化快，具体数字统一看 [免费额度大全](/platform/free-paid/) 和官方页面。

先记住一句：**大图、附件和视频不要塞进静态站构建产物。**

## 先判断

| 你遇到的问题 | 优先做法 | 先别做什么 |
| --- | --- | --- |
| 少量站点配图 | 跟随静态站发布，控制尺寸。 | 为几张图先接完整图片服务。 |
| 用户上传图片或附件 | 原文件进 R2，业务索引进 D1。 | 放进 Git、`dist` 或 D1 大字段。 |
| 同一张图需要多尺寸 | 固定少量缩略图尺寸，再看 Images。 | 让前端随意传任意转换参数。 |
| 视频是产品体验的一部分 | 看 Stream 的播放、签名、分析和录制能力。 | 用静态站或 D1 存视频。 |
| 页面变慢 | 先查图片尺寸、缓存命中、第三方脚本和真实访问数据。 | 只看一次 Lighthouse 分数就重构。 |
| 第三方脚本变多 | 先删脚本，再考虑 Zaraz 管理必要脚本。 | 在模板里散落营销脚本。 |
| 截图、PDF、动态抓取 | 只有必须打开浏览器时才看 Browser Run。 | 每个 API 请求同步开浏览器。 |

## 简单顺序

文档站、官网、博客先用 Static Assets / Pages + Cache + Web Analytics。出现上传后，用 R2 存原文件、Worker 做鉴权、D1 存索引；图片变体先固定少量尺寸；视频播放看 Stream；浏览器自动化必须异步处理，结果进 R2。

## 成本先看什么

| 产品 | 先盯住 |
| --- | --- |
| R2 | 存储量、读写操作、公开下载热点。 |
| Images | 转换参数数量、原图大小、常用尺寸缓存。 |
| Stream | 存储分钟数、播放分钟数、私有内容访问控制。 |
| Zaraz | 第三方工具真正需要的事件量。 |
| Browser Run | 浏览器时长、并发、是否及时关闭 session。 |

官方核对入口：[Images Pricing](https://developers.cloudflare.com/images/pricing/)、[Stream Pricing](https://developers.cloudflare.com/stream/pricing/)、[Zaraz Pricing](https://developers.cloudflare.com/zaraz/pricing-info/)、[Browser Run Pricing](https://developers.cloudflare.com/browser-run/pricing/)。
