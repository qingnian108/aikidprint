/**
 * Pattern Compare（找不同）图片生成服务
 * 调用 Google Gemini API 生成找不同游戏图片
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Gemini API 配置
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';
const API_KEY = process.env.GOOGLE_API_KEY || '';

// Pattern Compare 主题提示词
const PATTERN_COMPARE_PROMPTS: Record<string, string> = {
    dinosaur: `Create a "Spot the Difference" illustration containing two stacked images (top and bottom). Both images should show the same cute dinosaur scene in a soft pastel children's illustration style. Scene: friendly dinosaurs (T-Rex, Triceratops, Stegosaurus, Brachiosaurus) playing in a grassy field with flowers, hills, bushes, and soft clouds. The bottom image must include exactly 10 subtle differences, such as missing spikes, changed dinosaur direction, missing flowers, color changes, or added/removed small objects. Do NOT add text, numbers, or borders. Aspect ratio 3:4 vertical.`,
    
    unicorn: `Create a "Spot the Difference" illustration containing two stacked images (top and bottom). Both images should show the same magical unicorn scene in a soft pastel fairytale style. Scene: cute unicorns with flowing rainbow manes standing on clouds, stars, rainbows, sparkles, and gentle sky elements. The bottom image must include exactly 10 subtle differences, such as missing stars, mane color changes, added sparkles, different hoof positions, or missing accessories. Do NOT add text, numbers, or borders. Aspect ratio 3:4 vertical.`,
    
    space: `Create a "Spot the Difference" illustration containing two stacked images (top and bottom). Both images should show the same outer-space scene in a cute pastel children's illustration style. Scene: smiling astronauts, rockets, planets, moons, comets, and floating stars. The bottom image must include exactly 10 subtle differences, such as missing stars, different planet colors, changed astronaut gestures, missing rocket fins, or small added objects. Do NOT add text, numbers, or borders. Aspect ratio 3:4 vertical.`,
    
    safari: `Create a "Spot the Difference" illustration containing two stacked images (top and bottom). Both images should show the same safari animal scene in a cute pastel children's illustration style. Scene: lions, giraffes, elephants, zebras, hippos, surrounded by grass, trees, and simple savanna elements. The bottom image must include exactly 10 subtle differences, such as missing stripes, ear direction changes, missing leaves, altered tail shape, or added/removed small objects. Do NOT add text, numbers, or borders. Aspect ratio 3:4 vertical.`,
    
    vehicles: `Create a "Spot the Difference" illustration containing two stacked images (top and bottom). Both images should show the same cute vehicle scene in a soft pastel children's illustration style. Scene: cars, buses, airplanes, trains, hot-air balloons, roads, clouds, and trees. The bottom image must include exactly 10 subtle differences, such as missing windows, changed wheel details, altered colors, missing clouds, or added/removed accessories. Do NOT add text, numbers, or borders. Aspect ratio 3:4 vertical.`,
    
    princess: `Create a "Spot the Difference" illustration containing two stacked images (top and bottom). Both images should show the same fairytale princess scene in a cute pastel illustration style. Scene: princess with dress, castle, crown, flowers, sparkles, butterflies, and gentle clouds. The bottom image must include exactly 10 subtle differences, such as missing jewels, changed dress details, missing butterflies, color variations, or small added/removed objects. Do NOT add text, numbers, or borders. Aspect ratio 3:4 vertical.`
};

// 主题别名映射
const THEME_ALIASES: Record<string, string> = {
    dinosaur: 'dinosaur',
    dino: 'dinosaur',
    unicorn: 'unicorn',
    space: 'space',
    astronaut: 'space',
    safari: 'safari',
    animals: 'safari',
    vehicles: 'vehicles',
    car: 'vehicles',
    princess: 'princess',
    ocean: 'dinosaur'  // ocean 暂时映射到 dinosaur
};

/**
 * 获取主题对应的提示词
 */
function getPromptForTheme(theme: string): string {
    const normalizedTheme = THEME_ALIASES[theme.toLowerCase()] || 'dinosaur';
    return PATTERN_COMPARE_PROMPTS[normalizedTheme] || PATTERN_COMPARE_PROMPTS.dinosaur;
}

/**
 * 调用 Google Gemini API 生成找不同图片
 */
export async function generatePatternCompareImage(theme: string): Promise<string | null> {
    if (!API_KEY) {
        console.error('[PatternCompare] GOOGLE_API_KEY 未设置');
        return null;
    }
    
    const prompt = getPromptForTheme(theme);
    const url = `${API_ENDPOINT}?key=${API_KEY}`;
    
    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],
        generationConfig: {
            responseModalities: ['IMAGE'],
            temperature: 0.4
        }
    };
    
    console.log(`[PatternCompare] 正在生成 ${theme} 主题的找不同图片...`);
    console.log(`[PatternCompare] Prompt: ${prompt.substring(0, 100)}...`);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[PatternCompare] API 错误: ${response.status} - ${errorText.substring(0, 200)}`);
            return null;
        }
        
        const data = await response.json() as any;
        
        // 检查响应
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            
            if (candidate.finishReason === 'SAFETY') {
                console.error('[PatternCompare] 图片被安全策略拦截');
                return null;
            }
            
            const inlineData = candidate.content?.parts?.[0]?.inlineData;
            if (inlineData?.data) {
                const timestamp = Date.now();
                const outputDir = path.join(__dirname, '../../../public/generated/pattern-compare');
                const imagePath = path.join(outputDir, `pattern_${theme}_${timestamp}.png`);
                
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                
                const imageBuffer = Buffer.from(inlineData.data, 'base64');
                fs.writeFileSync(imagePath, imageBuffer);
                
                console.log(`[PatternCompare] 图片已保存: ${imagePath}`);
                return `/generated/pattern-compare/pattern_${theme}_${timestamp}.png`;
            }
        }
        
        console.error('[PatternCompare] API 返回空结果');
        return null;
        
    } catch (error) {
        console.error(`[PatternCompare] 错误: ${error}`);
        return null;
    }
}

/**
 * 返回结果类型
 */
export interface PatternCompareResult {
    imageUrl: string;
    theme: string;
}

/**
 * 从主题生成找不同图片
 */
export async function processPatternCompareFromTheme(theme: string = 'dinosaur'): Promise<PatternCompareResult> {
    const normalizedTheme = THEME_ALIASES[theme.toLowerCase()] || 'dinosaur';
    
    // 调用 API 生成图片
    const imageUrl = await generatePatternCompareImage(normalizedTheme);
    
    if (!imageUrl) {
        throw new Error(`无法生成 ${theme} 主题的找不同图片`);
    }
    
    return {
        imageUrl,
        theme: normalizedTheme
    };
}
