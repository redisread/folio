"use client";
import { ThreeColumnLayout } from "@/components/layout/ThreeColumnLayout";
import { KeyboardShortcuts } from "@/components/common/KeyboardShortcuts";

export default function Home() {
	return (
		<>
			<KeyboardShortcuts />
			<ThreeColumnLayout />
		</>
	);
}
