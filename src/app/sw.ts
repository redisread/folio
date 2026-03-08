import { defaultCache } from "@serwist/next/worker";
import { installSerwist } from "@serwist/sw";

installSerwist({
	precacheEntries: (self as any).__SW_MANIFEST,
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	runtimeCaching: defaultCache,
});
