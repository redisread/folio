"use client";
import { useState, useRef, useCallback } from "react";
import { useFeedStore } from "@/lib/store/feedStore";
import { useArticleStore } from "@/lib/store/articleStore";
import { FeedItem } from "./FeedItem";
import { ContextMenu, type ContextMenuItem } from "@/components/common/ContextMenu";
import { DeleteFolderDialog, type DeleteFolderMode } from "@/components/common/DeleteFolderDialog";
import { cn } from "@/lib/utils/cn";
import type { Folder, FeedWithUnreadCount } from "@/lib/db/schema";

interface FolderItemProps {
	folder: Folder;
	feeds: FeedWithUnreadCount[];
}

const LONG_PRESS_DURATION = 400; // 长按触发时间（毫秒）

export function FolderItem({ folder, feeds }: FolderItemProps) {
	const { selectedSource, setSelectedSource, toggleFolderCollapsed, deleteFolder, deleteFolderWithMode, renameFolder } =
		useFeedStore();
	const { fetchArticles } = useArticleStore();
	const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
	const [isRenaming, setIsRenaming] = useState(false);
	const [renameValue, setRenameValue] = useState(folder.name);
	const [isPressing, setIsPressing] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const longPressTimer = useRef<NodeJS.Timeout | null>(null);
	const startPos = useRef<{ x: number; y: number } | null>(null);
	const hasTriggeredLongPress = useRef(false);

	const isCollapsed = folder.isCollapsed ?? false;
	const isFolderSelected = selectedSource.type === "folder" && selectedSource.folderId === folder.id;
	const totalUnread = feeds.reduce((sum, f) => sum + (f.unreadCount ?? 0), 0);

	const handleFolderClick = () => {
		if (hasTriggeredLongPress.current) {
			hasTriggeredLongPress.current = false;
			return;
		}
		if (isRenaming) return;
		const source = { type: "folder" as const, folderId: folder.id };
		setSelectedSource(source);
		fetchArticles(source);
	};

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		toggleFolderCollapsed(folder.id);
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		setContextMenu({ x: e.clientX, y: e.clientY });
	};

	const handleLongPress = useCallback((clientX: number, clientY: number) => {
		hasTriggeredLongPress.current = true;
		setIsPressing(false);
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

	const handleRenameSubmit = async () => {
		if (renameValue.trim() && renameValue !== folder.name) {
			await renameFolder(folder.id, renameValue.trim());
		}
		setIsRenaming(false);
	};

	const handleDeleteClick = () => {
		setContextMenu(null);
		setShowDeleteDialog(true);
	};

	const handleDeleteConfirm = async (mode: DeleteFolderMode) => {
		await deleteFolderWithMode(folder.id, mode);
		setShowDeleteDialog(false);
	};

	const menuItems: ContextMenuItem[] = [
		{
			label: "重命名",
			icon: "✏️",
			onClick: () => {
				setRenameValue(folder.name);
				setIsRenaming(true);
			},
		},
		{
			label: "删除文件夹",
			icon: "🗑",
			variant: "danger",
			onClick: handleDeleteClick,
		},
	];

	return (
		<div>
			{/* 文件夹头部 */}
			<div
				className={cn(
					"flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer relative",
					"transition-all duration-[var(--transition-base)]",
					"select-none [-webkit-user-select:none] [-webkit-touch-callout:none] [touch-action:manipulation]",
					isFolderSelected
						? "bg-[var(--accent-light)] text-[var(--accent)]"
						: "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]",
					isPressing && "scale-[0.98] bg-[var(--bg-card-hover)]"
				)}
				onClick={handleFolderClick}
				onContextMenu={handleContextMenu}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onMouseDown={handleMouseDown}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseLeave}
			>
				{/* 折叠箭头 */}
				<button
					onClick={handleToggle}
					className={cn(
						"w-4 h-4 flex items-center justify-center shrink-0",
						"transition-transform duration-[var(--transition-base)]",
						!isCollapsed && "rotate-90"
					)}
				>
					<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
						<path d="m9 18 6-6-6-6" />
					</svg>
				</button>

				{/* 颜色点 */}
				<span
					className="w-2 h-2 rounded-full shrink-0"
					style={{ backgroundColor: folder.color ?? "#777777" }}
				/>

				{/* 名称 */}
				{isRenaming ? (
					<input
						autoFocus
						value={renameValue}
						onChange={(e) => setRenameValue(e.target.value)}
						onBlur={handleRenameSubmit}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleRenameSubmit();
							if (e.key === "Escape") setIsRenaming(false);
						}}
						onClick={(e) => e.stopPropagation()}
						className="flex-1 bg-transparent text-sm outline-none border-b border-[var(--accent)]"
					/>
				) : (
					<span className="flex-1 text-sm truncate">{folder.name}</span>
				)}

				{/* 未读数 */}
				{totalUnread > 0 && (
					<span
						className={cn(
							"text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0",
							isFolderSelected
								? "bg-[var(--accent)] text-white"
								: "bg-[var(--bg-card-hover)] text-[var(--text-tertiary)]"
						)}
					>
						{totalUnread}
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
			</div>

			<style jsx>{`
				@keyframes longPress {
					from { transform: scaleX(0); transform-origin: left; }
					to { transform: scaleX(1); transform-origin: left; }
				}
			`}</style>

			{/* 订阅源列表（展开时显示） */}
			{!isCollapsed && feeds.length > 0 && (
				<div className="ml-3 pl-2 border-l border-[var(--border-light)]">
					{feeds.map((feed) => (
						<FeedItem
							key={feed.id}
							feed={feed}
							isSelected={
								selectedSource.type === "feed" && selectedSource.feedId === feed.id
							}
						/>
					))}
				</div>
			)}

			{contextMenu && (
				<ContextMenu
					items={menuItems}
					x={contextMenu.x}
					y={contextMenu.y}
					onClose={() => setContextMenu(null)}
				/>
			)}

			<DeleteFolderDialog
				isOpen={showDeleteDialog}
				folderName={folder.name}
				feedCount={feeds.length}
				onConfirm={handleDeleteConfirm}
				onCancel={() => setShowDeleteDialog(false)}
			/>
		</div>
	);
}
