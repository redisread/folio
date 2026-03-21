import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: import.meta.env.PUBLIC_API_URL ?? "http://localhost:8787",
});

export const { signIn, signUp, signOut, useSession } = authClient;
