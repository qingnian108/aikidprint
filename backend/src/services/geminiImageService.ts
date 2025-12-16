/**
 * Google Gemini API 图片生成服务
 * 主模型: Nano Banana Pro (gemini-3-pro-image-preview)
 * 备用模型: gemini-2.5-flash-image (当主模型过载时自动切换)
 * 参考文档: docs/nano.md
 */

import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY || '';

// 模型配置
const PRIMARY_MODEL = 'gemini-3-pro-image-preview';  // Nano Banana Pro
const FALLBACK_MODEL = 'gemini-2.5-flash-image';     // 备用模型

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface GeminiImageOptions {
    temperature?: number;
    aspectRatio?: string;  // 如 "16:9", "3:4", "1:1"
    imageSize?: string;    // 如 "2K", "4K"
}

/**
 * 调用指定模型生成图片
 */
async function callModel(model: string, prompt: string, options: GeminiImageOptions = {}): Promise<string | null> {
    const url = `${API_BASE}/${model}:generateContent`;
    
    // 构建 generationConfig，默认使用 3:4 比例
    const generationConfig: Record<string, unknown> = {
        imageConfig: {
            aspectRatio: options.aspectRatio || '3:4',
            ...(options.imageSize && { imageSize: options.imageSize })
        }
    };
    
    const payload: Record<string, unknown> = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json() as { error?: { code?: number; message?: string } };
            const errorCode = errorData.error?.code;
            const errorMessage = errorData.error?.message || 'Unknown error';
            
            // 503 表示模型过载，返回 null 让调用者尝试备用模型
            if (errorCode === 503) {
                console.warn(`[GeminiImage] Model ${model} overloaded (503)`);
                return null;
            }
            
            throw new Error(`API 请求失败: ${response.status} - ${errorMessage}`);
        }

        const data = await response.json() as { candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ inlineData?: { data?: string } }> } }> };
        const candidate = data.candidates?.[0];
        
        if (!candidate) {
            console.error(`[GeminiImage] Empty response from ${model}`);
            return null;
        }

        if (candidate.finishReason === 'SAFETY') {
            throw new Error('[GeminiImage] 图片被安全策略拦截');
        }

        // 查找图片数据
        const parts = candidate.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData?.data) {
                return part.inlineData.data;
            }
        }
        
        console.error(`[GeminiImage] No image in response from ${model}`);
        return null;
        
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            console.warn(`[GeminiImage] Request to ${model} timeout`);
            return null;
        }
        throw error;
    }
}

/**
 * 调用 Gemini API 生成图片，返回 Base64
 * 优先使用主模型，过载时自动切换到备用模型
 */
export async function generateGeminiImage(prompt: string, options: GeminiImageOptions = {}): Promise<string> {
    if (!API_KEY) {
        throw new Error('[GeminiImage] GOOGLE_API_KEY 未配置');
    }

    // 1. 先尝试主模型 (Nano Banana Pro)
    console.log(`[GeminiImage] Trying primary model: ${PRIMARY_MODEL}`);
    let result = await callModel(PRIMARY_MODEL, prompt, options);
    
    if (result) {
        console.log(`[GeminiImage] Success with ${PRIMARY_MODEL}! Size: ${result.length} chars`);
        return result;
    }
    
    // 2. 主模型失败，尝试备用模型
    console.log(`[GeminiImage] Primary model failed, trying fallback: ${FALLBACK_MODEL}`);
    result = await callModel(FALLBACK_MODEL, prompt, options);
    
    if (result) {
        console.log(`[GeminiImage] Success with ${FALLBACK_MODEL}! Size: ${result.length} chars`);
        return result;
    }
    
    // 3. 两个模型都失败
    throw new Error('[GeminiImage] 所有模型都不可用，请稍后重试');
}
