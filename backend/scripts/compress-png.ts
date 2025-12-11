import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

type Stats = { original: number; compressed: number; ratio: number };

async function walk(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, files);
    else if (e.isFile() && e.name.toLowerCase().endsWith('.png')) files.push(full);
  }
  return files;
}

async function compressOne(file: string, targetRatio = 0.5, aggressive = false): Promise<Stats> {
  const origStat = await fs.promises.stat(file);
  const original = origStat.size;
  const dir = path.dirname(file);
  const base = path.basename(file, path.extname(file));
  const tmp = path.join(dir, `.__tmp__${base}.png`);

  const tries = aggressive ? [30, 25, 20, 15, 10, 5] : [80, 70, 60, 50, 40, 30];
  let bestSize = Number.MAX_SAFE_INTEGER;
  let bestTmp = tmp;
  for (const q of tries) {
    await sharp(file)
      .png({ compressionLevel: 9, palette: true, quality: q, adaptiveFiltering: true })
      .toFile(tmp);
    const s = (await fs.promises.stat(tmp)).size;
    if (s < bestSize) {
      bestSize = s;
      bestTmp = tmp;
    }
    if (s <= original * targetRatio) break;
  }

  await fs.promises.rename(bestTmp, file);
  return { original, compressed: bestSize, ratio: bestSize / original };
}

async function main() {
  const rootArg = process.argv[2];
  const modeArg = process.argv[3];
  const root = rootArg
    ? path.resolve(rootArg)
    : path.resolve(path.join(__dirname, '../public/uploads/bigpng'));
  const aggressive = !!modeArg && modeArg.toLowerCase().includes('aggr');

  const files = await walk(root);
  let saved = 0;
  let count = 0;
  console.log(`Compressing ${files.length} PNGs under: ${root}`);

  for (const f of files) {
    try {
      const { original, compressed, ratio } = await compressOne(f, 0.5, aggressive);
      saved += original - compressed;
      count++;
      if (count % 50 === 0) {
        console.log(`Processed ${count}/${files.length}`);
      }
    } catch (err) {
      console.error(`Failed to compress ${f}:`, err);
    }
  }

  console.log(`Done. Files: ${count}, total saved: ${(saved / (1024 * 1024)).toFixed(2)} MB`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
