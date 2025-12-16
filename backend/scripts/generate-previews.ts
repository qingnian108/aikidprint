/**
 * 批量生成板块封面图片
 * 使用默认参数 + dinosaur 主题
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:3000/api';

// 所有板块的配置 - 需要 categoryId 和 pageTypeId
const PREVIEW_CONFIGS = [
  // Literacy（字母技能）
  { id: 'uppercase-tracing', categoryId: 'literacy', pageTypeId: 'uppercase-tracing', config: { letter: 'A', theme: 'dinosaur' } },
  { id: 'lowercase-tracing', categoryId: 'literacy', pageTypeId: 'lowercase-tracing', config: { letter: 'a', theme: 'dinosaur' } },
  { id: 'letter-recognition', categoryId: 'literacy', pageTypeId: 'letter-recognition', config: { letter: 'A', difficulty: 'easy', theme: 'dinosaur' } },
  { id: 'write-my-name', categoryId: 'literacy', pageTypeId: 'write-my-name', config: { name: 'LEO', theme: 'dinosaur' } },
  { id: 'alphabet-sequencing', categoryId: 'literacy', pageTypeId: 'alphabet-sequencing', config: { difficulty: 'easy', theme: 'dinosaur' } },
  { id: 'beginning-sounds', categoryId: 'literacy', pageTypeId: 'beginning-sounds', config: { letterSet: 'A-E', theme: 'dinosaur' } },
  { id: 'cvc-words', categoryId: 'literacy', pageTypeId: 'cvc-words', config: { wordFamily: 'at', theme: 'dinosaur' } },
  { id: 'match-upper-lower', categoryId: 'literacy', pageTypeId: 'match-upper-lower', config: { letterSet: 'A-F', theme: 'dinosaur' } },
  
  // Math（数学技能）
  { id: 'number-tracing', categoryId: 'math', pageTypeId: 'number-tracing', config: { range: '0-4', theme: 'dinosaur' } },
  { id: 'counting-objects', categoryId: 'math', pageTypeId: 'counting-objects', config: { theme: 'dinosaur', difficulty: 'medium' } },
  { id: 'number-path', categoryId: 'math', pageTypeId: 'number-path', config: { theme: 'dinosaur' } },
  { id: 'which-is-more', categoryId: 'math', pageTypeId: 'which-is-more', config: { difficulty: 'easy', theme: 'dinosaur' } },
  { id: 'number-bonds', categoryId: 'math', pageTypeId: 'number-bonds', config: { theme: 'dinosaur' } },
  { id: 'ten-frame', categoryId: 'math', pageTypeId: 'ten-frame', config: { theme: 'dinosaur' } },
  { id: 'picture-addition', categoryId: 'math', pageTypeId: 'picture-addition', config: { theme: 'dinosaur' } },
  { id: 'count-shapes', categoryId: 'math', pageTypeId: 'count-shapes', config: { theme: 'dinosaur' } },
  { id: 'picture-subtraction', categoryId: 'math', pageTypeId: 'picture-subtraction', config: { theme: 'dinosaur' } },
  { id: 'number-sequencing', categoryId: 'math', pageTypeId: 'number-sequencing', config: { theme: 'dinosaur' } },
  
  // Logic（逻辑思维）
  { id: 'maze', categoryId: 'logic', pageTypeId: 'maze', config: { theme: 'dinosaur', difficulty: 'medium' } },
  { id: 'shadow-matching', categoryId: 'logic', pageTypeId: 'shadow-matching', config: { theme: 'dinosaur' } },
  { id: 'sorting', categoryId: 'logic', pageTypeId: 'sorting', config: { theme: 'dinosaur' } },
  { id: 'pattern-compare', categoryId: 'logic', pageTypeId: 'pattern-compare', config: { theme: 'dinosaur' } },
  { id: 'pattern-sequencing', categoryId: 'logic', pageTypeId: 'pattern-sequencing', config: { theme: 'dinosaur' } },
  { id: 'odd-one-out', categoryId: 'logic', pageTypeId: 'odd-one-out', config: { theme: 'dinosaur' } },
  { id: 'matching-halves', categoryId: 'logic', pageTypeId: 'matching-halves', config: { theme: 'dinosaur' } },
  
  // Creativity & Motor（创意与运笔）
  { id: 'trace-lines', categoryId: 'creativity', pageTypeId: 'trace-lines', config: { theme: 'dinosaur' } },
  { id: 'shape-tracing', categoryId: 'creativity', pageTypeId: 'shape-tracing', config: { theme: 'dinosaur' } },
  { id: 'coloring-page', categoryId: 'creativity', pageTypeId: 'coloring-page', config: { theme: 'dinosaur' } },
  { id: 'creative-prompt', categoryId: 'creativity', pageTypeId: 'creative-prompt', config: { promptType: 'blank_sign', theme: 'dinosaur' } },
  { id: 'shape-path', categoryId: 'creativity', pageTypeId: 'shape-path', config: { theme: 'dinosaur' } },
  { id: 'trace-and-draw', categoryId: 'creativity', pageTypeId: 'trace-and-draw', config: { theme: 'dinosaur' } },
  { id: 'logic-grid', categoryId: 'creativity', pageTypeId: 'logic-grid', config: { theme: 'dinosaur' } },
  { id: 'shape-synthesis', categoryId: 'creativity', pageTypeId: 'shape-synthesis', config: { theme: 'dinosaur' } },
];

const OUTPUT_DIR = path.join(__dirname, '../../public/previews');

async function generatePreview(config: typeof PREVIEW_CONFIGS[0]): Promise<string | null> {
  console.log(`\n📄 生成: ${config.id}...`);
  
  try {
    const response = await fetch(`${API_BASE}/worksheets/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: config.categoryId,
        pageTypeId: config.pageTypeId,
        config: config.config
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ ${config.id} 生成失败:`, error);
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.data?.imageUrl) {
      // 获取图片URL（可能是数组或单个）
      const imageUrl = Array.isArray(data.data.imageUrl) ? data.data.imageUrl[0] : data.data.imageUrl;
      
      console.log(`   图片URL: ${imageUrl}`);
      
      const imageResponse = await fetch(imageUrl);
      
      if (!imageResponse.ok) {
        console.error(`❌ ${config.id} 图片下载失败`);
        return null;
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const outputPath = path.join(OUTPUT_DIR, `${config.id}.png`);
      
      fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
      console.log(`✅ ${config.id} 保存成功: ${outputPath}`);
      return outputPath;
    }
    
    console.error(`❌ ${config.id} 响应格式错误:`, JSON.stringify(data).slice(0, 200));
    return null;
  } catch (error) {
    console.error(`❌ ${config.id} 错误:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 开始批量生成封面图片...\n');
  console.log(`📁 输出目录: ${OUTPUT_DIR}`);
  
  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let success = 0;
  let failed = 0;

  for (const config of PREVIEW_CONFIGS) {
    const result = await generatePreview(config);
    if (result) {
      success++;
    } else {
      failed++;
    }
    
    // 稍微延迟，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 生成完成: 成功 ${success} 个, 失败 ${failed} 个`);
}

main().catch(console.error);
