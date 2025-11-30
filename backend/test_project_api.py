import requests
import json

url = "http://localhost:8000/api/project/init"
payload = {
    "idea": "آلة حاسبة بسيطة",
    "language": "python",
    "level": "beginner"
}

headers = {"Content-Type": "application/json"}

print("Sending request to:", url)
print("Payload:", json.dumps(payload, ensure_ascii=False, indent=2))

try:
    response = requests.post(url, json=payload, headers=headers, timeout=120)
    print(f"\nStatus: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), ensure_ascii=False, indent=2)}")
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'response'):
        print(f"Response text: {e.response.text}")
