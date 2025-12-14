// 测试 Pattern Compare API
const API_KEY = process.env.GOOGLE_API_KEY;
// 使用支持图片生成的模型
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent';

async function testPatternCompare() {
    if (!API_KEY) {
        console.error('GOOGLE_API_KEY 未设置');
        return;
    }

    const prompt = `Create a "Spot the Difference" game image. Draw the EXACT SAME cute dinosaur scene TWICE, stacked vertically. CRITICAL: Both images must be 99% IDENTICAL. Cute pastel children's illustration style. No text, no borders. Aspect ratio 3:4 vertical.`;

    const url = `${API_ENDPOINT}?key=${API_KEY}`;
    
    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],
        generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
            temperature: 0.4
        }
    };

    console.log('Testing Gemini 2.5 Pro Image API...');
    console.log('URL:', API_ENDPOINT);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error:', errorText);
            return;
        }

        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2).substring(0, 500));
        
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.inlineData) {
            console.log('✓ Image generated successfully!');
        } else {
            console.log('✗ No image in response');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testPatternCompare();
