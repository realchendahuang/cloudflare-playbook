import { readFile, writeFile } from 'node:fs/promises'

const sourcePath = new URL('../docs/index.md', import.meta.url)
const readmePath = new URL('../README.md', import.meta.url)

const readmeIntro = `# Cloudflare 实战手册

AI 编程时代的 Cloudflare 实战手册——用 AI 写代码，用 Cloudflare 部署到全球。

在线阅读：[chendahuang.com/playbook/cloudflare](https://chendahuang.com/playbook/cloudflare/)

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
- [7. Cloudflare Agents](#7-cloudflare-agents)
- [8. 域名](#8-域名)
- [官方资源](#官方资源)
`

const agentsIntro = `\n## 7. Cloudflare Agents

Cloudflare Agents 是给 AI Agent 准备的「云端办公室」——有公网入口、有状态、有记忆、能定时干活、能调用工具，空闲时休眠、需要时唤醒。它和 Claude Code / Codex（本地编程 Agent）、Hermes（成品助理）、Pi（本地可改造工具箱）不是替代关系，而是分工：本地写代码用 Claude Code / Codex，要现成助理用 Hermes，要在本地造 Agent 用 Pi，**要让 Agent 长期在线、有入口、有状态、能定时**，用 Cloudflare Agents。

一句话记住：**把 Agent 从本地 demo，变成能长期在线服务用户的产品**——最适合做个人助理、文档助手、AI 客服、学习助教、GitHub Repo 管家，独立开发者很值得看。

详细内容见在线子页：[Cloudflare Agents](https://chendahuang.com/playbook/cloudflare/agents)

### Cloudflare Agents 详细内容（节选自子页）

`

const domainIntro = `\n## 8. 域名

Cloudflare 只管 DNS 托管，不管买卖域名。域名在哪买、买什么后缀、买完怎么把 NS 指到 Cloudflare、要不要备案、要不要跨境转移——这一段单独拎成一篇子页讲清楚：比价的坑（**首年价 ≠ 续费价**）、各 TLD 的实务定位、改 NS 步骤、国内 vs 国外的差异、域名转移流程，以及 Cloudflare Registrar 不支持的后缀怎么兜底。

一句话记住：**注册商去便宜的地方买（比续费价）、DNS 永远托管到 Cloudflare**，这两个动作可以拆开做。

详细内容见在线子页：[域名购买、托管与转移](https://chendahuang.com/playbook/cloudflare/domain)

### 域名详细内容（节选自子页）

`

const source = await readFile(sourcePath, 'utf8')
const agentsPath = new URL('../docs/agents.md', import.meta.url)
const agentsSource = await readFile(agentsPath, 'utf8')
const domainPath = new URL('../docs/domain.md', import.meta.url)
const domainSource = await readFile(domainPath, 'utf8')
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

// 子页正文里用了行内图标组件（<Link class="svc-icon" /> 等），GitHub 不渲染，
// 先把所有带 cat/svc-icon 类的组件连同其后空白剥掉，再做标题降级。
const stripInlineIcons = s =>
  s.replace(/<[A-Za-z][A-Za-z0-9]*[^>]*class="(?:cat|svc)-icon"[^>]*\/>\s*/g, '')

const agentsBody = stripInlineIcons(agentsSource)
  .replace(/^---\n[\s\S]*?\n---\n+/, '')
  .replace(/<script setup>[\s\S]*?<\/script>\n+/g, '')
  .replace(/<section class="onepage-hero">[\s\S]*?<\/section>\n+/g, '')
  .replace(/<div class="quick-grid">[\s\S]*?<\/div>\n+/g, '')
  .replace(/<div class="scenario-grid">[\s\S]*?<\/div>\n+/g, '')
  // 子页原来的 ## 标题降级为 ###，嵌套在 "## 7. Cloudflare Agents" 下面，保持 README 层级不冲突。
  .replace(/^## /gm, '### ')
  .replace(/^### /gm, '#### ')
  .replace(/^(#{3,4})\s+<[^>]+>\s+/gm, '$1 ')
  .replace(/[ \t]+\{#[^}]+}[ \t]*$/gm, '')
  .trim()

const domainBody = stripInlineIcons(domainSource)
  .replace(/^---\n[\s\S]*?\n---\n+/, '')
  .replace(/<script setup>[\s\S]*?<\/script>\n+/g, '')
  .replace(/<section class="onepage-hero">[\s\S]*?<\/section>\n+/g, '')
  .replace(/<div class="quick-grid">[\s\S]*?<\/div>\n+/g, '')
  // 子页原来的 ## 标题降级为 ###，嵌套在 "## 8. 域名" 下面，保持 README 层级不冲突。
  .replace(/^## /gm, '### ')
  .replace(/^### /gm, '#### ')
  .replace(/^(#{3,4})\s+<[^>]+>\s+/gm, '$1 ')
  .replace(/[ \t]+\{#[^}]+}[ \t]*$/gm, '')
  .trim()

await writeFile(readmePath, `${readmeIntro}\n${toc}\n${body.replace(/^## 7\. Cloudflare Agents[\s\S]*?---\n\n## 官方资源/m, `${agentsIntro}${agentsBody}

---

${domainIntro}${domainBody}

---

## 官方资源`)}\n`, 'utf8')
