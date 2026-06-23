import { readFile, writeFile } from 'node:fs/promises'

const sourcePath = new URL('../docs/index.md', import.meta.url)
const readmePath = new URL('../README.md', import.meta.url)

const readmeIntro = `# Cloudflare 实战手册

AI 编程时代的 Cloudflare 实战手册——用 AI 写代码，用 Cloudflare 部署到全球。

在线阅读：[cloudflare-playbook.chendahuang.top](https://cloudflare-playbook.chendahuang.top/)

## 全景图

\`\`\`mermaid
flowchart TD
  A[Cloudflare 实战手册] --> I[AI 编程工作流<br/>Skill / MCP / Wrangler]
  A --> B[站点基础<br/>DNS / SSL / CDN / Rules]
  A --> C[计算<br/>Workers / Pages / DO / Workflows / Queues]
  A --> D[数据存储<br/>D1 / KV / R2 / Hyperdrive / Vectorize]
  A --> E[AI<br/>Workers AI / AI Gateway / Agents SDK]
  A --> F[媒体<br/>Images / Stream / Realtime / Browser]
  A --> G[安全<br/>Turnstile / Access / WAF / Rate Limiting]
  A --> H[观测<br/>Log Explorer / Observability / Analytics]
  A --> J[计费与额度<br/>Free vs Paid 对比]
  A --> K[架构模式<br/>常见组合与 trade-off]
\`\`\`
`

const toc = `## 目录

- [1. AI 编程工作流](#1-ai-编程工作流)
- [2. Cloudflare 功能模块](#2-cloudflare-功能模块)
- [3. 计费与额度](#3-计费与额度)
- [4. 开源项目](#4-开源项目)
- [5. 避坑指南](#5-避坑指南)
- [6. 国内访问](#6-国内访问)
- [官方资源](#官方资源)
`

const source = await readFile(sourcePath, 'utf8')
const body = source
  // 去掉 VitePress frontmatter。
  .replace(/^---\n[\s\S]*?\n---\n+/, '')
  // 去掉 Vue 图标 import。
  .replace(/<script setup>[\s\S]*?<\/script>\n+/g, '')
  // 去掉网页首屏和卡片入口，README 只保留可完整阅读的正文。
  .replace(/<section class="onepage-hero">[\s\S]*?<\/section>\n+/g, '')
  .replace(/<div class="quick-grid">[\s\S]*?<\/div>\n+/g, '')
  // GitHub README 不渲染 Vue 组件，把标题里的图标组件去掉。
  .replace(/^(#{3,4})\s+<[^>]+class="(?:cat|svc)-icon"[^>]*\/>\s+/gm, '$1 ')
  // GitHub 不需要 VitePress 的自定义标题锚点。
  .replace(/[ \t]+\{#[^}]+}[ \t]*$/gm, '')
  .trim()

await writeFile(readmePath, `${readmeIntro}\n${toc}\n${body}\n`, 'utf8')
