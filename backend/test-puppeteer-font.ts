import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFontLoading() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @font-face {
            font-family: 'Quicksand';
            src: url('http://localhost:3000/fonts/Quicksand/quicksand-v37-latin-700.woff2') format('woff2');
            font-weight: 700;
            font-style: normal;
        }
    </style>
    <style>
        body {
            padding: 50px;
            font-family: 'Quicksand', sans-serif;
            font-size: 60px;
            font-weight: 700;
        }
    </style>
</head>
<body>
    ABCDEFGHIJKLMNOP
</body>
</html>
    `;

    await page.setViewport({ width: 800, height: 200 });
    await page.setContent(html);

    // Wait for fonts
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check loaded fonts
    const fonts = await page.evaluate(() => {
        const loadedFonts = [];
        document.fonts.forEach(font => {
            loadedFonts.push({
                family: font.family,
                weight: font.weight,
                status: font.status
            });
        });
        return loadedFonts;
    });

    console.log('✅ Loaded fonts:', JSON.stringify(fonts, null, 2));

    // Take screenshot
    const outputPath = path.join(__dirname, 'public/generated/font-test.png');
    await page.screenshot({ path: outputPath });
    console.log(`✅ Screenshot saved to: ${outputPath}`);

    await browser.close();
}

testFontLoading().catch(console.error);
