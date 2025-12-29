import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfGenerator from '../services/pdfGenerator.js';
import { generateWeeklyPackConfig } from '../services/generators/weeklyPackService.js';
import { ImageGenerator } from '../services/imageGenerator.js';
import { 
  literacyGenerators, 
  mathGenerators, 
  logicGenerators, 
  creativityGenerators,
  fineMotorGenerators,
  generateConnectDots as generateConnectDotsData 
} from '../services/generators/index.js';

const router = express.Router();
const imageGenerator = new ImageGenerator();

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pack 数据存储目录
const PACKS_DIR = path.join(__dirname, '../../data/packs');

// 确保目录存在
if (!fs.existsSync(PACKS_DIR)) {
  fs.mkdirSync(PACKS_DIR, { recursive: true });
}

// 每个用户最多保留的 pack 数量
const MAX_PACKS_PER_USER = 10;

// 生成唯一 packId
function generatePackId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 清理用户的旧 packs，只保留最近 MAX_PACKS_PER_USER 个
function cleanupUserPacks(userId: string): void {
  if (!userId) return;
  
  try {
    const files = fs.readdirSync(PACKS_DIR).filter(f => f.endsWith('.json'));
    const userPacks: Array<{ file: string; createdAt: string; pages: Array<{ imageUrl: string }> }> = [];

    // 收集该用户的所有 packs
    for (const file of files) {
      try {
        const filePath = path.join(PACKS_DIR, file);
        const packData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        if (packData.createdBy === userId) {
          userPacks.push({
            file,
            createdAt: packData.createdAt,
            pages: packData.pages || []
          });
        }
      } catch (e) {
        // 忽略读取错误
      }
    }

    // 如果超过限制，删除最旧的
    if (userPacks.length > MAX_PACKS_PER_USER) {
      // 按创建时间排序（最新的在前）
      userPacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // 删除超出限制的旧 packs
      const packsToDelete = userPacks.slice(MAX_PACKS_PER_USER);
      
      for (const pack of packsToDelete) {
        try {
          // 删除 pack JSON 文件
          const packFilePath = path.join(PACKS_DIR, pack.file);
          fs.unlinkSync(packFilePath);
          console.log(`[WeeklyPack] Deleted old pack: ${pack.file}`);
          
          // 删除关联的图片文件
          for (const page of pack.pages) {
            if (page.imageUrl) {
              // 图片 URL 格式: /uploads/generated/xxx.png
              const imagePath = page.imageUrl.replace(/^\//, '');
              const fullImagePath = path.join(__dirname, '../../public', imagePath);
              
              if (fs.existsSync(fullImagePath)) {
                fs.unlinkSync(fullImagePath);
                console.log(`[WeeklyPack] Deleted image: ${imagePath}`);
              }
            }
          }
        } catch (e) {
          console.error(`[WeeklyPack] Error deleting pack ${pack.file}:`, e);
        }
      }
      
      console.log(`[WeeklyPack] Cleaned up ${packsToDelete.length} old packs for user ${userId}`);
    }
  } catch (error) {
    console.error('[WeeklyPack] Error during cleanup:', error);
  }
}

// Pack 数据接口
interface PackData {
  packId: string;
  childName: string;
  age: string;
  theme: string;
  weekNumber: number;
  pages: Array<{
    order: number;
    type: string;
    title: string;
    imageUrl: string;
  }>;
  createdAt: string;
  createdBy?: string;
  source?: 'manual' | 'auto'; // manual = 用户手动生成, auto = 定时任务自动推送
}

/**
 * POST /api/weekly-pack/generate
 * Generate a weekly learning pack
 */
router.post('/generate', async (req, res) => {
  try {
    const { childName, age, theme, weekNumber } = req.body;

    // Validate input
    if (!childName || !age || !theme) {
      return res.status(400).json({
        error: 'Missing required fields: childName, age, theme'
      });
    }

    // Generate PDF
    await pdfGenerator.initialize();
    const pdfBuffer = await pdfGenerator.generateWeeklyPack({
      childName,
      age,
      theme,
      weekNumber: weekNumber || getCurrentWeekNumber(),
      includePages: ['all']
    });
    await pdfGenerator.close();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${childName}-Week-${weekNumber || getCurrentWeekNumber()}.pdf"`);
    
    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating weekly pack:', error);
    res.status(500).json({
      error: 'Failed to generate weekly pack',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/weekly-pack/preview
 * Generate a preview (first 3 pages only)
 */
router.post('/preview', async (req, res) => {
  try {
    const { childName, age, theme } = req.body;

    if (!childName || !age || !theme) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    await pdfGenerator.initialize();
    const pdfBuffer = await pdfGenerator.generateWeeklyPack({
      childName,
      age,
      theme,
      weekNumber: getCurrentWeekNumber(),
      includePages: ['cover', 'letter', 'number'] // Preview only
    });
    await pdfGenerator.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({
      error: 'Failed to generate preview'
    });
  }
});

/**
 * GET /api/weekly-pack/current-week
 * Get current week number
 */
router.get('/current-week', (_req, res) => {
  res.json({
    weekNumber: getCurrentWeekNumber(),
    year: new Date().getFullYear()
  });
});

/**
 * POST /api/weekly-pack/config
 * Get weekly pack configuration (page list without generating images)
 */
router.post('/config', async (req, res) => {
  try {
    const { childName, age, theme } = req.body;

    if (!childName || !age || !theme) {
      return res.status(400).json({
        error: 'Missing required fields: childName, age, theme'
      });
    }

    const config = await generateWeeklyPackConfig(childName, age, theme);
    
    res.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error generating weekly pack config:', error);
    res.status(500).json({
      error: 'Failed to generate weekly pack config',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/weekly-pack/generate-pages
 * Generate all pages as images for the weekly pack
 */
router.post('/generate-pages', async (req, res) => {
  try {
    const { childName, age, theme } = req.body;

    if (!childName || !age || !theme) {
      return res.status(400).json({
        error: 'Missing required fields: childName, age, theme'
      });
    }

    console.log(`[WeeklyPack] Generating pages for ${childName}, age ${age}, theme ${theme}`);

    // 获取配置
    const config = await generateWeeklyPackConfig(childName, age, theme);
    
    // 初始化图片生成器
    await imageGenerator.initialize();
    
    // 生成每个页面的图片
    const generatedPages: Array<{
      order: number;
      type: string;
      title: string;
      imageUrl: string;
    }> = [];

    for (const page of config.pages) {
      try {
        let imageUrl = '';
        
        // 根据页面类型调用对应的数据生成器，再调用图片渲染器
        switch (page.type) {
          case 'cover':
            // 封面直接使用封面图片
            imageUrl = page.config.coverImage || '';
            break;
            
          case 'write-my-name': {
            const generator = literacyGenerators.get('write-my-name');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateWriteMyName({ content: data.content });
            }
            break;
          }
            
          case 'uppercase-tracing': {
            const generator = literacyGenerators.get('uppercase-tracing');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateUppercaseTracing(data.content);
            }
            break;
          }
            
          case 'lowercase-tracing': {
            const generator = literacyGenerators.get('lowercase-tracing');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateLowercaseTracing(data.content);
            }
            break;
          }
            
          case 'letter-recognition': {
            const generator = literacyGenerators.get('letter-recognition');
            if (generator) {
              const data = await generator(page.config);
              // data.content 包含完整的 cells 数组
              imageUrl = await imageGenerator.generateLetterRecognitionPage(data.content);
            }
            break;
          }
          
          case 'alphabet-sequencing': {
            const generator = literacyGenerators.get('alphabet-sequencing');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateAlphabetSequencing(data);
            }
            break;
          }
          
          case 'beginning-sounds': {
            const generator = literacyGenerators.get('beginning-sounds');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateBeginningSounds(data);
            }
            break;
          }
          
          case 'cvc-words': {
            const generator = literacyGenerators.get('cvc-words');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateCVCWordsPage(data);
            }
            break;
          }
          
          case 'match-upper-lower': {
            const generator = literacyGenerators.get('match-upper-lower');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateMatchUpperLower(data);
            }
            break;
          }
            
          case 'number-tracing': {
            const generator = mathGenerators.get('number-tracing');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateNumberTracingPage(data.content);
            } else {
              // fallback: 直接调用
              imageUrl = await imageGenerator.generateNumberTracingPage(page.config);
            }
            break;
          }
            
          case 'counting-objects': {
            const generator = mathGenerators.get('counting-objects');
            if (generator) {
              const data = await generator(page.config);
              // 传递完整的 data，让 imageGenerator 处理 difficulty
              imageUrl = await imageGenerator.generateCountAndWrite(data);
            }
            break;
          }
          
          case 'which-is-more': {
            const generator = mathGenerators.get('which-is-more');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateWhichIsMore(data);
            }
            break;
          }
          
          case 'number-bonds': {
            const generator = mathGenerators.get('number-bonds');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateNumberBonds(data);
            }
            break;
          }
          
          case 'ten-frame': {
            const generator = mathGenerators.get('ten-frame');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateTenFrame(data);
            }
            break;
          }
          
          case 'picture-addition': {
            const generator = mathGenerators.get('picture-addition');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generatePictureAddition(data);
            }
            break;
          }
          
          case 'count-shapes': {
            const generator = mathGenerators.get('count-shapes');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateCountShapes(data);
            }
            break;
          }
          
          case 'picture-subtraction': {
            const generator = mathGenerators.get('picture-subtraction');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generatePictureSubtraction(data);
            }
            break;
          }
          
          case 'number-sequencing': {
            const generator = mathGenerators.get('number-sequencing');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateNumberSequencing(data);
            }
            break;
          }
            
          case 'maze': {
            // 先生成迷宫图片数据，再渲染页面
            const generator = logicGenerators.get('maze');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateMazePage({ content: data.content });
            }
            break;
          }
            
          case 'pattern-sequencing': {
            const generator = logicGenerators.get('pattern-sequencing');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generatePatternSequencing(data.content);
            }
            break;
          }
          
          case 'logic-grid': {
            const generator = logicGenerators.get('logic-grid');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateLogicGrid(data.content);
            }
            break;
          }
          
          case 'odd-one-out': {
            const generator = logicGenerators.get('odd-one-out');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateOddOneOut(data.content);
            }
            break;
          }
          
          case 'matching-halves': {
            const generator = logicGenerators.get('matching-halves');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateMatchingHalves(data.content);
            }
            break;
          }
          
          case 'shape-synthesis': {
            const generator = logicGenerators.get('shape-synthesis');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateShapeSynthesis(data.content);
            }
            break;
          }
          
          case 'shadow-matching': {
            const generator = logicGenerators.get('shadow-matching');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateShadowMatching(data.content);
            }
            break;
          }
          
          case 'sorting': {
            const generator = logicGenerators.get('sorting');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateSortingPage(data.content);
            }
            break;
          }
          
          case 'pattern-compare': {
            const generator = logicGenerators.get('pattern-compare');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generatePatternComparePage(data.content);
            }
            break;
          }
            
          case 'number-path': {
            // 先生成连点成画数据（包含图片），再渲染页面
            const data = await generateConnectDotsData(page.config);
            imageUrl = await imageGenerator.generateConnectDots(data.content);
            break;
          }
            
          case 'coloring-page': {
            const generator = creativityGenerators.get('coloring-page');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateColoringPage(data.content);
            }
            break;
          }
            
          case 'creative-prompt': {
            const generator = creativityGenerators.get('creative-prompt');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateCreativePrompt(data.content);
            }
            break;
          }
          
          case 'trace-lines': {
            const generator = fineMotorGenerators.get('trace-lines');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateTraceLines(data.content);
            }
            break;
          }
          
          case 'shape-tracing': {
            const generator = fineMotorGenerators.get('shape-tracing');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateShapeTracing(data.content);
            }
            break;
          }
          
          case 'shape-path': {
            const generator = creativityGenerators.get('shape-path');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateShapePath(data);
            }
            break;
          }
          
          case 'trace-and-draw': {
            const generator = creativityGenerators.get('trace-and-draw');
            if (generator) {
              const data = await generator(page.config);
              imageUrl = await imageGenerator.generateTraceAndDraw(data);
            }
            break;
          }
            
          default:
            console.warn(`[WeeklyPack] Unknown page type: ${page.type}`);
            continue;
        }
        
        if (imageUrl) {
          generatedPages.push({
            order: page.order,
            type: page.type,
            title: page.title,
            imageUrl
          });
          console.log(`[WeeklyPack] Generated ${page.type}: ${imageUrl}`);
        }
      } catch (pageError) {
        console.error(`[WeeklyPack] Error generating ${page.type}:`, pageError);
        // 继续生成其他页面
      }
    }

    res.json({
      success: true,
      childName: config.childName,
      age: config.age,
      theme: config.theme,
      weekNumber: config.weekNumber,
      totalPages: generatedPages.length,
      pages: generatedPages
    });
  } catch (error) {
    console.error('Error generating weekly pack pages:', error);
    res.status(500).json({
      error: 'Failed to generate weekly pack pages',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/weekly-pack/save
 * Save a generated pack and return packId for sharing
 */
router.post('/save', async (req, res) => {
  try {
    const { childName, age, theme, weekNumber, pages, userId, source } = req.body;

    if (!childName || !age || !theme || !pages) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const packId = generatePackId();
    const packData: PackData = {
      packId,
      childName,
      age,
      theme,
      weekNumber: weekNumber || getCurrentWeekNumber(),
      pages,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      source: source || 'manual' // 默认为手动生成
    };

    // 保存到文件
    const filePath = path.join(PACKS_DIR, `${packId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(packData, null, 2));

    console.log(`[WeeklyPack] Saved pack ${packId} for ${childName}`);

    // 清理该用户的旧 packs，只保留最近 10 个
    if (userId) {
      cleanupUserPacks(userId);
    }

    res.json({
      success: true,
      packId,
      shareUrl: `/weekly-pack/preview/${packId}`
    });
  } catch (error) {
    console.error('Error saving pack:', error);
    res.status(500).json({
      error: 'Failed to save pack',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/weekly-pack/pack/:packId
 * Get a saved pack by packId
 */
router.get('/pack/:packId', async (req, res) => {
  try {
    const { packId } = req.params;

    if (!packId || packId.length !== 8) {
      return res.status(400).json({
        error: 'Invalid packId'
      });
    }

    const filePath = path.join(PACKS_DIR, `${packId}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Pack not found'
      });
    }

    const packData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as PackData;

    res.json({
      success: true,
      pack: packData
    });
  } catch (error) {
    console.error('Error getting pack:', error);
    res.status(500).json({
      error: 'Failed to get pack',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/weekly-pack/download-pdf
 * Download generated pages as a multi-page PDF
 * 使用和 imageGenerator 相同的 Puppeteer 方式
 */
router.post('/download-pdf', async (req, res) => {
  try {
    const { childName, pages } = req.body;

    if (!childName || !pages || !Array.isArray(pages) || pages.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: childName, pages'
      });
    }

    console.log(`[WeeklyPack] Generating PDF for ${childName} with ${pages.length} pages`);

    // 使用 Puppeteer 生成 PDF（和 imageGenerator 相同的方式）
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // 设置视口大小 - 和 imageGenerator 一致 (794x1123 是 A4 @ 96dpi)
    await page.setViewport({ width: 794, height: 1123 });

    // 构建 HTML - 每个图片一页
    const pagesHtml = pages.map((p: { imageUrl: string; title: string; order: number }, index: number) => {
      // 处理图片 URL
      let imageUrl = p.imageUrl;
      if (!imageUrl.startsWith('http')) {
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
        imageUrl = `${baseUrl}${imageUrl}`;
      }
      
      return `
        <div class="page" ${index < pages.length - 1 ? 'style="page-break-after: always;"' : ''}>
          <img src="${imageUrl}" alt="${p.title}" />
        </div>
      `;
    }).join('\n');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${childName}'s Weekly Pack</title>
        <style>
          @page {
            size: 794px 1123px;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            width: 794px;
            margin: 0;
            padding: 0;
            background: white;
          }
          .page {
            width: 794px;
            height: 1123px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            overflow: hidden;
          }
          .page img {
            width: 794px;
            height: 1123px;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
      </html>
    `;

    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 120000 // 2分钟超时
    });

    // 等待所有图片加载完成
    await page.evaluate(`
      (async () => {
        const images = Array.from(document.querySelectorAll('img'));
        await Promise.all(
          images
            .filter(img => !img.complete)
            .map(img => new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            }))
        );
      })()
    `);

    // 生成 PDF
    const pdfBuffer = await page.pdf({
      width: '794px',
      height: '1123px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await page.close();
    await browser.close();

    console.log(`[WeeklyPack] PDF generated successfully, size: ${(pdfBuffer.length / 1024 / 1024).toFixed(2)} MB`);

    // 设置响应头
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(childName)}_weekly_pack.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // 发送 PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      error: 'Failed to generate PDF',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

function getCurrentWeekNumber(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

/**
 * GET /api/weekly-pack/user-packs/:userId
 * Get all packs for a specific user
 */
router.get('/user-packs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing userId'
      });
    }

    // 读取所有 pack 文件
    const files = fs.readdirSync(PACKS_DIR).filter(f => f.endsWith('.json'));
    const userPacks: PackData[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(PACKS_DIR, file);
        const packData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as PackData;
        
        // 只返回该用户的 packs
        if (packData.createdBy === userId) {
          userPacks.push(packData);
        }
      } catch (e) {
        console.error(`Error reading pack file ${file}:`, e);
      }
    }

    // 按创建时间倒序排列
    userPacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      packs: userPacks
    });
  } catch (error) {
    console.error('Error getting user packs:', error);
    res.status(500).json({
      error: 'Failed to get user packs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
