import { Hono } from "hono";
import { eq, and, asc } from "drizzle-orm";
import { getDb } from "../db";
import { feeds, articles } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import { fetchFeed } from "../lib/rss/fetcher";
import type { CloudflareEnv } from "../types";

const refreshRoute = new Hono<{ Bindings: CloudflareEnv; Variables: { userId: string } }>();

refreshRoute.use("/*", authMiddleware);

// POST /api/refresh — 刷新当前用户的 RSS 订阅源
refreshRoute.post("/", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json().catch(() => ({})) as { feedId?: string };
    const db = getDb(c.env.DB);

    let feedList;
    if (body.feedId) {
      // 刷新单个订阅源（验证归属）
      feedList = await db
        .select()
        .from(feeds)
        .where(and(eq(feeds.id, body.feedId), eq(feeds.userId, userId)));
      if (feedList.length === 0) return c.json({ success: false, error: "订阅源不存在" }, 404);
    } else {
      // 刷新当前用户所有订阅源
      feedList = await db
        .select()
        .from(feeds)
        .where(eq(feeds.userId, userId))
        .orderBy(asc(feeds.sortOrder));
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

    return c.json({ success: true, data: { results, total: feedList.length } });
  } catch (err) {
    return c.json({ success: false, error: err instanceof Error ? err.message : "刷新失败" }, 500);
  }
});

export default refreshRoute;
