# Read the entire file
$content = Get-Content "e:\codex\ai-kid-print\backend\src\services\imageGenerator.ts" -Raw -Encoding UTF8

# Define the old function (simplified pattern to match)
$oldPattern = @'
    async generateCountAndWrite\(data: any\): Promise<string> \{[\s\S]*?return `/generated/\$\{filename\}`;[\s\S]*?\}[\s\S]*?async generateAlphabetOrder
'@

# Define the new function
$newFunction = @'
    async generateCountAndWrite(data: any): Promise<string> {
        await this.initialize();

        // Handle multi-page data structure (similar to generateCvcSimpleWords)
        const contentArray = Array.isArray((data as any)?.content)
            ? (data as any).content
            : Array.isArray(data)
                ? (data as any)
                : [data || {}];

        const pagesHtml = contentArray.map((pageData: any) => {
            const items = Array.isArray(pageData?.items) ? pageData.items.slice(0, 6) : [];
            if (items.length === 0) {
                for (let i = 0; i < 6; i++) {
                    items.push({ count: Math.floor(Math.random() * 6) + 1 });
                }
            }

            // 为每行取一张图片（从 uploads 库中随机）
            const decorImages = getRandomDecorImages(items.length);

            return `
            <div class="page">
                <div class="title">Count and Write</div>
                <div class="board">
                    ${items.map((item: any, idx: number) => {
                        const img = decorImages[idx % decorImages.length];
                        const rawCount = parseInt(item?.count);
                        const count = Math.max(1, Math.min(6, isNaN(rawCount) ? Math.floor(Math.random() * 6) + 1 : rawCount));
                        const size = Math.max(44, 84 - (count - 1) * 4);
                        const iconTag = img && isImageFile(img)
                            ? `<img src="http://localhost:3000${img}" alt="icon" style="max-width:${size}px;max-height:${size}px;">`
                            : `<span class="emoji" style="font-size:${size}px;">🍎</span>`;
                        const icons = Array.from({ length: count }, () => `<span class="icon">${iconTag}</span>`).join('');
                        return `
                        <div class="row">
                            <div class="num">${idx + 1}.</div>
                            <div class="cluster">${icons}</div>
                            <div class="write-box"></div>
                        </div>
                        `;
                    }).join('')}
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            width: 794px;
            min-height: 1123px;
            background: #ffffff;
            font-family: 'Fredoka', 'Comic Sans MS', 'Arial Rounded MT', Arial, sans-serif;
        }
        .page {
            width: 794px;
            height: 1123px;
            padding: 40px 32px 24px;
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
            width: 700px;
            margin: 32px auto 0;
            display: flex;
            flex-direction: column;
            gap: 38px;
        }
        .row {
            display: grid;
            grid-template-columns: 60px 1fr 120px;
            align-items: center;
            gap: 14px;
            padding: 12px 12px;
            border-bottom: 2px solid #0f172a;
        }
        .num {
            font-size: 26px;
            font-weight: 900;
            color: #0f172a;
            text-align: center;
        }
        .cluster {
            min-height: 100px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            gap: 14px;
            flex-wrap: nowrap;
            overflow: hidden;
        }
        .icon {
            width: 68px;
            height: 68px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }
        .icon img {
            max-width: 68px;
            max-height: 68px;
            object-fit: contain;
        }
        .write-box {
            height: 90px;
            width: 110px;
            border: 2px solid #0f172a;
            border-radius: 12px;
            background: #fdf7eb;
        }
        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    ${pagesHtml}
</body>
</html>
        `;

        const filename = `count-write-${Date.now()}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        const page = await this.browser.newPage();
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.25 });
        await page.setContent(html);
        await page.evaluateHandle('document.fonts.ready');
        await new Promise(resolve => setTimeout(resolve, 100));
        await page.screenshot({ path: filepath, fullPage: true });
        await page.close();

        return `/generated/${filename}`;
    }
    async generateAlphabetOrder
'@

# Replace
$newContent = $content -replace $oldPattern, $newFunction

# Write back
Set-Content "e:\codex\ai-kid-print\backend\src\services\imageGenerator.ts" -Value $newContent -Encoding UTF8 -NoNewline

Write-Host "File updated successfully"
