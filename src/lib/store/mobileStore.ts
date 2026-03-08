import { create } from "zustand";

export type MobileView = "sidebar" | "list" | "detail";

interface MobileState {
	// 当前视图
	currentView: MobileView;
	// 上一个视图（用于返回）
	previousView: MobileView | null;
	// 是否是移动端
	isMobile: boolean;
	// 侧边栏是否打开（仅移动端）
	isSidebarOpen: boolean;
	// 文章列表是否显示（用于切换）
	isListVisible: boolean;

	// 方法
	setCurrentView: (view: MobileView) => void;
	goBack: () => void;
	checkMobile: () => void;
	toggleSidebar: () => void;
	openSidebar: () => void;
	closeSidebar: () => void;
	showList: () => void;
	showDetail: () => void;
}

const MOBILE_BREAKPOINT = 1024; // lg breakpoint

export const useMobileStore = create<MobileState>((set, get) => ({
	currentView: "list",
	previousView: null,
	isMobile: false,
	isSidebarOpen: false,
	isListVisible: true,

	setCurrentView: (view) => {
		const { currentView } = get();
		if (currentView !== view) {
			set({ previousView: currentView, currentView: view });
		}
	},

	goBack: () => {
		const { previousView } = get();
		if (previousView) {
			set({ currentView: previousView, previousView: null });
		} else {
			// 默认返回到列表
			set({ currentView: "list" });
		}
	},

	checkMobile: () => {
		if (typeof window !== "undefined") {
			const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
			set({ isMobile });
		}
	},

	toggleSidebar: () => {
		set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
	},

	openSidebar: () => {
		set({ isSidebarOpen: true });
	},

	closeSidebar: () => {
		set({ isSidebarOpen: false });
	},

	showList: () => {
		set({ currentView: "list", isListVisible: true });
	},

	showDetail: () => {
		set({ currentView: "detail", previousView: "list" });
	},
}));

// 初始化移动端检测
export function initMobileCheck() {
	if (typeof window !== "undefined") {
		const check = () => useMobileStore.getState().checkMobile();
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}
	return () => {};
}
