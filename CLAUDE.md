# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**Collect** — 现代 RSS 阅读器，采用 pnpm monorepo 管理，包含三个子包：

| 子包 | 技术栈 | 部署目标 |
|------|--------|----------|
| `api/` | Hono + Cloudflare Workers + D1 + Better Auth | Cloudflare Workers |
| `frontend/` | Astro 6 + React Islands + Tailwind CSS v4 + shadcn/ui | Cloudflare Pages |
| `mobile/` | Flutter 3 + Riverpod + go_router | iOS / Android |

共享包：
- `packages/types/` — 共享 TypeScript 类型和 Zod schema
- `packages/config/` — 共享 ESLint 和 TypeScript 配置

## 常用命令

```bash
# 全局（在根目录执行）
pnpm dev              # 并行启动所有服务
pnpm dev:api          # 仅启动后端（端口 8787）
pnpm dev:frontend     # 仅启动前端（端口 4321）
pnpm build            # 构建所有子包
pnpm deploy           # 部署所有子包
pnpm lint             # 检查所有子包

# 后端（api/）
pnpm --filter api dev
pnpm --filter api deploy
pnpm --filter api db:migrate:local   # 本地数据库迁移

# 前端（frontend/）
pnpm --filter frontend dev
pnpm --filter frontend deploy

# 移动端（mobile/）
cd mobile && flutter run
cd mobile && flutter build ios
cd mobile && flutter build apk
```

## 架构说明

### 后端（api/）

Hono 框架运行在 Cloudflare Workers 上，提供 REST API：

- `GET/POST /api/folders` — 文件夹管理
- `GET/POST /api/feeds` — 订阅源管理
- `GET/PUT /api/articles` — 文章管理
- `POST /api/auth/*` — Better Auth 认证
- `POST /api/refresh` — RSS 刷新
- `GET/POST /api/opml` — OPML 导入导出

通过 `c.env.DB`（D1）、`c.env.COLLECT_KV`（KV）、`c.env.COLLECT_R2`（R2）访问 Cloudflare 资源。

### 前端（frontend/）

Astro 6 静态优先，交互部分使用 React Islands（`client:load`）。

- Astro 页面：`src/pages/`（SSR/SSG）
- React Islands：`src/components/app/`（客户端交互）
- API 客户端：`src/lib/api.ts`（调用 collect-api）
- 状态管理：Zustand stores

### 移动端（mobile/）

Flutter 跨平台应用，通过 Dio 调用 collect-api。

- 状态管理：Riverpod
- 路由：go_router
- API 地址：`--dart-define=API_BASE_URL=<url>` 注入

## Cloudflare Bindings

修改 bindings 后运行：
```bash
pnpm --filter api cf-typegen
```

## 注意事项

- 禁止在 api/ 中使用 `export const runtime = "edge"`
- 所有 API 响应格式：`{ success: boolean, data?: T, error?: string }`
- Better Auth session 通过 Cookie 传递，移动端需手动管理 Cookie
