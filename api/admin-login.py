from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def handler(req):
    if req.method != 'POST':
        return jsonify({"error": "Method not allowed"}), 405
    
    try:
        data = req.get_json()
        username = data.get('username', '')
        password = data.get('password', '')
        
        if username == 'admin' and password == 'admin123':
            return jsonify({"success": True, "message": "Login successful"})
        else:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Export for Vercel
default = handler