import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
	icon?: string;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-3 p-8 text-center",
				className
			)}
		>
			{icon && <span className="text-4xl opacity-40">{icon}</span>}
			<div className="space-y-1">
				<p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
				{description && (
					<p className="text-xs text-[var(--text-secondary)]">{description}</p>
				)}
			</div>
			{action}
		</div>
	);
}
