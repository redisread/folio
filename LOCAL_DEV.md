# 本地开发指南

本项目基于 OpenNext Cloudflare，支持完整的 Cloudflare Workers 本地开发调试。

## 开发模式选择

### 模式一：标准 Next.js 开发服务器 (`npm run dev`)

适用于前端 UI 开发，启动速度快。

```bash
npm run dev
```

- 访问地址：http://localhost:3000

**限制**：
- 使用 `initOpenNextCloudflareForDev()` 模拟 Cloudflare 环境
- D1 数据库操作会失败（因为没有真实的 Workers 运行时）
- 适合纯前端组件开发

### 模式二：Cloudflare Workers 本地预览 (`npm run preview`)

**推荐** - 完整的本地开发调试，包含真实的 D1/KV/R2 绑定。

```bash
# 首次启动（包含数据库迁移）
npm run preview:setup

# 后续启动（数据库已初始化）
npm run preview
```

- 访问地址：http://localhost:8787（wrangler 默认端口）

**特性**：
- 真实的 Cloudflare Workers 运行时
- 本地 D1 SQLite 数据库（存储在 `.wrangler/state/v3/d1/`）
- KV 和 R2 本地模拟
- 支持 `getCloudflareContext()` 访问所有绑定

## 数据库操作

### 应用迁移

```bash
# 应用本地数据库迁移
npm run db:migrate:local
```

### 重置数据库

```bash
# 删除本地数据库（所有数据将丢失）
npm run db:reset:local

# 然后重新应用迁移
npm run db:migrate:local
```

### 创建新迁移

修改 `src/lib/db/schema.ts` 后：

```bash
npm run db:migrate:create
```

## 环境变量

本地开发环境变量存储在 `.dev.vars`：

```
NEXTJS_ENV=development
BETTER_AUTH_SECRET=dev-secret-key-change-in-production
BETTER_AUTH_URL=http://localhost:3000
```

**注意**：不要提交 `.dev.vars` 到版本控制。

## 调试技巧

### 1. 查看本地数据库

本地 D1 数据库是 SQLite 文件，可以使用任何 SQLite 客户端打开：

```bash
# 找到数据库文件
ls .wrangler/state/v3/d1/miniflare-D1DatabaseObject/

# 使用 SQLite CLI
sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite
```

### 2. 查看日志

```bash
# 在另一个终端实时查看 Workers 日志
wrangler tail --local
```

### 3. 调试绑定

在代码中使用 `getCloudflareContext()` 访问绑定：

```typescript
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET(request: Request) {
  const { env, cf, ctx } = getCloudflareContext();

  // 访问 D1 数据库
  const result = await env.DB.prepare("SELECT * FROM users").all();

  // 访问 KV
  const value = await env.FOLIO_KV.get("key");

  return Response.json({ result });
}
```

## 常见问题

### 1. "D1 数据库未绑定" 错误

确保使用 `npm run preview` 而非 `npm run dev`。D1 绑定只在 Workers 运行时可用。

### 2. 数据库迁移失败

```bash
# 重置并重新应用迁移
npm run db:reset:local
npm run db:migrate:local
```

### 3. 端口被占用

修改 `.dev.vars` 添加端口配置：

```
PORT=3001
```

或在启动命令中指定：

```bash
wrangler dev --port 3001
```

## 生产部署

```bash
# 部署前确保数据库迁移已应用到生产环境
wrangler d1 migrations apply folio-rss-db --remote

# 部署
npm run deploy
```
