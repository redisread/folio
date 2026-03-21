import { useRef, useState, useCallback } from "react";
import { useUiStore } from "@/lib/store/uiStore";
import { Sidebar } from "./Sidebar";
import { ArticleList } from "./ArticleList";
import { ArticleDetail } from "./ArticleDetail";
import { cn } from "@/lib/utils/cn";

const MIN_SIDEBAR_WIDTH = 180;
const MAX_SIDEBAR_WIDTH = 320;
const MIN_LIST_WIDTH = 280;
const MAX_LIST_WIDTH = 480;

export function ThreeColumnLayout() {
	const { sidebarWidth, articleListWidth, isSidebarCollapsed, setSidebarWidth, setArticleListWidth } =
		useUiStore();

	const [isDraggingSidebar, setIsDraggingSidebar] = useState(false);
	const [isDraggingList, setIsDraggingList] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	// 拖拽侧边栏分隔线
	const handleSidebarDragStart = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			setIsDraggingSidebar(true);
			const startX = e.clientX;
			const startWidth = sidebarWidth;

			const handleMouseMove = (e: MouseEvent) => {
				const newWidth = Math.max(
					MIN_SIDEBAR_WIDTH,
					Math.min(MAX_SIDEBAR_WIDTH, startWidth + e.clientX - startX)
				);
				setSidebarWidth(newWidth);
			};

			const handleMouseUp = () => {
				setIsDraggingSidebar(false);
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};

			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		},
		[sidebarWidth, setSidebarWidth]
	);

	// 拖拽文章列表分隔线
	const handleListDragStart = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			setIsDraggingList(true);
			const startX = e.clientX;
			const startWidth = articleListWidth;

			const handleMouseMove = (e: MouseEvent) => {
				const newWidth = Math.max(
					MIN_LIST_WIDTH,
					Math.min(MAX_LIST_WIDTH, startWidth + e.clientX - startX)
				);
				setArticleListWidth(newWidth);
			};

			const handleMouseUp = () => {
				setIsDraggingList(false);
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};

			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		},
		[articleListWidth, setArticleListWidth]
	);

	return (
		<div
			ref={containerRef}
			className={cn(
				"flex h-screen w-full overflow-hidden bg-[var(--bg-main)]",
				(isDraggingSidebar || isDraggingList) && "select-none cursor-col-resize"
			)}
		>
			{/* 侧边栏 */}
			{!isSidebarCollapsed && (
				<div
					className="shrink-0 overflow-hidden"
					style={{ width: sidebarWidth }}
				>
					<Sidebar />
				</div>
			)}

			{/* 侧边栏拖拽分隔线 */}
			{!isSidebarCollapsed && (
				<div
					className={cn(
						"w-1 shrink-0 cursor-col-resize hover:bg-[var(--accent)] transition-colors",
						isDraggingSidebar && "bg-[var(--accent)]"
					)}
					onMouseDown={handleSidebarDragStart}
				/>
			)}

			{/* 文章列表 */}
			<div
				className="shrink-0 overflow-hidden"
				style={{ width: articleListWidth }}
			>
				<ArticleList />
			</div>

			{/* 文章列表拖拽分隔线 */}
			<div
				className={cn(
					"w-1 shrink-0 cursor-col-resize hover:bg-[var(--accent)] transition-colors",
					isDraggingList && "bg-[var(--accent)]"
				)}
				onMouseDown={handleListDragStart}
			/>

			{/* 文章详情（自适应剩余宽度） */}
			<div className="flex-1 overflow-hidden">
				<ArticleDetail />
			</div>
		</div>
	);
}
