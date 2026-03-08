import { eq, and } from "drizzle-orm";
import { apiSuccess, apiError, getDatabase, getAuthenticatedUser } from "@/lib/api";
import { articles, feeds } from "@/lib/db/schema";

type Params = { params: Promise<{ id: string }> };

/** 验证文章归属当前用户（通过 feedId → feeds.userId） */
async function getArticleForUser(db: ReturnType<typeof getDatabase>, articleId: string, userId: string) {
	const [result] = await db
		.select({ article: articles, feedUserId: feeds.userId })
		.from(articles)
		.innerJoin(feeds, eq(articles.feedId, feeds.id))
		.where(and(eq(articles.id, articleId), eq(feeds.userId, userId)));
	return result?.article ?? null;
}

// GET /api/articles/[id] — 获取文章详情
export async function GET(request: Request, { params }: Params) {
	try {
		const auth = await getAuthenticatedUser(request);
		if (!auth) return apiError("未登录", 401);
		const { userId } = auth;

		const { id } = await params;
		const db = getDatabase();
		const article = await getArticleForUser(db, id, userId);
		if (!article) return apiError("文章不存在", 404);

		// 自动标记为已读
		if (!article.isRead) {
			await db.update(articles).set({ isRead: true }).where(eq(articles.id, id));
			article.isRead = true;
		}

		return apiSuccess(article);
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "获取文章失败", 500);
	}
}

// PUT /api/articles/[id] — 更新文章状态（已读/收藏/稍后读）
export async function PUT(request: Request, { params }: Params) {
	try {
		const auth = await getAuthenticatedUser(request);
		if (!auth) return apiError("未登录", 401);
		const { userId } = auth;

		const { id } = await params;
		const body = await request.json() as {
			isRead?: boolean;
			isStarred?: boolean;
			isReadLater?: boolean;
		};

		const db = getDatabase();
		const existing = await getArticleForUser(db, id, userId);
		if (!existing) return apiError("文章不存在", 404);

		const updates: Partial<typeof existing> = {};
		if (body.isRead !== undefined) updates.isRead = body.isRead;
		if (body.isStarred !== undefined) updates.isStarred = body.isStarred;
		if (body.isReadLater !== undefined) updates.isReadLater = body.isReadLater;

		const [updated] = await db
			.update(articles)
			.set(updates)
			.where(eq(articles.id, id))
			.returning();

		return apiSuccess(updated);
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "更新文章失败", 500);
	}
}
