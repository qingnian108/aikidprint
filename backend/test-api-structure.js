import axios from 'axios';

async function testCVCWordsAPI() {
    console.log('Testing CVC Words API with 3 pages...\n');

    try {
        const response = await axios.post('http://localhost:3000/api/worksheet/generate', {
            type: 'cvc-words',
            config: {
                pageCount: 3
            }
        });

        console.log('✅ API Response received\n');
        console.log('Full response structure:');
        console.log(JSON.stringify(response.data, null, 2));

        // Analyze the content structure
        if (response.data && response.data.content) {
            const pages = Array.isArray(response.data.content)
                ? response.data.content
                : [response.data.content];

            console.log(`\n📊 Content Analysis:`);
            console.log(`Total pages in content: ${pages.length}`);

            pages.forEach((page, pageIdx) => {
                console.log(`\n--- Page ${pageIdx + 1} ---`);
                const words = page.words || [];
                console.log(`Words count: ${words.length}`);

                words.forEach((item, idx) => {
                    console.log(`  ${idx + 1}. word: "${item.word}", image: "${item.image}"`);
                });
            });

            // Check for duplicates across pages
            const allImages = [];
            const allWords = [];

            pages.forEach((page, pageIdx) => {
                const words = page.words || [];
                words.forEach((item) => {
                    allImages.push({ page: pageIdx + 1, image: item.image });
                    allWords.push({ page: pageIdx + 1, word: item.word });
                });
            });

            console.log(`\n🔍 Duplicate Check:`);
            const imageSet = new Set();
            const duplicateImages = [];
            allImages.forEach(item => {
                if (imageSet.has(item.image)) {
                    duplicateImages.push(item);
                } else {
                    imageSet.add(item.image);
                }
            });

            if (duplicateImages.length > 0) {
                console.log(`❌ Found ${duplicateImages.length} duplicate images:`);
                duplicateImages.forEach(dup => {
                    console.log(`  Page ${dup.page}: ${dup.image}`);
                });
            } else {
                console.log(`✅ All images are unique across pages!`);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testCVCWordsAPI();
