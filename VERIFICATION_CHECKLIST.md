# Verification Checklist

Use this checklist to verify everything is working correctly.

## ✅ Backend Verification

### 1. Dependencies Installed
- [ ] Run `cd backend && pip list | grep fastapi` - should show fastapi installed
- [ ] Run `pip list | grep uvicorn` - should show uvicorn installed
- [ ] Run `pip list | grep sentence-transformers` - should show installed

### 2. Backend Running
- [ ] Run `cd backend && python run.py`
- [ ] See "API ready!" message in terminal
- [ ] No import errors or exceptions

### 3. Health Check
- [ ] Open http://localhost:8000/health in browser
- [ ] See `{"status": "ok"}` response
- [ ] No 404 or 500 errors

### 4. API Documentation
- [ ] Open http://localhost:8000/docs
- [ ] See Swagger UI with all endpoints listed
- [ ] Can see `/api/pdf/upload`, `/api/pdf/chat`, etc.

### 5. CORS Configuration
- [ ] Check `backend/config.py` has `http://localhost:5173` in CORS_ORIGINS
- [ ] Check `backend/main.py` has CORSMiddleware configured

## ✅ Frontend Verification

### 1. Dependencies Installed
- [ ] Run `cd frontend && npm list @clerk/clerk-react` - should show installed
- [ ] Run `npm list react-router-dom` - should show installed
- [ ] Run `npm list axios` - should show installed

### 2. Environment Variables
- [ ] `.env` file exists in `frontend/` directory
- [ ] `.env` contains `VITE_CLERK_PUBLISHABLE_KEY=...`
- [ ] Key starts with `pk_test_` or `pk_live_`

### 3. Frontend Running
- [ ] Run `cd frontend && npm run dev`
- [ ] See "ready in xxx ms" message
- [ ] No compilation errors

### 4. Clerk Integration
- [ ] Open http://localhost:5173
- [ ] See Clerk sign-in page (not blank page)
- [ ] No console errors about missing Clerk key
- [ ] Can click "Sign up" button

### 5. API Configuration
- [ ] Check `frontend/src/api.js` has `baseURL: 'http://localhost:8000'`
- [ ] All API calls use relative paths (e.g., `/api/pdf/upload`)

## ✅ End-to-End Verification

### 1. Authentication Flow
- [ ] Sign up with Clerk works
- [ ] After sign up, redirected to dashboard
- [ ] Can see user info in navbar
- [ ] Can sign out and sign back in

### 2. PDF Upload
- [ ] Go to Workspace → Upload tab
- [ ] Upload a PDF file
- [ ] See success message
- [ ] PDF appears in uploaded list
- [ ] No CORS errors in console
- [ ] Backend terminal shows upload request

### 3. PDF Chat
- [ ] Select uploaded PDF in Chat tab
- [ ] Type a question and send
- [ ] Receive response with answer
- [ ] See sources listed below answer
- [ ] No errors in console

### 4. PDF Editing
- [ ] Go to Edit tab
- [ ] Select PDF, enter page number
- [ ] Add text with coordinates
- [ ] See success message
- [ ] Download button appears
- [ ] Can download edited PDF

### 5. Create PDF
- [ ] Go to Create tab
- [ ] Enter title and body text
- [ ] Click "Create PDF"
- [ ] See success message
- [ ] Download button appears
- [ ] Can download created PDF

## ✅ Network Verification

### 1. Backend Endpoints
Test each endpoint manually or via Swagger UI:

- [ ] `GET /health` → `{"status": "ok"}`
- [ ] `POST /api/pdf/upload` → Returns PDF IDs
- [ ] `POST /api/pdf/chat` → Returns answer + sources
- [ ] `POST /api/pdf/edit/add-text` → Returns filename
- [ ] `POST /api/pdf/edit/add-image` → Returns filename
- [ ] `POST /api/pdf/create` → Returns filename
- [ ] `GET /api/pdf/download/{filename}` → Downloads PDF

### 2. CORS Headers
- [ ] Open browser DevTools → Network tab
- [ ] Make an API request from frontend
- [ ] Check response headers include:
  - `Access-Control-Allow-Origin: http://localhost:5173`
  - `Access-Control-Allow-Methods: *`
  - `Access-Control-Allow-Headers: *`

### 3. No CORS Errors
- [ ] Open browser console (F12)
- [ ] Perform actions (upload, chat, etc.)
- [ ] No red CORS error messages
- [ ] All requests show status 200 or appropriate codes

## ✅ Code Quality Checks

### 1. No Console Errors
- [ ] Frontend console has no red errors
- [ ] Backend terminal has no exceptions
- [ ] Warnings are acceptable (not blocking)

### 2. File Structure
- [ ] `backend/data/uploads/` exists
- [ ] `backend/data/generated/` exists
- [ ] `backend/data/indexes/` exists
- [ ] `frontend/.env` exists

### 3. Import Errors
- [ ] Backend starts without import errors
- [ ] Frontend compiles without import errors
- [ ] All components render correctly

## 🎉 All Checks Passed?

If all items are checked, your PDF Genie app is fully functional!

## ❌ Issues Found?

Refer to `SETUP.md` or `QUICK_START.md` for troubleshooting steps.

