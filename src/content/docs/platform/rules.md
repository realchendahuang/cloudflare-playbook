---
title: Rules
description: Cloudflare Rules 的普通项目选型、免费与计划边界、Page Rules 迁移和常见误区。
---

最后核对日期：2026-06-18。Rules 的规则数量、执行顺序、Beta 状态和 Page Rules 迁移节奏会变化，上线前以 Cloudflare Rules 官方文档为准。

## 一句话判断

Cloudflare Rules 用来处理“请求到 Cloudflare 之后，应该跳转、改路径、改设置、改回源、改缓存，还是进入轻量逻辑”。

普通项目先记住三点：

| 判断 | 结论 |
| --- | --- |
| 新项目还要不要写 Page Rules？ | 不建议。新配置优先用现代 Rules。 |
| 能用 Rules 解决还要不要写 Worker？ | 先不要。跳转、改头、改路径、改缓存、改回源优先用 Rules。 |
| 什么情况下才上 Worker？ | 需要数据库、KV / R2 / D1 / Durable Objects、鉴权业务、队列、复杂日志或完整工程流程时再上。 |

Rules 通常要求对应域名或子域名是 Proxied，让流量先经过 Cloudflare。DNS-only 记录不会进入这套处理链。

## 先问六个问题

| 问题 | 如果答案是“是” |
| --- | --- |
| 只是把旧 URL 或域名跳到新地址？ | 用 Single Redirects；大量静态旧链接用 Bulk Redirects。 |
| 只是改路径、query 或请求 / 响应 header？ | 用 Transform Rules。 |
| 只是针对某些路径调整 Cloudflare 设置？ | 用 Configuration Rules。 |
| 只是让某些路径回到不同端口或后端？ | 用 Origin Rules；Free / Pro / Business 主要能改端口。 |
| 只是针对某些内容调缓存？ | 用 Cache Rules，不要先写 Worker 缓存逻辑。 |
| 规则动作已经需要 JavaScript？ | Pro+ 可以看 Snippets；需要平台绑定和完整应用时用 Workers。 |

## 免费与计划边界

这里的计划是 zone / account 计划，不是 Workers Paid。每月 `$5` Workers Paid 不会把 Free zone 的 Rules 配额提升到 Pro。

| 能力 | Free | Pro | Business | Enterprise | 普通项目判断 |
| --- | ---: | ---: | ---: | ---: | --- |
| Single Redirects | 10 | 25 | 50 | 300 | 域名规范化、少量路径跳转够用。 |
| Transform Rules | 10 | 25 | 50 | 300 | 改路径和 header 的主入口。 |
| Configuration Rules | 10 | 25 | 50 | 300 | 按路径调整 Cloudflare 设置。 |
| Origin Rules | 10 | 25 | 50 | 300 | Free 起可改 destination port；Host、SNI、DNS record override 是 Enterprise。 |
| Compression Rules | 10 | 25 | 50 | 300 | 默认压缩够用时不用碰。 |
| Cloud Connector | 10 | 25 | 50 | 300 | Beta；路由到 R2 / S3 / GCS / Azure Blob。 |
| Bulk Redirect Rules | 15 | 15 | 15 | 50 | 大批静态旧链接迁移。 |
| Bulk Redirect Lists | 5 | 5 | 5 | 25 | 和 Bulk Redirect Rules 搭配使用。 |
| URL redirects across lists | 10,000 | 25,000 | 50,000 | 1,000,000 | 大站迁移才容易成为瓶颈。 |
| Snippets | 不可用 | 25 | 50 | 300 | Free 不能用；Pro+ 才适合轻量 JavaScript。 |
| Custom Errors | 不可用 | 25 | 50 | 300 | 付费计划才考虑品牌化错误页。 |

Single Redirects 和 Transform Rules 的正则支持从 Business 起可用。能用通配符、路径前缀和清晰条件表达的，就不要为了炫技依赖正则。

## 推荐顺序

普通项目新增规则时，按这个顺序想：

| 顺序 | 先做什么 | 为什么 |
| --- | --- | --- |
| 1 | 域名和 URL 规范化。 | 先决定 `www`、HTTPS、旧路径怎么跳。 |
| 2 | 路径和 header 调整。 | Transform Rules 早于很多后续规则，先把请求形态定下来。 |
| 3 | Cloudflare 设置和安全策略。 | Configuration Rules、WAF、Rate Limiting 等不要互相打架。 |
| 4 | 回源和缓存。 | Origin Rules、Cache Rules 会直接影响稳定性和成本。 |
| 5 | 轻量逻辑。 | Snippets 或 Workers 放最后，不要用代码替代简单规则。 |

规则越靠前，越要保守。全站 redirect、全站 rewrite、全站 challenge、全站 cache 都可能把证书验证、后台、API 或登录流程一起误伤。

## Page Rules 怎么办

Page Rules 不适合作为新项目主线。Cloudflare 官方迁移指南建议新实现使用现代 Rules，并说明现有 Page Rules 的自动迁移计划在 2025 年末或更晚推进，迁移前会提前通知。

迁移时不要机械照搬。先把一个旧 Page Rule 拆成动作：

| 旧需求 | 现代入口 |
| --- | --- |
| Forwarding URL、HTTP 到 HTTPS | Single Redirects |
| Browser Cache TTL、Cache Everything、Cache on Cookie | Cache Rules |
| Host Header Override、Resolve Override | Origin Rules |
| Security Level、Automatic HTTPS Rewrites、Rocket Loader、Zaraz | Configuration Rules |
| IP Geolocation Header、True Client IP Header | Managed Transforms |
| URL path rewrite、header 修改 | Transform Rules |

迁移顺序建议：

| 步骤 | 做什么 |
| --- | --- |
| 1 | 先列出现有 Page Rules，每条只保留“它到底想做什么”。 |
| 2 | 先迁移跳转，再迁移路径改写和回源。 |
| 3 | 再迁移缓存和配置类开关。 |
| 4 | 每次只迁移少量关键路径，观察后再删除旧规则。 |

现代 Rules 会优先于 Page Rules。迁移期间如果新旧规则同时覆盖同一路径，读者看到的问题通常不是“Cloudflare 坏了”，而是规则叠加了。

## Snippets 和 Workers

Snippets 是 Pro+ 计划里的轻量 JavaScript，Workers 是完整开发者平台。不要因为两者都能写 JavaScript 就混为一谈。

| 问题 | 选 Snippets | 选 Workers |
| --- | --- | --- |
| 只是改 header、简单跳转、轻量鉴权或维护页。 | 可以。 | 通常太重。 |
| 需要 D1、KV、R2、Durable Objects、Queues。 | 不适合。 | 适合。 |
| 需要日志、测试、版本发布、CI、复杂业务。 | 不适合。 | 适合。 |
| 还在 Free zone。 | 不可用。 | Workers Free 可先跑小 API。 |

Snippets 有 5 ms 执行时间、2 MB 内存、32 KB 包大小限制。它适合“轻轻改一下请求”，不是做应用后端。

## 常见组合

| 场景 | 推荐组合 |
| --- | --- |
| 文档站域名规范化 | Single Redirects 做 `www` / apex 统一，保留路径和 query。 |
| 旧博客迁移 | 少量规律路径用 Single Redirects / Transform Rules；大量静态映射用 Bulk Redirects。 |
| 静态站缓存 | Cache Rules 控制 HTML 和静态 hash 资源，不让登录态内容误缓存。 |
| API 后端分流 | Transform Rules 调整路径，Origin Rules 调整回源端口；复杂鉴权交给 Worker。 |
| R2 / S3 路径接入 | Cloud Connector 路由对象存储，再用 Cache Rules 管缓存。 |
| 临时维护页 | Pro+ 用 Snippets 或 Custom Errors；Free 项目优先让源站返回维护页。 |

## 排查优先级

Cloudflare Trace 是模拟工具，适合上线前看“这个请求会命中什么”。Log Explorer 是历史日志，适合看“真实线上发生过什么”。不要拿 Trace 当线上证据。

| 问题 | 先看什么 |
| --- | --- |
| 规则完全不生效 | DNS 是否 Proxied，规则是否启用，条件是否匹配真实路径。 |
| 跳转不符合预期 | 是否有更早的 Single Redirects 或终止动作先命中。 |
| 缓存不符合预期 | Cache Rules、源站缓存头、Worker 和登录态是否互相影响。 |
| Page Rules 迁移后行为变化 | 是否被现代 Rules 覆盖，是否有新旧规则同时命中。 |
| 用户被循环挑战或验证失败 | 宽泛规则是否误伤 Cloudflare challenge 或证书验证相关路径。 |

## 什么时候升级

| 信号 | 可能需要什么 |
| --- | --- |
| Free 的 10 条规则不够。 | 先合并和删除无效规则，再考虑 Pro。 |
| 需要正则匹配。 | Business 起支持更多正则能力。 |
| 需要改 Host header、SNI 或 DNS record override。 | Origin Rules 的 Enterprise 能力。 |
| 需要轻量 JavaScript 且不想进 Workers 计费。 | Pro+ 的 Snippets。 |
| 需要品牌化 Cloudflare / origin 错误页。 | Pro+ 的 Custom Errors。 |

## 常见误区

| 误区 | 更好的做法 |
| --- | --- |
| 新项目继续写 Page Rules。 | 新实现优先现代 Rules。 |
| 所有问题都上 Worker。 | 跳转、改路径、改 header、缓存和回源先用 Rules。 |
| Workers Paid 会提高 Rules 配额。 | 不会；Rules 配额跟 zone / account 计划相关。 |
| Free 可以用 Snippets。 | 不可以，Snippets 从 Pro 起可用。 |
| Bulk Redirects 可以做复杂动态跳转。 | 它适合大量静态映射，复杂逻辑看 Single Redirects、Snippets 或 Workers。 |
| 改 Origin Rules 就能随便换后端。 | Free / Pro / Business 主要能改端口；Host / SNI / DNS override 看 Enterprise。 |
| Trace 通过就等于线上没问题。 | Trace 是模拟；线上复盘要看真实日志、Ray ID 和时间窗口。 |

## GitHub 开源参考

| 仓库 / 源文件 | 用途 |
| --- | --- |
| [cloudflare/cloudflare-docs Rules source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/rules) | 官方 Rules 文档源文件，适合追踪 Redirects、Transform、Origin、Snippets、Trace 和 Page Rules 迁移。 |
| [cloudflare/cloudflare-docs Cache Rules source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/cache/how-to/cache-rules) | Cache Rules 源文件，迁移缓存类 Page Rules 时优先核对。 |
| [cloudflare/templates](https://github.com/cloudflare/templates) | Cloudflare 官方模板集合，适合看 Rules、Workers、D1、R2、Pages 如何组合。 |

## 事实来源

- [Cloudflare Rules](https://developers.cloudflare.com/rules/)
- [Redirects](https://developers.cloudflare.com/rules/url-forwarding/)
- [Transform Rules](https://developers.cloudflare.com/rules/transform/)
- [Configuration Rules](https://developers.cloudflare.com/rules/configuration-rules/)
- [Origin Rules](https://developers.cloudflare.com/rules/origin-rules/)
- [Cloudflare Snippets](https://developers.cloudflare.com/rules/snippets/)
- [Snippets vs Workers](https://developers.cloudflare.com/rules/snippets/when-to-use/)
- [Cloud Connector](https://developers.cloudflare.com/rules/cloud-connector/)
- [Compression Rules](https://developers.cloudflare.com/rules/compression-rules/)
- [Custom Errors](https://developers.cloudflare.com/rules/custom-errors/)
- [Trace a request](https://developers.cloudflare.com/rules/trace-request/)
- [Page Rules migration guide](https://developers.cloudflare.com/rules/reference/page-rules-migration/)
