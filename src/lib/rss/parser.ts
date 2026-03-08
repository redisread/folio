import Parser from "rss-parser";
import { extractSummary, extractFirstImage } from "@/lib/utils/readability";

/** 统一的 RSS 文章格式 */
export interface ParsedArticle {
	title: string;
	url: string;
	content: string;
	summary: string;
	author: string;
	imageUrl: string | null;
	publishedAt: string | null;
	guid: string;
}

/** 统一的 RSS 订阅源信息 */
export interface ParsedFeed {
	title: string;
	description: string;
	siteUrl: string;
	faviconUrl: string | null;
	articles: ParsedArticle[];
}

// 创建解析器实例，支持自定义字段
const rssParser = new Parser({
	customFields: {
		feed: ["subtitle", "icon"],
		item: [
			["content:encoded", "contentEncoded"],
			["media:content", "mediaContent", { keepArray: false }],
			["media:thumbnail", "mediaThumbnail"],
			["enclosure", "enclosure"],
		],
	},
	timeout: 10000,
});

/** 从 RSS/Atom/JSON Feed 解析订阅源数据 */
export async function parseFeed(feedUrl: string): Promise<ParsedFeed> {
	const feed = await rssParser.parseURL(feedUrl);

	const articles: ParsedArticle[] = (feed.items ?? []).map((item) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const anyItem = item as any;
		const rawContent =
			anyItem.contentEncoded ||
			item.content ||
			item.summary ||
			"";

		const imageUrl: string | null =
			anyItem.mediaContent?.url ||
			anyItem.mediaThumbnail?.url ||
			anyItem.enclosure?.url ||
			extractFirstImage(rawContent) ||
			null;

		return {
			title: item.title ?? "(无标题)",
			url: item.link ?? item.guid ?? "",
			content: rawContent,
			summary: item.summary ? extractSummary(item.summary) : extractSummary(rawContent),
			author: anyItem.creator || anyItem.author || "",
			imageUrl,
			publishedAt: item.isoDate || item.pubDate || null,
			guid: item.guid || item.link || item.title || "",
		};
	});

	return {
		title: feed.title ?? "未知订阅源",
		description: feed.description ?? "",
		siteUrl: feed.link ?? feedUrl,
		faviconUrl: null,
		articles,
	};
}

/** 尝试从网站 URL 发现 RSS/Atom Feed 地址 */
export async function discoverFeedUrl(siteUrl: string): Promise<string | null> {
	try {
		const res = await fetch(siteUrl, {
			headers: { "User-Agent": "Folio RSS Reader/1.0" },
			signal: AbortSignal.timeout(10000),
		});
		const html = await res.text();

		// 查找 <link rel="alternate" type="application/rss+xml"> 或 atom+xml
		const patterns = [
			/<link[^>]+type=["']application\/rss\+xml["'][^>]+href=["']([^"']+)["']/i,
			/<link[^>]+href=["']([^"']+)["'][^>]+type=["']application\/rss\+xml["']/i,
			/<link[^>]+type=["']application\/atom\+xml["'][^>]+href=["']([^"']+)["']/i,
			/<link[^>]+href=["']([^"']+)["'][^>]+type=["']application\/atom\+xml["']/i,
		];

		for (const pattern of patterns) {
			const match = html.match(pattern);
			if (match) {
				const href = match[1];
				// 处理相对 URL
				try {
					return new URL(href, siteUrl).toString();
				} catch {
					return href;
				}
			}
		}

		return null;
	} catch {
		return null;
	}
}
