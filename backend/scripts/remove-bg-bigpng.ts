/**
 * 批量去除白色背景并压缩 PNG（覆盖原图）
 * 目录：backend/public/uploads/bigpng
 *
 * 原理：
 * 1. 读取首像素作为背景色（通常是纯白）
 * 2. 对每个像素做色差判断，接近背景色则将 alpha 置 0
 * 3. 重新以 PNG（调色板+压缩）写回，减少体积
 *
 * 调整参数：
 * - TOLERANCE：颜色容差（0-255），数值越大越容易被视为背景
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT_DIR = path.resolve('public', 'uploads', 'bigpng');
const TOLERANCE = 18; // 背景色容差，可按需要微调

const isPng = (filename: string) => filename.toLowerCase().endsWith('.png');

async function removeBackground(filePath: string) {
  const image = sharp(filePath);

  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];

  const maxDiff = TOLERANCE;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const isBg =
      Math.abs(r - bgR) <= maxDiff &&
      Math.abs(g - bgG) <= maxDiff &&
      Math.abs(b - bgB) <= maxDiff;

    if (isBg) {
      data[i + 3] = 0; // 透明
    }
  }

  // 覆盖写回
  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      palette: true, // 调色板模式可显著减小尺寸
    })
    .toFile(filePath);
}

async function main() {
  const entries = fs.readdirSync(ROOT_DIR);
  const pngFiles = entries.filter(isPng);

  console.log(`找到 ${pngFiles.length} 个 PNG，将逐个处理...`);

  for (const filename of pngFiles) {
    const filePath = path.join(ROOT_DIR, filename);
    try {
      await removeBackground(filePath);
      console.log(`✅ 处理完成: ${filename}`);
    } catch (err) {
      console.error(`❌ 失败: ${filename}`, err);
    }
  }

  console.log('全部处理结束。');
}

main().catch((err) => {
  console.error('执行失败:', err);
  process.exit(1);
});


