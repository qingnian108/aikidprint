import { readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const potrace = require('potrace');
import { ImageTracerNodejs, Options as ImageTracerOptions } from '@image-tracer-ts/nodejs';

type Target = {
  root: string;
  mode: 'line' | 'color' | 'pattern';
};

const base = join(process.cwd(), 'public', 'uploads', 'assets');
let targets: Target[] = [
  { root: join(base, 'A_main_assets'), mode: 'line' },
  { root: join(base, 'B_character_ip'), mode: 'line' },
  { root: join(base, 'C_cover_art'), mode: 'color' },
  { root: join(base, 'D_patterns', 'dinosaur', 'borders'), mode: 'pattern' },
  { root: join(base, 'D_patterns', 'dinosaur', 'patterns'), mode: 'pattern' },
];

// Optional CLI args: [rootPath] [mode]
// Example: tsx scripts/convert-png-to-svg.ts ./public/uploads/assets/B_character_ip line
const argRoot = process.argv[2];
const argMode = process.argv[3] as Target['mode'] | undefined;
if (argRoot && argMode) {
  const rootResolved = join(process.cwd(), argRoot);
  targets = [{ root: rootResolved, mode: argMode }];
}

function walk(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      files = walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function filterPngsForTarget(allFiles: string[], target: Target): string[] {
  const pngs = allFiles.filter(f => extname(f).toLowerCase() === '.png');
  if (target.mode === 'line') {
    return pngs.filter(p => /\\line\\/i.test(p));
  }
  return pngs;
}

async function convertFile(filePath: string, mode: Target['mode']): Promise<void> {
  try {
    const outPath = join(dirname(filePath), `${basename(filePath, '.png')}.svg`);
    if (mode === 'line') {
      const svg: string = await new Promise((resolve, reject) => {
        const opts = {
          threshold: 180,
          turdSize: 2,
          turnPolicy: potrace.TURNPOLICY_MINORITY,
          optCurve: true,
          blackOnWhite: true,
        } as any;
        potrace.trace(filePath, opts, (err: any, result: string) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
      writeFileSync(outPath, svg, 'utf8');
    } else {
      const numberOfColors = mode === 'color' ? 16 : 8;
      const options: Partial<ImageTracerOptions> = {
        numberOfColors,
        fillStyle: 'stroke+fill',
        strokeWidth: 0,
        decimalPlaces: 2,
        viewBox: true,
        trim: 'ratio',
        preset: 'detailed',
      } as any;
      const svg = await ImageTracerNodejs.fromFileName(filePath, options);
      writeFileSync(outPath, svg as unknown as string, 'utf8');
    }
    process.stdout.write(`Converted: ${filePath} -> ${outPath}\n`);
  } catch (err: any) {
    process.stderr.write(`Failed: ${filePath} -> ${err?.message || err}\n`);
  }
}

async function main() {
  for (const target of targets) {
    const all = walk(target.root, []);
    const pngs = filterPngsForTarget(all, target);
    for (const p of pngs) {
      await convertFile(p, target.mode);
    }
  }
  process.stdout.write('PNG to SVG conversion completed.\n');
}

main().catch(err => {
  process.stderr.write(String(err));
  process.exit(1);
});

