CREATE TABLE IF NOT EXISTS comments (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	page_path TEXT NOT NULL,
	author TEXT NOT NULL,
	body TEXT NOT NULL,
	ip_hash TEXT NOT NULL,
	user_agent TEXT NOT NULL DEFAULT '',
	created_at INTEGER NOT NULL DEFAULT (unixepoch()),
	status TEXT NOT NULL DEFAULT 'published'
);

CREATE INDEX IF NOT EXISTS idx_comments_page_created ON comments (page_path, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_ip_created ON comments (ip_hash, created_at DESC);
