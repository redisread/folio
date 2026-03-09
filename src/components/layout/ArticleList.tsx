"use client";
import { useEffect, useRef, useCallback, useState } from "react";
import { useArticleStore } from "@/lib/store/articleStore";
import { useFeedStore } from "@/lib/store/feedStore";
import { useMobileStore } from "@/lib/store/mobileStore";
import { ArticleCard } from "@/components/article/ArticleCard";
import { ArticleCardSkeleton } from "@/components/article/ArticleSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils/cn";

interface ArticleListProps {
	mobile?: boolean;
}

export function ArticleList({ mobile }: ArticleListProps) {
	const { articles, isLoading, hasMore, fetchMoreArticles, total, sortOrder, setSortOrder, showUnreadOnly, setShowUnreadOnly, fetchArticles } =
		useArticleStore();
	const { selectedSource } = useFeedStore();
	const { openSidebar } = useMobileStore();
	const bottomRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	// 下拉刷新状态
	const [pullProgress, setPullProgress] = useState(0);
	const [isPulling, setIsPulling] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const touchStartY = useRef(0);
	const pullThreshold = 80; // 触发刷新的阈值

	// 无限滚动加载
	const handleObserver = useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const [entry] = entries;
			if (entry.isIntersecting && hasMore && !isLoading) {
				fetchMoreArticles(selectedSource);
			}
		},
		[hasMore, isLoading, fetchMoreArticles, selectedSource]
	);

	useEffect(() => {
		const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
		if (bottomRef.current) observer.observe(bottomRef.current);
		return () => observer.disconnect();
	}, [handleObserver]);

	// 下拉刷新处理
	const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
		const listEl = listRef.current;
		if (!listEl) return;

		// 只有在列表顶部时才启用下拉刷新
		if (listEl.scrollTop > 0) return;

		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		touchStartY.current = clientY;
		setIsPulling(true);
	}, []);

	const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
		if (!isPulling) return;

		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
		const diff = clientY - touchStartY.current;

		if (diff > 0) {
			// 使用阻尼效果使下拉更有质感
			const dampedDiff = Math.min(diff * 0.5, pullThreshold * 1.5);
			setPullProgress(dampedDiff);

			// 阻止默认滚动行为
			if ('preventDefault' in e && diff > 0) {
				e.preventDefault();
			}
		}
	}, [isPulling]);

	const handleTouchEnd = useCallback(async () => {
		if (!isPulling) return;

		setIsPulling(false);

		if (pullProgress >= pullThreshold && !isRefreshing) {
			setIsRefreshing(true);
			await fetchArticles(selectedSource, true);
			setIsRefreshing(false);
		}

		setPullProgress(0);
	}, [isPulling, pullProgress, isRefreshing, fetchArticles, selectedSource]);

	const handleToggleUnread = useCallback(() => {
		const newValue = !showUnreadOnly;
		setShowUnreadOnly(newValue);
		fetchArticles(selectedSource, true, { showUnreadOnly: newValue });
	}, [showUnreadOnly, setShowUnreadOnly, fetchArticles, selectedSource]);

	const handleToggleSort = useCallback(() => {
		const newOrder = sortOrder === "desc" ? "asc" : "desc";
		setSortOrder(newOrder);
		fetchArticles(selectedSource, true, { sortOrder: newOrder });
	}, [sortOrder, setSortOrder, fetchArticles, selectedSource]);
	const getTitle = () => {
		switch (selectedSource.type) {
			case "all":
				return "全部文章";
			case "starred":
				return "收藏";
			case "read_later":
				return "稍后阅读";
			default:
				return "文章";
		}
	};

	return (
		<div className={cn("flex flex-col h-full", !mobile && "border-r border-[var(--border)]")}>
			{/* 列表标题栏 */}
			<div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] shrink-0">
				<div className="flex items-center gap-3">
					{/* 移动端：打开侧边栏按钮 */}
					{mobile && (
						<button
							onClick={openSidebar}
							className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors"
						>
							<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
							</svg>
						</button>
					)}
					<div>
						<h2 className="text-sm font-semibold text-[var(--text-primary)]">{getTitle()}</h2>
						{total > 0 && (
							<p className="text-[11px] text-[var(--text-tertiary)]">{total} 篇</p>
						)}
					</div>
				</div>
				{/* 控制按钮组 */}
				<div className="flex items-center gap-1">
					{/* 未读/全部切换 */}
					<button
						onClick={handleToggleUnread}
						title={showUnreadOnly ? "显示全部" : "只看未读"}
						className={cn(
							"h-7 px-2 flex items-center justify-center rounded-lg text-xs font-medium transition-colors",
							showUnreadOnly
								? "bg-[var(--accent)] text-white"
								: "text-[var(--text-tertiary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
						)}
					>
						{showUnreadOnly ? "未读" : "全部"}
					</button>

					{/* 排序切换 */}
					<button
						onClick={handleToggleSort}
						title={sortOrder === "desc" ? "最新在前" : "最旧在前"}
						className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] transition-colors"
					>
						<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
							{sortOrder === "desc" ? (
								<path d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" />
							) : (
								<path d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75V21m0 0-3.75-3.75M13.5 21l3.75-3.75" />
							)}
						</svg>
					</button>
				</div>
			</div>

			{/* 文章列表 */}
			<div
				ref={listRef}
				className="flex-1 overflow-y-auto relative"
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onMouseDown={handleTouchStart}
				onMouseMove={handleTouchMove}
				onMouseUp={handleTouchEnd}
				onMouseLeave={handleTouchEnd}
			>
				{/* 下拉刷新指示器 */}
				<div
					className="absolute left-0 right-0 flex items-center justify-center transition-transform duration-200 pointer-events-none"
					style={{
						top: -50,
						transform: `translateY(${Math.max(0, pullProgress)}px)`,
						opacity: Math.min(1, pullProgress / (pullThreshold * 0.5)),
					}}
				>
					<div className="flex items-center gap-2 text-[var(--text-secondary)]">
						{(isRefreshing || (pullProgress >= pullThreshold && isPulling)) ? (
							<>
								<div className="w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
								<span className="text-xs">{isRefreshing ? "刷新中..." : "松开刷新"}</span>
							</>
						) : (
							<>
								<svg
									className="w-4 h-4 transition-transform duration-200"
									style={{ transform: `rotate(${Math.min(180, (pullProgress / pullThreshold) * 180)}deg)` }}
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
								</svg>
								<span className="text-xs">下拉刷新</span>
							</>
						)}
					</div>
				</div>

				{isLoading && articles.length === 0 ? (
					<div>
						{Array.from({ length: 8 }).map((_, i) => (
							<ArticleCardSkeleton key={i} />
						))}
					</div>
				) : articles.length === 0 ? (
					<EmptyState
						icon="📭"
						title="暂无文章"
						description="添加订阅源后，文章将在这里显示"
						className="h-full"
					/>
				) : (
					<>
						{articles.map((article, index) => (
							<ArticleCard key={article.id} article={article} index={index} />
						))}

						{/* 无限滚动触发器 */}
						<div ref={bottomRef} className="h-4" />

						{isLoading && (
							<div className="flex justify-center py-4">
								<div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
