# PDF Genie Frontend

React + Vite frontend for PDF Genie application.

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Set Up Clerk Authentication

Create a `.env` file in the `frontend` directory:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

Get your Clerk publishable key from: https://dashboard.clerk.com

### 3. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Verify Backend Connection

Make sure the backend is running on `http://localhost:8000` (see backend README).

The frontend is configured to connect to the backend automatically via `src/api.js`.

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx              # Entry point with ClerkProvider
│   ├── App.jsx               # Main app with routing
│   ├── api.js                # Axios instance (points to backend)
│   ├── context/
│   │   └── AppContext.jsx    # Global state management
│   ├── pages/
│   │   ├── LoginPage.jsx     # Sign in page
│   │   ├── SignupPage.jsx    # Sign up page
│   │   ├── Dashboard.jsx     # User dashboard
│   │   └── Workspace.jsx     # PDF workspace with tabs
│   └── components/
│       ├── Auth/             # Auth components
│       ├── Layout/            # Layout components
│       └── Workspace/        # Workspace panels
└── .env                      # Environment variables
```

## Environment Variables

- `VITE_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key (required)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

### Clerk Authentication Not Working

1. Make sure `VITE_CLERK_PUBLISHABLE_KEY` is set in `.env`
2. Restart the dev server after adding the key
3. Check the browser console for errors

### Backend Connection Issues

1. Verify backend is running on `http://localhost:8000`
2. Check `src/api.js` has the correct `baseURL`
3. Check browser console for CORS errors
4. Verify backend CORS settings in `backend/config.py`
