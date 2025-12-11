// Test script to debug API
const testData = {
    categoryId: 'literacy',
    pageTypeId: 'uppercase-tracing',
    config: {
        letter: 'A',
        theme: 'dinosaur'
    }
};

console.log('Testing API with:', JSON.stringify(testData, null, 2));

fetch('http://localhost:3000/api/worksheets/generate-image', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
})
    .then(res => {
        console.log('Response status:', res.status);
        return res.json();
    })
    .then(data => {
        console.log('Response data:', JSON.stringify(data, null, 2));
    })
    .catch(err => {
        console.error('Error:', err);
    });
