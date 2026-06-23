import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid(defineConfig({
  title: 'Cloudflare 实战手册',
  description: 'AI 编程时代的 Cloudflare 实战手册——用 AI 写代码，用 Cloudflare 部署到全球。',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: 'https://cloudflare-playbook.chendahuang.top'
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'impact-site-verification', value: '9a0987ea-1a38-4f72-9047-94b3928e3d80' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Cloudflare 实战手册' }],
    ['meta', { property: 'og:description', content: 'AI 编程时代的 Cloudflare 实战手册——用 AI 写代码，用 Cloudflare 部署到全球。' }],
    ['meta', { property: 'og:site_name', content: 'Cloudflare 实战手册' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Cloudflare 实战手册' }],
    ['meta', { name: 'twitter:description', content: 'AI 编程时代的 Cloudflare 实战手册——用 AI 写代码，用 Cloudflare 部署到全球。' }]
  ],
  themeConfig: {
    logo: { text: 'CF' },
    nav: [
      { text: '手册', link: '/' },
      { text: '域名', link: '/domain' },
      { text: 'GitHub', link: 'https://github.com/realchendahuang/cloudflare-playbook' }
    ],
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 3],
      label: '目录'
    },
    lastUpdated: {
      text: '最后更新于'
    },
    editLink: {
      pattern: 'https://github.com/realchendahuang/cloudflare-playbook/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/realchendahuang/cloudflare-playbook' }
    ],
    footer: {
      message: 'Cloudflare Playbook',
      copyright: 'Released under CC BY-SA 4.0'
    }
  }
}));
