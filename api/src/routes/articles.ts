import { Hono } from "hono";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { getDb, type DB } from "../db";
import { articles, feeds } from "../db/schema";
import { authMiddleware } from "../middleware/auth";
import type { CloudflareEnv } from "../types";

const articlesRoute = new Hono<{ Bindings: CloudflareEnv; Variables: { userId: string } }>();

articlesRoute.use("/*", authMiddleware);

/** 验证文章归属当前用户（通过 feedId → feeds.userId） */
async function getArticleForUser(db: DB, articleId: string, userId: string) {
  const [result] = await db
    .select({ article: articles, feedUserId: feeds.userId })
    .from(articles)
    .innerJoin(feeds, eq(articles.feedId, feeds.id))
    .where(and(eq(articles.id, articleId), eq(feeds.userId, userId)));
  return result?.article ?? null;
}

// GET /api/articles — 获取当前用户的文章列表（支持分页和筛选）
articlesRoute.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    const feedId = c.req.query("feedId");
    const folderId = c.req.query("folderId");
    const filter = c.req.query("filter"); // "starred" | "read_later" | "unread"
    const page = parseInt(c.req.query("page") ?? "1", 10);
    const pageSize = Math.min(parseInt(c.req.query("pageSize") ?? "30", 10), 100);
    const sortOrder = c.req.query("sort") === "asc" ? "asc" : "desc";

    const db = getDb(c.env.DB);

    // 先获取当前用户所有 feedId（或按条件过滤）
    let userFeedIds: string[];
    if (feedId) {
      const [feed] = await db
        .select({ id: feeds.id })
        .from(feeds)
        .where(and(eq(feeds.id, feedId), eq(feeds.userId, userId)));
      if (!feed) return c.json({ success: true, data: { articles: [], total: 0, page, pageSize } });
      userFeedIds = [feed.id];
    } else if (folderId) {
      const folderFeeds = await db
        .select({ id: feeds.id })
        .from(feeds)
        .where(and(eq(feeds.folderId, folderId), eq(feeds.userId, userId)));
      if (folderFeeds.length === 0) return c.json({ success: true, data: { articles: [], total: 0, page, pageSize } });
      userFeedIds = folderFeeds.map((f) => f.id);
    } else {
      const userFeeds = await db
        .select({ id: feeds.id })
        .from(feeds)
        .where(eq(feeds.userId, userId));
      if (userFeeds.length === 0) return c.json({ success: true, data: { articles: [], total: 0, page, pageSize } });
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

    return c.json({
      success: true,
      data: {
        articles: articleList,
        total: countResult[0]?.count ?? 0,
        page,
        pageSize,
      },
    });
  } catch (err) {
    return c.json({ success: false, error: err instanceof Error ? err.message : "获取文章失败" }, 500);
  }
});

// GET /api/articles/:id — 获取文章详情
articlesRoute.get("/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const db = getDb(c.env.DB);
    const article = await getArticleForUser(db, id, userId);
    if (!article) return c.json({ success: false, error: "文章不存在" }, 404);

    // 自动标记为已读
    if (!article.isRead) {
      await db.update(articles).set({ isRead: true }).where(eq(articles.id, id));
      article.isRead = true;
    }

    return c.json({ success: true, data: article });
  } catch (err) {
    return c.json({ success: false, error: err instanceof Error ? err.message : "获取文章失败" }, 500);
  }
});

// PUT /api/articles/:id — 更新文章状态（已读/收藏/稍后读）
articlesRoute.put("/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const id = c.req.param("id");
    const body = await c.req.json() as {
      isRead?: boolean;
      isStarred?: boolean;
      isReadLater?: boolean;
    };

    const db = getDb(c.env.DB);
    const existing = await getArticleForUser(db, id, userId);
    if (!existing) return c.json({ success: false, error: "文章不存在" }, 404);

    const updates: Partial<typeof existing> = {};
    if (body.isRead !== undefined) updates.isRead = body.isRead;
    if (body.isStarred !== undefined) updates.isStarred = body.isStarred;
    if (body.isReadLater !== undefined) updates.isReadLater = body.isReadLater;

    const [updated] = await db
      .update(articles)
      .set(updates)
      .where(eq(articles.id, id))
      .returning();

    return c.json({ success: true, data: updated });
  } catch (err) {
    return c.json({ success: false, error: err instanceof Error ? err.message : "更新文章失败" }, 500);
  }
});

export default articlesRoute;
