import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

// Custom Pack 数据存储目录
const CUSTOM_PACKS_DIR = path.join(__dirname, '../../data/custom-packs');

// 确保目录存在
if (!fs.existsSync(CUSTOM_PACKS_DIR)) {
  fs.mkdirSync(CUSTOM_PACKS_DIR, { recursive: true });
}

// 生成唯一 packId
function generatePackId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'cp_'; // custom pack 前缀
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Custom Pack 数据接口
interface CustomPackData {
  id: string;
  theme: string;
  selections: Record<string, number>;
  pages: Array<{
    order: number;
    type: string;
    title: string;
    imageUrl: string;
  }>;
  createdAt: string;
  userId?: string;
  totalPages: number;
}

// 页面类型标题映射
const pageTypeTitles: Record<string, string> = {
  'uppercase-tracing': 'Uppercase Letter Tracing',
  'lowercase-tracing': 'Lowercase Letter Tracing',
  'letter-recognition': 'Letter Recognition',
  'write-my-name': 'Write My Name',
  'alphabet-sequencing': 'Alphabet Sequencing',
  'beginning-sounds': 'Beginning Sounds',
  'cvc-words': 'CVC Words',
  'match-upper-lower': 'Match Upper & Lower',
  'number-tracing': 'Number Tracing',
  'counting-objects': 'Counting Objects',
  'number-path': 'Number Path',
  'which-is-more': 'Which is More?',
  'number-bonds': 'Number Bonds',
  'ten-frame': 'Ten Frame',
  'picture-addition': 'Picture Addition',
  'count-shapes': 'Count Shapes',
  'picture-subtraction': 'Picture Subtraction',
  'number-sequencing': 'Number Sequencing',
  'maze': 'Maze',
  'shadow-matching': 'Shadow Matching',
  'sorting': 'Sorting',
  'pattern-compare': 'Pattern Compare',
  'pattern-sequencing': 'Pattern Sequencing',
  'odd-one-out': 'Odd One Out',
  'matching-halves': 'Matching Halves',
  'logic-grid': 'Logic Grid',
  'shape-synthesis': 'Shape Synthesis',
  'trace-lines': 'Trace Lines',
  'shape-tracing': 'Shape Tracing',
  'coloring-page': 'Coloring Page',
  'creative-prompt': 'Creative Prompt',
  'trace-and-draw': 'Trace and Draw',
  'shape-path': 'Shape Path'
};

/**
 * POST /api/custom-pack/generate
 * Generate a custom pack based on user selections
 */
router.post('/generate', async (req, res) => {
  try {
    const { theme, selections, userId } = req.body;

    if (!theme || !selections || Object.keys(selections).length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: theme, selections'
      });
    }

    console.log(`[CustomPack] Generating pack with theme ${theme}, ${Object.keys(selections).length} types selected`);

    // 初始化图片生成器
    await imageGenerator.initialize();

    const generatedPages: Array<{
      order: number;
      type: string;
      title: string;
      imageUrl: string;
    }> = [];

    let pageOrder = 1;

    // 遍历所有选择的页面类型
    for (const [pageTypeId, count] of Object.entries(selections)) {
      if (typeof count !== 'number' || count <= 0) continue;

      const title = pageTypeTitles[pageTypeId] || pageTypeId;
      
      // 为每个类型生成指定数量的页面
      for (let i = 0; i < count; i++) {
        try {
          let imageUrl = '';
          const config = { theme, difficulty: 'medium' };

          // 根据页面类型生成
          switch (pageTypeId) {
            case 'uppercase-tracing': {
              const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
              const generator = literacyGenerators.get('uppercase-tracing');
              if (generator) {
                const data = await generator({ ...config, letter });
                imageUrl = await imageGenerator.generateUppercaseTracing(data.content);
              }
              break;
            }
            
            case 'lowercase-tracing': {
              const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
              const generator = literacyGenerators.get('lowercase-tracing');
              if (generator) {
                const data = await generator({ ...config, letter });
                imageUrl = await imageGenerator.generateLowercaseTracing(data.content);
              }
              break;
            }
            
            case 'letter-recognition': {
              const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
              const generator = literacyGenerators.get('letter-recognition');
              if (generator) {
                const data = await generator({ ...config, letter });
                imageUrl = await imageGenerator.generateLetterRecognitionPage(data.content);
              }
              break;
            }
            
            case 'write-my-name': {
              const generator = literacyGenerators.get('write-my-name');
              if (generator) {
                const data = await generator({ ...config, name: 'Name' });
                imageUrl = await imageGenerator.generateWriteMyName({ content: data.content });
              }
              break;
            }
            
            case 'alphabet-sequencing': {
              const generator = literacyGenerators.get('alphabet-sequencing');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateAlphabetSequencing(data);
              }
              break;
            }
            
            case 'beginning-sounds': {
              const generator = literacyGenerators.get('beginning-sounds');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateBeginningSounds(data);
              }
              break;
            }
            
            case 'cvc-words': {
              const generator = literacyGenerators.get('cvc-words');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateCVCWordsPage(data);
              }
              break;
            }
            
            case 'match-upper-lower': {
              const generator = literacyGenerators.get('match-upper-lower');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateMatchUpperLower(data);
              }
              break;
            }
            
            case 'number-tracing': {
              const generator = mathGenerators.get('number-tracing');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateNumberTracingPage(data.content);
              }
              break;
            }
            
            case 'counting-objects': {
              const generator = mathGenerators.get('counting-objects');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateCountAndWrite(data);
              }
              break;
            }
            
            case 'number-path': {
              const data = await generateConnectDotsData(config);
              imageUrl = await imageGenerator.generateConnectDots(data.content);
              break;
            }
            
            case 'which-is-more': {
              const generator = mathGenerators.get('which-is-more');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateWhichIsMore(data);
              }
              break;
            }
            
            case 'number-bonds': {
              const generator = mathGenerators.get('number-bonds');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateNumberBonds(data);
              }
              break;
            }
            
            case 'ten-frame': {
              const generator = mathGenerators.get('ten-frame');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateTenFrame(data);
              }
              break;
            }
            
            case 'picture-addition': {
              const generator = mathGenerators.get('picture-addition');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generatePictureAddition(data);
              }
              break;
            }
            
            case 'count-shapes': {
              const generator = mathGenerators.get('count-shapes');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateCountShapes(data);
              }
              break;
            }
            
            case 'picture-subtraction': {
              const generator = mathGenerators.get('picture-subtraction');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generatePictureSubtraction(data);
              }
              break;
            }
            
            case 'number-sequencing': {
              const generator = mathGenerators.get('number-sequencing');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateNumberSequencing(data);
              }
              break;
            }
            
            case 'maze': {
              const generator = logicGenerators.get('maze');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateMazePage({ content: data.content });
              }
              break;
            }
            
            case 'shadow-matching': {
              const generator = logicGenerators.get('shadow-matching');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateShadowMatching(data.content);
              }
              break;
            }
            
            case 'sorting': {
              const generator = logicGenerators.get('sorting');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateSortingPage(data.content);
              }
              break;
            }
            
            case 'pattern-compare': {
              const generator = logicGenerators.get('pattern-compare');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generatePatternComparePage(data.content);
              }
              break;
            }
            
            case 'pattern-sequencing': {
              const generator = logicGenerators.get('pattern-sequencing');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generatePatternSequencing(data.content);
              }
              break;
            }
            
            case 'odd-one-out': {
              const generator = logicGenerators.get('odd-one-out');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateOddOneOut(data.content);
              }
              break;
            }
            
            case 'matching-halves': {
              const generator = logicGenerators.get('matching-halves');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateMatchingHalves(data.content);
              }
              break;
            }
            
            case 'logic-grid': {
              const generator = logicGenerators.get('logic-grid');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateLogicGrid(data.content);
              }
              break;
            }
            
            case 'shape-synthesis': {
              const generator = logicGenerators.get('shape-synthesis');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateShapeSynthesis(data.content);
              }
              break;
            }
            
            case 'trace-lines': {
              const generator = fineMotorGenerators.get('trace-lines');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateTraceLines(data.content);
              }
              break;
            }
            
            case 'shape-tracing': {
              const generator = fineMotorGenerators.get('shape-tracing');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateShapeTracing(data.content);
              }
              break;
            }
            
            case 'coloring-page': {
              const generator = creativityGenerators.get('coloring-page');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateColoringPage(data.content);
              }
              break;
            }
            
            case 'creative-prompt': {
              const generator = creativityGenerators.get('creative-prompt');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateCreativePrompt(data.content);
              }
              break;
            }
            
            case 'trace-and-draw': {
              const generator = creativityGenerators.get('trace-and-draw');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateTraceAndDraw(data);
              }
              break;
            }
            
            case 'shape-path': {
              const generator = creativityGenerators.get('shape-path');
              if (generator) {
                const data = await generator(config);
                imageUrl = await imageGenerator.generateShapePath(data);
              }
              break;
            }
            
            default:
              console.warn(`[CustomPack] Unknown page type: ${pageTypeId}`);
              continue;
          }

          if (imageUrl) {
            generatedPages.push({
              order: pageOrder++,
              type: pageTypeId,
              title: `${title} ${count > 1 ? `#${i + 1}` : ''}`.trim(),
              imageUrl
            });
            console.log(`[CustomPack] Generated ${pageTypeId} #${i + 1}: ${imageUrl}`);
          }
        } catch (pageError) {
          console.error(`[CustomPack] Error generating ${pageTypeId}:`, pageError);
        }
      }
    }

    // 保存 pack 数据
    const packId = generatePackId();
    const packData: CustomPackData = {
      id: packId,
      theme,
      selections,
      pages: generatedPages,
      createdAt: new Date().toISOString(),
      userId,
      totalPages: generatedPages.length
    };

    const filePath = path.join(CUSTOM_PACKS_DIR, `${packId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(packData, null, 2));

    console.log(`[CustomPack] Saved pack ${packId} with ${generatedPages.length} pages`);

    res.json({
      success: true,
      packId,
      totalPages: generatedPages.length,
      pages: generatedPages
    });
  } catch (error) {
    console.error('Error generating custom pack:', error);
    res.status(500).json({
      error: 'Failed to generate custom pack',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/custom-pack/:packId
 * Get a saved custom pack by packId
 */
router.get('/:packId', async (req, res) => {
  try {
    const { packId } = req.params;

    if (!packId) {
      return res.status(400).json({
        error: 'Missing packId'
      });
    }

    const filePath = path.join(CUSTOM_PACKS_DIR, `${packId}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Pack not found'
      });
    }

    const packData = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CustomPackData;

    res.json({
      success: true,
      pack: packData
    });
  } catch (error) {
    console.error('Error getting custom pack:', error);
    res.status(500).json({
      error: 'Failed to get custom pack',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/custom-pack/save
 * Save a custom pack (for sharing)
 */
router.post('/save', async (req, res) => {
  try {
    const { theme, selections, pages, userId } = req.body;

    if (!theme || !selections || !pages) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const packId = generatePackId();
    const packData: CustomPackData = {
      id: packId,
      theme,
      selections,
      pages,
      createdAt: new Date().toISOString(),
      userId,
      totalPages: pages.length
    };

    const filePath = path.join(CUSTOM_PACKS_DIR, `${packId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(packData, null, 2));

    console.log(`[CustomPack] Saved pack ${packId}`);

    res.json({
      success: true,
      packId,
      shareUrl: `/custom-pack/preview/${packId}`
    });
  } catch (error) {
    console.error('Error saving custom pack:', error);
    res.status(500).json({
      error: 'Failed to save custom pack',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
