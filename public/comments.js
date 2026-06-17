const COMMENTS_API = '/api/comments';

// 页面加载完成后挂载评论区，避免影响 Starlight 原本的正文渲染。
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initComments);
} else {
	initComments();
}

// 初始化评论区：找到正文容器，创建表单，并拉取当前页面评论。
function initComments() {
	const content = document.querySelector('.sl-markdown-content') || document.querySelector('main');
	if (!content || document.querySelector('.cfp-comments')) return;

	const section = createCommentSection();
	content.append(section);
	loadComments(section);
}

// 创建评论区 DOM，所有用户内容后续都通过 textContent 写入，避免脚本注入。
function createCommentSection() {
	const section = document.createElement('section');
	section.className = 'cfp-comments';
	section.setAttribute('aria-labelledby', 'cfp-comments-title');

	section.innerHTML = `
		<div class="cfp-comments__header">
			<h2 id="cfp-comments-title">自由评论</h2>
			<p>不用登录，直接留言。请保持友善，别刷屏。</p>
		</div>
		<form class="cfp-comments__form">
			<label>
				<span>昵称</span>
				<input name="author" type="text" maxlength="40" placeholder="路过的朋友" autocomplete="nickname">
			</label>
			<label class="cfp-comments__trap">
				<span>网站</span>
				<input name="trap" type="text" tabindex="-1" autocomplete="off">
			</label>
			<label>
				<span>评论</span>
				<textarea name="content" rows="4" maxlength="1000" required placeholder="写下你的补充、疑问或踩坑记录"></textarea>
			</label>
			<div class="cfp-comments__actions">
				<p class="cfp-comments__status" role="status"></p>
				<button type="submit">发布评论</button>
			</div>
		</form>
		<div class="cfp-comments__list" aria-live="polite"></div>
	`;

	const form = section.querySelector('.cfp-comments__form');
	form.addEventListener('submit', (event) => submitComment(event, section));

	return section;
}

// 获取当前页面路径，作为评论归属的唯一键。
function getCurrentPath() {
	return window.location.pathname || '/';
}

// 从 Worker API 读取当前页面评论。
async function loadComments(section) {
	const list = section.querySelector('.cfp-comments__list');
	list.textContent = '正在加载评论...';

	const response = await fetch(`${COMMENTS_API}?path=${encodeURIComponent(getCurrentPath())}`);
	if (!response.ok) {
		list.textContent = '评论暂时加载失败。';
		return;
	}

	const data = await response.json();
	renderComments(list, data.comments || []);
}

// 渲染评论列表；空状态也在这里处理，方便刷新后保持一致。
function renderComments(list, comments) {
	list.textContent = '';

	if (comments.length === 0) {
		const empty = document.createElement('p');
		empty.className = 'cfp-comments__empty';
		empty.textContent = '还没有评论，坐第一排。';
		list.append(empty);
		return;
	}

	for (const comment of comments) {
		list.append(createCommentItem(comment));
	}
}

// 创建单条评论节点，评论正文只进入 textContent。
function createCommentItem(comment) {
	const item = document.createElement('article');
	item.className = 'cfp-comments__item';

	const meta = document.createElement('p');
	meta.className = 'cfp-comments__meta';
	meta.textContent = `${comment.author} · ${formatTime(comment.createdAt)}`;

	const body = document.createElement('p');
	body.className = 'cfp-comments__body';
	body.textContent = comment.content;

	item.append(meta, body);
	return item;
}

// 把服务端 ISO 时间转换成中文站点里更自然的短日期。
function formatTime(value) {
	return new Intl.DateTimeFormat('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(value));
}

// 提交评论到 Worker API，成功后清空输入并重新拉取列表。
async function submitComment(event, section) {
	event.preventDefault();

	const form = event.currentTarget;
	const button = form.querySelector('button');
	const formData = new FormData(form);

	button.disabled = true;
	setStatus(section, '正在发布...');

	const response = await fetch(COMMENTS_API, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({
			path: getCurrentPath(),
			author: formData.get('author'),
			content: formData.get('content'),
			trap: formData.get('trap'),
		}),
	});

	button.disabled = false;

	if (response.status === 429) {
		setStatus(section, '发得太快了，稍等一下再试。');
		return;
	}

	if (!response.ok) {
		setStatus(section, '发布失败，请检查内容后重试。');
		return;
	}

	form.reset();
	setStatus(section, '已发布。');
	await loadComments(section);
}

// 更新表单状态文案，让提交过程有明确反馈。
function setStatus(section, message) {
	const status = section.querySelector('.cfp-comments__status');
	status.textContent = message;
}
