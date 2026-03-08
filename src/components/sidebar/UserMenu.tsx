"use client";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function UserMenu() {
	const { data: session } = useSession();
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut();
		router.push("/login");
	};

	return (
		<div className="flex items-center gap-2 px-3 py-2 border-t border-[var(--border-light)]">
			<span className="text-xs text-[var(--text-tertiary)] truncate flex-1">
				{session?.user?.email ?? ""}
			</span>
			<button
				onClick={handleSignOut}
				title="退出登录"
				className="text-xs text-[var(--text-tertiary)] hover:text-red-500 transition-colors shrink-0"
			>
				退出
			</button>
		</div>
	);
}
