import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

// 文件夹表
export const folders = sqliteTable("folders", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID().replace(/-/g, "").slice(0, 16)),
	name: text("name").notNull(),
	color: text("color").default("#777777"),
	icon: text("icon"),
	sortOrder: integer("sort_order").default(0),
	isCollapsed: integer("is_collapsed", { mode: "boolean" }).default(false),
	createdAt: text("created_at").default(sql`(datetime('now'))`),
	updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// 订阅源表
export const feeds = sqliteTable(
	"feeds",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID().replace(/-/g, "").slice(0, 16)),
		folderId: text("folder_id").references(() => folders.id, { onDelete: "set null" }),
		title: text("title").notNull(),
		url: text("url").notNull().unique(),
		feedUrl: text("feed_url").notNull(),
		description: text("description"),
		faviconUrl: text("favicon_url"),
		lastFetchedAt: text("last_fetched_at"),
		sortOrder: integer("sort_order").default(0),
		createdAt: text("created_at").default(sql`(datetime('now'))`),
		updatedAt: text("updated_at").default(sql`(datetime('now'))`),
	},
	(table) => [index("idx_feeds_folder_id").on(table.folderId)]
);

// 文章表
export const articles = sqliteTable(
	"articles",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID().replace(/-/g, "").slice(0, 16)),
		feedId: text("feed_id")
			.notNull()
			.references(() => feeds.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		url: text("url").notNull(),
		content: text("content"),
		summary: text("summary"),
		author: text("author"),
		imageUrl: text("image_url"),
		publishedAt: text("published_at"),
		isRead: integer("is_read", { mode: "boolean" }).default(false),
		isStarred: integer("is_starred", { mode: "boolean" }).default(false),
		isReadLater: integer("is_read_later", { mode: "boolean" }).default(false),
		createdAt: text("created_at").default(sql`(datetime('now'))`),
	},
	(table) => [
		index("idx_articles_feed_id").on(table.feedId),
		index("idx_articles_published_at").on(table.publishedAt),
		index("idx_articles_is_starred").on(table.isStarred),
		index("idx_articles_is_read_later").on(table.isReadLater),
	]
);

// 导出类型
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type Feed = typeof feeds.$inferSelect;
export type NewFeed = typeof feeds.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

// 带未读数的订阅源类型
export type FeedWithUnreadCount = Feed & { unreadCount: number };
// 带文章数的文件夹类型
export type FolderWithFeeds = Folder & { feeds: FeedWithUnreadCount[] };
