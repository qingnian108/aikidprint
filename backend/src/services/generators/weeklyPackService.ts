/**
 * 每周作业包生成服务
 * 根据孩子年龄和主题生成个性化的每周学习内容
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 年龄配置：不同年龄段的难度和内容设置
const AGE_CONFIG: Record<string, {
  letterRange: string[];
  numberRange: string;
  difficulty: 'easy' | 'medium' | 'hard';  // 统一难度
  dotsCount: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
}> = {
  '2-3': {
    letterRange: ['A', 'B', 'C', 'D', 'E'],
    numberRange: '0-4',
    difficulty: 'easy',
    dotsCount: 10,
    includeUppercase: true,
    includeLowercase: false
  },
  '3-4': {
    letterRange: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    numberRange: '0-4',
    difficulty: 'easy',
    dotsCount: 15,
    includeUppercase: true,
    includeLowercase: true
  },
  '4-5': {
    letterRange: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
    numberRange: '0-4',
    difficulty: 'medium',
    dotsCount: 20,
    includeUppercase: true,
    includeLowercase: true
  },
  '5-6': {
    letterRange: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    numberRange: '5-9',
    difficulty: 'hard',
    dotsCount: 30,
    includeUppercase: true,
    includeLowercase: true
  }
};

// 主题列表
const THEMES = ['dinosaur', 'ocean', 'safari', 'space', 'unicorn', 'vehicles'];

/**
 * 获取当前周数（一年中的第几周）
 */
function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.ceil(diff / oneWeek);
}

/**
 * 根据周数获取本周的字母
 */
function getWeeklyLetter(weekNumber: number, letterRange: string[]): string {
  const index = (weekNumber - 1) % letterRange.length;
  return letterRange[index];
}

/**
 * 获取随机封面图片
 */
function getRandomCover(theme: string): string {
  const coverDir = path.join(__dirname, '../../../public/uploads/Cover', theme);
  
  if (!fs.existsSync(coverDir)) {
    console.warn(`[WeeklyPack] Cover directory not found: ${coverDir}`);
    return '';
  }
  
  const files = fs.readdirSync(coverDir).filter(f => f.endsWith('.png'));
  
  if (files.length === 0) {
    return '';
  }
  
  const randomFile = files[Math.floor(Math.random() * files.length)];
  return `/uploads/Cover/${theme}/${randomFile}`;
}

/**
 * 生成每周作业包的页面配置
 */
export interface WeeklyPackPage {
  order: number;
  type: string;
  category: string;
  title: string;
  config: Record<string, any>;
}

export interface WeeklyPackConfig {
  childName: string;
  age: string;
  theme: string;
  weekNumber: number;
  pages: WeeklyPackPage[];
  coverImage: string;
}

/**
 * 从数组中随机选择 n 个元素
 */
function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

/**
 * 获取随机字母组
 */
function getRandomLetterSet(): string {
  const sets = ['A-E', 'F-J', 'K-O', 'P-T', 'U-Z'];
  return sets[Math.floor(Math.random() * sets.length)];
}

/**
 * 获取随机字母组（大小写匹配用）
 */
function getRandomUpperLowerSet(): string {
  const sets = ['A-F', 'G-L', 'M-R', 'S-V', 'W-Z'];
  return sets[Math.floor(Math.random() * sets.length)];
}

/**
 * 生成每周作业包配置
 * 根据年龄智能选择页面，有难度的按难度，没难度的随机
 */
export async function generateWeeklyPackConfig(
  childName: string,
  age: string,
  theme: string
): Promise<WeeklyPackConfig> {
  const ageConfig = AGE_CONFIG[age] || AGE_CONFIG['3-4'];
  const weekNumber = getCurrentWeekNumber();
  const weeklyLetter = getWeeklyLetter(weekNumber, ageConfig.letterRange);
  const coverImage = getRandomCover(theme);
  
  const pages: WeeklyPackPage[] = [];
  let order = 1;
  
  // ========== 封面 ==========
  pages.push({
    order: order++,
    type: 'cover',
    category: 'cover',
    title: 'Cover Page',
    config: { theme, childName, weekNumber, coverImage }
  });
  
  // ========== Literacy 读写 (5-6页) ==========
  
  // 1. Write My Name - 必选
  pages.push({
    order: order++,
    type: 'write-my-name',
    category: 'literacy',
    title: 'Write My Name',
    config: { theme, name: childName }
  });
  
  // 2. 大写字母描红 - 必选
  pages.push({
    order: order++,
    type: 'uppercase-tracing',
    category: 'literacy',
    title: `Uppercase ${weeklyLetter} Tracing`,
    config: { letter: weeklyLetter, theme }
  });
  
  // 3. 小写字母描红 - 3岁以上
  if (ageConfig.includeLowercase) {
    pages.push({
      order: order++,
      type: 'lowercase-tracing',
      category: 'literacy',
      title: `Lowercase ${weeklyLetter.toLowerCase()} Tracing`,
      config: { letter: weeklyLetter.toLowerCase(), theme }
    });
  }
  
  // 4. 字母识别 - 有难度
  pages.push({
    order: order++,
    type: 'letter-recognition',
    category: 'literacy',
    title: `Find Letter ${weeklyLetter}`,
    config: { letter: weeklyLetter, theme, difficulty: ageConfig.difficulty }
  });
  
  // 5. 从剩余 Literacy 中随机选 1-2 个
  const optionalLiteracy = [
    { type: 'alphabet-sequencing', title: 'Alphabet Sequencing', hasDifficulty: true },
    { type: 'beginning-sounds', title: 'Beginning Sounds', hasDifficulty: false, letterSet: true },
    { type: 'cvc-words', title: 'CVC Words', hasDifficulty: false },
    { type: 'match-upper-lower', title: 'Match Uppercase & Lowercase', hasDifficulty: false, upperLowerSet: true }
  ];
  
  const selectedLiteracy = pickRandom(optionalLiteracy, age === '2-3' ? 1 : 2);
  for (const item of selectedLiteracy) {
    const config: Record<string, any> = { theme };
    if (item.hasDifficulty) config.difficulty = ageConfig.difficulty;
    if (item.letterSet) config.letterSet = getRandomLetterSet();
    if (item.upperLowerSet) config.letterSet = getRandomUpperLowerSet();
    
    pages.push({
      order: order++,
      type: item.type,
      category: 'literacy',
      title: item.title,
      config
    });
  }
  
  // ========== Math 数学 (5-6页) ==========
  
  // 1. 数字描红 - 必选
  pages.push({
    order: order++,
    type: 'number-tracing',
    category: 'math',
    title: 'Number Tracing',
    config: { range: ageConfig.numberRange, theme }
  });
  
  // 2. 数数练习 - 有难度
  pages.push({
    order: order++,
    type: 'counting-objects',
    category: 'math',
    title: 'Count and Write',
    config: { theme, difficulty: ageConfig.difficulty }
  });
  
  // 3. 从剩余 Math 中随机选 3-4 个
  const optionalMath = [
    { type: 'number-path', title: 'Number Path', hasDifficulty: false },
    { type: 'which-is-more', title: 'Which is More?', hasDifficulty: true },
    { type: 'ten-frame', title: 'Ten Frame Counting', hasDifficulty: false },
    { type: 'count-shapes', title: 'Count the Shapes', hasDifficulty: false },
    { type: 'number-sequencing', title: 'Number Sequencing', hasDifficulty: false }
  ];
  
  // 高年龄段增加加减法
  const advancedMath = [
    { type: 'picture-addition', title: 'Picture Addition', hasDifficulty: false, minAge: '3-4' },
    { type: 'picture-subtraction', title: 'Picture Subtraction', hasDifficulty: false, minAge: '4-5' },
    { type: 'number-bonds', title: 'Number Bonds', hasDifficulty: false, minAge: '4-5' }
  ];
  
  const availableMath = [...optionalMath];
  for (const item of advancedMath) {
    if (age === '4-5' || age === '5-6' || (item.minAge === '3-4' && age !== '2-3')) {
      availableMath.push(item);
    }
  }
  
  const selectedMath = pickRandom(availableMath, age === '2-3' ? 3 : 4);
  for (const item of selectedMath) {
    const config: Record<string, any> = { theme };
    if (item.hasDifficulty) config.difficulty = ageConfig.difficulty;
    
    pages.push({
      order: order++,
      type: item.type,
      category: 'math',
      title: item.title,
      config
    });
  }
  
  // ========== Logic 逻辑 (4-5页) ==========
  
  // 1. 迷宫 - 有难度，必选
  pages.push({
    order: order++,
    type: 'maze',
    category: 'logic',
    title: 'Maze',
    config: { theme, difficulty: ageConfig.difficulty }
  });
  
  // 2. 从剩余 Logic 中随机选 3-4 个
  const optionalLogic = [
    { type: 'shadow-matching', title: 'Shadow Matching', hasDifficulty: false },
    { type: 'sorting', title: 'Sorting', hasDifficulty: false },
    { type: 'pattern-compare', title: 'Pattern Compare', hasDifficulty: false },
    { type: 'pattern-sequencing', title: 'Pattern Sequencing', hasDifficulty: false },
    { type: 'odd-one-out', title: 'Odd One Out', hasDifficulty: false },
    { type: 'matching-halves', title: 'Matching Halves', hasDifficulty: false }
  ];
  
  const selectedLogic = pickRandom(optionalLogic, age === '2-3' ? 3 : 4);
  for (const item of selectedLogic) {
    const config: Record<string, any> = { theme };
    if (item.hasDifficulty) config.difficulty = ageConfig.difficulty;
    
    pages.push({
      order: order++,
      type: item.type,
      category: 'logic',
      title: item.title,
      config
    });
  }
  
  // ========== Creativity 创意 (4-5页) ==========
  
  // 1. 线条描红 - 必选
  pages.push({
    order: order++,
    type: 'trace-lines',
    category: 'creativity',
    title: 'Trace Lines',
    config: { theme }
  });
  
  // 2. 涂色页 - 必选
  pages.push({
    order: order++,
    type: 'coloring-page',
    category: 'creativity',
    title: 'Coloring Page',
    config: { theme }
  });
  
  // 3. 从剩余 Creativity 中随机选 2-3 个
  const optionalCreativity = [
    { type: 'shape-tracing', title: 'Shape Tracing', hasDifficulty: false },
    { type: 'creative-prompt', title: 'Creative Drawing', hasDifficulty: false, promptType: true },
    { type: 'trace-and-draw', title: 'Trace and Draw', hasDifficulty: false },
    { type: 'shape-path', title: 'Shape Path', hasDifficulty: false }
  ];
  
  // 高年龄段增加逻辑创意
  const advancedCreativity = [
    { type: 'logic-grid', title: 'Logic Grid', hasDifficulty: false, minAge: '4-5' },
    { type: 'shape-synthesis', title: 'Shape Synthesis', hasDifficulty: false, minAge: '3-4' }
  ];
  
  const availableCreativity = [...optionalCreativity];
  for (const item of advancedCreativity) {
    if (age === '4-5' || age === '5-6' || (item.minAge === '3-4' && age !== '2-3')) {
      availableCreativity.push(item);
    }
  }
  
  const selectedCreativity = pickRandom(availableCreativity, age === '2-3' ? 2 : 3);
  for (const item of selectedCreativity) {
    const config: Record<string, any> = { theme };
    if (item.hasDifficulty) config.difficulty = ageConfig.difficulty;
    if (item.promptType) config.promptType = Math.random() > 0.5 ? 'blank_sign' : 'halfbody';
    
    pages.push({
      order: order++,
      type: item.type,
      category: 'creativity',
      title: item.title,
      config
    });
  }
  
  return {
    childName,
    age,
    theme,
    weekNumber,
    pages,
    coverImage
  };
}

/**
 * 获取封面图片数量
 */
export function getCoverCount(theme: string): number {
  const coverDir = path.join(__dirname, '../../../public/uploads/Cover', theme);
  
  if (!fs.existsSync(coverDir)) {
    return 0;
  }
  
  return fs.readdirSync(coverDir).filter(f => f.endsWith('.png')).length;
}

export { THEMES, AGE_CONFIG, getCurrentWeekNumber };
