import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AppShell from './components/Layout/AppShell';
import Workspace from './pages/Workspace';

/**
 * Main App Component with routing
 */
function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <Routes>
          {/* Public routes */}
          <Route
            path="/sign-in"
            element={
              <>
                <SignedIn>
                  <Navigate to="/workspace" replace />
                </SignedIn>
                <SignedOut>
                  <LoginPage />
                </SignedOut>
              </>
            }
          />
          
          <Route
            path="/sign-up"
            element={
              <>
                <SignedIn>
                  <Navigate to="/workspace" replace />
                </SignedIn>
                <SignedOut>
                  <SignupPage />
                </SignedOut>
              </>
            }
          />

          {/* Protected route - Only Workspace */}
          <Route
            path="/workspace"
            element={
              <>
                <SignedIn>
                  <AppShell>
                    <Workspace />
                  </AppShell>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* Root redirect */}
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <Navigate to="/workspace" replace />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            }
          />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
