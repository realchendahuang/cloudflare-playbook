interface Env {
	DB: D1Database;
	ASSETS: Fetcher;
}

interface CommentRow {
	id: number;
	page_path: string;
	author: string;
	body: string;
	created_at: number;
}

const MAX_COMMENTS_PER_PAGE = 100;
const MAX_AUTHOR_LENGTH = 40;
const MAX_BODY_LENGTH = 1000;
const VISITOR_HASH_SALT = 'cloudflare-playbook-v1';

export default {
	// Worker 的入口函数：先处理评论 API，其余请求交给静态资源绑定。
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/api/comments' && request.method === 'GET') {
			return handleListComments(request, env);
		}

		if (url.pathname === '/api/comments' && request.method === 'POST') {
			return handleCreateComment(request, env);
		}

		if (url.pathname.startsWith('/api/')) {
			return json({ error: 'not_found' }, 404);
		}

		return env.ASSETS.fetch(request);
	},
};

// 统一输出 JSON，避免每个 API 分支重复设置响应头。
function json(data: unknown, status = 200): Response {
	return Response.json(data, {
		status,
		headers: {
			'cache-control': 'no-store',
		},
	});
}

// 把用户输入路径收窄成站内路径，评论只能挂到当前站点页面。
function normalizePath(value: unknown): string | null {
	if (typeof value !== 'string') return null;

	const path = value.trim().split('#')[0]?.split('?')[0] || '/';
	if (!path.startsWith('/') || path.startsWith('//')) return null;
	if (path.length > 200 || path.includes('\0')) return null;

	return path;
}

// 把 D1 中的行转换成前端需要的公开评论对象，不暴露 IP 哈希等内部字段。
function serializeComment(row: CommentRow) {
	return {
		id: row.id,
		path: row.page_path,
		author: row.author,
		content: row.body,
		createdAt: new Date(row.created_at * 1000).toISOString(),
	};
}

// 读取当前访问者的稳定匿名标识，只用于限流，不存明文 IP。
async function hashVisitor(request: Request): Promise<string> {
	const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'local';
	const userAgent = request.headers.get('user-agent') || 'unknown';
	const source = `${VISITOR_HASH_SALT}:${ip}:${userAgent}`;
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));

	return Array.from(new Uint8Array(digest))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
}

// 查询页面最近评论，按时间正序返回，方便前端直接渲染成对话流。
async function handleListComments(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const pagePath = normalizePath(url.searchParams.get('path'));

	if (!pagePath) {
		return json({ error: 'invalid_path' }, 400);
	}

	const { results } = await env.DB.prepare(
		`SELECT id, page_path, author, body, created_at
		 FROM comments
		 WHERE page_path = ? AND status = 'published'
		 ORDER BY created_at DESC
		 LIMIT ?`,
	)
		.bind(pagePath, MAX_COMMENTS_PER_PAGE)
		.all<CommentRow>();

	return json({
		comments: results.map(serializeComment).reverse(),
	});
}

// 创建一条自由评论：校验用户输入、执行轻量防刷，然后写入 D1。
async function handleCreateComment(request: Request, env: Env): Promise<Response> {
	const payload = await request.json<Record<string, unknown>>();

	if (payload.trap) {
		return json({ ok: true, comment: null });
	}

	const pagePath = normalizePath(payload.path);
	const author = normalizeAuthor(payload.author);
	const body = normalizeBody(payload.content);

	if (!pagePath) {
		return json({ error: 'invalid_path' }, 400);
	}

	if (!body) {
		return json({ error: 'invalid_content' }, 400);
	}

	const ipHash = await hashVisitor(request);
	const rateLimit = await checkRateLimit(env, ipHash);

	if (!rateLimit.allowed) {
		return json({ error: 'rate_limited' }, 429);
	}

	const insert = await env.DB.prepare(
		`INSERT INTO comments (page_path, author, body, ip_hash, user_agent)
		 VALUES (?, ?, ?, ?, ?)`,
	)
		.bind(pagePath, author, body, ipHash, request.headers.get('user-agent') || '')
		.run();

	const row = await env.DB.prepare(
		`SELECT id, page_path, author, body, created_at
		 FROM comments
		 WHERE id = ?`,
	)
		.bind(insert.meta.last_row_id)
		.first<CommentRow>();

	return json({
		ok: true,
		comment: row ? serializeComment(row) : null,
	});
}

// 规范昵称：允许不填，过长时截断，避免评论区布局被撑爆。
function normalizeAuthor(value: unknown): string {
	if (typeof value !== 'string') return '路过的朋友';

	const author = value.trim() || '路过的朋友';
	return author.slice(0, MAX_AUTHOR_LENGTH);
}

// 规范评论正文：去掉首尾空白并限制长度，保留用户正常换行。
function normalizeBody(value: unknown): string | null {
	if (typeof value !== 'string') return null;

	const body = value.trim();
	if (!body) return null;

	return body.slice(0, MAX_BODY_LENGTH);
}

// 检查匿名访问者的提交频率，挡住短时间刷屏和一天内异常高频提交。
async function checkRateLimit(env: Env, ipHash: string): Promise<{ allowed: boolean }> {
	const recentMinute = await env.DB.prepare(
		`SELECT COUNT(*) AS count
		 FROM comments
		 WHERE ip_hash = ? AND created_at >= unixepoch('now', '-60 seconds')`,
	)
		.bind(ipHash)
		.first<{ count: number }>();

	if (Number(recentMinute?.count || 0) >= 3) {
		return { allowed: false };
	}

	const recentDay = await env.DB.prepare(
		`SELECT COUNT(*) AS count
		 FROM comments
		 WHERE ip_hash = ? AND created_at >= unixepoch('now', '-1 day')`,
	)
		.bind(ipHash)
		.first<{ count: number }>();

	return { allowed: Number(recentDay?.count || 0) < 50 };
}
