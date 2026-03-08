"use client";
import { useArticleStore, type ArticleListItem } from "@/lib/store/articleStore";
import { useFeedStore } from "@/lib/store/feedStore";
import { formatRelativeTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

interface ArticleCardProps {
	article: ArticleListItem;
	index: number;
}

export function ArticleCard({ article, index }: ArticleCardProps) {
	const { selectedArticleId, selectArticle } = useArticleStore();
	const { feeds } = useFeedStore();
	const isSelected = selectedArticleId === article.id;

	const feed = feeds.find((f) => f.id === article.feedId);

	return (
		<button
			onClick={() => selectArticle(article.id)}
			className={cn(
				"w-full text-left px-4 py-3 border-b border-[var(--border-light)]",
				"transition-all duration-[var(--transition-base)]",
				"hover:bg-[var(--bg-card-hover)]",
				isSelected && "bg-[var(--bg-card-selected)]",
				!article.isRead && "relative"
			)}
			style={{ animationDelay: `${index * 30}ms` }}
		>
			{/* 未读指示点 */}
			{!article.isRead && (
				<span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
			)}

			<div className="flex items-start gap-3">
				<div className="flex-1 min-w-0 space-y-1">
					{/* 来源 & 时间 */}
					<div className="flex items-center gap-1.5">
						{feed?.faviconUrl && (
							<img
								src={feed.faviconUrl}
								alt=""
								className="w-3.5 h-3.5 rounded-sm object-contain"
								onError={(e) => {
									(e.target as HTMLImageElement).style.display = "none";
								}}
							/>
						)}
						<span className="text-[11px] text-[var(--text-tertiary)] truncate">
							{feed?.title ?? "未知来源"}
						</span>
						<span className="text-[11px] text-[var(--text-tertiary)] shrink-0">
							· {formatRelativeTime(article.publishedAt)}
						</span>
					</div>

					{/* 标题 */}
					<p
						className={cn(
							"text-sm leading-snug line-clamp-2",
							article.isRead
								? "text-[var(--text-secondary)] font-normal"
								: "text-[var(--text-primary)] font-medium"
						)}
					>
						{article.title}
					</p>

					{/* 摘要 */}
					{article.summary && (
						<p className="text-xs text-[var(--text-tertiary)] line-clamp-1">
							{article.summary}
						</p>
					)}
				</div>

				{/* 封面图 */}
				{article.imageUrl && (
					<img
						src={article.imageUrl}
						alt=""
						className="w-16 h-12 rounded-lg object-cover shrink-0"
						onError={(e) => {
							(e.target as HTMLImageElement).style.display = "none";
						}}
					/>
				)}
			</div>
		</button>
	);
}
