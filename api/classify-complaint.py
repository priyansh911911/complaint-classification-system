from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from db import get_db_connection, init_db

app = Flask(__name__)
CORS(app)

def handler(req):
    init_db()
    
    if req.method != 'POST':
        return jsonify({"error": "Method not allowed"}), 405
    
    try:
        # Configure Gemini API
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            return jsonify({"error": "API key not configured"}), 500
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        data = req.get_json()
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
            classification_prompt = f"""
            Classify the following complaint into ONLY ONE of these categories:
            ["Mess", "WiFi/Network", "Technical Issue", "Academic/Teacher", "Safety/Security"]
            
            Complaint: "{complaint_text}"
            
            Respond with only the category name, nothing else.
            """
            
            classification_response = model.generate_content(classification_prompt)
            category = classification_response.text.strip()
            
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
        
        valid_sentiments = ["urgent", "angry", "normal"]
        if sentiment not in valid_sentiments:
            sentiment = "normal"
        
        # Save to database
        conn = get_db_connection()
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

# Export for Vercel
default = handler