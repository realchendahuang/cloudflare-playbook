import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

export const onRequest = defineRouteMiddleware((context) => {
	const { starlightRoute } = context.locals;

	// Starlight 默认把页面标题和站点标题拼成 `<title>页面 | 站点</title>`；
	// 首页标题与站点名相同时，浏览器标签会重复显示，这里只收敛这一种情况。
	if (starlightRoute.entry.data.title !== starlightRoute.siteTitle) return;

	const title = starlightRoute.head.find((entry) => entry.tag === 'title');
	if (title) title.content = starlightRoute.siteTitle;
});
