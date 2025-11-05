from flask import Flask, request, jsonify
from flask_cors import CORS
from db import get_db_connection, init_db

app = Flask(__name__)
CORS(app)

def handler(request):
    init_db()
    
    if request.method != 'POST':
        return jsonify({"error": "Method not allowed"}), 405
    
    try:
        data = request.get_json()
        student_id = data.get('student_id', '')
        password = data.get('password', '')
        
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('SELECT * FROM students WHERE student_id = ? AND password = ?', (student_id, password))
        student = c.fetchone()
        conn.close()
        
        if student:
            return jsonify({
                "success": True,
                "student": {
                    "id": student[1],
                    "name": student[2],
                    "email": student[3]
                }
            })
        else:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500