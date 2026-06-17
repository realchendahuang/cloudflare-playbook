// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightThemeNext from 'starlight-theme-next';

// 文档站的导航保持稳定，正文内容再通过目录逐步扩展。
export default defineConfig({
	site: 'https://cloudflare-playbook.chendahuang.top',
	integrations: [
		starlight({
			title: 'Cloudflare Playbook',
			description: '面向普通开发者和小团队的 Cloudflare 最佳实践知识库。',
			customCss: ['./src/styles/cloudflare-theme.css'],
			components: {
				Footer: './src/components/TwikooFooter.astro',
			},
			plugins: [
				starlightThemeNext(),
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
						{ label: 'Fundamentals', slug: 'platform/fundamentals' },
						{ label: 'Workers', slug: 'platform/workers' },
						{ label: 'Workers Static Assets', slug: 'platform/static-assets' },
						{ label: 'Pages', slug: 'platform/pages' },
						{ label: 'DNS', slug: 'platform/dns' },
						{ label: 'SSL/TLS', slug: 'platform/ssl-tls' },
						{ label: 'Cache / CDN', slug: 'platform/cache' },
						{ label: '流量调度与四层入口', slug: 'platform/traffic-routing' },
						{ label: '源站保护与流量洪峰', slug: 'platform/origin-surge' },
						{ label: 'WAF', slug: 'platform/waf' },
						{ label: 'DDoS Protection', slug: 'platform/ddos' },
						{ label: 'Rules', slug: 'platform/rules' },
						{ label: '数据产品', slug: 'platform/data' },
						{ label: 'D1', slug: 'platform/d1' },
						{ label: 'KV', slug: 'platform/kv' },
						{ label: 'R2', slug: 'platform/r2' },
						{ label: 'Durable Objects', slug: 'platform/durable-objects' },
						{ label: 'Queues', slug: 'platform/queues' },
						{ label: 'Realtime', slug: 'platform/realtime' },
						{ label: '平台化与多租户', slug: 'platform/platforms-saas' },
						{ label: '扩展计算与数据管道', slug: 'platform/extended-compute-data' },
						{ label: 'AI 产品', slug: 'platform/ai' },
						{ label: '媒体与性能', slug: 'platform/media-performance' },
						{ label: '迁移与 IaC', slug: 'platform/iac-migration' },
						{ label: '观测与日志', slug: 'platform/observability' },
						{ label: '安全与网络', slug: 'platform/security-networking' },
						{ label: 'Zero Trust 与企业网络', slug: 'platform/zero-trust-networking' },
						{ label: '自有网络与专线', slug: 'platform/private-networking' },
						{ label: '免费与付费边界', slug: 'platform/free-paid' },
						{ label: 'Billing', slug: 'platform/billing' },
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
						{ label: '独立开发者推荐栈', slug: 'best-practices/indie-stack' },
						{ label: 'Codex 协作', slug: 'best-practices/codex-cloudflare' },
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
					items: [
						{ label: '官方资料', slug: 'reference' },
						{ label: 'Cloudflare 文档地图', slug: 'reference/cloudflare-docs-map' },
					],
				},
			],
		}),
	],
});
