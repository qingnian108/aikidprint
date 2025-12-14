import { getThemeBackground } from './src/utils/imageHelper.js';

const themes = ['dinosaur', 'ocean', 'space', 'unicorn', 'safari', 'vehicles'];

console.log('Testing random background selection (5 times per theme):\n');
themes.forEach(theme => {
    console.log(`${theme}:`);
    for (let i = 0; i < 5; i++) {
        const bg = getThemeBackground(theme);
        const filename = bg.split('/').pop();
        console.log(`  ${i + 1}. ${filename}`);
    }
    console.log('');
});
