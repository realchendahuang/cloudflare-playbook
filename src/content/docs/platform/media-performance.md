---
title: 媒体与性能
description: Images、Stream、Speed、Zaraz 和 Browser Run 在普通项目里的取舍、免费边界和成本控制。
---

最后核对日期：2026-06-17。

Cloudflare 的媒体和性能产品很容易被混在一起：图片、视频、缓存、前端速度、第三方脚本、浏览器自动化都能影响用户体验，但它们不是同一个问题。

```text
媒体与性能
  ├─ 图片
  │    └─ R2 存原图，Images 做变换、压缩、响应式图片
  ├─ 视频
  │    └─ Stream 做上传、编码、播放、直播和签名访问
  ├─ 页面速度
  │    └─ Cache / Speed / Observatory / Web Analytics 看真实瓶颈
  ├─ 第三方脚本
  │    └─ Zaraz 管分析、广告、聊天、营销脚本和 consent
  └─ 浏览器任务
       └─ Browser Run 做截图、PDF、爬取、预渲染和自动化
```

## 一句话判断

普通项目的默认策略是：**静态构建产物只放页面和小资源；用户上传、大图、附件、视频不要塞进 `dist`；图片原图优先 R2，需要裁剪和格式转换再接 Images；视频产品直接看 Stream；前端速度先用 Cache、Web Analytics 和 Speed 诊断；第三方脚本变多再看 Zaraz；截图、PDF、爬虫任务再上 Browser Run。**

## 产品怎么选

| 场景 | 推荐组合 | 不推荐 |
| --- | --- | --- |
| 文档站、官网、博客 | Workers Static Assets + Cache + Web Analytics + 少量优化规则 | 把所有图片和视频硬塞进构建产物 |
| 用户上传图片 | R2 原图 + Images transformations + Worker 鉴权 | 让前端直传公开 bucket 且不做尺寸限制 |
| 商品图、头像、封面图 | R2 或 Images storage + variants / transformations | 每个尺寸都手工生成并提交到 Git |
| 视频课程、产品演示 | Stream + signed URLs + analytics | 用 R2 裸扛完整视频播放链路 |
| 页面性能诊断 | Speed / Observatory + Web Analytics + Lighthouse | 只看一次本地 Lighthouse 就下结论 |
| 第三方脚本很多 | Zaraz + consent management + selective loading | 在前端模板里散落一堆营销脚本 |
| 截图、PDF、爬虫 | Browser Run + Queues + R2 | 在同步 API 里长时间等浏览器任务 |

## Images

Images 解决的是图片变换、优化、存储和分发。它有两个常见用法：

1. **只做 transformations**：原图放在 R2 或其他 origin，Cloudflare 在边缘按 URL 参数或 Workers binding 做 resize、format、quality 等处理。
2. **使用 Images storage**：图片上传到 Cloudflare Images，再通过 variants、signed URLs、自定义域名等方式分发。

当前官方价格口径：

| 能力 | Free | Paid |
| --- | --- | --- |
| Images Transformed | 每月 5,000 个 unique transformations。超过后不会收费，新 transformation 返回 `9422`，缓存中已有 transformation 继续服务。 | 前 5,000 个 unique transformations included，超出 $0.50 / 1,000。 |
| Images Stored | Free 不提供 Images storage。 | $5 / 100,000 images stored / month。 |
| Images Delivered | Free 不适用。 | $1 / 100,000 images delivered / month。 |

几个关键限制：

- Remote image transformation：源图最大 100 MB。
- Hosted image upload：单图最大 10 MB。
- 普通图片面积限制 100 MP。
- 普通图片单边最大 12,000 pixels。
- AVIF 输入/输出相关限制更严格，AVIF 输入属于 Enterprise。
- Images binding 的 `.input()` 最大 20 MB。
- SVG 会被 Cloudflare 的 `svg-hush` 做安全清理，但不会被 resize。

普通项目的建议：

1. 原图和用户上传先放 R2。
2. 页面里只请求实际需要的尺寸。
3. 常用尺寸固定下来，不要让任意用户参数生成无限 transformation。
4. 需要私有图时，用 Worker 鉴权或 Images signed URLs。
5. 大 GIF / WebP 动图优先转视频，不要让图片链路扛动画播放。

## Stream

Stream 解决的是视频上传、编码、存储、播放、直播和分析。视频和图片不一样，普通 CDN 或 R2 裸文件能“下载”，但不等于适合做完整播放体验。

当前官方价格口径：

| 计费项 | 价格 / 边界 | 说明 |
| --- | --- | --- |
| Ingress / encoding | 免费 | 上传和编码本身不单独收费。 |
| Minutes stored | $5 / 1,000 minutes stored，预付购买 | 按视频时长，不按文件大小。直播录制也会占用。 |
| Minutes delivered | $1 / 1,000 minutes delivered，后付按量 | Web/app 播放、HLS/DASH、MP4 download、simulcast 输出都会计入。 |
| Media Transformations | 每月 5,000 unique transformation operations 免费，超出 $0.50 / 1,000 | 视频生成 still frame 算 1 次；生成优化视频或抽音频按输出秒数计。 |

官方 FAQ 里有几个普通项目特别容易踩的点：

- 默认单个视频上传最大 30 GB。
- 默认最多 120 个视频同时 queued 或 encoding。
- 账户购买的总视频存储时长用完后，不能继续上传新视频或开始新直播。
- 取消 Stream subscription 后，如果 30 天内没有续订，视频会被移除。
- Stream videos 可以嵌入到不在 Cloudflare 上的域名。
- 如果页面里放很多 Stream Player，PageSpeed 分数可能被播放器脚本影响；首屏外播放器要 lazy load。

普通项目判断：

| 场景 | 选法 |
| --- | --- |
| 少量公开视频、下载为主 | R2 + 普通链接可能够用。 |
| 视频课程、产品演示、会员内容 | Stream。 |
| 直播、回放、剪辑 | Stream Live。 |
| 需要签名播放、防盗链、播放分析 | Stream signed URLs + analytics。 |
| 短动图、GIF 过大 | 转成 MP4 / WebM 或用 Stream / Media Transformations。 |

## Speed 与 Observatory

Speed 是 Cloudflare 的性能诊断入口，重点不是“开一个按钮立刻变快”，而是把性能问题拆成可观察的指标和推荐动作。

Speed 当前包括：

- Observatory：synthetic tests + RUM，给 Lighthouse、Core Web Vitals 和网络测试结果。
- Origin Analytics：看源站响应时间、慢接口和错误。
- Settings / Recommendations：给出 Cloudflare 产品和配置建议。
- Aggregated Internet Measurement：理解访客网络质量。

Observatory 的边界要看清：

| 能力 | 当前官方说明 |
| --- | --- |
| Speed 产品 | Available on all plans。 |
| Free RUM | Free customers 默认自动启用 RUM，排除 EU traffic，可关闭。 |
| Synthetic test quota | 当前配额表列出 Pro 50 one-off / 5 recurring，Business 100 / 10，Enterprise 150 / 15，recurring frequency 为 daily。 |
| 测试方式 | Browser test 跑 headless browser + Lighthouse；Network test 看网络和后端性能。 |

普通项目先看这四个问题：

1. 慢的是首屏 HTML、静态资源、图片、第三方脚本，还是 API？
2. 用户真实体验差，还是 synthetic test 分数差？
3. 缓存命中、图片尺寸、字体、脚本加载和源站响应哪个最影响 LCP / INP？
4. 这个优化是否能用 Cloudflare 的 Cache、Images、Fonts、Early Hints、HTTP/3、Zaraz 解决？

## Zaraz

Zaraz 解决的是第三方脚本治理。分析、广告、聊天、营销自动化、像素和 consent 逻辑如果都直接塞进前端，页面会变慢，隐私和安全边界也会变乱。

当前官方价格口径：

| 能力 | 边界 |
| --- | --- |
| 可用性 | Available to all Cloudflare users, across all tiers。 |
| 免费事件 | 每个 Cloudflare account 每月 1,000,000 free Zaraz Events。 |
| 付费 | 每额外 1,000,000 Zaraz Events 为 $5/month。 |
| 超出免费但未启用 paid | 达到 50%、80%、90% 会邮件提醒；超过 1,000,000 events 后 Zaraz 会停用到下个 billing cycle。 |
| 功能 | 官方说明所有 features and tools always available on all accounts。 |

普通项目不需要一开始就上 Zaraz。触发条件是：

- 页面里已经有多个第三方工具。
- 需要统一 consent management。
- 需要 selectively load 某些脚本。
- 想把事件、触发器、工具配置从前端模板里移出去。
- 需要用 Zaraz Monitoring 看工具加载和事件投递。

## Browser Run

Browser Run 以前叫 Browser Rendering，用来在 Cloudflare 上跑 headless Chrome。它适合截图、PDF、动态网页抓取、预渲染、AI agent 浏览和测试，不适合作为普通接口的默认依赖。

当前官方免费/付费边界：

| 能力 | Workers Free | Workers Paid |
| --- | --- | --- |
| Browser hours | 10 minutes/day | 10 hours/month included，超出 $0.09/hour；limits 页说明 paid browser hours no limit，按 pricing 计费。 |
| Concurrent browsers | Browser Sessions 为 3/account | Pricing 页 included 10 browsers averaged monthly，超出 $2/browser；limits 页默认 120/account，可申请提高。 |
| New browser instances | 1 every 20 seconds | 1 per second。 |
| Browser timeout | 默认 60 seconds，可用 keep_alive 到 10 minutes | 默认 60 seconds，可用 keep_alive 到 10 minutes。 |
| Quick Actions requests | 1 every 10 seconds | 10 per second。 |
| `/crawl` Free 附加限制 | 5 crawl jobs/day，100 pages/crawl | 按 paid limits。 |

成本控制关键点：

- 能用 `fetch` 就不要开浏览器。
- 浏览器任务放进 Queues，结果放 R2 / D1，不要同步卡住用户请求。
- Browser Sessions 结束后必须 `browser.close()`，最好放在 `try/finally`。
- 需要高并发时复用 session、tab 或 Durable Objects 管理会话。
- 截图、PDF、OG image、动态站预渲染是合适场景；普通 API 转换不是。

## 本站当前选择

本站是文档站，当前不需要 Images storage、Stream、Zaraz 或 Browser Run。更好的默认做法是：

| 模块 | 当前选择 | 后续触发条件 |
| --- | --- | --- |
| 图片 | 直接随文档构建的小图，未来大图进 R2。 | 图片数量、尺寸和变体变多后再接 Images。 |
| 视频 | 暂不托管视频。 | 做课程、长演示或直播时再接 Stream。 |
| 性能观测 | Pagefind + Static Assets + Web Analytics / Dashboard。 | 出现性能问题后用 Speed / Observatory 定位。 |
| 第三方脚本 | 保持少量必要脚本。 | 营销、统计、聊天脚本变多后再接 Zaraz。 |
| 自动化浏览器 | 不在主请求链路使用。 | 需要截图、PDF、网页转 Markdown 或爬虫时用 Browser Run + Queues。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 静态资产免费，所以视频和大图都放进 `dist`。 | 构建产物只放站点资源；大图、附件、视频进 R2 / Images / Stream。 |
| R2 免 egress，所以视频一定用 R2。 | R2 适合对象存储；完整视频体验看 Stream。 |
| Images 免费就是无限图片优化。 | Free 是每月 5,000 unique transformations，超出新 transformation 会返回 `9422`。 |
| Stream 按文件大小计费。 | Stream storage 按视频时长计，不按文件大小。 |
| 性能优化靠一次 Lighthouse。 | Synthetic test 和真实用户数据都要看，尤其是 LCP / INP。 |
| Zaraz 会自动让所有脚本变好。 | 先减少脚本，再把必要第三方工具迁入 Zaraz。 |
| Browser Run 可以替代普通 HTTP 请求。 | 浏览器时间贵，只有动态渲染、截图、PDF、爬取才值得开。 |

## GitHub 开源参考

| 仓库 | 用途 |
| --- | --- |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，适合学习教程站如何组织学习路线和资料索引。 |
| [cloudflare/cloudflare-docs Images source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/images) | 官方 Images 文档源文件，适合追踪 pricing、limits、transformations、bindings 和 storage。 |
| [cloudflare/cloudflare-docs Stream source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/stream) | 官方 Stream 文档源文件，适合追踪 pricing、upload、live、player、analytics 和 FAQ。 |
| [cloudflare/cloudflare-docs Speed source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/speed) | 官方 Speed 文档源文件，适合追踪 Observatory、Origin Analytics、RUM 和 optimization。 |
| [cloudflare/cloudflare-docs Zaraz source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/zaraz) | 官方 Zaraz 文档源文件，适合追踪 pricing、events、consent、Web API 和 Monitoring。 |
| [cloudflare/cloudflare-docs Browser Run source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/browser-run) | 官方 Browser Run 文档源文件，适合追踪 pricing、limits、Quick Actions、Playwright、Puppeteer 和 CDP。 |
| [cloudflare/svg-hush](https://github.com/cloudflare/svg-hush) | Cloudflare 用于清理 SVG 的开源工具，适合理解 Images 处理 SVG 的安全边界。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | 官方模板集合，适合找 Workers、R2、Astro 等组合案例。 |
| [cloudflare/queues-web-crawler](https://github.com/cloudflare/queues-web-crawler) | Cloudflare 官方 Queues + Browser Rendering / Browser Run crawler 示例。 |

## 官方资料

- [Cloudflare Images](https://developers.cloudflare.com/images/)
- [Images Pricing](https://developers.cloudflare.com/images/pricing/)
- [Images Limits and formats](https://developers.cloudflare.com/images/get-started/limits/)
- [Images Transform via Workers](https://developers.cloudflare.com/images/optimization/transformations/transform-via-workers/)
- [Images Direct Creator Upload](https://developers.cloudflare.com/images/storage/upload-images/direct-creator-upload/)
- [Cloudflare Stream](https://developers.cloudflare.com/stream/)
- [Stream Pricing](https://developers.cloudflare.com/stream/pricing/)
- [Stream FAQ](https://developers.cloudflare.com/stream/faq/)
- [Secure your Stream](https://developers.cloudflare.com/stream/viewing-videos/securing-your-stream/)
- [Speed](https://developers.cloudflare.com/speed/)
- [Observatory](https://developers.cloudflare.com/speed/observatory/)
- [Run Observatory test](https://developers.cloudflare.com/speed/observatory/run-speed-test/)
- [Zaraz](https://developers.cloudflare.com/zaraz/)
- [Zaraz Pricing](https://developers.cloudflare.com/zaraz/pricing-info/)
- [Zaraz Consent Management](https://developers.cloudflare.com/zaraz/consent-management/)
- [Browser Run](https://developers.cloudflare.com/browser-run/)
- [Browser Run Pricing](https://developers.cloudflare.com/browser-run/pricing/)
- [Browser Run Limits](https://developers.cloudflare.com/browser-run/limits/)
