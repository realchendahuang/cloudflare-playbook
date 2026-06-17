---
title: R2 签名上传
description: 使用 Workers、R2 和预签名 URL 设计安全文件上传路径。
---

最后核对日期：2026-06-17。

这个案例整理两种常见上传路径：小文件先用 Worker 代理上传，大文件或高并发上传再切到 R2 S3 兼容 API 的预签名 URL。两种路径都不应该把 R2 密钥放到前端。

## 目标

- 用 Wrangler 创建 R2 bucket 并绑定到 Worker。
- 区分 Worker 代理上传和 S3 presigned URL 直传。
- 明确 CORS、权限、文件大小、对象 key 和下载授权的边界。
- 给出可直接验证的 Worker 代理上传最小实现。

## 架构

```text
方案 A：Worker 代理上传

客户端
  │ PUT /api/files/avatar.png
  ▼
Worker
  ├─ 校验对象 key、content-type、content-length
  ├─ env.UPLOADS.put()
  └─ env.UPLOADS.get()
  ▼
R2 private bucket
```

```text
方案 B：Presigned URL 直传

客户端
  │ POST /api/uploads
  ▼
Worker / 后端
  ├─ 校验身份、文件名、类型、大小
  ├─ 生成对象 key
  └─ 返回短期 uploadUrl
      │
      ▼
客户端 ── PUT uploadUrl ──> R2 S3 endpoint
```

方案 A 简单，权限逻辑都在 Worker；缺点是 Worker 在数据路径上。方案 B 更适合大文件直传；缺点是要管理 R2 API token、签名过期时间、CORS 和对象 key 策略。

## 资源准备

创建 Worker 项目：

```bash
pnpm create cloudflare@latest r2-upload-api
```

创建 R2 bucket：

```bash
pnpm wrangler r2 bucket create uploads-demo
```

把 bucket 绑定到 `wrangler.jsonc`：

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "r2-upload-api",
  "main": "src/index.ts",
  "compatibility_date": "2026-06-17",
  "r2_buckets": [
    {
      "binding": "UPLOADS",
      "bucket_name": "uploads-demo"
    }
  ]
}
```

`UPLOADS` 会在 Worker 中变成 `c.env.UPLOADS`。

## 方案 A：Worker 代理上传

安装 Hono：

```bash
pnpm add hono
```

`src/index.ts`：

```ts
import { Hono } from "hono";

type Bindings = {
  UPLOADS: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

const allowedTypes = new Set(["image/png", "image/jpeg", "application/pdf"]);
const maxBytes = 10 * 1024 * 1024;

app.put("/api/files/:key", async (c) => {
  // key 会成为 R2 对象路径，只允许简单文件名，避免目录穿越和不可读对象名。
  const key = c.req.param("key").trim();
  if (!key || key.includes("/") || key.includes("..") || key.length > 160) {
    return c.json({ error: "invalid_key" }, 400);
  }

  // content-type 和 content-length 来自外部请求，只能作为第一层策略。
  const contentType = c.req.header("content-type") ?? "";
  const contentLength = Number(c.req.header("content-length") ?? 0);

  if (!allowedTypes.has(contentType)) {
    return c.json({ error: "unsupported_type" }, 415);
  }

  if (!contentLength || contentLength > maxBytes) {
    return c.json({ error: "file_too_large" }, 413);
  }

  if (!c.req.raw.body) {
    return c.json({ error: "missing_body" }, 400);
  }

  // Worker 直接把请求流写入 R2，不把整个文件读进内存。
  await c.env.UPLOADS.put(key, c.req.raw.body, {
    httpMetadata: {
      contentType,
    },
  });

  return c.json({ key }, 201);
});

app.get("/api/files/:key", async (c) => {
  // 下载也走 Worker，后续可以在这里接入登录态、Access 或签名校验。
  const key = c.req.param("key").trim();
  if (!key || key.includes("/") || key.includes("..") || key.length > 160) {
    return c.json({ error: "invalid_key" }, 400);
  }

  const object = await c.env.UPLOADS.get(key);
  if (!object) {
    return c.json({ error: "not_found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(object.body, { headers });
});

export default app;
```

本地验证：

```bash
pnpm wrangler dev
```

上传文件：

```bash
curl -X PUT http://localhost:8787/api/files/avatar.png \
  -H "Content-Type: image/png" \
  --data-binary @avatar.png
```

下载文件：

```bash
curl -i http://localhost:8787/api/files/avatar.png
```

如果要在本地开发时直接操作远程 R2，可以在 R2 binding 中配置 remote binding；默认本地开发会使用本地存储。

## 方案 B：Presigned URL 直传

R2 的 presigned URL 属于 S3 兼容 API 模式：服务端用 R2 Access Key ID 和 Secret Access Key 生成一个临时 URL，客户端拿这个 URL 执行一次 `GET`、`PUT`、`HEAD` 或 `DELETE`。过期时间范围是 1 秒到 7 天。

适合使用 presigned URL 的场景：

- 文件较大，不希望 Worker 进入数据路径。
- 前端需要直接上传到 R2。
- 每个 URL 只授权一个对象和一个操作。

不适合的做法：

- 把 R2 Secret Access Key 下发给浏览器。
- 生成长期不过期的上传 URL。
- 让用户自己决定最终对象 key。

服务端生成上传 URL 时，推荐用 Cloudflare 官方文档中的 AWS SDK v3 路径：

```ts
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// S3 client 只在可信服务端创建，不放进浏览器代码。
const s3 = new S3Client({
  region: "auto",
  endpoint: "https://<ACCOUNT_ID>.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "<ACCESS_KEY_ID>",
    secretAccessKey: "<SECRET_ACCESS_KEY>",
  },
});

// 每次上传都由服务端生成对象 key，并把 content-type 写入签名约束。
const uploadUrl = await getSignedUrl(
  s3,
  new PutObjectCommand({
    Bucket: "uploads-demo",
    Key: "users/123/avatar.png",
    ContentType: "image/png",
  }),
  { expiresIn: 900 },
);
```

浏览器直传到 presigned URL 时，R2 bucket 需要配置 CORS。只允许自己的前端域名、必要的方法和必要请求头：

```json
[
  {
    "AllowedOrigins": ["https://example.com"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

用 Wrangler 应用 CORS：

```bash
pnpm wrangler r2 bucket cors set uploads-demo --file cors.json
```

## 权限设计

| 需求 | 推荐做法 |
| --- | --- |
| 公开静态图片 | R2 public bucket 或自定义域名读，但不要开放匿名写。 |
| 用户私有附件 | bucket 保持私有，下载走 Worker 授权。 |
| 大文件上传 | 后端生成短期 presigned PUT URL，前端直传。 |
| 文件元数据 | R2 保存文件本体，D1 保存 owner、key、size、content-type、状态。 |
| 管理后台 | 优先用 Cloudflare Access 保护 Worker 或后台域名。 |

## 生产检查

| 项目 | 判断 |
| --- | --- |
| 对象 key | 服务端生成或严格校验，避免用户覆盖他人文件。 |
| 文件类型 | `Content-Type` 只能做第一层限制；关键业务还要做内容识别或异步扫描。 |
| 文件大小 | 代理上传要限制 `content-length`；大文件改用 multipart 或 presigned URL。 |
| CORS | 只给直传或公开读配置，不要把 `AllowedOrigins` 随手设成 `*`。 |
| 下载授权 | 私有文件下载走 Worker，不直接暴露 bucket。 |
| 滥用防护 | 上传接口建议叠加登录态、Turnstile、Rate Limiting 和配额。 |
| 成本口径 | R2 主要关注存储量、Class A/B 操作和数据访问模式；大文件不要落到 D1。 |

## 官方资料

- [Use R2 from Workers](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/)
- [R2 Workers API reference](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)
- [R2 presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)
- [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/)
- [R2 Wrangler commands](https://developers.cloudflare.com/r2/reference/wrangler-commands/)
