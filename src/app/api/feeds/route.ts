import { eq, and, asc, sql } from "drizzle-orm";
import { apiSuccess, apiError, getDatabase, getAuthenticatedUser } from "@/lib/api";
import { feeds, articles } from "@/lib/db/schema";
import { fetchFeed } from "@/lib/rss/fetcher";
import { discoverFeedUrl } from "@/lib/rss/parser";
import { getFaviconUrl } from "@/lib/utils/readability";

// GET /api/feeds — 获取当前用户的所有订阅源（含未读数）
export async function GET(request: Request) {
	try {
		const auth = await getAuthenticatedUser(request);
		if (!auth) return apiError("未登录", 401);
		const { userId } = auth;

		const { searchParams } = new URL(request.url);
		const folderId = searchParams.get("folderId");

		const db = getDatabase();

		const feedList = await db
			.select()
			.from(feeds)
			.where(
				folderId
					? and(eq(feeds.userId, userId), eq(feeds.folderId, folderId))
					: eq(feeds.userId, userId)
			)
			.orderBy(asc(feeds.sortOrder));

		// 批量获取未读数
		const unreadCounts = await db
			.select({
				feedId: articles.feedId,
				count: sql<number>`count(*)`.as("count"),
			})
			.from(articles)
			.where(eq(articles.isRead, false))
			.groupBy(articles.feedId);

		// 批量获取文章总数
		const articleCounts = await db
			.select({
				feedId: articles.feedId,
				count: sql<number>`count(*)`.as("count"),
			})
			.from(articles)
			.groupBy(articles.feedId);

		const unreadMap = new Map(unreadCounts.map((r) => [r.feedId, r.count]));
		const articleCountMap = new Map(articleCounts.map((r) => [r.feedId, r.count]));

		const result = feedList.map((feed) => ({
			...feed,
			unreadCount: unreadMap.get(feed.id) ?? 0,
			articleCount: articleCountMap.get(feed.id) ?? 0,
		}));

		return apiSuccess(result);
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "获取订阅源失败", 500);
	}
}

// POST /api/feeds — 为当前用户添加订阅源
export async function POST(request: Request) {
	try {
		const auth = await getAuthenticatedUser(request);
		if (!auth) return apiError("未登录", 401);
		const { userId } = auth;

		const body = await request.json() as { url?: string; folderId?: string };
		if (!body.url?.trim()) return apiError("订阅源 URL 不能为空");

		let feedUrl = body.url.trim();

		// 尝试自动发现 Feed URL
		const discovered = await discoverFeedUrl(feedUrl);
		if (discovered) feedUrl = discovered;

		// 抓取并解析 Feed
		const parsed = await fetchFeed(feedUrl);

		const db = getDatabase();

		// 检查当前用户是否已订阅该 Feed
		const [existing] = await db
			.select()
			.from(feeds)
			.where(and(eq(feeds.feedUrl, feedUrl), eq(feeds.userId, userId)));
		if (existing) return apiError("该订阅源已存在", 409);

		const faviconUrl = parsed.faviconUrl ?? getFaviconUrl(parsed.siteUrl);

		const existingFeeds = await db
			.select()
			.from(feeds)
			.where(eq(feeds.userId, userId))
			.orderBy(asc(feeds.sortOrder));
		const maxOrder = existingFeeds.length > 0 ? (existingFeeds[existingFeeds.length - 1].sortOrder ?? 0) + 1 : 0;

		const [feed] = await db
			.insert(feeds)
			.values({
				userId,
				folderId: body.folderId ?? null,
				title: parsed.title,
				url: parsed.siteUrl,
				feedUrl,
				description: parsed.description,
				faviconUrl,
				lastFetchedAt: new Date().toISOString(),
				sortOrder: maxOrder,
			})
			.returning();

		// 保存文章
		if (parsed.articles.length > 0) {
			const articleValues = parsed.articles.slice(0, 50).map((a) => ({
				feedId: feed.id,
				title: a.title,
				url: a.url,
				content: a.content,
				summary: a.summary,
				author: a.author,
				imageUrl: a.imageUrl,
				publishedAt: a.publishedAt,
			}));

			await db.insert(articles).values(articleValues).onConflictDoNothing();
		}

		return apiSuccess({ ...feed, unreadCount: parsed.articles.length }, 201);
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "添加订阅源失败", 500);
	}
}
