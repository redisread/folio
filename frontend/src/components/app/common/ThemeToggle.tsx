import { useEffect } from "react";
import { useUiStore, type ThemeMode } from "@/lib/store";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle() {
	const { theme, setTheme } = useUiStore();

	// 应用主题到 document
	useEffect(() => {
		const root = document.documentElement;
		const applyTheme = (isDark: boolean) => {
			root.classList.toggle("dark", isDark);
		};

		if (theme === "system") {
			const mq = window.matchMedia("(prefers-color-scheme: dark)");
			applyTheme(mq.matches);
			const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
			mq.addEventListener("change", handler);
			return () => mq.removeEventListener("change", handler);
		} else {
			applyTheme(theme === "dark");
		}
	}, [theme]);

	const options: { value: ThemeMode; label: string; icon: string }[] = [
		{ value: "light", label: "亮色", icon: "☀️" },
		{ value: "dark", label: "暗色", icon: "🌙" },
		{ value: "system", label: "跟随系统", icon: "💻" },
	];

	return (
		<div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-card-hover)]">
			{options.map((opt) => (
				<button
					key={opt.value}
					onClick={() => setTheme(opt.value)}
					title={opt.label}
					className={cn(
						"px-2 py-1 rounded-md text-xs transition-all duration-[var(--transition-base)]",
						theme === opt.value
							? "bg-[var(--bg-main)] text-[var(--text-primary)] shadow-sm"
							: "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
					)}
				>
					{opt.icon}
				</button>
			))}
		</div>
	);
}
