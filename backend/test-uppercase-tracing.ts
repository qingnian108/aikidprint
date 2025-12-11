import { ImageGenerator } from './src/services/imageGenerator.js';

async function run() {
    try {
        const generator = new ImageGenerator();
        
        console.log('Generating Uppercase Letter Tracing for A with Dinosaur theme...');
        const result1 = await generator.generateUppercaseTracing({ 
            letter: 'A', 
            theme: 'dinosaur' 
        });
        console.log('Generated:', result1);

        console.log('\nGenerating Uppercase Letter Tracing for B with Space theme...');
        const result2 = await generator.generateUppercaseTracing({ 
            letter: 'B', 
            theme: 'space' 
        });
        console.log('Generated:', result2);

        console.log('\nGenerating Uppercase Letter Tracing for C with Ocean theme...');
        const result3 = await generator.generateUppercaseTracing({ 
            letter: 'C', 
            theme: 'ocean' 
        });
        console.log('Generated:', result3);

        await generator.close();
        console.log('\n✅ All tests completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

run();
