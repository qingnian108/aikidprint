import { ImageGenerator } from '../src/services/imageGenerator.js';
import { generateConnectDots } from '../src/services/generators/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const imageGenerator = new ImageGenerator();
    await imageGenerator.initialize();
    
    console.log('生成 Number Path 预览...');
    const data = await generateConnectDots({ theme: 'dinosaur' });
    console.log('数据:', JSON.stringify(data.content, null, 2));
    
    const imageUrl = await imageGenerator.generateConnectDots(data.content);
    console.log('图片URL:', imageUrl);
    
    // 复制到前端预览目录
    const srcPath = path.join(__dirname, '../public', imageUrl);
    const destPath = path.join(__dirname, '../../public/previews/number-path.png');
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log('✅ 预览图已保存到:', destPath);
    } else {
        console.log('❌ 源文件不存在:', srcPath);
    }
    
    await imageGenerator.closeBrowser();
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
