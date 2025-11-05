# Complaint Classification System

A full-stack web application that uses Google's Gemini AI to classify and manage student complaints. Features include student login, complaint submission, AI-powered classification, chatbot assistance, and admin dashboard.

## 🚀 Features

- **Student Portal**: Login, submit complaints, view complaint history
- **AI Classification**: Automatic categorization using Google Gemini AI
- **Sentiment Analysis**: Detects urgency levels (normal, angry, urgent)
- **Chatbot Support**: AI-powered troubleshooting assistance
- **Admin Dashboard**: View and manage all complaints
- **Real-time Status**: Track complaint resolution status

## 📋 Prerequisites

Before running this project, make sure you have:

- **Python 3.7+** installed
- **Node.js 14+** and npm installed
- **Google Gemini API Key** (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd FLASK
```

### 2. Backend Setup (Flask)

1. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

2. **Configure Gemini API Key:**
   - Open `app.py`
   - Replace the API key on line 52 with your own:
   ```python
   genai.configure(api_key='YOUR_GEMINI_API_KEY_HERE')
   ```

3. **Run the Flask server:**
```bash
python app.py
```

The backend will start on `http://127.0.0.1:5000`

### 3. Frontend Setup (React)

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install Node.js dependencies:**
```bash
npm install
```

3. **Start the React development server:**
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## 🎯 Usage Guide

### For Students:
1. Go to `http://localhost:3000`
2. Login with demo credentials:
   - Student ID: `STU001`, `STU002`, or `STU003`
   - Password: `student123`
3. Submit complaints and track their status
4. Use the chatbot for instant help

### For Administrators:
1. Go to `http://localhost:3000/admin`
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. View and resolve complaints

## 📊 Complaint Categories

The AI classifies complaints into:
- **Mess** - Food and dining related issues
- **WiFi/Network** - Internet connectivity problems
- **Technical Issue** - Hardware/software problems
- **Academic/Teacher** - Educational concerns
- **Safety/Security** - Campus safety issues

## 🗂️ Project Structure

```
FLASK/
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── complaints.db         # SQLite database (auto-created)
├── README.md            # This file
└── frontend/
    ├── package.json     # Node.js dependencies
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js           # Main React component
        ├── StudentLogin.js  # Student authentication
        ├── StudentDashboard.js # Student interface
        ├── ComplaintForm.js # Complaint submission
        ├── ChatBot.js      # AI chatbot component
        ├── AdminDashboard.js # Admin interface
        └── index.js        # React entry point
```

## 🔧 Dependencies

### Backend (Python)
- Flask 2.3.3 - Web framework
- Flask-CORS 4.0.0 - Cross-origin requests
- google-generativeai 0.3.2 - Gemini AI integration
- sqlite3 - Database (built-in)

### Frontend (React)
- React 18.2.0 - UI framework
- react-dom 18.2.0 - DOM rendering
- react-scripts 5.0.1 - Build tools

## 🚨 Important Notes

1. **API Key Security**: Replace the hardcoded API key in `app.py` with your own
2. **Database**: SQLite database (`complaints.db`) is created automatically
3. **Demo Data**: Includes 3 demo student accounts for testing
4. **CORS**: Configured for localhost development only

## 🐛 Troubleshooting

**Backend won't start:**
- Check Python version: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Verify API key is set correctly

**Frontend won't start:**
- Check Node.js version: `node --version`
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

**Database issues:**
- Delete `complaints.db` file to reset database
- Restart Flask server to recreate tables

## 📝 License

This project is for educational purposes.