import axios from 'axios';

async function testCVCWords() {
    console.log('Testing CVC Words generation with 3 pages...\n');

    try {
        const response = await axios.post('http://localhost:3000/api/worksheet/generate', {
            type: 'cvc-words',
            config: {
                pageCount: 3
            }
        });

        console.log('✅ Generation successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));

        // Analyze the content
        if (response.data && response.data.content) {
            const pages = Array.isArray(response.data.content)
                ? response.data.content
                : [response.data.content];

            console.log(`\n📊 Analysis:`);
            console.log(`Total pages: ${pages.length}`);

            const allImages = new Set();
            const allWords = new Set();
            const duplicateImages = [];
            const duplicateWords = [];

            pages.forEach((page, pageIdx) => {
                console.log(`\nPage ${pageIdx + 1}:`);
                const words = page.words || [];
                console.log(`  Words count: ${words.length}`);

                words.forEach((item, idx) => {
                    console.log(`  ${idx + 1}. word: "${item.word}", image: ${item.image}`);

                    // Check for duplicates
                    if (allImages.has(item.image)) {
                        duplicateImages.push({ page: pageIdx + 1, image: item.image });
                    } else {
                        allImages.add(item.image);
                    }

                    if (allWords.has(item.word)) {
                        duplicateWords.push({ page: pageIdx + 1, word: item.word });
                    } else {
                        allWords.add(item.word);
                    }
                });
            });

            console.log(`\n🔍 Uniqueness Check:`);
            console.log(`Total unique images: ${allImages.size}`);
            console.log(`Total unique words: ${allWords.size}`);
            console.log(`Expected: ${pages.length * 6} unique items`);

            if (duplicateImages.length > 0) {
                console.log(`\n❌ Duplicate images found:`);
                duplicateImages.forEach(dup => {
                    console.log(`  Page ${dup.page}: ${dup.image}`);
                });
            } else {
                console.log(`\n✅ No duplicate images!`);
            }

            if (duplicateWords.length > 0) {
                console.log(`\n❌ Duplicate words found:`);
                duplicateWords.forEach(dup => {
                    console.log(`  Page ${dup.page}: ${dup.word}`);
                });
            } else {
                console.log(`\n✅ No duplicate words!`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testCVCWords();
