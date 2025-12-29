import { WorksheetConfig, GeneratedPage, GeneratedItem, WorksheetType, DifficultyLevel } from "../types/types";
import { getApiUrl } from "../config/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type AgeBand = '3-4' | '5-6' | '7-8';

const AGE_WORD_BANK: Record<AgeBand, string[]> = {
  '3-4': ['Cat','Dog','Mom','Dad','Sun','Moon','Star','Sky','Red','Blue','Green','Yellow','Pink','Ball','Car','Bus','Bike','Train','Book','Toy','Tree','Bird','Fish','Duck','Frog','Bear','Cow','Pig','Hen','Egg','Milk','Juice','Water','Cup','Bed','Chair','Table','Spoon','Fork','Rain','Snow','Wind','Flower','Grass','Leaf','Apple','Pear','Banana','Grape','Peach','Cookie','Cake','Candy','Happy','Smile','Run','Jump','Play','Sing','Hug','Love'],
  '5-6': ['Tiger','Lion','Zebra','Monkey','Panda','Koala','Whale','Dolphin','Shark','Horse','Sheep','Rabbit','Squirrel','Planet','Rocket','Space','Galaxy','Comet','Moon','Saturn','Earth','Cloud','Storm','Rainbow','Forest','Mountain','River','Ocean','Beach','Island','Summer','Winter','Spring','Autumn','Garden','Flower','Leafy','Orange','Purple','Brown','Black','White','Teacher','School','Friend','Family','Sister','Brother','Pizza','Burger','Pasta','Sandwich','Salad','Cheese','Soccer','Tennis','Dance','Music','Story','Magic','Dream','Brave','Smart','Kind','Quiet','Loud','Train','Subway','Helicopter','Scooter','Truck','Tractor','Robot','Pumpkin','Holiday','Camp','Swim'],
  '7-8': ['Adventure','Journey','Mystery','Courage','Justice','Clever','Science','Experiment','Battery','Electric','Magnet','Gravity','Planet','Galaxy','Asteroid','Nebula','Spaceship','Satellite','Astronaut','Castle','Kingdom','Village','Harbor','Ocean','Mountain','Valley','Prairie','Canyon','Desert','Jungle','Rainforest','Volcano','Earthquake','Thunder','Lightning','Hurricane','Compass','Map','Travel','Library','Chapter','Paragraph','Sentence','Grammar','Teacher','Student','Classroom','Homework','Station','Airport','Schedule','Harbor','Sailor','Captain','Wildlife','Habitat','Weather','Climate','Season','Harvest','Journey','Pilot','Engineer','Detective','History','Legend','Treasure','Discovery','Invention','Reptile','Mammal','Insect','Oxygen','Carbon','Recycle','Planetarium','Laboratory','Notebook','Project','Planetary','Research','Sketch','Artist','Painter','Musician','Orchestra','Theater','Poem'],
};

const THEME_ICON_MAP: Record<string, string> = {
  'Dinosaurs': '🦖',
  'Space': '🚀',
  'Princesses': '👑',
  'Animals': '🐾',
  'Vehicles': '🚗',
  'Under the Sea': '🌊',
  'Superheroes': '🦸',
  'Unicorns': '🦄',
  'Seasons (Spring/Summer)': '☀️',
  'Farm Life': '🌾',
};


const THEME_EMOJIS: Record<string, string[]> = {
  'Dinosaurs': ['🦕', '🦖', '🥚', '🌿', '🌋'],
  'Space': ['🚀', '🌟', '🌙', '🪐', '👽'],
  'Princesses': ['👑', '🏰', '💎', '🌸', '✨'],
  'Animals': ['🐶', '🐱', '🐰', '🐻', '🦊'],
  'Vehicles': ['🚗', '🚌', '🚂', '✈️', '🚁'],
  'Under the Sea': ['🐠', '🐙', '🦀', '🐚', '🌊'],
  'Superheroes': ['🦸', '💪', '⚡', '🛡️', '🎭'],
  'Unicorns': ['🦄', '🌈', '⭐', '💖', '🎀'],
  'Seasons (Spring/Summer)': ['☀️', '🌻', '🦋', '🌺', '🍦'],
  'Farm Life': ['🐄', '🐷', '🐔', '🌾', '🚜'],
};

const getAgeBand = (age: number): AgeBand => {
  if (age <= 4) return '3-4';
  if (age <= 6) return '5-6';
  return '7-8';
};

const difficultyToCount = (difficulty: DifficultyLevel): number => {
  switch (difficulty) {
    case DifficultyLevel.MEDIUM: return 6;
    case DifficultyLevel.HARD: return 8;
    case DifficultyLevel.EASY:
    default: return 4;
  }
};

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};


// ==================== TRACING PAGES (Local) ====================
const buildTracingPages = (config: WorksheetConfig): GeneratedPage[] => {
  const { age, theme, difficulty, pageCount } = config;
  const ageBand = getAgeBand(age);
  const targetPerPage = difficultyToCount(difficulty);
  const totalNeeded = targetPerPage * pageCount;

  const ageWords = AGE_WORD_BANK[ageBand] || [];
  const shuffled = shuffle(ageWords);

  const pool: string[] = [];
  let idx = 0;
  while (pool.length < totalNeeded && ageWords.length > 0) {
    pool.push(shuffled[idx % shuffled.length]);
    idx += 1;
    if (idx % shuffled.length === 0) {
      shuffled.sort(() => Math.random() - 0.5);
    }
  }

  const finalPool = pool.slice(0, totalNeeded);
  const icon = THEME_ICON_MAP[theme] || '✏️';

  const pages: GeneratedPage[] = [];
  for (let pageIdx = 0; pageIdx < pageCount; pageIdx++) {
    const start = pageIdx * targetPerPage;
    const pageWords = finalPool.slice(start, start + targetPerPage);
    const items: GeneratedItem[] = pageWords.map((word, i) => ({
      id: `trace-${pageIdx}-${i}-${word.toLowerCase()}`,
      text: word,
      icon,
    }));

    pages.push({
      pageNumber: pageIdx + 1,
      title: `${theme} Tracing`,
      instructions: "Trace each word and say it out loud.",
      items,
      type: WorksheetType.TRACING,
      theme,
    });
  }

  return pages;
};


// ==================== MATH PAGES (Local Generation) ====================
const buildMathPages = (config: WorksheetConfig): GeneratedPage[] => {
  const { age, theme, difficulty, pageCount } = config;
  const itemsPerPage = difficultyToCount(difficulty);
  const themeEmojis = THEME_EMOJIS[theme] || ['⭐', '🔵', '🟢', '🔴', '🟡'];
  
  let maxNum = 5;
  if (age >= 5) maxNum = 10;
  if (age >= 7) maxNum = 20;
  if (difficulty === DifficultyLevel.MEDIUM) maxNum = Math.min(maxNum + 5, 20);
  if (difficulty === DifficultyLevel.HARD) maxNum = Math.min(maxNum + 10, 30);

  const useSubtraction = age >= 5;
  const pages: GeneratedPage[] = [];
  
  for (let pageIdx = 0; pageIdx < pageCount; pageIdx++) {
    const items: GeneratedItem[] = [];
    
    for (let i = 0; i < itemsPerPage; i++) {
      const emoji = themeEmojis[i % themeEmojis.length];
      let question: string;
      let answer: string;
      
      if (age <= 4) {
        const count = Math.floor(Math.random() * 5) + 1;
        question = `Count: ${emoji.repeat(count)}`;
        answer = count.toString();
      } else {
        const isSubtraction = useSubtraction && Math.random() > 0.5;
        
        if (isSubtraction) {
          const a = Math.floor(Math.random() * maxNum) + 1;
          const b = Math.floor(Math.random() * a) + 1;
          question = `${a} - ${b} = ?`;
          answer = (a - b).toString();
        } else {
          const a = Math.floor(Math.random() * (maxNum / 2)) + 1;
          const b = Math.floor(Math.random() * (maxNum / 2)) + 1;
          question = `${a} + ${b} = ?`;
          answer = (a + b).toString();
        }
      }
      
      items.push({
        id: `math-${pageIdx}-${i}`,
        question,
        answer,
        icon: emoji,
      });
    }
    
    pages.push({
      pageNumber: pageIdx + 1,
      title: `${theme} Math`,
      instructions: age <= 4 ? "Count the objects and write the number." : "Solve each problem.",
      items,
      type: WorksheetType.MATH,
      theme,
    });
  }
  
  return pages;
};


// ==================== COLORING PAGES (Backend API) ====================
const buildColoringPages = async (config: WorksheetConfig): Promise<GeneratedPage[]> => {
  const { theme, pageCount } = config;
  const pages: GeneratedPage[] = [];
  
  const themeMap: Record<string, string> = {
    'Dinosaurs': 'dinosaur',
    'Space': 'space',
    'Princesses': 'princess',
    'Animals': 'animal',
    'Vehicles': 'car',
    'Under the Sea': 'ocean',
    'Superheroes': 'superhero',
    'Unicorns': 'unicorn',
    'Seasons (Spring/Summer)': 'flower',
    'Farm Life': 'farm',
  };
  
  const backendTheme = themeMap[theme] || 'dinosaur';
  
  for (let i = 0; i < pageCount; i++) {
    try {
      const response = await fetch(getApiUrl('/api/worksheets/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: 'creativity',
          pageTypeId: 'coloring-page',
          config: { theme: backendTheme }
        })
      });
      
      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }
      
      const data = await response.json();
      const imageUrl = data.data?.imageUrl || data.imageUrl || data.url;
      
      pages.push({
        pageNumber: i + 1,
        title: `${theme} Coloring`,
        instructions: "Color the picture with your favorite colors!",
        type: WorksheetType.COLORING,
        theme,
        items: [{
          id: `coloring-${i}`,
          imageUrl: imageUrl,
          text: `A scene about ${theme}`
        }]
      });
    } catch (error) {
      console.error(`Failed to generate coloring page ${i + 1}:`, error);
      pages.push({
        pageNumber: i + 1,
        title: `${theme} Coloring`,
        instructions: "Color the picture with your favorite colors!",
        type: WorksheetType.COLORING,
        theme,
        items: [{
          id: `coloring-${i}`,
          imageUrl: `https://picsum.photos/seed/${theme}${i}/800/1000?grayscale`,
          text: `A scene about ${theme}`
        }]
      });
    }
  }
  
  return pages;
};


// ==================== MAIN EXPORT ====================
export const generateWorksheetContent = async (config: WorksheetConfig): Promise<GeneratedPage[]> => {
  const { type } = config;

  try {
    switch (type) {
      case WorksheetType.TRACING:
        await delay(500);
        return buildTracingPages(config);
        
      case WorksheetType.MATH:
        await delay(500);
        return buildMathPages(config);
        
      case WorksheetType.COLORING:
        return await buildColoringPages(config);
        
      default:
        throw new Error(`Unsupported worksheet type: ${type}`);
    }
  } catch (error) {
    console.error("Generation Error:", error);
    throw new Error("Failed to generate worksheet. Please try again.");
  }
};
