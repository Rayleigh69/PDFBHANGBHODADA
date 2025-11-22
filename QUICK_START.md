# Quick Start Guide

Get PDF Genie running in 5 minutes!

## Prerequisites Check

- ✅ Python 3.8+ installed? Run: `python --version`
- ✅ Node.js 18+ installed? Run: `node --version`
- ✅ Clerk account? Sign up at https://dashboard.clerk.com (free)

## Step-by-Step Setup

### 1. Backend (Terminal 1)

```bash
# Navigate to backend
cd backend

# Install dependencies (takes 2-3 minutes)
pip install -r requirements.txt

# Run the server
python run.py
```

**Expected output:**
```
PDF Genie API starting up...
API ready!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ **Test:** Open http://localhost:8000/health - should show `{"status": "ok"}`

### 2. Frontend (Terminal 2)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Get your Clerk key
# 1. Go to https://dashboard.clerk.com
# 2. Create an application
# 3. Copy the "Publishable Key"

# Create .env file
echo "VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here" > .env
# ⚠️ Replace pk_test_your_key_here with your actual key!

# Run the frontend
npm run dev
```

**Expected output:**
```
VITE v7.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

✅ **Test:** Open http://localhost:5173 - should show sign-in page

### 3. First Use

1. **Sign Up:** Click "Sign up" and create an account
2. **Upload PDF:** Go to Workspace → Upload tab, upload a PDF
3. **Chat:** Go to Chat tab, select PDF, ask a question
4. **Edit:** Go to Edit tab, add text or images to PDF
5. **Create:** Go to Create tab, generate a custom PDF

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.8+)
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Clerk not working
- Check `.env` file exists in `frontend/` directory
- Verify key starts with `pk_test_` or `pk_live_`
- Restart dev server after adding key

### CORS errors
- Make sure backend is running on port 8000
- Check `backend/config.py` has `http://localhost:5173` in CORS_ORIGINS

### Can't connect to backend
- Verify backend is running: http://localhost:8000/health
- Check `frontend/src/api.js` has correct `baseURL`

## Need Help?

See `SETUP.md` for detailed troubleshooting and configuration options.

