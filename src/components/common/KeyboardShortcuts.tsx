"use client";
import { useEffect } from "react";
import { useArticleStore } from "@/lib/store/articleStore";
import { useFeedStore } from "@/lib/store/feedStore";
import { useUiStore } from "@/lib/store/uiStore";

export function KeyboardShortcuts() {
	const { navigateArticle, toggleStarred, toggleReadLater, selectedArticleId, selectedArticle } =
		useArticleStore();
	const { refresh } = useFeedStore();
	const { setActiveColumn, setSearchQuery } = useUiStore();

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// 忽略输入框中的按键
			const target = e.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				return;
			}

			switch (e.key) {
				case "j":
				case "J":
					e.preventDefault();
					navigateArticle("next");
					break;
				case "k":
				case "K":
					e.preventDefault();
					navigateArticle("prev");
					break;
				case "s":
				case "S":
					if (selectedArticleId) {
						e.preventDefault();
						toggleStarred(selectedArticleId);
					}
					break;
				case "l":
				case "L":
					if (selectedArticleId) {
						e.preventDefault();
						toggleReadLater(selectedArticleId);
					}
					break;
				case "v":
				case "V":
					if (selectedArticle?.url) {
						e.preventDefault();
						window.open(selectedArticle.url, "_blank", "noopener,noreferrer");
					}
					break;
				case "r":
				case "R":
					if (!e.metaKey && !e.ctrlKey) {
						e.preventDefault();
						refresh();
					}
					break;
				case "/":
					e.preventDefault();
					setActiveColumn("sidebar");
					setSearchQuery("");
					// 聚焦搜索框
					setTimeout(() => {
						const searchInput = document.querySelector<HTMLInputElement>("[data-search-input]");
						searchInput?.focus();
					}, 50);
					break;
				case "1":
					if (!e.metaKey && !e.ctrlKey) {
						e.preventDefault();
						setActiveColumn("sidebar");
					}
					break;
				case "2":
					if (!e.metaKey && !e.ctrlKey) {
						e.preventDefault();
						setActiveColumn("list");
					}
					break;
				case "3":
					if (!e.metaKey && !e.ctrlKey) {
						e.preventDefault();
						setActiveColumn("detail");
					}
					break;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		navigateArticle,
		toggleStarred,
		toggleReadLater,
		selectedArticleId,
		selectedArticle,
		refresh,
		setActiveColumn,
		setSearchQuery,
	]);

	return null;
}
