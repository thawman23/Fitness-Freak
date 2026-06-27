import http.server
import socketserver
import json
import os
import urllib.parse

PORT = 3000
DB_FILE = "database.json"

# Helper to load JSON database
def load_db():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, 'w') as f:
            json.dump({"users": {}}, f, indent=2)
    try:
        with open(DB_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"[Error] Failed to read database: {e}. Resetting...")
        return {"users": {}}

# Helper to save JSON database
def save_db(db):
    try:
        with open(DB_FILE, 'w') as f:
            json.dump(db, f, indent=2)
    except Exception as e:
        print(f"[Error] Failed to write database: {e}")

class ThawmanBackendHandler(http.server.SimpleHTTPRequestHandler):
    
    # 1. Enable CORS for pre-flight options
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    # 2. Handle POST actions (Register, Login, Sync Push)
    def do_POST(self):
        # Enable CORS response headers
        self.send_response_only = False
        
    # 2. Handle POST actions (Register, Login, Sync Push)
    def do_POST(self):
        # Enable CORS response headers
        self.send_response_only = False
        
        # Read content length and raw post data safely
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            print(f"[Debug POST] Path: {self.path}, Content-Length: {content_length}")
            post_data = self.rfile.read(content_length) if content_length > 0 else b""
            raw_str = post_data.decode('utf-8')
            print(f"[Debug POST] Body: {repr(raw_str)}")
        except Exception as e:
            print(f"[Error] Failed to read POST request body: {e}")
            self.send_error_response(400, "Failed to read request body")
            return

        # Helper to parse JSON safely
        def parse_json(s):
            try:
                return json.loads(s)
            except Exception as e:
                print(f"[Error] JSON parse error: {e}. Raw data received: {repr(s)}")
                return None

        if self.path == "/api/auth/register":
            data = parse_json(raw_str)
            if data is None:
                self.send_error_response(400, "Invalid JSON payload")
                return
            
            username = data.get("username", "").strip().lower()
            password = data.get("password", "").strip()
            
            if not username or not password:
                self.send_error_response(400, "Username and password are required")
                return
                
            db = load_db()
            if username in db["users"]:
                self.send_error_response(400, "Username already exists")
                return
                
            # Create user entry
            db["users"][username] = {
                "password": password,
                "userData": {},
                "workoutHistory": [],
                "foodLog_today": [],
                "foodLog_date": "",
                "streakData": {
                    "daysLogged": [],
                    "currentStreak": 0,
                    "lastActiveDate": ""
                }
            }
            save_db(db)
            print(f"[Auth] Registered new user: {username}")
            self.send_json_response(200, {"success": True, "username": username})
            
        elif self.path == "/api/auth/login":
            data = parse_json(raw_str)
            if data is None:
                self.send_error_response(400, "Invalid JSON payload")
                return
            
            username = data.get("username", "").strip().lower()
            password = data.get("password", "").strip()
            
            if not username or not password:
                self.send_error_response(400, "Username and password are required")
                return
                
            db = load_db()
            user = db["users"].get(username)
            
            if not user or user.get("password") != password:
                self.send_error_response(401, "Invalid username or password")
                return
                
            print(f"[Auth] User logged in: {username}")
            self.send_json_response(200, {"success": True, "username": username})
            
        elif self.path == "/api/user/sync":
            data = parse_json(raw_str)
            if data is None:
                self.send_error_response(400, "Invalid JSON payload")
                return
            
            username = data.get("username", "").strip().lower()
            if not username:
                self.send_error_response(400, "Username is required")
                return
                
            db = load_db()
            user = db["users"].get(username)
            if not user:
                self.send_error_response(404, "User not found")
                return
                
            # Update records
            if "userData" in data:
                user["userData"] = data["userData"]
            if "workoutHistory" in data:
                user["workoutHistory"] = data["workoutHistory"]
            if "foodLog_today" in data:
                user["foodLog_today"] = data["foodLog_today"]
            if "foodLog_date" in data:
                user["foodLog_date"] = data["foodLog_date"]
            if "streakData" in data:
                user["streakData"] = data["streakData"]
                
            save_db(db)
            print(f"[Sync] Saved and updated sync assets for user: {username}")
            self.send_json_response(200, {"success": True})
            
        else:
            self.send_error_response(404, "Endpoint not found")

    # 3. Handle GET actions (Sync Pull, Static Files)
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        
        # If it is a user sync pull request
        if parsed_url.path == "/api/user/sync":
            query_params = urllib.parse.parse_qs(parsed_url.query)
            usernames = query_params.get("username", [])
            
            if not usernames:
                self.send_error_response(400, "Username query parameter is required")
                return
                
            username = usernames[0].strip().lower()
            db = load_db()
            user = db["users"].get(username)
            
            if not user:
                self.send_error_response(404, "User not found")
                return
                
            response_data = {
                "userData": user.get("userData", {}),
                "workoutHistory": user.get("workoutHistory", []),
                "foodLog_today": user.get("foodLog_today", []),
                "foodLog_date": user.get("foodLog_date", ""),
                "streakData": user.get("streakData", {})
            }
            self.send_json_response(200, response_data)
            
        else:
            # Standard Static files serving
            super().do_GET()

    # Utilities to send response payloads
    def send_json_response(self, status, payload):
        try:
            body = json.dumps(payload).encode('utf-8')
            self.send_response(status)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Connection", "close")
            self.end_headers()
            self.wfile.write(body)
            self.wfile.flush()
            self.close_connection = True
        except Exception as e:
            print(f"[Error] Failed to write response: {e}")

    def send_error_response(self, status, message):
        self.send_json_response(status, {"error": message})

# Running the server
def run():
    # Make sure we serve files from the current folder
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Allow port reuse to avoid 'address already in use' errors
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), ThawmanBackendHandler) as httpd:
        print("=========================================================")
        print(f"Thawman AI Fitness Python Backend running!")
        print(f"Address: http://localhost:{PORT}")
        print(f"JSON Database: {os.path.abspath(DB_FILE)}")
        print("=========================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down backend server. Goodbye!")

if __name__ == "__main__":
    run()
