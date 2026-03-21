-- 文件夹表
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#777777',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_collapsed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 订阅源表
CREATE TABLE IF NOT EXISTS feeds (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  folder_id TEXT REFERENCES folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  feed_url TEXT NOT NULL,
  description TEXT,
  favicon_url TEXT,
  last_fetched_at TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 文章表
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  feed_id TEXT NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  author TEXT,
  image_url TEXT,
  published_at TEXT,
  is_read INTEGER DEFAULT 0,
  is_starred INTEGER DEFAULT 0,
  is_read_later INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_articles_feed_id ON articles(feed_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_is_starred ON articles(is_starred);
CREATE INDEX IF NOT EXISTS idx_articles_is_read_later ON articles(is_read_later);
CREATE INDEX IF NOT EXISTS idx_feeds_folder_id ON feeds(folder_id);
