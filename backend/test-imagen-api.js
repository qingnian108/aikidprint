/**
 * 测试 Google Generative Language API (Gemini 2.5 Flash Image)
 */

const API_KEY = 'AIzaSyAnEzDQGMovthxw-JnBKEDkSDMVBi331zI';
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

async function testImagenAPI() {
    const url = `${API_ENDPOINT}?key=${API_KEY}`;
    
    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: 'Generate a simple line drawing of a cute cat, black and white, minimalist style, white background'
                    }
                ]
            }
        ],
        generationConfig: {
            responseModalities: ['IMAGE'],
            temperature: 0.4
        }
    };
    
    console.log('正在调用 API...');
    console.log('端点:', API_ENDPOINT);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('响应状态:', response.status);
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('API 错误:', JSON.stringify(data, null, 2));
            return;
        }
        
        if (data.candidates && data.candidates[0]) {
            const candidate = data.candidates[0];
            console.log('finishReason:', candidate.finishReason);
            
            const inlineData = candidate.content?.parts?.[0]?.inlineData;
            if (inlineData) {
                console.log('✅ 成功获取图片!');
                console.log('mimeType:', inlineData.mimeType);
                console.log('data 长度:', inlineData.data?.length || 0, '字符');
                
                // 保存图片
                const fs = await import('fs');
                const buffer = Buffer.from(inlineData.data, 'base64');
                fs.writeFileSync('test-output.png', buffer);
                console.log('图片已保存到 backend/test-output.png');
            } else {
                console.log('响应内容:', JSON.stringify(data, null, 2));
            }
        } else {
            console.log('完整响应:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('请求失败:', error.message);
    }
}

testImagenAPI();
