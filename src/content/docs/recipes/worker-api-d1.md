---
title: Worker API + D1
description: 使用 Workers、Hono 和 D1 构建轻量评论 API 的可复现实战。
---

最后核对日期：2026-06-17。

这个案例演示一个最小评论 API：Worker 提供 HTTP 接口，D1 保存关系型数据，Hono 负责路由和 JSON 响应。它适合表单提交、评论、轻量后台配置、小型 SaaS 的基础 CRUD。

## 目标

- 用 Wrangler 创建 D1 数据库并绑定到 Worker。
- 用 SQL migration 管理表结构。
- 用 D1 prepared statement 和 `bind()` 避免 SQL 注入。
- 用本地和远程命令分别验证数据库和 API。

## 架构

```text
浏览器 / 客户端
  │ GET /api/comments?slug=hello-world
  │ POST /api/comments
  ▼
Worker API
  ├─ Hono 路由
  ├─ 请求参数校验
  ├─ D1 prepared statements
  └─ JSON response
  ▼
D1 comments-db
```

这个路径的关键判断是：把“业务输入校验”和“SQL 参数绑定”放在 Worker，把持久化交给 D1。不要在前端拼 SQL，也不要在 Worker 里把用户输入直接拼进 SQL 字符串。

## 资源准备

创建 Worker 项目：

```bash
pnpm create cloudflare@latest worker-api-d1
```

初始化时选择 Worker-only、TypeScript，并先不要部署。

安装 Hono：

```bash
pnpm add hono
```

创建 D1 数据库：

```bash
pnpm wrangler d1 create comments-db
```

把输出写入 `wrangler.jsonc`：

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "worker-api-d1",
  "main": "src/index.ts",
  "compatibility_date": "2026-06-17",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "comments-db",
      "database_id": "<YOUR_DATABASE_ID>"
    }
  ]
}
```

`binding` 是代码里的变量名，所以这里会在 Worker 运行时得到 `c.env.DB`。

## 数据表

创建 migration：

```bash
pnpm wrangler d1 migrations create comments-db create_comments
```

把生成的 SQL 文件改成：

```sql
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,
  author TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_comments_slug_created_at
  ON comments (slug, created_at DESC);
```

先应用到本地 D1：

```bash
pnpm wrangler d1 migrations apply comments-db --local
```

确认无误后应用到远程 D1：

```bash
pnpm wrangler d1 migrations apply comments-db --remote
```

官方 migration 文档建议把 migration 文件纳入版本控制。执行 migration 时可以使用 binding name 或 database name；为了减少误操作，生产项目更推荐使用不会轻易改名的 database name。

## Worker 代码

`src/index.ts`：

```ts
import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// 只给 API 路径开启 CORS，前后端同域部署时可以删掉这一行。
app.use("/api/*", cors());

app.get("/api/comments", async (c) => {
  // slug 来自查询字符串，属于外部输入，必须先做边界校验。
  const slug = String(c.req.query("slug") ?? "").trim();
  if (!slug || slug.length > 120) {
    return c.json({ error: "invalid_slug" }, 400);
  }

  // 用户输入通过 bind() 进入 SQL，避免字符串拼接造成 SQL 注入。
  const { results } = await c.env.DB.prepare(
    "SELECT id, slug, author, body, created_at FROM comments WHERE slug = ? ORDER BY created_at DESC LIMIT 50",
  )
    .bind(slug)
    .all();

  return c.json({ comments: results });
});

app.post("/api/comments", async (c) => {
  // JSON body 是系统边界，读取后统一转换成字符串再裁剪空白。
  const input = await c.req.json<{
    slug?: string;
    author?: string;
    body?: string;
  }>();

  const slug = String(input.slug ?? "").trim();
  const author = String(input.author ?? "").trim();
  const body = String(input.body ?? "").trim();

  if (!slug || slug.length > 120) {
    return c.json({ error: "invalid_slug" }, 400);
  }

  if (!author || author.length > 60) {
    return c.json({ error: "invalid_author" }, 400);
  }

  if (!body || body.length > 2_000) {
    return c.json({ error: "invalid_body" }, 400);
  }

  // 写入同样使用 prepared statement，所有用户字段都通过 bind() 绑定。
  const result = await c.env.DB.prepare(
    "INSERT INTO comments (slug, author, body) VALUES (?, ?, ?)",
  )
    .bind(slug, author, body)
    .run();

  return c.json({ id: result.meta.last_row_id }, 201);
});

export default app;
```

## 本地验证

启动本地 Worker：

```bash
pnpm wrangler dev
```

写入一条评论：

```bash
curl -X POST http://localhost:8787/api/comments \
  -H "Content-Type: application/json" \
  -d '{"slug":"hello-world","author":"Kim","body":"第一条 D1 评论"}'
```

读取评论：

```bash
curl "http://localhost:8787/api/comments?slug=hello-world"
```

直接查本地 D1：

```bash
pnpm wrangler d1 execute comments-db --local \
  --command "SELECT id, slug, author, created_at FROM comments ORDER BY id DESC LIMIT 5"
```

部署后，把 `localhost:8787` 换成 Worker 域名再跑一遍 `curl`。

## 生产检查

| 项目 | 判断 |
| --- | --- |
| 输入校验 | 所有来自 query、path、body、header 的值都先校验长度和格式。 |
| SQL 写法 | 读写都用 prepared statement，不拼接用户输入。 |
| 索引 | 高频筛选字段要建索引；这个案例按 `slug + created_at` 建索引。 |
| 幂等 | 评论、表单、支付回调这类写入场景要考虑重复提交。 |
| 滥用防护 | 公开写接口建议叠加 Turnstile、Rate Limiting 或登录态。 |
| 数据边界 | D1 适合轻量关系型数据，不适合把大文件、日志流或高吞吐事件全塞进去。 |

## 官方资料

- [D1 Getting started](https://developers.cloudflare.com/d1/get-started/)
- [Build a Comments API](https://developers.cloudflare.com/d1/tutorials/build-a-comments-api/)
- [D1 prepared statement methods](https://developers.cloudflare.com/d1/worker-api/prepared-statements/)
- [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/)
- [D1 Wrangler commands](https://developers.cloudflare.com/d1/wrangler-commands/)
