# Quick Setup Guide

## What You Need to Install

### 1. Python (3.7 or higher)
- Download from: https://www.python.org/downloads/
- During installation, check "Add Python to PATH"
- Verify: Open command prompt and type `python --version`

### 2. Node.js (14 or higher)
- Download from: https://nodejs.org/
- Choose LTS version
- Verify: Open command prompt and type `node --version`

### 3. Google Gemini API Key
- Go to: https://makersuite.google.com/app/apikey
- Create account and generate API key
- Keep this key safe - you'll need it later

## Installation Steps

### Step 1: Download Project
1. Download the project folder
2. Extract to your desired location
3. Open command prompt in the project folder

### Step 2: Setup Backend
```bash
# Install Python packages
pip install -r requirements.txt

# Edit app.py file
# Replace line 52: genai.configure(api_key='YOUR_API_KEY_HERE')
```

### Step 3: Setup Frontend
```bash
# Go to frontend folder
cd frontend

# Install React packages
npm install

# Go back to main folder
cd ..
```

### Step 4: Run the Application
```bash
# Terminal 1: Start backend
python app.py

# Terminal 2: Start frontend (open new terminal)
cd frontend
npm start
```

## Access the Application
- Student Portal: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin

## Demo Login Credentials
**Students:**
- ID: STU001, STU002, or STU003
- Password: student123

**Admin:**
- Username: admin
- Password: admin123

## Need Help?
Check the main README.md file for detailed troubleshooting.