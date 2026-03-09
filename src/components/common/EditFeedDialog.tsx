"use client";

import { useEffect, useCallback, useState } from "react";

interface EditFeedDialogProps {
	isOpen: boolean;
	feedTitle: string;
	feedUrl: string;
	onConfirm: (title: string, url: string) => void;
	onCancel: () => void;
}

export function EditFeedDialog({
	isOpen,
	feedTitle,
	feedUrl,
	onConfirm,
	onCancel,
}: EditFeedDialogProps) {
	const [title, setTitle] = useState(feedTitle);
	const [url, setUrl] = useState(feedUrl);
	const [titleError, setTitleError] = useState("");
	const [urlError, setUrlError] = useState("");

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

	// 重置表单
	useEffect(() => {
		if (isOpen) {
			setTitle(feedTitle);
			setUrl(feedUrl);
			setTitleError("");
			setUrlError("");
		}
	}, [isOpen, feedTitle, feedUrl]);

	const validate = () => {
		let isValid = true;
		setTitleError("");
		setUrlError("");

		if (!title.trim()) {
			setTitleError("请输入订阅源名称");
			isValid = false;
		}

		if (!url.trim()) {
			setUrlError("请输入订阅链接");
			isValid = false;
		} else {
			try {
				new URL(url.trim());
			} catch {
				setUrlError("请输入有效的 URL");
				isValid = false;
			}
		}

		return isValid;
	};

	const handleSubmit = () => {
		if (validate()) {
			onConfirm(title.trim(), url.trim());
		}
	};

	const handleKeyDownInput = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSubmit();
		}
	};

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
				<h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
					编辑订阅源
				</h3>

				<div className="space-y-4 mb-6">
					{/* 名称输入 */}
					<div>
						<label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
							名称
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							onKeyDown={handleKeyDownInput}
							placeholder="订阅源名称"
							className="w-full px-3 py-2 bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors"
						/>
						{titleError && (
							<p className="mt-1 text-xs text-red-500">{titleError}</p>
						)}
					</div>

					{/* URL 输入 */}
					<div>
						<label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
							订阅链接
						</label>
						<input
							type="text"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							onKeyDown={handleKeyDownInput}
							placeholder="https://example.com/rss"
							className="w-full px-3 py-2 bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors"
						/>
						{urlError && (
							<p className="mt-1 text-xs text-red-500">{urlError}</p>
						)}
					</div>
				</div>

				<div className="flex justify-end gap-3">
					<button
						onClick={onCancel}
						className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
					>
						取消
					</button>
					<button
						onClick={handleSubmit}
						className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 rounded-lg transition-colors"
					>
						保存
					</button>
				</div>
			</div>
		</div>
	);
}
