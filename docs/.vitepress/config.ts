import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Cloudflare Playbook',
  description: '独立开发者的 Cloudflare 实战手册',
  lang: 'zh-CN',
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
  ],
  themeConfig: {
    logo: { text: 'CF' },
    nav: [
      { text: '手册', link: '/' },
      { text: 'GitHub', link: 'https://github.com/realchendahuang/cloudflare-playbook' }
    ],
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 3],
      label: '目录'
    },
    footer: {
      message: 'Cloudflare Playbook',
      copyright: 'Released under CC BY-SA 4.0'
    }
  }
});
