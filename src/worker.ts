interface Env {
	ASSETS: Fetcher;
}

export default {
	// Worker 只负责交给 Cloudflare Static Assets 处理静态文档资源。
	fetch(request: Request, env: Env): Promise<Response> {
		return env.ASSETS.fetch(request);
	},
};
