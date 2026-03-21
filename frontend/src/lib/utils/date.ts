/** 格式化为相对时间（如"2 小时前"）*/
export function formatRelativeTime(dateStr: string | null | undefined): string {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	if (isNaN(date.getTime())) return "";

	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffSecs < 60) return "刚刚";
	if (diffMins < 60) return `${diffMins} 分钟前`;
	if (diffHours < 24) return `${diffHours} 小时前`;
	if (diffDays < 7) return `${diffDays} 天前`;

	return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

/** 格式化为完整日期时间 */
export function formatFullDate(dateStr: string | null | undefined): string {
	if (!dateStr) return "";
	const date = new Date(dateStr);
	if (isNaN(date.getTime())) return "";
	return date.toLocaleDateString("zh-CN", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}
