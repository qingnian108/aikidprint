import { imageGenerator } from './src/services/imageGenerator.js'; // Added .js extension
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPictureMath() {
    console.log('Starting Picture Math test...');

    try {
        await imageGenerator.initialize();
        console.log('Generator initialized.');

        const addData = {
            operation: 'addition',
            content: [
                {
                    items: [
                        { operation: 'add', a: 1, b: 1, image: '🍎' }
                    ]
                }
            ]
        };
        const addResult = await imageGenerator.generatePictureMath(addData);
        console.log('Addition result:', addResult);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        // Force exit to ensure process doesn't hang
        process.exit(0);
    }
}

testPictureMath();
