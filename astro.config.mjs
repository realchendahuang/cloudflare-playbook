// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// 文档站的导航保持稳定，正文内容再通过目录逐步扩展。
export default defineConfig({
	site: 'https://cloudflare-playbook.chendahuang.top',
	integrations: [
		starlight({
			title: 'Cloudflare Playbook',
			description: '面向普通开发者和小团队的 Cloudflare 最佳实践知识库。',
			head: [
				{ tag: 'link', attrs: { rel: 'stylesheet', href: '/comments.css' } },
				{ tag: 'script', attrs: { type: 'module', src: '/comments.js' } },
			],
			// 当前内容以简体中文为主，根路径直接作为中文站点。
			locales: {
				root: {
					label: '简体中文',
					lang: 'zh-CN',
				},
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/realchendahuang/cloudflare-playbook',
				},
			],
			sidebar: [
				{
					label: '开始',
					items: [{ label: '学习路线', slug: 'start' }],
				},
				{
					label: '产品地图',
					items: [
						{ label: '总览', slug: 'platform' },
						{ label: 'Workers', slug: 'platform/workers' },
						{ label: 'Pages', slug: 'platform/pages' },
						{ label: '数据产品', slug: 'platform/data' },
						{ label: 'AI 产品', slug: 'platform/ai' },
						{ label: '免费与付费边界', slug: 'platform/free-paid' },
					],
				},
				{
					label: '架构模式',
					items: [
						{ label: '总览', slug: 'architecture' },
						{ label: '静态内容站', slug: 'architecture/static-site' },
						{ label: 'API 网关', slug: 'architecture/api-gateway' },
						{ label: '实时应用', slug: 'architecture/realtime-app' },
					],
				},
				{
					label: '最佳实践',
					items: [
						{ label: '总览', slug: 'best-practices' },
						{ label: '本站技术栈', slug: 'best-practices/site-stack' },
						{ label: '安全边界', slug: 'best-practices/security' },
						{ label: '成本控制', slug: 'best-practices/cost' },
					],
				},
				{
					label: '实战案例',
					items: [
						{ label: '案例总览', slug: 'recipes' },
						{ label: 'Worker API + D1', slug: 'recipes/worker-api-d1' },
						{ label: 'R2 签名上传', slug: 'recipes/r2-signed-upload' },
					],
				},
				{
					label: '资料索引',
					items: [{ label: '官方资料', slug: 'reference' }],
				},
			],
		}),
	],
});
