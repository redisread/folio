import { eq, and, inArray } from "drizzle-orm";
import { apiSuccess, apiError, getDatabase, getAuthenticatedUser } from "@/lib/api";
import { folders, feeds, articles } from "@/lib/db/schema";

type Params = { params: Promise<{ id: string }> };

// GET /api/folders/[id]
export async function GET(request: Request, { params }: Params) {
	try {
		const auth = await getAuthenticatedUser(request);
		if (!auth) return apiError("未登录", 401);
		const { userId } = auth;

		const { id } = await params;
		const db = getDatabase();
		const [folder] = await db.select().from(folders).where(and(eq(folders.id, id), eq(folders.userId, userId)));
		if (!folder) return apiError("文件夹不存在", 404);
		return apiSuccess(folder);
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "获取文件夹失败", 500);
	}
}

// PUT /api/folders/[id]
export async function PUT(request: Request, { params }: Params) {
	try {
		const auth = await getAuthenticatedUser(request);
		if (!auth) return apiError("未登录", 401);
		const { userId } = auth;

		const { id } = await params;
		const body = await request.json() as {
			name?: string;
			color?: string;
			icon?: string;
			sortOrder?: number;
			isCollapsed?: boolean;
		};

		const db = getDatabase();
		const [existing] = await db.select().from(folders).where(and(eq(folders.id, id), eq(folders.userId, userId)));
		if (!existing) return apiError("文件夹不存在", 404);

		const updates: Partial<typeof existing> = {
			updatedAt: new Date().toISOString(),
		};
		if (body.name !== undefined) updates.name = body.name.trim();
		if (body.color !== undefined) updates.color = body.color;
		if (body.icon !== undefined) updates.icon = body.icon;
		if (body.sortOrder !== undefined) updates.sortOrder = body.sortOrder;
		if (body.isCollapsed !== undefined) updates.isCollapsed = body.isCollapsed;

		const [updated] = await db
			.update(folders)
			.set(updates)
			.where(and(eq(folders.id, id), eq(folders.userId, userId)))
			.returning();

		return apiSuccess(updated);
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "更新文件夹失败", 500);
	}
}

// DELETE /api/folders/[id]
export async function DELETE(request: Request, { params }: Params) {
	try {
		const auth = await getAuthenticatedUser(request);
		if (!auth) return apiError("未登录", 401);
		const { userId } = auth;

		const { id } = await params;
		const { searchParams } = new URL(request.url);
		const deleteFeeds = searchParams.get("deleteFeeds") === "true";

		const db = getDatabase();
		const [existing] = await db.select().from(folders).where(and(eq(folders.id, id), eq(folders.userId, userId)));
		if (!existing) return apiError("文件夹不存在", 404);

		if (deleteFeeds) {
			// 获取该文件夹下的所有订阅源
			const folderFeeds = await db
				.select({ id: feeds.id })
				.from(feeds)
				.where(and(eq(feeds.folderId, id), eq(feeds.userId, userId)));
			const feedIds = folderFeeds.map((f) => f.id);

			// 删除相关文章
			if (feedIds.length > 0) {
				await db.delete(articles).where(inArray(articles.feedId, feedIds));
			}

			// 删除订阅源
			await db.delete(feeds).where(and(eq(feeds.folderId, id), eq(feeds.userId, userId)));
		}

		await db.delete(folders).where(and(eq(folders.id, id), eq(folders.userId, userId)));
		return apiSuccess({ id });
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "删除文件夹失败", 500);
	}
}
