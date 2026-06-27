import urllib.request
import urllib.error
import json
import traceback

def test_static():
    url = "http://localhost:3000/index.html"
    try:
        with urllib.request.urlopen(url) as response:
            html = response.read().decode('utf-8')
            print("[Test Static] Success! HTML Length:", len(html))
            return True
    except Exception as e:
        print("[Test Static] Failed:")
        traceback.print_exc()
        return False

def test_login():
    url = "http://localhost:3000/api/auth/login"
    data = json.dumps({"username": "thaw", "password": "thaw"}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            print("[Test Login] Success:", res)
            return True
    except Exception as e:
        print("[Test Login] Failed:")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Testing GET static file...")
    test_static()
    print("\nTesting POST login...")
    test_login()
