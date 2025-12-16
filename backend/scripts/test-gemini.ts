/**
 * 测试 Gemini API 图片生成服务（带备用模型）
 */
import dotenv from 'dotenv';
dotenv.config();

import { generateGeminiImage } from '../src/services/geminiImageService';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testGeminiAPI() {
    console.log('=== Gemini 图片生成服务测试 ===\n');
    console.log('主模型: gemini-3-pro-image-preview (Nano Banana Pro)');
    console.log('备用模型: gemini-2.5-flash-image\n');
    
    const prompt = 'cute baby dinosaur, simple black outline, coloring book style, white background';
    console.log(`📝 Prompt: ${prompt}\n`);
    console.log('⏳ 正在生成图片...\n');
    
    const startTime = Date.now();
    
    try {
        const base64 = await generateGeminiImage(prompt);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log(`\n✅ 图片生成成功!`);
        console.log(`⏱️ 耗时: ${elapsed}s`);
        console.log(`📊 图片大小: ${base64.length} chars (base64)`);
        
        // 保存图片
        const outputDir = path.join(__dirname, '../../public/generated/test');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputPath = path.join(outputDir, `test_${Date.now()}.png`);
        const imageBuffer = Buffer.from(base64, 'base64');
        fs.writeFileSync(outputPath, imageBuffer);
        
        console.log(`💾 图片已保存: ${outputPath}`);
        
    } catch (error) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error(`\n❌ 生成失败 (${elapsed}s):`);
        console.error(error instanceof Error ? error.message : error);
    }
    
    console.log('\n=== 测试完成 ===');
}

testGeminiAPI();
