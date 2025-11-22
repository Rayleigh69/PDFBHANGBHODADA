# PDF Genie - Complete Setup Guide

This guide will help you get the full-stack PDF Genie application running end-to-end.

## Prerequisites

- Python 3.8+ installed
- Node.js 18+ and npm installed
- A Clerk account (free tier works) - https://dashboard.clerk.com

## Project Structure

```
Pdf/
├── backend/          # FastAPI backend
│   ├── main.py      # FastAPI app
│   ├── requirements.txt
│   └── data/        # Auto-created directories
├── frontend/        # React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── .env         # Create this file
└── SETUP.md         # This file
```

## Step 1: Backend Setup

### 1.1 Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Note:** Installing `sentence-transformers` and `faiss-cpu` may take a few minutes.

### 1.2 Verify Data Directories

The backend will automatically create these directories on first run:
- `data/uploads/` - For uploaded PDFs
- `data/generated/` - For generated/edited PDFs
- `data/indexes/` - For FAISS vector indexes

### 1.3 Run the Backend

```bash
# Option 1: Using the run script
python run.py

# Option 2: Using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

You should see:
```
PDF Genie API starting up...
Upload directory: ...
Generated directory: ...
Index directory: ...
API ready!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 1.4 Verify Backend is Running

Open your browser and visit:
- Health check: http://localhost:8000/health
- API docs: http://localhost:8000/docs

You should see `{"status": "ok"}` for the health check.

## Step 2: Frontend Setup

### 2.1 Install Node Dependencies

```bash
cd frontend
npm install
```

### 2.2 Set Up Clerk Authentication

1. Go to https://dashboard.clerk.com and sign up/login
2. Create a new application
3. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

4. Create a `.env` file in the `frontend` directory:

```bash
cd frontend
touch .env
```

5. Add your Clerk key to `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
```

**Important:** Replace `pk_test_your_actual_key_here` with your actual Clerk publishable key.

### 2.3 Run the Frontend

```bash
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Step 3: Verify Everything Works

### 3.1 Test Authentication

1. Open http://localhost:5173 in your browser
2. You should be redirected to the sign-in page
3. Click "Sign up" to create an account
4. After signing up, you should be redirected to the dashboard

### 3.2 Test Backend Connection

1. In the dashboard, click "Upload a PDF" or go to Workspace → Upload tab
2. Upload a PDF file
3. Check the browser console (F12) - there should be no CORS errors
4. Check the backend terminal - you should see the upload request

### 3.3 Test PDF Chat

1. After uploading a PDF, go to the Chat tab
2. Select the uploaded PDF
3. Ask a question like "What is this document about?"
4. You should receive a response with sources

## Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError` when running backend
- **Solution:** Make sure you installed all requirements: `pip install -r requirements.txt`

**Problem:** Port 8000 already in use
- **Solution:** Kill the process using port 8000 or change the port in `run.py`

**Problem:** CORS errors in browser
- **Solution:** Verify `backend/config.py` has the correct CORS origins (should include `http://localhost:5173`)

### Frontend Issues

**Problem:** Clerk authentication not working
- **Solution:** 
  1. Verify `.env` file exists in `frontend/` directory
  2. Verify `VITE_CLERK_PUBLISHABLE_KEY` is set correctly
  3. Restart the dev server after adding the key
  4. Check browser console for errors

**Problem:** Cannot connect to backend
- **Solution:**
  1. Verify backend is running on http://localhost:8000
  2. Check `frontend/src/api.js` has `baseURL: 'http://localhost:8000'`
  3. Check browser console for network errors

**Problem:** `npm run dev` fails
- **Solution:**
  1. Delete `node_modules` and `package-lock.json`
  2. Run `npm install` again
  3. Check Node.js version: `node --version` (should be 18+)

### Common Errors

**Error:** "Missing Clerk Publishable Key"
- **Fix:** Add `VITE_CLERK_PUBLISHABLE_KEY` to `frontend/.env`

**Error:** "Network Error" or "CORS Error"
- **Fix:** Make sure backend is running and CORS is configured correctly

**Error:** "404 Not Found" on API calls
- **Fix:** Verify backend routes match frontend API calls (check `backend/main.py` and `frontend/src/api.js`)

## Running Both Servers

You need to run both servers simultaneously:

**Terminal 1 - Backend:**
```bash
cd backend
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open http://localhost:5173 in your browser.

## Next Steps

- Customize the UI in `frontend/src/`
- Add more features to the backend in `backend/main.py`
- Deploy to production (see deployment guides for FastAPI and Vite)

## Support

If you encounter issues:
1. Check the browser console (F12) for errors
2. Check the backend terminal for errors
3. Verify all environment variables are set correctly
4. Make sure both servers are running

