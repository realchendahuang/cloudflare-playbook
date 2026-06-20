import { defineConfig } from 'vitepress';

// VitePress 只负责渲染单页手册、搜索和页面目录。
export default defineConfig({
  title: 'Cloudflare Playbook',
  description: '独立开发者的 Cloudflare 单页实战手册',
  lang: 'zh-CN',
  cleanUrls: true,
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
    editLink: {
      pattern: 'https://github.com/realchendahuang/cloudflare-playbook/edit/main/docs/:path',
      text: '编辑此页'
    },
    footer: {
      message: 'Cloudflare Playbook',
      copyright: 'Released under CC BY-SA 4.0'
    }
  }
});
