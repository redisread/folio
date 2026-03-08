import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/lib/db";
import * as schema from "@/lib/db/schema";

/**
 * 在 Cloudflare Workers 中，auth 实例必须在请求上下文中动态创建，
 * 因为 D1 binding 只能在请求处理期间获取。
 */
export function createAuth(d1: D1Database) {
	return betterAuth({
		database: drizzleAdapter(getDb(d1), {
			provider: "sqlite",
			schema: {
				user: schema.user,
				session: schema.session,
				account: schema.account,
				verification: schema.verification,
			},
		}),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
		},
		secret: process.env.BETTER_AUTH_SECRET!,
		baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
	});
}

export type Auth = ReturnType<typeof createAuth>;
