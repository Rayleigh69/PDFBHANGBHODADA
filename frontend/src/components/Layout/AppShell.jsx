import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserButton, useUser } from '@clerk/clerk-react';
import ValorantPanel from '../Valorant/ValorantPanel';
import DashboardPanel from './DashboardPanel';

/**
 * AppShell - Main layout with Valorant theme
 */
function AppShell({ children }) {
  const location = useLocation();
  const { user } = useUser();
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/workspace" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center"
              >
                <span className="text-xl font-semibold text-gray-900">
                  ChatPDF
                </span>
              </motion.div>
            </Link>

            {/* Right side - Profile */}
            <div className="flex items-center gap-4">
              {user && (
                <span className="hidden sm:block text-sm text-gray-600">
                  {user.firstName || user.emailAddresses[0]?.emailAddress}
                </span>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDashboardOpen(true)}
                className="cursor-pointer"
              >
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9 border border-gray-300 hover:border-gray-400 transition-colors',
                    },
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Dashboard Panel */}
      <DashboardPanel
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />
    </div>
  );
}

export default AppShell;
