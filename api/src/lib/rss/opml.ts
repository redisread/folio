/** OPML 导入/导出工具 */

export interface OpmlFeed {
  title: string;
  xmlUrl: string;
  htmlUrl?: string;
  folderName?: string;
}

/** 解析 OPML XML 文本，返回订阅源列表 */
export function parseOpml(opmlXml: string): OpmlFeed[] {
  const feeds: OpmlFeed[] = [];

  const folderPattern = /<outline[^>]+text=["']([^"']+)["'][^>]*(?!xmlUrl)[^>]*>([\s\S]*?)<\/outline>/gi;
  const feedPattern = /<outline[^>]+xmlUrl=["']([^"']+)["'][^>]*(?:text=["']([^"']+)["'])?[^>]*(?:htmlUrl=["']([^"']+)["'])?[^>]*/gi;

  let folderMatch;
  while ((folderMatch = folderPattern.exec(opmlXml)) !== null) {
    const folderName = folderMatch[1];
    const folderContent = folderMatch[2];
    let feedMatch;
    feedPattern.lastIndex = 0;
    while ((feedMatch = feedPattern.exec(folderContent)) !== null) {
      feeds.push({
        xmlUrl: feedMatch[1],
        title: feedMatch[2] || feedMatch[1],
        htmlUrl: feedMatch[3],
        folderName,
      });
    }
  }

  const allFeedPattern = /<outline[^>]+xmlUrl=["']([^"']+)["'][^>]*(?:text=["']([^"']+)["'])?[^>]*/gi;
  let allFeedMatch;
  const existingUrls = new Set(feeds.map((f) => f.xmlUrl));
  while ((allFeedMatch = allFeedPattern.exec(opmlXml)) !== null) {
    const xmlUrl = allFeedMatch[1];
    if (!existingUrls.has(xmlUrl)) {
      feeds.push({
        xmlUrl,
        title: allFeedMatch[2] || xmlUrl,
      });
      existingUrls.add(xmlUrl);
    }
  }

  return feeds;
}

/** 生成 OPML XML 字符串 */
export function generateOpml(
  feeds: Array<{ title: string; feedUrl: string; url: string; folderName?: string }>
): string {
  const folderMap = new Map<string, typeof feeds>();
  const rootFeeds: typeof feeds = [];

  for (const feed of feeds) {
    if (feed.folderName) {
      const existing = folderMap.get(feed.folderName) ?? [];
      existing.push(feed);
      folderMap.set(feed.folderName, existing);
    } else {
      rootFeeds.push(feed);
    }
  }

  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const feedToOutline = (feed: (typeof feeds)[0]) =>
    `    <outline text="${escape(feed.title)}" xmlUrl="${escape(feed.feedUrl)}" htmlUrl="${escape(feed.url)}" type="rss"/>`;

  const folderOutlines = Array.from(folderMap.entries())
    .map(
      ([name, folderFeeds]) =>
        `  <outline text="${escape(name)}">\n${folderFeeds.map(feedToOutline).join("\n")}\n  </outline>`
    )
    .join("\n");

  const rootOutlines = rootFeeds.map(feedToOutline).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Folio RSS 订阅列表</title>
    <dateCreated>${new Date().toUTCString()}</dateCreated>
  </head>
  <body>
${folderOutlines}
${rootOutlines}
  </body>
</opml>`;
}
