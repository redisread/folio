"use client";

import { useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	confirmVariant?: "danger" | "primary";
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmDialog({
	isOpen,
	title,
	message,
	confirmLabel = "确认",
	cancelLabel = "取消",
	confirmVariant = "primary",
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
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
				<h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
				<p className="text-sm text-[var(--text-secondary)] mb-6">{message}</p>

				<div className="flex justify-end gap-3">
					<button
						onClick={onCancel}
						className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
					>
						{cancelLabel}
					</button>
					<button
						onClick={onConfirm}
						className={cn(
							"px-4 py-2 text-sm font-medium rounded-lg transition-colors",
							confirmVariant === "danger"
								? "bg-red-500 text-white hover:bg-red-600"
								: "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90"
						)}
					>
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}
