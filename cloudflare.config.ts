import { bindings, defineConfig, triggers } from "cf/config";

export default defineConfig({
	worker: {
		name: "cloudflare-playbook",
		compatibilityDate: "2026-07-10",
		entrypoint: "./src/index.ts",
		observability: {
			enabled: true,
			headSamplingRate: 1,
		},
		assets: {
			htmlHandling: "auto-trailing-slash",
			notFoundHandling: "404-page",
			runWorkerFirst: [
				"/",
				"/agents",
				"/agents/*",
				"/domain",
				"/domain/*",
				"/assets/*",
				"/favicon.svg",
				"/hashmap.json",
				"/llm.txt",
				"/robots.txt",
				"/sitemap.xml",
				"/vp-icons.css",
			],
		},
		domains: [
			"cloudflare-playbook.chendahuang.top",
		],
		triggers: [
			triggers.fetch({
				pattern: "chendahuang.com/playbook/cloudflare",
				zone: "chendahuang.com",
			}),
			triggers.fetch({
				pattern: "chendahuang.com/playbook/cloudflare/*",
				zone: "chendahuang.com",
			}),
		],
		env: {
			ASSETS: bindings.assets(),
		},
	},
});
