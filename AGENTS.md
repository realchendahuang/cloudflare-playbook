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
