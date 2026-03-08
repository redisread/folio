"use client";
import { useState } from "react";
import { useFeedStore } from "@/lib/store/feedStore";
import { useArticleStore } from "@/lib/store/articleStore";
import { ContextMenu, type ContextMenuItem } from "@/components/common/ContextMenu";
import { cn } from "@/lib/utils/cn";
import type { FeedWithUnreadCount } from "@/lib/db/schema";

interface FeedItemProps {
	feed: FeedWithUnreadCount;
	isSelected: boolean;
}

export function FeedItem({ feed, isSelected }: FeedItemProps) {
	const { selectedSource, setSelectedSource, deleteFeed } = useFeedStore();
	const { fetchArticles } = useArticleStore();
	const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

	const handleClick = () => {
		const source = { type: "feed" as const, feedId: feed.id };
		setSelectedSource(source);
		fetchArticles(source);
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		setContextMenu({ x: e.clientX, y: e.clientY });
	};

	const menuItems: ContextMenuItem[] = [
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
				className={cn(
					"w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm",
					"transition-all duration-[var(--transition-base)]",
					isSelected
						? "bg-[var(--accent-light)] text-[var(--accent)]"
						: "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
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
