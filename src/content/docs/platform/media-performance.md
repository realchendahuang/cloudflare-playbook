---
title: 媒体与性能
description: Images、Stream、Speed、Zaraz 和 Browser Run 在普通项目里的取舍、免费边界和成本控制。
---

最后核对日期：2026-06-18。Images、Stream、Zaraz、Browser Run 的价格和限制变化较快，本页只保留项目判断需要的口径，最终以官方 pricing / limits 页面为准。

媒体和性能不要混成一件事。图片、视频、页面速度、第三方脚本和浏览器自动化的成本模型不同，普通项目先把资产放对位置，再决定要不要启用专项产品。

## 一句话判断

小图标和少量站点配图可以跟随静态站；大图、附件和用户上传先放 R2；需要固定尺寸缩略图和格式转换时再接 Images；视频播放看 Stream；性能先用 Web Analytics、Speed 和缓存命中定位；第三方脚本变多再看 Zaraz；截图、PDF、动态抓取才看 Browser Run。

## 先问六个问题

| 问题 | 如果答案是“否” |
| --- | --- |
| 图片数量、尺寸和变体已经明显变多了吗？ | 先用静态资源或 R2，不急着接 Images。 |
| 用户上传内容是否需要长期存储、鉴权或下载？ | 不要把大文件放进 Git、Pages bundle 或 `dist`。 |
| 视频是产品体验的一部分，而不是偶尔下载吗？ | R2 普通链接可能够用。 |
| 性能问题来自真实用户，而不是一次本地 Lighthouse 分数吗？ | 先看 Web Analytics、缓存命中、图片尺寸和第三方脚本。 |
| 第三方统计、广告、聊天和 consent 逻辑已经失控了吗？ | 先减少脚本数量，再考虑 Zaraz。 |
| 任务必须打开浏览器才能完成吗？ | 能用 `fetch` 的抓取、解析和 API 调用不要上 Browser Run。 |

## 免费与付费边界

| 产品 | 免费边界 | 付费边界 | 普通项目判断 |
| --- | --- | --- | --- |
| Images transformations | Free 每月 5,000 unique transformations；超出后不会自动收费，新 transformation 会被拒绝。 | Paid 前 5,000 included，超出 `$0.50/1,000`；Images storage 为 `$5/100,000 images stored/month`，Images delivered 为 `$1/100,000 images delivered/month`。 | 固定 `thumb`、`card`、`hero` 这类尺寸，不让用户随意组合参数。 |
| Stream | 上传和编码免费，但没有“免费无限播放”口径。 | 存储 `$5/1,000 minutes stored` 预付；播放 `$1/1,000 minutes delivered` 后付；按视频时长，不按文件大小。 | 课程、会员视频、直播、回放和播放分析看 Stream；偶尔下载不必先上。 |
| Speed / Observatory | Observatory 是 beta；Free customers 默认启用 RUM 且排除 EU traffic，可关闭。 | synthetic tests 的配额表列 Pro、Business、Enterprise；更完整性能流程跟随域名计划。 | 它是诊断入口，不是“一键变快”。 |
| Zaraz | 所有计划可用；每个 account 每月 1,000,000 free Zaraz Events。 | 额外每 1,000,000 Zaraz Events 为 `$5/month`；未启用 paid 且超出免费额度会停用到下个账期。 | 只把第三方工具需要的事件送进 Zaraz，业务日志走应用链路。 |
| Browser Run | Workers Free：10 minutes/day、3 concurrent Browser Sessions、Quick Actions 1 次/10 秒；`/crawl` 为 5 jobs/day、100 pages/crawl。 | Workers Paid：10 hours/month included，超出 `$0.09/hour`；Browser Sessions 含 10 concurrent browsers monthly average，超出 `$2/browser`；默认 paid limit 120 concurrent browsers/account。 | 浏览器任务放队列，结果写 R2 / D1，不要卡在用户同步请求里。 |

## 产品怎么选

| 场景 | 优先选 | 不建议 |
| --- | --- | --- |
| 文档站、官网、博客 | Workers Static Assets / Pages + Cache + Web Analytics。 | 把所有大图、附件和视频塞进构建产物。 |
| 用户上传图片 | R2 原图 + Images transformations + Worker 鉴权。 | 前端直传公开 bucket，且不限制尺寸和类型。 |
| 商品图、头像、封面图 | R2 或 Images storage + 固定 variants。 | 每个尺寸都手工生成并提交到 Git。 |
| 视频课程、产品演示 | Stream + signed URLs + analytics。 | 用 R2 硬扛完整视频体验。 |
| 页面性能诊断 | Speed / Observatory + Web Analytics + 缓存和图片检查。 | 只看一次 Lighthouse 分数就改架构。 |
| 第三方脚本治理 | Zaraz + consent management + selective loading。 | 在模板里散落多个营销脚本。 |
| 截图、PDF、动态抓取 | Browser Run + Queues + R2。 | 每次 API 请求同步打开浏览器。 |

## 成本控制

| 产品 | 先控制什么 |
| --- | --- |
| Images | 固定 transformation 参数；限制原图大小；把原图放 R2；缓存常用尺寸。 |
| Stream | 先估算 stored minutes 和 delivered minutes；首屏外播放器 lazy load；私有内容用 signed URLs。 |
| Speed | 把真实用户数据、缓存命中、源站响应、图片尺寸和脚本加载放在一起看。 |
| Zaraz | 只发送第三方工具真正消费的事件；高频业务事件不要进 Zaraz。 |
| Browser Run | 能不用浏览器就不用；必须用时排队、复用 session、写入结果、限制并发。 |

## 升级信号

| 信号 | 该看什么 |
| --- | --- |
| 一张图要在多个设备、多个布局里稳定输出不同尺寸。 | Images transformations。 |
| 图片变体已经超过 Free 5,000 unique transformations/month。 | Images Paid 或更严格的参数治理。 |
| 视频已经影响转化、课程交付、会员访问或直播回放。 | Stream。 |
| 页面变慢主要来自第三方脚本和 consent 逻辑。 | Zaraz。 |
| 真实用户性能持续变差，且需要团队跟踪趋势。 | Speed / Observatory 与 Web Analytics。 |
| 必须截图、生成 PDF、预渲染 JS 页面或批量抓取动态页面。 | Browser Run + Queues。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 静态资产免费，所以视频和大图都放进 `dist`。 | 构建产物只放站点自身资源；大图、附件、视频进 R2 / Images / Stream。 |
| R2 免 egress，所以视频一定用 R2。 | R2 是对象存储；完整视频体验、播放分析和签名播放看 Stream。 |
| Images 免费就是无限图片优化。 | Free 是每月 5,000 unique transformations，参数失控会很快撞线。 |
| Stream 按文件大小计费。 | Stream storage 和 delivery 都按视频时长计。 |
| 性能优化靠一次 Lighthouse。 | Synthetic test 和真实用户数据都要看，尤其是 LCP / INP。 |
| Zaraz 会自动让所有脚本变快。 | 先减少脚本，再把必要第三方工具迁入 Zaraz。 |
| Browser Run 可以替代普通 HTTP 请求。 | 浏览器时间贵，只有动态渲染、截图、PDF、爬取才值得开。 |

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [cloudflare/cloudflare-docs Images source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/images) | 官方 Images 文档源文件，适合追踪 pricing、limits、transformations 和 storage。 |
| [cloudflare/cloudflare-docs Stream source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/stream) | 官方 Stream 文档源文件，适合追踪 pricing、upload、live、player、analytics 和 FAQ。 |
| [cloudflare/cloudflare-docs Speed source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/speed) | 官方 Speed 文档源文件，适合追踪 Observatory、RUM 和 optimization。 |
| [cloudflare/cloudflare-docs Zaraz source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/zaraz) | 官方 Zaraz 文档源文件，适合追踪 pricing、events、consent 和 Monitoring。 |
| [cloudflare/cloudflare-docs Browser Run source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/browser-run) | 官方 Browser Run 文档源文件，适合追踪 pricing、limits、Quick Actions、Puppeteer 和 Playwright。 |
| [cloudflare/svg-hush](https://github.com/cloudflare/svg-hush) | Cloudflare 用于清理 SVG 的开源工具，适合理解 Images 处理 SVG 的安全边界。 |
| [cloudflare/queues-web-crawler](https://github.com/cloudflare/queues-web-crawler) | Cloudflare 官方 Queues + Browser Run crawler 示例。 |

## 官方资料

- [Images Pricing](https://developers.cloudflare.com/images/pricing/)
- [Images Limits and formats](https://developers.cloudflare.com/images/get-started/limits/)
- [Stream Pricing](https://developers.cloudflare.com/stream/pricing/)
- [Stream FAQ](https://developers.cloudflare.com/stream/faq/)
- [Observatory](https://developers.cloudflare.com/speed/observatory/)
- [Run Observatory test](https://developers.cloudflare.com/speed/observatory/run-speed-test/)
- [RUM beacon for Web Analytics](https://developers.cloudflare.com/speed/observatory/rum-beacon/)
- [Zaraz Pricing](https://developers.cloudflare.com/zaraz/pricing-info/)
- [Browser Run Pricing](https://developers.cloudflare.com/browser-run/pricing/)
- [Browser Run Limits](https://developers.cloudflare.com/browser-run/limits/)
