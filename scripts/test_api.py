"""测试 Google Imagen API"""
import requests
import json

API_KEY = "AIzaSyAnEzDQGMovthxw-JnBKEDkSDMVBi331zI"
API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"

url = f"{API_ENDPOINT}?key={API_KEY}"

payload = {
    "contents": [
        {
            "role": "user",
            "parts": [
                {
                    "text": "Generate a simple line drawing of a cute cat, black outline only, white background, coloring book style"
                }
            ]
        }
    ],
    "generationConfig": {
        "responseModalities": ["IMAGE", "TEXT"]
    }
}

headers = {
    "Content-Type": "application/json"
}

print(f"Testing API...")
print(f"URL: {url[:80]}...")

try:
    response = requests.post(url, json=payload, headers=headers, timeout=120)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        # 提取图片数据
        parts = data["candidates"][0]["content"]["parts"]
        for part in parts:
            if "inlineData" in part:
                import base64
                image_data = base64.b64decode(part["inlineData"]["data"])
                output_path = "docs/test_imagen_output.png"
                with open(output_path, "wb") as f:
                    f.write(image_data)
                print(f"✅ 图片已保存: {output_path}")
                break
    else:
        print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Error: {e}")
