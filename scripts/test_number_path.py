"""测试 Number Path API"""
import requests
import json

url = "http://localhost:3000/api/worksheets/generate-image"

payload = {
    "categoryId": "math",
    "pageTypeId": "number-path",
    "config": {
        "theme": "dinosaur",
        "maxNumber": 20,
        "pageCount": 1
    }
}

print("Testing Number Path API...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, json=payload, timeout=120)
    print(f"\nStatus: {response.status_code}")
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"Error: {e}")
