---
title: Worker API + D1
description: 使用 Workers 和 D1 构建轻量 API 的案例骨架。
---

# Worker API + D1

这个案例用于演示如何用 Workers 提供 API，并用 D1 存储关系型数据。

## 适合场景

- 小型表单提交。
- 简单后台管理。
- 低到中等复杂度的业务数据。
- 需要 SQL 查询但不想维护传统数据库的项目。

## 架构

```text
浏览器或客户端
  │
  ▼
Worker API
  │
  ▼
D1 数据库
```

## 待补充

- D1 创建命令。
- Wrangler 绑定配置。
- 数据库迁移文件。
- API 代码。
- 本地测试和线上验证步骤。

:::note
涉及 D1 限制、价格和 API 细节时，需要先核对 Cloudflare 官方文档。
:::
