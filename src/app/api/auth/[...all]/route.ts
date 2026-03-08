import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * 动态获取 auth handler
 * 注意：在 next dev 模式下，getCloudflareContext() 必须在请求处理时调用
 */
function getAuthHandler() {
	const { env } = getCloudflareContext();
	const auth = createAuth(env.DB);
	return toNextJsHandler(auth);
}

export const GET = (request: Request) => {
	const handler = getAuthHandler();
	return handler.GET(request);
};

export const POST = (request: Request) => {
	const handler = getAuthHandler();
	return handler.POST(request);
};
