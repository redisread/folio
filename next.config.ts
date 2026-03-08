import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// 图片域名白名单（允许外部 favicon 和文章图片）
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "**" },
			{ protocol: "http", hostname: "**" },
		],
	},
	// Turbopack 配置：排除原生模块
	turbopack: {
		resolveAlias: {
			"better-sqlite3": "./node_modules/drizzle-orm/sqlite-core",
		},
	},
	// 排除服务器端原生模块
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.externals = config.externals || [];
			if (Array.isArray(config.externals)) {
				config.externals.push("better-sqlite3");
			}
		}
		return config;
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
