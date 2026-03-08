"use client";
import { ResponsiveLayout } from "@/components/layout/ResponsiveLayout";
import { KeyboardShortcuts } from "@/components/common/KeyboardShortcuts";

export default function Home() {
	return (
		<>
			<KeyboardShortcuts />
			<ResponsiveLayout />
		</>
	);
}
