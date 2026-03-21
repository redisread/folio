// 前端共用类型定义（对应后端 API 响应结构）

export interface Folder {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  icon: string | null;
  sortOrder: number | null;
  isCollapsed: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Feed {
  id: string;
  userId: string;
  folderId: string | null;
  title: string;
  url: string;
  feedUrl: string;
  description: string | null;
  faviconUrl: string | null;
  lastFetchedAt: string | null;
  sortOrder: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Article {
  id: string;
  feedId: string;
  title: string;
  url: string;
  content: string | null;
  summary: string | null;
  author: string | null;
  imageUrl: string | null;
  publishedAt: string | null;
  isRead: boolean | null;
  isStarred: boolean | null;
  isReadLater: boolean | null;
  createdAt: string | null;
}

export type FeedWithUnreadCount = Feed & { unreadCount: number };
