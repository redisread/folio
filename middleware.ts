import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/api/auth"];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// 放行公开路径
	if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
		return NextResponse.next();
	}

	// 检查 better-auth session cookie（仅做存在性检查，真正验证在各 API 路由中完成）
	// 支持本地开发（better-auth.session_token）和生产环境（__Secure-better-auth.session_token）
	const sessionToken =
		request.cookies.get("better-auth.session_token") ||
		request.cookies.get("__Secure-better-auth.session_token");
	if (!sessionToken) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.svg|.*\\.svg).*)"],
};
