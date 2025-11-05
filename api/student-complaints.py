from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from db import get_db_connection, init_db

app = Flask(__name__)
CORS(app)

def handler(req):
    init_db()
    
    if req.method != 'GET':
        return jsonify({"error": "Method not allowed"}), 405
    
    try:
        # Extract student ID from URL path
        path_parts = req.path.split('/')
        student_id = None
        for i, part in enumerate(path_parts):
            if part == 'student-complaints' and i + 1 < len(path_parts):
                student_id = path_parts[i + 1]
                break
        
        if not student_id:
            return jsonify({"error": "Student ID not found"}), 400
        
        conn = get_db_connection()
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute('SELECT * FROM complaints WHERE student_id = ? ORDER BY timestamp DESC', (student_id,))
        complaints = c.fetchall()
        conn.close()
        
        complaint_list = []
        for complaint in complaints:
            complaint_list.append({
                "id": complaint[0],
                "complaint_text": complaint[3],
                "category": complaint[4],
                "sentiment": complaint[5],
                "status": complaint[6],
                "timestamp": complaint[7]
            })
        
        return jsonify({"complaints": complaint_list})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Export for Vercel
default = handler