---
title: 架构模式
---

## 快速分流

先按项目主要矛盾分流：

- 文档站、官网、博客、知识库：先看 [静态内容站](/architecture/static-site/)，默认组合是 Workers Static Assets / Pages、Cache、Pagefind、Web Analytics。
- 接口、第三方回调、表单、评论、小后端：先看 [接口入口](/architecture/api-gateway/)，默认组合是 Workers、WAF、限流、D1、KV、R2、Queues。
- 聊天、协作、房间、强一致状态：先看 [实时应用](/architecture/realtime-app/)，默认组合是 Workers、Durable Objects、连接休眠、Queues。
- AI 搜索、自然语言问答、模型代理：先看 [AI 能力](/platform/ai/)，默认组合是 AI Gateway、Workers AI、AI Search、Vectorize。
- 客户域名、多租户、用户代码运行：先看 [平台化与多租户](/platform/platforms-saas/)，默认组合是 Cloudflare for SaaS、Workers for Platforms、Dynamic Workers。
- 图片、视频、附件、媒体分发：先看 [媒体与性能](/platform/media-performance/)，默认组合是 R2、Images、Stream、Cache。

## 判断顺序

选架构时先问这几件事：

1. 主要是读内容吗？如果是，优先静态内容站，让静态资产层承接主流量。
2. 主要是请求处理和业务接口吗？如果是，用 Worker 做入口，状态和文件交给对应能力。
3. 需要同一个资源的强一致状态吗？如果是，房间、锁、计数器进 Durable Objects。
4. 需要音视频或 WebRTC 吗？如果是，看 Realtime 或媒体能力。
5. 需要自然语言搜索或模型代理吗？如果是，先评估内容结构，再评估模型能力。
6. 需要后台和私有服务吗？如果是，Access 管身份，Tunnel 管入口。

## 取舍原则

- 静态优先：阅读流量留在 Static Assets / Pages，避免交给 Worker 处理。
- 动态分层：Worker 负责入口和轻逻辑，D1 / R2 / KV / Queues / DO 各管各的状态。
- 文件离库：文件本体进 R2，D1 只存元数据、权限和索引。
- 强一致靠 DO：房间、限流桶、单资源顺序写入使用 Durable Objects，不使用 KV。
- 慢任务异步：邮件、审核、导入、AI 后处理进 Queues / Workflows。
- 免费额度先算：先核查静态请求、Workers 请求、CPU、D1 读写行数、R2 操作，再评估升级。
- 写入口单独处理：写入口配 Turnstile、限流、WAF 或身份。
