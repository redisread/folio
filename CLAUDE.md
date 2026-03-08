# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 [OpenNext](https://opennext.js.org/cloudflare) 的 Next.js 应用，部署到 **Cloudflare Workers**。使用 `@opennextjs/cloudflare` 适配器将 Next.js 运行在 Cloudflare Workers 运行时上。

- Next.js 16 + React 19
- Tailwind CSS v4
- TypeScript
- 部署目标：Cloudflare Workers（非 Pages）

## 常用命令

```bash
# 本地 Next.js 开发服务器（不含 Cloudflare 运行时）
npm run dev

# 在 Cloudflare Workers 运行时本地预览（推荐测试）
npm run preview

# 构建并部署到 Cloudflare
npm run deploy

# 仅构建上传 Worker 资产（不部署）
npm run upload

# 生成 Cloudflare 环境类型定义
npm run cf-typegen
```

## 架构说明

### 构建流程

`npm run preview` / `npm run deploy` 会先执行 `opennextjs-cloudflare build`，将 Next.js 构建产物转换为 Cloudflare Workers 兼容格式，输出到 `.open-next/` 目录。

### 关键配置文件

| 文件 | 用途 |
|------|------|
| `open-next.config.ts` | OpenNext 适配器配置（缓存策略、override 等） |
| `next.config.ts` | Next.js 配置，已包含 `initOpenNextCloudflareForDev()` |
| `wrangler.jsonc` | Cloudflare Worker 配置（bindings、兼容性日期等） |
| `.dev.vars` | 本地开发环境变量（含 `NEXTJS_ENV=development`） |
| `public/_headers` | 静态资源缓存规则 |

### 访问 Cloudflare Bindings

在 Server Components、Route Handlers、Server Actions 中通过 `getCloudflareContext()` 访问 KV、R2、D1 等 bindings：

```typescript
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request: Request) {
  const { env, cf, ctx } = getCloudflareContext();
  const value = await env.MY_KV_NAMESPACE.get("key");
  return Response.json({ value });
}
```

在 SSG 路由中需使用异步模式：`getCloudflareContext({ async: true })`。

修改 bindings 后运行 `npm run cf-typegen` 更新 `cloudflare-env.d.ts` 类型定义。

## OpenNext / Cloudflare Workers 限制

### 运行时要求

- `wrangler` 版本须 `>= 3.99.0`
- `wrangler.jsonc` 中必须启用 `nodejs_compat` 兼容性标志，兼容性日期须 `>= 2024-09-23`

### 不支持的功能

- **禁止**在页面/路由中使用 `export const runtime = "edge"`，Cloudflare 适配器使用 Node.js 运行时而非 Edge 运行时
- Next.js 15.2+ 的 Node Middleware 暂不支持
- 不可使用 `@cloudflare/next-on-pages`，须用 `@opennextjs/cloudflare`

### Worker 大小限制

- Free 计划：压缩后 3 MiB
- Paid 计划：压缩后 10 MiB

### 开发平台

Windows 不完全支持，建议使用 macOS / Linux / WSL。

## 缓存配置（ISR）

在 `open-next.config.ts` 中配置缓存策略，根据站点规模选择：

- **小型站点**：R2 增量缓存 + DO Queue + D1 Tag Cache
- **大型站点**：R2 增量缓存 + DO Queue + ShardedDO Tag Cache
- **纯静态站点**：Workers Static Assets 增量缓存

启用 R2 缓存示例：

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
```

## .gitignore 注意事项

确保 `.open-next/` 已加入 `.gitignore`（构建产物，不应提交）。
