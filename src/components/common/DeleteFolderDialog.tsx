"use client";

import { useEffect, useCallback, useState } from "react";
import { cn } from "@/lib/utils/cn";

export type DeleteFolderMode = "folder_only" | "folder_and_feeds";

interface DeleteFolderDialogProps {
	isOpen: boolean;
	folderName: string;
	feedCount: number;
	onConfirm: (mode: DeleteFolderMode) => void;
	onCancel: () => void;
}

export function DeleteFolderDialog({
	isOpen,
	folderName,
	feedCount,
	onConfirm,
	onCancel,
}: DeleteFolderDialogProps) {
	const [selectedMode, setSelectedMode] = useState<DeleteFolderMode>("folder_only");

	// ESC 关闭
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape") onCancel();
		},
		[onCancel]
	);

	useEffect(() => {
		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			return () => document.removeEventListener("keydown", handleKeyDown);
		}
	}, [isOpen, handleKeyDown]);

	// 重置选择状态
	useEffect(() => {
		if (isOpen) setSelectedMode("folder_only");
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			onClick={onCancel}
		>
			{/* 遮罩 */}
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

			{/* 弹窗 */}
			<div
				className="relative w-full max-w-sm bg-[var(--bg-card)] rounded-xl shadow-xl border border-[var(--border)] p-6 animate-in fade-in zoom-in-95 duration-200"
				onClick={(e) => e.stopPropagation()}
			>
				<h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
					删除文件夹
				</h3>

				{feedCount > 0 ? (
					<>
						<p className="text-sm text-[var(--text-secondary)] mb-4">
							文件夹 "{folderName}" 下有 {feedCount} 个订阅源，请选择删除方式：
						</p>

						<div className="space-y-3 mb-6">
							<label
								className={cn(
									"flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
									selectedMode === "folder_only"
										? "border-[var(--accent)] bg-[var(--accent-light)]/50"
										: "border-[var(--border)] hover:bg-[var(--bg-card-hover)]"
								)}
							>
								<input
									type="radio"
									name="deleteMode"
									value="folder_only"
									checked={selectedMode === "folder_only"}
									onChange={() => setSelectedMode("folder_only")}
									className="mt-0.5"
								/>
								<div>
									<div className="text-sm font-medium text-[var(--text-primary)]">
										仅删除文件夹
									</div>
									<div className="text-xs text-[var(--text-secondary)]">
										订阅源将变为未归类状态
									</div>
								</div>
							</label>

							<label
								className={cn(
									"flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
									selectedMode === "folder_and_feeds"
										? "border-red-500 bg-red-50/50 dark:bg-red-900/20"
										: "border-[var(--border)] hover:bg-[var(--bg-card-hover)]"
								)}
							>
								<input
									type="radio"
									name="deleteMode"
									value="folder_and_feeds"
									checked={selectedMode === "folder_and_feeds"}
									onChange={() => setSelectedMode("folder_and_feeds")}
									className="mt-0.5"
								/>
								<div>
									<div className="text-sm font-medium text-red-600 dark:text-red-400">
										删除文件夹及所有订阅源
									</div>
									<div className="text-xs text-[var(--text-secondary)]">
										此操作不可恢复
									</div>
								</div>
							</label>
						</div>
						</>
				) : (
					<p className="text-sm text-[var(--text-secondary)] mb-6">
						确认删除文件夹 "{folderName}" 吗？此操作不可恢复。
					</p>
				)}

				<div className="flex justify-end gap-3">
					<button
						onClick={onCancel}
						className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
					>
						取消
					</button>
					<button
						onClick={() => onConfirm(selectedMode)}
						className={cn(
							"px-4 py-2 text-sm font-medium rounded-lg transition-colors",
							selectedMode === "folder_and_feeds" || feedCount === 0
								? "bg-red-500 text-white hover:bg-red-600"
								: "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
						)}
					>
						{feedCount === 0 ? "删除" : selectedMode === "folder_and_feeds" ? "删除全部" : "仅删除文件夹"}
					</button>
				</div>
			</div>
		</div>
	);
}
