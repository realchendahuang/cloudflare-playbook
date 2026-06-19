---
title: R2 签名上传
---

## 两条上传路径

```text
方案 A：Worker 代理上传

客户端
  │ PUT /api/files/avatar.png
  ▼
Worker
  ├─ 校验对象路径、文件类型、文件大小
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
  ├─ 生成对象路径
  └─ 返回短期 uploadUrl
      │
      ▼
客户端 ── PUT uploadUrl ──> R2 S3 入口
```

## 选择依据

小头像、小附件、低并发上传可以用 Worker 代理上传，逻辑清楚，权限集中。大文件、高并发、前端直接上传适合预签名 URL 直传，Worker 只负责鉴权、生成 key 和返回短期 URL。

私有下载时 bucket 保持私有，下载走 Worker 授权或短期签名。公开静态图片可以用 public bucket 或自定义域名读，但写入仍要走受控入口。

## 预签名 URL

R2 的预签名 URL 属于 S3 兼容接口模式：服务端用 R2 访问凭证生成一个临时 URL，客户端拿这个 URL 执行一次 `GET`、`PUT`、`HEAD` 或 `DELETE`。过期时间范围是 1 秒到 7 天。

使用 presigned URL 的场景：

- 文件较大，不希望上传流量经过 Worker。
- 前端需要直接上传到 R2。
- 每个 URL 只授权一个对象和一个操作。

presigned URL 不包含：

- 把 R2 密钥下发给浏览器。
- 生成长期不过期的上传 URL。
- 让用户自己决定最终对象路径。

## 权限设计

用户私有附件保持 bucket 私有，下载走 Worker 授权。大文件上传由后端生成短期预签名 PUT URL，前端直传。文件本体放 R2，归属、对象路径、大小、类型和状态放 D1。管理后台优先用 Cloudflare Access 保护 Worker 或后台域名。

## 生产检查

上线前至少确认这几件事：

- 对象路径由服务端生成，或做严格校验，避免用户覆盖他人文件。
- `Content-Type` 只是第一层限制；高风险业务再做内容识别或异步扫描。
- Worker 代理上传要限制文件大小；大文件改用分片上传或预签名 URL。
- CORS 只给直传或公开读取配置，允许来源保持最小范围。
- 私有文件下载走 Worker，不直接暴露 bucket。
- 上传接口叠加登录态、Turnstile、限流和配额。
- 成本主要看存储量、写入/读取类操作和访问方式；大文件放 R2。
