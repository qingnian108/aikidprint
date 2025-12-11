
import { imageGenerator } from './src/services/imageGenerator';

async function test() {
    try {
        console.log('Testing Comparison Skills...');
        const result = await imageGenerator.generateWorksheet('comparison-skills', {
            content: [
                {
                    items: [
                        { variant: 'size', image: '🐘', prompt: 'Circle the BIG one' },
                        { variant: 'more-less', image: '🍎', leftCount: 3, rightCount: 5, prompt: 'Which side has more?' }
                    ]
                }
            ]
        });
        console.log('Generated:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
