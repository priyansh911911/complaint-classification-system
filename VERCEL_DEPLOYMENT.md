# Vercel Deployment Guide

## Prerequisites
1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Deployment Steps

### 1. Prepare Your Repository
```bash
# Push all changes to GitHub
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: complaint-classifier
# - Directory: ./
# - Override settings? No
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/build`

### 3. Configure Environment Variables
In Vercel Dashboard → Project → Settings → Environment Variables:

Add:
- **Name**: `GEMINI_API_KEY`
- **Value**: Your actual Gemini API key
- **Environment**: Production, Preview, Development

### 4. Update API Configuration
The project is already configured to use:
- **Production**: `/api/*` (Vercel serverless functions)
- **Development**: `http://127.0.0.1:5000` (local Flask server)

## Project Structure for Vercel
```
FLASK/
├── vercel.json              # Vercel configuration
├── api/                     # Serverless functions
│   ├── requirements.txt     # Python dependencies
│   ├── db.py               # Database utilities
│   ├── student-login.py    # Student authentication
│   ├── admin-login.py      # Admin authentication
│   ├── classify-complaint.py # AI classification
│   ├── chatbot.py          # Chatbot responses
│   ├── complaints.py       # Complaint management
│   └── student-complaints.py # Student complaint history
└── frontend/               # React application
    ├── package.json
    ├── src/
    │   ├── config.js       # API endpoint configuration
    │   └── ...
    └── build/              # Built React app (auto-generated)
```

## API Endpoints (Production)
- `POST /api/student-login` - Student authentication
- `POST /api/admin-login` - Admin authentication
- `POST /api/classify-complaint` - Submit and classify complaints
- `POST /api/chatbot` - Chatbot interactions
- `GET /api/complaints` - Get all complaints (admin)
- `PUT /api/complaints/{id}/resolve` - Resolve complaint
- `GET /api/student-complaints/{id}` - Get student's complaints

## Important Notes

### Database Limitations
- Uses SQLite in `/tmp` directory (Vercel limitation)
- Database resets on each deployment
- For production, consider upgrading to:
  - **Vercel Postgres** (recommended)
  - **PlanetScale** (MySQL)
  - **Supabase** (PostgreSQL)

### Demo Accounts
The following accounts are auto-created:
- **Students**: STU001, STU002, STU003 (password: student123)
- **Admin**: admin (password: admin123)

### Security Considerations
1. **API Key**: Stored as environment variable
2. **CORS**: Configured for production domain
3. **Database**: Consider upgrading for persistent data

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
vercel --prod --force
```

### API Function Errors
- Check Vercel Function logs in dashboard
- Ensure environment variables are set
- Verify API key is valid

### Database Issues
- Database resets on each deployment
- Check `/tmp` directory permissions
- Consider external database for persistence

## Local Development
```bash
# Backend (Terminal 1)
python app.py

# Frontend (Terminal 2)
cd frontend
npm start
```

## Production URLs
After deployment, your app will be available at:
- **Main App**: `https://your-project.vercel.app`
- **Admin**: `https://your-project.vercel.app/admin`
- **API**: `https://your-project.vercel.app/api/*`

## Next Steps
1. **Custom Domain**: Add in Vercel dashboard
2. **Persistent Database**: Upgrade from SQLite
3. **Monitoring**: Set up error tracking
4. **Analytics**: Add usage analytics