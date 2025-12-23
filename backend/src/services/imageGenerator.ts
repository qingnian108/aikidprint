import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { getLetterImage, getRandomAnimalImages, getRandomDecorImages, getThemeBorders, getThemeCharacter, getThemeColorAssets, getThemeMainLineAssets, getThemeMainColorAssets, isImageFile, getRandomTitleIcon, getThemeColor, getRandomLineArt, getCreativePromptImage, getThemeBackground, removeWhiteBackground } from '../utils/imageHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../../public/generated/worksheets');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export class ImageGenerator {
    private browser: any = null;
    private pageCount: number = 0;
    private readonly MAX_PAGES_BEFORE_RESTART = 15; // 每生成15页重启浏览器

    async initialize() {
        // 检查浏览器是否还活着
        let needRestart = false;
        
        if (!this.browser) {
            needRestart = true;
        } else {
            try {
                // 尝试获取浏览器版本来检测连接
                await this.browser.version();
            } catch {
                console.log('[ImageGenerator] Browser connection lost, restarting...');
                needRestart = true;
            }
        }
        
        // 每生成一定数量页面后重启浏览器，防止内存泄漏
        if (this.pageCount >= this.MAX_PAGES_BEFORE_RESTART) {
            console.log(`[ImageGenerator] Restarting browser after ${this.pageCount} pages`);
            needRestart = true;
        }
        
        if (needRestart) {
            await this.closeBrowser();
            this.browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--no-first-run',
                    '--no-zygote'
                ]
            });
            this.pageCount = 0;
        }
        
        this.pageCount++;
    }

    /**
     * 安全关闭浏览器
     */
    async closeBrowser() {
        if (this.browser) {
            try {
                await this.browser.close();
            } catch (e) {
                // 忽略关闭错误
            }
            this.browser = null;
            this.pageCount = 0;
        }
    }

    /**
     * ����ͨ�õ�ҳ��������?
     * top-bar: top: 2px (Name/Date �����ƶ� 2px)
     * divider: top: 62px (�ָ���λ��)
     * safe-area: top: 69px (��������)
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
            width: 816px;
            height: 1056px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 816px;
            height: 1056px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 16px;
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
            top: 62px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 69px;
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
            width: 42px;
            height: 42px;
            object-fit: contain;
            opacity: 1;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
            z-index: 2;
        }
        .border-sticker.bottom-sticker {
            width: 38px;
            height: 38px;
        }
        .border-sticker.corner-sticker {
            width: 55px;
            height: 55px;
            z-index: 5;
        }
        `;
    }

    /**
     * ���ɴ�ͼ��ı���?HTML
     * ͼ����������ڱ��������Ҳ�?
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
     * ���ɱ���ͼ HTML �� CSS�������ֽ��?
     */
    private getBackgroundHtml(themeKey: string): { html: string; css: string } {
        const html = ''; // ����Ҫ�����?HTML��ʹ�� CSS αԪ��
        const css = this.getBackgroundCss(themeKey);
        return { html, css };
    }

    /**
     * ������ֽ HTML - �Ѹ�Ϊ���ر���ͼ��ʽ
     * ʹ������ style ��ǩע�뱳��ͼ CSS
     */
    private getStickersHtml(themeKey: string): string {
        const backgroundImage = getThemeBackground(themeKey);
        if (!backgroundImage) return '';
        
        return `<style>
        .page::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('http://localhost:3000${backgroundImage}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0.3;
            z-index: 0;
            pointer-events: none;
        }
        .top-bar { z-index: 1; }
        .divider { z-index: 1; }
        .safe-area { z-index: 1; }
        </style>`;
    }

    /**
     * ��ȡ����ͼ CSS��ʹ�� CSS ������αԪ��ʵ�֣�
     * @param themeKey ��������
     * @returns CSS �ַ�������������ͼ��ʽ
     */
    private getBackgroundCss(themeKey: string): string {
        const backgroundImage = getThemeBackground(themeKey);
        if (!backgroundImage) return '';
        
        return `
        .page::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('http://localhost:3000${backgroundImage}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0.3;
            z-index: 0;
            pointer-events: none;
        }
        .top-bar { z-index: 1; }
        .divider { z-index: 1; }
        .safe-area { z-index: 1; }
        `;
    }

    /**
     * �����ܼ���ֽ HTML - �ѷ��������ر���ͼ��ʹ�� getBackgroundHtml ���?
     * @deprecated ʹ�� getBackgroundHtml ���?
     */
    private getDenseStickersHtml(themeKey: string): { html: string; css: string } {
        return this.getBackgroundHtml(themeKey);
    }

    async generateMazePage(data: any): Promise<string> {
        await this.initialize();

        const { content = {}, theme = 'dinosaur', mazeImageUrl = '', difficulty = 'medium' } = data || {};
        const themeKey = String(content.theme || theme || 'dinosaur').toLowerCase();
        const mazeUrl = content.mazeImageUrl || mazeImageUrl || '';
        const level = String(content.difficulty || difficulty || 'medium');

        // ��ȡ����ͼ�������ֽ��?
        const { html: backgroundHtml, css: backgroundCss } = this.getBackgroundHtml(themeKey);

        // �����ȡ����ͼ���������ɫ
        const titleIcon = getRandomTitleIcon(themeKey);
        const themeColors = getThemeColor(themeKey);
        
        // �������ͼ��λ�ã������??
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        // �Թ����?����ͼ�꣨��������ѡ��??
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

        // ĳЩ��������Ͻ�ͼ����Ҫ��ת���Գƣ���ĳЩ����??
        const flipLeftIcon = themeKey !== 'space'; // ̫�����ⲻ��??

        // �����Ѷȵ���ͼ��λ�ã��Թ���С��ͬ����ڳ���λ��Ҳ��ͬ��?
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
            width: 816px;
            height: 1056px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 816px;
            height: 1056px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 16px;
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
            top: 62px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 69px;
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
            background: transparent;
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
        ${backgroundCss}
    </style>
</head>
<body>
    <div class="page">
        ${backgroundHtml}
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
                    ${mazeUrl ? `<img src="${mazeUrl.startsWith('data:') ? mazeUrl : 'http://localhost:3000' + mazeUrl}" alt="maze">` : '<div style="color:#94a3b8;font-size:16px;">Maze will appear here</div>'}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        const filename = `maze-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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
        
        // ��ȡ������ɫ
        const theme = pages[0]?.theme || 'dinosaur';
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);

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
            width: 816px;
            min-height: 1056px;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
        }
        .page {
            width: 816px;
            height: 1056px;
            padding: 32px 32px 46px;
            page-break-after: always;
        }
        .title {
            text-align: center;
            font-size: 32px;
            font-weight: 900;
            color: ${themeColors.primary};
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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
        
        // �������ͼ��λ�ã�����ң�
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        const { image: mainImage, word } = getLetterImage(upperLetter);
        const characterImage = getThemeCharacter(themeKey);
        
        // ��ȡ���ⱳ��ͼ��30% ���ȣ�
        const backgroundImage = getThemeBackground(themeKey);
        const backgroundHtml = backgroundImage 
            ? `<div class="theme-background" style="background-image: url('http://localhost:3000${backgroundImage}');"></div>` 
            : '';

        // ʹ�� uploads/letters/uppercase �е����?PNG
        const tracingRel = `/uploads/letters/uppercase/${upperLetter}_uppercase_tracing.png`;
        const tracingFull = path.join(__dirname, '../../public', tracingRel);
        const tracingImage = fs.existsSync(tracingFull) ? tracingRel : '';

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
            width: 816px;
            height: 1056px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 816px;
            height: 1056px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 16px;
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
            top: 62px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 69px;
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
        .theme-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            opacity: 0.3;
            z-index: 0;
            pointer-events: none;
        }
        .top-bar {
            z-index: 1;
        }
        .divider {
            z-index: 1;
        }
        .safe-area {
            z-index: 1;
        }
    </style>
</head>
<body>
    <div class="page">
        ${backgroundHtml}
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
    </div>
</body>
</html>
        `;

        const filename = `uppercase-${upperLetter}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� Alphabet Sequencing ҳ��
     * ��дȱʧ����ĸ�����ĸ����?
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
        
        // ������ HTML
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
            top: 69px;
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
            color: ${themeColors.primary};
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
            border-bottom: 2px solid ${themeColors.primary};
        }
        .mid-line {
            border-bottom-style: dashed;
            border-color: ${themeColors.secondary};
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
            color: ${themeColors.accent};
            font-family: 'Arial Black', 'Quicksand', sans-serif;
        }
        .cell.blank-box .box-inner {
            width: 80px;
            height: 80px;
            border: 3px solid ${themeColors.primary};
            border-radius: 10px;
            background: transparent;
        }
        .divider {
            position: absolute;
            top: 62px;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        
        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� Beginning Sounds ҳ��
     * ƥ��ͼƬ������ĸ - �����ĸ��Ƭ���Ҳ�ͼƬ��Ƭ���м�����?
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
        
        // �̶�5����ĸ�Ĳ��ֲ���
        const cardSize = 110;
        const cardGap = 27;
        const fontSize = 72;
        const imageSize = 90;
        const columnGap = 220;
        
        // ��Ƭ������ɫ
        const cardColors = [
            '#E3F2FD', // ǳ��
            '#F3E5F5', // ǳ��
            '#FFF3E0', // ǳ��
            '#E8F5E9', // ǳ��
            '#FFF8E1', // ǳ��
            '#FCE4EC', // ǳ��
            '#E0F7FA', // ǳ��
            '#FBE9E7', // ǳɺ��
        ];
        
        // ��ĸ��Ӧ����ɫ��������ĸ������
        const letterColors = [
            '#F48FB1', // �ۺ�
            '#CE93D8', // ��ɫ
            '#80CBC4', // ����
            '#A5D6A7', // ��ɫ
            '#FFE082', // ��ɫ
            '#FFAB91', // ��ɫ
            '#90CAF9', // ��ɫ
            '#B39DDB', // ����
        ];
        
        // ���������ĸ���?HTML
        const leftCardsHtml = items.map((item: any, index: number) => `
            <div class="card letter-card" style="background: ${cardColors[index % cardColors.length]}; width: ${cardSize}px; height: ${cardSize}px;">
                <span class="letter" style="color: ${letterColors[index % letterColors.length]}; font-size: ${fontSize}px;">${item.letter}</span>
            </div>
        `).join('');
        
        // �����Ҳ�ͼƬ��Ƭ HTML��ʹ�ô��Һ��˳��?
        const rightCardsHtml = shuffledItems.map((item: any, index: number) => `
            <div class="card image-card" style="background: ${cardColors[(index + 3) % cardColors.length]}; width: ${cardSize}px; height: ${cardSize}px;">
                <img class="card-image" src="http://localhost:3000${item.image}" alt="${item.word}" style="width: ${imageSize}px; height: ${imageSize}px;" />
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
            top: 69px;
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
            color: ${themeColors.primary};
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
            gap: ${columnGap}px;
        }
        .left-column {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: ${cardGap}px;
        }
        .right-column {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: ${cardGap}px;
        }
        .card {
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border: 3px solid rgba(255,255,255,0.8);
        }
        .letter-card .letter {
            font-weight: 900;
            font-family: 'Quicksand', sans-serif;
            text-shadow: 2px 2px 0 rgba(255,255,255,0.8);
        }
        .image-card {
            padding: 6px;
        }
        .card-image {
            object-fit: contain;
        }
        .divider {
            position: absolute;
            top: 62px;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        
        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� CVC Words ҳ��
     * �򵥵� CVC ������ϰ - ���չ淶���м䰲ȫ������
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
        
        // 所有可用的 CVC 单词（bigpng 文件夹中有图片的）
        const availableCvcWords = [
            'bag', 'bat', 'bed', 'bin', 'box', 'bug', 'bun',
            'cat', 'cup', 'dig', 'dog', 'fan', 'fin', 'fox',
            'hat', 'hen', 'hot', 'jet', 'lip', 'log', 'map',
            'mop', 'mug', 'net', 'nut', 'pan', 'pen', 'pig',
            'run', 'sun', 'ten', 'top', 'web', 'wig', 'zip'
        ];
        
        // 获取单词对应的图片路径（小写文件名）
        const getWordImage = (word: string) => {
            return `/uploads/bigpng/${word.toLowerCase()}.png`;
        };
        
        // 如果传入了 wordsWithImages，使用它；否则随机选择
        const wordsWithImages = content.wordsWithImages || [];
        let displayWords: string[];
        
        if (wordsWithImages.length > 0) {
            displayWords = wordsWithImages.map((w: any) => w.word);
        } else {
            // 随机选择 6 个单词
            const shuffled = [...availableCvcWords].sort(() => Math.random() - 0.5);
            displayWords = shuffled.slice(0, 6);
        }
        
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
            top: 69px;
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
            color: ${themeColors.primary};
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
            top: 62px;
            left: 0;
            width: 100%;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        
        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� Match Uppercase & Lowercase ҳ��
     * ��Сд��ĸ���?- ��ߴ�д˳���ұ�Сд����?
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
        
        // Ĭ����ĸ��
        const defaultUppercase = ['A', 'B', 'C', 'D', 'E', 'F'];
        const displayUppercase = uppercase.length > 0 ? uppercase : defaultUppercase;
        
        // ����Сд��ĸ˳��
        const defaultLowercase = displayUppercase.map((l: string) => l.toLowerCase());
        const displayLowercase = lowercase.length > 0 ? lowercase : 
            [...defaultLowercase].sort(() => Math.random() - 0.5);
        
        // ������ĸ������̬�������ʹ�С
        const letterCount = displayUppercase.length;
        let boxSize: number;
        let fontSize: number;
        let rowGap: number;
        let columnGap: number;
        
        if (letterCount <= 4) {
            // 4����ĸ���󷽿򣬴���
            boxSize = 100;
            fontSize = 56;
            rowGap = 40;
            columnGap = 300;
        } else if (letterCount <= 6) {
            // 6����ĸ���е�
            boxSize = 85;
            fontSize = 48;
            rowGap = 28;
            columnGap = 280;
        } else {
            // 8����ĸ������
            boxSize = 70;
            fontSize = 40;
            rowGap = 16;
            columnGap = 260;
        }
        
        // ��������д��ĸ HTML��������
        const leftLettersHtml = displayUppercase.map((letter: string) => `
            <div class="letter-box" style="width: ${boxSize}px; height: ${boxSize}px; border-color: ${themeColors.primary};">
                <span class="letter" style="font-size: ${fontSize}px;">${letter}</span>
            </div>
        `).join('');
        
        // �����Ҳ�Сд��ĸ HTML��������
        const rightLettersHtml = displayLowercase.map((letter: string) => `
            <div class="letter-box" style="width: ${boxSize}px; height: ${boxSize}px; border-color: ${themeColors.secondary};">
                <span class="letter" style="font-size: ${fontSize}px;">${letter}</span>
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
            top: 69px;
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
            color: ${themeColors.primary};
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
        .columns-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: ${columnGap}px;
        }
        .left-column, .right-column {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: ${rowGap}px;
        }
        .letter-box {
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid;
            border-radius: 12px;
            background: #fff;
        }
        .letter {
            font-weight: 900;
            font-family: 'Arial Black', sans-serif;
            color: #1f2937;
            line-height: 1;
        }
        .divider {
            position: absolute;
            top: 62px;
            left: 0;
            width: 100%;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        
        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� Which is More? ҳ��
     * �Ƚ������������� - 3�У�ÿ����������ͼƬ��ÿ����ڷ�����?
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
        
        // �����Ѷ�����������Χ
        const difficultyConfig: Record<string, number> = {
            easy: 5,
            medium: 7,
            hard: 10
        };
        const maxCount = difficultyConfig[difficulty] || 5;
        const minCount = 1;
        
        // �������ļ��л�ȡͼƬ
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
        
        // ���ѡ��?����ͬ��ͼƬ����3��
        const shuffled = [...themeImages].sort(() => Math.random() - 0.5);
        const selectedImages = shuffled.slice(0, 3);
        while (selectedImages.length < 3) {
            selectedImages.push(themeImages[selectedImages.length % themeImages.length]);
        }
        
        // ����3�бȽ�����
        const rows = [];
        for (let i = 0; i < 3; i++) {
            const leftCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
            let rightCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
            // ȷ������������ͬ
            while (rightCount === leftCount) {
                rightCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
            }
            rows.push({
                image: selectedImages[i],
                leftCount,
                rightCount
            });
        }
        
        // ������ HTML - ÿ��ͼƬ���ڷ����ͼƬ���г�����
        const rowsHtml = rows.map((row, idx) => {
            // ������������ÿ����ʾ����ͼƬ
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
            top: 69px;
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
            color: ${themeColors.primary};
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
            background: transparent;
        }
        .divider {
            position: absolute;
            top: 62px;
            left: 0;
            width: 100%;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        
        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� Number Bonds to 10 ҳ��
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
            top: 69px;
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
            color: ${themeColors.primary};
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
            top: 62px;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� Ten Frame Counting ҳ��
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
        
        // ����6��ʮ������?
        const problems = [];
        for (let i = 0; i < 6; i++) {
            const count = Math.floor(Math.random() * 10) + 1; // 1-10
            problems.push(count);
        }
        
        // ����ʮ���?HTML - 5��2�У�ÿ�������б߿�
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
            top: 69px;
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
        .title-row .main { font-size: 32px; font-weight: 900; color: ${themeColors.primary}; }
        .title-icon { width: 60px; height: 60px; object-fit: contain; }
        .content-box {
            flex: 1;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(3, auto);
            gap: 70px 50px;
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
            background: transparent;
        }
        .divider {
            position: absolute;
            top: 62px;
            left: 0;
            width: 100%;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� Picture Addition ҳ��
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
        
        // �������ļ��л�ȡͼƬ
        const mainAssetsDir = path.join(__dirname, '../../public/uploads/assets/A_main_assets', themeKey, 'color');
        let themeImages: string[] = [];
        try {
            const files = fs.readdirSync(mainAssetsDir);
            themeImages = files.filter(f => f.endsWith('.png')).map(f => `/uploads/assets/A_main_assets/${themeKey}/color/${f}`);
        } catch (e) {
            themeImages = ['/uploads/assets/A_main_assets/dinosaur/color/dinosaur_000_color.png'];
        }
        
        // ����6���ӷ��⣬ÿ�����?��
        const problems = [];
        for (let i = 0; i < 6; i++) {
            const a = Math.floor(Math.random() * 3) + 1; // 1-3
            const b = Math.floor(Math.random() * 3) + 1; // 1-3
            const image = themeImages[Math.floor(Math.random() * themeImages.length)];
            problems.push({ a, b, sum: a + b, image });
        }
        
        // ���ɾ��е�ͼƬ�飨ʹ��flexbox���У�
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
            top: 69px;
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
        .title-row .main { font-size: 32px; font-weight: 900; color: ${themeColors.primary}; }
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
            background: transparent;
        }
        .divider {
            position: absolute;
            top: 62px;
            left: 0;
            width: 100%;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� Count the Shapes ҳ��
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
        
        // ��״����
        const shapes = [
            { name: 'circle', svg: '<circle cx="20" cy="20" r="18" fill="COLOR" stroke="#333" stroke-width="2"/>', color: '#F87171' },
            { name: 'square', svg: '<rect x="2" y="2" width="36" height="36" fill="COLOR" stroke="#333" stroke-width="2"/>', color: '#60A5FA' },
            { name: 'triangle', svg: '<polygon points="20,2 38,38 2,38" fill="COLOR" stroke="#333" stroke-width="2"/>', color: '#FBBF24' },
            { name: 'rectangle', svg: '<rect x="2" y="8" width="36" height="24" fill="COLOR" stroke="#333" stroke-width="2"/>', color: '#34D399' },
            { name: 'heart', svg: '<path d="M20 35 C5 25 2 15 8 8 C14 2 20 8 20 12 C20 8 26 2 32 8 C38 15 35 25 20 35Z" fill="COLOR" stroke="#333" stroke-width="2"/>', color: '#F472B6' },
        ];
        
        // Ϊÿ����״�����������?(5-9)
        const shapeCounts: { shape: typeof shapes[0], count: number }[] = shapes.map(s => ({
            shape: s,
            count: Math.floor(Math.random() * 5) + 5
        }));
        
        // ���ɲ��ص�������ֲ����?
        const allShapes: { shape: typeof shapes[0], x: number, y: number, rotation: number }[] = [];
        const shapeSize = 45; // ��״��С
        const padding = 10; // ��״֮�����С���
        const boxWidth = 600;
        const boxHeight = 410;
        
        // �����λ���Ƿ���������״�ص�?
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
        
        // Ϊÿ����״�ҵ����ص���λ��
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
        // ����˳��
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
            top: 69px;
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
        .title-row .main { font-size: 32px; font-weight: 900; color: ${themeColors.primary}; }
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
            background: transparent;
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
            top: 62px;
            left: 0;
            width: 100%;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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
        // ʹ��ͨ��??themeColors.accent ��Ϊ������ɫ
        const rewardMap: Record<string, string> = {
            dinosaur: '/uploads/assets/B_character_ip/dinosaur/poses/color/dinosaur_happy_pose.png',
            vehicles: '/uploads/assets/B_character_ip/vehicles/poses/color/vehicles_car_happy_pose.png',
            unicorn: '/uploads/assets/B_character_ip/unicorn/poses/color/unicorn_happy_pose.png',
            space: '/uploads/assets/B_character_ip/space/poses/color/space_astronaut_happy_pose.png',
            ocean: '/uploads/assets/B_character_ip/ocean/poses/color/ocean_whale_happy_pose.png',
            safari: '/uploads/assets/B_character_ip/safari/poses/color/safari_lion_happy_pose.png'
        };
        const rewardDino = rewardMap[themeKey] || rewardMap['dinosaur'];

        // ʹ�ñ���ͼ������?
        const stickerHtml = this.getStickersHtml(themeKey);

        // ���ɻ����ĸ����?
        let gridCells: string[] = [];
        if (Array.isArray(cells) && cells.length > 0) {
            gridCells = cells.slice(0, gridSize * gridSize);
        } else {
            // �Զ����ɻ����ĸ����?
            const totalCells = gridSize * gridSize;
            // �����ѶȾ���Ŀ����ĸ������
            const targetCount = difficulty === 'hard' ? Math.floor(totalCells * 0.25) 
                              : difficulty === 'medium' ? Math.floor(totalCells * 0.35)
                              : Math.floor(totalCells * 0.4); // easy
            
            // ���ɸ�����ĸ���ų�Ŀ����ĸ��
            const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l => l !== upperLetter);
            
            // ���Ŀ�����?
            for (let i = 0; i < targetCount; i++) {
                gridCells.push(upperLetter);
            }
            
            // ��������ĸ
            for (let i = targetCount; i < totalCells; i++) {
                const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
                gridCells.push(randomLetter);
            }
            
            // ����˳��
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
            width: 816px;
            height: 1056px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page { position: relative; width: 816px; height: 1056px; overflow: hidden; }
        .top-bar {
            position: absolute;
            top: 16px;
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
            top: 62px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 69px;
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
            font-size: ${fontSize}px;     /* �Ѷȶ�̬�ֺţ�easy 70 / medium 60 / hard 50 */
            font-weight: 900;
            letter-spacing: 0.3px;
            color: ${themeColors.primary};              /* ����ɫ���?*/
            -webkit-text-stroke: 0;      /* ȡ�����?*/
            line-height: 1;
        }
        .reward-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-top: auto;
        }
        .reward-dino {
            width: 90px;
            height: 90px;
            object-fit: contain;
        }
        .reward-stars {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .reward-star {
            font-size: 36px;
            line-height: 1;
            color: #f5a623;
        }
    </style>
</head>
<body>
    <div class="page">
        ${stickerHtml}
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
    </div>
</body>
</html>
        `;

        const filename = `letter-recognition-${upperLetter}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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
        
        // �������ͼ��λ�ã������??
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        const { image: mainImage, word } = getLetterImage(lookupLetter);
        const characterImage = getThemeCharacter(themeKey);

        const tracingRel = `/uploads/letters/lowercase/${lowerLetter}_lowercase_tracing.png`;
        const tracingFull = path.join(__dirname, '../../public', tracingRel);
        const tracingImage = fs.existsSync(tracingFull) ? tracingRel : '';

        // ʹ�ñ���ͼ������?
        const stickerHtml = this.getStickersHtml(themeKey);

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
            width: 816px;
            height: 1056px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 816px;
            height: 1056px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 16px;
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
            top: 62px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 69px;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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
        // ʹ�ñ���ͼ������?
        const stickerHtml = this.getStickersHtml(themeKey);

        // �������֣�ת��д����??0����??
        const displayName = String(name).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10);
        const nameLength = displayName.length || 1;
        
        // ������ĸ��������ͼƬ�߶ȣ�ȷ����������ȫ�����ȣ�??80px����??
        // ��ȫ������Լ680px����ȥ��??8px * (n-1))������padding(20px)
        const availableWidth = 680 - 20 - (nameLength - 1) * 8;
        const letterHeight = Math.min(140, Math.floor(availableWidth / nameLength));

        // ���ɴ���ĸͼƬHTML���� uploads/letters/uppercase ȡͼƬ��
        const bigLettersHtml = displayName.split('').map(letter => {
            const letterImagePath = `/uploads/letters/uppercase/${letter}_uppercase_tracing.png`;
            return `<img class="big-letter-img" src="http://localhost:3000${letterImagePath}" alt="${letter}" />`;
        }).join('');

        // ��ȡ�����ɫͼ������?A_main_assets/{theme}/color/main/ ���ȡһ�ţ�?
        const colorAssets = getThemeMainColorAssets(themeKey, 1);
        const characterImage = colorAssets[0] || '';

        // �������ֳ��Ⱦ���ÿ����ʾ1����??����??
        // ������ֳ���?����ĸ��ÿ��ֻ��??����??
        const namesPerLine = nameLength > 5 ? 1 : 2;
        const tracingClass = namesPerLine === 1 ? 'tracing-text single' : 'tracing-text';
        const tracingContent = namesPerLine === 1 
            ? `<span>${displayName}</span>` 
            : `<span>${displayName}</span><span>${displayName}</span>`;

        // ������ĸ������̬����letter-spacing��ȷ����������ȫ??
        // ÿ�п��ÿ���??00px����������ʱ����ÿ����ĸ??5px??
        // letter-spacing = (���ÿ��� - ��ĸ??* ��ĸ����) / (��ĸ??- 1)
        const getLetterSpacing = (len: number, perLine: number): number => {
            if (len <= 1) return 0;
            const availableWidth = perLine === 1 ? 600 : 280; // ��������ʱ���ø����??
            const charWidth = 55; // ÿ����ĸ??5px
            const totalCharWidth = len * charWidth;
            const spacing = Math.floor((availableWidth - totalCharWidth) / (len - 1));
            return Math.max(2, Math.min(spacing, 25)); // ����??-25px֮��
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
        /* ��������ĸ��??- �Զ����Ų�������ȫ�� */
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
        /* �м��ɫͼƬ����?- ���� */
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
        /* ��ϰ���� - �ο���д��ĸ�����??*/
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
        ${stickerHtml}
        <div class="top-bar">
            <div class="field">Name: <span class="dash-line"></span></div>
            <div class="field">Date: <span class="dash-line short"></span></div>
        </div>
        <div class="divider"></div>
        <div class="safe-area">
            <div class="content-wrapper">
                <!-- ��������ĸͼƬ -->
                <div class="big-letters-section">
                    ${bigLettersHtml}
                </div>
                <!-- �м��ɫͼ�?-->
                <div class="character-section">
                    ${characterImage ? `<img class="character-image" src="http://localhost:3000${characterImage}" alt="character" />` : ''}
                </div>
                <!-- ��ϰ�� - �ο���д��ĸ������?-->
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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

        // ʹ��ͨ��??titleIcon ??themeColors
        const ranges: Record<string, number[]> = {
            '0-4': [0,1,2,3,4],
            '5-9': [5,6,7,8,9]
        };
        const nums = Array.isArray(numbers) && numbers.length ? numbers : (ranges[range] || ranges['0-4']);

        // ʹ�ñ���ͼ������?
        const stickerHtml = this.getStickersHtml(themeKey);

        // �������زĲ�ɫͼ��أ������
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
                            <span class="icon-emoji">??</span>
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

        // ��ҳ��Ⱦ
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
            width: 816px;
            min-height: 1056px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page { position: relative; width: 816px; height: 1056px; overflow: hidden; page-break-after: always; }
        .page-break { page-break-after: always; }
        .top-bar {
            position: absolute;
            top: 16px;
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
            top: 62px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 69px;
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
            gap: 10px;
            font-size: 32px;
            font-weight: 800;
            color: ${themeColors.accent};
            text-align: center;
            margin-bottom: 8px;
            border: none;
            border-radius: 0;
            padding: 0;
            background: transparent;
        }
        .nt-title img {
            width: 55px;
            height: 55px;
            object-fit: contain;
        }
        .rows {
            display: flex;
            flex-direction: column;
            justify-content: center;
            width: 100%;
            flex: 1;
            padding: 16px 0 8px;
            gap: 12px;
        }
        .row {
            display: grid;
            grid-template-columns: 110px 1fr 100px;
            align-items: stretch;
            min-height: 130px;
            padding: 0 12px;
            border-radius: 14px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }
        .left-box {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px 6px;
        }
        .left-num-img {
            width: 85px;
            height: 85px;
            object-fit: contain;
            filter: drop-shadow(0 1px 1px rgba(0,0,0,0.08));
        }
        .left-num-text {
            font-size: 80px;
            font-weight: 900;
            color: ${themeColors.accent};
            -webkit-text-stroke: 3px #0b0b0b;
            line-height: 1;
        }
        .middle-box {
            background: #ffffff;
            border: 2px solid #f5d77b;
            border-radius: 0;
            padding: 8px 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
        }
        .trace-inner {
            display: grid;
            grid-template-columns: repeat(4, minmax(45px, 1fr));
            gap: 10px;
            width: 100%;
            justify-items: center;
        }
        .trace-cell {
            font-size: 90px;
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
            padding: 4px;
            height: 100%;
            max-height: 100%;
            width: 90px;
            max-width: 90px;
            margin: 0 auto;
            box-sizing: border-box;
            overflow: hidden;
            border: none;
            border-radius: 8px;
        }
        .icon-group {
            display: grid;
            gap: 4px;
            justify-items: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }
        .icon-img {
            width: 28px;
            height: 28px;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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
        
        // �������ͼ��λ�ã������??
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        // ʹ�ñ���ͼ������?
        const stickerHtml = this.getStickersHtml(themeKey);

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
            width: 816px;
            height: 1056px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 816px;
            height: 1056px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 16px;
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
            top: 62px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 69px;
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
            <!-- ���հ�ȫ������������߼�����?-->
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;

        const filename = `logic-blank-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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
        
        // �������ͼ��λ�ã������??
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        // ��ֽ
        const stickerHtml = this.getStickersHtml(themeKey);

        // ͼƬ��������
        const imageHtml = patternImageUrl 
            ? `<img class="pattern-image" src="http://localhost:3000${patternImageUrl}" />`
            : `<div class="placeholder">�Ҳ�ͬͼƬ������...</div>`;

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
            width: 816px;
            height: 1056px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 816px;
            height: 1056px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 16px;
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
            top: 62px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 69px;
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
            background: transparent;
        }
        .pattern-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 0;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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
        
        // �������ͼ��λ�ã������??
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        // ��ȡ�������ƣ�����ĸ��д??
        const themeName = themeKey.charAt(0).toUpperCase() + themeKey.slice(1);

        // ��ȡ8�������ɫ�زģ�??color/main ���ļ���??
        const themeAssets = getThemeMainColorAssets(themeKey, 8);
        
        // �������??�Ŵ�ͼ��4��С??
        const shuffledAssets = [...themeAssets].sort(() => Math.random() - 0.5);
        const bigItems = shuffledAssets.slice(0, 4);
        const smallItems = shuffledAssets.slice(4, 8);
        
        // �ϲ�������˳��������??
        const allItems = [
            ...bigItems.map(src => ({ src, size: 'big' })),
            ...smallItems.map(src => ({ src, size: 'small' }))
        ].sort(() => Math.random() - 0.5);

        // ��ֽ
        const stickerHtml = this.getStickersHtml(themeKey);

        // ���ɴ�������Ʒ�� HTML����??2 �У�ÿ�� 4 ����
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
            width: 816px;
            height: 1056px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 816px;
            height: 1056px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 16px;
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
            top: 62px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 69px;
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
                    <div class="label">Big</div>
                </div>
                <div class="sorting-box small">
                    <div class="label">Small</div>
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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
        
        // �������ͼ��λ�ã������??
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        // ʹ�ñ���ͼ������?
        const stickerHtml = this.getStickersHtml(themeKey);

        // ѡȡ�����ɫ�ز�?
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
            width: 816px;
            height: 1056px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 816px;
            height: 1056px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 16px;
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
            top: 62px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 69px;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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

        // ��ȡ������ɫ
        const theme = pages[0]?.theme || 'dinosaur';
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);

        // ??????????????????????
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
            width: 816px;
            min-height: 1056px;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
        }
        .page {
            width: 816px;
            height: 1056px;
            padding: 42px 32px 32px;
            page-break-after: always;
        }
        .title {
            text-align: center;
            font-size: 32px;
            font-weight: 900;
            color: ${themeColors.primary};
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
            border: 2px solid ${themeColors.primary};
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
            color: ${themeColors.primary};
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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

        // �����ȡ����ͼ���������??
        const titleIcon = getRandomTitleIcon(themeKey);
        const themeColors = getThemeColor(themeKey);
        
        // �������ͼ��λ�ã������??
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

        // ʹ��ͨ�÷���������ֽ
        const stickerHtml = this.getStickersHtml(themeKey);

        // ��ȡ��Ե�ͼƬ�ͽ�ɫ����?
        let dotsImageUrl = data.dotsImageUrl || '';
        const characterName = data.characterName || '';

        // ����е�Ե�ͼƬ����ȥ����ɫ����
        if (dotsImageUrl) {
            dotsImageUrl = await removeWhiteBackground(dotsImageUrl);
        }

        const pagesHtml = pagesContent.map((dotsArr: any[], pageIdx: number) => {
            // ����е�Ե�ͼƬ����ʾ�� canvas �У�֧�� data URL ����ͨ·����
            const imgSrc = dotsImageUrl.startsWith('data:') ? dotsImageUrl : `http://localhost:3000${dotsImageUrl}`;
            const canvasContent = dotsImageUrl 
                ? `<img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: contain;" />`
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
            width: 816px;
            height: 1056px;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            width: 816px;
            height: 1056px;
            position: relative;
            overflow: hidden;
            page-break-after: always;
        }
        .top-bar {
            position: absolute;
            top: 16px;
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
            top: 62px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 69px;
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
            margin-top: 16px;
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
            background: transparent;
            overflow: hidden;
        }
        .dots-frame {
            position: absolute;
            inset: 12px;
            border: none;
            border-radius: 14px;
            overflow: hidden;
        }
        .character-name {
            text-align: center;
            font-size: 22px;
            font-weight: 800;
            color: ${themeColors.primary};
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
            color: ${themeColors.primary};
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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
            width: 816px;
            height: 1056px;
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
</body>
</html>
        `;

        const filename = `letter-${letter}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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

        // ��ȡ������ɫ
        const theme = contentArray[0]?.theme || 'dinosaur';
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);

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
            width: 816px;
            min-height: 1056px;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
        }
        .page {
            width: 816px;
            height: 1056px;
            padding: 42px 32px 32px;
            page-break-after: always;
        }
        .title {
            text-align: center;
            font-size: 32px;
            font-weight: 900;
            color: ${themeColors.primary};
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
            border: 2px solid ${themeColors.primary};
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
            color: ${themeColors.primary};
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateCountAndWrite(data: any): Promise<string> {
        await this.initialize();

        // �� content ����ĵ�һ��Ԫ���л��?theme �� difficulty
        const contentArray = Array.isArray(data?.content) ? data.content : [data?.content || data || {}];
        const firstContent = contentArray[0] || {};
        const { theme = 'dinosaur', difficulty = 'easy' } = firstContent;
        const themeKey = String(theme || 'dinosaur').toLowerCase();
        const themeColors = getThemeColor(themeKey);
        
        // �����Ѷ��������ַ�Χ
        const difficultyConfig: Record<string, { min: number; max: number }> = {
            easy: { min: 1, max: 5 },
            medium: { min: 1, max: 8 },
            hard: { min: 1, max: 12 }
        };
        const range = difficultyConfig[difficulty] || difficultyConfig['easy'];
        console.log(`[CountAndWrite] difficulty: ${difficulty}, range: ${range.min}-${range.max}`);
        const titleIcon = getRandomTitleIcon(themeKey);
        
        // �������ͼ��λ�ã�����ң�
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" alt="theme icon">` : '';

        // ʹ�ñ���ͼ������?
        const stickerHtml = this.getStickersHtml(themeKey);

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
                // �Ҳ� 3 �����֣������Ѷȷ�Χ�������������?
                const optionsSet = new Set<number>();
                while (optionsSet.size < 3) {
                    optionsSet.add(Math.floor(Math.random() * (range.max - range.min + 1)) + range.min);
                }
                const options = Array.from(optionsSet).sort((a, b) => a - b);
                // ���ͼ�����������Ҳ����������������һ��
                const correctIndex = Math.floor(Math.random() * options.length);
                const count = Math.min(range.max, options[correctIndex]);

                // ��̬���źͲ��֣�������ʱ�����Ų���С
                const needTwoRows = count > 5;
                let size: number;
                if (needTwoRows) {
                    // ����ʱ����������������С
                    size = count <= 8 ? 48 : count <= 10 ? 42 : 36;
                } else {
                    // ����ʱ����������������С
                    size = count <= 3 ? 70 : count <= 4 ? 60 : 55;
                }
                const randomIcon = () => (themeIcons.length ? themeIcons[Math.floor(Math.random() * themeIcons.length)] : '');
                
                // ����ͼ������
                const iconElements = Array.from({ length: count }, () => {
                    const iconSrc = randomIcon();
                    const iconTag = iconSrc
                        ? `<img src="http://localhost:3000${iconSrc}" alt="icon" style="width:${size}px;height:${size}px;">`
                        : `<span class="emoji" style="font-size:${size}px;">??</span>`;
                    return `<span class="icon" style="width:${size}px;height:${size}px;">${iconTag}</span>`;
                });
                
                // �����Ҫ���ţ��ֳ���������?
                let iconsHtml: string;
                if (needTwoRows) {
                    const halfCount = Math.ceil(count / 2);
                    const row1 = iconElements.slice(0, halfCount).join('');
                    const row2 = iconElements.slice(halfCount).join('');
                    iconsHtml = `<div class="icon-box two-rows"><div class="icon-row">${row1}</div><div class="icon-row">${row2}</div></div>`;
                } else {
                    iconsHtml = `<div class="icon-box">${iconElements.join('')}</div>`;
                }
                const icons = iconsHtml;

                // �Ҳ���������չʾ����ȷ��������?
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
            width: 816px;
            min-height: 1056px;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            width: 816px;
            height: 1056px;
            position: relative;
            overflow: hidden;
            page-break-after: always;
        }
        .top-bar {
            position: absolute;
            top: 16px;
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
            top: 62px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 69px;
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
            border-top: 1.5px solid #0f172a; /* ������������ */
            padding-top: 6px;
        }
        .row {
            position: relative;
            display: grid;
            grid-template-columns: auto 1fr;
            align-items: center;
            gap: 8px;
            padding: 10px 4px 10px 12px; /* �Ҳ����� 4px��������ȫ�� */
            border: none; /* ȥ�����??*/
            border-bottom: 1.5px solid #0f172a; /* �����ָ�??*/
            border-radius: 0;
            background: transparent;
            width: 100%;
        }
        .cluster {
            min-height: 100px;
            width: 420px;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 4px;
            overflow: visible;
        }
        .cluster .icon-box {
            width: 100%;
            border: none;
            border-radius: 0;
            padding: 6px 8px;
            display: flex;
            flex-wrap: nowrap;
            gap: 6px;
            align-items: center;
            justify-content: center;
            background: transparent;
            overflow: visible;
        }
        .cluster .icon-box.two-rows {
            flex-direction: column;
            gap: 2px;
            padding: 2px 8px;
        }
        .icon-row {
            display: flex;
            flex-wrap: nowrap;
            gap: 4px;
            align-items: center;
            justify-content: center;
        }
        .icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
        }
        .icon img {
            width: 100%;
            height: 100%;
            object-fit: contain;
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
            background: transparent;
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
            border-color: #0f172a;
            background: #fff;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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

        // ��ȡ������ɫ
        const theme = contentArray[0]?.theme || 'dinosaur';
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);

        // ?????????????????????????????????????��???????????
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
            width: 816px;
            min-height: 1056px;
            padding: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
        }
        .page {
            width: 816px;
            height: 1056px;
            padding: 48px 32px 32px;
            page-break-after: always;
        }
        .title {
            text-align: center;
            font-size: 32px;
            font-weight: 900;
            color: ${themeColors.primary};
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
            color: ${themeColors.primary};
        }
        .blank {
            width: 30px;
            height: 38px;
            border-bottom: 3px solid ${themeColors.primary};
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateCustomName(data: any): Promise<string> {
        await this.initialize();

        // ��ȡ������ɫ
        const theme = data?.theme || 'dinosaur';
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);

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
            width: 816px;
            height: 1056px;
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
            color: ${themeColors.primary};
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
            border: 3px solid ${themeColors.primary};
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
            color: ${themeColors.primary};
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
    </style>
</head>
<body>
    <div class="canvas">
        <div class="decor-container">
            ${decorSpans}
        </div>
        <div class="header">
            <div class="title">? ${upperName} ?</div>
            <div class="subtitle">?? ?? ?? Little ${displayName}??s Name Practice ?? ?? ??</div>
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
    </div>
</body>
</html>
        `;

        const filename = `custom-name-${upperName}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');

        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    async generateLetterHunt(data: any): Promise<string> {
        await this.initialize();

        // ��ȡ������ɫ
        const theme = data?.theme || 'dinosaur';
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);

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

        // ??????????? 3x3
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

        // ????????????????
        const freeCells = cells.filter(cell => {
            if (!imageOrigin) return true;
            return !(
                cell.row >= imageOrigin.row && cell.row < imageOrigin.row + 3 &&
                cell.col >= imageOrigin.col && cell.col < imageOrigin.col + 3
            );
        });

        // ??????????
        for (let i = freeCells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [freeCells[i], freeCells[j]] = [freeCells[j], freeCells[i]];
        }

        // ????????????????????
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
            width: 816px;
            height: 1056px;
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
            color: ${themeColors.primary};
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
            color: ${themeColors.primary};
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
                // image?????????��?????????��????
                if (imageOrigin &&
                    rIdx >= imageOrigin.row && rIdx < imageOrigin.row + 3 &&
                    cIdx >= imageOrigin.col && cIdx < imageOrigin.col + 3) {
                    return `<div class="cell hidden"></div>`;
                }
                return `<div class="cell"><span style="font-size:${letterSize * (0.9 + Math.random() * 0.2)}px;transform:rotate(${(Math.random()-0.5)*6}deg);">${cell ?? ''}</span></div>`;
            }).join('')).join('')}
            ${imageBlock}
        </div>
    </div>
</body>
</html>
        `;

        const filename = `letter-hunt-${targetLetter}-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� Pattern Sequencing��ͼ�����У���ϰҳ
     * ÿ��չʾһ���ظ���ͼ�����У�������Ҫʶ����ɲ��ڿհ׿���������һ���??
     */
    async generatePatternSequencing(data: any): Promise<string> {
        await this.initialize();

        // ֧���������ݸ�ʽ��ֱ�Ӵ��λ�ͨ�� content ����
        const content = data?.content || data || {};
        const { theme = 'dinosaur', rowCount = 4 } = content;
        const themeKey = String(theme || 'dinosaur').toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);

        // ��ȡ�����ز�
        const colorAssets = getThemeColorAssets(themeKey, 20);
        if (colorAssets.length < 2) {
            throw new Error(`���� ${themeKey} ���زĲ��㣬��Ҫ��??��`);
        }

        // �������ͼ��λ��?
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';

        // ʹ�ñ���ͼ������?
        const stickerHtml = this.getStickersHtml(themeKey);

        // ������������??
        // ����ģʽ: AB, AAB, ABB, AABB, ABAB
        const patterns = ['AB', 'AAB', 'ABB', 'AABB', 'ABAB'];
        const rows: Array<{ images: string[]; pattern: string }> = [];

        // �����زĳأ�ȷ��ÿ��ʹ�ò�ͬ��ͼ����
        const shuffledAssets = [...colorAssets].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < rowCount; i++) {
            // ÿ��ʹ�ò�ͬ�������زģ���˳��ȡ�������ظ���
            const assetA = shuffledAssets[(i * 2) % shuffledAssets.length];
            const assetB = shuffledAssets[(i * 2 + 1) % shuffledAssets.length];

            // ���ѡ�����ģʽ
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            const sequence: string[] = [];
            let repeatCount = 0;

            // ����ģʽ�������� - �̶���ʾ6��ͼ??
            switch (pattern) {
                case 'AB':
                    // A B A B A B -> ��ʾ6??
                    for (let j = 0; j < 3; j++) {
                        sequence.push(assetA, assetB);
                    }
                    break;
                case 'AAB':
                    // A A B A A B -> ��ʾ6??
                    for (let j = 0; j < 2; j++) {
                        sequence.push(assetA, assetA, assetB);
                    }
                    break;
                case 'ABB':
                    // A B B A B B -> ��ʾ6??
                    for (let j = 0; j < 2; j++) {
                        sequence.push(assetA, assetB, assetB);
                    }
                    break;
                case 'AABB':
                    // A A B B A A -> ��ʾ6??
                    sequence.push(assetA, assetA, assetB, assetB, assetA, assetA);
                    break;
                case 'ABAB':
                    // A B A B A B -> ��ʾ6������AB��ͬ����Ϊ����ģʽ��
                    sequence.push(assetA, assetB, assetA, assetB, assetA, assetB);
                    break;
            }

            // �̶�??��ͼ??
            const displayImages = sequence.slice(0, 6);

            rows.push({ images: displayImages, pattern });
        }

        // ����??HTML - 6��ͼ??+ 1���հ׿����ʺ�??
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
            width: 816px;
            height: 1056px;
            margin: 0;
            background: #ffffff;
            font-family: 'Quicksand', sans-serif;
            position: relative;
        }
        .page {
            position: relative;
            width: 816px;
            height: 1056px;
            overflow: hidden;
        }
        .top-bar {
            position: absolute;
            top: 16px;
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
            top: 62px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 69px;
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
            border: 2px solid ${themeColors.primary};
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
            background: transparent;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� 3x3 Logic Grid ҳ��
     * 3x3 �߼����� - �ҳ�ȱʧ��ͼ��
     */
    async generateLogicGrid(data: any): Promise<string> {
        await this.initialize();
        
        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const stickerHtml = this.getStickersHtml(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        
        // ��״����ɫ
        const shapes = ['circle', 'square', 'triangle'];
        const colors = ['#4A90D9', '#4CAF50', '#FF9800']; // �����̡���
        
        // ����һ����Ч�� 3x3 ��������
        const shapeOrder = [...shapes].sort(() => Math.random() - 0.5);
        const colorOrder = [...colors].sort(() => Math.random() - 0.5);
        
        const grid: { shape: string; color: string }[][] = [];
        for (let row = 0; row < 3; row++) {
            grid[row] = [];
            for (let col = 0; col < 3; col++) {
                grid[row][col] = {
                    shape: shapeOrder[(row + col) % 3],
                    color: colorOrder[(row + col * 2) % 3]
                };
            }
        }
        
        // ȱʧλ�ã����½ǣ�
        const missingRow = 2;
        const missingCol = 2;
        const answer = { ...grid[missingRow][missingCol] };
        
        // ������״ SVG
        const getShapeSvg = (shape: string, color: string, size: number = 80) => {
            switch (shape) {
                case 'circle':
                    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${color}" stroke="#333" stroke-width="3"/></svg>`;
                case 'square':
                    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><rect x="5" y="5" width="90" height="90" fill="${color}" stroke="#333" stroke-width="3"/></svg>`;
                case 'triangle':
                    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><polygon points="50,5 95,95 5,95" fill="${color}" stroke="#333" stroke-width="3"/></svg>`;
                default:
                    return '';
            }
        };
        
        // �������� HTML - ʹ�ø���ĳߴ�?
        const gridHtml = grid.map((row, rowIdx) => {
            const cellsHtml = row.map((cell, colIdx) => {
                if (rowIdx === missingRow && colIdx === missingCol) {
                    return `<div class="grid-cell missing"><span class="question-mark">?</span></div>`;
                }
                return `<div class="grid-cell">${getShapeSvg(cell.shape, cell.color, 140)}</div>`;
            }).join('');
            return `<div class="grid-row">${cellsHtml}</div>`;
        }).join('');
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .content-area {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            padding: 0;
        }
        .grid-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: transparent;
            padding: 28px;
            border-radius: 20px;
            border: none;
        }
        .grid-row {
            display: flex;
            gap: 12px;
        }
        .grid-cell {
            width: 180px;
            height: 180px;
            background: transparent;
            border: 4px solid ${themeColors.secondary};
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .grid-cell.missing {
            background: transparent;
            border: 4px dashed ${themeColors.accent};
        }
        .question-mark {
            font-size: 96px;
            font-weight: 800;
            color: ${themeColors.accent};
            opacity: 0.1;
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
                <div class="main">3x3 Logic Grid</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="content-area">
                <div class="grid-container">
                    ${gridHtml}
                </div>
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;

        const filename = `logic-grid-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� Odd One Out ҳ��
     * �ҳ���ͬ��һ��
     */
    async generateOddOneOut(data: any): Promise<string> {
        await this.initialize();
        
        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const stickerHtml = this.getStickersHtml(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        
        // ��ȡ�����ز�
        const colorAssets = getThemeColorAssets(themeKey, 30);
        const shuffled = [...colorAssets].sort(() => Math.random() - 0.5);
        
        // ���� 5 �У�ÿ�� 4 ����Ʒ��3 ����ͬ��1 ����ͬ��
        const rows: Array<{ items: string[]; oddIndex: number }> = [];
        
        for (let i = 0; i < 5; i++) {
            const mainItem = shuffled[i * 2] || shuffled[0];
            const oddItem = shuffled[i * 2 + 1] || shuffled[1];
            
            // ���� 4 ����Ʒ��3 ����ͬ + 1 ����ͬ
            const items = [mainItem, mainItem, mainItem, oddItem];
            
            // ����˳��
            for (let j = items.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [items[j], items[k]] = [items[k], items[j]];
            }
            
            // �ҵ� odd ��λ��
            const oddIndex = items.indexOf(oddItem);
            
            rows.push({ items, oddIndex });
        }
        
        // ������ HTML
        const rowsHtml = rows.map((row, idx) => {
            const itemsHtml = row.items.map(item => 
                `<div class="item-cell"><img src="http://localhost:3000${item}" /></div>`
            ).join('');
            
            return `
                <div class="odd-row">
                    <div class="row-number">${idx + 1}.</div>
                    <div class="items-container">${itemsHtml}</div>
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
        .content-area {
            display: flex;
            flex-direction: column;
            gap: 14px;
            flex: 1;
            justify-content: center;
            padding: 6px 0;
        }
        .odd-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 10px;
            background: ${themeColors.light};
            border-radius: 12px;
        }
        .row-number {
            font-size: 20px;
            font-weight: 700;
            color: ${themeColors.accent};
            min-width: 32px;
        }
        .items-container {
            display: flex;
            gap: 14px;
            flex: 1;
            justify-content: center;
        }
        .item-cell {
            width: 105px;
            height: 105px;
            background: transparent;
            border: 2px solid ${themeColors.secondary};
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 6px;
        }
        .item-cell img {
            max-width: 100%;
            max-height: 100%;
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
                <div class="main">Odd One Out</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="content-area">
                ${rowsHtml}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;

        const filename = `odd-one-out-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� Matching Halves ҳ��
     * ƥ������
     */
    async generateMatchingHalves(data: any): Promise<string> {
        await this.initialize();
        
        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const stickerHtml = this.getStickersHtml(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        
        // ��ȡ�����ز�
        const colorAssets = getThemeColorAssets(themeKey, 10);
        const shuffled = [...colorAssets].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 5);
        
        // ���̶�˳���Ҳ����?
        const leftItems = selected.map((item, idx) => ({ item, id: idx }));
        const rightItems = [...leftItems].sort(() => Math.random() - 0.5);
        
        // �������?HTML����ʾͼƬ����벿�֣��������ұ߿����м�?
        const leftHtml = leftItems.map((item, idx) => `
            <div class="half-item left-item">
                <div class="half-image">
                    <img class="left-half-img" src="http://localhost:3000${item.item}" />
                </div>
                <div class="half-number">${idx + 1}</div>
            </div>
        `).join('');
        
        // �����Ҳ� HTML����ʾͼƬ���Ұ벿�֣���ĸ����߿����м�?
        const rightHtml = rightItems.map((item, idx) => `
            <div class="half-item right-item">
                <div class="half-letter">${String.fromCharCode(65 + idx)}</div>
                <div class="half-image">
                    <img class="right-half-img" src="http://localhost:3000${item.item}" />
                </div>
            </div>
        `).join('');
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .content-area {
            display: flex;
            flex-direction: column;
            flex: 1;
            justify-content: center;
            width: 100%;
            padding: 0;
        }
        .matching-container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            padding: 0;
            gap: 80px;
        }
        .column {
            display: flex;
            flex-direction: column;
            gap: 20px;
            flex-shrink: 0;
        }
        .half-item {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px;
            background: ${themeColors.light};
            border-radius: 12px;
            height: 105px;
            width: 180px;
        }
        .half-number, .half-letter {
            width: 32px;
            height: 32px;
            background: ${themeColors.primary};
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 700;
            flex-shrink: 0;
        }
        .half-image {
            flex: 1;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: transparent;
            border-radius: 10px;
            border: 3px solid ${themeColors.secondary};
        }
        /* 左半部分图片，只显示图片左边一半 */
        .left-half-img {
            height: 85px;
            max-height: 85px;
            width: auto;
            max-width: 200%;
            object-fit: contain;
            clip-path: polygon(0 0, 50% 0, 50% 100%, 0 100%);
        }
        /* 右半部分图片，只显示图片右边一半 */
        .right-half-img {
            height: 85px;
            max-height: 85px;
            width: auto;
            max-width: 200%;
            object-fit: contain;
            clip-path: polygon(50% 0, 100% 0, 100% 100%, 50% 100%);
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
                <div class="main">Matching Halves</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="content-area">
                <div class="matching-container">
                    <div class="column">${leftHtml}</div>
                    <div class="column">${rightHtml}</div>
                </div>
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;

        const filename = `matching-halves-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� Shape Synthesis ҳ��
     * ��״�ϳ� - �û�����״��������
     */
    async generateShapeSynthesis(data: any): Promise<string> {
        await this.initialize();
        
        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const stickerHtml = this.getStickersHtml(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        
        // ���õĻ�����״������ɫ
        const availableShapes = [
            { shape: 'circle', color: '#E53935' },      // ��ɫԲ��
            { shape: 'triangle', color: '#1E88E5' },    // ��ɫ������
            { shape: 'square', color: '#43A047' },      // ��ɫ������
            { shape: 'rectangle', color: '#FB8C00' },   // ��ɫ����
            { shape: 'semicircle', color: '#8E24AA' },  // ��ɫ��Բ
            { shape: 'diamond', color: '#FDD835' },     // ��ɫ����
            { shape: 'oval', color: '#00ACC1' }         // ��ɫ��Բ
        ];
        
        // ������״ SVG
        const getShapeSvg = (shape: string, color: string) => {
            const size = 50;
            switch (shape) {
                case 'circle':
                    return `<svg width="${size}" height="${size}" viewBox="0 0 50 50"><circle cx="25" cy="25" r="22" fill="${color}" stroke="#333" stroke-width="2"/></svg>`;
                case 'triangle':
                    return `<svg width="${size}" height="${size}" viewBox="0 0 50 50"><polygon points="25,3 47,47 3,47" fill="${color}" stroke="#333" stroke-width="2"/></svg>`;
                case 'square':
                    return `<svg width="${size}" height="${size}" viewBox="0 0 50 50"><rect x="3" y="3" width="44" height="44" fill="${color}" stroke="#333" stroke-width="2"/></svg>`;
                case 'rectangle':
                    return `<svg width="70" height="${size}" viewBox="0 0 70 50"><rect x="3" y="8" width="64" height="34" fill="${color}" stroke="#333" stroke-width="2"/></svg>`;
                case 'semicircle':
                    return `<svg width="${size}" height="30" viewBox="0 0 50 30"><path d="M 3 27 A 22 22 0 0 1 47 27 L 3 27" fill="${color}" stroke="#333" stroke-width="2"/></svg>`;
                case 'diamond':
                    return `<svg width="${size}" height="${size}" viewBox="0 0 50 50"><polygon points="25,3 47,25 25,47 3,25" fill="${color}" stroke="#333" stroke-width="2"/></svg>`;
                case 'oval':
                    return `<svg width="60" height="40" viewBox="0 0 60 40"><ellipse cx="30" cy="20" rx="27" ry="17" fill="${color}" stroke="#333" stroke-width="2"/></svg>`;
                default:
                    return '';
            }
        };
        
        // ������״������ HTML
        const shapesHtml = availableShapes.map(s => 
            `<div class="shape-item">${getShapeSvg(s.shape, s.color)}</div>`
        ).join('');
        
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        ${this.getBaseStyles(themeColors)}
        .content-area {
            display: flex;
            flex-direction: column;
            gap: 16px;
            flex: 1;
            padding: 10px 0;
        }
        .shapes-toolbar {
            display: flex;
            justify-content: center;
            gap: 16px;
            padding: 16px 20px;
            background: ${themeColors.light};
            border-radius: 16px;
            border: 3px solid ${themeColors.secondary};
            flex-wrap: wrap;
        }
        .shape-item {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
        }
        .canvas-area {
            flex: 1;
            background: white;
            border: 3px solid ${themeColors.secondary};
            border-radius: 16px;
            min-height: 600px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding-top: 20px;
        }
        .canvas-hint {
            font-size: 24px;
            color: #cbd5e1;
            font-weight: 600;
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
                <div class="main">Shape Synthesis</div>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="content-area">
                <div class="shapes-toolbar">
                    ${shapesHtml}
                </div>
                <div class="canvas-area">
                    <span class="canvas-hint">Draw here!</span>
                </div>
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>
        `;

        const filename = `shape-synthesis-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���� Shape Path ҳ��
     * ��״·����ϰ - ������״������ߵ��յ�?
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
        
        // ��״����
        const shapes = ['circle', 'square', 'triangle'];
        
        // ���� 5x5 ������5��5�У���ȷ��������״���ָ������?
        // �ܹ� 25 �����ӣ�ÿ����״���� 8 ����ʣ�� 1 �����?
        const shapePool: string[] = [];
        for (let i = 0; i < 8; i++) {
            shapePool.push('circle', 'square', 'triangle');
        }
        shapePool.push(shapes[Math.floor(Math.random() * shapes.length)]); // ��25�����?
        // ϴ��
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
        
        // ��������·�����꣨5x5����
        const pathCoords: { row: number; col: number }[] = [];
        let currentRow = 0;
        let currentCol = 0;
        let direction = 1; // 1 = ����, -1 = ����
        
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
        
        // ������������Ƿ����ڣ���·����������?
        const getPathIndex = (row: number, col: number) => {
            return pathCoords.findIndex(p => p.row === row && p.col === col);
        };
        
        // ������״ SVG��������״����ʵ�ߣ�
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
        
        // ����·�������ߣ����ߣ�
        const generatePathLines = () => {
            const cellSize = 120; // ��Ԫ����?
            const lines: string[] = [];
            
            for (let i = 0; i < pathCoords.length - 1; i++) {
                const current = pathCoords[i];
                const next = pathCoords[i + 1];
                
                // ���������յ�λ�ã����������������?
                const x1 = current.col * cellSize + cellSize / 2;
                const y1 = current.row * cellSize + cellSize / 2;
                const x2 = next.col * cellSize + cellSize / 2;
                const y2 = next.row * cellSize + cellSize / 2;
                
                // ˮƽ����
                if (current.row === next.row) {
                    const startX = Math.min(x1, x2) + 45;
                    const endX = Math.max(x1, x2) - 45;
                    lines.push(`<line x1="${startX}" y1="${y1}" x2="${endX}" y2="${y2}" stroke="#1f2937" stroke-width="2" stroke-dasharray="4,4"/>`);
                }
                // ��ֱ����
                else if (current.col === next.col) {
                    const startY = Math.min(y1, y2) + 45;
                    const endY = Math.max(y1, y2) - 45;
                    lines.push(`<line x1="${x1}" y1="${startY}" x2="${x2}" y2="${endY}" stroke="#1f2937" stroke-width="2" stroke-dasharray="4,4"/>`);
                }
            }
            
            return `<svg class="path-lines" width="${5 * cellSize}" height="${5 * cellSize}" style="position: absolute; top: 0; left: 0; pointer-events: none;">${lines.join('')}</svg>`;
        };
        
        // �������� HTML
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
            top: 69px;
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
            color: ${themeColors.primary};
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
            top: 62px;
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        
        return `/generated/worksheets/${filename}`;
    }

    /**
     * Trace and Draw - �Ϸ������״���·����ɻ�?
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

        // ������?- ���Ӻ������ο�ͼƬ��
        const tracingShapes = `
            <div class="shape-item house">
                <svg width="260" height="280" viewBox="0 0 260 280">
                    <!-- �����ݶ����������Σ� -->
                    <polygon points="130,5 250,110 10,110" fill="none" stroke="#9ca3af" stroke-width="2" stroke-dasharray="4,3"/>
                    <!-- �������� -->
                    <rect x="25" y="110" width="210" height="165" fill="none" stroke="#9ca3af" stroke-width="2" stroke-dasharray="4,3"/>
                    <!-- �󴰻� -->
                    <rect x="45" y="140" width="55" height="55" fill="none" stroke="#9ca3af" stroke-width="2" stroke-dasharray="4,3"/>
                    <!-- �ţ��м䣩 -->
                    <rect x="125" y="175" width="50" height="100" fill="none" stroke="#9ca3af" stroke-width="2" stroke-dasharray="4,3"/>
                </svg>
            </div>
            <div class="shape-item tree">
                <svg width="160" height="280" viewBox="0 0 160 280">
                    <!-- ���ڣ�Բ�Σ� -->
                    <circle cx="80" cy="75" r="65" fill="none" stroke="#9ca3af" stroke-width="2" stroke-dasharray="4,3"/>
                    <!-- ���ɣ���Բ�εײ���ʼ�� -->
                    <rect x="55" y="140" width="50" height="135" fill="none" stroke="#9ca3af" stroke-width="2" stroke-dasharray="4,3"/>
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
            top: 62px;
            left: -24px;
            width: calc(100% + 48px);
            height: 1.5px;
            background: ${themeColors.primary};
            opacity: 0.85;
        }
        .safe-area {
            position: absolute;
            left: 40px;
            top: 69px;
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
        .title-row .main { font-size: 38px; font-weight: 900; color: ${themeColors.primary}; }
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
        .draw-box {
            flex: 1;
            border: 2.5px solid ${themeColors.primary};
            border-radius: 16px;
            background: transparent;
            min-height: 420px;
            position: relative;
        }
        .draw-hint {
            position: absolute;
            top: 16px;
            left: 16px;
            font-size: 15px;
            font-weight: 600;
            color: #475569;
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
                    <div class="shapes-grid">
                        ${tracingShapes}
                    </div>
                </div>
                <div class="draw-section">
                    <div class="draw-box">
                        <span class="draw-hint">Draw your own picture:</span>
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
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
            case 'logic-grid':
                return await this.generateLogicGrid(data);
            case 'odd-one-out':
                return await this.generateOddOneOut(data);
            case 'matching-halves':
                return await this.generateMatchingHalves(data);
            case 'shape-synthesis':
                return await this.generateShapeSynthesis(data);
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
            case 'picture-subtraction':
                return await this.generatePictureSubtraction(data);
            case 'number-sequencing':
                return await this.generateNumberSequencing(data);
            default:
                throw new Error(`Unknown worksheet type: ${type}`);
        }
    }

    /**
     * �����������ҳ��?
     * ÿ�У���������??+ �м����� + �Ҳ�����ͼ��
     * 4??��������ֱ�ߡ������ߡ�����ߡ���??
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

        // ��ȡ�����ɫ�ز�??����4����??+ 4���Ҳࣩ
        const colorAssets = getThemeColorAssets(themeKey, 8);
        const shuffledAssets = [...colorAssets].sort(() => Math.random() - 0.5);

        // 4���������͵� SVG ·��
        const lineTypes = [
            { path: 'M 0 40 L 300 40', name: 'straight' },  // ֱ��
            { path: 'M 0 40 Q 75 0 150 40 Q 225 80 300 40', name: 'wavy' },  // ����??
            { path: 'M 0 70 L 50 10 L 100 70 L 150 10 L 200 70 L 250 10 L 300 70', name: 'zigzag' },  // ���??
            { path: 'M 0 70 Q 100 70 150 30 Q 200 0 300 10', name: 'curved' }  // ����
        ];

        // ����4??HTML
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    /**
     * ������״���ҳ��?
     * 2x2����Բ�Ρ������Ρ������Ρ���??
     * ÿ�����򣺴���״ + �·�С��״���軭
     * �ײ������ɻ滭��??
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

        // ��ȡ4������װ��ͼ�����Ľ�??
        const colorAssets = getThemeColorAssets(themeKey, 4);

        // 4����״���ã�����״SVG + С��״SVG + �̶�3��С��״
        const shapes = [
            { 
                name: 'Circle',
                bigSvg: '<circle cx="70" cy="70" r="55" stroke="#1a1a1a" stroke-width="5" fill="none"/>',
                smallSvg: '<circle cx="30" cy="30" r="25" fill="none" stroke="#999" stroke-width="2" stroke-dasharray="5,3"/>',
                smallCount: 3,
                smallViewBox: '0 0 60 60'
            },
            { 
                name: 'Square',
                bigSvg: '<rect x="15" y="15" width="110" height="110" stroke="#1a1a1a" stroke-width="5" fill="none"/>',
                smallSvg: '<rect x="5" y="5" width="50" height="50" fill="none" stroke="#999" stroke-width="2" stroke-dasharray="5,3"/>',
                smallCount: 3,
                smallViewBox: '0 0 60 60'
            },
            { 
                name: 'Triangle',
                bigSvg: '<polygon points="70,15 125,125 15,125" stroke="#1a1a1a" stroke-width="5" fill="none"/>',
                smallSvg: '<polygon points="30,5 55,50 5,50" fill="none" stroke="#999" stroke-width="2" stroke-dasharray="5,3"/>',
                smallCount: 3,
                smallViewBox: '0 0 60 55'
            },
            { 
                name: 'Star',
                bigSvg: '<polygon points="70,5 82,45 125,45 90,70 102,115 70,90 38,115 50,70 15,45 58,45" stroke="#1a1a1a" stroke-width="5" fill="none"/>',
                smallSvg: '<polygon points="30,2 36,20 55,20 40,32 46,52 30,40 14,52 20,32 5,20 24,20" fill="none" stroke="#999" stroke-width="2" stroke-dasharray="5,3"/>',
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
            align-content: center;
        }
        .shape-cell {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 28px 20px 20px;
            background: ${themeColors.light};
            border: 3px solid ${themeColors.secondary};
            border-radius: 24px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .big-shape {
            width: 180px;
            height: 180px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }
        .small-shapes {
            display: flex;
            gap: 16px;
            margin-top: 18px;
            padding: 12px 20px;
            background: ${themeColors.light};
            border-radius: 14px;
        }
        .small-shape {
            width: 60px;
            height: 60px;
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
        </div>
        ${stickerHtml}
    </div>
</body>
</html>`;

        const filename = `shape-tracing-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    /**
     * ����Ϳɫҳ��
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

        // �����ȡ�����߸�ͼƬ����?line/main �ļ��У�
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
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    /**
     * ���ɴ��⻭ҳ??
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

        // ��ȡ Creative Prompt ͼƬ��ȥ����ɫ����
        const originalImage = getCreativePromptImage(themeKey, promptType);
        const promptImage = await removeWhiteBackground(originalImage);

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
                ${promptImage ? `<img class="prompt-image" src="${promptImage.startsWith('data:') ? promptImage : 'http://localhost:3000' + promptImage}" alt="Creative Prompt" />` : ''}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>`;

        const filename = `creative-prompt-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    /**
     * ����ͼƬ����ҳ��
     * 2x2 ����ÿ��������ʾ���壬���ֱ�������X��ǣ����·��Ǽ������?
     */
    async generatePictureSubtraction(data: any): Promise<string> {
        await this.initialize();
        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);

        // ��ȡ�����ɫ�ز�?
        const colorAssets = getThemeColorAssets(themeKey, 6);

        // ����6��������
        const problems = Array.from({ length: 6 }, (_, idx) => {
            const total = Math.floor(Math.random() * 5) + 4; // 4-8
            const subtract = Math.floor(Math.random() * (total - 1)) + 1; // 1 �� total-1
            const result = total - subtract;
            const imageUrl = colorAssets[idx % colorAssets.length] || colorAssets[0];
            
            return { total, subtract, result, imageUrl };
        });

        // ����ÿ�������HTML
        const problemsHtml = problems.map((p, idx) => {
            // ��������ͼ�꣨ǰsubtract����������
            const objectsHtml = Array.from({ length: p.total }, (_, i) => {
                const isCrossed = i < p.subtract;
                return `
                    <div class="object-item ${isCrossed ? 'crossed' : ''}">
                        <img src="http://localhost:3000${p.imageUrl}" alt="object" />
                        ${isCrossed ? '<div class="cross-mark">?</div>' : ''}
                    </div>
                `;
            }).join('');

            return `
                <div class="problem-box">
                    <div class="objects-grid">${objectsHtml}</div>
                    <div class="equation">
                        <span class="num">${p.total}</span>
                        <span class="op">?</span>
                        <span class="num">${p.subtract}</span>
                        <span class="op">=</span>
                        <span class="answer-box"></span>
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
        .problems-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(3, auto);
            gap: 20px 16px;
            padding: 16px 10px;
            align-content: center;
            flex: 1;
        }
        .problem-box {
            background: #fff;
            border: 2.5px solid ${themeColors.primary};
            border-radius: 16px;
            padding: 12px 16px;
            display: flex;
            flex-direction: column;
        }
        .objects-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            justify-content: center;
            align-items: center;
            align-content: center;
            max-width: 280px;
            margin: 0 auto;
            min-height: 120px;
        }
        .object-item {
            width: 48px;
            height: 48px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .object-item img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .object-item.crossed img {
            opacity: 0.4;
        }
        .cross-mark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 38px;
            font-weight: 900;
            color: #ef4444;
            line-height: 1;
        }
        .equation {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
            padding-top: 10px;
            margin-top: auto;
            border-top: 1.5px dashed #e5e7eb;
        }
        .num {
            min-width: 28px;
            text-align: center;
        }
        .op {
            color: ${themeColors.primary};
        }
        .answer-box {
            width: 48px;
            height: 40px;
            border: 2.5px dashed #9ca3af;
            border-radius: 8px;
            background: transparent;
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
                <span class="main">Picture Subtraction</span>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="problems-grid">
                ${problemsHtml}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>`;

        const filename = `picture-subtraction-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }

    /**
     * ������������ҳ��
     * �����������У�����Բ/ҩ����״���ӣ���������Ϊ����Ҫ��д
     */
    async generateNumberSequencing(data: any): Promise<string> {
        await this.initialize();
        const content = data?.content || data || {};
        const { theme = 'dinosaur' } = content;
        const themeKey = String(theme).toLowerCase();
        const themeColors = getThemeColor(themeKey);
        const titleIcon = getRandomTitleIcon(themeKey);
        const iconPosition = Math.random() > 0.5 ? 'left' : 'right';
        const titleIconHtml = titleIcon ? `<img class="title-icon" src="http://localhost:3000${titleIcon}" />` : '';
        const stickerHtml = this.getStickersHtml(themeKey);

        // ����6����������
        const sequences: { numbers: (number | null)[]; start: number }[] = [];
        const usedStarts = new Set<number>();
        
        for (let i = 0; i < 6; i++) {
            let start: number;
            do {
                start = Math.floor(Math.random() * 15) + 1; // 1-15
            } while (usedStarts.has(start));
            usedStarts.add(start);
            
            // ÿ��5�����֣����?-2���հ�
            const numbers: (number | null)[] = [];
            const blankCount = Math.random() > 0.5 ? 2 : 1;
            const blankPositions = new Set<number>();
            while (blankPositions.size < blankCount) {
                blankPositions.add(Math.floor(Math.random() * 5));
            }
            
            for (let j = 0; j < 5; j++) {
                numbers.push(blankPositions.has(j) ? null : start + j);
            }
            
            sequences.push({ numbers, start });
        }

        // ��������HTML
        const sequencesHtml = sequences.map((seq, rowIdx) => {
            const pillsHtml = seq.numbers.map((num, idx) => {
                const isBlank = num === null;
                const displayNum = isBlank ? '' : num;
                return `
                    <div class="pill-container">
                        <div class="pill ${isBlank ? 'blank' : 'filled'}">
                            ${isBlank ? '' : `<span class="pill-num">${displayNum}</span>`}
                        </div>
                        ${idx < seq.numbers.length - 1 ? '<div class="connector"></div>' : ''}
                    </div>
                `;
            }).join('');

            return `
                <div class="sequence-row">
                    ${pillsHtml}
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
        .sequences-container {
            display: flex;
            flex-direction: column;
            gap: 24px;
            flex: 1;
            padding: 20px 10px;
            justify-content: space-around;
        }
        .sequence-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0;
        }
        .pill-container {
            display: flex;
            align-items: center;
        }
        .pill {
            width: 90px;
            height: 56px;
            border-radius: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 700;
        }
        .pill.filled {
            background: ${themeColors.primary};
            color: #fff;
            border: 3px solid ${themeColors.accent};
        }
        .pill.blank {
            background: transparent;
            border: 3px dashed #9ca3af;
        }
        .pill-num {
            line-height: 1;
        }
        .connector {
            width: 24px;
            height: 4px;
            background: ${themeColors.secondary};
            border-radius: 2px;
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
                <span class="main">Number Sequencing</span>
                ${iconPosition === 'right' ? titleIconHtml : ''}
            </div>
            <div class="sequences-container">
                ${sequencesHtml}
            </div>
        </div>
        ${stickerHtml}
    </div>
</body>
</html>`;

        const filename = `number-sequencing-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const page = await this.browser.newPage();
        await page.setViewport({ width: 816, height: 1056, deviceScaleFactor: 1.25 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.evaluateHandle('document.fonts.ready');
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();
        return `/generated/worksheets/${filename}`;
    }
}

export const imageGenerator = new ImageGenerator();





