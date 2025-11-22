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
    <div className="min-h-screen bg-[#050509]">
      {/* Top Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-sm border-b-2 border-red-500/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/workspace" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center"
              >
                <span className="text-2xl font-black uppercase tracking-widest text-red-400 glow-red px-4 py-2">
                  PDF GENIE
                </span>
              </motion.div>
            </Link>

            {/* Right side - Profile */}
            <div className="flex items-center gap-4">
              {user && (
                <span className="hidden sm:block text-sm text-slate-400 uppercase tracking-wider">
                  {user.firstName || user.emailAddresses[0]?.emailAddress}
                </span>
              )}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsDashboardOpen(true)}
                className="cursor-pointer"
              >
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10 border-2 border-red-500/50 hover:border-red-400 transition-colors',
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
