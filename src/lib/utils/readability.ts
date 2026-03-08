/** 简易正文提取工具，用于 Reader 模式 */

/** 从 HTML 中提取纯文本摘要 */
export function extractSummary(html: string, maxLength = 150): string {
	if (!html) return "";
	// 移除 HTML 标签
	const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength).replace(/\s\S*$/, "") + "…";
}

/** 从 HTML 中提取第一张图片 URL */
export function extractFirstImage(html: string): string | null {
	if (!html) return null;
	const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
	return match ? match[1] : null;
}

/** 清理 HTML 内容，移除脚本、样式、导航等非正文元素 */
export function cleanHtmlContent(html: string): string {
	if (!html) return "";

	return html
		// 移除 script 和 style 标签及其内容
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
		// 移除注释
		.replace(/<!--[\s\S]*?-->/g, "")
		// 移除 iframe
		.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
		// 移除 form 相关
		.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
		// 清理多余空白
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

/** 从 URL 中推断 favicon URL */
export function getFaviconUrl(siteUrl: string): string {
	try {
		const url = new URL(siteUrl);
		return `${url.protocol}//${url.hostname}/favicon.ico`;
	} catch {
		return "";
	}
}
