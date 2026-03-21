// HTML 净化工具，防止 XSS 攻击

/** 允许的 HTML 标签（保留文章内容所需标签） */
const ALLOWED_TAGS = new Set([
	"a", "b", "blockquote", "br", "caption", "cite", "code",
	"col", "colgroup", "dd", "del", "details", "div", "dl", "dt",
	"em", "figcaption", "figure", "h1", "h2", "h3", "h4", "h5", "h6",
	"hr", "i", "img", "ins", "kbd", "li", "mark", "ol", "p", "pre",
	"q", "s", "section", "small", "span", "strong", "sub", "summary",
	"sup", "table", "tbody", "td", "th", "thead", "time", "tr", "u", "ul",
]);

/** 允许的 HTML 属性 */
const ALLOWED_ATTRS = new Set([
	"href", "src", "srcset", "alt", "title", "width", "height",
	"class", "id", "datetime", "cite",
]);

/** 净化 HTML 内容（服务端安全版本，使用正则实现基本净化） */
export function sanitizeHtml(html: string): string {
	if (!html) return "";

	// 移除危险标签及其内容
	let cleaned = html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
		.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
		.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
		.replace(/<!--[\s\S]*?-->/g, "")
		// 移除 on* 事件处理器
		.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "")
		.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, "")
		// 移除 javascript: 协议
		.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
		.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src="#"');

	return cleaned;
}

/** 转义 HTML 特殊字符 */
export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
