---
title: 媒体与性能
description: Images、Stream、Speed、Zaraz 和 Browser Run 在普通项目里的取舍、免费边界和成本控制。
---

最后核对日期：2026-06-18。

媒体和性能不要混成一件事。图片、视频、页面速度、第三方脚本和浏览器自动化的成本模型不同，普通项目先把资产放对位置，再决定要不要启用专项产品。

先记住一句：**大图、附件和视频不要塞进静态站构建产物。**

## 一句话判断

小图标和少量站点配图可以跟随静态站；大图、附件和用户上传先放 R2；需要固定尺寸缩略图和格式转换时再接 Images；视频播放看 Stream；性能先用 Web Analytics、Speed 和缓存命中定位；第三方脚本变多再看 Zaraz；截图、PDF、动态抓取才看 Browser Run。

## 先判断

| 问题 | 如果答案是“否” |
| --- | --- |
| 图片数量、尺寸和变体已经明显变多了吗？ | 先用静态资源或 R2，不急着接 Images。 |
| 用户上传内容需要长期存储、鉴权或下载吗？ | 不要放进 Git、Pages bundle 或 `dist`。 |
| 视频是产品体验的一部分吗？ | 偶尔下载用 R2 普通链接可能够用。 |
| 性能问题来自真实用户吗？ | 先看 Web Analytics、缓存命中、图片尺寸和第三方脚本。 |
| 第三方脚本和 consent 逻辑已经失控吗？ | 先减少脚本数量，再考虑 Zaraz。 |
| 任务必须打开浏览器才能完成吗？ | 能用 `fetch` 的抓取和 API 调用不要上 Browser Run。 |

## 免费与付费边界

| 产品 | 免费边界 | 付费边界 | 普通项目判断 |
| --- | --- | --- | --- |
| Images transformations | Free 每月 5,000 unique transformations；超出后新 transformation 会被拒绝。 | Paid 超出 included 后按 transformation 计费；storage 和 delivery 另算。 | 固定 `thumb`、`card`、`hero` 这类尺寸，不让参数失控。 |
| Stream | 上传和编码免费，但没有“免费无限播放”。 | 存储和播放按视频时长计费。 | 课程、会员视频、直播、回放看 Stream；偶尔下载不必先上。 |
| Speed / Observatory | Free 可做基础诊断。 | 更完整测试和性能流程跟随计划。 | 它是诊断入口，不是一键变快。 |
| Zaraz | 每账号每月 1,000,000 free events。 | 额外 events 按量计费。 | 只送第三方工具需要的事件，业务日志走应用链路。 |
| Browser Run | Free 有每日 browser hours 和并发边界。 | Workers Paid 有月度 included usage，超出按量。 | 浏览器任务放队列，结果写 R2 / D1。 |

## 产品怎么选

| 场景 | 优先选 | 不建议 |
| --- | --- | --- |
| 文档站、官网、博客 | Static Assets / Pages + Cache + Web Analytics。 | 把所有大图、附件和视频塞进构建产物。 |
| 用户上传图片 | R2 原图 + Images transformations + Worker 鉴权。 | 前端直传公开 bucket，且不限制尺寸和类型。 |
| 商品图、头像、封面图 | R2 或 Images storage + 固定 variants。 | 每个尺寸都手工生成并提交到 Git。 |
| 视频课程、产品演示 | Stream + signed URLs + analytics。 | 用 R2 硬扛完整视频体验。 |
| 页面性能诊断 | Speed / Observatory + Web Analytics + 缓存和图片检查。 | 只看一次 Lighthouse 分数就改架构。 |
| 第三方脚本治理 | Zaraz + consent management + selective loading。 | 在模板里散落多个营销脚本。 |
| 截图、PDF、动态抓取 | Browser Run + Queues + R2。 | 每次 API 请求同步打开浏览器。 |

## 成本控制

| 产品 | 先控制什么 |
| --- | --- |
| Images | 固定 transformation 参数，限制原图大小，缓存常用尺寸。 |
| Stream | 先估算 stored minutes 和 delivered minutes；私有内容用 signed URLs。 |
| Speed | 把真实用户数据、缓存命中、源站响应、图片尺寸和脚本加载放一起看。 |
| Zaraz | 只发送第三方工具真正消费的事件。 |
| Browser Run | 能不用浏览器就不用；必须用时排队、限制并发、写入结果。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 静态资产免费，所以视频和大图都放进 `dist`。 | 构建产物只放站点自身资源；大图、附件、视频进 R2 / Images / Stream。 |
| R2 免 egress，所以视频一定用 R2。 | 完整视频体验、播放分析和签名播放看 Stream。 |
| Images 免费就是无限图片优化。 | Free 是每月 5,000 unique transformations。 |
| Stream 按文件大小计费。 | Stream storage 和 delivery 都按视频时长计。 |
| 性能优化靠一次 Lighthouse。 | Synthetic test 和真实用户数据都要看。 |
| Zaraz 会自动让所有脚本变快。 | 先减少脚本，再迁必要第三方工具。 |
| Browser Run 可以替代普通 HTTP 请求。 | 浏览器时间贵，只有动态渲染、截图、PDF、爬取才值得开。 |

## 事实来源

- [Images Pricing](https://developers.cloudflare.com/images/pricing/)
- [Images Limits and formats](https://developers.cloudflare.com/images/get-started/limits/)
- [Stream Pricing](https://developers.cloudflare.com/stream/pricing/)
- [Stream FAQ](https://developers.cloudflare.com/stream/faq/)
- [Observatory](https://developers.cloudflare.com/speed/observatory/)
- [Zaraz Pricing](https://developers.cloudflare.com/zaraz/pricing-info/)
- [Browser Run Pricing](https://developers.cloudflare.com/browser-run/pricing/)
- [Browser Run Limits](https://developers.cloudflare.com/browser-run/limits/)
