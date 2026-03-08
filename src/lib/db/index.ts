import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

// 从 Cloudflare D1 绑定创建 Drizzle 数据库实例
export function getDb(d1: D1Database) {
	return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof getDb>;
export * from "./schema";
