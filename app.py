import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import sqlite3
from datetime import datetime
import json

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Initialize database
def init_db():
    conn = sqlite3.connect('complaints.db')
    c = conn.cursor()
    
    # Students table
    c.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    # Complaints table (updated with student_id)
    c.execute('''
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            student_name TEXT NOT NULL,
            complaint_text TEXT NOT NULL,
            category TEXT NOT NULL,
            sentiment TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students (student_id)
        )
    ''')
    
    # Add student_id column to existing complaints table if it doesn't exist
    try:
        c.execute('ALTER TABLE complaints ADD COLUMN student_id TEXT')
    except:
        pass  # Column already exists
    
    # Insert demo student accounts
    c.execute('''
        INSERT OR IGNORE INTO students (student_id, name, email, password) 
        VALUES 
        ('STU001', 'John Doe', 'john@college.edu', 'student123'),
        ('STU002', 'Jane Smith', 'jane@college.edu', 'student123'),
        ('STU003', 'Mike Johnson', 'mike@college.edu', 'student123')
    ''')
    
    conn.commit()
    conn.close()

init_db()

# Configure Gemini API
genai.configure(api_key='AIzaSyDjTRv3jSaaNy1FHJhcTxs4v_lliqKUAKQ')

# List available models to find the correct one
print("Available models:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"- {m.name}")

# Use one of the available models from the list
model = genai.GenerativeModel('models/gemini-2.5-flash')
print("Using: models/gemini-2.5-flash")

@app.route('/student/login', methods=['POST'])
def student_login():
    try:
        data = request.get_json()
        student_id = data.get('student_id', '')
        password = data.get('password', '')
        
        conn = sqlite3.connect('complaints.db')
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

@app.route('/student/complaints/<student_id>', methods=['GET'])
def get_student_complaints(student_id):
    try:
        conn = sqlite3.connect('complaints.db')
        c = conn.cursor()
        conn.row_factory = sqlite3.Row
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

@app.route('/chatbot', methods=['POST'])
def chatbot_response():
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        # Focused troubleshooting prompt
        chatbot_prompt = f"""
        You are a college support assistant. Give ONE focused solution approach.
        
        Student message: "{user_message}"
        
        Respond with:
        1. Brief problem acknowledgment (1 sentence)
        2. ONE specific solution with 2-3 clear steps
        3. Ask if it worked or if they need alternative steps
        
        IMPORTANT: Use generic terms like "college WiFi", "your network", "the WiFi" - never mention specific network names like Eduroam.
        Keep response under 50 words. Be direct and actionable.
        """
        
        response = model.generate_content(chatbot_prompt)
        bot_reply = response.text.strip()
        
        # Check if this is a follow-up conversation
        conversation_context = data.get('conversation_history', [])
        if len(conversation_context) > 2:
            # Follow-up prompt for alternative solutions
            followup_prompt = f"""
            Previous conversation: {conversation_context[-2:]}
            Student's response: "{user_message}"
            
            If previous solution didn't work, give ONE different approach (2-3 steps max).
            If they've tried 2+ solutions, suggest: "Let's submit a formal complaint for admin help."
            Use generic terms only - no specific network names.
            Keep under 40 words.
            """
            
            followup_response = model.generate_content(followup_prompt)
            bot_reply = followup_response.text.strip()
        
        return jsonify({
            "reply": bot_reply,
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/classify-complaint', methods=['POST'])
def classify_complaint():
    try:
        data = request.get_json()
        complaint_text = data.get('complaint_text', '')
        student_id = data.get('student_id', '')
        student_name = data.get('student_name', 'Anonymous')
        complaint_type = data.get('complaint_type', '')
        
        if not complaint_text or not student_id:
            return jsonify({"error": "Missing complaint text or student ID"}), 400
        
        # Use student-selected category or AI classification
        if complaint_type:
            category = complaint_type
        else:
            # AI Classification
            classification_prompt = f"""
            Classify the following complaint into ONLY ONE of these categories:
            ["Mess", "WiFi/Network", "Technical Issue", "Academic/Teacher", "Safety/Security"]
            
            Complaint: "{complaint_text}"
            
            Respond with only the category name, nothing else.
            """
            
            classification_response = model.generate_content(classification_prompt)
            category = classification_response.text.strip()
            
            # Validate AI classification
            valid_categories = ["Mess", "WiFi/Network", "Technical Issue", "Academic/Teacher", "Safety/Security"]
            if category not in valid_categories:
                category = "Technical Issue"
        
        # Sentiment analysis
        sentiment_prompt = f"""
        Analyze the sentiment of this complaint and respond with ONLY ONE word:
        ["urgent", "angry", "normal"]
        
        Complaint: "{complaint_text}"
        
        Respond with only the sentiment word, nothing else.
        """
        
        sentiment_response = model.generate_content(sentiment_prompt)
        sentiment = sentiment_response.text.strip()
        
        # Validate sentiment
        valid_sentiments = ["urgent", "angry", "normal"]
        if sentiment not in valid_sentiments:
            sentiment = "normal"
        
        # Save to database
        conn = sqlite3.connect('complaints.db')
        c = conn.cursor()
        c.execute('''
            INSERT INTO complaints (student_id, student_name, complaint_text, category, sentiment)
            VALUES (?, ?, ?, ?, ?)
        ''', (student_id, student_name, complaint_text, category, sentiment))
        complaint_id = c.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            "id": complaint_id,
            "category": category,
            "sentiment": sentiment,
            "status": "Complaint Submitted Successfully"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')
    
    # Simple hardcoded credentials (for demo)
    if username == 'admin' and password == 'admin123':
        return jsonify({"success": True, "message": "Login successful"})
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/admin/complaints', methods=['GET'])
def get_all_complaints():
    try:
        conn = sqlite3.connect('complaints.db')
        conn.row_factory = sqlite3.Row  # This allows us to access columns by name
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

@app.route('/admin/complaints/<int:complaint_id>/resolve', methods=['PUT'])
def resolve_complaint(complaint_id):
    try:
        conn = sqlite3.connect('complaints.db')
        c = conn.cursor()
        c.execute('UPDATE complaints SET status = "resolved" WHERE id = ?', (complaint_id,))
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Complaint resolved successfully"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("\n🚀 Complaint Classification System Started!")
    print("📊 Student Portal: http://localhost:3000")
    print("🔧 Admin Dashboard: http://localhost:3000/admin")
    print("💾 Database: complaints.db")
    app.run(debug=True, host='127.0.0.1', port=5000)