# 项目说明

```bash
# 开发
pnpm dev

# 检查
pnpm build
pnpm preview

# 生成给 AI 读取的 llm.txt
pnpm gen:llmtxt

# 快速部署到 Cloudflare Workers
pnpm deploy:quick
pnpm deploy:quick -- --dry-run

# 原始部署命令
pnpm deploy

# 确认 Wrangler 登录
pnpm exec wrangler whoami
```

```txt
项目：Cloudflare 实战手册
Cloudflare Worker：cloudflare-playbook
生产地址：https://chendahuang.com/playbook/cloudflare/
旧地址：https://cloudflare-playbook.chendahuang.top
构建目录：docs/.vitepress/dist
Worker 入口：src/index.ts
主文档：docs/index.md
扩展文档：docs/agents.md、docs/domain.md
README 同步：pnpm sync:readme
```

## 分支与提交规则

- **直接在 `main` 上干。不要新建 feature 分支，不要开 PR。** 改完 → 提交 → `git push origin main` → 部署，一条线走完。
- 只有 `main` 这一条长期分支。除非用户明确要求建分支，否则一律在 `main` 上提交和推送。
- 部署直接从当前工作区的构建产物上线（`pnpm deploy:quick` 会自己 build），不需要等合并。
- 如果不小心建了临时分支，用 `git merge --ff-only` 并回 `main` 后删掉本地和远端分支，保持仓库只有 `main`。
