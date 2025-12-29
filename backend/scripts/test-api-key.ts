import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY;

async function testGeminiAPI() {
  console.log('🔑 Testing Gemini API Key...\n');
  
  if (!API_KEY) {
    console.error('❌ GOOGLE_API_KEY not found in .env');
    process.exit(1);
  }
  
  console.log(`API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}`);
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say "Hello, API is working!" in one line.' }]
        }]
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('\n✅ API Key is valid!');
      console.log(`📝 Response: ${text}`);
    } else {
      console.error('\n❌ API Error:', data.error?.message || JSON.stringify(data));
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error);
  }
}

testGeminiAPI();
