import { imageGenerator } from './src/services/imageGenerator.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDoodleBorders() {
    console.log('Starting Doodle Borders test...');

    try {
        await imageGenerator.initialize();
        console.log('Generator initialized.');

        // Test 1: Single Page (Animals)
        console.log('Testing Single Page (Animals)...');
        const singleData = {
            borderTheme: 'animals',
            borderPattern: Array.from({ length: 86 }, (_, i) => i % 2 === 0 ? '🐶' : '🐱')
        };
        const singleResult = await imageGenerator.generateDoodleBorders(singleData);
        console.log('Single page result:', singleResult);

        // Test 2: Multi Page (simulated data structure)
        console.log('Testing Multi Page...');
        const multiData = {
            content: [
                {
                    borderTheme: 'animals',
                    borderPattern: Array.from({ length: 86 }, (_, i) => '🐰')
                },
                {
                    borderTheme: 'vehicles',
                    borderPattern: Array.from({ length: 86 }, (_, i) => '🚗')
                }
            ]
        };
        const multiResult = await imageGenerator.generateDoodleBorders(multiData);
        console.log('Multi page result:', multiResult);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        process.exit(0);
    }
}

testDoodleBorders();
