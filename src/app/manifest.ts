import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Folio RSS",
		short_name: "Folio",
		description: "极简 RSS 阅读器 — 让阅读回归本质",
		start_url: "/",
		display: "standalone",
		background_color: "#FFFFFF",
		theme_color: "#FF6B35",
		orientation: "portrait-primary",
		icons: [
			{
				src: "/icons/icon-72x72.png",
				sizes: "72x72",
				type: "image/png",
			},
			{
				src: "/icons/icon-96x96.png",
				sizes: "96x96",
				type: "image/png",
			},
			{
				src: "/icons/icon-128x128.png",
				sizes: "128x128",
				type: "image/png",
			},
			{
				src: "/icons/icon-144x144.png",
				sizes: "144x144",
				type: "image/png",
			},
			{
				src: "/icons/icon-152x152.png",
				sizes: "152x152",
				type: "image/png",
			},
			{
				src: "/icons/icon-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icons/icon-192x192-maskable.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/icons/icon-384x384.png",
				sizes: "384x384",
				type: "image/png",
			},
			{
				src: "/icons/icon-512x512.png",
				sizes: "512x512",
				type: "image/png",
			},
		],
		categories: ["news", "productivity"],
		lang: "zh-CN",
		dir: "ltr",
		scope: "/",
		screenshots: [
			{
				src: "/screenshots/desktop.png",
				sizes: "1280x720",
				type: "image/png",
				form_factor: "wide",
				label: "桌面端三栏布局",
			},
			{
				src: "/screenshots/mobile.png",
				sizes: "390x844",
				type: "image/png",
				form_factor: "narrow",
				label: "移动端单栏布局",
			},
		],
	};
}
