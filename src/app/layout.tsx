import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Folio RSS",
	description: "极简 RSS 阅读器 — 让阅读回归本质",
	// PWA 相关
	applicationName: "Folio RSS",
	authors: [{ name: "Folio Team" }],
	keywords: ["RSS", "阅读器", "news", "reader", "RSS订阅"],
	robots: "index, follow",
	// Apple
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Folio RSS",
	},
	// Open Graph
	openGraph: {
		type: "website",
		siteName: "Folio RSS",
		title: "Folio RSS",
		description: "极简 RSS 阅读器 — 让阅读回归本质",
	},
	// Twitter
	twitter: {
		card: "summary",
		title: "Folio RSS",
		description: "极简 RSS 阅读器 — 让阅读回归本质",
	},
	// Icons
	icons: {
		icon: [
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
		],
		apple: [{ url: "/icons/icon-192x192.png", sizes: "192x192" }],
		shortcut: ["/favicon.svg"],
	},
};

export const viewport: Viewport = {
	// 基础 viewport
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
	userScalable: true,
	// 主题色
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
		{ media: "(prefers-color-scheme: dark)", color: "#1A1A1A" },
	],
	// PWA
	viewportFit: "cover",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="zh-CN" suppressHydrationWarning>
			<head>
				{/* PWA: 禁止自动检测电话号码 */}
				<meta name="format-detection" content="telephone=no" />
				{/* PWA: 全屏模式（iOS） */}
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Folio" />
				{/* PWA: 启动画面（iOS）- 可选 */}
				<link
					rel="apple-touch-startup-image"
					href="/icons/icon-512x512.png"
					media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
				/>
				{/* 防止主题切换闪烁 */}
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								try {
									var stored = localStorage.getItem('folio-ui');
									var theme = stored ? JSON.parse(stored).state?.theme : 'system';
									var isDark = theme === 'dark' || (theme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
									if (isDark) document.documentElement.classList.add('dark');
								} catch(e) {}
							})();
						`,
					}}
				/>
			</head>
			<body
				className={`${inter.variable} antialiased`}
				style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
			>
				{children}
			</body>
		</html>
	);
}
