---
title: 独立开发者推荐栈
description: 面向个人项目、开源项目和早期 SaaS 的 Cloudflare 产品组合建议。
---

# 独立开发者推荐栈

独立开发者用 Cloudflare，核心不是把所有产品都用上，而是用最少的产品覆盖最多的基础设施问题。

## 起步组合

```text
域名入口: DNS + CDN + SSL/TLS + DDoS
前端页面: Workers Static Assets 或 Pages
动态 API: Workers
结构化数据: D1
文件对象: R2
配置缓存: KV
站点分析: Web Analytics
AI 调用: AI Gateway
```

## 按项目类型选

| 项目 | 推荐组合 | 暂时不要上 |
| --- | --- | --- |
| 文档站 / 博客 | Starlight 或 Astro + Workers Static Assets + Pagefind + Web Analytics | D1、AI Search、Queues，除非有评论或问答。 |
| 文档社区 | Workers Static Assets + Giscus 或 Waline + 后续 Turnstile | 一开始就维护自定义评论组件和复杂管理端。 |
| 小型 SaaS | Workers + D1 + KV + R2 + AI Gateway | 微服务、Kubernetes、自建 Postgres 集群。 |
| AI 工具 | Workers + AI Gateway + D1 记录 + R2 文件 + 后续 Workers AI/Vectorize | 一开始就做多 Agent 框架。 |
| 文件工具 | Workers + R2 + D1 metadata + Signed URL | 把文件放进 Git、Pages 或 D1。 |
| 实时协作 | Workers + Durable Objects + D1/R2 持久化 | 用 KV 做强一致房间状态。 |
| 后台任务 | Workers + Queues + Cron Triggers + D1/R2 | 请求里同步跑慢任务。 |
| 私有管理台 | Workers Static Assets + Access/Tunnel + D1 | 裸露公网后台和自写弱登录。 |

## 三阶段路线

### 第一阶段：免费跑起来

- DNS、CDN、HTTPS、DDoS 先接上。
- 静态页面优先 Pages 或 Workers Static Assets。
- API 用 Workers。
- 数据用 D1，文件用 R2，配置用 KV。
- 搜索用 Pagefind。
- 分析用 Web Analytics。

### 第二阶段：有人用了再补

- 表单提交量明显增加：加 Turnstile 服务端验证。
- API 慢：看缓存、D1 索引、外部 API 延迟。
- 文件变多：把图片、附件、导出统一进 R2。
- AI 成本不清楚：先接 AI Gateway 记录请求。
- 后台任务变慢：引入 Queues。

### 第三阶段：产品化以后再买复杂度

- 多人协作或房间状态：Durable Objects。
- 自然语言文档搜索：AI Search 或 Vectorize。
- 高基数业务指标：Analytics Engine。
- 管理后台安全：Access / Zero Trust。
- 企业级安全：WAF 托管规则、Bot、API Shield。

## 成本纪律

1. 静态内容不要消耗动态请求。
2. 数据模型先简单，D1 表和索引清楚就够。
3. AI 先过网关，再决定要不要上自托管推理或向量库。
4. 文件不要放数据库。
5. 不为不存在的规模提前设计架构。
6. 每次付费都要回答：我是在买流量、CPU、存储、构建、安全，还是在买心安？

## 本站为什么这么搭

Cloudflare Playbook 当前选择：

| 能力 | 产品 | 原因 |
| --- | --- | --- |
| 文档 | Astro + Starlight | Markdown 友好，开源协作成本低。 |
| 搜索 | Pagefind | 免费、静态、低复杂度。 |
| 部署 | Workers Static Assets | 静态站和 API 在同一个 Worker 项目。 |
| 评论 | Starlight Giscus | 复用成熟组件和 GitHub Discussions。 |
| 主题 | Starlight Flexoki | 复用成熟主题，并使用橙色强调色。 |
| 未来增强 | AI Search / Turnstile | 内容和流量真的上来后再加。 |
