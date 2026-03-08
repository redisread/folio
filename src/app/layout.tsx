import type { Metadata } from "next";
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
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="zh-CN" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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
