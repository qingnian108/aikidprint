/**
 * 测试 Pattern Sequencing 生成器
 */

import { ImageGenerator } from './src/services/imageGenerator.js';

async function testPatternSequencing() {
    const generator = new ImageGenerator();
    
    console.log('Testing Pattern Sequencing generator...');
    
    try {
        // 测试直接传参方式
        console.log('\n1. Testing direct params (dinosaur theme)...');
        const result1 = await generator.generatePatternSequencing({ 
            theme: 'dinosaur',
            rowCount: 4
        });
        console.log('Generated:', result1);
        
        // 测试通过 content 传参方式（模拟前端调用）
        console.log('\n2. Testing content wrapper (unicorn theme)...');
        const result2 = await generator.generatePatternSequencing({ 
            content: {
                theme: 'unicorn',
                rowCount: 4
            }
        });
        console.log('Generated:', result2);
        
        // 测试 generateWorksheet 方式
        console.log('\n3. Testing via generateWorksheet (space theme)...');
        const result3 = await generator.generateWorksheet('pattern-sequencing', { 
            content: {
                theme: 'space',
                rowCount: 4
            }
        });
        console.log('Generated:', result3);
        
        console.log('\n✅ All tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
    
    process.exit(0);
}

testPatternSequencing();
