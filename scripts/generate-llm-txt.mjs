import { readFile, writeFile } from 'node:fs/promises'

const sourcePath = new URL('../docs/index.md', import.meta.url)
const outputPath = new URL('../docs/public/llm.txt', import.meta.url)

const header = `# Cloudflare 实战手册（llm.txt）

> 这是 https://cloudflare-playbook.chendahuang.top/ 的纯文本版，专为 AI agent 设计。
> 涵盖 Cloudflare 功能模块、AI 编程工作流、计费、架构模式、避坑指南。
> 用户可以把这个 URL 发给你让你快速了解 Cloudflare 全貌。
> 官方文档查询请用 Cloudflare Docs MCP（cloudflare-docs）。

`

const source = await readFile(sourcePath, 'utf8')
const domainPath = new URL('../docs/domain.md', import.meta.url)
const domainSource = await readFile(domainPath, 'utf8')
const body = source
  .replace(/^---\n[\s\S]*?\n---\n+/, '')
  .replace(/<script setup>[\s\S]*?<\/script>\n+/g, '')
  .replace(/<section class="onepage-hero">[\s\S]*?<\/section>\n+/g, '')
  .replace(/<div class="quick-grid">[\s\S]*?<\/div>\n+/g, '')
  .replace(/^(#{3,4})\s+<[^>]+class="(?:cat|svc)-icon"[^>]*\/>\s+/gm, '$1 ')
  .replace(/[ \t]+\{#[^}]+}[ \t]*$/gm, '')

const domainBody = domainSource
  .replace(/^---\n[\s\S]*?\n---\n+/, '')
  .replace(/<script setup>[\s\S]*?<\/script>\n+/g, '')
  .replace(/<section class="onepage-hero">[\s\S]*?<\/section>\n+/g, '')
  .replace(/<div class="quick-grid">[\s\S]*?<\/div>\n+/g, '')
  .replace(/^(#{3,4})\s+<[^>]+>\s+/gm, '$1 ')
  .replace(/[ \t]+\{#[^}]+}[ \t]*$/gm, '')

await writeFile(outputPath, `${header}${body.trim()}\n\n---\n\n${domainBody.trim()}\n`, 'utf8')
console.log('Generated docs/public/llm.txt')
