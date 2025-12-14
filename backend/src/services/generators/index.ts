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
    ['write-my-name', generateWriteMyName],
    ['alphabet-sequencing', generateAlphabetSequencing],
    ['beginning-sounds', generateBeginningSounds],
    ['cvc-words', generateCVCWords],
    ['match-upper-lower', generateMatchUpperLower]
]);

// Alphabet Sequencing 生成器
async function generateAlphabetSequencing(config: any) {
    const { difficulty = 'easy', theme = 'dinosaur' } = config;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // 根据难度决定每行缺失的字母数量
    // easy: 固定1个, medium: 随机1-2个, hard: 固定2个
    const getMissingCount = (diff: string): number => {
        if (diff === 'easy') return 1;
        if (diff === 'medium') return Math.random() < 0.5 ? 1 : 2;
        if (diff === 'hard') return 2;
        return 1;
    };
    
    // 生成 5 行序列，每行 4 个字母
    const usedStarts: number[] = [];
    
    const makeRow = () => {
        // 每行独立计算缺失数量（medium难度时随机）
        const missing = getMissingCount(difficulty);
        
        // 随机选择起始位置（确保有 4 个连续字母，且不重复）
        const maxStart = alphabet.length - 4; // 0-22
        let startIdx: number;
        let attempts = 0;
        do {
            startIdx = Math.floor(Math.random() * (maxStart + 1));
            attempts++;
        } while (usedStarts.includes(startIdx) && attempts < 50);
        usedStarts.push(startIdx);
        
        const len = 4; // 每行 4 个字母
        const seq = alphabet.slice(startIdx, startIdx + len).split('');
        
        // 随机选择要隐藏的位置
        const positions = Array.from({ length: len }, (_, i) => i);
        // 打乱位置数组
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }
        const hiddenPositions = positions.slice(0, missing);
        
        const displaySeq = seq.map((c, i) => hiddenPositions.includes(i) ? null : c);
        const answers = hiddenPositions.map(pos => ({ position: pos, letter: seq[pos] }));
        
        return { 
            sequence: displaySeq, 
            answers,
            fullSequence: seq
        };
    };
    
    const rows = Array.from({ length: 5 }, makeRow);
    
    return {
        title: 'Alphabet Sequencing',
        type: 'alphabet-sequencing',
        content: {
            difficulty,
            theme,
            rows,
            instructions: 'Fill in the missing letters to complete the alphabet sequence.'
        }
    };
}

// Beginning Sounds 单词数据 - 每个字母对应的单词和图片
const BEGINNING_SOUNDS_WORDS: Record<string, { word: string; image: string }[]> = {
    'A': [
        { word: 'Apple', image: '/uploads/bigpng/Apple.png' },
        { word: 'Airplane', image: '/uploads/bigpng/Airplane.png' },
        { word: 'Ant', image: '/uploads/bigpng/Ant.png' }
    ],
    'B': [
        { word: 'Ball', image: '/uploads/bigpng/Ball.png' },
        { word: 'Banana', image: '/uploads/bigpng/Banana.png' },
        { word: 'Bee', image: '/uploads/bigpng/Bee.png' }
    ],
    'C': [
        { word: 'Cat', image: '/uploads/bigpng/Cat.png' },
        { word: 'Car', image: '/uploads/bigpng/Car.png' },
        { word: 'Cake', image: '/uploads/bigpng/Cake.png' }
    ],
    'D': [
        { word: 'Dog', image: '/uploads/bigpng/Dog.png' },
        { word: 'Duck', image: '/uploads/bigpng/Duck.png' },
        { word: 'Donut', image: '/uploads/bigpng/Donut.png' }
    ],
    'E': [
        { word: 'Egg', image: '/uploads/bigpng/Egg.png' },
        { word: 'Elephant', image: '/uploads/bigpng/Elephant.png' },
        { word: 'Envelope', image: '/uploads/bigpng/Envelope.png' }
    ],
    'F': [
        { word: 'Fish', image: '/uploads/bigpng/Fish.png' },
        { word: 'Flower', image: '/uploads/bigpng/Flower.png' },
        { word: 'Frog', image: '/uploads/bigpng/Frog.png' }
    ],
    'G': [
        { word: 'Gift', image: '/uploads/bigpng/Gift.png' },
        { word: 'Goat', image: '/uploads/bigpng/Goat.png' },
        { word: 'Grape', image: '/uploads/bigpng/Grape.png' }
    ],
    'H': [
        { word: 'Hat', image: '/uploads/bigpng/Hat.png' },
        { word: 'Horse', image: '/uploads/bigpng/Horse.png' },
        { word: 'House', image: '/uploads/bigpng/House.png' }
    ],
    'I': [
        { word: 'Ice Cream', image: '/uploads/bigpng/Ice Cream.png' },
        { word: 'Igloo', image: '/uploads/bigpng/Igloo.png' },
        { word: 'Insect', image: '/uploads/bigpng/Insect.png' }
    ],
    'J': [
        { word: 'Jam', image: '/uploads/bigpng/Jam.png' },
        { word: 'Jellyfish', image: '/uploads/bigpng/Jellyfish.png' },
        { word: 'Juice', image: '/uploads/bigpng/Juice.png' }
    ],
    'K': [
        { word: 'Key', image: '/uploads/bigpng/Key.png' },
        { word: 'Kite', image: '/uploads/bigpng/Kite.png' },
        { word: 'Koala', image: '/uploads/bigpng/Koala.png' }
    ],
    'L': [
        { word: 'Lamp', image: '/uploads/bigpng/Lamp.png' },
        { word: 'Leaf', image: '/uploads/bigpng/Leaf.png' },
        { word: 'Lion', image: '/uploads/bigpng/Lion.png' }
    ],
    'M': [
        { word: 'Milk', image: '/uploads/bigpng/Milk.png' },
        { word: 'Monkey', image: '/uploads/bigpng/Monkey.png' },
        { word: 'Moon', image: '/uploads/bigpng/Moon.png' }
    ],
    'N': [
        { word: 'Nest', image: '/uploads/bigpng/Nest.png' },
        { word: 'Net', image: '/uploads/bigpng/Net.png' },
        { word: 'Nose', image: '/uploads/bigpng/Nose.png' }
    ],
    'O': [
        { word: 'Octopus', image: '/uploads/bigpng/Octopus.png' },
        { word: 'Orange', image: '/uploads/bigpng/Orange.png' },
        { word: 'Owl', image: '/uploads/bigpng/Owl.png' }
    ],
    'P': [
        { word: 'Penguin', image: '/uploads/bigpng/Penguin.png' },
        { word: 'Pig', image: '/uploads/bigpng/Pig.png' },
        { word: 'Pizza', image: '/uploads/bigpng/Pizza.png' }
    ],
    'Q': [
        { word: 'Quail', image: '/uploads/bigpng/Quail.png' },
        { word: 'Queen', image: '/uploads/bigpng/Queen.png' },
        { word: 'Quilt', image: '/uploads/bigpng/Quilt.png' }
    ],
    'R': [
        { word: 'Rabbit', image: '/uploads/bigpng/Rabbit.png' },
        { word: 'Rainbow', image: '/uploads/bigpng/Rainbow.png' },
        { word: 'Robot', image: '/uploads/bigpng/Robot.png' }
    ],
    'S': [
        { word: 'Snake', image: '/uploads/bigpng/Snake.png' },
        { word: 'Star', image: '/uploads/bigpng/Star.png' },
        { word: 'Sun', image: '/uploads/bigpng/Sun.png' }
    ],
    'T': [
        { word: 'Train', image: '/uploads/bigpng/Train.png' },
        { word: 'Tree', image: '/uploads/bigpng/Tree.png' },
        { word: 'Turtle', image: '/uploads/bigpng/Turtle.png' }
    ],
    'U': [
        { word: 'Umbrella', image: '/uploads/bigpng/Umbrella.png' },
        { word: 'Unicorn', image: '/uploads/bigpng/Unicorn.png' }
    ],
    'V': [
        { word: 'Van', image: '/uploads/bigpng/Van.png' },
        { word: 'Vase', image: '/uploads/bigpng/Vase.png' }
    ],
    'W': [
        { word: 'Whale', image: '/uploads/bigpng/Whale.png' }
    ],
    'X': [
        { word: 'Xylophone', image: '/uploads/bigpng/Xylophone.png' }
    ],
    'Y': [
        { word: 'Yacht', image: '/uploads/bigpng/Yacht.png' },
        { word: 'Yak', image: '/uploads/bigpng/yak.png' },
        { word: 'Yarn', image: '/uploads/bigpng/yarn.png' }
    ],
    'Z': [
        { word: 'Zebra', image: '/uploads/bigpng/zebra.png' },
        { word: 'Zipper', image: '/uploads/bigpng/zipper.png' }
    ]
};

// 卡片背景颜色
const CARD_COLORS = [
    '#E3F2FD', // 浅蓝
    '#F3E5F5', // 浅紫
    '#FFF3E0', // 浅橙
    '#E8F5E9', // 浅绿
    '#FFF8E1', // 浅黄
    '#FCE4EC', // 浅粉
    '#E0F7FA', // 浅青
    '#FBE9E7', // 浅珊瑚
];

// Beginning Sounds 生成器 - 匹配图片和首字母（固定5个字母）
async function generateBeginningSounds(config: any) {
    const { letterSet = 'A-E', theme = 'dinosaur' } = config;
    
    const letterSets: Record<string, string[]> = {
        'A-E': ['A', 'B', 'C', 'D', 'E'],
        'F-J': ['F', 'G', 'H', 'I', 'J'],
        'K-O': ['K', 'L', 'M', 'N', 'O'],
        'P-T': ['P', 'Q', 'R', 'S', 'T'],
        'U-Z': ['U', 'V', 'W', 'X', 'Y', 'Z']
    };
    
    const letters = letterSets[letterSet] || letterSets['A-E'];
    
    // 为每个字母随机选择一个单词
    const items = letters.map((letter, index) => {
        const wordOptions = BEGINNING_SOUNDS_WORDS[letter] || [];
        const randomWord = wordOptions[Math.floor(Math.random() * wordOptions.length)] || { word: letter, image: '' };
        return {
            letter,
            word: randomWord.word,
            image: randomWord.image,
            color: CARD_COLORS[index % CARD_COLORS.length]
        };
    });
    
    // 打乱右侧图片顺序（用于匹配练习）
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    
    return {
        title: `Beginning Sounds: ${letterSet}`,
        type: 'beginning-sounds',
        content: {
            letterSet,
            letters,
            items,
            shuffledItems,
            theme,
            instructions: 'Match each picture to its beginning letter sound.'
        }
    };
}

// CVC Words 生成器 - 简单的 CVC 单词练习（随机混合词族）
async function generateCVCWords(config: any) {
    const { theme = 'dinosaur' } = config;
    
    const wordFamilies: Record<string, string[]> = {
        'at': ['cat', 'bat', 'hat', 'mat', 'rat', 'sat'],
        'an': ['can', 'man', 'fan', 'pan', 'ran', 'van'],
        'ap': ['cap', 'map', 'tap', 'nap', 'gap', 'lap'],
        'ig': ['big', 'pig', 'dig', 'fig', 'wig', 'jig'],
        'op': ['hop', 'top', 'mop', 'pop', 'cop', 'bop'],
        'ug': ['bug', 'mug', 'rug', 'hug', 'jug', 'tug']
    };
    
    // 随机选择一个词族
    const allFamilies = ['at', 'an', 'ap', 'ig', 'op', 'ug'];
    const wordFamily = allFamilies[Math.floor(Math.random() * allFamilies.length)];
    
    const words = wordFamilies[wordFamily] || wordFamilies['at'];
    // 随机选择 6 个单词
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, 6);
    
    return {
        title: `CVC Words: -${wordFamily}`,
        type: 'cvc-words',
        content: {
            wordFamily,
            words: selectedWords,
            theme,
            instructions: `Read and trace the -${wordFamily} words.`
        }
    };
}

// Match Uppercase & Lowercase 生成器（字母数量由 letterSet 决定）
async function generateMatchUpperLower(config: any) {
    const { letterSet = 'A-F', theme = 'dinosaur' } = config;
    
    const letterSets: Record<string, string[]> = {
        'A-F': ['A', 'B', 'C', 'D', 'E', 'F'],
        'G-L': ['G', 'H', 'I', 'J', 'K', 'L'],
        'M-R': ['M', 'N', 'O', 'P', 'Q', 'R'],
        'S-V': ['S', 'T', 'U', 'V'],
        'W-Z': ['W', 'X', 'Y', 'Z']
    };
    
    const letters = letterSets[letterSet] || letterSets['A-F'];
    
    // 生成大小写配对
    const pairs = letters.map(letter => ({
        uppercase: letter,
        lowercase: letter.toLowerCase()
    }));
    
    // 打乱小写字母的顺序用于匹配练习
    const shuffledLowercase = [...letters.map(l => l.toLowerCase())].sort(() => Math.random() - 0.5);
    
    return {
        title: `Match Letters: ${letterSet}`,
        type: 'match-upper-lower',
        content: {
            letterSet,
            pairs,
            uppercase: letters,
            lowercase: shuffledLowercase,
            theme,
            instructions: 'Draw a line to match each uppercase letter to its lowercase pair.'
        }
    };
}

export const mathGenerators = new Map<string, Function>([
    ['number-tracing', generateNumberTracing],
    ['counting-objects', generateCountAndWrite],
    ['number-path', generateConnectDots],
    ['which-is-more', generateWhichIsMore],
    ['number-bonds', generateNumberBonds],
    ['ten-frame', generateTenFrame],
    ['picture-addition', generatePictureAddition],
    ['count-shapes', generateCountShapes],
    ['picture-subtraction', generatePictureSubtraction],
    ['number-sequencing', generateNumberSequencing]
]);

// Ten Frame Counting 生成器（固定1-10范围）
async function generateTenFrame(config: any) {
    const { theme = 'dinosaur' } = config;
    
    return {
        title: 'Ten Frame Counting',
        type: 'ten-frame',
        content: { 
            theme,
            minNumber: 1,
            maxNumber: 10,
            doubleFrame: false
        }
    };
}

// Picture Addition 生成器
async function generatePictureAddition(config: any) {
    const { difficulty = 'easy', theme = 'dinosaur' } = config;
    
    // 根据难度决定数字范围
    const difficultyConfig: Record<string, { maxSum: number }> = {
        easy: { maxSum: 5 },
        medium: { maxSum: 10 },
        hard: { maxSum: 15 }
    };
    const config_ = difficultyConfig[difficulty] || difficultyConfig['easy'];
    
    return {
        title: 'Picture Addition',
        type: 'picture-addition',
        content: { 
            theme,
            difficulty,
            maxSum: config_.maxSum
        }
    };
}

// Count the Shapes 生成器
async function generateCountShapes(config: any) {
    const { theme = 'dinosaur' } = config;
    return {
        title: 'Count the Shapes',
        type: 'count-shapes',
        content: { theme }
    };
}

// Picture Subtraction 生成器 - 图片减法
async function generatePictureSubtraction(config: any) {
    const { difficulty = 'easy', theme = 'dinosaur' } = config;
    
    // 根据难度决定数字范围
    const difficultyConfig: Record<string, { maxMinuend: number }> = {
        easy: { maxMinuend: 5 },
        medium: { maxMinuend: 10 },
        hard: { maxMinuend: 15 }
    };
    const config_ = difficultyConfig[difficulty] || difficultyConfig['easy'];
    
    return {
        title: 'Picture Subtraction',
        type: 'picture-subtraction',
        content: { 
            theme,
            difficulty,
            maxMinuend: config_.maxMinuend
        }
    };
}

// Number Sequencing 生成器 - 数字序列（固定1-20范围）
async function generateNumberSequencing(config: any) {
    const { theme = 'dinosaur' } = config;
    
    return {
        title: 'Number Sequencing',
        type: 'number-sequencing',
        content: { 
            theme,
            maxNumber: 20,
            skipCount: false,
            skipBy: 1
        }
    };
}

// Which is More? 生成器 - 比较两组物体数量
async function generateWhichIsMore(config: any) {
    const { difficulty = 'easy', theme = 'dinosaur' } = config;
    
    // 根据难度决定数字范围
    const ranges: Record<string, { min: number; max: number }> = {
        easy: { min: 1, max: 5 },
        medium: { min: 1, max: 7 },
        hard: { min: 1, max: 10 }
    };
    const range = ranges[difficulty] || ranges['easy'];
    
    // 生成 6 道比较题
    const problems = Array.from({ length: 6 }, () => {
        const left = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        let right = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        // 确保两边不相等
        while (right === left) {
            right = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
        }
        return {
            left,
            right,
            answer: left > right ? 'left' : 'right'
        };
    });
    
    return {
        title: 'Which is More?',
        type: 'which-is-more',
        content: {
            difficulty,
            theme,
            problems,
            instructions: 'Circle the group that has more objects.'
        }
    };
}

// Number Bonds 生成器 - 凑10练习（固定为10）
async function generateNumberBonds(config: any) {
    const { theme = 'dinosaur' } = config;
    const target = 10;
    
    // 生成所有凑10的组合
    const bonds: { a: number; b: number }[] = [];
    for (let i = 0; i <= target; i++) {
        bonds.push({ a: i, b: target - i });
    }
    
    // 随机选择 8 个，并随机决定隐藏哪个数字
    const shuffled = [...bonds].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 8).map(bond => {
        const hideFirst = Math.random() > 0.5;
        return {
            ...bond,
            display: hideFirst ? { a: '_', b: bond.b } : { a: bond.a, b: '_' },
            answer: hideFirst ? bond.a : bond.b
        };
    });
    
    return {
        title: 'Number Bonds to 10',
        type: 'number-bonds',
        content: {
            theme,
            target,
            bonds: selected,
            instructions: 'Fill in the missing number to make 10.'
        }
    };
}

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
    const { theme = 'dinosaur', difficulty = 'easy', pageCount = 1 } = config;
    const makeItems = () => Array.from({ length: 8 }, () => ({ count: Math.floor(Math.random() * 6) + 1, theme }));
    return {
        title: 'Count and Write',
        type: 'counting-objects',
        content: Array.from({ length: Math.max(1, Math.min(5, parseInt(pageCount) || 1)) }, () => ({
            theme,
            difficulty,
            items: makeItems(),
            instructions: 'Count the objects and write the number!'
        }))
    };
}

export async function generateConnectDots(config: any) {
    const { pageCount = 1, theme = 'dinosaur', difficulty = 'easy', maxNumber } = config;
    
    // 根据难度决定点数
    const dotCounts: Record<string, number> = {
        easy: 10,
        medium: 20,
        hard: 30
    };
    const actualMaxNumber = maxNumber || dotCounts[difficulty] || DEFAULT_MAX_NUMBER;
    
    // 尝试生成点对点图片
    let dotsImageUrl = '';
    let characterName = '';  // 角色名字
    
    try {
        // 动态导入点对点服务
        const { processDotToDotFromTheme } = await import('./dotToDotService.js');
        const result = await processDotToDotFromTheme(theme, actualMaxNumber);
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
            maxNumber: actualMaxNumber,
            difficulty,
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
        content: { 
            theme,
            itemCount: 5
        }
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
            patternType: 'AB',
            rowCount
        }
    };
}

/**
 * Logic Grid 生成器
 * 固定 3x3 网格
 */
async function generateLogicGrid(config: any) {
    const { theme = 'dinosaur' } = config;
    
    const gridSize = 3;
    
    // 形状和颜色
    const shapes = ['circle', 'square', 'triangle'];
    const colors = ['#4A90D9', '#4CAF50', '#FF9800']; // 蓝、绿、橙
    
    // 生成一个有效的拉丁方阵
    const generateLatinSquare = (size: number) => {
        const grid: { shape: string; color: string }[][] = [];
        const shapeOrder = [...shapes].sort(() => Math.random() - 0.5);
        const colorOrder = [...colors].sort(() => Math.random() - 0.5);
        
        for (let row = 0; row < size; row++) {
            grid[row] = [];
            for (let col = 0; col < size; col++) {
                grid[row][col] = {
                    shape: shapeOrder[(row + col) % size],
                    color: colorOrder[(row + col * 2) % size]
                };
            }
        }
        return grid;
    };
    
    const grid = generateLatinSquare(gridSize);
    
    // 随机选择一个位置作为缺失项（通常选择右下角）
    const missingRow = gridSize - 1;
    const missingCol = gridSize - 1;
    const answer = { ...grid[missingRow][missingCol] };
    
    return {
        title: '3x3 Logic Grid',
        type: 'logic-grid',
        content: {
            theme,
            gridSize,
            grid,
            missingPosition: { row: missingRow, col: missingCol },
            answer,
            instructions: 'Complete the missing piece in the 3x3 grid.'
        }
    };
}

/**
 * Odd One Out 生成器
 * 每行显示 4 个物品，其中 3 个相同或相似，1 个不同，孩子需要找出不同的那个
 * 固定 4 行
 */
async function generateOddOneOut(config: any) {
    const { theme = 'dinosaur' } = config;
    
    // 预定义的物品组（每组包含相似物品和一个不同的）
    const itemGroups = [
        { similar: ['dog', 'dog', 'dog'], odd: 'cat', category: 'animals' },
        { similar: ['apple', 'apple', 'apple'], odd: 'orange', category: 'fruits' },
        { similar: ['car', 'car', 'car'], odd: 'airplane', category: 'vehicles' },
        { similar: ['soccer', 'soccer', 'soccer'], odd: 'basketball', category: 'sports' },
        { similar: ['flower', 'flower', 'flower'], odd: 'tree', category: 'plants' },
        { similar: ['sun', 'sun', 'sun'], odd: 'moon', category: 'sky' },
        { similar: ['fish', 'fish', 'fish'], odd: 'bird', category: 'animals' }
    ];
    
    const rowCount = 4;
    
    // 随机选择指定数量的组
    const shuffled = [...itemGroups].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, rowCount);
    
    // 为每组生成行数据，随机放置 odd 项的位置
    const rows = selected.map(group => {
        const items = [...group.similar, group.odd];
        // 打乱顺序
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        const oddIndex = items.indexOf(group.odd);
        return {
            items,
            oddIndex,
            category: group.category
        };
    });
    
    return {
        title: 'Odd One Out',
        type: 'odd-one-out',
        content: {
            theme,
            rows,
            instructions: 'Circle the one that is different.'
        }
    };
}

/**
 * Matching Halves 生成器
 * 左侧显示物品的左半部分，右侧显示打乱顺序的右半部分，孩子需要连线匹配
 * 固定 5 对
 */
async function generateMatchingHalves(config: any) {
    const { theme = 'dinosaur' } = config;
    
    // 可用于匹配的物品（需要有明显的左右两半）
    const allItems = ['apple', 'ball', 'heart', 'star', 'butterfly', 'flower', 'fish'];
    
    const pairCount = 5;
    
    // 随机选择指定数量的物品
    const shuffled = [...allItems].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, pairCount);
    
    // 生成左侧顺序（固定）和右侧顺序（打乱）
    const leftItems = selected.map((item, index) => ({ item, id: index }));
    const rightItems = [...leftItems].sort(() => Math.random() - 0.5);
    
    return {
        title: 'Matching Halves',
        type: 'matching-halves',
        content: {
            theme,
            leftItems,
            rightItems,
            instructions: 'Match the two halves to complete the picture.'
        }
    };
}

/**
 * Shape Synthesis 生成器
 * 提供一组基本形状，孩子可以用这些形状组合创造物体
 */
async function generateShapeSynthesis(config: any) {
    const { theme = 'dinosaur' } = config;
    
    // 可用的基本形状及其颜色
    const availableShapes = [
        { shape: 'circle', color: '#E53935' },      // 红色圆形
        { shape: 'triangle', color: '#1E88E5' },    // 蓝色三角形
        { shape: 'square', color: '#43A047' },      // 绿色正方形
        { shape: 'rectangle', color: '#FB8C00' },   // 橙色矩形
        { shape: 'semicircle', color: '#8E24AA' },  // 紫色半圆
        { shape: 'diamond', color: '#FDD835' },     // 黄色菱形
        { shape: 'oval', color: '#00ACC1' }         // 青色椭圆
    ];
    
    return {
        title: 'Shape Synthesis',
        type: 'shape-synthesis',
        content: {
            theme,
            shapes: availableShapes,
            instructions: 'Use these shapes to build an object. What can you make?'
        }
    };
}

/**
 * Shape Path 生成器 - 形状路径练习
 * 生成一个 5x5 的形状网格，孩子需要沿着特定形状从起点走到终点
 */
async function generateShapePath(config: any) {
    const { theme = 'dinosaur' } = config;
    
    // 形状类型：圆形、正方形、三角形
    const shapes = ['circle', 'square', 'triangle'];
    
    // 生成 5x6 的网格（5列6行）
    const grid: string[][] = [];
    for (let row = 0; row < 6; row++) {
        const rowShapes: string[] = [];
        for (let col = 0; col < 5; col++) {
            // 随机选择形状
            rowShapes.push(shapes[Math.floor(Math.random() * shapes.length)]);
        }
        grid.push(rowShapes);
    }
    
    // 生成路径（从左上角到右下角的蛇形路径）
    // 路径坐标数组
    const path: { row: number; col: number }[] = [];
    
    // 简单的蛇形路径生成
    let currentRow = 0;
    let currentCol = 0;
    let direction = 1; // 1 = 向右, -1 = 向左
    
    path.push({ row: currentRow, col: currentCol });
    
    while (currentRow < 5 || currentCol !== 4) {
        if (direction === 1 && currentCol < 4) {
            currentCol++;
        } else if (direction === -1 && currentCol > 0) {
            currentCol--;
        } else {
            currentRow++;
            direction *= -1;
        }
        if (currentRow < 6) {
            path.push({ row: currentRow, col: currentCol });
        }
        if (currentRow >= 5 && currentCol === 4) break;
    }
    
    return {
        title: 'Shape Path',
        type: 'shape-path',
        content: {
            theme,
            grid,
            path,
            instructions: 'Trace along the shapes from start to finish.'
        }
    };
}

export const logicGenerators = new Map<string, Function>([
    ['maze', generateMaze],
    ['shadow-matching', generateShadowMatching],
    ['sorting', generateSortingData],
    ['pattern-compare', generatePatternCompare],
    ['pattern-sequencing', generatePatternSequencing],
    ['logic-grid', generateLogicGrid],
    ['odd-one-out', generateOddOneOut],
    ['matching-halves', generateMatchingHalves],
    ['shape-synthesis', generateShapeSynthesis]
]);

// ==================== FINE MOTOR ====================
async function generateTraceLines(config: any) {
    const { theme = 'dinosaur' } = config;
    
    return {
        title: 'Trace Lines',
        type: 'trace-lines',
        content: { 
            theme, 
            lineType: 'mixed'
        }
    };
}

async function generateShapeTracing(config: any) {
    const { theme = 'dinosaur' } = config;
    
    // 固定基础形状
    const shapes = ['circle', 'square', 'triangle', 'rectangle'];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    return {
        title: 'Shape Tracing',
        type: 'shape-tracing',
        content: { 
            theme, 
            shape,
            shapes
        }
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
    ['creative-prompt', generateCreativePrompt],
    ['trace-and-draw', generateTraceAndDraw],
    ['shape-path', generateShapePath]
]);

// Trace and Draw 生成器
async function generateTraceAndDraw(config: any) {
    const { theme = 'dinosaur' } = config;
    return {
        title: 'Trace and Draw',
        type: 'trace-and-draw',
        content: { theme }
    };
}

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

