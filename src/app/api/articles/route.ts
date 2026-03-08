import { eq, and, desc, asc, sql } from "drizzle-orm";
import { apiSuccess, apiError, getDatabase, getAuthenticatedUser } from "@/lib/api";
import { articles, feeds } from "@/lib/db/schema";

// GET /api/articles — 获取当前用户的文章列表（支持分页和筛选）
export async function GET(request: Request) {
	try {
		const auth = await getAuthenticatedUser(request);
		if (!auth) return apiError("未登录", 401);
		const { userId } = auth;

		const { searchParams } = new URL(request.url);
		const feedId = searchParams.get("feedId");
		const folderId = searchParams.get("folderId");
		const filter = searchParams.get("filter"); // "starred" | "read_later" | "unread"
		const page = parseInt(searchParams.get("page") ?? "1", 10);
		const pageSize = Math.min(parseInt(searchParams.get("pageSize") ?? "30", 10), 100);
		const sortOrder = searchParams.get("sort") === "asc" ? "asc" : "desc";

		const db = getDatabase();

		// 先获取当前用户所有 feedId（或按条件过滤）
		let userFeedIds: string[];
		if (feedId) {
			// 验证该 feed 属于当前用户
			const [feed] = await db.select({ id: feeds.id }).from(feeds).where(and(eq(feeds.id, feedId), eq(feeds.userId, userId)));
			if (!feed) return apiSuccess({ articles: [], total: 0, page, pageSize });
			userFeedIds = [feed.id];
		} else if (folderId) {
			const folderFeeds = await db
				.select({ id: feeds.id })
				.from(feeds)
				.where(and(eq(feeds.folderId, folderId), eq(feeds.userId, userId)));
			if (folderFeeds.length === 0) return apiSuccess({ articles: [], total: 0, page, pageSize });
			userFeedIds = folderFeeds.map((f) => f.id);
		} else {
			const userFeeds = await db.select({ id: feeds.id }).from(feeds).where(eq(feeds.userId, userId));
			if (userFeeds.length === 0) return apiSuccess({ articles: [], total: 0, page, pageSize });
			userFeedIds = userFeeds.map((f) => f.id);
		}

		// 构建查询条件
		const conditions = [
			sql`${articles.feedId} IN (${sql.join(userFeedIds.map((id) => sql`${id}`), sql`, `)})`,
		];

		if (filter === "starred") conditions.push(eq(articles.isStarred, true));
		if (filter === "read_later") conditions.push(eq(articles.isReadLater, true));
		if (filter === "unread") conditions.push(eq(articles.isRead, false));

		const where = and(...conditions);
		const orderBy = sortOrder === "asc" ? asc(articles.publishedAt) : desc(articles.publishedAt);
		const offset = (page - 1) * pageSize;

		const [articleList, countResult] = await Promise.all([
			db
				.select({
					id: articles.id,
					feedId: articles.feedId,
					title: articles.title,
					url: articles.url,
					summary: articles.summary,
					author: articles.author,
					imageUrl: articles.imageUrl,
					publishedAt: articles.publishedAt,
					isRead: articles.isRead,
					isStarred: articles.isStarred,
					isReadLater: articles.isReadLater,
					createdAt: articles.createdAt,
				})
				.from(articles)
				.where(where)
				.orderBy(orderBy)
				.limit(pageSize)
				.offset(offset),
			db
				.select({ count: sql<number>`count(*)` })
				.from(articles)
				.where(where),
		]);

		return apiSuccess({
			articles: articleList,
			total: countResult[0]?.count ?? 0,
			page,
			pageSize,
		});
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "获取文章失败", 500);
	}
}
