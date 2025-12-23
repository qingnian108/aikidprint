/**
 * 批量生成所有页面类型的预览图
 * 运行: npx ts-node scripts/generatePreviews.ts
 */

import { ImageGenerator } from '../src/services/imageGenerator.js';
import { literacyGenerators, mathGenerators, logicGenerators, creativityGenerators, fineMotorGenerators } from '../src/services/generators/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PREVIEW_DIR = path.join(__dirname, '../../public/previews');

// 确保目录存在
if (!fs.existsSync(PREVIEW_DIR)) {
    fs.mkdirSync(PREVIEW_DIR, { recursive: true });
}

const imageGenerator = new ImageGenerator();

// 所有页面类型配置
const pageConfigs = [
    // Literacy
    { type: 'uppercase-tracing', generator: literacyGenerators, method: 'generateUppercaseTracing', config: { letter: 'A', theme: 'dinosaur' } },
    { type: 'lowercase-tracing', generator: literacyGenerators, method: 'generateLowercaseTracing', config: { letter: 'a', theme: 'dinosaur' } },
    { type: 'letter-recognition', generator: literacyGenerators, method: 'generateLetterRecognitionPage', config: { letter: 'A', theme: 'dinosaur', difficulty: 'easy' } },
    { type: 'write-my-name', generator: literacyGenerators, method: 'generateWriteMyName', config: { name: 'Emma', theme: 'dinosaur' } },
    { type: 'alphabet-sequencing', generator: literacyGenerators, method: 'generateAlphabetSequencing', config: { theme: 'dinosaur', difficulty: 'easy' } },
    { type: 'beginning-sounds', generator: literacyGenerators, method: 'generateBeginningSounds', config: { letterSet: 'A-E', theme: 'dinosaur' } },
    { type: 'cvc-words', generator: literacyGenerators, method: 'generateCVCWordsPage', config: { theme: 'dinosaur' } },
    { type: 'match-upper-lower', generator: literacyGenerators, method: 'generateMatchUpperLower', config: { letterSet: 'A-F', theme: 'dinosaur' } },
    
    // Math
    { type: 'number-tracing', generator: mathGenerators, method: 'generateNumberTracingPage', config: { range: '0-4', theme: 'dinosaur' } },
    { type: 'counting-objects', generator: mathGenerators, method: 'generateCountAndWrite', config: { theme: 'dinosaur', difficulty: 'easy' } },
    { type: 'number-path', generator: null, method: 'generateConnectDots', config: { theme: 'dinosaur' } },
    { type: 'which-is-more', generator: mathGenerators, method: 'generateWhichIsMore', config: { theme: 'dinosaur', difficulty: 'easy' } },
    { type: 'number-bonds', generator: mathGenerators, method: 'generateNumberBonds', config: { theme: 'dinosaur' } },
    { type: 'ten-frame', generator: mathGenerators, method: 'generateTenFrame', config: { theme: 'dinosaur' } },
    { type: 'picture-addition', generator: mathGenerators, method: 'generatePictureAddition', config: { theme: 'dinosaur' } },
    { type: 'count-shapes', generator: mathGenerators, method: 'generateCountShapes', config: { theme: 'dinosaur' } },
    { type: 'picture-subtraction', generator: mathGenerators, method: 'generatePictureSubtraction', config: { theme: 'dinosaur' } },
    { type: 'number-sequencing', generator: mathGenerators, method: 'generateNumberSequencing', config: { theme: 'dinosaur' } },
    
    // Logic
    { type: 'maze', generator: logicGenerators, method: 'generateMazePage', config: { theme: 'dinosaur', difficulty: 'medium' } },
    { type: 'shadow-matching', generator: logicGenerators, method: 'generateShadowMatching', config: { theme: 'dinosaur' } },
    { type: 'sorting', generator: logicGenerators, method: 'generateSortingPage', config: { theme: 'dinosaur' } },
    { type: 'pattern-compare', generator: logicGenerators, method: 'generatePatternComparePage', config: { theme: 'dinosaur' } },
    { type: 'pattern-sequencing', generator: logicGenerators, method: 'generatePatternSequencing', config: { theme: 'dinosaur' } },
    { type: 'odd-one-out', generator: logicGenerators, method: 'generateOddOneOut', config: { theme: 'dinosaur' } },
    { type: 'matching-halves', generator: logicGenerators, method: 'generateMatchingHalves', config: { theme: 'dinosaur' } },
    
    // Creativity
    { type: 'trace-lines', generator: fineMotorGenerators, method: 'generateTraceLines', config: { theme: 'dinosaur' } },
    { type: 'shape-tracing', generator: fineMotorGenerators, method: 'generateShapeTracing', config: { theme: 'dinosaur' } },
    { type: 'coloring-page', generator: creativityGenerators, method: 'generateColoringPage', config: { theme: 'dinosaur' } },
    { type: 'creative-prompt', generator: creativityGenerators, method: 'generateCreativePrompt', config: { theme: 'dinosaur', promptType: 'blank_sign' } },
    { type: 'trace-and-draw', generator: creativityGenerators, method: 'generateTraceAndDraw', config: { theme: 'dinosaur' } },
    { type: 'shape-path', generator: creativityGenerators, method: 'generateShapePath', config: { theme: 'dinosaur' } },
    { type: 'logic-grid', generator: logicGenerators, method: 'generateLogicGrid', config: { theme: 'dinosaur' } },
    { type: 'shape-synthesis', generator: logicGenerators, method: 'generateShapeSynthesis', config: { theme: 'dinosaur' } },
];

async function generateAllPreviews() {
    console.log('🚀 开始生成预览图...\n');
    
    await imageGenerator.initialize();
    
    let success = 0;
    let failed = 0;
    
    for (const pageConfig of pageConfigs) {
        try {
            console.log(`📄 生成 ${pageConfig.type}...`);
            
            let data: any;
            
            // 获取生成器数据
            if (pageConfig.generator) {
                const gen = pageConfig.generator.get(pageConfig.type);
                if (gen) {
                    data = await gen(pageConfig.config);
                } else {
                    data = { content: pageConfig.config };
                }
            } else {
                data = { content: pageConfig.config };
            }
            
            // 调用图片生成方法
            const method = (imageGenerator as any)[pageConfig.method];
            if (!method) {
                console.log(`   ⚠️ 方法不存在: ${pageConfig.method}`);
                failed++;
                continue;
            }
            
            const imageUrl = await method.call(imageGenerator, data.content || data);
            
            // 复制到预览目录
            const srcPath = path.join(__dirname, '../public', imageUrl);
            const destPath = path.join(PREVIEW_DIR, `${pageConfig.type}.png`);
            
            if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, destPath);
                console.log(`   ✅ 完成: ${pageConfig.type}.png`);
                success++;
            } else {
                console.log(`   ⚠️ 源文件不存在: ${srcPath}`);
                failed++;
            }
        } catch (error) {
            console.log(`   ❌ 失败: ${pageConfig.type}`, error);
            failed++;
        }
    }
    
    await imageGenerator.closeBrowser();
    
    console.log(`\n✨ 完成! 成功: ${success}, 失败: ${failed}`);
}

generateAllPreviews().catch(console.error);
