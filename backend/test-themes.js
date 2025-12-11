/**
 * 测试不同主题的 Number Path API
 */

const themes = ['dinosaur', 'unicorn', 'ocean', 'space', 'safari', 'vehicles'];

async function testTheme(theme) {
    const url = 'http://localhost:3000/api/worksheets/generate-image';
    const payload = {
        categoryId: 'math',
        pageTypeId: 'number-path',
        config: { theme, maxNumber: 20, pageCount: 1 }
    };
    
    console.log(`\n=== Testing theme: ${theme} ===`);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if (data.success) {
            console.log(`✅ ${theme}: ${data.data.imageUrl}`);
        } else {
            console.log(`❌ ${theme}: ${data.error}`);
        }
    } catch (error) {
        console.log(`❌ ${theme}: ${error.message}`);
    }
}

async function main() {
    // 测试 safari 主题
    await testTheme('safari');
}

main();
