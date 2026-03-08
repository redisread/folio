import { eq, and } from "drizzle-orm";
import { apiSuccess, apiError, getDatabase, getAuthenticatedUser } from "@/lib/api";
import { feeds } from "@/lib/db/schema";

type Params = { params: Promise<{ id: string }> };

// GET /api/feeds/[id]
export async function GET(request: Request, { params }: Params) {
	try {
		const auth = await getAuthenticatedUser(request);
		if (!auth) return apiError("未登录", 401);
		const { userId } = auth;

		const { id } = await params;
		const db = getDatabase();
		const [feed] = await db.select().from(feeds).where(and(eq(feeds.id, id), eq(feeds.userId, userId)));
		if (!feed) return apiError("订阅源不存在", 404);
		return apiSuccess(feed);
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "获取订阅源失败", 500);
	}
}

// PUT /api/feeds/[id]
export async function PUT(request: Request, { params }: Params) {
	try {
		const auth = await getAuthenticatedUser(request);
		if (!auth) return apiError("未登录", 401);
		const { userId } = auth;

		const { id } = await params;
		const body = await request.json() as {
			title?: string;
			folderId?: string | null;
			sortOrder?: number;
		};

		const db = getDatabase();
		const [existing] = await db.select().from(feeds).where(and(eq(feeds.id, id), eq(feeds.userId, userId)));
		if (!existing) return apiError("订阅源不存在", 404);

		const updates: Partial<typeof existing> = {
			updatedAt: new Date().toISOString(),
		};
		if (body.title !== undefined) updates.title = body.title.trim();
		if ("folderId" in body) updates.folderId = body.folderId;
		if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;

		const [updated] = await db
			.update(feeds)
			.set(updates)
			.where(and(eq(feeds.id, id), eq(feeds.userId, userId)))
			.returning();

		return apiSuccess(updated);
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "更新订阅源失败", 500);
	}
}

// DELETE /api/feeds/[id]
export async function DELETE(request: Request, { params }: Params) {
	try {
		const auth = await getAuthenticatedUser(request);
		if (!auth) return apiError("未登录", 401);
		const { userId } = auth;

		const { id } = await params;
		const db = getDatabase();
		const [existing] = await db.select().from(feeds).where(and(eq(feeds.id, id), eq(feeds.userId, userId)));
		if (!existing) return apiError("订阅源不存在", 404);

		await db.delete(feeds).where(and(eq(feeds.id, id), eq(feeds.userId, userId)));
		return apiSuccess({ id });
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "删除订阅源失败", 500);
	}
}
