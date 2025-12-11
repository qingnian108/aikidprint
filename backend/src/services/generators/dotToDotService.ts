/**
 * 点对点图片生成服务
 * 1. 调用 Google Gemini API 生成简笔画
 * 2. 使用 Python 脚本处理成点对点图
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Google Gemini API 配置（临时关闭，除非显式开启开关）
// 使用 Generative Language API 端点（支持 API Key 鉴权）
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';
const API_KEY = process.env.GOOGLE_API_KEY || '';
const USE_IMAGEN_API = process.env.DOTS_USE_API === 'true';
const DOTS_POINT_COUNT = Math.max(10, Math.min(60, Number(process.env.DOTS_POINT_COUNT) || 20));

// 固定万能模板（永远附加在提示词后面）
const FIXED_TEMPLATE = 'simple clean black outline illustration, coloring book style, no color, no shading, no gray, no fill, no textures, smooth bold outline, child-friendly cute proportions, pure white background, no text, no numbers, no symbols, no extra elements, no background decorations, vertical composition, aspect ratio 3:4';

// 主题变量库定义
interface ThemeVariables {
    var1: string[];  // 主要角色
    var2: string[];  // 姿势
    var3: string[];  // 情绪
    var4: string[];  // 动作（可选）
}

const THEME_VARIABLES: Record<string, ThemeVariables> = {
    dinosaur: {
        var1: ['baby T-Rex', 'baby Triceratops', 'baby Stegosaurus', 'baby Brontosaurus', 'baby Ankylosaurus', 'baby Pterodactyl', 'baby Parasaurolophus'],
        var2: ['standing', 'sitting', 'walking', 'running', 'jumping', 'lying down', 'waving', 'pointing', 'looking left', 'looking right'],
        var3: ['smiling happily', 'joyful expression', 'excited', 'friendly expression', 'delighted', 'cheerful mood'],
        var4: ['', 'raising one hand', 'holding a small leaf', 'holding a star (outline only)', 'reading a book', 'arms open wide']
    },
    unicorn: {
        var1: ['cute baby unicorn standing', 'baby unicorn sitting', 'baby unicorn flying with tiny wings', 'unicorn head (side view)'],
        var2: ['standing', 'sitting', 'trotting', 'jumping', 'flying', 'prancing'],
        var3: ['smiling gently', 'joyful expression', 'dreamy expression', 'excited', 'cheerful mood'],
        var4: ['', 'raising one hoof', 'waving its tail', 'holding a magic wand (outline only)', 'touching its mane', 'eyes closed peacefully']
    },
    vehicles: {
        var1: ['cute small car (side view)', 'cartoon truck', 'cartoon bus', 'cartoon train engine', 'cartoon airplane', 'cute helicopter', 'cute boat'],
        var2: ['driving forward (side view)', 'slightly tilted upward', 'flying upward', 'landing pose', 'taking off pose'],
        var3: ['cheerful vibe', 'friendly style', 'happy playful energy'],
        var4: ['', 'with simple motion lines', 'propellers spinning (outline only)', 'wheels turning']
    },
    ocean: {
        var1: ['baby whale', 'baby dolphin', 'baby sea turtle', 'baby seahorse', 'baby octopus', 'baby crab'],
        var2: ['swimming forward', 'happily jumping', 'waving fin/arm', 'floating gently', 'looking upward', 'turning slightly'],
        var3: ['smiling happily', 'cheerful mood', 'excited expression', 'friendly expression', 'joyful'],
        var4: ['', 'blowing bubbles (outline only)', 'waving a fin', 'holding a tiny starfish (outline only)', 'arms open']
    },
    space: {
        var1: ['cute astronaut', 'cartoon rocket', 'cartoon UFO', 'planet with rings', 'cute robot'],
        var2: ['standing', 'floating', 'flying upward', 'hovering', 'orbiting', 'waving'],
        var3: ['excited', 'happy expression', 'smiling', 'cheerful'],
        var4: ['', 'astronaut holding a small flag', 'astronaut waving', 'rocket firing (outline only)', 'UFO blinking lights (outline only)']
    },
    safari: {
        var1: ['baby lion', 'baby giraffe', 'baby elephant', 'baby zebra', 'baby hippo', 'baby monkey'],
        var2: ['sitting', 'standing', 'walking', 'running', 'waving', 'looking sideways'],
        var3: ['smiling happily', 'friendly expression', 'cheerful', 'excited', 'playful mood'],
        var4: ['', 'holding a leaf', 'tail wagging', 'waving one hand', 'touching its face']
    }
};

// 主题别名映射（兼容旧的主题名称）
const THEME_ALIASES: Record<string, string> = {
    dinosaur: 'dinosaur',
    dino: 'dinosaur',
    unicorn: 'unicorn',
    vehicles: 'vehicles',
    car: 'vehicles',
    truck: 'vehicles',
    ocean: 'ocean',
    sea: 'ocean',
    space: 'space',
    astronaut: 'space',
    rocket: 'space',
    safari: 'safari',
    lion: 'safari',
    elephant: 'safari',
    giraffe: 'safari',
    animals: 'safari'
};

/**
 * 从数组中随机选择一个元素
 */
function randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 提取角色的简短名字（用于显示）
 * 例如: "baby T-Rex" -> "T-Rex", "cute small car (side view)" -> "Car"
 */
function extractCharacterName(character: string): string {
    // 移除 "baby", "cute", "cartoon" 等前缀
    let name = character
        .replace(/^(baby|cute|cartoon)\s+/gi, '')
        .replace(/\s*\(.*?\)\s*/g, '')  // 移除括号内容
        .trim();
    
    // 首字母大写
    name = name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    
    return name;
}

/**
 * 根据主题生成动态提示词
 * 返回 { prompt, characterName }
 */
function generatePrompt(theme: string): { prompt: string; characterName: string } {
    // 解析主题别名
    const normalizedTheme = THEME_ALIASES[theme.toLowerCase()] || 'dinosaur';
    const variables = THEME_VARIABLES[normalizedTheme];
    
    if (!variables) {
        // 默认使用恐龙主题
        return generatePrompt('dinosaur');
    }
    
    // 随机选择变量
    const character = randomPick(variables.var1);
    const pose = randomPick(variables.var2);
    const emotion = randomPick(variables.var3);
    const action = randomPick(variables.var4);
    
    // 提取角色名字
    const characterName = extractCharacterName(character);
    
    // 组合角色描述
    let description = `${character} ${pose}, ${emotion}`;
    if (action) {
        description += `, ${action}`;
    }
    
    // 拼接固定模板
    const fullPrompt = `${description}, ${FIXED_TEMPLATE}`;
    
    console.log(`[Prompt] Generated: ${description}`);
    console.log(`[Prompt] Character name: ${characterName}`);
    
    return { prompt: fullPrompt, characterName };
}

// 主题列表（用于从 A_main_assets 目录获取线稿）
const VALID_THEMES = ['dinosaur', 'ocean', 'safari', 'space', 'unicorn', 'vehicles'];

// 备用：主题对应的本地图片目录（旧的 bigpng 目录，作为最后备用）
const THEME_IMAGE_DIRS: Record<string, string> = {
    dinosaur: 'Wild Animals',
    animals: 'Wild Animals',
    pets: 'Pets',
    farm: 'Farm Animals',
    ocean: 'Ocean Animals',
    vehicles: 'Transportation',
    food: 'Food',
    fruits: 'Fruits',
    nature: 'Nature',
};

/**
 * 调用 Google Gemini API 生成图片
 * 返回 { imagePath, characterName } 或 null
 */
async function generateImageWithGemini(theme: string): Promise<{ imagePath: string; characterName: string } | null> {
    // 直接调用 API，不再检查 USE_IMAGEN_API 开关
    if (!API_KEY) {
        console.log('[Imagen] Skipped (no API key configured)');
        return null;
    }
    const { prompt, characterName } = generatePrompt(theme);
    const url = `${API_ENDPOINT}?key=${API_KEY}`;
    
    // Gemini 2.5 Flash Image API 格式
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
    
    console.log(`[Imagen] Calling Google Gemini API...`);
    console.log(`[Imagen] Theme: ${theme}`);
    console.log(`[Imagen] Prompt: ${prompt.substring(0, 100)}...`);
    
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
            console.error(`[Imagen] API error: ${response.status} - ${errorText.substring(0, 200)}`);
            return null;
        }
        
        const data = await response.json() as any;
        
        // Imagen 3 响应格式
        if (!data.predictions || data.predictions.length === 0) {
            // 尝试 Gemini 格式
            if (data.candidates && data.candidates.length > 0) {
                const candidate = data.candidates[0];
                if (candidate.finishReason === 'SAFETY') {
                    console.error('[Imagen] Blocked by safety filter');
                    return null;
                }
                const inlineData = candidate.content?.parts?.[0]?.inlineData;
                if (inlineData?.data) {
                    const timestamp = Date.now();
                    // 简笔画存到 sketches 文件夹
                    const outputDir = path.join(__dirname, '../../../public/generated/sketches');
                    const imagePath = path.join(outputDir, `sketch_${timestamp}.png`);
                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true });
                    }
                    const imageBuffer = Buffer.from(inlineData.data, 'base64');
                    fs.writeFileSync(imagePath, imageBuffer);
                    console.log(`[Imagen] Sketch saved: ${imagePath}`);
                    return { imagePath, characterName };
                }
            }
            console.error('[Imagen] Empty response');
            return null;
        }
        
        // Imagen 3 格式
        const prediction = data.predictions[0];
        const imageData = prediction.bytesBase64Encoded;
        if (!imageData) {
            console.error('[Imagen] No image data in response');
            return null;
        }
        
        // 简笔画存到 sketches 文件夹
        const timestamp = Date.now();
        const outputDir = path.join(__dirname, '../../../public/generated/sketches');
        const imagePath = path.join(outputDir, `sketch_${timestamp}.png`);
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const imageBuffer = Buffer.from(imageData, 'base64');
        fs.writeFileSync(imagePath, imageBuffer);
        
        console.log(`[Imagen] Sketch saved: ${imagePath}`);
        return { imagePath, characterName };
        
    } catch (error) {
        console.error(`[Imagen] Error: ${error}`);
        return null;
    }
}

/**
 * 获取主题对应的随机本地图片（备用方案）
 */
function getRandomThemeImage(theme: string): string | null {
    const baseDir = path.join(__dirname, '../../../public/uploads/bigpng');
    const themeDir = THEME_IMAGE_DIRS[theme.toLowerCase()] || 'Wild Animals';
    const fullDir = path.join(baseDir, themeDir);
    
    if (!fs.existsSync(fullDir)) {
        console.error(`[DotToDot] Directory not found: ${fullDir}`);
        return null;
    }
    
    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.png'));
    if (files.length === 0) {
        console.error(`[DotToDot] Directory empty: ${fullDir}`);
        return null;
    }
    
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return path.join(fullDir, randomFile);
}

/**
 * 从 A_main_assets/{theme}/line/ 目录获取随机线稿 SVG
 * 路径格式: public/uploads/assets/A_main_assets/{theme}/line/{theme}_XXX_line.svg
 */
function getRandomLineArt(theme: string): { imagePath: string; characterName: string } | null {
    const normalizedTheme = THEME_ALIASES[theme.toLowerCase()] || 'dinosaur';
    
    // 确保主题有效
    if (!VALID_THEMES.includes(normalizedTheme)) {
        console.warn(`[DotToDot] Invalid theme: ${theme}, using dinosaur`);
    }
    
    const lineDir = path.join(__dirname, '../../../public/uploads/assets/A_main_assets', normalizedTheme, 'line');
    
    if (!fs.existsSync(lineDir)) {
        console.error(`[DotToDot] Line art directory not found: ${lineDir}`);
        return null;
    }
    
    // 获取所有 SVG 文件
    const files = fs.readdirSync(lineDir).filter(f => f.endsWith('.svg') || f.endsWith('.png'));
    
    if (files.length === 0) {
        console.error(`[DotToDot] Line art directory empty: ${lineDir}`);
        return null;
    }
    
    const randomFile = files[Math.floor(Math.random() * files.length)];
    const imagePath = path.join(lineDir, randomFile);
    
    // 从文件名提取角色名（例如 dinosaur_003_line.svg -> Dinosaur 003）
    const baseName = path.basename(randomFile, path.extname(randomFile));
    const parts = baseName.split('_');
    const characterName = parts.length >= 2 
        ? `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1]}`
        : normalizedTheme.charAt(0).toUpperCase() + normalizedTheme.slice(1);
    
    console.log(`[DotToDot] Found line art: ${imagePath}`);
    return { imagePath, characterName };
}

/**
 * 优先使用已生成的 sketches 目录中的线稿（保留但不再优先使用）
 */
function getRandomSketchImage(): string | null {
    const sketchesDir = path.join(__dirname, '../../../public/generated/sketches');
    if (!fs.existsSync(sketchesDir)) {
        console.error(`[DotToDot] Sketches directory not found: ${sketchesDir}`);
        return null;
    }
    const files = fs.readdirSync(sketchesDir).filter(f => f.endsWith('.png'));
    if (files.length === 0) {
        console.error(`[DotToDot] Sketches directory empty: ${sketchesDir}`);
        return null;
    }
    const randomFile = files[Math.floor(Math.random() * files.length)];
    return path.join(sketchesDir, randomFile);
}

/**
 * 将 SVG 转换为 PNG（Python 的 cv2 不支持 SVG）
 */
async function convertSvgToPng(svgPath: string): Promise<string> {
    const timestamp = Date.now();
    const outputDir = path.join(__dirname, '../../../public/generated/temp');
    const pngPath = path.join(outputDir, `svg_converted_${timestamp}.png`);
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`[DotToDot] Converting SVG to PNG: ${svgPath}`);
    
    // 使用 sharp 将 SVG 转换为 PNG
    await sharp(svgPath)
        .resize(800, 800, { fit: 'inside', background: { r: 255, g: 255, b: 255, alpha: 1 } })
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .png()
        .toFile(pngPath);
    
    console.log(`[DotToDot] SVG converted to PNG: ${pngPath}`);
    return pngPath;
}

/**
 * 调用 Python 脚本处理点对点图
 */
export async function processDotToDot(
    inputPath: string,
    numPoints: number = 50,
    angleThreshold: number = 20
): Promise<string> {
    // 如果是 SVG 文件，先转换为 PNG
    let actualInputPath = inputPath;
    if (inputPath.toLowerCase().endsWith('.svg')) {
        actualInputPath = await convertSvgToPng(inputPath);
    }
    
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        // 点点图存到 dots 文件夹
        const outputDir = path.join(__dirname, '../../../public/generated/dots');
        const outputPath = path.join(outputDir, `dots_${timestamp}.png`);
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const scriptPath = path.join(__dirname, '../../../../scripts/dot_to_dot.py');
        const pythonPath = process.env.PYTHON_PATH || 'E:\\python\\python.exe';
        
        console.log(`[DotToDot] Processing...`);
        console.log(`[DotToDot] Input: ${actualInputPath}`);
        console.log(`[DotToDot] Output: ${outputPath}`);
        
        const args = [scriptPath, actualInputPath, outputPath, String(numPoints), String(angleThreshold)];
        const proc = spawn(pythonPath, args);
        
        let stdout = '';
        let stderr = '';
        
        proc.stdout.on('data', (data) => {
            stdout += data.toString();
            console.log(`[DotToDot] ${data.toString().trim()}`);
        });
        
        proc.stderr.on('data', (data) => {
            stderr += data.toString();
            console.error(`[DotToDot Error] ${data.toString().trim()}`);
        });
        
        proc.on('close', (code) => {
            if (code === 0 && fs.existsSync(outputPath)) {
                console.log(`[DotToDot] Done: ${outputPath}`);
                resolve(`/generated/dots/dots_${timestamp}.png`);
            } else {
                reject(new Error(`Python script failed (code=${code}): ${stderr || stdout}`));
            }
        });
        
        proc.on('error', (err) => {
            reject(new Error(`Cannot start Python: ${err.message}`));
        });
    });
}

/**
 * 返回结果类型
 */
export interface DotToDotResult {
    dotsImageUrl: string;
    characterName: string;
}

/**
 * 从主题生成点对点图片
 * 优先级：
 * 1. sketches 目录的已生成线稿（效果最好）
 * 2. Google Gemini API 生成简笔画（备用）
 * 3. A_main_assets/{theme}/line/ 目录的线稿 SVG（备用）
 * 4. bigpng 目录的本地图片（最后备用）
 * 
 * 返回 { dotsImageUrl, characterName }
 */
export async function processDotToDotFromTheme(
    theme: string = 'dinosaur',
    maxNumber: number = 20
): Promise<DotToDotResult> {
    let imagePath: string | null = null;
    let characterName: string = 'Animal';  // 默认名字
    
    // 1. 优先从 sketches 目录选取（效果最好）
    console.log(`[DotToDot] Trying sketches directory first...`);
    imagePath = getRandomSketchImage();
    if (imagePath) {
        characterName = path.basename(imagePath, path.extname(imagePath));
        console.log(`[DotToDot] Using sketch: ${imagePath}`);
    }
    
    // 2. 如果没有 sketches，使用 Gemini API 生成
    if (!imagePath) {
        console.log(`[DotToDot] No sketches, trying Gemini API...`);
        const apiResult = await generateImageWithGemini(theme);
        if (apiResult) {
            imagePath = apiResult.imagePath;
            characterName = apiResult.characterName;
            console.log(`[DotToDot] Using Gemini API generated sketch: ${imagePath}`);
        }
    }
    
    // 3. 尝试从 A_main_assets/{theme}/line/ 目录选取线稿
    if (!imagePath) {
        console.log(`[DotToDot] Trying A_main_assets line art...`);
        const lineArt = getRandomLineArt(theme);
        if (lineArt) {
            imagePath = lineArt.imagePath;
            characterName = lineArt.characterName;
            console.log(`[DotToDot] Using line art: ${imagePath}`);
        }
    }
    
    // 4. 最后备用：bigpng 目录
    if (!imagePath) {
        console.log(`[DotToDot] Fallback to bigpng directory`);
        imagePath = getRandomThemeImage(theme);
        characterName = theme.charAt(0).toUpperCase() + theme.slice(1);
    }
    
    if (!imagePath) {
        throw new Error(`Cannot find image for theme: ${theme}`);
    }
    
    console.log(`[DotToDot] Final image: ${imagePath}`);
    console.log(`[DotToDot] Character name: ${characterName}`);
    
    // 使用传入的 maxNumber 作为点数，如果未指定则使用环境变量
    const numPoints = maxNumber || DOTS_POINT_COUNT;
    
    const dotsImageUrl = await processDotToDot(imagePath, numPoints, 20);
    
    return { dotsImageUrl, characterName };
}
