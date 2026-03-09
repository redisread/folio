"use client";
import { useState, useRef, useCallback } from "react";
import { useFeedStore } from "@/lib/store/feedStore";
import { useArticleStore } from "@/lib/store/articleStore";
import { ContextMenu, type ContextMenuItem } from "@/components/common/ContextMenu";
import { EditFeedDialog } from "@/components/common/EditFeedDialog";
import { cn } from "@/lib/utils/cn";
import type { FeedWithUnreadCount } from "@/lib/db/schema";

interface FeedItemProps {
	feed: FeedWithUnreadCount;
	isSelected: boolean;
}

const LONG_PRESS_DURATION = 400; // 长按触发时间（毫秒）

export function FeedItem({ feed, isSelected }: FeedItemProps) {
	const { selectedSource, setSelectedSource, deleteFeed, updateFeed } = useFeedStore();
	const { fetchArticles } = useArticleStore();
	const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
	const [isPressing, setIsPressing] = useState(false);
	const [showEditDialog, setShowEditDialog] = useState(false);

	const longPressTimer = useRef<NodeJS.Timeout | null>(null);
	const startPos = useRef<{ x: number; y: number } | null>(null);
	const hasTriggeredLongPress = useRef(false);

	const handleClick = () => {
		if (hasTriggeredLongPress.current) {
			hasTriggeredLongPress.current = false;
			return;
		}
		const source = { type: "feed" as const, feedId: feed.id };
		setSelectedSource(source);
		fetchArticles(source);
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		setContextMenu({ x: e.clientX, y: e.clientY });
	};

	const handleLongPress = useCallback((clientX: number, clientY: number) => {
		hasTriggeredLongPress.current = true;
		setIsPressing(false);
		// 显示在长按位置或元素中心
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
		// 延迟重置，防止触发点击
		setTimeout(() => {
			hasTriggeredLongPress.current = false;
		}, 50);
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		if (e.button !== 0) return; // 只响应左键
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

	const handleEditClick = () => {
		setContextMenu(null);
		setShowEditDialog(true);
	};

	const handleEditConfirm = async (title: string, url: string) => {
		await updateFeed(feed.id, { title, url });
		setShowEditDialog(false);
	};

	const menuItems: ContextMenuItem[] = [
		{
			label: "编辑",
			icon: "✏️",
			onClick: handleEditClick,
		},
		{
			label: "刷新",
			icon: "↻",
			onClick: () => {
				import("@/lib/store/feedStore").then(({ useFeedStore }) => {
					useFeedStore.getState().refresh(feed.id);
				});
			},
		},
		{
			label: "在浏览器中打开",
			icon: "↗",
			onClick: () => window.open(feed.url, "_blank", "noopener,noreferrer"),
		},
		{
			label: "删除订阅源",
			icon: "🗑",
			variant: "danger",
			onClick: () => deleteFeed(feed.id),
		},
	];

	return (
		<>
			<button
				onClick={handleClick}
				onContextMenu={handleContextMenu}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}
				className={cn(
					"w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm relative",
					"transition-all duration-[var(--transition-base)]",
					"select-none [-webkit-user-select:none] [-webkit-touch-callout:none] [touch-action:manipulation]",
					isSelected
						? "bg-[var(--accent-light)] text-[var(--accent)]"
						: "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]",
					isPressing && "scale-[0.98] bg-[var(--bg-card-hover)]"
				)}
			>
				{/* Favicon */}
				<span className="w-4 h-4 shrink-0 flex items-center justify-center">
					{feed.faviconUrl ? (
						<img
							src={feed.faviconUrl}
							alt=""
							className="w-4 h-4 rounded-sm object-contain"
							onError={(e) => {
								(e.target as HTMLImageElement).style.display = "none";
							}}
						/>
					) : (
						<span className="w-4 h-4 rounded-sm bg-[var(--bg-card-hover)] flex items-center justify-center text-[8px] text-[var(--text-tertiary)] font-bold uppercase">
							{feed.title.charAt(0)}
						</span>
					)}
				</span>

				{/* 名称 */}
				<span className="flex-1 text-left truncate">{feed.title}</span>

				{/* 未读数 */}
				{(feed.unreadCount ?? 0) > 0 && (
					<span
						className={cn(
							"text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0",
							isSelected
								? "bg-[var(--accent)] text-white"
								: "bg-[var(--bg-card-hover)] text-[var(--text-tertiary)]"
						)}
					>
						{feed.unreadCount}
					</span>
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
			</button>

			<style jsx>{`
				@keyframes longPress {
					from { transform: scaleX(0); transform-origin: left; }
					to { transform: scaleX(1); transform-origin: left; }
				}
			`}</style>

			{contextMenu && (
				<ContextMenu
					items={menuItems}
					x={contextMenu.x}
					y={contextMenu.y}
					onClose={() => setContextMenu(null)}
				/>
			)}

			<EditFeedDialog
				isOpen={showEditDialog}
				feedTitle={feed.title}
				feedUrl={feed.url}
				onConfirm={handleEditConfirm}
				onCancel={() => setShowEditDialog(false)}
			/>
		</>
	);
}
