# Folio 移动端 & PWA 改造方案

## 现状分析

当前 Folio 是一个桌面优先的三栏 RSS 阅读器：
- 左侧：Sidebar（订阅源/文件夹）
- 中间：ArticleList（文章列表）
- 右侧：ArticleDetail（文章阅读）
- 固定宽度布局，支持拖拽调整
- 无响应式适配，移动端体验差

## 改造目标

1. **移动端适配**：单栏/双栏自适应布局
2. **PWA 支持**：可安装、离线阅读、推送通知
3. **触摸优化**：滑动切换、触摸友好的交互
4. **保持桌面体验**：大屏仍保持三栏布局

---

## 一、技术选型

| 技术 | 选择 | 说明 |
|------|------|------|
| PWA 方案 | `@serwist/next` | Next.js 15+ 推荐，基于 Workbox |
| 响应式方案 | CSS Container Queries + Tailwind | 更灵活的组件级响应式 |
| 触摸手势 | `@use-gesture/react` | 成熟的 React 手势库 |
| 动画 | `framer-motion` | 流畅的页面切换动画 |

---

## 二、PWA 配置方案

### 1. 安装依赖

```bash
npm install @serwist/next workbox-window
npm install -D @serwist/build
```

### 2. 创建 Service Worker

**`src/app/sw.ts`**
```typescript
import { defaultCache } from "@serwist/next/browser";
import type { PrecacheEntry } from "@serwist/precaching";
import { installSerwist } from "@serwist/sw";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // RSS 内容缓存策略
    {
      urlPattern: /^https:\/\/.+\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "article-images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 天
        },
      },
    },
    // API 请求网络优先
    {
      urlPattern: /\/api\//,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 分钟
        },
      },
    },
  ],
});
```

### 3. Web App Manifest

**`src/app/manifest.ts`**
```typescript
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Folio RSS",
    short_name: "Folio",
    description: "极简 RSS 阅读器 — 让阅读回归本质",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FF6B35",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["news", "productivity"],
    lang: "zh-CN",
    dir: "ltr",
    // iOS 特定
    apple_touch_icon: "/icons/icon-192x192.png",
  };
}
```

### 4. Next.js 配置更新

**`next.config.ts`**
```typescript
import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const nextConfig: NextConfig = {
  // ... 现有配置
  turbopack: {
    resolveAlias: {
      "better-sqlite3": "./node_modules/drizzle-orm/sqlite-core",
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("better-sqlite3");
      }
    }
    return config;
  },
};

export default withSerwist({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
})(nextConfig);
```

---

## 三、移动端布局改造方案

### 1. 响应式断点设计

```typescript
// tailwind.config.ts 或 globals.css
const breakpoints = {
  sm: "640px",   // 手机横屏
  md: "768px",   // 平板竖屏
  lg: "1024px",  // 平板横屏/小笔记本
  xl: "1280px",  // 桌面
  "2xl": "1536px", // 大屏桌面
};
```

### 2. 移动端视图状态管理

**`src/lib/store/mobileStore.ts`**
```typescript
import { create } from "zustand";

type MobileView = "sidebar" | "list" | "detail";

interface MobileState {
  currentView: MobileView;
  previousView: MobileView | null;
  isMobile: boolean;
  setCurrentView: (view: MobileView) => void;
  goBack: () => void;
  checkMobile: () => void;
}

export const useMobileStore = create<MobileState>((set, get) => ({
  currentView: "list",
  previousView: null,
  isMobile: false,
  setCurrentView: (view) => {
    const { currentView } = get();
    set({ previousView: currentView, currentView: view });
  },
  goBack: () => {
    const { previousView } = get();
    if (previousView) {
      set({ currentView: previousView, previousView: null });
    }
  },
  checkMobile: () => {
    set({ isMobile: window.innerWidth < 1024 });
  },
}));
```

### 3. 改造 ThreeColumnLayout

**方案：CSS Grid + 状态切换**

```typescript
// src/components/layout/ResponsiveLayout.tsx
"use client";
import { useEffect } from "react";
import { useMobileStore } from "@/lib/store/mobileStore";
import { DesktopLayout } from "./DesktopLayout";
import { MobileLayout } from "./MobileLayout";

export function ResponsiveLayout() {
  const { isMobile, checkMobile } = useMobileStore();

  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [checkMobile]);

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

**桌面布局（保持现有）**
- 三栏可拖拽布局
- 最小宽度 1024px 触发

**移动端布局（新建）**
```typescript
// src/components/layout/MobileLayout.tsx
"use client";
import { useMobileStore } from "@/lib/store/mobileStore";
import { Sidebar } from "../sidebar/Sidebar";
import { ArticleList } from "./ArticleList";
import { ArticleDetail } from "./ArticleDetail";
import { cn } from "@/lib/utils/cn";

export function MobileLayout() {
  const { currentView } = useMobileStore();

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[var(--bg-main)]">
      {/* Sidebar - 从左侧滑入 */}
      <div
        className={cn(
          "absolute inset-0 z-30 transform transition-transform duration-300",
          currentView === "sidebar" ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar mobile onClose={() => useMobileStore.getState().setCurrentView("list")} />
      </div>

      {/* Article List - 主视图 */}
      <div
        className={cn(
          "absolute inset-0 z-10 transform transition-transform duration-300",
          currentView === "list" ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <ArticleList mobile />
      </div>

      {/* Article Detail - 从右侧滑入 */}
      <div
        className={cn(
          "absolute inset-0 z-20 transform transition-transform duration-300",
          currentView === "detail" ? "translate-x-0" : "translate-x-full"
        )}
      >
        <ArticleDetail mobile />
      </div>
    </div>
  );
}
```

### 4. 触摸手势支持

```typescript
// src/hooks/useSwipeNavigation.ts
"use client";
import { useDrag } from "@use-gesture/react";
import { useMobileStore } from "@/lib/store/mobileStore";

export function useSwipeNavigation() {
  const { currentView, setCurrentView, goBack } = useMobileStore();

  const bind = useDrag(
    ({ direction: [dx], velocity, last, cancel }) => {
      if (!last) return;

      const threshold = 0.5; // 速度阈值

      // 从左向右滑 - 返回
      if (dx > 0 && velocity > threshold) {
        if (currentView === "detail") {
          goBack();
        } else if (currentView === "list") {
          setCurrentView("sidebar");
        }
        cancel?.();
      }

      // 从右向左滑 - 前进
      if (dx < 0 && velocity > threshold) {
        if (currentView === "sidebar") {
          setCurrentView("list");
        } else if (currentView === "list") {
          // 需要有选中文章才能前进到 detail
        }
        cancel?.();
      }
    },
    { axis: "x", filterTaps: true }
  );

  return bind;
}
```

---

## 四、组件改造清单

### 必须改造

| 组件 | 改造内容 | 优先级 |
|------|----------|--------|
| ThreeColumnLayout | 拆分为 DesktopLayout + MobileLayout | 🔴 高 |
| Sidebar | 添加移动端抽屉式导航 | 🔴 高 |
| ArticleList | 添加移动端返回按钮、点击跳转详情 | 🔴 高 |
| ArticleDetail | 添加移动端返回按钮、工具栏适配 | 🔴 高 |
| ArticleCard | 触摸友好的卡片尺寸 | 🟡 中 |
| ArticleReader | 字体大小调整、行宽适配 | 🟡 中 |
| ArticleToolbar | 底部固定工具栏（移动端） | 🟡 中 |
| login/register | 表单输入框适配小屏幕 | 🔴 高 |

### 新增组件

| 组件 | 功能 | 优先级 |
|------|------|--------|
| MobileNavBar | 底部导航栏（快速切换） | 🟡 中 |
| SwipeIndicator | 滑动提示指示器 | 🟢 低 |
| PullToRefresh | 下拉刷新文章列表 | 🟡 中 |
| MobileFab | 浮动操作按钮（添加订阅） | 🟡 中 |

---

## 五、离线支持策略

### 1. 缓存策略

```typescript
// 文章数据缓存
const articleCache = {
  // 已读文章本地存储
  readArticles: "indexeddb",
  // 收藏文章离线可用
  starredArticles: "indexeddb",
  // 最近 50 篇文章
  recentArticles: "cache-api",
};
```

### 2. IndexedDB 封装

```typescript
// src/lib/db/offline.ts
import { openDB } from "idb";

const dbPromise = openDB("folio-offline", 1, {
  upgrade(db) {
    db.createObjectStore("articles", { keyPath: "id" });
    db.createObjectStore("feeds", { keyPath: "id" });
  },
});

export async function cacheArticle(article: Article) {
  const db = await dbPromise;
  await db.put("articles", article);
}

export async function getCachedArticle(id: string) {
  const db = await dbPromise;
  return db.get("articles", id);
}
```

---

## 六、iOS Safari 优化

### 1. 添加到主屏幕提示

```typescript
// src/components/common/InstallPrompt.tsx
"use client";
import { useEffect, useState } from "react";

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // iOS Safari 检测
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (isIOS && !isStandalone && !localStorage.getItem("ios-pwa-dismissed")) {
      setShowPrompt(true);
    }
  }, []);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-[var(--bg-card)] p-4 rounded-xl shadow-lg border border-[var(--border)]">
      <p className="text-sm text-[var(--text-primary)]">
        点击分享按钮，然后选择「添加到主屏幕」以获得最佳体验
      </p>
      <button
        onClick={() => {
          localStorage.setItem("ios-pwa-dismissed", "true");
          setShowPrompt(false);
        }}
        className="mt-2 text-[var(--accent)] text-sm"
      >
        知道了
      </button>
    </div>
  );
}
```

### 2. 安全区域适配

```css
/* globals.css */
body {
  /* iPhone 刘海屏适配 */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.mobile-nav-bar {
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}
```

---

## 七、性能优化

### 1. 图片懒加载

```typescript
// 文章图片使用 blur placeholder
<Image
  src={imageUrl}
  alt={title}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  placeholder="blur"
  blurDataURL={blurHash}
  loading="lazy"
/>
```

### 2. 虚拟滚动（长列表）

```bash
npm install react-window react-window-infinite-loader
```

### 3. 代码分割

```typescript
// 移动端组件懒加载
const MobileLayout = dynamic(() => import("./MobileLayout"), {
  ssr: false,
  loading: () => <SkeletonLayout />,
});
```

---

## 八、实施计划

### Phase 1: PWA 基础（1-2 天）
1. [ ] 安装 Serwist 依赖
2. [ ] 配置 Web App Manifest
3. [ ] 创建 Service Worker
4. [ ] 生成 PWA 图标集
5. [ ] 测试安装流程

### Phase 2: 移动端布局（2-3 天）
1. [ ] 创建 mobileStore
2. [ ] 拆分 DesktopLayout / MobileLayout
3. [ ] 改造 Sidebar（抽屉式）
4. [ ] 改造 ArticleList / ArticleDetail（返回按钮）
5. [ ] 实现视图切换动画

### Phase 3: 交互优化（2 天）
1. [ ] 添加滑动导航
2. [ ] 实现下拉刷新
3. [ ] 底部导航栏
4. [ ] 触摸反馈优化
5. [ ] iOS Safari 适配

### Phase 4: 离线功能（1-2 天）
1. [ ] IndexedDB 封装
2. [ ] 文章离线缓存
3. [ ] 离线提示 UI
4. [ ] 后台同步（可选）

### Phase 5: 测试发布（1 天）
1. [ ] Lighthouse PWA 检测
2. [ ] 多设备测试
3. [ ] 性能测试
4. [ ] 部署验证

---

## 九、预期效果

| 指标 | 目标 |
|------|------|
| Lighthouse PWA 分数 | 90+ |
| 移动端可用性 | 完全可用 |
| 安装后体验 | 类原生 App |
| 离线阅读 | 支持已缓存文章 |
| 首屏加载 | < 3s (4G) |

---

## 十、风险提示

1. **Service Worker 缓存策略**：需要谨慎设计，避免缓存过多导致存储超限
2. **手势冲突**：滑动导航可能与文章内横向滚动冲突，需要边界检测
3. **数据同步**：离线后重新在线的数据同步需要考虑冲突解决
4. **iOS 限制**：iOS Safari PWA 功能受限（如后台同步、推送通知）

---

这个方案你觉得如何？需要我详细展开某个部分，或者直接开始实施？
