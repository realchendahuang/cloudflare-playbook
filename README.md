# Cloudflare Playbook

面向独立开发者和小型团队的 Cloudflare 单页实战手册。

线上阅读：<https://cloudflare-playbook.chendahuang.top/>

## 内容

正文集中在 `docs/index.md`。

## 技术栈

- VitePress
- Cloudflare Workers Static Assets
- Wrangler

## 本地开发

```bash
pnpm install
pnpm dev
```

## 构建

```bash
pnpm build
```

## 部署

```bash
pnpm run deploy
```

## 贡献项目

新增项目请编辑 `docs/index.md`，放到对应分类下。

推荐格式：

```markdown
| [owner/repo](https://github.com/owner/repo) | Workers、D1、R2 | 一句话说明可借鉴点 |
```

收录标准：

- 项目必须真实使用 Cloudflare 能力。
- 描述只写一句话。
- 标明 Workers、Pages、D1、R2、KV、Durable Objects、AI Gateway 等核心组合。
- 引用前检查许可证、维护状态和最近提交。
