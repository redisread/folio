import { eq, asc } from "drizzle-orm";
import { apiSuccess, apiError, getDatabase } from "@/lib/api";
import { feeds, articles } from "@/lib/db/schema";
import { fetchFeed } from "@/lib/rss/fetcher";

// POST /api/refresh — 刷新 RSS 订阅源
export async function POST(request: Request) {
	try {
		const body = await request.json().catch(() => ({})) as { feedId?: string };
		const db = getDatabase();

		let feedList;
		if (body.feedId) {
			// 刷新单个订阅源
			feedList = await db.select().from(feeds).where(eq(feeds.id, body.feedId));
			if (feedList.length === 0) return apiError("订阅源不存在", 404);
		} else {
			// 刷新所有订阅源
			feedList = await db.select().from(feeds).orderBy(asc(feeds.sortOrder));
		}

		const results = [];
		for (const feed of feedList) {
			try {
				const parsed = await fetchFeed(feed.feedUrl);

				// 获取已存在的文章 URL
				const existingArticles = await db
					.select({ url: articles.url })
					.from(articles)
					.where(eq(articles.feedId, feed.id));
				const existingUrls = new Set(existingArticles.map((a) => a.url));

				// 只插入新文章
				const newArticles = parsed.articles.filter(
					(a) => a.url && !existingUrls.has(a.url)
				);

				if (newArticles.length > 0) {
					await db.insert(articles).values(
						newArticles.slice(0, 50).map((a) => ({
							feedId: feed.id,
							title: a.title,
							url: a.url,
							content: a.content,
							summary: a.summary,
							author: a.author,
							imageUrl: a.imageUrl,
							publishedAt: a.publishedAt,
						}))
					);
				}

				// 更新最后抓取时间
				await db
					.update(feeds)
					.set({ lastFetchedAt: new Date().toISOString() })
					.where(eq(feeds.id, feed.id));

				results.push({ feedId: feed.id, newArticles: newArticles.length, success: true });
			} catch (err) {
				results.push({
					feedId: feed.id,
					success: false,
					error: err instanceof Error ? err.message : "未知错误",
				});
			}
		}

		return apiSuccess({ results, total: feedList.length });
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "刷新失败", 500);
	}
}
