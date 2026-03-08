"use client";
import { useFeedStore } from "@/lib/store/feedStore";
import { FolderItem } from "./FolderItem";
import { FeedItem } from "./FeedItem";

export function FolderTree() {
	const { folders, feeds, selectedSource } = useFeedStore();

	// 无文件夹的订阅源
	const rootFeeds = feeds.filter((f) => !f.folderId);

	return (
		<div className="space-y-0.5 px-2">
			{/* 文件夹 */}
			{folders.map((folder) => {
				const folderFeeds = feeds.filter((f) => f.folderId === folder.id);
				return <FolderItem key={folder.id} folder={folder} feeds={folderFeeds} />;
			})}

			{/* 无文件夹的订阅源 */}
			{rootFeeds.map((feed) => (
				<FeedItem
					key={feed.id}
					feed={feed}
					isSelected={selectedSource.type === "feed" && selectedSource.feedId === feed.id}
				/>
			))}
		</div>
	);
}
