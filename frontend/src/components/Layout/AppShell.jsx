import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserButton, useUser } from '@clerk/clerk-react';
import DashboardPanel from './DashboardPanel';

/**
 * AppShell - Main layout with sidebar dashboard
 */
function AppShell({ children }) {
  const { user } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Dashboard */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 shadow-sm overflow-hidden hidden lg:block`}>
        {isSidebarOpen && <DashboardPanel isSidebar={true} />}
      </aside>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-80 bg-white border-r border-gray-200 shadow-lg overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <DashboardPanel isSidebar={true} />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm"
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo and Sidebar Toggle */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="hidden lg:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <Link to="/workspace" className="flex items-center">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center"
                  >
                    <span className="text-xl font-semibold text-gray-900">
                      PDF Assistant
                    </span>
                  </motion.div>
                </Link>
              </div>

              {/* Right side - Profile */}
              <div className="flex items-center gap-4">
                {user && (
                  <span className="hidden sm:block text-sm text-gray-600">
                    {user.firstName || user.emailAddresses[0]?.emailAddress}
                  </span>
                )}
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9 border border-gray-300 hover:border-gray-400 transition-colors',
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
