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
    dinosaur: `Create a "Spot the Difference" game image. Draw the EXACT SAME cute dinosaur scene TWICE, stacked vertically. CRITICAL: Both images must be 99% IDENTICAL - same background color, same dinosaurs, same positions, same trees, same sky. Only make 5-8 SMALL changes in the bottom image: remove one small flower, change one dinosaur's spot color, add a tiny butterfly, remove a small cloud, change a leaf color. The scenes must look almost identical at first glance. Cute pastel children's illustration style. No text, no borders. Aspect ratio 3:4 vertical.`,
    
    unicorn: `Create a "Spot the Difference" game image. Draw the EXACT SAME magical unicorn scene TWICE, stacked vertically. CRITICAL: Both images must be 99% IDENTICAL - same background, same unicorns, same positions, same rainbow, same clouds. Only make 5-8 SMALL changes in the bottom image: remove one star, change a flower color, add a tiny sparkle, remove a small heart, change a cloud shape slightly. The scenes must look almost identical at first glance. Cute pastel fairytale style. No text, no borders. Aspect ratio 3:4 vertical.`,
    
    space: `Create a "Spot the Difference" game image. Draw the EXACT SAME outer space scene TWICE, stacked vertically. CRITICAL: Both images must be 99% IDENTICAL - same background, same planets, same rocket, same astronaut, same stars. Only make 5-8 SMALL changes in the bottom image: remove one small star, change a planet's ring color, add a tiny comet, remove a small moon, change a star color. The scenes must look almost identical at first glance. Cute pastel children's style. No text, no borders. Aspect ratio 3:4 vertical.`,
    
    safari: `Create a "Spot the Difference" game image. Draw the EXACT SAME safari animal scene TWICE, stacked vertically. CRITICAL: Both images must be 99% IDENTICAL - same background, same animals, same positions, same trees, same sky. Only make 5-8 SMALL changes in the bottom image: remove one small bird, change a giraffe spot, add a tiny flower, remove a small bush, change a cloud shape. The scenes must look almost identical at first glance. Cute pastel children's style. No text, no borders. Aspect ratio 3:4 vertical.`,
    
    vehicles: `Create a "Spot the Difference" game image. Draw the EXACT SAME cute vehicle scene TWICE, stacked vertically. CRITICAL: Both images must be 99% IDENTICAL - same background, same cars, same positions, same buildings, same sky. Only make 5-8 SMALL changes in the bottom image: remove one small cloud, change a wheel color, add a tiny bird, remove a small tree, change a window color. The scenes must look almost identical at first glance. Cute pastel children's style. No text, no borders. Aspect ratio 3:4 vertical.`,
    
    princess: `Create a "Spot the Difference" game image. Draw the EXACT SAME fairytale princess scene TWICE, stacked vertically. CRITICAL: Both images must be 99% IDENTICAL - same background, same princess, same castle, same flowers, same sky. Only make 5-8 SMALL changes in the bottom image: remove one small butterfly, change a flower color, add a tiny star, remove a small jewel, change a cloud shape. The scenes must look almost identical at first glance. Cute pastel illustration style. No text, no borders. Aspect ratio 3:4 vertical.`
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
