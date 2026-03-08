import { eq } from "drizzle-orm";
import { apiSuccess, apiError, getDatabase } from "@/lib/api";
import { folders } from "@/lib/db/schema";

type Params = { params: Promise<{ id: string }> };

// GET /api/folders/[id]
export async function GET(_req: Request, { params }: Params) {
	try {
		const { id } = await params;
		const db = getDatabase();
		const [folder] = await db.select().from(folders).where(eq(folders.id, id));
		if (!folder) return apiError("文件夹不存在", 404);
		return apiSuccess(folder);
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "获取文件夹失败", 500);
	}
}

// PUT /api/folders/[id]
export async function PUT(request: Request, { params }: Params) {
	try {
		const { id } = await params;
		const body = await request.json() as {
			name?: string;
			color?: string;
			icon?: string;
			sortOrder?: number;
			isCollapsed?: boolean;
		};

		const db = getDatabase();
		const [existing] = await db.select().from(folders).where(eq(folders.id, id));
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
			.where(eq(folders.id, id))
			.returning();

		return apiSuccess(updated);
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "更新文件夹失败", 500);
	}
}

// DELETE /api/folders/[id]
export async function DELETE(_req: Request, { params }: Params) {
	try {
		const { id } = await params;
		const db = getDatabase();
		const [existing] = await db.select().from(folders).where(eq(folders.id, id));
		if (!existing) return apiError("文件夹不存在", 404);

		await db.delete(folders).where(eq(folders.id, id));
		return apiSuccess({ id });
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "删除文件夹失败", 500);
	}
}
