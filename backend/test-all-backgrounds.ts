import { ImageGenerator } from './src/services/imageGenerator.js';

async function run() {
    try {
        const generator = new ImageGenerator();
        const themes = ['dinosaur', 'ocean', 'space', 'unicorn', 'safari', 'vehicles'];
        
        console.log('Testing multiple generators with background images...\n');

        // Test 1: Uppercase Tracing
        console.log('1. Testing Uppercase Letter Tracing...');
        const uppercase = await generator.generateUppercaseTracing({ letter: 'A', theme: 'dinosaur' });
        console.log('   ✓ Generated:', uppercase);

        // Test 2: Lowercase Tracing
        console.log('2. Testing Lowercase Letter Tracing...');
        const lowercase = await generator.generateLowercaseTracing({ letter: 'a', theme: 'ocean' });
        console.log('   ✓ Generated:', lowercase);

        // Test 3: Number Tracing
        console.log('3. Testing Number Tracing...');
        const number = await generator.generateNumberTracingPage({ number: 5, theme: 'space' });
        console.log('   ✓ Generated:', number);

        // Test 4: Letter Recognition
        console.log('4. Testing Letter Recognition...');
        const recognition = await generator.generateLetterRecognitionPage({ letter: 'B', theme: 'unicorn' });
        console.log('   ✓ Generated:', recognition);

        // Test 5: Maze
        console.log('5. Testing Maze...');
        const maze = await generator.generateMazePage({ theme: 'safari', difficulty: 'easy' });
        console.log('   ✓ Generated:', maze);

        // Test 6: Count and Write
        console.log('6. Testing Count and Write...');
        const count = await generator.generateCountAndWrite({ theme: 'vehicles', difficulty: 'easy' });
        console.log('   ✓ Generated:', count);

        // Test 7: Shadow Matching
        console.log('7. Testing Shadow Matching...');
        const shadow = await generator.generateShadowMatching({ theme: 'dinosaur' });
        console.log('   ✓ Generated:', shadow);

        // Test 8: Pattern Sequencing
        console.log('8. Testing Pattern Sequencing...');
        const pattern = await generator.generatePatternSequencing({ theme: 'ocean', difficulty: 'easy' });
        console.log('   ✓ Generated:', pattern);

        // Test 9: Write My Name
        console.log('9. Testing Write My Name...');
        const name = await generator.generateWriteMyName({ name: 'EMMA', theme: 'unicorn' });
        console.log('   ✓ Generated:', name);

        // Test 10: Logic Blank
        console.log('10. Testing Logic Blank...');
        const logic = await generator.generateLogicBlank({ theme: 'space', difficulty: 'easy' });
        console.log('   ✓ Generated:', logic);

        await generator.close();
        console.log('\n✅ All 10 generator tests completed successfully!');
        console.log('All worksheets now use theme background images instead of stickers.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

run();
