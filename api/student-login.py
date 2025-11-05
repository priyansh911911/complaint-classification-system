from http.server import BaseHTTPRequestHandler
import json
import sqlite3

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        try:
            # Initialize database
            conn = sqlite3.connect('/tmp/complaints.db')
            c = conn.cursor()
            
            c.execute('''
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    student_id TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    password TEXT NOT NULL
                )
            ''')
            
            c.execute('''
                INSERT OR IGNORE INTO students (student_id, name, email, password) 
                VALUES 
                ('STU001', 'John Doe', 'john@college.edu', 'student123'),
                ('STU002', 'Jane Smith', 'jane@college.edu', 'student123'),
                ('STU003', 'Mike Johnson', 'mike@college.edu', 'student123')
            ''')
            conn.commit()
            
            # Get request data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            student_id = data.get('student_id', '')
            password = data.get('password', '')
            
            # Check credentials
            c.execute('SELECT * FROM students WHERE student_id = ? AND password = ?', (student_id, password))
            student = c.fetchone()
            conn.close()
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            if student:
                response = {
                    "success": True,
                    "student": {
                        "id": student[1],
                        "name": student[2],
                        "email": student[3]
                    }
                }
            else:
                response = {"success": False, "message": "Invalid credentials"}
            
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))