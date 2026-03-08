"use client";
import { ArticleReader } from "@/components/article/ArticleReader";
import { EmptyState } from "@/components/common/EmptyState";
import { useArticleStore } from "@/lib/store/articleStore";

export function ArticleDetail() {
	const { selectedArticleId } = useArticleStore();

	if (!selectedArticleId) {
		return (
			<div className="flex-1 flex items-center justify-center bg-[var(--bg-main)]">
				<EmptyState
					icon="📖"
					title="选择一篇文章"
					description="从左侧列表点击文章即可开始阅读"
				/>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col h-full bg-[var(--bg-main)]">
			<ArticleReader />
		</div>
	);
}
