import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface ContextMenuItem {
	label: string;
	icon?: string;
	onClick: () => void;
	variant?: "default" | "danger";
	disabled?: boolean;
}

interface ContextMenuProps {
	items: ContextMenuItem[];
	x: number;
	y: number;
	onClose: () => void;
}

export function ContextMenu({ items, x, y, onClose }: ContextMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				onClose();
			}
		};
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEsc);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEsc);
		};
	}, [onClose]);

	// 确保菜单不超出视口
	const adjustedX = Math.min(x, window.innerWidth - 180);
	const adjustedY = Math.min(y, window.innerHeight - items.length * 36 - 16);

	return (
		<div
			ref={menuRef}
			className="fixed z-50 min-w-[160px] rounded-lg shadow-[var(--shadow-md)] bg-[var(--bg-main)] border border-[var(--border)] py-1 animate-fade-in"
			style={{ left: adjustedX, top: adjustedY }}
		>
			{items.map((item, i) => (
				<button
					key={i}
					disabled={item.disabled}
					onClick={() => {
						if (!item.disabled) {
							item.onClick();
							onClose();
						}
					}}
					className={cn(
						"w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
						"hover:bg-[var(--bg-card-hover)]",
						item.variant === "danger"
							? "text-red-500 hover:text-red-600"
							: "text-[var(--text-primary)]",
						item.disabled && "opacity-40 cursor-not-allowed"
					)}
				>
					{item.icon && <span className="text-base">{item.icon}</span>}
					{item.label}
				</button>
			))}
		</div>
	);
}

// 右键菜单 Hook
export function useContextMenu() {
	const menuRef = useRef<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);

	const show = (e: React.MouseEvent, items: ContextMenuItem[]) => {
		e.preventDefault();
		menuRef.current = { x: e.clientX, y: e.clientY, items };
	};

	return { show, menuRef };
}
