
import { ImageGenerator } from './src/services/imageGenerator';
import path from 'path';

async function run() {
    try {
        const generator = new ImageGenerator();
        console.log('Generating Number Tracing for 9...');
        const result = await generator.generateNumberTracing({ number: 9 });
        console.log('Generated:', result);

        console.log('Generating Number Tracing for 1...');
        const result1 = await generator.generateNumberTracing({ number: 1 });
        console.log('Generated:', result1);

        await generator.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run();
