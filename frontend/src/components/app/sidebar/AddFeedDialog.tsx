import { useState } from "react";
import { useFeedStore } from "@/lib/store/feedStore";
import { cn } from "@/lib/utils/cn";

interface AddFeedDialogProps {
	onClose: () => void;
}

export function AddFeedDialog({ onClose }: AddFeedDialogProps) {
	const { folders, addFeed, isLoading } = useFeedStore();
	const [url, setUrl] = useState("");
	const [folderId, setFolderId] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!url.trim()) return;

		setError(null);
		try {
			await addFeed(url.trim(), folderId || undefined);
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "添加失败，请检查 URL");
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* 遮罩 */}
			<div
				className="absolute inset-0 bg-black/30 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* 弹窗 */}
			<div className="relative w-full max-w-md mx-4 bg-[var(--bg-main)] rounded-2xl shadow-[var(--shadow-md)] border border-[var(--border)] animate-fade-in">
				{/* 标题 */}
				<div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
					<h2 className="text-base font-semibold text-[var(--text-primary)]">添加订阅源</h2>
					<button
						onClick={onClose}
						className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--bg-card-hover)] text-[var(--text-tertiary)] transition-colors"
					>
						<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path d="M18 6 6 18M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* 表单 */}
				<form onSubmit={handleSubmit} className="p-5 space-y-4">
					<div>
						<label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
							RSS/Atom Feed URL 或网站 URL
						</label>
						<input
							autoFocus
							type="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://example.com/feed.xml"
							className={cn(
								"w-full px-3 py-2.5 rounded-lg text-sm",
								"bg-[var(--bg-card-hover)] border border-[var(--border)]",
								"text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
								"outline-none focus:border-[var(--accent)] focus:bg-[var(--bg-main)]",
								"transition-all duration-[var(--transition-base)]"
							)}
						/>
					</div>

					<div>
						<label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
							添加到文件夹（可选）
						</label>
						<select
							value={folderId}
							onChange={(e) => setFolderId(e.target.value)}
							className={cn(
								"w-full px-3 py-2.5 rounded-lg text-sm",
								"bg-[var(--bg-card-hover)] border border-[var(--border)]",
								"text-[var(--text-primary)] outline-none",
								"focus:border-[var(--accent)] transition-all duration-[var(--transition-base)]"
							)}
						>
							<option value="">不添加到文件夹</option>
							{folders.map((folder) => (
								<option key={folder.id} value={folder.id}>
									{folder.name}
								</option>
							))}
						</select>
					</div>

					{error && (
						<p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
							{error}
						</p>
					)}

					<div className="flex gap-2 pt-1">
						<button
							type="button"
							onClick={onClose}
							className={cn(
								"flex-1 px-4 py-2.5 rounded-lg text-sm font-medium",
								"bg-[var(--bg-card-hover)] text-[var(--text-secondary)]",
								"hover:bg-[var(--border)] transition-colors"
							)}
						>
							取消
						</button>
						<button
							type="submit"
							disabled={isLoading || !url.trim()}
							className={cn(
								"flex-1 px-4 py-2.5 rounded-lg text-sm font-medium",
								"bg-[var(--accent)] text-white",
								"hover:bg-[var(--accent-hover)] transition-colors",
								"disabled:opacity-50 disabled:cursor-not-allowed"
							)}
						>
							{isLoading ? "添加中…" : "添加"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
