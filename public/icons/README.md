# Folio PWA 图标

## 生成的 SVG 模板

此目录包含自动生成的 SVG 图标模板，需要转换为 PNG 格式才能用于 PWA。

## 转换方法

### 方法 1: 使用 sharp (推荐，自动转换)
```bash
npm install sharp
node scripts/convert-icons.js
```

### 方法 2: 在线工具
1. 访问 https://convertio.co/zh/svg-png/
2. 上传 SVG 文件
3. 下载 PNG 到本目录

### 方法 3: 设计工具
1. 使用 Figma/Sketch/Photoshop
2. 创建 72, 96, 128, 144, 152, 192, 384, 512px 尺寸的画板
3. 导出 PNG 到本目录

## 图标规格

- **主色调**: #FF6B35 (橙色)
- **背景**: 渐变色 (#FF6B35 → #E85A24)
- **圆角**: 20px (标准) / 圆形 (maskable)
- **内边距**: maskable 图标需要 10% 安全区域

## 文件命名

- `icon-{size}x{size}.png` - 标准图标
- `icon-192x192-maskable.png` - Android 自适应图标

## 预览

在浏览器中打开 `preview.html` 查看所有图标。
