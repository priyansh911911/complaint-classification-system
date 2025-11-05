from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def handler(request):
    if request.method != 'POST':
        return jsonify({"error": "Method not allowed"}), 405
    
    try:
        data = request.get_json()
        username = data.get('username', '')
        password = data.get('password', '')
        
        if username == 'admin' and password == 'admin123':
            return jsonify({"success": True, "message": "Login successful"})
        else:
            return jsonify({"success": False, "message": "Invalid credentials"}), 401
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500