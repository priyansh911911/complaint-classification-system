from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from db import get_db_connection, init_db

app = Flask(__name__)
CORS(app)

def handler(request):
    init_db()
    
    if request.method == 'GET':
        # Get all complaints for admin
        try:
            conn = get_db_connection()
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute('SELECT * FROM complaints ORDER BY timestamp DESC')
            complaints = c.fetchall()
            conn.close()
            
            complaint_list = []
            for complaint in complaints:
                complaint_list.append({
                    "id": complaint['id'],
                    "student_name": complaint['student_name'],
                    "complaint_text": complaint['complaint_text'],
                    "category": complaint['category'],
                    "sentiment": complaint['sentiment'],
                    "status": complaint['status'],
                    "timestamp": complaint['timestamp']
                })
            
            return jsonify({"complaints": complaint_list})
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    elif request.method == 'PUT':
        # Resolve complaint
        try:
            # Extract complaint ID from URL path
            path_parts = request.path.split('/')
            complaint_id = None
            for i, part in enumerate(path_parts):
                if part == 'complaints' and i + 1 < len(path_parts):
                    complaint_id = path_parts[i + 1]
                    break
            
            if not complaint_id:
                return jsonify({"error": "Complaint ID not found"}), 400
            
            conn = get_db_connection()
            c = conn.cursor()
            c.execute('UPDATE complaints SET status = "resolved" WHERE id = ?', (complaint_id,))
            conn.commit()
            conn.close()
            
            return jsonify({"message": "Complaint resolved successfully"})
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    else:
        return jsonify({"error": "Method not allowed"}), 405