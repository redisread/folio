import { eq, asc } from "drizzle-orm";
import { apiSuccess, apiError, getDatabase } from "@/lib/api";
import { feeds, folders } from "@/lib/db/schema";
import { parseOpml, generateOpml } from "@/lib/rss/opml";
import { fetchFeed } from "@/lib/rss/fetcher";
import { getFaviconUrl } from "@/lib/utils/readability";

// GET /api/opml — 导出 OPML
export async function GET() {
	try {
		const db = getDatabase();

		const [feedList, folderList] = await Promise.all([
			db.select().from(feeds).orderBy(asc(feeds.sortOrder)),
			db.select().from(folders).orderBy(asc(folders.sortOrder)),
		]);

		const folderMap = new Map(folderList.map((f) => [f.id, f.name]));

		const opmlFeeds = feedList.map((feed) => ({
			title: feed.title,
			feedUrl: feed.feedUrl,
			url: feed.url,
			folderName: feed.folderId ? folderMap.get(feed.folderId) : undefined,
		}));

		const opmlContent = generateOpml(opmlFeeds);

		return new Response(opmlContent, {
			headers: {
				"Content-Type": "text/xml; charset=utf-8",
				"Content-Disposition": 'attachment; filename="folio-feeds.opml"',
			},
		});
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "导出 OPML 失败", 500);
	}
}

// POST /api/opml — 导入 OPML
export async function POST(request: Request) {
	try {
		const text = await request.text();
		if (!text.trim()) return apiError("OPML 内容不能为空");

		const parsedFeeds = parseOpml(text);
		if (parsedFeeds.length === 0) return apiError("未找到有效的订阅源");

		const db = getDatabase();

		// 创建文件夹映射（文件夹名 -> id）
		const folderNameMap = new Map<string, string>();
		const existingFolders = await db.select().from(folders);
		for (const f of existingFolders) {
			folderNameMap.set(f.name, f.id);
		}

		// 创建不存在的文件夹
		const uniqueFolderNames = [...new Set(parsedFeeds.map((f) => f.folderName).filter(Boolean) as string[])];
		for (const name of uniqueFolderNames) {
			if (!folderNameMap.has(name)) {
				const [folder] = await db.insert(folders).values({ name }).returning();
				folderNameMap.set(name, folder.id);
			}
		}

		// 导入订阅源
		const results = [];
		for (const opmlFeed of parsedFeeds) {
			try {
				// 检查是否已存在
				const [existing] = await db.select().from(feeds).where(eq(feeds.feedUrl, opmlFeed.xmlUrl));
				if (existing) {
					results.push({ url: opmlFeed.xmlUrl, success: false, error: "已存在" });
					continue;
				}

				// 抓取 Feed
				const parsed = await fetchFeed(opmlFeed.xmlUrl);
				const folderId = opmlFeed.folderName ? folderNameMap.get(opmlFeed.folderName) : null;

				await db.insert(feeds).values({
					folderId: folderId ?? null,
					title: parsed.title || opmlFeed.title,
					url: parsed.siteUrl || opmlFeed.htmlUrl || opmlFeed.xmlUrl,
					feedUrl: opmlFeed.xmlUrl,
					description: parsed.description,
					faviconUrl: getFaviconUrl(parsed.siteUrl || opmlFeed.xmlUrl),
					lastFetchedAt: new Date().toISOString(),
				});

				results.push({ url: opmlFeed.xmlUrl, success: true });
			} catch (err) {
				results.push({
					url: opmlFeed.xmlUrl,
					success: false,
					error: err instanceof Error ? err.message : "导入失败",
				});
			}
		}

		const successCount = results.filter((r) => r.success).length;
		return apiSuccess({ results, total: parsedFeeds.length, imported: successCount });
	} catch (err) {
		return apiError(err instanceof Error ? err.message : "导入 OPML 失败", 500);
	}
}
