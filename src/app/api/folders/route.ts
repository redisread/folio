import { eq, and, asc } from "drizzle-orm";
import { apiSuccess, apiError, getDatabase, getAuthenticatedUser } from "@/lib/api";
import { folders } from "@/lib/db/schema";

// GET /api/folders — 获取当前用户的所有文件夹
export async function GET(request: Request) {
	try {
		const auth = await getAuthenticatedUser(request);
		if (!auth) return apiError("未登录", 401);
		const { userId } = auth;

		const db = getDatabase();
		const result = await db
			.select()
			.from(folders)
			.where(eq(folders.userId, userId))
			.orderBy(asc(folders.sortOrder));
		return apiSuccess(result);
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "获取文件夹失败", 500);
	}
}

// POST /api/folders — 为当前用户创建文件夹
export async function POST(request: Request) {
	try {
		const auth = await getAuthenticatedUser(request);
		if (!auth) return apiError("未登录", 401);
		const { userId } = auth;

		const body = await request.json() as { name?: string; color?: string; icon?: string };
		if (!body.name?.trim()) return apiError("文件夹名称不能为空");

		const db = getDatabase();
		const existing = await db
			.select()
			.from(folders)
			.where(eq(folders.userId, userId))
			.orderBy(asc(folders.sortOrder));
		const maxOrder = existing.length > 0 ? (existing[existing.length - 1].sortOrder ?? 0) + 1 : 0;

		const [folder] = await db
			.insert(folders)
			.values({
				userId,
				name: body.name.trim(),
				color: body.color ?? "#777777",
				icon: body.icon ?? null,
				sortOrder: maxOrder,
			})
			.returning();

		return apiSuccess(folder, 201);
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "创建文件夹失败", 500);
	}
}
