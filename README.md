# Collect

一个现代、极简的 RSS 阅读器，采用 monorepo 架构管理多端应用。

## 项目结构

```
collect/
├── api/                    # 后端 API（Hono + Cloudflare Workers）
├── frontend/               # Web 前端（Astro 6 + React Islands）
├── mobile/                 # 移动端（Flutter）
├── packages/
│   ├── types/              # 共享 TypeScript 类型
│   └── config/             # 共享配置（ESLint/TypeScript）
└── .github/workflows/      # CI/CD
```

## 快速开始

### 前置要求

- Node.js >= 20
- pnpm >= 9（`npm install -g pnpm`）
- Flutter >= 3.x（移动端开发）
- Wrangler CLI（`pnpm add -g wrangler`）

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
# 启动后端 API（端口 8787）
pnpm dev:api

# 启动 Web 前端（端口 4321）
pnpm dev:frontend

# 启动移动端
cd mobile && flutter run
```

### 部署

```bash
# 部署后端
pnpm deploy:api

# 部署前端
pnpm deploy:frontend
```

## 技术栈

| 层 | 技术 |
|---|---|
| 后端 | Hono + Cloudflare Workers + D1 + Better Auth |
| Web 前端 | Astro 6 + React + Tailwind CSS v4 + shadcn/ui |
| 移动端 | Flutter + Riverpod + go_router |
| 数据库 | Cloudflare D1 (SQLite) + Drizzle ORM |
| 存储 | Cloudflare KV + R2 |
| 认证 | Better Auth |

## License

MIT
