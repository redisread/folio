"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMobileStore } from "@/lib/store/mobileStore";
import { Sidebar } from "../sidebar/Sidebar";
import { ArticleList } from "./ArticleList";
import { ArticleDetail } from "./ArticleDetail";
import { cn } from "@/lib/utils/cn";

// 移动端布局 - 单栏视图切换
export function MobileLayout() {
	const { currentView, isSidebarOpen, closeSidebar } = useMobileStore();

	// 处理返回键（浏览器/设备）
	useEffect(() => {
		const handlePopState = () => {
			const { goBack, currentView } = useMobileStore.getState();
			if (currentView !== "list") {
				goBack();
			}
		};

		window.addEventListener("popstate", handlePopState);
		return () => window.removeEventListener("popstate", handlePopState);
	}, []);

	return (
		<div className="relative h-screen w-full overflow-hidden bg-[var(--bg-main)]">
			{/* 侧边栏抽屉（遮罩层） */}
			<AnimatePresence>
				{isSidebarOpen && (
					<>
						{/* 遮罩 */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="absolute inset-0 z-40 bg-black/50"
							onClick={closeSidebar}
						/>
						{/* 侧边栏 */}
						<motion.div
							initial={{ x: "-100%" }}
							animate={{ x: 0 }}
							exit={{ x: "-100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="absolute left-0 top-0 bottom-0 z-50 w-[280px] bg-[var(--bg-sidebar)] shadow-xl"
						>
							<Sidebar mobile />
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* 主内容区 - 根据当前视图切换 */}
			<div className="relative h-full w-full">
				{/* 文章列表视图 */}
				<motion.div
					className={cn(
						"absolute inset-0 z-10",
						currentView !== "list" && "pointer-events-none"
					)}
					animate={{
						x: currentView === "list" ? 0 : currentView === "detail" ? "-20%" : 0,
						opacity: currentView === "list" ? 1 : 0.5,
					}}
					transition={{ type: "spring", damping: 30, stiffness: 300 }}
				>
					<ArticleList mobile />
				</motion.div>

				{/* 文章详情视图 - 从右侧滑入 */}
				<AnimatePresence>
					{currentView === "detail" && (
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
							className="absolute inset-0 z-20 bg-[var(--bg-main)]"
						>
							<ArticleDetail mobile />
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
