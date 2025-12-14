/**
 * 为新增的 Logic 板块生成封面图片
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:3000/api';

// 新增的六个板块配置
const NEW_PREVIEW_CONFIGS = [
  // Logic & Thinking 新增
  { id: 'logic-grid', categoryId: 'logic', pageTypeId: 'logic-grid', config: { theme: 'dinosaur' } },
  { id: 'odd-one-out', categoryId: 'logic', pageTypeId: 'odd-one-out', config: { theme: 'dinosaur' } },
  { id: 'matching-halves', categoryId: 'logic', pageTypeId: 'matching-halves', config: { theme: 'dinosaur' } },
  { id: 'shape-synthesis', categoryId: 'logic', pageTypeId: 'shape-synthesis', config: { theme: 'dinosaur' } },
  // Math 新增
  { id: 'picture-subtraction', categoryId: 'math', pageTypeId: 'picture-subtraction', config: { theme: 'dinosaur' } },
  { id: 'number-sequencing', categoryId: 'math', pageTypeId: 'number-sequencing', config: { theme: 'dinosaur' } },
];

const OUTPUT_DIR = path.join(__dirname, '../../public/previews');

async function generatePreview(config: typeof NEW_PREVIEW_CONFIGS[0]): Promise<string | null> {
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
  console.log('🚀 开始生成新板块封面图片...\n');
  console.log(`📁 输出目录: ${OUTPUT_DIR}`);
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let success = 0;
  let failed = 0;

  for (const config of NEW_PREVIEW_CONFIGS) {
    const result = await generatePreview(config);
    if (result) {
      success++;
    } else {
      failed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 生成完成: 成功 ${success} 个, 失败 ${failed} 个`);
}

main().catch(console.error);
