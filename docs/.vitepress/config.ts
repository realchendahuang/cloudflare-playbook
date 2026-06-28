import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid(defineConfig({
  title: 'Cloudflare 实战手册',
  description: 'AI 编程时代的 Cloudflare 实战手册——用 AI 写代码，用 Cloudflare 部署到全球。',
  lang: 'zh-CN',
  // 子路径部署：把 Cloudflare 手册归到个人品牌主域的 playbook 栏目下。
  base: '/playbook/cloudflare/',
  outDir: './.vitepress/dist/playbook/cloudflare',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: 'https://chendahuang.com/playbook/cloudflare/'
  },
  vite: {
    build: {
      // Mermaid's runtime and Wardley parser chunks are intentionally about 600 KB
      // uncompressed. Keep the warning close to that measured size so real growth
      // still shows up.
      chunkSizeWarningLimit: 700
    }
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/playbook/cloudflare/favicon.svg' }],
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
      { text: 'Agents', link: '/agents' },
      { text: '域名', link: '/domain' },
      { text: '邮件', link: '/email' },
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

  }
}));
