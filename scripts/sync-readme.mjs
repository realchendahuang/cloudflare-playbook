import { readFile, writeFile } from 'node:fs/promises'

const sourcePath = new URL('../docs/index.md', import.meta.url)
const readmePath = new URL('../README.md', import.meta.url)

const readmeIntro = `# Cloudflare Playbook

Vibe coding 时代的 Cloudflare 实战手册——用 AI 写代码，用 Cloudflare 免费部署到全球。

在线阅读：[cloudflare-playbook.chendahuang.top](https://cloudflare-playbook.chendahuang.top/)

## 全景图

\`\`\`mermaid
flowchart TD
  A[Cloudflare 功能模块] --> B[站点基础]
  A --> C[计算]
  A --> D[数据存储]
  A --> E[AI]
  A --> F[媒体]
  A --> G[安全]
  A --> H[观测]
\`\`\`
`

const toc = `## 目录

- [1. Cloudflare 功能模块](#1-cloudflare-功能模块)
- [2. AI 编程工作流](#2-ai-编程工作流)
- [3. 开发与部署](#3-开发与部署)
- [4. 免费额度](#4-免费额度)
- [5. $5 套餐](#5-5-套餐)
- [6. 开源项目](#6-开源项目)
- [7. 最佳实践](#7-最佳实践)
- [8. 国内访问](#8-国内访问)
- [9. 排查问题](#9-排查问题)
- [10. 完整案例](#10-完整案例)
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
