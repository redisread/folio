import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";

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
