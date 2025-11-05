# API Key Configuration

## IMPORTANT: Replace the API Key

The current `app.py` file contains a hardcoded API key that needs to be replaced.

### Step 1: Get Your Own API Key
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the generated key

### Step 2: Update the Code
Open `app.py` and find line 52:
```python
genai.configure(api_key='AIzaSyDjTRv3jSaaNy1FHJhcTxs4v_lliqKUAKQ')
```

Replace with your key:
```python
genai.configure(api_key='YOUR_NEW_API_KEY_HERE')
```

### Alternative: Environment Variable (Recommended)
For better security, use environment variables:

1. **Update app.py:**
```python
import os
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
```

2. **Set environment variable:**

**Windows:**
```bash
set GEMINI_API_KEY=your_api_key_here
```

**Mac/Linux:**
```bash
export GEMINI_API_KEY=your_api_key_here
```

### Why This is Important
- API keys are personal and have usage limits
- Sharing API keys can lead to unauthorized usage
- Each person should use their own key for tracking and billing

### Free Tier Limits
Google Gemini API free tier includes:
- 15 requests per minute
- 1 million tokens per minute
- 1,500 requests per day

This is sufficient for testing and small-scale usage.