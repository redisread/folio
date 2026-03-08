#!/usr/bin/env node
/**
 * PWA 图标生成脚本
 * 基于 SVG 模板生成各种尺寸的 PNG 图标
 */

const fs = require("fs");
const path = require("path");

const ICONS_DIR = path.join(__dirname, "../public/icons");

// SVG 图标模板 - Folio 风格
const svgTemplate = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E85A24;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="20" ry="20" fill="url(#grad${size})"/>
  <rect x="25" y="30" width="50" height="6" rx="3" fill="white" opacity="0.9"/>
  <rect x="25" y="42" width="40" height="6" rx="3" fill="white" opacity="0.7"/>
  <rect x="25" y="54" width="45" height="6" rx="3" fill="white" opacity="0.7"/>
  <rect x="25" y="66" width="35" height="6" rx="3" fill="white" opacity="0.5"/>
</svg>`;

// 带内边距的 maskable 图标（符合 Android 自适应图标规范）
const svgTemplateMaskable = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradMask${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E85A24;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- 背景填充整个区域 -->
  <rect width="100" height="100" fill="url(#gradMask${size})"/>
  <!-- 内容区域（内边距约 18%） -->
  <g transform="translate(10, 10) scale(0.8)">
    <rect x="20" y="28" width="60" height="7" rx="3.5" fill="white" opacity="0.9"/>
    <rect x="20" y="42" width="48" height="7" rx="3.5" fill="white" opacity="0.7"/>
    <rect x="20" y="56" width="54" height="7" rx="3.5" fill="white" opacity="0.7"/>
    <rect x="20" y="70" width="42" height="7" rx="3.5" fill="white" opacity="0.5"/>
  </g>
</svg>`;

// 需要的图标尺寸
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// 生成 SVG 文件
function generateSVGs() {
	console.log("📐 生成 SVG 图标模板...\n");

	sizes.forEach((size) => {
		// 标准图标
		const svgContent = svgTemplate(size);
		const fileName = `icon-${size}x${size}.svg`;
		fs.writeFileSync(path.join(ICONS_DIR, fileName), svgContent);
		console.log(`✅ ${fileName}`);

		// Maskable 图标（192x192）
		if (size === 192) {
			const maskableContent = svgTemplateMaskable(size);
			const maskableName = `icon-${size}x${size}-maskable.svg`;
			fs.writeFileSync(path.join(ICONS_DIR, maskableName), maskableContent);
			console.log(`✅ ${maskableName}`);
		}
	});

	console.log("\n📄 SVG 模板生成完成！");
	console.log("\n⚠️  注意：这些 SVG 文件需要转换为 PNG 才能使用。");
	console.log("请使用以下方法之一转换为 PNG：");
	console.log("1. 使用在线转换工具 (如: convertio.co)");
	console.log("2. 使用 Figma/Sketch 导出");
	console.log("3. 使用 sharp 库自动转换 (需要安装)");
	console.log("\n🎨 或者，你可以直接替换这些 SVG 为设计好的 PNG 图标。");
}

// 生成 HTML 预览文件
function generatePreview() {
	const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Folio PWA Icons Preview</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 40px;
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 { color: #333; }
        .icon-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 30px;
            margin-top: 30px;
        }
        .icon-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .icon-card img, .icon-card svg {
            width: 96px;
            height: 96px;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .icon-card.maskable img, .icon-card.maskable svg {
            border-radius: 50%;
        }
        .icon-label {
            margin-top: 15px;
            font-size: 14px;
            color: #666;
        }
        .icon-size {
            font-size: 12px;
            color: #999;
            margin-top: 5px;
        }
    </style>
</head>
<body>
    <h1>🎨 Folio PWA 图标预览</h1>
    <div class="icon-grid">
        ${sizes
					.map(
						(size) => `
        <div class="icon-card">
            <img src="icon-${size}x${size}.svg" alt="${size}x${size}">
            <div class="icon-label">icon-${size}x${size}.png</div>
            <div class="icon-size">${size}×${size}px</div>
        </div>
        `
					)
					.join("")}
        <div class="icon-card maskable">
            <img src="icon-192x192-maskable.svg" alt="192x192 maskable">
            <div class="icon-label">icon-192x192-maskable.png</div>
            <div class="icon-size">192×192px (Adaptive)</div>
        </div>
    </div>
</body>
</html>`;

	fs.writeFileSync(path.join(ICONS_DIR, "preview.html"), html);
	console.log("\n🌐 预览页面已生成: public/icons/preview.html");
}

// 主函数
function main() {
	if (!fs.existsSync(ICONS_DIR)) {
		fs.mkdirSync(ICONS_DIR, { recursive: true });
	}

	generateSVGs();
	generatePreview();

	// 生成转换说明
	const readme = `# Folio PWA 图标

## 生成的 SVG 模板

此目录包含自动生成的 SVG 图标模板，需要转换为 PNG 格式才能用于 PWA。

## 转换方法

### 方法 1: 使用 sharp (推荐，自动转换)
\`\`\`bash
npm install sharp
node scripts/convert-icons.js
\`\`\`

### 方法 2: 在线工具
1. 访问 https://convertio.co/zh/svg-png/
2. 上传 SVG 文件
3. 下载 PNG 到本目录

### 方法 3: 设计工具
1. 使用 Figma/Sketch/Photoshop
2. 创建 ${sizes.join(", ")}px 尺寸的画板
3. 导出 PNG 到本目录

## 图标规格

- **主色调**: #FF6B35 (橙色)
- **背景**: 渐变色 (#FF6B35 → #E85A24)
- **圆角**: 20px (标准) / 圆形 (maskable)
- **内边距**: maskable 图标需要 10% 安全区域

## 文件命名

- \`icon-{size}x{size}.png\` - 标准图标
- \`icon-192x192-maskable.png\` - Android 自适应图标

## 预览

在浏览器中打开 \`preview.html\` 查看所有图标。
`;

	fs.writeFileSync(path.join(ICONS_DIR, "README.md"), readme);
	console.log("\n📖 说明文档已生成: public/icons/README.md");
}

main();
