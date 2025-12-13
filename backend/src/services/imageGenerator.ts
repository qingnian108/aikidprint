import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getLetterImage, getRandomAnimalImages, getRandomDecorImages, getThemeBorders, getThemeCharacter, getThemeColorAssets, getThemeMainLineAssets, getThemeMainColorAssets, isImageFile, getRandomTitleIcon, getThemeColor, getRandomLineArt, getCreativePromptImage } from '../utils/imageHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../../public/generated/worksheets');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export class ImageGenerator {
    private browser: any = null;

    async initialize() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
    }

    /**
     * 生成通用的页面基础样式
     */
    private getBaseStyles(themeColors: { primary: string; secondary: string; accent: string; light: string }): string {
        return `
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            height: 1123px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 794px;
            height: 1123px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: auto;
            min-height: 52px;
            padding: 14px 36px 12px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 600;
            color: #2e2e2e;
        }
        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }
        .dash-line {
            display: inline-block;
            height: 0;
            width: 180px;
            border-bottom: 2px dashed #b8c0cc;
            transform: translateY(6px);
            vertical-align: middle;
        }
        .dash-line.short { width: 180px; }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 24px 18px 16px;
            background: transparent;
            border-radius: 16px;
            border: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
        }
        .title-row {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 800;
            color: ${themeColors.accent};
            margin-top: 2px;
        }
        .title-row .main {
            font-size: 38px;
            line-height: 1.1;
        }
        .title-row .title-icon {
            width: 68px;
            height: 68px;
            object-fit: contain;
        }
        .border-sticker {
            position: absolute;
            width: 36px;
            height: 36px;
            object-fit: contain;
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }
        `;
    }

    /**
     * 生成带图标的标题 HTML
     * 图标随机出现在标题左侧或右侧
     */
    private getTitleHtml(title: string, titleIcon: string): string {
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const iconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        
        return `
            <div class="title-row">
                ${iconPosition === 'left' ? iconHtml : ''}
                <div class="main">${title}</div>
                ${iconPosition === 'right' ? iconHtml : ''}
            </div>
        `;
    }

    /**
     * 生成贴纸 HTML
     */
    private getStickersHtml(themeKey: string): string {
        const borderImages = getThemeBorders(themeKey, 16);
        const borderPool: string[] = [...borderImages];
        const baseLen = borderImages.length;
        if (baseLen > 0) {
            while (borderPool.length < 16) {
                borderPool.push(borderImages[borderPool.length % baseLen]);
            }
        }
        for (let i = borderPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [borderPool[i], borderPool[j]] = [borderPool[j], borderPool[i]];
        }

        const stickerPlacementsLeft = [
            { top: '110px', left: '2px', rotate: -6 },
            { top: '230px', left: '2px', rotate: 4 },
            { top: '350px', left: '2px', rotate: -3 },
            { top: '470px', left: '2px', rotate: 6 },
            { top: '590px', left: '2px', rotate: -4 },
            { top: '710px', left: '2px', rotate: 5 },
            { top: '830px', left: '2px', rotate: -5 },
            { top: '950px', left: '2px', rotate: 3 },
        ];
        const stickerPlacementsRight = [
            { top: '110px', right: '2px', rotate: 6 },
            { top: '230px', right: '2px', rotate: -4 },
            { top: '350px', right: '2px', rotate: 5 },
            { top: '470px', right: '2px', rotate: -5 },
            { top: '590px', right: '2px', rotate: 4 },
            { top: '710px', right: '2px', rotate: -4 },
            { top: '830px', right: '2px', rotate: 6 },
            { top: '950px', right: '2px', rotate: -3 }
        ];

        const perSide = Math.min(8, Math.floor(borderPool.length / 2));
        const stickersLeft = borderPool.slice(0, perSide);
        const stickersRight = borderPool.slice(perSide, perSide * 2);

        const stickerHtmlLeft = stickersLeft.map((src: string, idx: number) => {
            const placement = stickerPlacementsLeft[idx];
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="top:${placement.top};left:${placement.left};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtmlRight = stickersRight.map((src: string, idx: number) => {
            const placement = stickerPlacementsRight[idx];
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="top:${placement.top};right:${placement.right};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        return stickerHtmlLeft + stickerHtmlRight;
    }

    async generateMazePage(data: any): Promise<string> {
        await this.initialize();

        const { content = {}, theme = 'dinosaur', mazeImageUrl = '', difficulty = 'medium' } = data || {};
        const themeKey = String(content.theme || theme || 'dinosaur').toLowerCase();
        const mazeUrl = content.mazeImageUrl || mazeImageUrl || '';
        const level = String(content.difficulty || difficulty || 'medium');

        // 贴纸与逻辑模板相同
        const borderImages = getThemeBorders(themeKey, 16);
        const borderPool: string[] = [...borderImages];
        const baseLen = borderImages.length;
        if (baseLen > 0) {
            while (borderPool.length < 16) {
                borderPool.push(borderImages[borderPool.length % baseLen]);
            }
        }
        for (let i = borderPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [borderPool[i], borderPool[j]] = [borderPool[j], borderPool[i]];
        }

        const stickerPlacementsLeft: Array<{ top: string; left: string; rotate: number }> = [
            { top: '110px', left: '2px', rotate: -6 },
            { top: '230px', left: '2px', rotate: 4 },
            { top: '350px', left: '2px', rotate: -3 },
            { top: '470px', left: '2px', rotate: 6 },
            { top: '590px', left: '2px', rotate: -4 },
            { top: '710px', left: '2px', rotate: 5 },
            { top: '830px', left: '2px', rotate: -5 },
            { top: '950px', left: '2px', rotate: 3 },
        ];
        const stickerPlacementsRight: Array<{ top: string; right: string; rotate: number }> = [
            { top: '110px', right: '2px', rotate: 6 },
            { top: '230px', right: '2px', rotate: -4 },
            { top: '350px', right: '2px', rotate: 5 },
            { top: '470px', right: '2px', rotate: -5 },
            { top: '590px', right: '2px', rotate: 4 },
            { top: '710px', right: '2px', rotate: -4 },
            { top: '830px', right: '2px', rotate: 6 },
            { top: '950px', right: '2px', rotate: -3 }
        ];

        const perSide = Math.min(
            Math.floor(borderPool.length / 2),
            stickerPlacementsLeft.length,
            stickerPlacementsRight.length
        );
        const stickersLeft = borderPool.slice(0, perSide);
        const stickersRight = borderPool.slice(perSide, perSide * 2);

        const stickerHtmlLeft = stickersLeft.map((src: string, idx: number) => {
            const placement = stickerPlacementsLeft[idx];
            const pos = `top:${placement.top};left:${placement.left}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtmlRight = stickersRight.map((src: string, idx: number) => {
            const placement = stickerPlacementsRight[idx];
            const pos = `top:${placement.top};right:${placement.right}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtml = stickerHtmlLeft + stickerHtmlRight;

        // 随机获取标题图标和主题配�?
        const titleIcon = getRandomTitleIcon(themeKey);
        const themeColors = getThemeColor(themeKey);
        
        // 随机决定图标位置（左或右�?
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        // 迷宫入口/出口图标（根据主题选择�?
        const mazeIconsMap: Record<string, { start: string; end: string }> = {
            dinosaur: {
                start: '/uploads/assets/A_main_assets/dinosaur/color/dinosaur_000_color.png',
                end: '/uploads/assets/A_main_assets/dinosaur/color/dinosaur_019_color.png'
            },
            ocean: {
                start: '/uploads/assets/A_main_assets/ocean/color/ocean_013_color.png',
                end: '/uploads/assets/A_main_assets/ocean/color/ocean_012_color.png'
            },
            space: {
                start: '/uploads/assets/A_main_assets/space/color/space_001_color.png',
                end: '/uploads/assets/A_main_assets/space/color/space_003_color.png'
            },
            unicorn: {
                start: '/uploads/assets/A_main_assets/unicorn/color/unicorn_002_color.png',
                end: '/uploads/assets/A_main_assets/unicorn/color/unicorn_000_color.png'
            },
            vehicles: {
                start: '/uploads/assets/A_main_assets/vehicles/color/vehicles_013_color.png',
                end: '/uploads/assets/A_main_assets/vehicles/color/vehicles_021_color.png'
            },
            safari: {
                start: '/uploads/assets/A_main_assets/safari/color/safari_001_color.png',
                end: '/uploads/assets/A_main_assets/safari/color/safari_010_color.png'
            }
        };
        const mazeIcons = mazeIconsMap[themeKey] || mazeIconsMap['dinosaur'];
        const cornerLeft = mazeIcons.start;
        const cornerRight = mazeIcons.end;

        // 某些主题的左上角图标需要翻转（对称），某些不需�?
        const flipLeftIcon = themeKey !== 'space'; // 太空主题不翻�?

        // 根据难度调整图标位置（迷宫大小不同，入口出口位置也不同）
        const cornerPositions: Record<string, { left: { top: string; left: string }; right: { bottom: string; right: string } }> = {
            easy: {
                left: { top: '310px', left: '80px' },
                right: { bottom: '235px', right: '80px' }
            },
            medium: {
                left: { top: '285px', left: '60px' },
                right: { bottom: '215px', right: '60px' }
            },
            hard: {
                left: { top: '260px', left: '40px' },
                right: { bottom: '195px', right: '40px' }
            }
        };
        const positions = cornerPositions[level] || cornerPositions['medium'];

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            height: 1123px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 794px;
            height: 1123px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: auto;
            min-height: 52px;
            padding: 14px 36px 12px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 600;
            color: #2e2e2e;
        }
        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }
        .dash-line {
            display: inline-block;
            height: 0;
            width: 180px;
            border-bottom: 2px dashed #b8c0cc;
            transform: translateY(6px);
            vertical-align: middle;
        }
        .dash-line.short { width: 180px; }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 24px 18px 16px;
            background: transparent;
            border-radius: 16px;
            border: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
        }
        .title-row {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 800;
            color: ${themeColors.accent};
            margin-top: 2px;
        }
        .title-row .main {
            font-size: 38px;
            line-height: 1.1;
        }
        .title-row .title-icon {
            width: 68px;
            height: 68px;
            object-fit: contain;
        }
        .maze-wrapper {
            flex: 1;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px 0 10px;
        }
        .maze-box {
            margin: 0 auto;
            width: min(90%, 700px);
            aspect-ratio: 1 / 1;
            border: none;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: #fff;
        }
        .maze-box img {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        .maze-box {
            margin: 0 auto;
            width: min(90%, 700px);
            aspect-ratio: 1 / 1;
            border: none;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: #fff;
            position: relative;
        }
        .maze-box img {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
        .corner-img {
            position: absolute;
            width: 60px;
            height: 60px;
            object-fit: contain;
            pointer-events: none;
            z-index: 10;
        }
        .corner-left {
            top: ${positions.left.top};
            left: ${positions.left.left};
            ${flipLeftIcon ? 'transform: scaleX(-1);' : ''}
        }
        .corner-right {
            bottom: ${positions.right.bottom};
            right: ${positions.right.right};
        }
        .border-sticker {
            position: absolute;
            width: 36px;
            height: 36px;
            object-fit: contain;
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>

        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <div class="main">Maze</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            ${cornerLeft ? `<img class="corner-img corner-left" src="http://localhost:3000${cornerLeft}" />` : ''}
            ${cornerRight ? `<img class="corner-img corner-right" src="http://localhost:3000${cornerRight}" />` : ''}
            <div class="maze-wrapper">
                <div class="maze-box">
                    ${mazeUrl ? `<img src="http://localhost:3000${mazeUrl}" alt="maze">` : '<div style="color:#94a3b8;font-size:16px;">Maze will appear here</div>'}
                </div>
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;

        const filename = `maze-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generatePatternCompletion(data: any): Promise<string> {
        await this.initialize();

        const pages = Array.isArray((data as any)?.content)
            ? (data as any).content
            : [data?.content || data || {}];

        const pagesHtml = pages.map((pageData: any) => {
            const rows = Array.isArray(pageData?.rows) ? pageData.rows : [];
            const htmlRows = rows.map((seq: (string | null)[]) => {
                const cells = seq.map((cell: string | null) => {
                    if (cell === null) {
                        return `<div class="cell missing"></div>`;
                    }
                    return isImageFile(cell)
                        ? `<div class="cell"><img src="http://localhost:3000${cell}" /></div>`
                        : `<div class="cell"><span class="emoji">${cell}</span></div>`;
                }).join('');
                return `<div class="row">${cells}</div>`;
            }).join('');

            return `
            <div class="page">
                <div class="title">Complete the Pattern</div>
                <div class="board">
                    ${htmlRows}
                </div>
            </div>
            `;
        }).join('<div class="page-break"></div>');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
    </style>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            min-height: 1123px;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
        }
        .page {
            width: 794px;
            height: 1123px;
            padding: 32px 32px 46px;
            page-break-after: always;
        }
        .title {
            text-align: center;
            font-size: 32px;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 16px;
        }
        .board {
            width: 640px;
            margin: 40px auto 0;
            display: flex;
            flex-direction: column;
            gap: 30px;
        }
        .row {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 20px;
            align-items: center;
            justify-items: center;
        }
        .cell {
            width: 104px;
            height: 104px;
            border: 1px dashed #cbd5e1;
            border-radius: 12px;
            background: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
        }
        .cell img {
            max-width: 96px;
            max-height: 96px;
            object-fit: contain;
        }
        .cell .emoji {
            font-size: 72px;
        }
        .cell.missing {
            background: #fff;
            border: 2px dashed #0f172a;
        }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    ${pagesHtml}
</body>
</html>
        `;

        const filename = `pattern-completion-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateUppercaseTracing(data: any): Promise<string> {
        await this.initialize();

        const { letter, theme = 'dinosaur' } = data;
        const upperLetter = String(letter || 'A').toUpperCase().charAt(0) || 'A';
        const themeKey = String(theme || 'dinosaur').toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        
        // 随机决定图标位置（左或右�?
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        const { image: mainImage, word } = getLetterImage(upperLetter);
        const characterImage = getThemeCharacter(themeKey);
        const borderImages = getThemeBorders(themeKey, 16);
        // 保证左右�?8 个：若素材不�?16，则循环补齐�?16，再洗牌
        const borderPool: string[] = [...borderImages];
        const baseLen = borderImages.length;
        if (baseLen > 0) {
            while (borderPool.length < 16) {
                borderPool.push(borderImages[borderPool.length % baseLen]);
            }
        }
        for (let i = borderPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [borderPool[i], borderPool[j]] = [borderPool[j], borderPool[i]];
        }

        // 使用 uploads/letters/uppercase 中的描红 PNG
        const tracingRel = `/uploads/letters/uppercase/${upperLetter}_uppercase_tracing.png`;
        const tracingFull = path.join(__dirname, '../../public', tracingRel);
        const tracingImage = fs.existsSync(tracingFull) ? tracingRel : '';

        // 贴纸放置在安全区域外�?40px 边距�?
        // 40px 边距大于贴纸�?36px，水平居中放�?band 区域�?40-36)/2 = 2
        const stickerPlacementsLeft: Array<{ top: string; left: string; rotate: number }> = [
            { top: '110px', left: '2px', rotate: -6 },
            { top: '230px', left: '2px', rotate: 4 },
            { top: '350px', left: '2px', rotate: -3 },
            { top: '470px', left: '2px', rotate: 6 },
            { top: '590px', left: '2px', rotate: -4 },
            { top: '710px', left: '2px', rotate: 5 },
            { top: '830px', left: '2px', rotate: -5 },
            { top: '950px', left: '2px', rotate: 3 },
        ];
        const stickerPlacementsRight: Array<{ top: string; right: string; rotate: number }> = [
            { top: '110px', right: '2px', rotate: 6 },
            { top: '230px', right: '2px', rotate: -4 },
            { top: '350px', right: '2px', rotate: 5 },
            { top: '470px', right: '2px', rotate: -5 },
            { top: '590px', right: '2px', rotate: 4 },
            { top: '710px', right: '2px', rotate: -4 },
            { top: '830px', right: '2px', rotate: 6 },
            { top: '950px', right: '2px', rotate: -3 }
        ];

        const perSide = Math.min(
            Math.floor(borderPool.length / 2),
            stickerPlacementsLeft.length,
            stickerPlacementsRight.length
        );
        const stickersLeft = borderPool.slice(0, perSide);
        const stickersRight = borderPool.slice(perSide, perSide * 2);

        const stickerHtmlLeft = stickersLeft.map((src: string, idx: number) => {
            const placement = stickerPlacementsLeft[idx];
            const pos = `top:${placement.top};left:${placement.left}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtmlRight = stickersRight.map((src: string, idx: number) => {
            const placement = stickerPlacementsRight[idx];
            const pos = `top:${placement.top};right:${placement.right}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtml = stickerHtmlLeft + stickerHtmlRight;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            height: 1123px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 794px;
            height: 1123px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: auto;
            min-height: 52px;
            padding: 14px 36px 12px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 600;
            color: #2e2e2e;
        }
        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }
        .dash-line {
            display: inline-block;
            height: 0;
            width: 180px;
            border-bottom: 2px dashed #b8c0cc;
            transform: translateY(6px);
            vertical-align: middle;
        }
        .dash-line.short { width: 180px; }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 24px 18px 16px;
            background: transparent;
            border-radius: 16px;
            border: none;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .title-row {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 800;
            color: ${themeColors.accent};
        }
        .title-row .main {
            font-size: 26px;
            line-height: 1.1;
        }
        .title-row .title-icon {
            width: 46px;
            height: 46px;
            object-fit: contain;
        }
        .main-row {
            position: relative;
            display: flex;
            gap: 12px;
            align-items: flex-start;
            margin-bottom: 14px;
        }
        .tracing-card {
            flex: 1 1 62%;
            min-width: 360px;
            max-width: 440px;
            background: transparent;
            border: none;
            border-radius: 12px;
            box-shadow: none;
            padding: 12px 12px 12px 16px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            min-height: 380px;
            position: relative;
        }
        .tracing-card img {
            width: auto;
            height: 380px;
            max-width: 380px;
            object-fit: contain;
            background: transparent;
        }
        .fallback-letter {
            font-size: 300px;
            font-weight: 800;
            color: #1e293b;
            line-height: 1;
        }
        .character-in-letter {
            position: absolute;
            right: 12px;
            bottom: 12px;
            width: 170px;
            height: 190px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            pointer-events: none;
            border-radius: 12px;
            padding: 6px;
            background: transparent;
        }
        .character-in-letter img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .word-card {
            width: 200px;
            flex-shrink: 0;
            margin-left: auto;
            background: rgba(232, 247, 244, 0.2);
            border: none;
            border-radius: 12px;
            box-shadow: none;
            padding: 12px 12px 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: center;
        }
        .word-image {
            width: 150px;
            height: 120px;
            background: transparent;
            border-radius: 12px;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 72px;
            padding: 6px;
        }
        .word-image img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .word-label {
            font-size: 20px;
            font-weight: 700;
            color: #364152;
            letter-spacing: 0.5px;
        }
        .trace-box {
            background: rgba(232, 247, 244, 0.2);
            padding: 12px 14px;
            border: 2px solid ${themeColors.primary};
            border-radius: 16px;
            margin-bottom: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .box-title {
            font-size: 13px;
            font-weight: 800;
            color: #4b5563;
            text-transform: uppercase;
            margin-bottom: 8px;
            text-align: center;
            width: 100%;
        }
        .trace-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0;
            width: 100%;
        }
        .trace-char {
            font-size: 96px;
            color: #cbd5e1;
            font-weight: 700;
            font-family: 'Quicksand', sans-serif;
            line-height: 1;
            text-align: center;
        }
        .trace-char.solid {
            color: #1f2933;
        }
        .practice {
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            min-height: 260px;
            padding: 8px 6px 4px;
            border: none;
            border-radius: 0;
            flex: 1;
        }
        .practice-title {
            font-size: 15px;
            font-weight: 800;
            color: #475569;
        }
        .practice-lines {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            gap: 30px;
        }
        .writing-group {
            display: flex;
            flex-direction: column;
            gap: 40px;
        }
        .writing-gap {
            height: 18px;
        }
        .writing-line {
            height: 0;
            border: none;
            border-bottom: 2px solid #5a6473;
            border-radius: 2px;
        }
        .writing-line.dashed {
            border-bottom-style: dashed;
            border-bottom-color: #a2acbb;
            border-bottom-width: 2px;
        }
        .border-sticker {
            position: absolute;
            width: 36px;
            height: 36px;
            object-fit: contain;
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }
        .footer {
            position: absolute;
            bottom: 16px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #b0b8c4;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>

        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <div class="main">Uppercase Letter Tracing</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="main-row">
                <div class="tracing-card">
                    ${tracingImage
                        ? `<img src="http://localhost:3000${tracingImage}" alt="Tracing ${upperLetter}">`
                        : `<div class="fallback-letter">${upperLetter}</div>`}
                    <div class="character-in-letter">
                        ${isImageFile(characterImage)
                            ? `<img src="http://localhost:3000${characterImage}" alt="${themeKey} character">`
                            : characterImage}
                    </div>
                </div>
                <div class="word-card">
                    <div class="word-image">
                        ${isImageFile(mainImage)
                            ? `<img src="http://localhost:3000${mainImage}" alt="${word}">`
                            : mainImage}
                    </div>
                    <div class="word-label">${word}</div>
                </div>
            </div>

            <div class="trace-box">
                <div class="box-title">Uppercase</div>
                <div class="trace-row">
                    <div class="trace-char solid">${upperLetter}</div>
                    ${Array(4).fill(upperLetter).map(l => `<div class="trace-char">${l}</div>`).join('')}
                </div>
            </div>

            <div class="practice">
                <div class="practice-title">Practice Writing:</div>
                <div class="practice-lines">
                    <div class="writing-group">
                        <div class="writing-line"></div>
                        <div class="writing-line dashed"></div>
                        <div class="writing-line"></div>
                    </div>
                    <div class="writing-group">
                        <div class="writing-line"></div>
                        <div class="writing-line dashed"></div>
                        <div class="writing-line"></div>
                    </div>
                </div>
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;

        const filename = `uppercase-${upperLetter}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    /**
     * 生成 Alphabet Sequencing 页面
     * 填写缺失的字母完成字母序列
     */
    async generateAlphabetSequencing(data: any): Promise<string> {
        await this.initialize();
        
        const content = data?.content || data || {};
        const { theme = 'dinosaur', rows = [] } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);
        
        // 生成行 HTML
        const rowsHtml = rows.map((row: any) => {
            const cellsHtml = row.sequence.map((letter: string | null) => {
                if (letter === null) {
                    return `<div class="cell blank-box"><div class="box-inner"></div></div>`;
                }
                return `<div class="cell letter">${letter}</div>`;
            }).join('');
            return `
                <div class="row">
                    <div class="writing-lines">
                        <div class="line top-line"></div>
                        <div class="line mid-line"></div>
                        <div class="line bottom-line"></div>
                    </div>
                    <div class="cells">${cellsHtml}</div>
                </div>
            `;
        }).join('');
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 20px 0 10px 0;
            display: flex;
            flex-direction: column;
        }
        .title-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 15px;
        }
        .title-row .main {
            font-size: 32px;
            font-weight: 900;
            color: #0f172a;
        }
        .title-icon {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }
        .content-box {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            padding: 0;
        }
        .row {
            position: relative;
            height: 145px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .writing-lines {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 20px 0;
        }
        .line {
            width: 100%;
            height: 0;
            border-bottom: 2px solid #333;
        }
        .mid-line {
            border-bottom-style: dashed;
            border-color: #999;
        }
        .cells {
            position: relative;
            z-index: 1;
            display: flex;
            justify-content: space-around;
            align-items: center;
            width: 100%;
            padding: 0;
        }
        .cell {
            width: 140px;
            height: 105px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .cell.letter {
            font-size: 85px;
            font-weight: 900;
            color: #000;
            font-family: 'Arial Black', 'Quicksand', sans-serif;
        }
        .cell.blank-box .box-inner {
            width: 80px;
            height: 80px;
            border: 3px solid #000;
            border-radius: 10px;
            background: #fff;
        }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <span class="main">Alphabet Sequencing</span>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="content-box">
                ${rowsHtml}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;
        
        const filename = `alphabet-sequencing-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        
        return `/generated/worksheets/${filename}`;
    }

    /**
     * 生成 Beginning Sounds 页面
     * 匹配图片和首字母 - 左侧字母卡片，右侧图片卡片，中间连线
     */
    async generateBeginningSounds(data: any): Promise<string> {
        await this.initialize();
        
        const content = data?.content || data || {};
        const { letterSet = 'A-E', theme = 'dinosaur', items = [], shuffledItems = [] } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);
        
        // 卡片背景颜色
        const cardColors = [
            '#E3F2FD', // 浅蓝
            '#F3E5F5', // 浅紫
            '#FFF3E0', // 浅橙
            '#E8F5E9', // 浅绿
            '#FFF8E1', // 浅黄
            '#FCE4EC', // 浅粉
            '#E0F7FA', // 浅青
            '#FBE9E7', // 浅珊瑚
        ];
        
        // 字母对应的颜色（用于字母本身）
        const letterColors = [
            '#F48FB1', // 粉红
            '#CE93D8', // 紫色
            '#80CBC4', // 青绿
            '#A5D6A7', // 绿色
            '#FFE082', // 黄色
            '#FFAB91', // 橙色
            '#90CAF9', // 蓝色
            '#B39DDB', // 淡紫
        ];
        
        // 生成左侧字母卡片 HTML
        const leftCardsHtml = items.map((item: any, index: number) => `
            <div class="card letter-card" style="background: ${cardColors[index % cardColors.length]};">
                <span class="letter" style="color: ${letterColors[index % letterColors.length]};">${item.letter}</span>
            </div>
        `).join('');
        
        // 生成右侧图片卡片 HTML（使用打乱后的顺序）
        const rightCardsHtml = shuffledItems.map((item: any, index: number) => `
            <div class="card image-card" style="background: ${cardColors[(index + 3) % cardColors.length]};">
                <img class="card-image" src="http://localhost:3000${item.image}" alt="${item.word}" />
            </div>
        `).join('');
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 24px 0 16px 0;
            display: flex;
            flex-direction: column;

        }
        .title-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        .title-row .main {
            font-size: 32px;
            font-weight: 900;
            color: #0f172a;
        }
        .title-icon {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }
        .content-box {
            flex: 1;
            position: relative;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .columns-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 220px;
        }
        .left-column {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 27px;
        }
        .right-column {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 27px;
        }
        .card {
            width: 110px;
            height: 110px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 3px solid rgba(255,255,255,0.8);
        }
        .letter-card .letter {
            font-size: 72px;
            font-weight: 900;
            font-family: 'Comic Sans MS', 'Chalkboard', cursive;
            text-shadow: 2px 2px 0 rgba(255,255,255,0.8);
        }
        .image-card {
            padding: 6px;
        }
        .card-image {
            width: 90px;
            height: 90px;
            object-fit: contain;
        }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <span class="main">Beginning Sounds: ${letterSet}</span>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="content-box">
                <div class="columns-wrapper">
                    <div class="left-column">
                        ${leftCardsHtml}
                    </div>
                    <div class="right-column">
                        ${rightCardsHtml}
                    </div>
                </div>
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;
        
        const filename = `beginning-sounds-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        
        return `/generated/worksheets/${filename}`;
    }

    /**
     * 生成 CVC Words 页面
     * 简单的 CVC 单词练习 - 按照规范，中间安全区留空
     */
    async generateCVCWordsPage(data: any): Promise<string> {
        await this.initialize();
        
        const content = data?.content || data || {};
        const { wordFamily = 'at', theme = 'dinosaur', words = [] } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);
        
        // 卡片背景颜色
        const cardBgColors = [
            '#DBEAFE', // 浅蓝
            '#FCE7F3', // 浅粉
            '#CFFAFE', // 浅青
            '#D1FAE5', // 浅绿
            '#E9D5FF', // 浅紫
            '#FEF3C7', // 浅黄
        ];
        
        // 可用的 CVC 单词和对应的图片文件名（首字母大写）
        const availableCvcWords = [
            { word: 'cat', image: 'Cat' },
            { word: 'dog', image: 'Dog' },
            { word: 'hat', image: 'Hat' },
            { word: 'pig', image: 'Pig' },
            { word: 'sun', image: 'Sun' },
            { word: 'van', image: 'Van' },
            { word: 'net', image: 'Net' },
            { word: 'jam', image: 'Jam' },
            { word: 'egg', image: 'Egg' },
            { word: 'ant', image: 'Ant' },
            { word: 'bee', image: 'Bee' },
            { word: 'car', image: 'Car' },
        ];
        
        // 获取单词对应的图片
        const getWordImage = (word: string) => {
            const found = availableCvcWords.find(w => w.word === word.toLowerCase());
            if (found) {
                return `/uploads/bigpng/${found.image}.png`;
            }
            // 默认尝试首字母大写
            return `/uploads/bigpng/${word.charAt(0).toUpperCase() + word.slice(1)}.png`;
        };
        
        // 随机选择6个单词
        const shuffled = [...availableCvcWords].sort(() => Math.random() - 0.5);
        const displayWords = shuffled.slice(0, 6).map(w => w.word);
        
        const cardsHtml = displayWords.map((word: string, idx: number) => {
            const bgColor = cardBgColors[idx % cardBgColors.length];
            const letters = word.split('');
            const letterBoxes = letters.map(() => `
                <div class="letter-box">
                    <div class="letter-line"></div>
                </div>
            `).join('');
            
            return `
                <div class="word-card">
                    <div class="image-area" style="background: ${bgColor};">
                        <img class="word-image" src="http://localhost:3000${getWordImage(word)}" alt="${word}" />
                    </div>
                    <div class="letters-area">
                        ${letterBoxes}
                    </div>
                </div>
            `;
        }).join('');
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 20px 0 10px 0;
            display: flex;
            flex-direction: column;
        }
        .title-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 15px;
        }
        .title-row .main {
            font-size: 32px;
            font-weight: 900;
            color: #0f172a;
        }
        .title-icon {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }
        .content-box {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .cards-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, 1fr);
            gap: 35px 20px;
            padding: 10px;
        }
        .word-card {
            width: 200px;
            border: 3px solid #1f2937;
            border-radius: 20px;
            overflow: hidden;
            background: #fff;
        }
        .image-area {
            height: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 16px 16px 0 0;
            margin: 4px 4px 0 4px;
        }
        .word-image {
            width: 140px;
            height: 140px;
            object-fit: contain;
        }
        .letters-area {
            display: flex;
            justify-content: center;
            gap: 8px;
            padding: 15px 10px 20px 10px;
            background: #fff;
        }
        .letter-box {
            width: 50px;
            height: 55px;
            border: 2px dashed #9ca3af;
            border-radius: 8px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 8px;
        }
        .letter-line {
            width: 30px;
            height: 3px;
            background: #374151;
        }
        .divider {
            position: absolute;
            top: 60px;
            left: 16px;
            width: calc(100% - 32px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <span class="main">CVC Words</span>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="content-box">
                <div class="cards-grid">
                    ${cardsHtml}
                </div>
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;
        
        const filename = `cvc-words-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        
        return `/generated/worksheets/${filename}`;
    }

    /**
     * 生成 Match Uppercase & Lowercase 页面
     * 大小写字母配对 - 左边大写顺序，右边小写打乱
     */
    async generateMatchUpperLower(data: any): Promise<string> {
        await this.initialize();
        
        const content = data?.content || data || {};
        const { letterSet = 'A-F', theme = 'dinosaur', uppercase = [], lowercase = [] } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);
        
        // 默认字母集
        const defaultUppercase = ['A', 'B', 'C', 'D', 'E', 'F'];
        const displayUppercase = uppercase.length > 0 ? uppercase : defaultUppercase;
        
        // 打乱小写字母顺序
        const defaultLowercase = displayUppercase.map((l: string) => l.toLowerCase());
        const displayLowercase = lowercase.length > 0 ? lowercase : 
            [...defaultLowercase].sort(() => Math.random() - 0.5);
        
        // 生成左侧大写字母 HTML
        const leftLettersHtml = displayUppercase.map((letter: string) => `
            <div class="letter-item">${letter}</div>
        `).join('');
        
        // 生成右侧小写字母 HTML
        const rightLettersHtml = displayLowercase.map((letter: string) => `
            <div class="letter-item">${letter}</div>
        `).join('');
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 20px 0 10px 0;
            display: flex;
            flex-direction: column;
        }
        .title-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 10px;
        }
        .title-row .main {
            font-size: 32px;
            font-weight: 900;
            color: #0f172a;
        }
        .title-icon {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }
        .subtitle {
            text-align: center;
            font-size: 16px;
            font-weight: 600;
            color: #64748b;
            margin-bottom: 20px;
            font-style: italic;
        }
        .content-box {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .columns-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 280px;
        }
        .left-column, .right-column {
            display: flex;
            flex-direction: column;
            gap: 43px;
        }
        .letter-item {
            font-size: 72px;
            font-weight: 900;
            font-family: 'Arial Black', sans-serif;
            color: #1f2937;
            line-height: 1;
        }
        .divider {
            position: absolute;
            top: 60px;
            left: 16px;
            width: calc(100% - 32px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <span class="main">Match Uppercase & Lowercase</span>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="content-box">
                <div class="columns-wrapper">
                    <div class="left-column">
                        ${leftLettersHtml}
                    </div>
                    <div class="right-column">
                        ${rightLettersHtml}
                    </div>
                </div>
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;
        
        const filename = `match-upper-lower-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        
        return `/generated/worksheets/${filename}`;
    }

    /**
     * 生成 Which is More? 页面
     * 比较两组物体数量 - 3行，每行左右两组图片，每组放在方框里
     */
    async generateWhichIsMore(data: any): Promise<string> {
        await this.initialize();
        
        const content = data?.content || data || {};
        const { difficulty = 'easy', theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);
        
        // 根据难度设置数量范围
        const maxCount = difficulty === 'medium' ? 10 : 5;
        const minCount = 1;
        
        // 从主题文件夹获取图片
        const mainAssetsDir = path.join(__dirname, '../../public/uploads/assets/A_main_assets', themeKey, 'color');
        let themeImages: string[] = [];
        
        try {
            const files = fs.readdirSync(mainAssetsDir);
            themeImages = files
                .filter(f => f.endsWith('.png'))
                .map(f => `/uploads/assets/A_main_assets/${themeKey}/color/${f}`);
        } catch (e) {
            themeImages = [
                '/uploads/assets/A_main_assets/dinosaur/color/dinosaur_000_color.png',
                '/uploads/assets/A_main_assets/dinosaur/color/dinosaur_001_color.png',
                '/uploads/assets/A_main_assets/dinosaur/color/dinosaur_002_color.png',
            ];
        }
        
        // 随机选择3个不同的图片用于3行
        const shuffled = [...themeImages].sort(() => Math.random() - 0.5);
        const selectedImages = shuffled.slice(0, 3);
        while (selectedImages.length < 3) {
            selectedImages.push(themeImages[selectedImages.length % themeImages.length]);
        }
        
        // 生成3行比较数据
        const rows = [];
        for (let i = 0; i < 3; i++) {
            const leftCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
            let rightCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
            // 确保左右数量不同
            while (rightCount === leftCount) {
                rightCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
            }
            rows.push({
                image: selectedImages[i],
                leftCount,
                rightCount
            });
        }
        
        // 生成行 HTML - 每组图片放在方框里，图片排列成网格
        const rowsHtml = rows.map((row, idx) => {
            // 根据数量决定每行显示几个图片
            const itemsPerRow = row.leftCount <= 5 ? row.leftCount : 5;
            const leftImages = Array(row.leftCount).fill(0).map(() => 
                `<img class="item-img" src="http://localhost:3000${row.image}" />`
            ).join('');
            
            const rightItemsPerRow = row.rightCount <= 5 ? row.rightCount : 5;
            const rightImages = Array(row.rightCount).fill(0).map(() => 
                `<img class="item-img" src="http://localhost:3000${row.image}" />`
            ).join('');
            
            return `
                <div class="compare-row">
                    <div class="group-wrapper">
                        <div class="group-box">
                            <div class="items-grid">${leftImages}</div>
                        </div>
                        <div class="answer-box"></div>
                    </div>
                    <div class="group-wrapper">
                        <div class="group-box">
                            <div class="items-grid">${rightImages}</div>
                        </div>
                        <div class="answer-box"></div>
                    </div>
                </div>
            `;
        }).join('');
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 20px 0 10px 0;
            display: flex;
            flex-direction: column;
        }
        .title-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        .title-row .main {
            font-size: 32px;
            font-weight: 900;
            color: #0f172a;
        }
        .title-icon {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }
        .content-box {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 25px;
            padding: 0 15px;
        }
        .compare-row {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 30px;
        }
        .group-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        .group-box {
            width: 260px;
            height: 180px;
            border: 3px solid ${themeColors.primary};
            border-radius: 16px;
            background: ${themeColors.light};
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px;
        }
        .items-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            align-content: center;
            gap: 8px;
            max-width: 230px;
        }
        .item-img {
            width: 42px;
            height: 42px;
            object-fit: contain;
        }
        .answer-box {
            width: 40px;
            height: 40px;
            border: 3px solid ${themeColors.primary};
            border-radius: 8px;
            background: #fff;
        }
        .divider {
            position: absolute;
            top: 60px;
            left: 16px;
            width: calc(100% - 32px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <span class="main">Which is More?</span>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="content-box">
                ${rowsHtml}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;
        
        const filename = `which-is-more-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        
        return `/generated/worksheets/${filename}`;
    }

    /**
     * 生成 Number Bonds to 10 页面
     */
    async generateNumberBonds(data: any): Promise<string> {
        await this.initialize();

        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);

        const baseBonds =
            Array.isArray((content as any)?.bonds) && (content as any).bonds.length > 0
                ? (content as any).bonds
                : (() => {
                      const all = [
                          { a: 0, b: 10 },
                          { a: 1, b: 9 },
                          { a: 2, b: 8 },
                          { a: 3, b: 7 },
                          { a: 4, b: 6 },
                          { a: 5, b: 5 },
                          { a: 6, b: 4 },
                          { a: 7, b: 3 },
                          { a: 8, b: 2 },
                          { a: 9, b: 1 },
                          { a: 10, b: 0 }
                      ];
                      return all
                          .sort(() => Math.random() - 0.5)
                          .slice(0, 8)
                          .map((bond) => {
                              const hideFirst = Math.random() > 0.5;
                              return {
                                  ...bond,
                                  display: hideFirst ? { a: '_', b: bond.b } : { a: bond.a, b: '_' },
                                  answer: hideFirst ? bond.a : bond.b
                              };
                          });
                  })();

        const pastelPairs = [
            { left: '#c7f0c3', right: '#ffe7ad' },
            { left: '#f9c7d8', right: '#ffd7b8' },
            { left: '#cfc9ff', right: '#c0f3ff' },
            { left: '#d8f7c9', right: '#ffe0b5' },
            { left: '#cbe1ff', right: '#f9c7e8' },
            { left: '#c9f2d0', right: '#f7e7c9' },
            { left: '#ffe0b8', right: '#c9f2f2' },
            { left: '#f7d8ff', right: '#f0e7c9' }
        ];

        const bondCards = baseBonds.slice(0, 8).map((bond: any, idx: number) => {
            const leftValRaw = (bond as any)?.display?.a ?? (bond as any)?.a ?? '';
            const rightValRaw = (bond as any)?.display?.b ?? (bond as any)?.b ?? '';
            const leftText = leftValRaw === '_' ? '' : String(leftValRaw);
            const rightText = rightValRaw === '_' ? '' : String(rightValRaw);
            const palette = pastelPairs[idx % pastelPairs.length];
            return `
                <div class="bond-card">
                    <svg class="bond-svg" viewBox="0 0 160 190" xmlns="http://www.w3.org/2000/svg">
                        <line x1="80" y1="64" x2="36" y2="106" stroke="#111827" stroke-width="3.2" stroke-linecap="round" />
                        <line x1="80" y1="64" x2="124" y2="106" stroke="#111827" stroke-width="3.2" stroke-linecap="round" />
                        <circle cx="80" cy="36" r="30" fill="#dbeafe" stroke="#111827" stroke-width="3.2" />
                        <circle cx="36" cy="128" r="30" fill="${palette.left}" stroke="#111827" stroke-width="3.2" />
                        <circle cx="124" cy="128" r="30" fill="${palette.right}" stroke="#111827" stroke-width="3.2" />
                        <text x="80" y="44" text-anchor="middle" font-family="Quicksand, sans-serif" font-weight="800" font-size="22" fill="#111827">10</text>
                        <text x="36" y="136" text-anchor="middle" font-family="Quicksand, sans-serif" font-weight="800" font-size="22" fill="#111827">${leftText}</text>
                        <text x="124" y="136" text-anchor="middle" font-family="Quicksand, sans-serif" font-weight="800" font-size="22" fill="#111827">${rightText}</text>
                    </svg>
                </div>
            `;
        }).join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 24px 18px 16px;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
        }
        .title-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 6px;
        }
        .title-row .main {
            font-size: 32px;
            font-weight: 900;
            color: #0f172a;
        }
        .title-icon {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }
        .bonds-grid {
            width: 100%;
            flex: 1;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            column-gap: 40px;
            row-gap: 20px;
            justify-items: center;
            align-content: space-around;
            padding: 0 20px;
        }
        .bond-card {
            width: 180px;
            height: 190px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .bond-svg {
            width: 100%;
            height: 100%;
        }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <span class="main">Number Bonds to 10</span>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="bonds-grid">
                ${bondCards}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;

        const filename = `number-bonds-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    /**
     * 生成 Ten Frame Counting 页面
     */
    async generateTenFrame(data: any): Promise<string> {
        await this.initialize();
        
        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);
        
        // 生成6个十格框题目
        const problems = [];
        for (let i = 0; i < 6; i++) {
            const count = Math.floor(Math.random() * 10) + 1; // 1-10
            problems.push(count);
        }
        
        // 生成十格框 HTML - 5列2行，每个格子有边框
        const generateTenFrameHtml = (count: number) => {
            let cells = '';
            for (let i = 0; i < 10; i++) {
                const filled = i < count;
                cells += `<div class="tf-cell">${filled ? '<div class="dot"></div>' : ''}</div>`;
            }
            return `<div class="ten-frame">${cells}</div>`;
        };
        
        const problemsHtml = problems.map((count, idx) => `
            <div class="tf-problem">
                ${generateTenFrameHtml(count)}
                <div class="answer-box"></div>
            </div>
        `).join('');
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 20px 0 10px 0;
            display: flex;
            flex-direction: column;
        }
        .title-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        .title-row .main { font-size: 32px; font-weight: 900; color: #0f172a; }
        .title-icon { width: 60px; height: 60px; object-fit: contain; }
        .content-box {
            flex: 1;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(3, auto);
            gap: 50px 50px;
            padding: 0 20px;
            align-content: center;
            justify-content: center;
        }
        .tf-problem {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        .ten-frame {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            grid-template-rows: repeat(2, 1fr);
            width: 250px;
            height: 100px;
            border: 3px solid #1f2937;
            border-radius: 4px;
        }
        .tf-cell {
            border: 1.5px solid #1f2937;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .dot {
            width: 32px;
            height: 32px;
            background: ${themeColors.primary};
            border-radius: 50%;
        }
        .answer-box {
            width: 120px;
            height: 45px;
            border: 2px solid #1f2937;
            border-radius: 6px;
            background: #fff;
        }
        .divider {
            position: absolute;
            top: 60px;
            left: 16px;
            width: calc(100% - 32px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <span class="main">Ten Frame Counting</span>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="content-box">
                ${problemsHtml}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;
        
        const filename = `ten-frame-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    /**
     * 生成 Picture Addition 页面
     */
    async generatePictureAddition(data: any): Promise<string> {
        await this.initialize();
        
        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);
        
        // 从主题文件夹获取图片
        const mainAssetsDir = path.join(__dirname, '../../public/uploads/assets/A_main_assets', themeKey, 'color');
        let themeImages: string[] = [];
        try {
            const files = fs.readdirSync(mainAssetsDir);
            themeImages = files.filter(f => f.endsWith('.png')).map(f => `/uploads/assets/A_main_assets/${themeKey}/color/${f}`);
        } catch (e) {
            themeImages = ['/uploads/assets/A_main_assets/dinosaur/color/dinosaur_000_color.png'];
        }
        
        // 生成6道加法题，每边最多3个
        const problems = [];
        for (let i = 0; i < 6; i++) {
            const a = Math.floor(Math.random() * 3) + 1; // 1-3
            const b = Math.floor(Math.random() * 3) + 1; // 1-3
            const image = themeImages[Math.floor(Math.random() * themeImages.length)];
            problems.push({ a, b, sum: a + b, image });
        }
        
        // 生成居中的图片组（使用flexbox居中）
        const generateCenteredImages = (count: number, imageSrc: string) => {
            const images = Array(count).fill(0).map(() => `<img class="add-img" src="http://localhost:3000${imageSrc}" />`).join('');
            return images;
        };
        
        const problemsHtml = problems.map((p, idx) => {
            const leftImages = generateCenteredImages(p.a, p.image);
            const rightImages = generateCenteredImages(p.b, p.image);
            return `
                <div class="add-problem">
                    <div class="add-group left-group">${leftImages}</div>
                    <span class="add-sign">+</span>
                    <div class="add-group right-group">${rightImages}</div>
                    <span class="add-sign">=</span>
                    <div class="answer-box"></div>
                </div>
            `;
        }).join('');
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 20px 0 10px 0;
            display: flex;
            flex-direction: column;
        }
        .title-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 15px;
        }
        .title-row .main { font-size: 32px; font-weight: 900; color: #0f172a; }
        .title-icon { width: 60px; height: 60px; object-fit: contain; }
        .content-box {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 90px;
            padding: 0 10px;
        }
        .add-problem {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0;
        }
        .add-group {
            display: flex;
            gap: 10px;
            width: 200px;
            height: 55px;
            align-items: center;
            justify-content: center;
        }
        .add-img { width: 52px; height: 52px; object-fit: contain; }
        .add-sign { 
            font-size: 32px; 
            font-weight: 900; 
            color: #374151; 
            width: 60px;
            text-align: center;
        }
        .answer-box {
            width: 55px;
            height: 55px;
            border: 3px solid #374151;
            border-radius: 8px;
            background: #fff;
        }
        .divider {
            position: absolute;
            top: 60px;
            left: 16px;
            width: calc(100% - 32px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <span class="main">Picture Addition</span>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="content-box">
                ${problemsHtml}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;
        
        const filename = `picture-addition-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    /**
     * 生成 Count the Shapes 页面
     */
    async generateCountShapes(data: any): Promise<string> {
        await this.initialize();
        
        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);
        
        // 形状定义
        const shapes = [
            { name: 'circle', svg: '<circle cx="20" cy="20" r="18" fill="COLOR" stroke="#333" stroke-width="2"/>', color: '#F87171' },
            { name: 'square', svg: '<rect x="2" y="2" width="36" height="36" fill="COLOR" stroke="#333" stroke-width="2"/>', color: '#60A5FA' },
            { name: 'triangle', svg: '<polygon points="20,2 38,38 2,38" fill="COLOR" stroke="#333" stroke-width="2"/>', color: '#FBBF24' },
            { name: 'rectangle', svg: '<rect x="2" y="8" width="36" height="24" fill="COLOR" stroke="#333" stroke-width="2"/>', color: '#34D399' },
            { name: 'heart', svg: '<path d="M20 35 C5 25 2 15 8 8 C14 2 20 8 20 12 C20 8 26 2 32 8 C38 15 35 25 20 35Z" fill="COLOR" stroke="#333" stroke-width="2"/>', color: '#F472B6' },
        ];
        
        // 为每种形状生成随机数量 (5-9)
        const shapeCounts: { shape: typeof shapes[0], count: number }[] = shapes.map(s => ({
            shape: s,
            count: Math.floor(Math.random() * 5) + 5
        }));
        
        // 生成不重叠的随机分布形状
        const allShapes: { shape: typeof shapes[0], x: number, y: number, rotation: number }[] = [];
        const shapeSize = 45; // 形状大小
        const padding = 10; // 形状之间的最小间距
        const boxWidth = 600;
        const boxHeight = 410;
        
        // 检查新位置是否与已有形状重叠
        const isOverlapping = (newX: number, newY: number) => {
            for (const existing of allShapes) {
                const dx = newX - existing.x;
                const dy = newY - existing.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < shapeSize + padding) {
                    return true;
                }
            }
            return false;
        };
        
        // 为每个形状找到不重叠的位置
        shapeCounts.forEach(sc => {
            for (let i = 0; i < sc.count; i++) {
                let x, y;
                let attempts = 0;
                const maxAttempts = 100;
                
                do {
                    x = Math.random() * (boxWidth - shapeSize) + 20;
                    y = Math.random() * (boxHeight - shapeSize) + 20;
                    attempts++;
                } while (isOverlapping(x, y) && attempts < maxAttempts);
                
                allShapes.push({
                    shape: sc.shape,
                    x,
                    y,
                    rotation: Math.random() * 30 - 15
                });
            }
        });
        // 打乱顺序
        allShapes.sort(() => Math.random() - 0.5);
        
        const shapesHtml = allShapes.map(s => {
            const svg = s.shape.svg.replace('COLOR', s.shape.color);
            return `<div class="shape-item" style="left: ${s.x}px; top: ${s.y}px; transform: rotate(${s.rotation}deg);">
                <svg width="40" height="40" viewBox="0 0 40 40">${svg}</svg>
            </div>`;
        }).join('');
        
        const countBoxesHtml = shapes.map(s => {
            const svg = s.svg.replace('COLOR', s.color);
            return `<div class="count-item">
                <svg width="40" height="40" viewBox="0 0 40 40">${svg}</svg>
                <div class="count-box"></div>
            </div>`;
        }).join('');
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 20px 0 10px 0;
            display: flex;
            flex-direction: column;
        }
        .title-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 15px;
        }
        .title-row .main { font-size: 32px; font-weight: 900; color: #0f172a; }
        .title-icon { width: 60px; height: 60px; object-fit: contain; }
        .content-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .shapes-box {
            position: relative;
            width: 640px;
            height: 450px;
            border: 3px solid #374151;
            border-radius: 16px;
            background: #fafafa;
            margin-bottom: 25px;
        }
        .shape-item {
            position: absolute;
        }
        .count-row {
            display: flex;
            justify-content: center;
            gap: 30px;
        }
        .count-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        .count-box {
            width: 45px;
            height: 45px;
            border: 3px dashed #9ca3af;
            border-radius: 8px;
        }
        .divider {
            position: absolute;
            top: 60px;
            left: 16px;
            width: calc(100% - 32px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <span class="main">Count the Shapes</span>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="content-area">
                <div class="shapes-box">
                    ${shapesHtml}
                </div>
                <div class="count-row">
                    ${countBoxesHtml}
                </div>
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;
        
        const filename = `count-shapes-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    async generateLetterRecognitionPage(data: any): Promise<string> {
        await this.initialize();

        const {
            letter = 'A',
            theme = 'dinosaur',
            difficulty = 'easy',
            gridSize = 5,
            cells = [],
            instructions = ''
        } = data;

        const upperLetter = String(letter || 'A').toUpperCase().charAt(0) || 'A';
        const themeKey = String(theme || 'dinosaur').toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const { image: wordImage, word } = getLetterImage(upperLetter);
        const characterImage = getThemeCharacter(themeKey);
        const fontSize =
            difficulty === 'hard'
                ? 50
                : difficulty === 'medium'
                    ? 60
                    : 70; // default/easy
        const rewardStars = Array.from({ length: 5 }).map(() => '<span class="reward-star">⭐</span>').join('');
        const pointingMap: Record<string, string> = {
            dinosaur: '/uploads/assets/B_character_ip/dinosaur/poses/color/dinosaur_pointing_pose.png',
            vehicles: '/uploads/assets/B_character_ip/vehicles/poses/color/vehicles_car_pointing_pose.png',
            unicorn: '/uploads/assets/B_character_ip/unicorn/poses/color/unicorn_pointing_pose.png',
            space: '/uploads/assets/B_character_ip/space/poses/color/space_astronaut_pointing_pose.png',
            ocean: '/uploads/assets/B_character_ip/ocean/poses/color/ocean_whale_pointing_pose.png',
            safari: '/uploads/assets/B_character_ip/safari/poses/color/safari_lion_pointing_pose.png'
        };
        const magnifierIcon = pointingMap[themeKey] || pointingMap['dinosaur'];
        // 使用通用�?themeColors.accent 作为标题颜色
        const rewardMap: Record<string, string> = {
            dinosaur: '/uploads/assets/B_character_ip/dinosaur/poses/color/dinosaur_happy_pose.png',
            vehicles: '/uploads/assets/B_character_ip/vehicles/poses/color/vehicles_car_happy_pose.png',
            unicorn: '/uploads/assets/B_character_ip/unicorn/poses/color/unicorn_happy_pose.png',
            space: '/uploads/assets/B_character_ip/space/poses/color/space_astronaut_happy_pose.png',
            ocean: '/uploads/assets/B_character_ip/ocean/poses/color/ocean_whale_happy_pose.png',
            safari: '/uploads/assets/B_character_ip/safari/poses/color/safari_lion_happy_pose.png'
        };
        const rewardDino = rewardMap[themeKey] || rewardMap['dinosaur'];

        // 边框贴纸：保证左右各 8 个，数量不足循环补齐再洗�?
        const borderImages = getThemeBorders(themeKey, 16);
        const borderPool: string[] = [...borderImages];
        const baseLen = borderImages.length;
        if (baseLen > 0) {
            while (borderPool.length < 16) {
                borderPool.push(borderImages[borderPool.length % baseLen]);
            }
        }
        for (let i = borderPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [borderPool[i], borderPool[j]] = [borderPool[j], borderPool[i]];
        }

        const stickerPlacementsLeft: Array<{ top: string; left: string; rotate: number }> = [
            { top: '110px', left: '2px', rotate: -6 },
            { top: '230px', left: '2px', rotate: 4 },
            { top: '350px', left: '2px', rotate: -3 },
            { top: '470px', left: '2px', rotate: 6 },
            { top: '590px', left: '2px', rotate: -4 },
            { top: '710px', left: '2px', rotate: 5 },
            { top: '830px', left: '2px', rotate: -5 },
            { top: '950px', left: '2px', rotate: 3 },
        ];
        const stickerPlacementsRight: Array<{ top: string; right: string; rotate: number }> = [
            { top: '110px', right: '2px', rotate: 6 },
            { top: '230px', right: '2px', rotate: -4 },
            { top: '350px', right: '2px', rotate: 5 },
            { top: '470px', right: '2px', rotate: -5 },
            { top: '590px', right: '2px', rotate: 4 },
            { top: '710px', right: '2px', rotate: -4 },
            { top: '830px', right: '2px', rotate: 6 },
            { top: '950px', right: '2px', rotate: -3 }
        ];

        const perSide = Math.min(
            Math.floor(borderPool.length / 2),
            stickerPlacementsLeft.length,
            stickerPlacementsRight.length
        );
        const stickersLeft = borderPool.slice(0, perSide);
        const stickersRight = borderPool.slice(perSide, perSide * 2);

        const stickerHtmlLeft = stickersLeft.map((src: string, idx: number) => {
            const placement = stickerPlacementsLeft[idx];
            const pos = `top:${placement.top};left:${placement.left}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtmlRight = stickersRight.map((src: string, idx: number) => {
            const placement = stickerPlacementsRight[idx];
            const pos = `top:${placement.top};right:${placement.right}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtml = stickerHtmlLeft + stickerHtmlRight;

        // 生成混合字母网格
        let gridCells: string[] = [];
        if (Array.isArray(cells) && cells.length > 0) {
            gridCells = cells.slice(0, gridSize * gridSize);
        } else {
            // 自动生成混合字母网格
            const totalCells = gridSize * gridSize;
            // 根据难度决定目标字母的数量
            const targetCount = difficulty === 'hard' ? Math.floor(totalCells * 0.25) 
                              : difficulty === 'medium' ? Math.floor(totalCells * 0.35)
                              : Math.floor(totalCells * 0.4); // easy
            
            // 生成干扰字母（排除目标字母）
            const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== upperLetter);
            
            // 填充目标字母
            for (let i = 0; i < targetCount; i++) {
                gridCells.push(upperLetter);
            }
            
            // 填充干扰字母
            for (let i = targetCount; i < totalCells; i++) {
                const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
                gridCells.push(randomLetter);
            }
            
            // 打乱顺序
            for (let i = gridCells.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [gridCells[i], gridCells[j]] = [gridCells[j], gridCells[i]];
            }
        }

        const cellHtml = gridCells.map(ch => {
            const content = ch || '';
            return `<div class="cell">${content}</div>`;
        }).join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            height: 1123px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page { position: relative; width: 794px; height: 1123px; overflow: hidden; }
        .top-bar {
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: auto;
            min-height: 52px;
            padding: 14px 36px 12px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 600;
            color: #2e2e2e;
        }
        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }
        .dash-line {
            display: inline-block;
            height: 0;
            width: 180px;
            border-bottom: 2px dashed #b8c0cc;
            transform: translateY(6px);
            vertical-align: middle;
        }
        .dash-line.short { width: 180px; }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 24px 18px 16px;
            background: transparent;
            border-radius: 16px;
            border: none;
            display: grid;
            grid-template-rows: auto 1fr auto;
            align-items: center;
            justify-items: center;
            gap: 14px;
        }
        .lr-panel {
            width: 100%;
            max-width: 680px;
            margin: 0 auto;
            background: transparent;
            border: none;
            border-radius: 0;
            padding: 16px;
            box-shadow: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .lr-title {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            justify-content: center;
            text-align: center;
            font-size: 38px;
            font-weight: 800;
            color: ${themeColors.accent};
            padding: 8px 12px;
            border: none;
            border-radius: 0;
            background: transparent;
        }
        .lr-title img {
            width: 68px;
            height: 68px;
            object-fit: contain;
        }
        .lr-grid {
            display: grid;
            gap: 8px;
            width: 100%;
        }
        .cell {
            aspect-ratio: 1 / 1;
            border: 1px solid ${themeColors.primary};
            border-radius: 10px;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${fontSize}px;     /* 难度动态字号：easy 70 / medium 60 / hard 50 */
            font-weight: 900;
            letter-spacing: 0.3px;
            color: #0f172a;              /* 实心深色填充 */
            -webkit-text-stroke: 0;      /* 取消描边 */
            line-height: 1;
        }
        .reward-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 28px;
            margin-top: auto;
        }
        .reward-dino {
            width: 120px;
            height: 120px;
            object-fit: contain;
        }
        .reward-stars {
            display: flex;
            align-items: center;
            gap: 22px;
        }
        .reward-star {
            font-size: 48px;
            line-height: 1;
            color: #f5a623;
        }
        .border-sticker {
            position: absolute;
            width: 36px;
            height: 36px;
            object-fit: contain;
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }
        .footer {
            position: absolute;
            bottom: 16px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #b0b8c4;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>

        <div class="safe-area">
            <div class="lr-title">
                <img src="http://localhost:3000${magnifierIcon}" alt="helper icon" />
                <span>Find all the letter ${upperLetter}</span>
            </div>
            <div class="lr-panel">
                <div class="lr-grid" style="grid-template-columns: repeat(${gridSize}, 1fr);">
                    ${cellHtml}
                </div>
            </div>
            <div class="reward-row">
                <img class="reward-dino" src="http://localhost:3000${rewardDino}" alt="theme helper" />
                <div class="reward-stars">${rewardStars}</div>
            </div>
        </div>
        ${stickerHtml}
        <div class="footer">AI Kid Print · Letter Recognition · ${upperLetter}</div>
    </div>
</body>
</html>
        `;

        const filename = `letter-recognition-${upperLetter}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateLowercaseTracing(data: any): Promise<string> {
        await this.initialize();

        const { letter, theme = 'dinosaur' } = data;
        const lowerLetter = String(letter || 'a').toLowerCase().charAt(0) || 'a';
        const lookupLetter = lowerLetter.toUpperCase();
        const themeKey = String(theme || 'dinosaur').toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        
        // 随机决定图标位置（左或右�?
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        const { image: mainImage, word } = getLetterImage(lookupLetter);
        const characterImage = getThemeCharacter(themeKey);
        const borderImages = getThemeBorders(themeKey, 16);
        const borderPool: string[] = [...borderImages];
        const baseLen = borderImages.length;
        if (baseLen > 0) {
            while (borderPool.length < 16) {
                borderPool.push(borderImages[borderPool.length % baseLen]);
            }
        }
        for (let i = borderPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [borderPool[i], borderPool[j]] = [borderPool[j], borderPool[i]];
        }

        const tracingRel = `/uploads/letters/lowercase/${lowerLetter}_lowercase_tracing.png`;
        const tracingFull = path.join(__dirname, '../../public', tracingRel);
        const tracingImage = fs.existsSync(tracingFull) ? tracingRel : '';

        const stickerPlacementsLeft: Array<{ top: string; left: string; rotate: number }> = [
            { top: '110px', left: '2px', rotate: -6 },
            { top: '230px', left: '2px', rotate: 4 },
            { top: '350px', left: '2px', rotate: -3 },
            { top: '470px', left: '2px', rotate: 6 },
            { top: '590px', left: '2px', rotate: -4 },
            { top: '710px', left: '2px', rotate: 5 },
            { top: '830px', left: '2px', rotate: -5 },
            { top: '950px', left: '2px', rotate: 3 },
        ];
        const stickerPlacementsRight: Array<{ top: string; right: string; rotate: number }> = [
            { top: '110px', right: '2px', rotate: 6 },
            { top: '230px', right: '2px', rotate: -4 },
            { top: '350px', right: '2px', rotate: 5 },
            { top: '470px', right: '2px', rotate: -5 },
            { top: '590px', right: '2px', rotate: 4 },
            { top: '710px', right: '2px', rotate: -4 },
            { top: '830px', right: '2px', rotate: 6 },
            { top: '950px', right: '2px', rotate: -3 }
        ];

        const perSide = Math.min(
            Math.floor(borderPool.length / 2),
            stickerPlacementsLeft.length,
            stickerPlacementsRight.length
        );
        const stickersLeft = borderPool.slice(0, perSide);
        const stickersRight = borderPool.slice(perSide, perSide * 2);

        const stickerHtmlLeft = stickersLeft.map((src: string, idx: number) => {
            const placement = stickerPlacementsLeft[idx];
            const pos = `top:${placement.top};left:${placement.left}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtmlRight = stickersRight.map((src: string, idx: number) => {
            const placement = stickerPlacementsRight[idx];
            const pos = `top:${placement.top};right:${placement.right}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtml = stickerHtmlLeft + stickerHtmlRight;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            height: 1123px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 794px;
            height: 1123px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: auto;
            min-height: 52px;
            padding: 14px 36px 12px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 600;
            color: #2e2e2e;
        }
        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }
        .dash-line {
            display: inline-block;
            height: 0;
            width: 180px;
            border-bottom: 2px dashed #b8c0cc;
            transform: translateY(6px);
            vertical-align: middle;
        }
        .dash-line.short { width: 180px; }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 24px 18px 16px;
            background: transparent;
            border-radius: 16px;
            border: none;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .title-row {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 800;
            color: ${themeColors.accent};
        }
        .title-row .main {
            font-size: 26px;
            line-height: 1.1;
        }
        .title-row .title-icon {
            width: 46px;
            height: 46px;
            object-fit: contain;
        }
        .main-row {
            position: relative;
            display: flex;
            gap: 12px;
            align-items: flex-start;
            margin-bottom: 14px;
        }
        .tracing-card {
            flex: 1 1 62%;
            min-width: 360px;
            max-width: 440px;
            background: transparent;
            border-radius: 12px;
            box-shadow: none;
            padding: 12px 12px 12px 16px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            min-height: 380px;
            position: relative;
        }
        .tracing-card img {
            width: auto;
            height: 350px;
            max-width: 350px;
            object-fit: contain;
            background: transparent;
        }
        .fallback-letter {
            font-size: 240px;
            font-weight: 800;
            color: #1e293b;
            line-height: 1;
        }
        .character-in-letter {
            position: absolute;
            right: 12px;
            bottom: 12px;
            width: 132px;
            height: 148px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            pointer-events: none;
            border-radius: 12px;
            padding: 6px;
            background: transparent;
        }
        .character-in-letter img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .word-card {
            width: 200px;
            flex-shrink: 0;
            margin-left: auto;
            background: rgba(232, 247, 244, 0.2);
            border: none;
            border-radius: 12px;
            box-shadow: none;
            padding: 12px 12px 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: center;
        }
        .word-image {
            width: 150px;
            height: 120px;
            background: transparent;
            border-radius: 12px;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 72px;
            padding: 6px;
        }
        .word-image img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .word-label {
            font-size: 20px;
            font-weight: 700;
            color: #364152;
            letter-spacing: 0.5px;
        }
        .trace-box {
            background: rgba(232, 247, 244, 0.2);
            padding: 12px 14px;
            border: 2px solid ${themeColors.primary};
            border-radius: 16px;
            margin-bottom: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .box-title {
            font-size: 13px;
            font-weight: 800;
            color: #4b5563;
            text-transform: uppercase;
            margin-bottom: 8px;
            text-align: center;
            width: 100%;
        }
        .trace-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0;
            width: 100%;
        }
        .trace-char {
            font-size: 96px;
            color: #cbd5e1;
            font-weight: 700;
            font-family: 'Quicksand', sans-serif;
            line-height: 1;
            text-align: center;
        }
        .trace-char.solid {
            color: #1f2933;
        }
        .practice {
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            min-height: 260px;
            padding: 8px 6px 4px;
            border: none;
            border-radius: 0;
            flex: 1;
        }
        .practice-title {
            font-size: 15px;
            font-weight: 800;
            color: #475569;
        }
        .practice-lines {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            gap: 30px;
        }
        .writing-group {
            display: flex;
            flex-direction: column;
            gap: 40px;
        }
        .writing-gap {
            height: 18px;
        }
        .writing-line {
            height: 0;
            border: none;
            border-bottom: 2px solid #5a6473;
            border-radius: 2px;
        }
        .writing-line.dashed {
            border-bottom-style: dashed;
            border-bottom-color: #a2acbb;
            border-bottom-width: 2px;
        }
        .border-sticker {
            position: absolute;
            width: 36px;
            height: 36px;
            object-fit: contain;
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }
        .footer {
            position: absolute;
            bottom: 16px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #b0b8c4;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>

        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <div class="main">Lowercase Letter Tracing</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="main-row">
                <div class="tracing-card">
                    ${tracingImage
                        ? `<img src="http://localhost:3000${tracingImage}" alt="Tracing ${lowerLetter}">`
                        : `<div class="fallback-letter">${lowerLetter}</div>`}
                    <div class="character-in-letter">
                        ${isImageFile(characterImage)
                            ? `<img src="http://localhost:3000${characterImage}" alt="${themeKey} character">`
                            : characterImage}
        </div>
                </div>
                <div class="word-card">
                    <div class="word-image">
                ${isImageFile(mainImage)
                ? `<img src="http://localhost:3000${mainImage}" alt="${word}">`
                : mainImage}
            </div>
            <div class="word-label">${word}</div>
        </div>
    </div>

            <div class="trace-box" style="height: 140px; padding: 0 14px; display: flex; align-items: center; justify-content: center;">
                <div class="trace-row" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: space-around;">
                    <div class="trace-char solid" style="font-size: 90px; line-height: 1; display: flex; align-items: center; justify-content: center;">${lowerLetter}</div>
                    ${Array(4).fill(lowerLetter).map(l => `<div class="trace-char" style="font-size: 90px; line-height: 1; display: flex; align-items: center; justify-content: center;">${l}</div>`).join('')}
        </div>
    </div>

            <div class="practice">
        <div class="practice-title">Practice Writing:</div>
                <div class="practice-lines">
                    <div class="writing-group">
                <div class="writing-line"></div>
                        <div class="writing-line dashed"></div>
                <div class="writing-line"></div>
    </div>
                    <div class="writing-group">
                        <div class="writing-line"></div>
                        <div class="writing-line dashed"></div>
                <div class="writing-line"></div>
                    </div>
                </div>
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;

        const filename = `lowercase-${lowerLetter}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateWriteMyName(data: any): Promise<string> {
        await this.initialize();
        const content = data?.content || data || {};
        const { theme = 'dinosaur', name = 'LEO' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const stickerHtml = this.getStickersHtml(themeKey);

        // 处理名字：转大写，最�?0个字�?
        const displayName = String(name).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10);
        const nameLength = displayName.length || 1;
        
        // 根据字母数量计算图片高度，确保不超出安全区宽度（�?80px可用�?
        // 安全区宽度约680px，减去间�?8px * (n-1))和左右padding(20px)
        const availableWidth = 680 - 20 - (nameLength - 1) * 8;
        const letterHeight = Math.min(140, Math.floor(availableWidth / nameLength));

        // 生成大字母图片HTML（从 uploads/letters/uppercase 取图片）
        const bigLettersHtml = displayName.split('').map(letter => {
            const letterImagePath = `/uploads/letters/uppercase/${letter}_uppercase_tracing.png`;
            return `<img class="big-letter-img" src="http://localhost:3000${letterImagePath}" alt="${letter}" />`;
        }).join('');

        // 获取主题彩色图案（从 A_main_assets/{theme}/color/main/ 随机取一张）
        const colorAssets = getThemeMainColorAssets(themeKey, 1);
        const characterImage = colorAssets[0] || '';

        // 根据名字长度决定每行显示1个还�?个名�?
        // 如果名字超过5个字母，每行只显�?个名�?
        const namesPerLine = nameLength > 5 ? 1 : 2;
        const tracingClass = namesPerLine === 1 ? 'tracing-text single' : 'tracing-text';
        const tracingContent = namesPerLine === 1 
            ? `<span>${displayName}</span>` 
            : `<span>${displayName}</span><span>${displayName}</span>`;

        // 根据字母数量动态计算letter-spacing，确保不超出安全�?
        // 每行可用宽度�?00px（两个名字时），每个字母�?5px�?
        // letter-spacing = (可用宽度 - 字母�?* 字母宽度) / (字母�?- 1)
        const getLetterSpacing = (len: number, perLine: number): number => {
            if (len <= 1) return 0;
            const availableWidth = perLine === 1 ? 600 : 280; // 单个名字时可用更多空�?
            const charWidth = 55; // 每个字母�?5px
            const totalCharWidth = len * charWidth;
            const spacing = Math.floor((availableWidth - totalCharWidth) / (len - 1));
            return Math.max(2, Math.min(spacing, 25)); // 限制�?-25px之间
        };
        const letterSpacing = getLetterSpacing(nameLength, namesPerLine);

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .safe-area {
            align-items: stretch;
        }
        .content-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 0;
            gap: 0;
            width: 100%;
        }
        /* 顶部大字母区�?- 自动缩放不超出安全区 */
        .big-letters-section {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            padding: 20px 10px;
            max-width: 100%;
            overflow: hidden;
        }
        .big-letter-img {
            height: ${letterHeight}px;
            width: auto;
            object-fit: contain;
            flex-shrink: 1;
        }
        /* 中间角色图片区域 - 居中 */
        .character-section {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10px 0;
        }
        .character-image {
            max-width: 380px;
            max-height: 380px;
            width: auto;
            height: auto;
            object-fit: contain;
        }
        /* 练习区域 - 参考大写字母描红样�?*/
        .practice {
            margin-top: 10px;
            margin-left: -18px;
            margin-right: -18px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 8px 0 4px;
        }
        .practice-title {
            font-size: 15px;
            font-weight: 800;
            color: #475569;
            padding-left: 18px;
        }
        .practice-lines {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            gap: 45px;
        }
        .writing-group {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 0;
            height: 95px;
        }
        .writing-line {
            position: absolute;
            left: 0;
            right: 0;
            height: 0;
            border: none;
            border-bottom: 2px solid #5a6473;
            border-radius: 2px;
        }
        .writing-line.top {
            top: 0;
        }
        .writing-line.dashed {
            top: 50%;
            border-bottom-style: dashed;
            border-bottom-color: #a2acbb;
            border-bottom-width: 2px;
        }
        .writing-line.bottom {
            bottom: 0;
        }
        .tracing-text {
            position: absolute;
            top: -2px;
            left: 0;
            right: 0;
            height: 99px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 10px;
            font-family: 'Quicksand', sans-serif;
            font-weight: 700;
            font-size: 88px;
            line-height: 95px;
            color: rgba(0, 0, 0, 0.1);
            letter-spacing: ${letterSpacing}px;
            text-transform: uppercase;
            pointer-events: none;
        }
        .tracing-text.single {
            justify-content: center;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="content-wrapper">
                <!-- 顶部大字母图�?-->
                <div class="big-letters-section">
                    ${bigLettersHtml}
                </div>
                <!-- 中间角色图片 -->
                <div class="character-section">
                    ${characterImage ? `<img class="character-image" src="http://localhost:3000${characterImage}" alt="character" />` : ''}
                </div>
                <!-- 练习�?- 参考大写字母描红样�?-->
                <div class="practice">
                    <div class="practice-title">Practice Writing:</div>
                    <div class="practice-lines">
                        <div class="writing-group">
                            <div class="writing-line top"></div>
                            <div class="writing-line dashed"></div>
                            <div class="writing-line bottom"></div>
                            <div class="${tracingClass}">${tracingContent}</div>
                        </div>
                        <div class="writing-group">
                            <div class="writing-line top"></div>
                            <div class="writing-line dashed"></div>
                            <div class="writing-line bottom"></div>
                            <div class="${tracingClass}">${tracingContent}</div>
                        </div>
                        <div class="writing-group">
                            <div class="writing-line top"></div>
                            <div class="writing-line dashed"></div>
                            <div class="writing-line bottom"></div>
                            <div class="${tracingClass}">${tracingContent}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>`;

        const filename = `write-my-name-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    async generateNumberTracingPage(data: any): Promise<string> {
        await this.initialize();

        const { numbers = [0,1,2,3,4], range = '0-4', theme = 'dinosaur' } = data;
        const themeKey = String(theme || 'dinosaur').toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);

        // 使用通用�?titleIcon �?themeColors
        const ranges: Record<string, number[]> = {
            '0-4': [0,1,2,3,4],
            '5-9': [5,6,7,8,9]
        };
        const nums = Array.isArray(numbers) && numbers.length ? numbers : (ranges[range] || ranges['0-4']);

        // 仅生成固定框架与安全区外装饰，安全区内留占位
        const borderImages = getThemeBorders(themeKey, 16);
        const borderPool: string[] = [...borderImages];
        const baseLen = borderImages.length;
        if (baseLen > 0) {
            while (borderPool.length < 16) {
                borderPool.push(borderImages[borderPool.length % baseLen]);
            }
        }
        for (let i = borderPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [borderPool[i], borderPool[j]] = [borderPool[j], borderPool[i]];
        }

        const stickerPlacementsLeft: Array<{ top: string; left: string; rotate: number }> = [
            { top: '110px', left: '2px', rotate: -6 },
            { top: '230px', left: '2px', rotate: 4 },
            { top: '350px', left: '2px', rotate: -3 },
            { top: '470px', left: '2px', rotate: 6 },
            { top: '590px', left: '2px', rotate: -4 },
            { top: '710px', left: '2px', rotate: 5 },
            { top: '830px', left: '2px', rotate: -5 },
            { top: '950px', left: '2px', rotate: 3 },
        ];
        const stickerPlacementsRight: Array<{ top: string; right: string; rotate: number }> = [
            { top: '110px', right: '2px', rotate: 6 },
            { top: '230px', right: '2px', rotate: -4 },
            { top: '350px', right: '2px', rotate: 5 },
            { top: '470px', right: '2px', rotate: -5 },
            { top: '590px', right: '2px', rotate: 4 },
            { top: '710px', right: '2px', rotate: -4 },
            { top: '830px', right: '2px', rotate: 6 },
            { top: '950px', right: '2px', rotate: -3 }
        ];

        const perSide = Math.min(
            Math.floor(borderPool.length / 2),
            stickerPlacementsLeft.length,
            stickerPlacementsRight.length
        );
        const stickersLeft = borderPool.slice(0, perSide);
        const stickersRight = borderPool.slice(perSide, perSide * 2);

        const stickerHtmlLeft = stickersLeft.map((src: string, idx: number) => {
            const placement = stickerPlacementsLeft[idx];
            const pos = `top:${placement.top};left:${placement.left}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtmlRight = stickersRight.map((src: string, idx: number) => {
            const placement = stickerPlacementsRight[idx];
            const pos = `top:${placement.top};right:${placement.right}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtml = stickerHtmlLeft + stickerHtmlRight;

        // 主题主素材彩色图标池（随机）
        const themeColorPool = getThemeColorAssets(themeKey, 20);
        const defaultIcon = `/uploads/assets/A_main_assets/${themeKey}/color/${themeKey}_000_color.png`;

        const buildPage = (nums: number[]) => {
            const rowsHtml = nums.map((n, idx) => {
                const isEven = idx % 2 === 0;
                const rowBg = isEven ? '#dff4ec' : '#dfefff';

                const numberImgPath = `/uploads/A_basic_assets/numbers/number_${n}_tracing.png`;
                const numberImgAbs = path.join(__dirname, '../../public', numberImgPath.replace(/^\//, ''));
                const leftNumber = fs.existsSync(numberImgAbs)
                    ? `<img class="left-num-img" src="http://localhost:3000${numberImgPath}" alt="${n}">`
                    : `<div class="left-num-text">${n}</div>`;

                const iconPool = themeColorPool.length > 0 ? themeColorPool : [defaultIcon];
                const iconSrc = iconPool[(idx + iconPool.length) % iconPool.length] || '';
                const iconLayouts: Record<number, Array<{ top: number; left: number }>> = {
                    1: [{ top: 50, left: 50 }],
                    2: [
                        { top: 30, left: 50 },
                        { top: 70, left: 50 }
                    ],
                    3: [
                        { top: 32, left: 50 },
                        { top: 68, left: 20 },
                        { top: 68, left: 80 }
                    ],
                    4: [
                        { top: 30, left: 30 },
                        { top: 30, left: 70 },
                        { top: 70, left: 30 },
                        { top: 70, left: 70 }
                    ],
                    5: [
                        { top: 20, left: 50 },
                        { top: 50, left: 20 },
                        { top: 50, left: 80 },
                        { top: 80, left: 20 },
                        { top: 80, left: 80 }
                    ],
                    8: [
                        { top: 22, left: 20 },
                        { top: 22, left: 50 },
                        { top: 22, left: 80 },
                        { top: 55, left: 20 },
                        { top: 55, left: 50 },
                        { top: 55, left: 80 },
                        { top: 88, left: 33 },
                        { top: 88, left: 66 }
                    ],
                    7: [
                        { top: 22, left: 20 },
                        { top: 22, left: 50 },
                        { top: 22, left: 80 },
                        { top: 55, left: 20 },
                        { top: 55, left: 50 },
                        { top: 55, left: 80 },
                        { top: 88, left: 33 },
                        { top: 88, left: 66 }
                    ],
                };

                let icons = '';
                if (n > 0) {
                    const iconSize = n >= 7 ? 25 : 40;
                    const countForIcons = Math.max(1, n);
                    const layout = iconLayouts[countForIcons];
                    if (iconSrc) {
                        if (layout) {
                            icons = `<div class="icon-group" style="position: relative; display: block; width:100%; height:100%;">
                                ${ layout.map(pos =>
                                    `<img class="icon-img" src="http://localhost:3000${iconSrc}" style="position:absolute; width:${iconSize}px; height:${iconSize}px; top:${pos.top}%; left:${pos.left}%; transform: translate(-50%,-50%);" />`
                                  ).join('') }
                            </div>`;
                        } else {
                            const cols = countForIcons === 6 ? 2 : 3;
                            const gridStyle = `grid-template-columns: repeat(${cols}, 1fr);`;
                            icons = `<div class="icon-group" style="${gridStyle}">
                                ${Array.from({ length: countForIcons }).map(() =>
                                    `<img class="icon-img" src="http://localhost:3000${iconSrc}" style="width:${iconSize}px;height:${iconSize}px;" />`
                                ).join('')}
                            </div>`;
                        }
                    } else {
                        icons = `<div class="icon-group" style="position: relative; display: block; width:100%; height:100%; justify-content:center; align-items:center;">
                            <span class="icon-emoji">🦕</span>
                        </div>`;
                    }
                }
                const traceCells = Array(4).fill(n.toString()).map(ch => `<div class="trace-cell">${ch}</div>`).join('');
                return `
                <div class="row" style="background:${rowBg};">
                    <div class="left-box">${leftNumber}</div>
                    <div class="middle-box">
                        <div class="trace-inner">${traceCells}</div>
                    </div>
                    <div class="right-box">${icons}</div>
                </div>
                `;
            }).join('');

            const titleText = nums.length ? `Number Tracing ${nums[0]}-${nums[nums.length-1]}` : 'Number Tracing';

            return `
            <div class="page">
                <div class="top-bar">
                    <div class="field">Name: <span class="dash-line"></span></div>
                    <div class="field">Date: <span class="dash-line short"></span></div>
                </div>
                <div class="divider"></div>
                <div class="safe-area">
                    <div class="nt-title">
                        <img src="http://localhost:3000${titleIcon}" alt="theme icon" />
                        <span>${titleText}</span>
                    </div>
                    <div class="rows">${rowsHtml}</div>
                </div>
                ${stickerHtml}
            </div>
            `;
        };

        // 单页渲染
        const pagesHtml = buildPage(nums);

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            min-height: 1123px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page { position: relative; width: 794px; height: 1123px; overflow: hidden; page-break-after: always; }
        .page-break { page-break-after: always; }
        .top-bar {
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: auto;
            min-height: 52px;
            padding: 14px 36px 12px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 600;
            color: #2e2e2e;
        }
        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }
        .dash-line {
            display: inline-block;
            height: 0;
            width: 180px;
            border-bottom: 2px dashed #b8c0cc;
            transform: translateY(6px);
            vertical-align: middle;
        }
        .dash-line.short { width: 180px; }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 24px 18px 16px;
            background: transparent;
            border-radius: 16px;
            border: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
        }
        .nt-title {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            font-size: 38px;
            font-weight: 800;
            color: ${themeColors.accent};
            text-align: center;
            margin-bottom: 12px;
            border: none;
            border-radius: 0;
            padding: 0;
            background: transparent;
        }
        .nt-title img {
            width: 68px;
            height: 68px;
            object-fit: contain;
        }
        .rows {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            width: 100%;
            flex: 1;
            padding: 24px 0 12px;
            gap: 18px;
        }
        .row {
            display: grid;
            grid-template-columns: 140px 1fr 120px; /* 左侧数字区加宽以放大数字 */
            align-items: stretch;
            min-height: 160px;
            padding: 0 16px;
            border-radius: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }
        .left-box {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px 8px;
        }
        .left-num-img {
            width: 110px;
            height: 110px;
            object-fit: contain;
            filter: drop-shadow(0 1px 1px rgba(0,0,0,0.08));
        }
        .left-num-text {
            font-size: 104px;
            font-weight: 900;
            color: ${themeColors.accent};
            -webkit-text-stroke: 4px #0b0b0b;
            line-height: 1;
        }
        .middle-box {
            background: #ffffff;
            border: 2px solid #f5d77b;
            border-radius: 0;
            padding: 12px 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
        }
        .trace-inner {
            display: grid;
            grid-template-columns: repeat(4, minmax(56px, 1fr));
            gap: 14px;
            width: 100%;
            justify-items: center;
        }
        .trace-cell {
            font-size: 96px;
            font-weight: 800;
            color: rgba(163, 163, 163, 0.2);
            -webkit-text-stroke: 0;
            line-height: 1;
        }
        .right-box {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
            height: 100%;
            max-height: 100%;
            width: 110px;
            max-width: 110px;
            margin: 0 auto;
            box-sizing: border-box;
            overflow: hidden;
            border: none;
            border-radius: 10px;
        }
        .icon-group {
            display: grid;
            gap: 6px;
            justify-items: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }
        .icon-img {
            width: 36px;
            height: 36px;
            object-fit: contain;
            margin: 0;
        }
        .icon-emoji {
            font-size: 36px;
            line-height: 1;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .border-sticker {
            position: absolute;
            width: 36px;
            height: 36px;
            object-fit: contain;
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }
    </style>
</head>
<body>
    ${pagesHtml}
</body>
</html>
        `;

        const filename = `number-tracing-${range}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateLogicBlank(data: any): Promise<string> {
        await this.initialize();

        const { theme = 'dinosaur', title = 'Logic Skills', subtitle = '' } = data;
        const themeKey = String(theme || 'dinosaur').toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        
        // 随机决定图标位置（左或右�?
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        // 贴纸：与其他模板一�?
        const borderImages = getThemeBorders(themeKey, 16);
        const borderPool: string[] = [...borderImages];
        const baseLen = borderImages.length;
        if (baseLen > 0) {
            while (borderPool.length < 16) {
                borderPool.push(borderImages[borderPool.length % baseLen]);
            }
        }
        for (let i = borderPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [borderPool[i], borderPool[j]] = [borderPool[j], borderPool[i]];
        }

        const stickerPlacementsLeft: Array<{ top: string; left: string; rotate: number }> = [
            { top: '110px', left: '2px', rotate: -6 },
            { top: '230px', left: '2px', rotate: 4 },
            { top: '350px', left: '2px', rotate: -3 },
            { top: '470px', left: '2px', rotate: 6 },
            { top: '590px', left: '2px', rotate: -4 },
            { top: '710px', left: '2px', rotate: 5 },
            { top: '830px', left: '2px', rotate: -5 },
            { top: '950px', left: '2px', rotate: 3 },
        ];
        const stickerPlacementsRight: Array<{ top: string; right: string; rotate: number }> = [
            { top: '110px', right: '2px', rotate: 6 },
            { top: '230px', right: '2px', rotate: -4 },
            { top: '350px', right: '2px', rotate: 5 },
            { top: '470px', right: '2px', rotate: -5 },
            { top: '590px', right: '2px', rotate: 4 },
            { top: '710px', right: '2px', rotate: -4 },
            { top: '830px', right: '2px', rotate: 6 },
            { top: '950px', right: '2px', rotate: -3 }
        ];

        const perSide = Math.min(
            Math.floor(borderPool.length / 2),
            stickerPlacementsLeft.length,
            stickerPlacementsRight.length
        );
        const stickersLeft = borderPool.slice(0, perSide);
        const stickersRight = borderPool.slice(perSide, perSide * 2);

        const stickerHtmlLeft = stickersLeft.map((src: string, idx: number) => {
            const placement = stickerPlacementsLeft[idx];
            const pos = `top:${placement.top};left:${placement.left}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtmlRight = stickersRight.map((src: string, idx: number) => {
            const placement = stickerPlacementsRight[idx];
            const pos = `top:${placement.top};right:${placement.right}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtml = stickerHtmlLeft + stickerHtmlRight;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            height: 1123px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 794px;
            height: 1123px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: auto;
            min-height: 52px;
            padding: 14px 36px 12px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 600;
            color: #2e2e2e;
        }
        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }
        .dash-line {
            display: inline-block;
            height: 0;
            width: 180px;
            border-bottom: 2px dashed #b8c0cc;
            transform: translateY(6px);
            vertical-align: middle;
        }
        .dash-line.short { width: 180px; }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 24px 18px 16px;
            background: transparent;
            border-radius: 16px;
            border: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .title-area {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 800;
            color: ${themeColors.accent};
            flex-wrap: wrap;
        }
        .title-area .main {
            font-size: 38px;
        }
        .title-area .title-icon {
            width: 68px;
            height: 68px;
            object-fit: contain;
        }
        .title-area .sub {
            font-size: 16px;
            color: #475569;
            width: 100%;
            text-align: center;
        }
        .border-sticker {
            position: absolute;
            width: 36px;
            height: 36px;
            object-fit: contain;
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>

        <div class="safe-area">
            <div class="title-area">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <div class="main">${title}</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
                ${subtitle ? `<div class="sub">${subtitle}</div>` : ''}
            </div>
            <!-- 留空安全区供后续填充逻辑内容 -->
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;

        const filename = `logic-blank-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generatePatternComparePage(data: any): Promise<string> {
        await this.initialize();

        const { theme = 'dinosaur', patternImageUrl = '' } = data.content || data;
        const themeKey = String(theme || 'dinosaur').toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        
        // 随机决定图标位置（左或右�?
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        // 贴纸
        const stickerHtml = this.getStickersHtml(themeKey);

        // 图片内容区域
        const imageHtml = patternImageUrl 
            ? `<img class="pattern-image" src="http://localhost:3000${patternImageUrl}" />`
            : `<div class="placeholder">找不同图片生成中...</div>`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            height: 1123px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 794px;
            height: 1123px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: auto;
            min-height: 52px;
            padding: 14px 36px 12px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 600;
            color: #2e2e2e;
        }
        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }
        .dash-line {
            display: inline-block;
            height: 0;
            width: 180px;
            border-bottom: 2px dashed #b8c0cc;
            transform: translateY(6px);
            vertical-align: middle;
        }
        .dash-line.short { width: 180px; }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 16px 12px;
            background: transparent;
            border-radius: 16px;
            border: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
        }
        .title-row {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 800;
            color: ${themeColors.accent};
            margin-top: 2px;
        }
        .title-row .main {
            font-size: 32px;
            line-height: 1.1;
        }
        .title-row .title-icon {
            width: 56px;
            height: 56px;
            object-fit: contain;
        }
        .image-container {
            flex: 1;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .pattern-image {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            border-radius: 12px;
        }
        .placeholder {
            color: #94a3b8;
            font-size: 18px;
            text-align: center;
        }
        .border-sticker {
            position: absolute;
            width: 36px;
            height: 36px;
            object-fit: contain;
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>

        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <div class="main">Spot the Difference</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            
            <div class="image-container">
                ${imageHtml}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;

        const filename = `pattern-compare-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateSortingPage(data: any): Promise<string> {
        await this.initialize();

        const { theme = 'dinosaur' } = data;
        const themeKey = String(theme || 'dinosaur').toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        
        // 随机决定图标位置（左或右�?
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        // 获取主题名称（首字母大写�?
        const themeName = themeKey.charAt(0).toUpperCase() + themeKey.slice(1);

        // 获取8张主题彩色素材（�?color/main 子文件夹�?
        const themeAssets = getThemeMainColorAssets(themeKey, 8);
        
        // 随机分配�?张大图，4张小�?
        const shuffledAssets = [...themeAssets].sort(() => Math.random() - 0.5);
        const bigItems = shuffledAssets.slice(0, 4);
        const smallItems = shuffledAssets.slice(4, 8);
        
        // 合并并打乱顺序用于显�?
        const allItems = [
            ...bigItems.map(src => ({ src, size: 'big' })),
            ...smallItems.map(src => ({ src, size: 'small' }))
        ].sort(() => Math.random() - 0.5);

        // 贴纸
        const stickerHtml = this.getStickersHtml(themeKey);

        // 生成待分类物品的 HTML（分�?2 行，每行 4 个）
        const row1Items = allItems.slice(0, 4);
        const row2Items = allItems.slice(4, 8);
        
        const makeItemHtml = (item: { src: string; size: string }) => {
            const size = item.size === 'big' ? '120px' : '50px';
            return `<div class="item-cell">
                <img src="http://localhost:3000${item.src}" style="width: ${size}; height: ${size}; object-fit: contain;" />
            </div>`;
        };
        
        const row1Html = row1Items.map(makeItemHtml).join('');
        const row2Html = row2Items.map(makeItemHtml).join('');
        
        const itemsHtml = `
            <div class="items-row">${row1Html}</div>
            <div class="items-row">${row2Html}</div>
        `;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            height: 1123px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 794px;
            height: 1123px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: auto;
            min-height: 52px;
            padding: 14px 36px 12px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 600;
            color: #2e2e2e;
        }
        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }
        .dash-line {
            display: inline-block;
            height: 0;
            width: 180px;
            border-bottom: 2px dashed #b8c0cc;
            transform: translateY(6px);
            vertical-align: middle;
        }
        .dash-line.short { width: 180px; }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 24px 18px 16px;
            background: transparent;
            border-radius: 16px;
            border: none;
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: center;
        }
        .title-row {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 800;
            color: ${themeColors.accent};
            margin-top: 2px;
        }
        .title-row .main {
            font-size: 38px;
            line-height: 1.1;
        }
        .title-row .title-icon {
            width: 68px;
            height: 68px;
            object-fit: contain;
        }
        .sorting-boxes {
            display: flex;
            gap: 20px;
            width: 100%;
            justify-content: center;
            margin-top: 60px;
        }
        .sorting-box {
            width: 320px;
            height: 440px;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 20px;
        }
        .sorting-box.big {
            background: #E3F2FD;
        }
        .sorting-box.small {
            background: #FCE4EC;
        }
        .sorting-box .label {
            font-size: 26px;
            font-weight: 700;
            margin-bottom: 12px;
        }
        .sorting-box.big .label {
            color: #1565C0;
        }
        .sorting-box.small .label {
            color: #C2185B;
        }
        .items-area {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: flex-end;
            gap: 20px;
            width: 100%;
            padding: 0 20px;
            margin-top: auto;
            padding-bottom: 16px;
        }
        .items-row {
            display: flex;
            justify-content: center;
            align-items: flex-end;
            gap: 24px;
            width: 100%;
        }
        .item-cell {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            min-height: 100px;
        }
        .border-sticker {
            position: absolute;
            width: 36px;
            height: 36px;
            object-fit: contain;
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>

        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <div class="main">Sorting</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            
            <div class="sorting-boxes">
                <div class="sorting-box big">
                    <div class="label">Big ${themeName}</div>
                </div>
                <div class="sorting-box small">
                    <div class="label">Small ${themeName}</div>
                </div>
            </div>
            
            <div class="items-area">
                ${itemsHtml}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;

        const filename = `sorting-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateShadowMatching(data: any): Promise<string> {
        await this.initialize();

        const { theme = 'dinosaur' } = data;
        const themeKey = String(theme || 'dinosaur').toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        
        // 随机决定图标位置（左或右�?
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        // 贴纸与其他模板一�?
        const borderImages = getThemeBorders(themeKey, 16);
        const borderPool: string[] = [...borderImages];
        const baseLen = borderImages.length;
        if (baseLen > 0) {
            while (borderPool.length < 16) {
                borderPool.push(borderImages[borderPool.length % baseLen]);
            }
        }
        for (let i = borderPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [borderPool[i], borderPool[j]] = [borderPool[j], borderPool[i]];
        }

        const stickerPlacementsLeft: Array<{ top: string; left: string; rotate: number }> = [
            { top: '110px', left: '2px', rotate: -6 },
            { top: '230px', left: '2px', rotate: 4 },
            { top: '350px', left: '2px', rotate: -3 },
            { top: '470px', left: '2px', rotate: 6 },
            { top: '590px', left: '2px', rotate: -4 },
            { top: '710px', left: '2px', rotate: 5 },
            { top: '830px', left: '2px', rotate: -5 },
            { top: '950px', left: '2px', rotate: 3 },
        ];
        const stickerPlacementsRight: Array<{ top: string; right: string; rotate: number }> = [
            { top: '110px', right: '2px', rotate: 6 },
            { top: '230px', right: '2px', rotate: -4 },
            { top: '350px', right: '2px', rotate: 5 },
            { top: '470px', right: '2px', rotate: -5 },
            { top: '590px', right: '2px', rotate: 4 },
            { top: '710px', right: '2px', rotate: -4 },
            { top: '830px', right: '2px', rotate: 6 },
            { top: '950px', right: '2px', rotate: -3 }
        ];

        const perSide = Math.min(
            Math.floor(borderPool.length / 2),
            stickerPlacementsLeft.length,
            stickerPlacementsRight.length
        );
        const stickersLeft = borderPool.slice(0, perSide);
        const stickersRight = borderPool.slice(perSide, perSide * 2);

        const stickerHtmlLeft = stickersLeft.map((src: string, idx: number) => {
            const placement = stickerPlacementsLeft[idx];
            const pos = `top:${placement.top};left:${placement.left}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtmlRight = stickersRight.map((src: string, idx: number) => {
            const placement = stickerPlacementsRight[idx];
            const pos = `top:${placement.top};right:${placement.right}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtml = stickerHtmlLeft + stickerHtmlRight;

        // 选取主题彩色素材
        const colorPool = getThemeColorAssets(themeKey, 40);
        const shuffled = [...colorPool];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const selected = shuffled.slice(0, 4);
        while (selected.length < 4 && colorPool.length) {
            selected.push(colorPool[selected.length % colorPool.length]);
        }
        const rightImages = [...selected];
        for (let i = rightImages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rightImages[i], rightImages[j]] = [rightImages[j], rightImages[i]];
        }

        const rowsHtml = selected.map((src: string, idx: number) => {
            const shadow = rightImages[idx] || src;
            return `
                <div class="match-row">
                    <div class="cell color">
                        ${src ? `<img src="http://localhost:3000${src}" />` : ''}
                    </div>
                    <div class="cell shadow">
                        ${shadow ? `<img src="http://localhost:3000${shadow}" class="shadow-img" />` : ''}
                    </div>
                </div>
            `;
        }).join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            height: 1123px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 794px;
            height: 1123px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: auto;
            min-height: 52px;
            padding: 14px 36px 12px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 600;
            color: #2e2e2e;
        }
        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }
        .dash-line {
            display: inline-block;
            height: 0;
            width: 180px;
            border-bottom: 2px dashed #b8c0cc;
            transform: translateY(6px);
            vertical-align: middle;
        }
        .dash-line.short { width: 180px; }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 24px 18px 16px;
            background: transparent;
            border-radius: 16px;
            border: none;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .title-row {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-weight: 800;
            color: ${themeColors.accent};
        }
        .title-row .main {
            font-size: 38px;
            line-height: 1.1;
        }
        .title-row .title-icon {
            width: 68px;
            height: 68px;
            object-fit: contain;
        }
        .board {
            flex: 1;
            display: grid;
            grid-template-rows: repeat(4, 1fr);
            grid-auto-flow: row;
            row-gap: 18px;
            padding: 6px 4px;
        }
        .match-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: center;
            justify-items: center;
            gap: 18px;
        }
        .cell {
            width: 100%;
            height: 100%;
            min-height: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .cell img {
            max-width: 160px;
            max-height: 130px;
            object-fit: contain;
        }
        .cell.shadow img.shadow-img {
            filter: grayscale(1) brightness(0.25);
            opacity: 0.45;
        }
        .border-sticker {
            position: absolute;
            width: 36px;
            height: 36px;
            object-fit: contain;
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>

        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <div class="main">Shadow Matching</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="board">
                ${rowsHtml}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;

        const filename = `shadow-matching-${themeKey}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateBigVsSmall(data: any): Promise<string> {
        await this.initialize();

        const pages = Array.isArray((data as any)?.content)
            ? (data as any).content
            : [data?.content || data || {}];

        // Ϊÿҳ׼��ȱʡͼ�أ����������?
        const defaultIcons = getRandomDecorImages(20);

        const pagesHtml = pages.map((pageData: any) => {
            const items = Array.isArray(pageData?.items) && pageData.items.length
                ? pageData.items
                : Array.from({ length: 6 }, () => ({
                    variant: Math.random() < 0.5 ? 'more-less' : 'size'
                }));

            const htmlRows = items.map((item: any) => {
                const variant = item?.variant === 'size' ? 'size' : 'more-less';
                const image = item?.image || defaultIcons[Math.floor(Math.random() * Math.max(1, defaultIcons.length))] || '';
                const prompt = item?.prompt || (variant === 'more-less' ? 'Which side has more?' : 'Circle the biggest one');

                if (variant === 'more-less') {
                    const leftCount = Math.max(1, item?.leftCount || Math.floor(Math.random() * 5) + 2);
                    const rightCount = Math.max(1, item?.rightCount || Math.floor(Math.random() * 5) + 2);
                    const cluster = (count: number) => `
                        <div class="cluster">
                            ${Array.from({ length: count }).map(() => `
                                <span class="icon">${isImageFile(image)
                                    ? `<img src="http://localhost:3000${image}" />`
                                    : image}</span>
                            `).join('')}
                        </div>
                    `;
                    return `
                        <div class="row">
                            <div class="box">${cluster(leftCount)}</div>
                            <div class="mid">${prompt}</div>
                            <div class="box">${cluster(rightCount)}</div>
                        </div>
                    `;
                }

                // size variant
                const bigScale = item?.bigScale || 1.15;
                const smallScale = item?.smallScale || 0.75;
                const renderSized = (scale: number) => `
                    <div class="size-box">
                        ${isImageFile(image)
                            ? `<img src="http://localhost:3000${image}" style="width:${160 * scale}px;height:${140 * scale}px;" />`
                            : `<span class="emoji" style="font-size:${110 * scale}px;">${image}</span>`}
                    </div>
                `;
                return `
                    <div class="row">
                        <div class="box">${renderSized(smallScale)}</div>
                        <div class="mid">${prompt}</div>
                        <div class="box">${renderSized(bigScale)}</div>
                    </div>
                `;
            }).join('');

            return `
            <div class="page">
                <div class="title">Big vs Small</div>
                <div class="board">
                    ${htmlRows}
                </div>
            </div>
            `;
        }).join('<div class="page-break"></div>');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
    </style>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            min-height: 1123px;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
        }
        .page {
            width: 794px;
            height: 1123px;
            padding: 42px 32px 32px;
            page-break-after: always;
        }
        .title {
            text-align: center;
            font-size: 32px;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 18px;
        }
        .board {
            width: 720px;
            margin: 18px auto 0;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        .row {
            display: grid;
            grid-template-columns: 1fr 160px 1fr;
            gap: 12px;
            align-items: center;
        }
        .box {
            min-height: 130px;
            border: 2px solid #0f172a;
            border-radius: 14px;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
        }
        .cluster {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        .icon img {
            width: 70px;
            height: 70px;
            object-fit: contain;
        }
        .size-box {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
        }
        .emoji {
            font-size: 110px;
        }
        .mid {
            text-align: center;
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.3;
        }
    </style>
</head>
<body>
    ${pagesHtml}
</body>
</html>
        `;

        const filename = `big-vs-small-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateConnectDots(data: any): Promise<string> {
        await this.initialize();

        const { pageCount = 1, theme = 'dinosaur' } = data;
        const themeKey = String(theme || 'dinosaur').toLowerCase();
        const maxNumber = Math.max(1, Math.min(50, parseInt(data?.maxNumber) || 10));

        // 随机获取标题图标和主题配�?
        const titleIcon = getRandomTitleIcon(themeKey);
        const themeColors = getThemeColor(themeKey);
        
        // 随机决定图标位置（左或右�?
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        const makeDots = (count: number) => {
            const dotsArr = [];
            for (let i = 1; i <= count; i++) {
                dotsArr.push({
                    number: i,
                    x: Math.random() * 80 + 10,
                    y: Math.random() * 80 + 10
                });
            }
            return dotsArr;
        };

        const pages = Math.max(1, Math.min(5, parseInt(pageCount) || 1));
        const pagesContent = Array.from({ length: pages }, () => makeDots(maxNumber));

        // 使用通用方法生成贴纸
        const stickerHtml = this.getStickersHtml(themeKey);

        // 获取点对点图片和角色名字
        const dotsImageUrl = data.dotsImageUrl || '';
        const characterName = data.characterName || '';

        const pagesHtml = pagesContent.map((dotsArr: any[], pageIdx: number) => {
            // 如果有点对点图片，显示在 canvas �?
            const canvasContent = dotsImageUrl 
                ? `<img src="http://localhost:3000${dotsImageUrl}" style="width: 100%; height: 100%; object-fit: contain;" />`
                : '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999; font-size: 18px;">Connect the dots</div>';

            const canvasWithName = `<div class="dots-frame">${canvasContent}</div>`;

            return `
            <div class="page">
                <div class="top-bar">
                    <div class="field">Name: <span class="dash-line"></span></div>
                    <div class="field">Date: <span class="dash-line short"></span></div>
                </div>
                <div class="divider"></div>
                <div class="safe-area">
                    <div class="title-row">
                        ${iconPosition === 'left' ? titleIconHtml : ''}
                        <div class="title">Number Path</div>
                        ${iconPosition === 'right' ? titleIconHtml : ''}
                    </div>
                    <div class="subtitle"></div>
                    <div class="canvas">
                        ${canvasWithName}
                    </div>
                </div>
                ${stickerHtml}
            </div>
            `;
        }).join('<div class="page-break"></div>');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            height: 1123px;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            width: 794px;
            height: 1123px;
            position: relative;
            overflow: hidden;
            page-break-after: always;
        }
        .top-bar {
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: auto;
            min-height: 52px;
            padding: 14px 36px 12px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 600;
            color: #2e2e2e;
        }
        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }
        .dash-line {
            display: inline-block;
            height: 0;
            width: 180px;
            border-bottom: 2px dashed #b8c0cc;
            transform: translateY(6px);
            vertical-align: middle;
        }
        .dash-line.short { width: 180px; }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 28px 20px 18px;
            background: transparent;
            border-radius: 16px;
            border: none;
            box-sizing: border-box;
            z-index: 1;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .title {
            text-align: center;
            font-size: 38px;
            font-weight: 900;
            color: ${themeColors.accent};
            margin-bottom: 4px;
        }
        .title-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 4px;
        }
        .title-icon {
            width: 68px;
            height: 68px;
            object-fit: contain;
        }
        .title-bottom {
            margin-top: 12px;
        }
        .subtitle {
            text-align: center;
            font-size: 16px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 0;
        }
        .canvas {
            position: relative;
            flex: 1;
            width: 100%;
            border: none;
            border-radius: 16px;
            background: #fff;
            overflow: hidden;
        }
        .dots-frame {
            position: absolute;
            inset: 12px;
            border: none; /* 移除内层黑框 */
            border-radius: 14px;
            overflow: hidden;
        }
        .character-name {
            text-align: center;
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 12px;
            padding: 6px 14px;
        }
        .character-name.no-border {
            border: none;
            background: transparent;
            padding: 0;
        }
        .dot {
            position: absolute;
            width: 12px;
            height: 12px;
            background: #0f172a;
            border-radius: 50%;
            transform: translate(-50%, -50%);
        }
        .dot .num {
            position: absolute;
            top: -18px;
            left: 12px;
            font-size: 12px;
            font-weight: 800;
            color: #0f172a;
        }
        .page-break { page-break-after: always; }
        .border-sticker {
            position: absolute;
            width: 36px;
            height: 36px;
            object-fit: contain;
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }
    </style>
</head>
<body>
    ${pagesHtml}
</body>
</html>
        `;

        const filename = `connect-dots-${themeKey}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async generateLetterTracing(data: any): Promise<string> {
        await this.initialize();

        const { letter } = data;
        const upperLetter = letter.toUpperCase();
        const lowerLetter = letter.toLowerCase();

        const { image: mainImage, word } = getLetterImage(letter);

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
    </style>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            width: 794px;
            height: 1123px;
            padding: 30px;
            background: white;
            font-family: 'Quicksand', sans-serif;
        }

        .name-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .input-field {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: bold;
            color: #475569;
        }
        
        .line {
            width: 200px;
            height: 2px;
            background: #cbd5e1;
            border-radius: 1px;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding: 0 30px 0 50px;
        }
        
        .big-letter-container {
            position: relative;
            width: 220px;
            height: 220px;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translateY(-10px); /* lift to avoid touching baseline */
        }
        
        .big-letter {
            font-size: 220px;
            font-weight: bold;
            line-height: 1;
            color: #1e293b;
        }

        .image-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #fff;
            padding: 10px;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            border: 1px solid #e2e8f0;
        }
        
        .main-image {
            width: 180px;
            height: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 90px;
            margin-bottom: 5px;
        }
        
        .main-image img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        
        .word-label {
            font-size: 20px;
            font-weight: bold;
            color: #475569;
            letter-spacing: 1px;
        }

        .tracing-box {
            border: 3px solid #1e293b;
            border-radius: 16px;
            padding: 15px 20px;
            margin-bottom: 20px;
            background: #f8fafc;
        }
        
        .box-label {
            font-size: 14px;
            font-weight: bold;
            color: #475569;
            margin-bottom: 10px;
            text-transform: uppercase;
        }

        .tracing-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 80px;
        }

        .trace-char {
            font-size: 80px;
            color: #cbd5e1;
            font-weight: normal;
            font-family: 'Quicksand', sans-serif;
        }
        
        .trace-char.solid {
            color: #1e293b;
        }

        .practice-section {
            margin-top: 15px;
        }
        
        .practice-title {
            font-size: 16px;
            font-weight: bold;
            color: #475569;
            margin-bottom: 18px;
        }
        
        .practice-box {
            height: 85px;
            border: 2px dashed #94a3b8;
            border-radius: 12px;
            margin-bottom: 18px;
            background: white;
        }

        .footer {
            position: fixed;
            bottom: 10mm;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #cbd5e1;
        }
    </style>
</head>
<body>
    <div class="name-header">
        <div class="input-field">
            Name: <div class="line"></div>
        </div>
        <div class="input-field">
            Date: <div class="line" style="width: 150px;"></div>
        </div>
    </div>

    <div class="header">
        <div class="big-letter-container">
            <div class="big-letter">${upperLetter}${lowerLetter}</div>
        </div>
        
        <div class="image-container">
            <div class="main-image">
                ${isImageFile(mainImage)
                ? `<img src="http://localhost:3000${mainImage}" alt="${word}">`
                : mainImage}
            </div>
            <div class="word-label">${word}</div>
        </div>
    </div>

    <div class="tracing-box">
        <div class="box-label">Uppercase</div>
        <div class="tracing-row">
            <div class="trace-char solid">${upperLetter}</div>
            ${Array(5).fill(upperLetter).map(l => `<div class="trace-char">${l}</div>`).join('')}
        </div>
    </div>

    <div class="tracing-box">
        <div class="box-label">Lowercase</div>
        <div class="tracing-row">
            <div class="trace-char solid">${lowerLetter}</div>
            ${Array(5).fill(lowerLetter).map(l => `<div class="trace-char">${l}</div>`).join('')}
        </div>
    </div>

    <div class="practice-section">
        <div class="practice-title">Practice Writing:</div>
        <div class="practice-box"></div>
        <div class="practice-box"></div>
        <div class="practice-box"></div>
    </div>

    <div class="footer">AI Kid Print ? Learning ${upperLetter}${lowerLetter} ? ${word}</div>
</body>
</html>
        `;

        const filename = `letter-${letter}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);

        await page.evaluateHandle('document.fonts.ready');

        await page.screenshot({
            path: filepath,
            fullPage: true
        });

        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateCvcSimpleWords(data: any): Promise<string> {
        await this.initialize();

        const contentArray = Array.isArray((data as any)?.content)
            ? (data as any).content
            : Array.isArray(data)
                ? (data as any)
                : [data || {}];

        const pagesHtml = contentArray.map((pageData: any) => {
            let words = Array.isArray(pageData?.words) ? pageData.words : [];
            if (!words || words.length === 0) {
                words = [
                    { word: 'cat' },
                    { word: 'dog' },
                    { word: 'bus' },
                    { word: 'sun' },
                    { word: 'pig' },
                    { word: 'pen' }
                ];
            }
            const items = words.map((item: any) => {
                const wordRaw = (item?.word || 'cat').toString();
                const word = wordRaw.replace(/\d+/g, '').trim() || 'word';
                const providedImage = item?.image;
                if (providedImage) {
                    return { word, image: providedImage, imgWord: word };
                }
                const firstLetter = (item?.letter || word.charAt(0) || 'A').toUpperCase();
                const { image, word: imgWord } = getLetterImage(firstLetter, word);
                return { word, image, imgWord };
            });

            const rows = [];
            for (let i = 0; i < items.length; i += 2) {
                rows.push(items.slice(i, i + 2));
            }

            return `
            <div class="page">
                <div class="title">CVC Words</div>
                <div class="board">
                    ${rows.map((row: any[]) => `
                        <div class="row">
                            ${row.map(item => `
                                <div class="card">
                                    <div class="image-wrapper">
                                        ${isImageFile(item.image)
                                            ? `<img src="http://localhost:3000${item.image}" alt="${item.imgWord}">`
                                            : `<span class="emoji">${item.image}</span>`}
                                    </div>
                                    <div class="divider"></div>
                                    <div class="trace ${item.word.length > 8 ? 'shrink' : ''}">
                                        ${item.word}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
            `;
        }).join('<div class="page-break"></div>');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
    </style>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            min-height: 1123px;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
        }
        .page {
            width: 794px;
            height: 1123px;
            padding: 42px 32px 32px;
            page-break-after: always;
        }
        .title {
            text-align: center;
            font-size: 32px;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 18px;
        }
        .board {
            width: 720px;
            margin: 48px auto 0;
            display: flex;
            flex-direction: column;
            gap: 34px;
        }
        .row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
        }
        .card {
            height: 280px;
            border: 2px solid #0f172a;
            border-radius: 16px;
            padding: 16px 14px 12px;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            gap: 12px;
        }
        .trace {
            font-size: 32px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: 1.2px;
        }
        .trace.shrink {
            font-size: 26px;
        }
        .divider {
            width: 90%;
            border-top: 2px dashed #cbd5e1;
            margin: -2px 0 6px 0;
        }
        .image-wrapper {
            flex: 1;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding-top: 4px;
        }
        .image-wrapper img {
            max-width: 200px;
            max-height: 180px;
            object-fit: contain;
        }
        .image-wrapper .emoji {
            font-size: 120px;
        }
    </style>
</head>
<body>
    ${pagesHtml}
</body>
</html>
        `;

        const filename = `cvc-simple-words-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateCountAndWrite(data: any): Promise<string> {
        await this.initialize();

        const { theme = 'dinosaur' } = data;
        const themeKey = String(theme || 'dinosaur').toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        
        // 随机决定图标位置（左或右�?
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" alt="theme icon">` : '';

        const contentArray = Array.isArray((data as any)?.content)
            ? (data as any).content
            : Array.isArray(data)
                ? (data as any)
                : [data || {}];

        const borderImages = getThemeBorders(themeKey, 16);
        const borderPool: string[] = [...borderImages];
        const baseLen = borderImages.length;
        if (baseLen > 0) {
            while (borderPool.length < 16) {
                borderPool.push(borderImages[borderPool.length % baseLen]);
            }
        }
        for (let i = borderPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [borderPool[i], borderPool[j]] = [borderPool[j], borderPool[i]];
        }

        const stickerPlacementsLeft: Array<{ top: string; left: string; rotate: number }> = [
            { top: '110px', left: '2px', rotate: -6 },
            { top: '230px', left: '2px', rotate: 4 },
            { top: '350px', left: '2px', rotate: -3 },
            { top: '470px', left: '2px', rotate: 6 },
            { top: '590px', left: '2px', rotate: -4 },
            { top: '710px', left: '2px', rotate: 5 },
            { top: '830px', left: '2px', rotate: -5 },
            { top: '950px', left: '2px', rotate: 3 },
        ];
        const stickerPlacementsRight: Array<{ top: string; right: string; rotate: number }> = [
            { top: '110px', right: '2px', rotate: 6 },
            { top: '230px', right: '2px', rotate: -4 },
            { top: '350px', right: '2px', rotate: 5 },
            { top: '470px', right: '2px', rotate: -5 },
            { top: '590px', right: '2px', rotate: 4 },
            { top: '710px', right: '2px', rotate: -4 },
            { top: '830px', right: '2px', rotate: 6 },
            { top: '950px', right: '2px', rotate: -3 }
        ];

        const perSide = Math.min(
            Math.floor(borderPool.length / 2),
            stickerPlacementsLeft.length,
            stickerPlacementsRight.length
        );
        const stickersLeft = borderPool.slice(0, perSide);
        const stickersRight = borderPool.slice(perSide, perSide * 2);

        const stickerHtmlLeft = stickersLeft.map((src: string, idx: number) => {
            const placement = stickerPlacementsLeft[idx];
            const pos = `top:${placement.top};left:${placement.left}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtmlRight = stickersRight.map((src: string, idx: number) => {
            const placement = stickerPlacementsRight[idx];
            const pos = `top:${placement.top};right:${placement.right}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtml = stickerHtmlLeft + stickerHtmlRight;

        const themeIcons = getThemeMainColorAssets(themeKey, 30);

        const titleIconMap: Record<string, string> = {
            dinosaur: '/uploads/assets/B_character_ip/dinosaur/poses/color/dinosaur_reading_pose.png',
            ocean: '/uploads/assets/B_character_ip/ocean/poses/color/ocean_whale_reading_pose.png',
            safari: '/uploads/assets/B_character_ip/safari/poses/color/safari_lion_reading_pose.png',
            space: '/uploads/assets/B_character_ip/space/poses/color/space_astronaut_reading_pose.png',
            unicorn: '/uploads/assets/B_character_ip/unicorn/poses/color/unicorn_reading_pose.png',
            vehicles: '/uploads/assets/B_character_ip/vehicles/poses/color/vehicles_car_reading_pose.png'
        };

        const pagesHtml = contentArray.map((pageData: any) => {
            const items = Array.isArray(pageData?.items) ? pageData.items.slice(0, 5) : [];
            if (items.length === 0) {
                for (let i = 0; i < 5; i++) {
                    items.push({ count: Math.floor(Math.random() * 5) + 1 });
                }
            }

            const titleText = 'Counting Objects';
            const titleIcon = titleIconMap[themeKey] || titleIconMap['dinosaur'];
            const rowsHtml = items.map((item: any, idx: number) => {
                // 右侧 3 个数字：随机生成 1-6 且升�?
                const optionsSet = new Set<number>();
                while (optionsSet.size < 3) {
                    optionsSet.add(Math.floor(Math.random() * 5) + 1); // 1-5
                }
                const options = Array.from(optionsSet).sort((a, b) => a - b);
                // 左侧图标数量：从右侧三个数字里随机挑一个（最�?6�?
                const correctIndex = Math.floor(Math.random() * options.length);
                const count = Math.min(5, options[correctIndex]);

                // 动态缩放，数量多时自动变小，避免超出容�?
                const size = Math.max(42, 90 - (count - 1) * 6);
                const randomIcon = () => (themeIcons.length ? themeIcons[Math.floor(Math.random() * themeIcons.length)] : '');
                const icons = `<div class="icon-box">${Array.from({ length: count }, () => {
                    const iconSrc = randomIcon();
                    const iconTag = iconSrc
                        ? `<img src="http://localhost:3000${iconSrc}" alt="icon" style="max-width:${size}px;max-height:${size}px;">`
                        : `<span class="emoji" style="font-size:${size}px;">🦕</span>`;
                    return `<span class="icon">${iconTag}</span>`;
                }).join('')}</div>`;

                // 右侧数字升序展示，正确项随机落位
                const optionsHtml = options.map(n => `<div class="opt${n === count ? ' correct' : ''}">${n}</div>`).join('');

                        return `
                        <div class="row">
                            <div class="cluster">${icons}</div>
                    <div class="option-set">${optionsHtml}</div>
                        </div>
                        `;
            }).join('');

            return `
            <div class="page">
                <div class="top-bar">
                    <div class="field">Name: <span class="dash-line"></span></div>
                    <div class="field">Date: <span class="dash-line short"></span></div>
                </div>
                <div class="divider"></div>
                <div class="safe-area">
                    <div class="title-row">
                        ${iconPosition === 'left' ? titleIconHtml : ''}
                        <div class="title">${titleText}</div>
                        ${iconPosition === 'right' ? titleIconHtml : ''}
                    </div>
                    <div class="board">
                        ${rowsHtml}
                    </div>
                </div>
                ${stickerHtml}
            </div>
            `;
        }).join('<div class="page-break"></div>');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            min-height: 1123px;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            width: 794px;
            height: 1123px;
            position: relative;
            overflow: hidden;
            page-break-after: always;
        }
        .top-bar {
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: auto;
            min-height: 52px;
            padding: 14px 36px 12px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 600;
            color: #2e2e2e;
        }
        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }
        .dash-line {
            display: inline-block;
            height: 0;
            width: 180px;
            border-bottom: 2px dashed #b8c0cc;
            transform: translateY(6px);
            vertical-align: middle;
        }
        .dash-line.short { width: 180px; }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 28px 20px 18px;
            background: transparent;
            border-radius: 16px;
            border: none;
            display: flex;
            flex-direction: column;
            gap: 20px;
            justify-content: flex-start;
        }
        .title-row {
            margin-top: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }
        .title {
            text-align: center;
            font-size: 38px;
            font-weight: 900;
            color: ${themeColors.accent};
            margin: 0;
        }
        .title-icon {
            width: 68px;
            height: 68px;
            object-fit: contain;
        }
        .board {
            width: 100%;
            margin: 12px auto 0;
            display: flex;
            flex-direction: column;
            gap: 16px;
            border-top: 1.5px solid #0f172a; /* 顶部单条黑线 */
            padding-top: 6px;
        }
        .row {
            position: relative;
            display: grid;
            grid-template-columns: auto 1fr;
            align-items: center;
            gap: 8px;
            padding: 10px 4px 10px 12px; /* 右侧缩至 4px，贴近安全区 */
            border: none; /* 去掉大黑�?*/
            border-bottom: 1.5px solid #0f172a; /* 单条分隔�?*/
            border-radius: 0;
            background: transparent;
            width: 100%;
        }
        .cluster {
            height: 120px;
            width: 420px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 4px;
            overflow: hidden;
            flex-wrap: nowrap; /* 强制单行 */
        }
        .cluster .icon-box {
            width: 100%;
            height: 100%;
            border: none; /* 去掉小黑�?*/
            border-radius: 0;
            padding: 10px 8px;
            display: flex;
            flex-wrap: nowrap; /* 禁止换行 */
            gap: 10px;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.9);
            overflow: hidden;
        }
        .icon {
            width: 70px;
            height: 70px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
        }
        .icon img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            max-width: none;
            max-height: none;
        }
        .option-set {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
            justify-items: center;
            align-items: center;
            align-content: center;
            width: 210px;
            height: 110px;
            padding: 8px 10px;
            border: none;
            border-radius: 10px;
            background: rgba(255,255,255,0.9);
            justify-self: end;
        }
        .opt {
            width: 58px;
            height: 58px;
            border: 3px solid #0f172a;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            background: #fff;
        }
        .opt.correct {
            border-color: #2dd4bf;
            background: #e7fbf6;
        }
        .page-break { page-break-after: always; }
        .border-sticker {
            position: absolute;
            width: 36px;
            height: 36px;
            object-fit: contain;
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }
    </style>
</head>
<body>
    ${pagesHtml}
</body>
</html>
        `;

        const filename = `count-write-${themeKey}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }
    async generateAlphabetOrder(data: any): Promise<string> {
        await this.initialize();

        const contentArray = Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data)
                ? data
                : [data || {}];

        // �̶�ʹ�ñ�������ṩ�ľ�̬Ŀ¼�����⻷������ָ����Ч�����������
        const fontBase = `http://localhost:${process.env.PORT || 3000}`;

        const pagesHtml = contentArray.map((pageData: any) => {
            const rows = Array.isArray(pageData?.rows) ? pageData.rows : [];
            const items = rows.map((row: any) => {
                const letters = row?.sequence || [];
                const missing = row?.missingLetter || 'A';
                const { image, word } = getLetterImage(missing);
                return {
                    letters,
                    missing,
                    image,
                    word
                };
            }).slice(0, 5);

            return `
            <div class="page">
                <div class="title">Alphabet Order</div>
                <div class="board">
                    ${items.map((item: any) => `
                        <div class="row">
                            <div class="seq">
                                ${item.letters.map((ch: string) => ch === '_'
                                    ? `<span class="blank"></span>`
                                    : `<span>${ch}</span>`).join('')}
                            </div>
                            <div class="image-wrapper">
                                ${isImageFile(item.image)
                                    ? `<img src="${fontBase}${item.image}" alt="${item.word}">`
                                    : `<span class="emoji">${item.image}</span>`}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            `;
        }).join('<div class="page-break"></div>');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
                    src: url('${fontBase}/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
                    src: url('${fontBase}/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
                    src: url('${fontBase}/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
                    src: url('${fontBase}/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
    </style>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            min-height: 1123px;
            padding: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
        }
        .page {
            width: 794px;
            height: 1123px;
            padding: 48px 32px 32px;
            page-break-after: always;
        }
        .title {
            text-align: center;
            font-size: 32px;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 20px;
        }
        .board {
            width: 620px;
            margin: 40px auto 0;
            display: flex;
            flex-direction: column;
            gap: 52px;
        }
        .row {
            display: grid;
            grid-template-columns: 1fr 150px;
            align-items: center;
            gap: 30px;
        }
        .seq {
            display: flex;
            gap: 14px;
            align-items: center;
            font-size: 40px;
            font-weight: 900;
            color: #0f172a;
        }
        .blank {
            width: 30px;
            height: 38px;
            border-bottom: 3px solid #0f172a;
        }
        .image-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 140px;
        }
        .image-wrapper img {
            max-width: 170px;
            max-height: 120px;
            object-fit: contain;
        }
        .image-wrapper .emoji {
            font-size: 120px;
        }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    ${pagesHtml}
</body>
</html>
        `;

        const filename = `alphabet-order-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateCustomName(data: any): Promise<string> {
        await this.initialize();

        const name: string = (data?.name || 'EMMA').trim();
        const safeName = name.length > 0 ? name : 'EMMA';
        const displayName = safeName.charAt(0).toUpperCase() + safeName.slice(1).toLowerCase();
        const upperName = safeName.toUpperCase();
        const firstLetter = upperName.charAt(0) || 'A';
        const { image: letterImage, word: letterWord } = getLetterImage(firstLetter);
        const animalImages = getRandomAnimalImages(2);
        const animalStickers = animalImages.length > 0 ? animalImages : ['??', '??'];

        const tracerLarge = upperName.split('').join(' ');
        const tracerMedium = `${displayName} ${displayName} ${displayName} ${displayName}`;

        const practiceBoxes = Array(3).fill(displayName);

        const decorEmojis = ['?', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??', '??'];
        const decorSpans = Array.from({ length: 14 }).map((_, i) => {
            const emoji = decorEmojis[i % decorEmojis.length];
            const top = Math.random() * 90;
            const left = Math.random() * 90;
            return `<span class="decor" style="top:${top}%;left:${left}%;">${emoji}</span>`;
        }).join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
    </style>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            height: 1123px;
            padding: 28px;
            background: white;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .canvas {
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 18px;
            position: relative;
            overflow: hidden;
            padding: 24px;
        }
        .decor-container { position: absolute; inset: 0; pointer-events: none; }
        .decor { position: absolute; font-size: 20px; opacity: 0.2; }
        .header {
            text-align: center;
            margin-bottom: 22px;
        }
        .title {
            font-size: 42px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: 2px;
        }
        .subtitle {
            margin-top: 6px;
            font-size: 15px;
            color: #475569;
            font-weight: 700;
        }
        .sticker-section {
            margin: 20px auto 14px;
            display: flex;
            justify-content: center;
            gap: 32px;
        }
        .sticker-item {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .sticker-img {
            width: 300px;
            height: 260px;
            object-fit: contain;
        }
        .sticker-emoji {
            font-size: 140px;
            opacity: 0.96;
        }
        .section {
            border: 3px solid #0f172a;
            border-radius: 14px;
            padding: 14px 16px;
            background: #f8fafc;
            margin-bottom: 14px;
        }
        .friend-section {
            border: none;
            background: transparent;
            padding: 8px 0;
            margin-top: 6px;
        }
        .section-title {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .trace-line {
            font-size: 64px;
            color: #cbd5e1;
            font-weight: 400;
            letter-spacing: 10px;
        }
        .trace-medium {
            font-size: 40px;
            color: #cbd5e1;
            font-weight: 400;
            letter-spacing: 6px;
            line-height: 1.4;
        }
        .box-row {
            display: flex;
            gap: 12px;
            margin-bottom: 10px;
        }
        .box {
            flex: 1;
            height: 64px;
            border: 2px dashed #cbd5e1;
            border-radius: 12px;
            background: white;
        }
        .badge {
            margin-top: 4px;
            font-size: 13px;
            color: #1e293b;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .icon-card {
            margin-top: 6px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border: 2px solid #0f172a;
            border-radius: 12px;
            background: #fff;
        }
        .icon-img {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }
        .footer {
            position: absolute;
            bottom: 16px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <div class="canvas">
        <div class="decor-container">
            ${decorSpans}
        </div>
        <div class="header">
            <div class="title">? ${upperName} ?</div>
            <div class="subtitle">?? ?? ?? Little ${displayName}��s Name Practice ?? ?? ??</div>
        </div>

        <div class="section">
            <div class="section-title">?? 1. TRACE THE NAME</div>
            <div class="trace-line">${tracerLarge}</div>
        </div>

        <div class="section">
            <div class="section-title">?? 2. PRACTICE LINES</div>
            <div class="trace-medium">${tracerMedium}</div>
            <div class="trace-medium" style="margin-top:8px;">${tracerMedium}</div>
        </div>

        <div class="section">
            <div class="section-title">?? 3. WRITE IN THE BOXES</div>
            <div class="box-row">
                ${practiceBoxes.map(() => `<div class="box"></div>`).join('')}
            </div>
            <div class="box-row">
                ${practiceBoxes.map(() => `<div class="box"></div>`).join('')}
            </div>
        </div>

        <div class="sticker-section">
            ${animalStickers.map(sticker => `
                <div class="sticker-item">
                    ${isImageFile(sticker)
                        ? `<img class="sticker-img" src="http://localhost:3000${sticker}" alt="animal sticker">`
                        : `<span class="sticker-emoji">${sticker}</span>`}
                </div>
            `).join('')}
        </div>

        <div class="footer">AI Kid Print ? Learning ${displayName}</div>
    </div>
</body>
</html>
        `;

        const filename = `custom-name-${upperName}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');

        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateLetterHunt(data: any): Promise<string> {
        await this.initialize();

        const targetLetter = (data?.targetLetter || 'A').toUpperCase();
        const letters: string[] = Array.isArray(data?.letters) ? data.letters : [];
        const letterSize = data?.letterSize || 26;
        const difficulty = data?.difficulty || 'medium';
        const mainImage = data?.mainImage;
        const gridSizeInput = data?.gridSize;
        const title = `Find the letter ${targetLetter}`;

        const availableLetters = letters.length > 0 ? letters : Array.from({ length: 60 }, () =>
            Math.random() < 0.35 ? targetLetter : String.fromCharCode(65 + Math.floor(Math.random() * 26))
        );

        // ��������ͼƬռ 3x3
        const totalSlots = availableLetters.length + (mainImage ? 9 : 0);
        const gridSize = gridSizeInput || Math.max(6, Math.ceil(Math.sqrt(totalSlots)));
        const cells: { row: number; col: number }[] = [];
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                cells.push({ row: r, col: c });
            }
        }

        let imageOrigin: { row: number; col: number } | null = null;
        if (mainImage) {
            const maxStart = gridSize - 3;
            const row = Math.floor(Math.random() * (maxStart + 1));
            const col = Math.floor(Math.random() * (maxStart + 1));
            imageOrigin = { row, col };
        }

        // ���˵���ͼƬռ�õĸ���
        const freeCells = cells.filter(cell => {
            if (!imageOrigin) return true;
            return !(
                cell.row >= imageOrigin.row && cell.row < imageOrigin.row + 3 &&
                cell.col >= imageOrigin.col && cell.col < imageOrigin.col + 3
            );
        });

        // ���ҿ��ø���
        for (let i = freeCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [freeCells[i], freeCells[j]] = [freeCells[j], freeCells[i]];
        }

        // �ض���ĸ�������������?
        const lettersTrimmed = availableLetters.slice(0, freeCells.length);

        const gridLetters: (string | null)[][] = Array.from({ length: gridSize }, () =>
            Array.from({ length: gridSize }, () => null)
        );

        lettersTrimmed.forEach((ch, idx) => {
            const cell = freeCells[idx];
            gridLetters[cell.row][cell.col] = ch;
        });

        const imageBlock = mainImage && imageOrigin ? (() => {
            const cellPct = 100 / gridSize;
            const top = imageOrigin.row * cellPct;
            const left = imageOrigin.col * cellPct;
            const spanRows = 3;
            const spanCols = 3;
            const width = cellPct * spanCols;
            const height = cellPct * spanRows;
            return isImageFile(mainImage)
                ? `<img src="http://localhost:3000${mainImage}" class="main-image" style="top:${top}%;left:${left}%;width:${width}%;height:${height}%;">`
                : `<span class="main-emoji" style="top:${top}%;left:${left}%;width:${width}%;height:${height}%;font-size:${letterSize * 6}px;">${mainImage}</span>`;
        })() : '';

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
    </style>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            height: 1123px;
            padding: 32px;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .canvas {
            width: 100%;
            height: 100%;
            border-radius: 0;
            background: #fff;
            padding: 26px;
            position: relative;
            overflow: hidden;
        }
        .header {
            text-align: center;
            margin-bottom: 18px;
        }
        .title {
            font-size: 34px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: 1px;
        }
        .subtitle {
            margin-top: 4px;
            font-size: 16px;
            color: #475569;
            font-weight: 700;
        }
        .play-area {
            position: relative;
            flex: 1;
            border: 2px dashed #e2e8f0;
            border-radius: 16px;
            background: #ffffff;
            overflow: hidden;
            min-height: 780px;
            display: grid;
            grid-template-columns: repeat(${gridSize}, 1fr);
            gap: 8px;
            padding: 12px;
        }
        .cell {
            aspect-ratio: 1 / 1;
            border: 1px dashed #d9e2ec;
            border-radius: 10px;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        .cell.hidden {
            border-color: transparent;
            background: transparent;
        }
        .cell span {
            font-weight: 900;
            color: #0f172a;
            line-height: 1;
        }
        .main-image, .main-emoji {
            position: absolute;
            opacity: 0.9;
            filter: drop-shadow(0 6px 10px rgba(0,0,0,0.16));
            border-radius: 6px;
        }
        .footer {
            position: absolute;
            bottom: 12px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            font-weight: 700;
        }
    </style>
</head>
<body>
    <div class="canvas">
        <div class="header">
            <div class="title">Circle all the ${targetLetter}'s</div>
            <div class="subtitle">Uppercase and lowercase are both hiding!</div>
        </div>
        <div class="play-area">
            ${gridLetters.map((row, rIdx) => row.map((cell, cIdx) => {
                // image�����ÿհ�ռλ��ͼƬ���Զ�λ����
                if (imageOrigin &&
                    rIdx >= imageOrigin.row && rIdx < imageOrigin.row + 3 &&
                    cIdx >= imageOrigin.col && cIdx < imageOrigin.col + 3) {
                    return `<div class="cell hidden"></div>`;
                }
                return `<div class="cell"><span style="font-size:${letterSize * (0.9 + Math.random() * 0.2)}px;transform:rotate(${(Math.random()-0.5)*6}deg);">${cell ?? ''}</span></div>`;
            }).join('')).join('')}
            ${imageBlock}
        </div>
        <div class="footer">AI Kid Print ? Letter Hunt ? Target: ${targetLetter} ? Difficulty: ${difficulty}</div>
    </div>
</body>
</html>
        `;

        const filename = `letter-hunt-${targetLetter}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    /**
     * 生成 Pattern Sequencing（图案序列）练习页
     * 每行展示一个重复的图案序列，孩子需要识别规律并在空白框中填入下一个图�?
     */
    async generatePatternSequencing(data: any): Promise<string> {
        await this.initialize();

        // 支持两种数据格式：直接传参或通过 content 传参
        const content = data?.content || data || {};
        const { theme = 'dinosaur', rowCount = 4 } = content;
        const themeKey = String(theme || 'dinosaur').toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);

        // 获取主题素材
        const colorAssets = getThemeColorAssets(themeKey, 20);
        if (colorAssets.length < 2) {
            throw new Error(`主题 ${themeKey} 的素材不足，需要至�?个`);
        }

        // 随机决定图标位置
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        // 贴纸装饰
        const borderImages = getThemeBorders(themeKey, 16);
        const borderPool: string[] = [...borderImages];
        const baseLen = borderImages.length;
        if (baseLen > 0) {
            while (borderPool.length < 16) {
                borderPool.push(borderImages[borderPool.length % baseLen]);
            }
        }
        for (let i = borderPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [borderPool[i], borderPool[j]] = [borderPool[j], borderPool[i]];
        }

        const stickerPlacementsLeft: Array<{ top: string; left: string; rotate: number }> = [
            { top: '110px', left: '2px', rotate: -6 },
            { top: '230px', left: '2px', rotate: 4 },
            { top: '350px', left: '2px', rotate: -3 },
            { top: '470px', left: '2px', rotate: 6 },
            { top: '590px', left: '2px', rotate: -4 },
            { top: '710px', left: '2px', rotate: 5 },
            { top: '830px', left: '2px', rotate: -5 },
            { top: '950px', left: '2px', rotate: 3 },
        ];
        const stickerPlacementsRight: Array<{ top: string; right: string; rotate: number }> = [
            { top: '110px', right: '2px', rotate: 6 },
            { top: '230px', right: '2px', rotate: -4 },
            { top: '350px', right: '2px', rotate: 5 },
            { top: '470px', right: '2px', rotate: -5 },
            { top: '590px', right: '2px', rotate: 4 },
            { top: '710px', right: '2px', rotate: -4 },
            { top: '830px', right: '2px', rotate: 6 },
            { top: '950px', right: '2px', rotate: -3 }
        ];

        const perSide = Math.min(
            Math.floor(borderPool.length / 2),
            stickerPlacementsLeft.length,
            stickerPlacementsRight.length
        );
        const stickersLeft = borderPool.slice(0, perSide);
        const stickersRight = borderPool.slice(perSide, perSide * 2);

        const stickerHtmlLeft = stickersLeft.map((src: string, idx: number) => {
            const placement = stickerPlacementsLeft[idx];
            const pos = `top:${placement.top};left:${placement.left}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtmlRight = stickersRight.map((src: string, idx: number) => {
            const placement = stickerPlacementsRight[idx];
            const pos = `top:${placement.top};right:${placement.right}`;
            return `<img class="border-sticker" src="http://localhost:3000${src}" style="${pos};transform: rotate(${placement.rotate}deg);" />`;
        }).join('');

        const stickerHtml = stickerHtmlLeft + stickerHtmlRight;

        // 生成序列行数�?
        // 规律模式: AB, AAB, ABB, AABB, ABAB
        const patterns = ['AB', 'AAB', 'ABB', 'AABB', 'ABAB'];
        const rows: Array<{ images: string[]; pattern: string }> = [];

        // 打乱素材池，确保每行使用不同的图案对
        const shuffledAssets = [...colorAssets].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < rowCount; i++) {
            // 每行使用不同的两个素材（按顺序取，避免重复）
            const assetA = shuffledAssets[(i * 2) % shuffledAssets.length];
            const assetB = shuffledAssets[(i * 2 + 1) % shuffledAssets.length];

            // 随机选择规律模式
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            const sequence: string[] = [];
            let repeatCount = 0;

            // 根据模式生成序列 - 固定显示6个图�?
            switch (pattern) {
                case 'AB':
                    // A B A B A B -> 显示6�?
                    for (let j = 0; j < 3; j++) {
                        sequence.push(assetA, assetB);
                    }
                    break;
                case 'AAB':
                    // A A B A A B -> 显示6�?
                    for (let j = 0; j < 2; j++) {
                        sequence.push(assetA, assetA, assetB);
                    }
                    break;
                case 'ABB':
                    // A B B A B B -> 显示6�?
                    for (let j = 0; j < 2; j++) {
                        sequence.push(assetA, assetB, assetB);
                    }
                    break;
                case 'AABB':
                    // A A B B A A -> 显示6�?
                    sequence.push(assetA, assetA, assetB, assetB, assetA, assetA);
                    break;
                case 'ABAB':
                    // A B A B A B -> 显示6个（与AB相同但作为独立模式）
                    sequence.push(assetA, assetB, assetA, assetB, assetA, assetB);
                    break;
            }

            // 固定�?个图�?
            const displayImages = sequence.slice(0, 6);

            rows.push({ images: displayImages, pattern });
        }

        // 生成�?HTML - 6个图�?+ 1个空白框（无问号�?
        const rowsHtml = rows.map((row, idx) => {
            const imagesHtml = row.images.map(img => 
                `<img class="seq-item" src="http://localhost:3000${img}" />`
            ).join('');

            return `
                <div class="seq-row">
                    <div class="seq-number">${idx + 1}.</div>
                    <div class="seq-images">
                        ${imagesHtml}
                    </div>
                    <div class="seq-blank"></div>
                </div>
            `;
        }).join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-regular.woff2') format('woff2');
            font-weight: 400;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-500.woff2') format('woff2');
            font-weight: 500;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-600.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
        }
        @font-face {
            font-family: 'Quicksand';
            src: url('/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            height: 1123px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 794px;
            height: 1123px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 0;
            left: 24px;
            right: 24px;
            height: auto;
            min-height: 52px;
            padding: 14px 36px 12px;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 600;
            color: #2e2e2e;
        }
        .field {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 10px;
        }
        .dash-line {
            display: inline-block;
            height: 0;
            width: 180px;
            border-bottom: 2px dashed #b8c0cc;
            transform: translateY(6px);
            vertical-align: middle;
        }
        .dash-line.short { width: 180px; }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 24px 18px 16px;
            background: transparent;
            border-radius: 16px;
            border: none;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .title-area {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-weight: 800;
            color: ${themeColors.accent};
            margin-bottom: 8px;
        }
        .title-area .main {
            font-size: 36px;
        }
        .title-area .title-icon {
            width: 64px;
            height: 64px;
            object-fit: contain;
        }
        .instruction {
            text-align: center;
            font-size: 18px;
            color: #475569;
            margin-bottom: 12px;
        }
        .seq-container {
            display: flex;
            flex-direction: column;
            gap: 28px;
            flex: 1;
            justify-content: space-around;
            padding: 10px 0;
        }
        .seq-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 8px;
            background: ${themeColors.light};
            border-radius: 16px;
        }
        .seq-number {
            font-size: 24px;
            font-weight: 700;
            color: ${themeColors.accent};
            min-width: 36px;
        }
        .seq-images {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
        }
        .seq-item {
            width: 80px;
            height: 80px;
            object-fit: contain;
        }
        .seq-blank {
            width: 80px;
            height: 80px;
            border: 3px dashed ${themeColors.primary};
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: 700;
            color: ${themeColors.secondary};
            background: rgba(255,255,255,0.8);
            flex-shrink: 0;
        }
        .border-sticker {
            position: absolute;
            width: 36px;
            height: 36px;
            object-fit: contain;
            opacity: 0.9;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>

        <div class="safe-area">
            <div class="title-area">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <div class="main">Pattern Sequencing</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="seq-container">
                ${rowsHtml}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;

        const filename = `pattern-sequencing-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    /**
     * 生成 Shape Path 页面
     * 形状路径练习 - 沿着形状从起点走到终点
     */
    async generateShapePath(data: any): Promise<string> {
        await this.initialize();
        
        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const stickerHtml = this.getStickersHtml(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        
        // 形状类型
        const shapes = ['circle', 'square', 'triangle'];
        
        // 生成 5x5 的网格（5列5行），确保三种形状出现概率相等
        // 总共 25 个格子，每种形状至少 8 个，剩余 1 个随机
        const shapePool: string[] = [];
        for (let i = 0; i < 8; i++) {
            shapePool.push('circle', 'square', 'triangle');
        }
        shapePool.push(shapes[Math.floor(Math.random() * shapes.length)]); // 第25个随机
        // 洗牌
        for (let i = shapePool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shapePool[i], shapePool[j]] = [shapePool[j], shapePool[i]];
        }
        
        const grid: string[][] = [];
        let poolIndex = 0;
        for (let row = 0; row < 5; row++) {
            const rowShapes: string[] = [];
            for (let col = 0; col < 5; col++) {
                rowShapes.push(shapePool[poolIndex++]);
            }
            grid.push(rowShapes);
        }
        
        // 生成蛇形路径坐标（5x5网格）
        const pathCoords: { row: number; col: number }[] = [];
        let currentRow = 0;
        let currentCol = 0;
        let direction = 1; // 1 = 向右, -1 = 向左
        
        pathCoords.push({ row: currentRow, col: currentCol });
        
        while (currentRow < 4 || currentCol !== 4) {
            if (direction === 1 && currentCol < 4) {
                currentCol++;
            } else if (direction === -1 && currentCol > 0) {
                currentCol--;
            } else {
                currentRow++;
                direction *= -1;
            }
            if (currentRow < 5) {
                pathCoords.push({ row: currentRow, col: currentCol });
            }
            if (currentRow >= 4 && currentCol === 4) break;
        }
        
        // 检查两个坐标是否相邻（在路径上连续）
        const getPathIndex = (row: number, col: number) => {
            return pathCoords.findIndex(p => p.row === row && p.col === col);
        };
        
        // 生成形状 SVG（所有形状都是实线）
        const renderShape = (shape: string, isStart: boolean, isEnd: boolean) => {
            const strokeWidth = 2.5;
            const stroke = '#1f2937';
            const fill = 'none';
            
            if (isStart) {
                return `
                    <svg width="90" height="90" viewBox="0 0 100 100">
                        <polygon points="50,8 61,38 95,38 68,58 79,88 50,68 21,88 32,58 5,38 39,38" 
                            fill="${themeColors.secondary}" stroke="${themeColors.primary}" stroke-width="2"/>
                        <text x="50" y="56" text-anchor="middle" font-size="13" font-weight="bold" fill="${themeColors.accent}">START</text>
                    </svg>
                `;
            }
            
            if (isEnd) {
                return `
                    <svg width="90" height="90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="${themeColors.secondary}" stroke="${themeColors.primary}" stroke-width="2"/>
                        <text x="50" y="56" text-anchor="middle" font-size="13" font-weight="bold" fill="${themeColors.accent}">FINISH</text>
                    </svg>
                `;
            }
            
            switch (shape) {
                case 'circle':
                    return `
                        <svg width="90" height="90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="38" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
                        </svg>
                    `;
                case 'square':
                    return `
                        <svg width="90" height="90" viewBox="0 0 100 100">
                            <rect x="12" y="12" width="76" height="76" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
                        </svg>
                    `;
                case 'triangle':
                    return `
                        <svg width="90" height="90" viewBox="0 0 100 100">
                            <polygon points="50,12 88,85 12,85" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
                        </svg>
                    `;
                default:
                    return '';
            }
        };
        
        // 生成路径连接线（虚线）
        const generatePathLines = () => {
            const cellSize = 120; // 单元格大小
            const lines: string[] = [];
            
            for (let i = 0; i < pathCoords.length - 1; i++) {
                const current = pathCoords[i];
                const next = pathCoords[i + 1];
                
                // 计算起点和终点位置（相对于网格容器）
                const x1 = current.col * cellSize + cellSize / 2;
                const y1 = current.row * cellSize + cellSize / 2;
                const x2 = next.col * cellSize + cellSize / 2;
                const y2 = next.row * cellSize + cellSize / 2;
                
                // 水平连接
                if (current.row === next.row) {
                    const startX = Math.min(x1, x2) + 45;
                    const endX = Math.max(x1, x2) - 45;
                    lines.push(`<line x1="${startX}" y1="${y1}" x2="${endX}" y2="${y2}" stroke="#1f2937" stroke-width="2" stroke-dasharray="4,4"/>`);
                }
                // 垂直连接
                else if (current.col === next.col) {
                    const startY = Math.min(y1, y2) + 45;
                    const endY = Math.max(y1, y2) - 45;
                    lines.push(`<line x1="${x1}" y1="${startY}" x2="${x2}" y2="${endY}" stroke="#1f2937" stroke-width="2" stroke-dasharray="4,4"/>`);
                }
            }
            
            return `<svg class="path-lines" width="${5 * cellSize}" height="${5 * cellSize}" style="position: absolute; top: 0; left: 0; pointer-events: none;">${lines.join('')}</svg>`;
        };
        
        // 生成网格 HTML
        const gridHtml = grid.map((rowShapes, rowIdx) => {
            const cellsHtml = rowShapes.map((shape, colIdx) => {
                const isStart = rowIdx === 0 && colIdx === 0;
                const isEnd = rowIdx === 4 && colIdx === 4;
                const shapeHtml = renderShape(shape, isStart, isEnd);
                return `<div class="grid-cell">${shapeHtml}</div>`;
            }).join('');
            return `<div class="grid-row">${cellsHtml}</div>`;
        }).join('');
        
        const pathLinesHtml = generatePathLines();
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 24px 18px 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .title-row {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            flex-shrink: 0;
            margin-bottom: 16px;
        }
        .title-row .main {
            font-size: 38px;
            font-weight: 900;
            color: #0f172a;
        }
        .title-icon {
            width: 68px;
            height: 68px;
            object-fit: contain;
        }
        .grid-wrapper {
            flex: 1;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .grid-container {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 0;
        }
        .grid-row {
            display: flex;
            justify-content: center;
            gap: 0;
        }
        .grid-cell {
            width: 120px;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .path-lines {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
        }
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <span class="main">Shape Path</span>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="grid-wrapper">
                <div class="grid-container">
                    ${gridHtml}
                    ${pathLinesHtml}
                </div>
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;
        
        const filename = `shape-path-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        
        return `/generated/worksheets/${filename}`;
    }

    /**
     * Trace and Draw - 上方描红形状，下方自由绘画
     */
    async generateTraceAndDraw(data: any): Promise<string> {
        await this.initialize();
        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);

        // 描红形状 - 房子和树
        const tracingShapes = `
            <div class="shape-item house">
                <svg width="280" height="260" viewBox="0 0 280 260">
                    <!-- 房子屋顶 -->
                    <polygon points="140,10 260,100 20,100" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-dasharray="5,4"/>
                    <!-- 房子主体 -->
                    <rect x="40" y="100" width="200" height="150" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-dasharray="5,4"/>
                    <!-- 门 -->
                    <rect x="110" y="170" width="60" height="80" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-dasharray="5,4"/>
                    <!-- 窗户 -->
                    <rect x="60" y="130" width="50" height="50" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-dasharray="5,4"/>
                </svg>
            </div>
            <div class="shape-item tree">
                <svg width="180" height="260" viewBox="0 0 180 260">
                    <!-- 树冠（圆形） -->
                    <circle cx="90" cy="80" r="70" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-dasharray="5,4"/>
                    <!-- 树干 -->
                    <rect x="65" y="145" width="50" height="105" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-dasharray="5,4"/>
                </svg>
            </div>
        `;

        const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .divider {
            position: absolute;
            top: 60px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 67px;
            width: calc(100% - 80px);
            height: calc(100% - 107px);
            padding: 24px 18px 16px;
            display: flex;
            flex-direction: column;
        }
        .title-row {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
        }
        .title-row .main { font-size: 38px; font-weight: 900; color: #0f172a; }
        .title-icon { width: 68px; height: 68px; object-fit: contain; }
        .content-area {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        .trace-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .trace-label {
            font-size: 16px;
            font-weight: 600;
            color: #475569;
            text-align: center;
            margin-bottom: 12px;
        }
        .shapes-grid {
            display: flex;
            justify-content: center;
            align-items: flex-end;
            gap: 40px;
        }
        .shape-item {
            display: flex;
            align-items: flex-end;
            justify-content: center;
        }
        .draw-section {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        .draw-label {
            font-size: 16px;
            font-weight: 600;
            color: #475569;
            margin-bottom: 12px;
        }
        .draw-box {
            flex: 1;
            border: 2.5px solid ${themeColors.primary};
            border-radius: 16px;
            background: #fff;
            min-height: 420px;
            position: relative;
        }
        .draw-hint {
            position: absolute;
            top: 16px;
            left: 20px;
            font-size: 14px;
            color: #9ca3af;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <span class="main">Trace and Draw</span>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="content-area">
                <div class="trace-section">
                    <div class="trace-label">Trace the shapes:</div>
                    <div class="shapes-grid">
                        ${tracingShapes}
                    </div>
                </div>
                <div class="draw-section">
                    <div class="draw-label">Draw your own picture:</div>
                    <div class="draw-box">
                        <span class="draw-hint">Draw here...</span>
                    </div>
                </div>
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>`;

        const filename = `trace-and-draw-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    async generateWorksheet(type: string, data: any): Promise<string> {
        console.log(`?? Generating worksheet: ${type}`, data);

        await this.initialize();

        switch (type) {
            case 'uppercase-tracing':
                return await this.generateUppercaseTracing(data);
            case 'lowercase-tracing':
                return await this.generateLowercaseTracing(data);
            case 'write-my-name':
                return await this.generateWriteMyName(data);
            case 'letter-recognition':
                return await this.generateLetterRecognitionPage(data);
            case 'alphabet-sequencing':
                return await this.generateAlphabetSequencing(data);
            case 'beginning-sounds':
                return await this.generateBeginningSounds(data);
            case 'cvc-words':
                return await this.generateCVCWordsPage(data);
            case 'match-upper-lower':
                return await this.generateMatchUpperLower(data);
            case 'number-tracing':
                return await this.generateNumberTracingPage(data);
            case 'counting-objects':
                return await this.generateCountAndWrite(data);
            case 'number-path':
                return await this.generateConnectDots(data);
            case 'which-is-more':
                return await this.generateWhichIsMore(data);
            case 'number-bonds':
                return await this.generateNumberBonds(data);
            case 'maze':
                return await this.generateMazePage(data);
            case 'shadow-matching':
                return await this.generateShadowMatching(data);
            case 'sorting':
                return await this.generateSortingPage(data);
            case 'pattern-compare':
                return await this.generatePatternComparePage(data);
            case 'pattern-sequencing':
                return await this.generatePatternSequencing(data);
            case 'logic-blank':
                return await this.generateLogicBlank(data);
            // Fine Motor Skills
            case 'trace-lines':
                return await this.generateTraceLines(data);
            case 'shape-tracing':
                return await this.generateShapeTracing(data);
            // Creativity
            case 'coloring-page':
                return await this.generateColoringPage(data);
            case 'creative-prompt':
                return await this.generateCreativePrompt(data);
            case 'shape-path':
                return await this.generateShapePath(data);
            case 'trace-and-draw':
                return await this.generateTraceAndDraw(data);
            // Math - new
            case 'ten-frame':
                return await this.generateTenFrame(data);
            case 'picture-addition':
                return await this.generatePictureAddition(data);
            case 'count-shapes':
                return await this.generateCountShapes(data);
            default:
                throw new Error(`Unknown worksheet type: ${type}`);
        }
    }

    /**
     * 生成线条描红页面
     * 每行：左侧主题图�?+ 中间描线 + 右侧主题图案
     * 4�?种线条：直线、波浪线、锯齿线、曲�?
     */
    async generateTraceLines(data: any): Promise<string> {
        await this.initialize();
        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);

        // 获取主题彩色素材�?个：4个左�?+ 4个右侧）
        const colorAssets = getThemeColorAssets(themeKey, 8);
        const shuffledAssets = [...colorAssets].sort(() => Math.random() - 0.5);

        // 4种线条类型的 SVG 路径
        const lineTypes = [
            { path: 'M 0 40 L 300 40', name: 'straight' },  // 直线
            { path: 'M 0 40 Q 75 0 150 40 Q 225 80 300 40', name: 'wavy' },  // 波浪�?
            { path: 'M 0 70 L 50 10 L 100 70 L 150 10 L 200 70 L 250 10 L 300 70', name: 'zigzag' },  // 锯齿�?
            { path: 'M 0 70 Q 100 70 150 30 Q 200 0 300 10', name: 'curved' }  // 曲线
        ];

        // 生成4�?HTML
        const rowsHtml = lineTypes.map((line, idx) => {
            const leftImg = shuffledAssets[idx] || shuffledAssets[0];
            const rightImg = shuffledAssets[idx + 4] || shuffledAssets[1];
            
            return `
                <div class="trace-row">
                    <img class="trace-icon left" src="http://localhost:3000${leftImg}" />
                    <svg class="trace-line" viewBox="0 0 300 80" preserveAspectRatio="xMidYMid meet">
                        <path d="${line.path}" stroke="#1a1a1a" stroke-width="16" fill="none" stroke-linecap="round"/>
                        <path d="${line.path}" stroke="#ffffff" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="0 16"/>
                    </svg>
                    <img class="trace-icon right" src="http://localhost:3000${rightImg}" />
                </div>
            `;
        }).join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .trace-container {
            display: flex;
            flex-direction: column;
            gap: 24px;
            flex: 1;
            justify-content: space-around;
            padding: 16px 0;
        }
        .trace-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 12px 20px;
        }
        .trace-icon {
            width: 120px;
            height: 120px;
            object-fit: contain;
            flex-shrink: 0;
        }
        .trace-line {
            flex: 1;
            height: 80px;
            max-width: 360px;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <div class="main">Trace Lines</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="trace-container">
                ${rowsHtml}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>`;

        const filename = `trace-lines-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    /**
     * 生成形状描红页面
     * 2x2网格：圆形、正方形、三角形、星�?
     * 每个区域：大形状 + 下方小形状供描画
     * 底部：自由绘画区�?
     */
    async generateShapeTracing(data: any): Promise<string> {
        await this.initialize();
        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);

        // 获取4个主题装饰图案（四角�?
        const colorAssets = getThemeColorAssets(themeKey, 4);

        // 4种形状配置：大形状SVG + 小形状SVG + 固定3个小形状
        const shapes = [
            { 
                name: 'Circle',
                bigSvg: '<circle cx="70" cy="70" r="55" stroke="#1a1a1a" stroke-width="5" fill="none"/>',
                smallSvg: '<circle cx="30" cy="30" r="25" fill="#c0c0c0" stroke="#999" stroke-width="1.5"/>',
                smallCount: 3,
                smallViewBox: '0 0 60 60'
            },
            { 
                name: 'Square',
                bigSvg: '<rect x="15" y="15" width="110" height="110" stroke="#1a1a1a" stroke-width="5" fill="none"/>',
                smallSvg: '<rect x="5" y="5" width="50" height="50" fill="#c0c0c0" stroke="#999" stroke-width="1.5"/>',
                smallCount: 3,
                smallViewBox: '0 0 60 60'
            },
            { 
                name: 'Triangle',
                bigSvg: '<polygon points="70,15 125,125 15,125" stroke="#1a1a1a" stroke-width="5" fill="none"/>',
                smallSvg: '<polygon points="30,5 55,50 5,50" fill="#c0c0c0" stroke="#999" stroke-width="1.5"/>',
                smallCount: 3,
                smallViewBox: '0 0 60 55'
            },
            { 
                name: 'Star',
                bigSvg: '<polygon points="70,5 82,45 125,45 90,70 102,115 70,90 38,115 50,70 15,45 58,45" stroke="#1a1a1a" stroke-width="5" fill="none"/>',
                smallSvg: '<polygon points="30,2 36,20 55,20 40,32 46,52 30,40 14,52 20,32 5,20 24,20" fill="#c0c0c0" stroke="#999" stroke-width="1.5"/>',
                smallCount: 3,
                smallViewBox: '0 0 60 55'
            }
        ];

        const shapesHtml = shapes.map((s, idx) => {
            const smallShapesHtml = Array(s.smallCount).fill(0).map(() => 
                `<svg class="small-shape" viewBox="${s.smallViewBox}">${s.smallSvg}</svg>`
            ).join('');
            
            return `
                <div class="shape-cell">
                    <svg class="big-shape" viewBox="0 0 140 140">${s.bigSvg}</svg>
                    <div class="small-shapes">${smallShapesHtml}</div>
                </div>
            `;
        }).join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .shape-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            flex: 1;
            padding: 10px 20px;
        }
        .shape-cell {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px 16px 16px;
            background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
            border: 2px solid ${themeColors.light};
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
            transition: transform 0.2s;
        }
        .big-shape {
            width: 140px;
            height: 140px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }
        .small-shapes {
            display: flex;
            gap: 12px;
            margin-top: 14px;
            padding: 10px 16px;
            background: rgba(${themeColors.primary === '#4CAF50' ? '76,175,80' : themeColors.primary === '#2196F3' ? '33,150,243' : themeColors.primary === '#9C27B0' ? '156,39,176' : themeColors.primary === '#FF9800' ? '255,152,0' : '100,100,100'}, 0.08);
            border-radius: 12px;
        }
        .small-shape {
            width: 52px;
            height: 52px;
            opacity: 1;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.15));
        }
        .draw-area {
            margin-top: 16px;
            margin-left: 10px;
            margin-right: 10px;
            padding: 16px 30px;
            border: none;
            border-radius: 16px;
            text-align: center;
            background: linear-gradient(180deg, #fefefe 0%, #f5f7fa 100%);
            width: calc(100% - 20px);
        }
        .draw-area-title {
            font-size: 20px;
            font-weight: 700;
            color: ${themeColors.accent};
            margin-bottom: 12px;
            letter-spacing: 0.5px;
        }
        .draw-box {
            height: 95px;
            background: #ffffff;
            border-radius: 12px;
            border: 1.5px solid #e8e8e8;
        }
        .corner-icon {
            position: absolute;
            width: 70px;
            height: 70px;
            object-fit: contain;
        }
        .corner-bl { bottom: 50px; left: 50px; }
        .corner-br { bottom: 50px; right: 50px; }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <div class="main">Shape Tracing</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="shape-grid">
                ${shapesHtml}
            </div>
            <div class="draw-area">
                <div class="draw-area-title">Draw your favorite shape!</div>
                <div class="draw-box"></div>
            </div>
        </div>
        ${colorAssets[2] ? `<img class="corner-icon corner-bl" src="http://localhost:3000${colorAssets[2]}" />` : ''}
        ${colorAssets[3] ? `<img class="corner-icon corner-br" src="http://localhost:3000${colorAssets[3]}" />` : ''}
        ${stickerHtml}
    </div>
</body>
</html>`;

        const filename = `shape-tracing-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    /**
     * 生成涂色页面
     */
    async generateColoringPage(data: any): Promise<string> {
        await this.initialize();
        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);

        // 随机获取主题线稿图片（从 line/main 文件夹）
        const mainAssets = getThemeMainLineAssets(themeKey, 1);
        const lineArtPath = mainAssets[0] || '';

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .coloring-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
        }
        .coloring-image {
            max-width: 100%;
            max-height: 850px;
            width: auto;
            height: auto;
            min-width: 500px;
            object-fit: contain;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <div class="main">Coloring Page</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="coloring-container">
                <img class="coloring-image" src="http://localhost:3000${lineArtPath}" alt="Coloring" />
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>`;

        const filename = `coloring-page-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    /**
     * 生成创意画页�?
     */
    async generateCreativePrompt(data: any): Promise<string> {
        await this.initialize();
        const content = data?.content || data || {};
        const { theme = 'dinosaur', promptType = 'blank_sign' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);

        // 获取 Creative Prompt 图片
        const promptImage = getCreativePromptImage(themeKey, promptType);

        const titles: Record<string, string> = {
            'blank_sign': 'Creative Drawing',
            'halfbody': 'Complete the Drawing'
        };

        const title = titles[promptType] || 'Creative Drawing';

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .drawing-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
        }
        .prompt-image {
            max-width: 100%;
            max-height: 850px;
            width: auto;
            height: auto;
            object-fit: contain;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="title-row">
                ${iconPosition === 'left' ? titleIconHtml : ''}
                <div class="main">${title}</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="drawing-container">
                ${promptImage ? `<img class="prompt-image" src="http://localhost:3000${promptImage}" alt="Creative Prompt" />` : ''}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>`;

        const filename = `creative-prompt-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }
}

export const imageGenerator = new ImageGenerator();





