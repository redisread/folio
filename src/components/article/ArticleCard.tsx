"use client";
import { useState, useRef, useCallback } from "react";
import { useArticleStore, type ArticleListItem } from "@/lib/store/articleStore";
import { useFeedStore } from "@/lib/store/feedStore";
import { useMobileStore } from "@/lib/store/mobileStore";
import { ContextMenu, type ContextMenuItem } from "@/components/common/ContextMenu";
import { formatRelativeTime } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

interface ArticleCardProps {
	article: ArticleListItem;
	index: number;
}

const LONG_PRESS_DURATION = 400; // 长按触发时间（毫秒）

export function ArticleCard({ article, index }: ArticleCardProps) {
	const { selectedArticleId, selectArticle, markRead } = useArticleStore();
	const { feeds } = useFeedStore();
	const { isMobile, showDetail } = useMobileStore();
	const isSelected = selectedArticleId === article.id;
	const [isPressing, setIsPressing] = useState(false);
	const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

	const longPressTimer = useRef<NodeJS.Timeout | null>(null);
	const startPos = useRef<{ x: number; y: number } | null>(null);
	const hasTriggeredLongPress = useRef(false);

	const feed = feeds.find((f) => f.id === article.feedId);

	const handleClick = () => {
		if (hasTriggeredLongPress.current) {
			hasTriggeredLongPress.current = false;
			return;
		}
		selectArticle(article.id);
		// On mobile, switch to detail view when selecting an article
		if (isMobile) {
			showDetail();
		}
	};

	const handleLongPress = useCallback((clientX: number, clientY: number) => {
		hasTriggeredLongPress.current = true;
		setIsPressing(false);
		// 显示操作菜单
		setContextMenu({ x: clientX, y: clientY });
	}, []);

	const startLongPress = useCallback((e: React.TouchEvent | React.MouseEvent) => {
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

		startPos.current = { x: clientX, y: clientY };
		hasTriggeredLongPress.current = false;
		setIsPressing(true);

		longPressTimer.current = setTimeout(() => {
			handleLongPress(clientX, clientY);
		}, LONG_PRESS_DURATION);
	}, [handleLongPress]);

	const cancelLongPress = useCallback(() => {
		if (longPressTimer.current) {
			clearTimeout(longPressTimer.current);
			longPressTimer.current = null;
		}
		setIsPressing(false);
	}, []);

	const handleTouchStart = (e: React.TouchEvent) => {
		startLongPress(e);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!startPos.current) return;

		const touch = e.touches[0];
		const deltaX = Math.abs(touch.clientX - startPos.current.x);
		const deltaY = Math.abs(touch.clientY - startPos.current.y);

		// 如果移动超过 10px，取消长按
		if (deltaX > 10 || deltaY > 10) {
			cancelLongPress();
		}
	};

	const handleTouchEnd = () => {
		cancelLongPress();
		setTimeout(() => {
			hasTriggeredLongPress.current = false;
		}, 50);
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.button !== 0) return;
		startLongPress(e);
	};

	const handleMouseUp = () => {
		cancelLongPress();
		setTimeout(() => {
			hasTriggeredLongPress.current = false;
		}, 50);
	};

	const handleMouseLeave = () => {
		cancelLongPress();
		hasTriggeredLongPress.current = false;
	};

	const handleMarkRead = async () => {
		await markRead(article.id, true);
		setContextMenu(null);
	};

	const handleMarkUnread = async () => {
		await markRead(article.id, false);
		setContextMenu(null);
	};

	const menuItems: ContextMenuItem[] = article.isRead
		? [
				{
					label: "标记为未读",
					icon: "🔵",
					onClick: handleMarkUnread,
				},
		  ]
		: [
				{
					label: "标记为已读",
					icon: "✓",
					onClick: handleMarkRead,
				},
		  ];

	return (
		<>
			<button
				onClick={handleClick}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}
				className={cn(
					"w-full text-left px-4 py-3 border-b border-[var(--border-light)] relative",
					"transition-all duration-[var(--transition-base)]",
					"hover:bg-[var(--bg-card-hover)]",
					"select-none [-webkit-user-select:none] [-webkit-touch-callout:none] [touch-action:manipulation]",
					isSelected && "bg-[var(--bg-card-selected)]",
					!article.isRead && "relative",
					isPressing && "scale-[0.99] bg-[var(--bg-card-hover)]"
				)}
				style={{ animationDelay: `${index * 30}ms` }}
			>
				{/* 未读指示点 */}
				{!article.isRead && (
					<span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
				)}

				{/* 长按进度指示器 */}
				{isPressing && (
					<div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
						<div
							className="absolute bottom-0 left-0 h-0.5 bg-[var(--accent)] transition-all duration-100"
							style={{
								width: "100%",
								animation: `longPress ${LONG_PRESS_DURATION}ms linear forwards`,
							}}
						/>
					</div>
				)}

				<style jsx>{`
					@keyframes longPress {
						from { transform: scaleX(0); transform-origin: left; }
						to { transform: scaleX(1); transform-origin: left; }
					}
				`}</style>

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

			{contextMenu && (
				<ContextMenu
					items={menuItems}
					x={contextMenu.x}
					y={contextMenu.y}
					onClose={() => setContextMenu(null)}
				/>
			)}
		</>
	);
}
