import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

function getAuthHandler() {
	const { env } = getCloudflareContext();
	const auth = createAuth(env.DB);
	return toNextJsHandler(auth);
}

export const { GET, POST } = getAuthHandler();
