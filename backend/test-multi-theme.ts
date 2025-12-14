import { ImageGenerator } from './src/services/imageGenerator.js';

async function run() {
    try {
        const generator = new ImageGenerator();
        
        console.log('Testing different themes with background images...\n');

        // Test each theme
        const themes = ['dinosaur', 'ocean', 'space', 'unicorn', 'safari', 'vehicles'];
        
        for (const theme of themes) {
            console.log(`Generating Uppercase Tracing with ${theme} theme...`);
            const result = await generator.generateUppercaseTracing({ 
                letter: 'A', 
                theme: theme 
            });
            console.log(`  ✓ ${theme}: ${result}\n`);
        }

        await generator.close();
        console.log('✅ All theme tests completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

run();
