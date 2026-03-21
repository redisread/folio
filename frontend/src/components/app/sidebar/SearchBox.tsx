import { useRef } from "react";
import { useUiStore } from "@/lib/store/uiStore";
import { cn } from "@/lib/utils/cn";

export function SearchBox() {
	const { searchQuery, setSearchQuery } = useUiStore();
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<div className="relative px-3 py-2">
			<div
				className={cn(
					"flex items-center gap-2 px-3 py-1.5 rounded-lg",
					"bg-[var(--bg-card-hover)] border border-transparent",
					"transition-all duration-[var(--transition-base)]",
					"focus-within:border-[var(--accent)] focus-within:bg-[var(--bg-main)]"
				)}
			>
				<svg
					className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth={2}
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.35-4.35" />
				</svg>
				<input
					ref={inputRef}
					data-search-input
					type="text"
					placeholder="搜索文章…"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className={cn(
						"flex-1 bg-transparent text-xs text-[var(--text-primary)]",
						"placeholder:text-[var(--text-tertiary)] outline-none"
					)}
				/>
				{searchQuery && (
					<button
						onClick={() => setSearchQuery("")}
						className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
					>
						<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path d="M18 6 6 18M6 6l12 12" />
						</svg>
					</button>
				)}
			</div>
		</div>
	);
}
