#!/usr/bin/env node
/**
 * SVG 转 PNG 转换脚本
 * 使用 sharp 库将所有 SVG 图标转换为 PNG
 */

const fs = require("fs");
const path = require("path");

// 动态导入 sharp（ESM 兼容）
async function loadSharp() {
	const { default: sharp } = await import("sharp");
	return sharp;
}

const ICONS_DIR = path.join(__dirname, "../public/icons");

// 需要转换的图标配置
const icons = [
	{ size: 72, maskable: false },
	{ size: 96, maskable: false },
	{ size: 128, maskable: false },
	{ size: 144, maskable: false },
	{ size: 152, maskable: false },
	{ size: 192, maskable: false },
	{ size: 192, maskable: true },
	{ size: 384, maskable: false },
	{ size: 512, maskable: false },
];

async function convertIcons() {
	console.log("🎨 转换 SVG 图标为 PNG...\n");

	const sharp = await loadSharp();

	for (const { size, maskable } of icons) {
		const inputName = maskable
			? `icon-${size}x${size}-maskable.svg`
			: `icon-${size}x${size}.svg`;
		const outputName = maskable
			? `icon-${size}x${size}-maskable.png`
			: `icon-${size}x${size}.png`;

		const inputPath = path.join(ICONS_DIR, inputName);
		const outputPath = path.join(ICONS_DIR, outputName);

		if (!fs.existsSync(inputPath)) {
			console.log(`❌ 跳过: ${inputName} (文件不存在)`);
			continue;
		}

		try {
			// 读取 SVG 并转换为 PNG
			const svgBuffer = fs.readFileSync(inputPath);

			await sharp(svgBuffer)
				.resize(size, size, {
					fit: "contain",
					background: { r: 255, g: 107, b: 53, alpha: 1 }, // #FF6B35
				})
				.png({
					compressionLevel: 9,
					quality: 100,
				})
				.toFile(outputPath);

			console.log(`✅ ${outputName}`);
		} catch (error) {
			console.error(`❌ 失败: ${inputName}`, error.message);
		}
	}

	console.log("\n✨ 图标转换完成！");
}

// 删除 SVG 文件（可选）
function cleanSVGs() {
	console.log("\n🧹 清理 SVG 文件...");
	const files = fs.readdirSync(ICONS_DIR);
	let count = 0;

	for (const file of files) {
		if (file.endsWith(".svg")) {
			fs.unlinkSync(path.join(ICONS_DIR, file));
			count++;
		}
	}

	console.log(`已删除 ${count} 个 SVG 文件`);
}

// 主函数
async function main() {
	await convertIcons();

	// 如果传递了 --clean 参数，删除 SVG
	if (process.argv.includes("--clean")) {
		cleanSVGs();
	}

	console.log("\n📁 输出目录:", ICONS_DIR);
}

main().catch(console.error);
