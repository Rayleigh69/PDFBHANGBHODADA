import { createContext, useContext, useState } from 'react';

/**
 * AppContext - Global state for PDFs and activity
 */
const AppContext = createContext();

export function AppProvider({ children }) {
  const [uploadedPDFs, setUploadedPDFs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Stats (can be derived from state or loaded from backend later)
  const [stats, setStats] = useState({
    totalPDFs: 0,
    totalChats: 0,
    pdfsEdited: 0,
    customPDFsCreated: 0,
  });

  // Add activity
  const addActivity = (activity) => {
    setRecentActivity((prev) => [
      {
        ...activity,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 50)); // Keep last 50 activities
  };

  // Update stats
  const updateStats = (updates) => {
    setStats((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider
      value={{
        uploadedPDFs,
        setUploadedPDFs,
        recentActivity,
        addActivity,
        stats,
        updateStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

