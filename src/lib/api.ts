import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { createAuth } from "@/lib/auth";

/** 统一 API 响应格式 */
export function apiSuccess<T>(data: T, status = 200): Response {
	return Response.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400): Response {
	return Response.json({ success: false, error: message }, { status });
}

/** 获取 D1 数据库实例 */
export function getDatabase() {
	const { env } = getCloudflareContext();
	if (!env.DB) throw new Error("D1 数据库未绑定");
	return getDb(env.DB);
}

/** 验证请求 session，返回 userId 或 null */
export async function getAuthenticatedUser(request: Request): Promise<{ userId: string } | null> {
	const { env } = getCloudflareContext();
	const auth = createAuth(env.DB);
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user?.id) return null;
	return { userId: session.user.id };
}
