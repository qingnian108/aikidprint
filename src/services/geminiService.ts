import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WorksheetConfig, GeneratedPage, GeneratedItem, WorksheetType, DifficultyLevel } from "../types";

// Validate and get API key from environment
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.');
}

const ai = new GoogleGenAI({ apiKey });

// Utility functions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry mechanism for API calls
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delayMs = baseDelay * Math.pow(2, i);
        console.warn(`Retry ${i + 1}/${maxRetries} after ${delayMs}ms...`);
        await delay(delayMs);
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
};

type AgeBand = '3-4' | '5-6' | '7-8';

// Age-banded high-frequency words for tracing (US/UK kids, English only)
const AGE_WORD_BANK: Record<AgeBand, string[]> = {
  '3-4': [
    'Cat','Dog','Mom','Dad','Sun','Moon','Star','Sky','Red','Blue','Green','Yellow','Pink','Ball','Car','Bus','Bike','Train','Book','Toy','Tree','Bird','Fish','Duck','Frog','Bear','Cow','Pig','Hen','Egg','Milk','Juice','Water','Cup','Bed','Chair','Table','Spoon','Fork','Rain','Snow','Wind','Flower','Grass','Leaf','Apple','Pear','Banana','Grape','Peach','Cookie','Cake','Candy','Happy','Smile','Run','Jump','Play','Sing','Hug','Love'
  ],
  '5-6': [
    'Tiger','Lion','Zebra','Monkey','Panda','Koala','Whale','Dolphin','Shark','Horse','Sheep','Rabbit','Squirrel','Planet','Rocket','Space','Galaxy','Comet','Moon','Saturn','Earth','Cloud','Storm','Rainbow','Forest','Mountain','River','Ocean','Beach','Island','Summer','Winter','Spring','Autumn','Garden','Flower','Leafy','Orange','Purple','Brown','Black','White','Teacher','School','Friend','Family','Sister','Brother','Pizza','Burger','Pasta','Sandwich','Salad','Cheese','Soccer','Tennis','Dance','Music','Story','Magic','Dream','Brave','Smart','Kind','Quiet','Loud','Train','Subway','Helicopter','Scooter','Truck','Tractor','Robot','Pumpkin','Holiday','Camp','Swim'
  ],
  '7-8': [
    'Adventure','Journey','Mystery','Courage','Justice','Clever','Science','Experiment','Battery','Electric','Magnet','Gravity','Planet','Galaxy','Asteroid','Nebula','Spaceship','Satellite','Astronaut','Castle','Kingdom','Village','Harbor','Ocean','Mountain','Valley','Prairie','Canyon','Desert','Jungle','Rainforest','Volcano','Earthquake','Thunder','Lightning','Hurricane','Compass','Map','Travel','Library','Chapter','Paragraph','Sentence','Grammar','Teacher','Student','Classroom','Homework','Station','Airport','Schedule','Harbor','Sailor','Captain','Wildlife','Habitat','Weather','Climate','Season','Harvest','Journey','Pilot','Engineer','Detective','History','Legend','Treasure','Discovery','Invention','Reptile','Mammal','Insect','Oxygen','Carbon','Recycle','Planetarium','Laboratory','Notebook','Project','Planetary','Research','Sketch','Artist','Painter','Musician','Orchestra','Theater','Poem'
  ],
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

const getAgeBand = (age: number): AgeBand => {
  if (age <= 4) return '3-4';
  if (age <= 6) return '5-6';
  return '7-8';
};

const difficultyToCount = (difficulty: DifficultyLevel): number => {
  switch (difficulty) {
    case DifficultyLevel.MEDIUM:
      return 6;
    case DifficultyLevel.HARD:
      return 8;
    case DifficultyLevel.EASY:
    default:
      return 4;
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

const buildTracingPages = (config: WorksheetConfig): GeneratedPage[] => {
  const { age, theme, difficulty, pageCount } = config;
  const ageBand = getAgeBand(age);
  const targetPerPage = difficultyToCount(difficulty);
  const totalNeeded = targetPerPage * pageCount;

  const ageWords = AGE_WORD_BANK[ageBand] || [];
  const shuffled = shuffle(ageWords);

  const pool: string[] = [];
  let i = 0;
  while (pool.length < totalNeeded && ageWords.length > 0) {
    pool.push(shuffled[i % shuffled.length]);
    i += 1;
    if (i % shuffled.length === 0) {
      // reshuffle on each wrap to avoid repetitive patterns
      shuffled.sort(() => Math.random() - 0.5);
    }
  }

  const finalPool = pool.slice(0, totalNeeded);
  const icon = THEME_ICON_MAP[theme] || '✏️';

  const pages: GeneratedPage[] = [];
  for (let pageIdx = 0; pageIdx < pageCount; pageIdx++) {
    const start = pageIdx * targetPerPage;
    const pageWords = finalPool.slice(start, start + targetPerPage);
    const items: GeneratedItem[] = pageWords.map((word, idx) => ({
      id: `trace-${pageIdx}-${idx}-${word.toLowerCase()}`,
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

// Schema for a single item on the worksheet (Math/Tracing)
const itemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "Unique ID for the item" },
    question: { type: Type.STRING, description: "The math problem (e.g. '5 + 3 ='). Keep it short." },
    text: { type: Type.STRING, description: "The text to trace (e.g. 'A' or 'Cat')" },
    icon: { type: Type.STRING, description: "A single emoji that matches the theme and content (e.g., 🦕 for dinosaurs, 🚀 for space, 🍎 for A). Used for visual counting or decoration." },
    answer: { type: Type.STRING, description: "The answer key value" }
  },
  required: ["id"]
};

// Schema for a full page (Math/Tracing)
const pageSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Fun title for the worksheet page" },
    instructions: { type: Type.STRING, description: "Simple instructions for the child" },
    items: {
      type: Type.ARRAY,
      items: itemSchema,
      description: "List of exactly 4 items for the page. No more, no less."
    }
  },
  required: ["title", "instructions", "items"]
};

// Schema for the API response (Math/Tracing)
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    pages: {
      type: Type.ARRAY,
      items: pageSchema,
      description: "Array of worksheet pages generated"
    }
  }
};

export const generateWorksheetContent = async (config: WorksheetConfig): Promise<GeneratedPage[]> => {
  const { age, type, theme, difficulty, pageCount } = config;

  try {
    // STRATEGY: Local word bank for Tracing (Alphabet & Tracing)
    if (type === WorksheetType.TRACING) {
      await delay(2000);
      return buildTracingPages(config);
    }

    // STRATEGY 1: Image Generation for Coloring Pages
    if (type === WorksheetType.COLORING) {
      const generatedPages: GeneratedPage[] = [];

      for (let i = 0; i < pageCount; i++) {
        // Prompt for the image model - ENHANCED FOR QUALITY & FIT
        const imagePrompt = `A high-quality black and white coloring page for kids. 
        Subject: ${theme}. 
        Style: Simple bold outlines, thick lines, white background. 
        Composition: The subject must be completely centered and fully visible within the frame. Do not cut off edges. Vertical portrait orientation.
        No shading, no grayscale, just clear line art.`;
        
        try {
          const response = await retryWithBackoff(async () => {
            return await ai.models.generateContent({
              model: 'gemini-3-pro-image-preview',
              contents: {
                parts: [{ text: imagePrompt }]
              }
            });
          });

          let imageUrl = "";
          // Extract image from response
          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
              }
            }
          }

          if (!imageUrl) {
            // Fallback if image gen fails
            console.warn(`No image generated for page ${i + 1}, using fallback`);
            imageUrl = `https://picsum.photos/seed/${theme}${i}/800/1000?grayscale`;
          }

          generatedPages.push({
            pageNumber: i + 1,
            title: `${theme} Coloring`,
            instructions: "Color the picture with your favorite colors!",
            type: WorksheetType.COLORING,
            theme: theme,
            items: [{
              id: `coloring-${i}`,
              imageUrl: imageUrl,
              text: `A scene about ${theme}`
            }]
          });
        } catch (error) {
          console.error(`Failed to generate coloring page ${i + 1}:`, error);
          throw new Error(`Failed to generate coloring page. Please try again.`);
        }
      }
      return generatedPages;
    } 
    
    // STRATEGY 2: Text/JSON Generation for Math
    else if (type === WorksheetType.MATH) {
      const systemInstruction = `You are an expert kindergarten teacher. 
      Create a printable worksheet for a ${age}-year-old child.
      Theme: "${theme}".
      
      Rules:
      1. Output strictly valid JSON matching the schema.
      2. Generate EXACTLY 4 items per page. This is crucial for layout.
      3. For Math: Generate simple problems suitable for age ${age}. ALWAYS provide a relevant emoji in the 'icon' field.
      4. Keep instructions very brief (max 1 sentence).
      `;

      const prompt = `Create a ${pageCount}-page ${difficulty} difficulty ${type} worksheet. Include ${age > 5 ? 'addition/subtraction' : 'counting'} problems.`;

      const response = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: prompt,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.7, 
          }
        });
      });

      const jsonText = response.text;
      if (!jsonText) throw new Error("No data returned from AI");

      const parsed = JSON.parse(jsonText);
      
      const pages: GeneratedPage[] = parsed.pages.map((p: any, index: number) => ({
        pageNumber: index + 1,
        title: p.title,
        instructions: p.instructions,
        items: p.items,
        type: type,
        theme: theme
      }));

      return pages;
    }
    
    // Fallback for unsupported types
    else {
      throw new Error(`Unsupported worksheet type: ${type}`);
    }

  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("Failed to generate worksheet. Please try again.");
  }
};
