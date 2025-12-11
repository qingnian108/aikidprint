import { imageGenerator } from './src/services/imageGenerator.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSymmetry() {
    console.log('Starting Symmetry Drawing test...');

    try {
        await imageGenerator.initialize();
        console.log('Generator initialized.');

        // Test 1: Single Page
        console.log('Testing Single Page...');
        const singleData = {
            shapes: [
                { image: '🦋', type: 'symmetry' },
                { image: '🤖', type: 'symmetry' }
            ]
        };
        const singleResult = await imageGenerator.generateSymmetry(singleData);
        console.log('Single page result:', singleResult);

        // Test 2: Multi Page (simulated data structure)
        console.log('Testing Multi Page...');
        const multiData = {
            content: [
                {
                    shapes: [
                        { image: '🦋', type: 'symmetry' },
                        { image: '🤖', type: 'symmetry' }
                    ]
                },
                {
                    shapes: [
                        { image: '🚀', type: 'symmetry' },
                        { image: '🏠', type: 'symmetry' }
                    ]
                }
            ]
        };
        const multiResult = await imageGenerator.generateSymmetry(multiData);
        console.log('Multi page result:', multiResult);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        process.exit(0);
    }
}

testSymmetry();
