import { ImageGenerator } from './src/services/imageGenerator.js';
import { generateConnectDots } from './src/services/generators/index.js';

async function testConnectDots() {
    console.log('Testing Connect Dots Generation...');

    const generator = new ImageGenerator();

    // Test cases
    const configs = [
        { maxNumber: '10' },
        { maxNumber: '20' },
        { maxNumber: '50' }
    ];

    for (const config of configs) {
        console.log(`\nTesting with config: ${JSON.stringify(config)}`);
        try {
            // 1. Generate data
            const data = await generateConnectDots(config);
            console.log('Data generated successfully:', data.title);
            console.log(`Grid size: ${data.content.rows}x${data.content.cols}`);

            // 2. Generate image
            const imageUrl = await generator.generateConnectDots(data.content);
            console.log('Image generated successfully:', imageUrl);
        } catch (error) {
            console.error('Test failed:', error);
        }
    }

    process.exit(0);
}

testConnectDots();
