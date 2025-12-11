/**
 * 测试 Number Path API
 */

const url = 'http://localhost:3000/api/worksheets/generate-image';

const payload = {
    categoryId: 'math',
    pageTypeId: 'number-path',
    config: {
        theme: 'dinosaur',
        maxNumber: 20,
        pageCount: 1
    }
};

async function test() {
    console.log('Testing Number Path API...');
    console.log('URL:', url);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        console.log('\nStatus:', response.status);
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

test();
