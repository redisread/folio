import { createMiddleware } from "hono/factory";
import { createAuth } from "../lib/auth";
import type { CloudflareEnv } from "../types";

type Variables = {
  userId: string;
};

/** 验证 Better Auth session，注入 userId */
export const authMiddleware = createMiddleware<{
  Bindings: CloudflareEnv;
  Variables: Variables;
}>(async (c, next) => {
  const auth = createAuth(
    c.env.DB,
    c.env.BETTER_AUTH_SECRET,
    c.env.BETTER_AUTH_URL
  );

  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  c.set("userId", session.user.id);
  await next();
});
