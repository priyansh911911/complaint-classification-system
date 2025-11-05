from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app)

def handler(req):
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
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
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
        
        return jsonify({
            "reply": bot_reply,
            "status": "success"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Export for Vercel
default = handler