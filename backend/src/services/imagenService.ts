/**
 * Google Gemini 2.5 Flash Image API 服务
 * 用于生成简笔画图片
 */

import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

// 从环境变量获取 API Key
const getApiKey = (): string => {
    const key = process.env.GOOGLE_API_KEY;
    if (!key) {
        throw new Error('GOOGLE_API_KEY 环境变量未设置');
    }
    return key;
};

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
 * 调用 Google Gemini API 生成图片
 */
export async function generateImageWithGemini(theme: string = 'dinosaur'): Promise<string> {
    const apiKey = getApiKey();
    const prompt = THEME_PROMPTS[theme.toLowerCase()] || THEME_PROMPTS.dinosaur;
    
    const url = `${API_ENDPOINT}?key=${apiKey}`;
    
    const payload = {
        contents: [
            {
                role: 'user',
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
    
    console.log(`[Imagen] 正在生成 ${theme} 主题图片...`);
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 调用失败: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json() as any;
    
    // 检查响应
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('API 返回空结果');
    }
    
    const candidate = data.candidates[0];
    
    // 检查安全拦截
    if (candidate.finishReason === 'SAFETY') {
        throw new Error('图片被安全策略拦截');
    }
    
    // 提取 Base64 图片数据
    const inlineData = candidate.content?.parts?.[0]?.inlineData;
    if (!inlineData?.data) {
        throw new Error('无法解析响应数据');
    }
    
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
    const imageBuffer = Buffer.from(inlineData.data, 'base64');
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
