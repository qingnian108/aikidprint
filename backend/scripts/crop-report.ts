import { join, basename } from 'path'
import { readdirSync, statSync, mkdirSync, rmSync, renameSync } from 'fs'
import sharp from 'sharp'

type Item = { file: string; w: number; h: number; minX: number; maxX: number; minY: number; maxY: number; padX: number; padY: number; cropX: number; cropY: number; cropW: number; cropH: number; reduceW: number; reduceH: number }

function listPng(dir: string): string[] {
  const out: string[] = []
  const stack = [dir]
  while (stack.length) {
    const d = stack.pop() as string
    const ents = readdirSync(d)
    for (const e of ents) {
      const full = join(d, e)
      const st = statSync(full)
      if (st.isDirectory()) stack.push(full)
      else if (full.toLowerCase().endsWith('.png')) out.push(full)
    }
  }
  return out
}

function isContentPixel(r: number, g: number, b: number, a: number): boolean {
  if (a > 10) return true
  const l = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return l < 245
}

async function analyze(file: string): Promise<Item | null> {
  const img = sharp(file).ensureAlpha()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const w = info.width
  const h = info.height
  const c = info.channels
  let minX = w, maxX = -1, minY = h, maxY = -1
  for (let y = 0; y < h; y++) {
    const row = y * w * c
    for (let x = 0; x < w; x++) {
      const i = row + x * c
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      if (isContentPixel(r, g, b, a)) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0 || maxY < 0) return null
  const padX = Math.max(12, Math.round(w * 0.03))
  const padY = Math.max(12, Math.round(h * 0.03))
  const cropX = Math.max(0, minX - padX)
  const cropY = Math.max(0, minY - padY)
  const cropW = Math.min(w - cropX, (maxX - minX + 1) + padX * 2)
  const cropH = Math.min(h - cropY, (maxY - minY + 1) + padY * 2)
  const reduceW = Number(((1 - cropW / w) * 100).toFixed(2))
  const reduceH = Number(((1 - cropH / h) * 100).toFixed(2))
  return { file, w, h, minX, maxX, minY, maxY, padX, padY, cropX, cropY, cropW, cropH, reduceW, reduceH }
}

type Mode = 'report' | 'exec' | 'exec-inplace'

async function main() {
  const mode = (process.argv[2] || 'report') as Mode
  const inputArg = process.argv[3]
  const outArg = process.argv[4]
  const defaultLettersBase = join(process.cwd(), 'public', 'uploads', 'letters')
  const defaultTargets = [join(defaultLettersBase, 'uppercase'), join(defaultLettersBase, 'lowercase')]
  const targets = inputArg ? [join(process.cwd(), inputArg)] : defaultTargets
  const all: Item[] = []
  for (const t of targets) {
    const pngs = listPng(t)
    for (const p of pngs) {
      const res = await analyze(p)
      if (res) all.push(res)
    }
  }
  if (mode === 'report') {
    const head = all.slice(0, 12)
    for (const it of head) {
      process.stdout.write(JSON.stringify(it) + '\n')
    }
    const rw = all.reduce((s, x) => s + x.reduceW, 0) / (all.length || 1)
    const rh = all.reduce((s, x) => s + x.reduceH, 0) / (all.length || 1)
    process.stdout.write(`Total files: ${all.length}\n`)
    process.stdout.write(`Avg reduce width: ${rw.toFixed(2)}%\n`)
    process.stdout.write(`Avg reduce height: ${rh.toFixed(2)}%\n`)
    return
  }

  const outRoot = outArg ? join(process.cwd(), outArg) : join(process.cwd(), 'public', 'uploads', 'letters_cropped')
  const isDefaultLetters = !inputArg
  if (mode === 'exec') {
    if (isDefaultLetters) {
      mkdirSync(join(outRoot, 'uppercase'), { recursive: true })
      mkdirSync(join(outRoot, 'lowercase'), { recursive: true })
    } else {
      mkdirSync(outRoot, { recursive: true })
    }
  }
  let done = 0
  for (const it of all) {
    if (mode === 'exec-inplace') {
      const tmp = it.file.replace(/\.png$/i, '.tmp.png')
      await sharp(it.file)
        .extract({ left: it.cropX, top: it.cropY, width: it.cropW, height: it.cropH })
        .png({ compressionLevel: 9 })
        .toFile(tmp)
      try { rmSync(it.file) } catch {}
      renameSync(tmp, it.file)
    } else {
      const sub = isDefaultLetters ? (it.file.includes('uppercase') ? 'uppercase' : 'lowercase') : ''
      const out = isDefaultLetters ? join(outRoot, sub, basename(it.file)) : join(outRoot, basename(it.file))
      await sharp(it.file)
        .extract({ left: it.cropX, top: it.cropY, width: it.cropW, height: it.cropH })
        .png({ compressionLevel: 9 })
        .toFile(out)
    }
    done++
    if (done % 10 === 0) process.stdout.write(`Cropped ${done}/${all.length}\n`)
  }
  const outLabel = mode === 'exec-inplace' ? 'inplace' : outRoot
  process.stdout.write(`Crop completed. Files: ${done}. Output: ${outLabel}\n`)
}

main().catch(e => { process.stderr.write(String(e)); process.exit(1) })
