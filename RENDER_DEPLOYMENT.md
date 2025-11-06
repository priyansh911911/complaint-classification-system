# Render Deployment Guide

## Prerequisites
1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Deployment Steps

### 1. Prepare Your Repository
```bash
# Push all changes to GitHub
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create Render Services

#### Backend (Web Service)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `complaint-classifier-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Instance Type**: `Free` (or `Starter` for better performance)

#### Frontend (Static Site)
1. Click "New +" → "Static Site"
2. Connect same GitHub repository
3. Configure:
   - **Name**: `complaint-classifier-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`

### 3. Configure Environment Variables
In Backend Web Service → Environment:

Add:
- **GEMINI_API_KEY**: Your actual Gemini API key
- **FLASK_ENV**: `production`
- **PORT**: `10000` (Render default)

### 4. Update Configuration Files

#### Create `render.yaml` (Optional - Infrastructure as Code)
```yaml
services:
  - type: web
    name: complaint-classifier-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python app.py
    envVars:
      - key: GEMINI_API_KEY
        sync: false
      - key: FLASK_ENV
        value: production
      - key: PORT
        value: 10000

  - type: web
    name: complaint-classifier-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/build
```

#### Update `app.py` for Render
```python
import os
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Configure CORS for Render
if os.environ.get('FLASK_ENV') == 'production':
    CORS(app, origins=['https://your-frontend-url.onrender.com'])
else:
    CORS(app)

# Use Render's PORT environment variable
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

#### Update Frontend API Configuration
Create `frontend/src/config.js`:
```javascript
const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.onrender.com'
    : 'http://127.0.0.1:5000'
};

export default config;
```

## Project Structure for Render
```
FLASK/
├── render.yaml              # Render configuration (optional)
├── requirements.txt         # Python dependencies
├── app.py                  # Flask backend (updated for Render)
├── complaints.db           # SQLite database
└── frontend/
    ├── package.json
    ├── src/
    │   ├── config.js       # API endpoint configuration
    │   └── ...
    └── build/              # Built React app (auto-generated)
```

## API Endpoints (Production)
- `POST /student-login` - Student authentication
- `POST /admin-login` - Admin authentication
- `POST /classify-complaint` - Submit and classify complaints
- `POST /chatbot` - Chatbot interactions
- `GET /complaints` - Get all complaints (admin)
- `PUT /complaints/<id>/resolve` - Resolve complaint
- `GET /student-complaints/<id>` - Get student's complaints

## Database Configuration

### SQLite (Default - Free Tier)
- Database persists in `/opt/render/project/src`
- Suitable for development and small applications
- No additional setup required

### PostgreSQL (Recommended for Production)
1. Create PostgreSQL database:
   - Click "New +" → "PostgreSQL"
   - Name: `complaint-classifier-db`
   - Plan: `Free` or `Starter`

2. Update `requirements.txt`:
```txt
Flask==2.3.3
Flask-CORS==4.0.0
google-generativeai==0.3.2
psycopg2-binary==2.9.7
```

3. Update `app.py` for PostgreSQL:
```python
import os
import psycopg2
from urllib.parse import urlparse

# Database configuration
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    # PostgreSQL (Production)
    url = urlparse(DATABASE_URL)
    # Use psycopg2 for PostgreSQL operations
else:
    # SQLite (Development)
    # Existing SQLite code
```

## Environment Variables Reference
| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `FLASK_ENV` | Environment (production/development) | Yes |
| `PORT` | Server port (auto-set by Render) | No |
| `DATABASE_URL` | PostgreSQL connection string | No |

## Deployment Process

### Automatic Deployment
1. **Push to GitHub**: Changes trigger automatic deployment
2. **Build Process**: Render installs dependencies and builds
3. **Health Checks**: Render verifies service is running
4. **Live URL**: Service becomes available at provided URL

### Manual Deployment
1. Go to service dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Monitor build logs for any issues

## Important Notes

### Free Tier Limitations
- **Sleep Mode**: Services sleep after 15 minutes of inactivity
- **Build Time**: 500 build minutes per month
- **Bandwidth**: 100GB per month
- **Cold Starts**: ~30 seconds to wake up

### Performance Optimization
1. **Upgrade to Starter Plan**: Eliminates sleep mode
2. **Use PostgreSQL**: Better performance than SQLite
3. **Enable Caching**: Add Redis for session management
4. **CDN**: Use Render's built-in CDN for static assets

### Security Best Practices
1. **Environment Variables**: Never commit API keys
2. **CORS Configuration**: Restrict to your frontend domain
3. **HTTPS**: Render provides SSL certificates automatically
4. **Database Security**: Use connection pooling for PostgreSQL

## Troubleshooting

### Build Failures
```bash
# Check build logs in Render dashboard
# Common issues:
# - Missing dependencies in requirements.txt
# - Python version compatibility
# - Build timeout (increase instance type)
```

### Runtime Errors
```bash
# Check service logs in dashboard
# Common issues:
# - Port binding (ensure app.run uses host='0.0.0.0')
# - Environment variables not set
# - Database connection issues
```

### Database Issues
```bash
# SQLite permissions
# - Ensure write permissions in deployment directory
# PostgreSQL connection
# - Verify DATABASE_URL is set correctly
# - Check connection string format
```

## Local Development
```bash
# Backend (Terminal 1)
export FLASK_ENV=development
python app.py

# Frontend (Terminal 2)
cd frontend
npm start
```

## Production URLs
After deployment, your services will be available at:
- **Backend**: `https://complaint-classifier-backend.onrender.com`
- **Frontend**: `https://complaint-classifier-frontend.onrender.com`
- **Admin**: `https://complaint-classifier-frontend.onrender.com/admin`

## Monitoring & Maintenance

### Health Monitoring
- **Uptime Monitoring**: Built-in health checks
- **Performance Metrics**: CPU, memory, response time
- **Error Tracking**: Service logs and alerts

### Backup Strategy
```bash
# For PostgreSQL
# Render provides automatic backups
# Manual backup via pg_dump available

# For SQLite
# Download database file from service shell
```

## Scaling Options

### Horizontal Scaling
- **Load Balancing**: Multiple service instances
- **Database Replicas**: Read replicas for PostgreSQL
- **CDN**: Global content distribution

### Vertical Scaling
- **Instance Types**: Starter → Standard → Pro
- **Database Plans**: Free → Starter → Standard
- **Storage**: Persistent disk upgrades

## Cost Estimation
| Service | Free Tier | Starter | Standard |
|---------|-----------|---------|----------|
| Web Service | $0 (with limitations) | $7/month | $25/month |
| Static Site | $0 | - | - |
| PostgreSQL | $0 (1GB) | $7/month | $20/month |

## Next Steps
1. **Custom Domain**: Configure in service settings
2. **SSL Certificate**: Automatic with custom domains
3. **Monitoring**: Set up alerts and notifications
4. **Backup**: Configure automated backups
5. **CI/CD**: Advanced deployment workflows