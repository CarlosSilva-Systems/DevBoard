import urllib.request
import json
import urllib.error

url = "http://127.0.0.1:8000/auth/register"
data = {
    "email": "test_register_v2@example.com",
    "password": "password123",
    "name": "Test User V2"
}
json_data = json.dumps(data).encode('utf-8')

req = urllib.request.Request(url, data=json_data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(f"Response: {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"Error Status: {e.code}")
    print(f"Error Response: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
