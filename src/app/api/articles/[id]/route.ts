import { eq } from "drizzle-orm";
import { apiSuccess, apiError, getDatabase } from "@/lib/api";
import { articles } from "@/lib/db/schema";

type Params = { params: Promise<{ id: string }> };

// GET /api/articles/[id] — 获取文章详情
export async function GET(_req: Request, { params }: Params) {
	try {
		const { id } = await params;
		const db = getDatabase();
		const [article] = await db.select().from(articles).where(eq(articles.id, id));
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
		const { id } = await params;
		const body = await request.json() as {
			isRead?: boolean;
			isStarred?: boolean;
			isReadLater?: boolean;
		};

		const db = getDatabase();
		const [existing] = await db.select().from(articles).where(eq(articles.id, id));
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
