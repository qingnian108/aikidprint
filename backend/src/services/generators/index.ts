import { getRandomDecorImages, getThemeImages } from '../../utils/imageHelper.js';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_MAX_NUMBER = Math.max(10, Math.min(60, Number(process.env.DOTS_POINT_COUNT) || 20));

// ==================== MAPS ====================
export const literacyGenerators = new Map<string, Function>([
    ['uppercase-tracing', generateUppercaseTracing],
    ['lowercase-tracing', generateLowercaseTracing],
    ['letter-recognition', generateLetterRecognition],
    ['write-my-name', generateWriteMyName]
]);

export const mathGenerators = new Map<string, Function>([
    ['number-tracing', generateNumberTracing],
    ['counting-objects', generateCountAndWrite],
    ['number-path', generateConnectDots]
]);

// Coloring & Art category has been removed; no artGenerators are exposed.

// ==================== LITERACY ====================
async function generateLetterRecognition(config: any) {
    const {
        letter = 'A',
        difficulty = 'easy',
        pageCount = 1,
        theme = 'dinosaur'
    } = config;

    const upperLetter = String(letter || 'A').toUpperCase().charAt(0) || 'A';

    const diffConfig: Record<string, { grid: number; targetRatio: number }> = {
        easy: { grid: 5, targetRatio: 0.32 },
        medium: { grid: 6, targetRatio: 0.28 },
        hard: { grid: 7, targetRatio: 0.24 }
    };

    const base = diffConfig[difficulty] || diffConfig['medium'];
    const pages = Math.max(1, Math.min(5, parseInt(pageCount) || 1));

    const makePage = () => {
        const gridSize = base.grid;
        const totalCells = gridSize * gridSize;
        const targetCount = Math.max(1, Math.round(totalCells * base.targetRatio));
        const fillerCount = Math.max(0, totalCells - targetCount);

        const cells: string[] = [];
        for (let i = 0; i < targetCount; i++) {
            cells.push(upperLetter);
        }

        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < fillerCount; i++) {
            let ch = upperLetter;
            // choose a nearby-looking distractor, but not always identical
            const idx = alphabet.indexOf(upperLetter);
            const neighborIndexes = [idx - 1, idx + 1, idx + 2].filter(i2 => i2 >= 0 && i2 < alphabet.length);
            if (neighborIndexes.length && Math.random() < 0.7) {
                ch = alphabet[neighborIndexes[Math.floor(Math.random() * neighborIndexes.length)]];
            } else {
                const rand = Math.floor(Math.random() * alphabet.length);
                ch = alphabet[rand];
            }
            cells.push(ch);
        }

        // shuffle cells so targets are spread out
        for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cells[i], cells[j]] = [cells[j], cells[i]];
        }

        return {
            letter: upperLetter,
            difficulty,
            theme,
            gridSize,
            cells,
            instructions: `Circle all the letter ${upperLetter}s. Find them in the grid!`
        };
    };

    const content = pages > 1
        ? Array.from({ length: pages }, () => makePage())
        : makePage();

    return {
        title: `Find the Letter ${upperLetter}`,
        type: 'letter-recognition',
        content
    };
}

async function generateUppercaseTracing(config: any) {
    const { letter = 'A', theme = 'dinosaur' } = config;
    const upperLetter = letter.toUpperCase();
    return {
        title: `Uppercase ${upperLetter} Tracing`,
        type: 'uppercase-tracing',
        content: {
            letter: upperLetter,
            theme,
            instructions: `Practice writing the uppercase letter ${upperLetter}.`
        }
    };
}

async function generateLowercaseTracing(config: any) {
    const { letter = 'a', theme = 'dinosaur' } = config;
    const lowerLetter = letter.toLowerCase();
    return {
        title: `Lowercase ${lowerLetter} Tracing`,
        type: 'lowercase-tracing',
        content: {
            letter: lowerLetter,
            theme,
            instructions: `Practice writing the lowercase letter ${lowerLetter}.`
        }
    };
}

async function generateWriteMyName(config: any) {
    const { theme = 'dinosaur', name = 'LEO' } = config;
    return {
        title: 'Write My Name',
        type: 'write-my-name',
        content: { theme, name }
    };
}

// generateCustomName and generateLetterHunt have been removed (worksheets deprecated)

async function generateBeginningSounds(config: any) {
    const { set = 'A-E' } = config;
    const sets: Record<string, string[]> = {
        'A-E': ['A', 'B', 'C', 'D', 'E'],
        'F-J': ['F', 'G', 'H', 'I', 'J'],
        'K-O': ['K', 'L', 'M', 'N', 'O'],
        'P-T': ['P', 'Q', 'R', 'S', 'T'],
        'U-Z': ['U', 'V', 'W', 'X', 'Y', 'Z']
    };
    const letters = (sets[set] || sets['A-E']).slice(0, 5);
    return {
        title: `Match Letters: ${set}`,
        type: 'match-letters',
        content: {
            set,
            letters,
            instructions: 'Match each letter to the picture that starts with it!'
        }
    };
}

async function generateAlphabetOrder(config: any) {
    const { case: letterCase = 'uppercase', pageCount = 1 } = config;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const toCase = (ch: string) => (letterCase === 'lowercase' ? ch.toLowerCase() : ch);
    const makeSeq = () => {
        const maxStart = alphabet.length - 5;
        const startIdx = Math.floor(Math.random() * (maxStart + 1));
        const len = 3 + Math.floor(Math.random() * 3);
        const seq = alphabet.slice(startIdx, startIdx + len).split('');
        let missPos = seq.length > 2 ? 1 + Math.floor(Math.random() * (seq.length - 2)) : Math.floor(Math.random() * seq.length);
        const missingLetter = seq[missPos];
        const displaySeq = seq.map((c, i) => (i === missPos ? '_' : toCase(c)));
        return { sequence: displaySeq, missingLetter, missingIndex: missPos };
    };
    const makeRows = () => Array.from({ length: 5 }, makeSeq);
    const pages = Math.max(1, Math.min(5, parseInt(pageCount) || 1));
    return {
        title: 'Alphabet Order',
        type: 'alphabet-order',
        content: pages > 1
            ? Array.from({ length: pages }, () => ({ letterCase, rows: makeRows(), instructions: 'Fill in the missing letter for each sequence.' }))
            : { letterCase, rows: makeRows(), instructions: 'Fill in the missing letter for each sequence.' }
    };
}

async function generateCVCWords(config: any) {
    const { pageCount = 1 } = config;
    const pages = Math.max(1, Math.min(5, parseInt(pageCount) || 1));
    const pool = getRandomDecorImages(Math.max(60, pages * 6 + 10));
    // shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const used = new Set<string>();
    const pickPage = (pageIdx: number) => {
        const start = pageIdx * 6;
        const imgs = [];
        for (let i = 0; i < 6; i++) {
            const idx = start + i;
            imgs.push(pool[idx] || pool[idx % pool.length]);
        }
        return imgs.map(img => {
            const base = img.split('/').pop() || '';
            const raw = base.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').toLowerCase();
            let word = raw.replace(/\d+/g, '').trim() || 'word';
            let n = 1;
            while (used.has(word) && n < 50) {
                word = `${raw}-${n}`;
                n++;
            }
            used.add(word);
            return { word, image: img };
        });
    };
    return {
        title: 'CVC Words',
        type: 'cvc-words',
        content: pages > 1
            ? Array.from({ length: pages }, (_, i) => ({ words: pickPage(i), instructions: 'Trace the word and look at the picture.' }))
            : { words: pickPage(0), instructions: 'Trace the word and look at the picture.' }
    };
}

// ========== Logic (blank safe area, themed stickers) ==========
async function generateLogicBlank(config: any) {
    const { theme = 'dinosaur', title = 'Logic Page' } = config;
    return {
        title,
        type: 'logic-blank',
        content: { theme }
    };
}

// ==================== MATH ====================
async function generateCountAndWrite(config: any) {
    const { theme = 'dinosaur', pageCount = 1 } = config;
    const makeItems = () => Array.from({ length: 8 }, () => ({ count: Math.floor(Math.random() * 6) + 1, theme }));
    return {
        title: 'Count and Write',
        type: 'counting-objects',
        content: Array.from({ length: Math.max(1, Math.min(5, parseInt(pageCount) || 1)) }, () => ({
            theme,
            items: makeItems(),
            instructions: 'Count the objects and write the number!'
        }))
    };
}

export async function generateConnectDots(config: any) {
    const { pageCount = 1, theme = 'dinosaur', maxNumber = DEFAULT_MAX_NUMBER } = config;
    
    // 尝试生成点对点图片
    let dotsImageUrl = '';
    let characterName = '';  // 角色名字
    
    try {
        // 动态导入点对点服务
        const { processDotToDotFromTheme } = await import('./dotToDotService.js');
        const result = await processDotToDotFromTheme(theme, maxNumber);
        dotsImageUrl = result.dotsImageUrl;
        characterName = result.characterName;
        console.log(`[ConnectDots] 点对点图片生成成功: ${dotsImageUrl}`);
        console.log(`[ConnectDots] 角色名字: ${characterName}`);
    } catch (error) {
        console.error('[ConnectDots] 点对点图片生成失败:', error);
        // 失败时继续，canvas 会显示占位文字
    }

    const pages = Math.max(1, Math.min(10, parseInt(pageCount) || 1));
    return {
        title: 'Number Path',
        type: 'number-path',
        content: {
            maxNumber,
            theme,
            dotsImageUrl,
            characterName,  // 添加角色名字
            pageCount: pages
        }
    };
}

// ========== Logic stubs（固定版式，安全区留空） ==========
function buildLogicBlank(title: string, subtitle = '') {
    return (config: any) => {
        const { theme = 'dinosaur' } = config;
        return {
            title,
            type: 'logic-blank',
            content: { theme, title, subtitle }
        };
    };
}

/**
 * 生成迷宫图片，返回可公开访问的相对路径
 */
function generateMazeImage(difficulty: string = 'medium'): string | null {
    const allowed = ['easy', 'medium', 'hard'];
    const level = allowed.includes(difficulty) ? difficulty : 'medium';
    
    // 脚本路径：项目根目录的 scripts 文件夹
    const scriptPath = path.resolve(__dirname, '../../../../scripts/maze_generator.py');
    const outDir = path.resolve(__dirname, '../../../public/generated/mazes');
    const filename = `maze_${level}_${Date.now()}.svg`;
    const outPath = path.join(outDir, filename);

    console.log(`[Maze] Script path: ${scriptPath}`);
    console.log(`[Maze] Output path: ${outPath}`);

    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const pythonPath = process.env.PYTHON_PATH || 'E:\\python\\python.exe';
    const result = spawnSync(pythonPath, [scriptPath, '-d', level, '-o', outPath], { encoding: 'utf-8' });
    if (result.status !== 0) {
        console.error('[Maze] python generate error:', result.stderr || result.stdout);
        return null;
    }
    if (!fs.existsSync(outPath)) {
        console.error('[Maze] output not found:', outPath);
        return null;
    }
    return `/generated/mazes/${filename}`;
}

const generateMaze = async (config: any) => {
    const { theme = 'dinosaur', difficulty = 'medium' } = config || {};
    const mazeImageUrl = generateMazeImage(difficulty) || '';
    return {
        title: 'Maze',
        type: 'maze',
        content: { theme, difficulty, mazeImageUrl }
    };
};

async function generateShadowMatching(config: any) {
    const { theme = 'dinosaur' } = config || {};
    return {
        title: 'Shadow Matching',
        type: 'shadow-matching',
        content: { theme }
    };
}
// Sorting 使用专门的生成器
function generateSortingData(config: any) {
    const { theme = 'dinosaur' } = config;
    return {
        title: 'Sorting',
        type: 'sorting',
        content: { theme }
    };
}
// Pattern Compare 使用专门的生成器
async function generatePatternCompare(config: any) {
    const { theme = 'dinosaur' } = config;
    
    let patternImageUrl = '';
    
    try {
        // 动态导入 Pattern Compare 服务
        const { processPatternCompareFromTheme } = await import('./patternCompareService.js');
        const result = await processPatternCompareFromTheme(theme);
        patternImageUrl = result.imageUrl;
        console.log(`[PatternCompare] 图片生成成功: ${patternImageUrl}`);
    } catch (error) {
        console.error('[PatternCompare] 图片生成失败:', error);
        // 失败时继续，页面会显示占位内容
    }
    
    return {
        title: 'Pattern Compare',
        type: 'pattern-compare',
        content: { 
            theme,
            patternImageUrl
        }
    };
}
/**
 * 生成 Pattern Sequencing 数据
 * 每行展示一个重复的图案序列，孩子需要识别规律并在空白框中填入下一个图案
 */
async function generatePatternSequencing(config: any) {
    const { theme = 'dinosaur', rowCount = 4 } = config;
    return {
        title: 'Pattern Sequencing',
        type: 'pattern-sequencing',
        content: { 
            theme,
            rowCount
        }
    };
}

export const logicGenerators = new Map<string, Function>([
    ['maze', generateMaze],
    ['shadow-matching', generateShadowMatching],
    ['sorting', generateSortingData],
    ['pattern-compare', generatePatternCompare],
    ['pattern-sequencing', generatePatternSequencing]
]);

// ==================== FINE MOTOR ====================
async function generateTraceLines(config: any) {
    const { theme = 'dinosaur', lineType = 'straight' } = config;
    return {
        title: 'Trace Lines',
        type: 'trace-lines',
        content: { theme, lineType }
    };
}

async function generateShapeTracing(config: any) {
    const { theme = 'dinosaur', shape = 'circle' } = config;
    return {
        title: 'Shape Tracing',
        type: 'shape-tracing',
        content: { theme, shape }
    };
}

// ==================== CREATIVITY & MOTOR (合并) ====================
async function generateColoringPage(config: any) {
    const { theme = 'dinosaur' } = config;
    return {
        title: 'Coloring Page',
        type: 'coloring-page',
        content: { theme }
    };
}

async function generateCreativePrompt(config: any) {
    const { theme = 'dinosaur', promptType = 'blank_sign' } = config;
    return {
        title: 'Creative Prompt',
        type: 'creative-prompt',
        content: { theme, promptType }
    };
}

// 合并 Fine Motor 和 Creativity 到一个分类
export const creativityGenerators = new Map<string, Function>([
    ['trace-lines', generateTraceLines],
    ['shape-tracing', generateShapeTracing],
    ['coloring-page', generateColoringPage],
    ['creative-prompt', generateCreativePrompt]
]);

// 保留 fineMotorGenerators 以兼容旧代码（指向同一个 map）
export const fineMotorGenerators = creativityGenerators;

async function generatePatternCompletion(config: any) {
    const { pageCount = 1 } = config;
    const baseIcons = getRandomDecorImages(20);
    const makeSeq = () => {
        let icons = [...baseIcons];
        for (let i = icons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [icons[i], icons[j]] = [icons[j], icons[i]];
        }
        let idx = Math.floor(Math.random() * Math.max(1, icons.length));
        const next = () => icons[idx++ % icons.length];
        const len = 5;
        const a = next(), b = next();
        const isAABB = Math.random() < 0.5;
        let seq = isAABB ? [a, a, b, b, null] : [a, b, a, b, null];
        if (seq.length !== len) seq = seq.slice(0, len - 1).concat(null);
        return seq;
    };
    const makePage = () => ({
        rows: Array.from({ length: 7 }, makeSeq),
        instructions: 'Look at the pattern and fill in the missing shapes!'
    });
    const pages = Math.max(1, Math.min(5, parseInt(pageCount) || 1));
    return {
        title: 'Complete the Pattern',
        type: 'pattern-completion',
        content: pages > 1 ? Array.from({ length: pages }, makePage) : makePage()
    };
}

async function generateComparisonSkills(config: any) {
    const { pageCount = 1 } = config;
    const basePool = getRandomDecorImages(40);
    const makePage = (pageIndex: number) => {
        let pool = [...basePool];
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        let iconIdx = Math.floor(Math.random() * Math.max(1, pool.length));
        const nextIcon = () => pool[iconIdx++ % Math.max(1, pool.length)];
        const imageForMoreLess = nextIcon();
        const imageForSize = nextIcon();
        const seed = pageIndex * 7;
        let left = ((Math.floor(Math.random() * 5) + seed) % 5) + 2;
        let right = ((Math.floor(Math.random() * 5) + seed + 3) % 5) + 2;
        while (left === right) right = (right % 6) + 2;
        const moreLess = { variant: 'more-less', image: imageForMoreLess, leftCount: left, rightCount: right, prompt: 'Which side has more?' };
        const sizeItem = { variant: 'size', image: imageForSize, bigScale: 1.5, smallScale: 0.6, prompt: 'Circle the biggest one' };
        return { items: [moreLess, sizeItem], instructions: 'Compare size or quantity and choose the correct answer.' };
    };
    const pages = Math.max(1, Math.min(5, parseInt(pageCount) || 1));
    return {
        title: 'Comparison Skills',
        type: 'comparison-skills',
        content: pages > 1 ? Array.from({ length: pages }, (_, i) => makePage(i)) : makePage(0)
    };
}

async function generateNumberTracing(config: any) {
    const { range = '0-4', theme = 'dinosaur' } = config;
    const ranges: Record<string, number[]> = {
        '0-4': [0, 1, 2, 3, 4],
        '5-9': [5, 6, 7, 8, 9]
    };
    const numbers = ranges[range] || ranges['0-4'];

    const pages: number[][] = [];
    for (let i = 0; i < numbers.length; i += 5) {
        pages.push(numbers.slice(i, i + 5));
    }

    const rangeLabel = numbers.length > 0
        ? `${numbers[0]}–${numbers[numbers.length - 1]}`
        : range;

    const content = pages.map(nums => ({ numbers: nums, theme, range }));

    return {
        title: `Number Tracing ${rangeLabel}`,
        type: 'number-tracing',
        content: content.length > 1 ? content : content[0]
    };
}

async function generatePictureMath(config: any) {
    const { pageCount = 1 } = config;
    const pages = Math.max(1, Math.min(5, parseInt(pageCount) || 1));

    const makeProblems = () => Array.from({ length: 5 }, () => {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        return {
            a,
            b,
            operation: 'addition',
            emoji: '🍎'
        };
    });

    return {
        title: 'Picture Math',
        type: 'picture-math',
        content: pages > 1
            ? Array.from({ length: pages }, () => ({ problems: makeProblems() }))
            : { problems: makeProblems() }
    };
}

