/**
 * Pattern Compare（找不同）图片生成服务
 * 调用 Gemini API 生成找不同游戏图片
 * API 失败时从本地缓存随机选取
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { generateGeminiImage } from '../geminiImageService.js';
import { cleanupFolder } from '../../utils/cacheManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 基础输出目录
const BASE_OUTPUT_DIR = path.join(__dirname, '../../../public/generated/pattern-compare');

// 所有支持的主题
const SUPPORTED_THEMES = ['dinosaur', 'unicorn', 'space', 'safari', 'vehicles', 'ocean'];

// Pattern Compare 主题提示词
const PATTERN_COMPARE_PROMPTS: Record<string, string> = {
    dinosaur: `Create a "Spot the Difference" game image. Draw the EXACT SAME cute dinosaur scene TWICE, stacked vertically. CRITICAL: Both images must be 99% IDENTICAL - same background color, same dinosaurs, same positions, same trees, same sky. Only make 5-8 SMALL changes in the bottom image: remove one small flower, change one dinosaur's spot color, add a tiny butterfly, remove a small cloud, change a leaf color. The scenes must look almost identical at first glance. Cute pastel children's illustration style. No text. IMPORTANT: rectangular image with sharp corners, no rounded edges, clean straight borders. Aspect ratio 3:4 vertical.`,
    
    unicorn: `Create a "Spot the Difference" game image. Draw the EXACT SAME magical unicorn scene TWICE, stacked vertically. CRITICAL: Both images must be 99% IDENTICAL - same background, same unicorns, same positions, same rainbow, same clouds. Only make 5-8 SMALL changes in the bottom image: remove one star, change a flower color, add a tiny sparkle, remove a small heart, change a cloud shape slightly. The scenes must look almost identical at first glance. Cute pastel fairytale style. No text. IMPORTANT: rectangular image with sharp corners, no rounded edges, clean straight borders. Aspect ratio 3:4 vertical.`,
    
    space: `Create a "Spot the Difference" game image. Draw the EXACT SAME outer space scene TWICE, stacked vertically. CRITICAL: Both images must be 99% IDENTICAL - same background, same planets, same rocket, same astronaut, same stars. Only make 5-8 SMALL changes in the bottom image: remove one small star, change a planet's ring color, add a tiny comet, remove a small moon, change a star color. The scenes must look almost identical at first glance. Cute pastel children's style. No text. IMPORTANT: rectangular image with sharp corners, no rounded edges, clean straight borders. Aspect ratio 3:4 vertical.`,
    
    safari: `Create a "Spot the Difference" game image. Draw the EXACT SAME safari animal scene TWICE, stacked vertically. CRITICAL: Both images must be 99% IDENTICAL - same background, same animals, same positions, same trees, same sky. Only make 5-8 SMALL changes in the bottom image: remove one small bird, change a giraffe spot, add a tiny flower, remove a small bush, change a cloud shape. The scenes must look almost identical at first glance. Cute pastel children's style. No text. IMPORTANT: rectangular image with sharp corners, no rounded edges, clean straight borders. Aspect ratio 3:4 vertical.`,
    
    vehicles: `Create a "Spot the Difference" game image. Draw the EXACT SAME cute vehicle scene TWICE, stacked vertically. CRITICAL: Both images must be 99% IDENTICAL - same background, same cars, same positions, same buildings, same sky. Only make 5-8 SMALL changes in the bottom image: remove one small cloud, change a wheel color, add a tiny bird, remove a small tree, change a window color. The scenes must look almost identical at first glance. Cute pastel children's style. No text. IMPORTANT: rectangular image with sharp corners, no rounded edges, clean straight borders. Aspect ratio 3:4 vertical.`,
    
    ocean: `Create a "Spot the Difference" game image. Draw the EXACT SAME underwater ocean scene TWICE, stacked vertically. CRITICAL: Both images must be 99% IDENTICAL - same background, same fish, same positions, same coral, same seaweed. Only make 5-8 SMALL changes in the bottom image: remove one small fish, change a coral color, add a tiny starfish, remove a small bubble, change a shell color. The scenes must look almost identical at first glance. Cute pastel children's illustration style. No text. IMPORTANT: rectangular image with sharp corners, no rounded edges, clean straight borders. Aspect ratio 3:4 vertical.`
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
    ocean: 'ocean',
    sea: 'ocean'
};


/**
 * 确保所有主题文件夹存在
 */
function ensureThemeFolders(): void {
    if (!fs.existsSync(BASE_OUTPUT_DIR)) {
        fs.mkdirSync(BASE_OUTPUT_DIR, { recursive: true });
    }
    for (const theme of SUPPORTED_THEMES) {
        const themeDir = path.join(BASE_OUTPUT_DIR, theme);
        if (!fs.existsSync(themeDir)) {
            fs.mkdirSync(themeDir, { recursive: true });
        }
    }
}

/**
 * 获取主题文件夹路径
 */
function getThemeDir(theme: string): string {
    return path.join(BASE_OUTPUT_DIR, theme);
}

/**
 * 从主题文件夹随机获取一张缓存图片
 */
function getRandomCachedImage(theme: string): string | null {
    const themeDir = getThemeDir(theme);
    
    if (!fs.existsSync(themeDir)) {
        return null;
    }
    
    const files = fs.readdirSync(themeDir).filter(f => 
        f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp')
    );
    
    if (files.length === 0) {
        return null;
    }
    
    const randomFile = files[Math.floor(Math.random() * files.length)];
    console.log(`[PatternCompare] 使用缓存图片: ${randomFile} (共 ${files.length} 张)`);
    
    return `/generated/pattern-compare/${theme}/${randomFile}`;
}

/**
 * 获取主题对应的提示词
 */
function getPromptForTheme(theme: string): string {
    const normalizedTheme = THEME_ALIASES[theme.toLowerCase()] || 'dinosaur';
    return PATTERN_COMPARE_PROMPTS[normalizedTheme] || PATTERN_COMPARE_PROMPTS.dinosaur;
}

/**
 * 调用 Gemini API 生成找不同图片
 */
export async function generatePatternCompareImage(theme: string): Promise<string | null> {
    // 确保文件夹结构存在
    ensureThemeFolders();
    
    const normalizedTheme = THEME_ALIASES[theme.toLowerCase()] || 'dinosaur';
    const prompt = getPromptForTheme(normalizedTheme);
    
    console.log(`[PatternCompare] 正在生成 ${normalizedTheme} 主题的找不同图片...`);
    
    try {
        const base64 = await generateGeminiImage(prompt, { temperature: 0.4 });

        const timestamp = Date.now();
        const themeDir = getThemeDir(normalizedTheme);
        const fileName = `pattern_${timestamp}.png`;
        const imagePath = path.join(themeDir, fileName);
        
        const imageBuffer = Buffer.from(base64, 'base64');
        fs.writeFileSync(imagePath, imageBuffer);
        
        console.log(`[PatternCompare] 图片已保存: ${imagePath}`);
        
        // 清理旧缓存，每个主题只保留最新 20 张
        cleanupFolder(themeDir, 20);
        
        return `/generated/pattern-compare/${normalizedTheme}/${fileName}`;
    } catch (error) {
        console.error(`[PatternCompare] API 调用失败: ${error}`);
        
        // 尝试从缓存获取
        const cachedImage = getRandomCachedImage(normalizedTheme);
        if (cachedImage) {
            console.log(`[PatternCompare] 回退到缓存图片`);
            return cachedImage;
        }
        
        console.error(`[PatternCompare] 无缓存可用`);
        return null;
    }
}

/**
 * 返回结果类型
 */
export interface PatternCompareResult {
    imageUrl: string;
    theme: string;
    fromCache?: boolean;
}

/**
 * 从主题生成找不同图片
 */
export async function processPatternCompareFromTheme(theme: string = 'dinosaur'): Promise<PatternCompareResult> {
    const normalizedTheme = THEME_ALIASES[theme.toLowerCase()] || 'dinosaur';
    
    // 调用 API 生成图片
    const imageUrl = await generatePatternCompareImage(normalizedTheme);
    
    if (!imageUrl) {
        throw new Error(`无法生成 ${theme} 主题的找不同图片，且无缓存可用`);
    }
    
    return {
        imageUrl,
        theme: normalizedTheme,
        fromCache: imageUrl.includes('pattern_') && !imageUrl.includes(String(Date.now()).slice(0, 8))
    };
}
