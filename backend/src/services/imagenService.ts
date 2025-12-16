/**
 * Google Gemini Image 服务
 * 用于生成简笔画图片
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { generateGeminiImage } from './geminiImageService.js';

// 主题对应的 prompt
const THEME_PROMPTS: Record<string, string> = {
    dinosaur: 'cute baby T-Rex dinosaur standing, simple bold black outline, no shading, no colors, clean coloring page style, smooth outer contour, minimal internal details, white background',
    cat: 'cute cat sitting, simple bold black outline, no shading, no colors, clean coloring page style, smooth outer contour, minimal internal details, white background',
    dog: 'cute puppy dog sitting, simple bold black outline, no shading, no colors, clean coloring page style, smooth outer contour, minimal internal details, white background',
    car: 'simple car side view, bold black outline, no shading, no colors, clean coloring page style, smooth outer contour, minimal details, white background',
    house: 'simple house with roof, bold black outline, no shading, no colors, clean coloring page style, smooth outer contour, minimal details, white background',
    flower: 'simple flower with petals, bold black outline, no shading, no colors, clean coloring page style, smooth outer contour, minimal details, white background',
    star: 'simple five-pointed star, bold black outline, no shading, no colors, clean coloring page style, smooth outer contour, white background',
    heart: 'simple heart shape, bold black outline, no shading, no colors, clean coloring page style, smooth outer contour, white background',
};

/**
 * 调用 Gemini API 生成图片
 */
export async function generateImageWithGemini(theme: string = 'dinosaur'): Promise<string> {
    const prompt = THEME_PROMPTS[theme.toLowerCase()] || THEME_PROMPTS.dinosaur;
    console.log(`[Imagen] 正在生成 ${theme} 主题图片... (Gemini API)`);

    const base64Data = await generateGeminiImage(prompt, { temperature: 0.4 });

    console.log(`[Imagen] 图片生成成功`);
    
    // 简笔画存到 sketches 文件夹
    const timestamp = Date.now();
    const outputDir = path.join(__dirname, '../../public/generated/sketches');
    const originalPath = path.join(outputDir, `sketch_${timestamp}.png`);
    
    // 确保目录存在
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 解码并保存
    const imageBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(originalPath, imageBuffer);
    console.log(`[Imagen] 简笔画已保存: ${originalPath}`);
    
    return originalPath;
}

/**
 * 调用 Python 脚本处理点对点图
 */
export async function processDotToDot(
    inputPath: string, 
    numPoints: number = 50, 
    angleThreshold: number = 20
): Promise<string> {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        // 点点图存到 dots 文件夹
        const outputDir = path.join(__dirname, '../../public/generated/dots');
        const outputPath = path.join(outputDir, `dots_${timestamp}.png`);
        
        // Python 脚本路径
        const scriptPath = path.join(__dirname, '../../../scripts/dot_to_dot.py');
        const pythonPath = process.env.PYTHON_PATH || 'python';
        
        console.log(`[DotToDot] 正在处理点对点图...`);
        console.log(`[DotToDot] 输入: ${inputPath}`);
        console.log(`[DotToDot] 输出: ${outputPath}`);
        
        const args = [scriptPath, inputPath, outputPath, String(numPoints), String(angleThreshold)];
        
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
                console.log(`[DotToDot] 处理完成: ${outputPath}`);
                resolve(outputPath);
            } else {
                reject(new Error(`Python 脚本执行失败: ${stderr || stdout}`));
            }
        });
        
        proc.on('error', (err) => {
            reject(new Error(`无法启动 Python: ${err.message}`));
        });
    });
}

/**
 * 完整流程：生成图片 -> 处理点对点 -> 返回最终图片路径
 */
export async function generateConnectDotsImage(
    theme: string = 'dinosaur',
    numPoints: number = 50,
    angleThreshold: number = 20
): Promise<string> {
    try {
        // 步骤1: 调用 API 生成简笔画
        const originalPath = await generateImageWithGemini(theme);
        
        // 步骤2: 处理成点对点图
        const dotsPath = await processDotToDot(originalPath, numPoints, angleThreshold);
        
        // 返回相对路径（用于 HTML 引用）
        const relativePath = `/generated/dots/${path.basename(dotsPath)}`;
        
        return relativePath;
    } catch (error) {
        console.error('[ConnectDots] 生成失败:', error);
        throw error;
    }
}
