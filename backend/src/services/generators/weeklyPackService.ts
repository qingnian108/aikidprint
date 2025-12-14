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
 * 生成每周作业包配置
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
  
  // 1. 封面页（使用封面图片）
  pages.push({
    order: order++,
    type: 'cover',
    category: 'cover',
    title: 'Cover Page',
    config: {
      theme,
      childName,
      weekNumber,
      coverImage
    }
  });
  
  // 2. Write My Name - 个性化开场
  pages.push({
    order: order++,
    type: 'write-my-name',
    category: 'literacy',
    title: 'Write My Name',
    config: {
      theme,
      name: childName
    }
  });
  
  // 3. 大写字母描红
  if (ageConfig.includeUppercase) {
    pages.push({
      order: order++,
      type: 'uppercase-tracing',
      category: 'literacy',
      title: `Uppercase ${weeklyLetter} Tracing`,
      config: {
        letter: weeklyLetter,
        theme
      }
    });
  }
  
  // 4. 小写字母描红（3岁以上）
  if (ageConfig.includeLowercase) {
    pages.push({
      order: order++,
      type: 'lowercase-tracing',
      category: 'literacy',
      title: `Lowercase ${weeklyLetter.toLowerCase()} Tracing`,
      config: {
        letter: weeklyLetter.toLowerCase(),
        theme
      }
    });
  }
  
  // 5. 字母识别
  pages.push({
    order: order++,
    type: 'letter-recognition',
    category: 'literacy',
    title: `Find Letter ${weeklyLetter}`,
    config: {
      letter: weeklyLetter,
      theme,
      difficulty: ageConfig.difficulty
    }
  });
  
  // 6. 数字描红
  pages.push({
    order: order++,
    type: 'number-tracing',
    category: 'math',
    title: 'Number Tracing',
    config: {
      range: ageConfig.numberRange,
      theme
    }
  });
  
  // 7. 数数练习
  pages.push({
    order: order++,
    type: 'counting-objects',
    category: 'math',
    title: 'Count and Write',
    config: {
      theme,
      difficulty: ageConfig.difficulty
    }
  });
  
  // 8. 迷宫
  pages.push({
    order: order++,
    type: 'maze',
    category: 'logic',
    title: 'Maze',
    config: {
      theme,
      difficulty: ageConfig.difficulty
    }
  });
  
  // 9. 影子匹配
  pages.push({
    order: order++,
    type: 'shadow-matching',
    category: 'logic',
    title: 'Shadow Matching',
    config: {
      theme,
      difficulty: ageConfig.difficulty
    }
  });
  
  // 10. 分类练习
  pages.push({
    order: order++,
    type: 'sorting',
    category: 'logic',
    title: 'Sorting',
    config: {
      theme
    }
  });
  
  // 11. 图案排序
  pages.push({
    order: order++,
    type: 'pattern-sequencing',
    category: 'logic',
    title: 'Pattern Sequencing',
    config: {
      theme,
      difficulty: ageConfig.difficulty
    }
  });
  
  // 12. 连线数字 (Dot-to-Dot)
  pages.push({
    order: order++,
    type: 'number-path',
    category: 'math',
    title: 'Connect the Dots',
    config: {
      theme,
      difficulty: ageConfig.difficulty,
      maxNumber: ageConfig.dotsCount
    }
  });
  
  // 13. 线条描红
  pages.push({
    order: order++,
    type: 'trace-lines',
    category: 'creativity',
    title: 'Trace Lines',
    config: {
      theme,
      difficulty: ageConfig.difficulty
    }
  });
  
  // 14. 形状描红
  pages.push({
    order: order++,
    type: 'shape-tracing',
    category: 'creativity',
    title: 'Shape Tracing',
    config: {
      theme,
      difficulty: ageConfig.difficulty
    }
  });
  
  // 15. 涂色页
  pages.push({
    order: order++,
    type: 'coloring-page',
    category: 'creativity',
    title: 'Coloring Page',
    config: {
      theme
    }
  });
  
  // 16. 创意绘画
  pages.push({
    order: order++,
    type: 'creative-prompt',
    category: 'creativity',
    title: 'Creative Drawing',
    config: {
      theme,
      promptType: 'blank_sign'
    }
  });
  
  // 17. 图片加法 (3岁以上)
  if (age !== '2-3') {
    pages.push({
      order: order++,
      type: 'picture-addition',
      category: 'math',
      title: 'Picture Addition',
      config: {
        theme,
        difficulty: ageConfig.difficulty
      }
    });
  }
  
  // 18. 十框计数
  pages.push({
    order: order++,
    type: 'ten-frame',
    category: 'math',
    title: 'Ten Frame Counting',
    config: {
      theme,
      difficulty: ageConfig.difficulty
    }
  });
  
  // 19. 逻辑网格 (4岁以上)
  if (age === '4-5' || age === '5-6') {
    pages.push({
      order: order++,
      type: 'logic-grid',
      category: 'logic',
      title: 'Logic Grid',
      config: {
        theme,
        difficulty: ageConfig.difficulty
      }
    });
  }
  
  // 20. 找不同
  pages.push({
    order: order++,
    type: 'odd-one-out',
    category: 'logic',
    title: 'Odd One Out',
    config: {
      theme,
      difficulty: ageConfig.difficulty
    }
  });
  
  // 21. 匹配两半
  pages.push({
    order: order++,
    type: 'matching-halves',
    category: 'logic',
    title: 'Matching Halves',
    config: {
      theme,
      difficulty: ageConfig.difficulty
    }
  });
  
  // 22. 数字凑数 (4岁以上)
  if (age === '4-5' || age === '5-6') {
    pages.push({
      order: order++,
      type: 'number-bonds',
      category: 'math',
      title: 'Number Bonds',
      config: {
        theme,
        difficulty: ageConfig.difficulty
      }
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
