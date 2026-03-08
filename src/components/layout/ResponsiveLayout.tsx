"use client";
import { useEffect } from "react";
import { useMobileStore, initMobileCheck } from "@/lib/store/mobileStore";
import { DesktopLayout } from "./DesktopLayout";
import { MobileLayout } from "./MobileLayout";

export function ResponsiveLayout() {
	const { isMobile } = useMobileStore();

	useEffect(() => {
		const cleanup = initMobileCheck();
		return cleanup;
	}, []);

	return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
