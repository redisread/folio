import { eq, asc } from "drizzle-orm";
import { apiSuccess, apiError, getDatabase } from "@/lib/api";
import { folders } from "@/lib/db/schema";

// GET /api/folders — 获取所有文件夹
export async function GET() {
	try {
		const db = getDatabase();
		const result = await db.select().from(folders).orderBy(asc(folders.sortOrder));
		return apiSuccess(result);
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "获取文件夹失败", 500);
	}
}

// POST /api/folders — 创建文件夹
export async function POST(request: Request) {
	try {
		const body = await request.json() as { name?: string; color?: string; icon?: string };
		if (!body.name?.trim()) return apiError("文件夹名称不能为空");

		const db = getDatabase();
		// 获取当前最大排序值
		const existing = await db.select().from(folders).orderBy(asc(folders.sortOrder));
		const maxOrder = existing.length > 0 ? (existing[existing.length - 1].sortOrder ?? 0) + 1 : 0;

		const [folder] = await db
			.insert(folders)
			.values({
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
