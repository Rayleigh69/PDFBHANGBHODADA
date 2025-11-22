import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { useApp } from '../context/AppContext';
import { FiFileText, FiMessageSquare, FiEdit2, FiUpload, FiArrowRight, FiUser, FiCalendar } from 'react-icons/fi';
import StatCard from '../components/Dashboard/StatCard';
import ActionCard from '../components/Dashboard/ActionCard';
import RecentActivity from '../components/Dashboard/RecentActivity';
import { useEffect } from 'react';

/**
 * Dashboard - Clean, modern dashboard with user stats and quick actions
 */
function Dashboard() {
  const { user } = useUser();
  const { uploadedPDFs, recentActivity, stats, updateStats } = useApp();

  // Update stats based on state
  useEffect(() => {
    updateStats({
      totalPDFs: uploadedPDFs.length,
      totalChats: recentActivity.filter(a => a.type === 'chat').length,
      pdfsEdited: recentActivity.filter(a => a.type === 'edit').length,
      customPDFsCreated: recentActivity.filter(a => a.type === 'create').length,
    });
  }, [uploadedPDFs, recentActivity, updateStats]);

  const firstName = user?.firstName || 'there';
  const joinedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    : 'recently';

  // Sample data for recent activity
  const sampleActivities = [
    {
      id: 1,
      type: 'upload',
      fileName: 'project-proposal.pdf',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: 2,
      type: 'chat',
      query: 'What are the main points in the document?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 3,
      type: 'edit',
      fileName: 'report-2023.pdf',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 4,
      type: 'create',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];

  // Merge sample data with actual data
  const allActivities = [...sampleActivities, ...recentActivity];

  const statCards = [
    {
      title: 'Total PDFs',
      value: stats.totalPDFs || 0,
      icon: '📄',
      color: 'emerald',
    },
    {
      title: 'Chats Asked',
      value: stats.totalChats || 0,
      icon: '💬',
      color: 'blue',
    },
    {
      title: 'PDFs Edited',
      value: stats.pdfsEdited || 0,
      icon: '✏️',
      color: 'purple',
    },
    {
      title: 'Custom PDFs',
      value: stats.customPDFsCreated || 0,
      icon: '✨',
      color: 'amber',
    },
  ];

  const quickActions = [
    {
      title: 'Upload PDF',
      description: 'Upload and index PDFs',
      icon: <FiUpload className="w-5 h-5" />,
      link: '/app?tab=upload',
      color: 'emerald',
    },
    {
      title: 'Chat with PDF',
      description: 'Ask questions about your PDFs',
      icon: <FiMessageSquare className="w-5 h-5" />,
      link: '/app?tab=chat',
      color: 'blue',
    },
    {
      title: 'Edit PDF',
      description: 'Modify existing PDFs',
      icon: <FiEdit2 className="w-5 h-5" />,
      link: '/app?tab=edit',
      color: 'purple',
    },
    {
      title: 'Create PDF',
      description: 'Generate new PDFs',
      icon: <FiFileText className="w-5 h-5" />,
      link: '/app?tab=create',
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Welcome Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Here's what's happening with your PDFs today
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center text-slate-600 dark:text-slate-400">
              <FiUser className="mr-1.5" />
              <span>{user?.emailAddresses[0]?.emailAddress || 'User'}</span>
            </div>
            <div className="hidden md:flex items-center text-slate-500 dark:text-slate-500">
              <FiCalendar className="mr-1.5" />
              <span>Joined {joinedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ActionCard
                title={action.title}
                description={action.description}
                icon={action.icon}
                link={action.link}
                color={action.color}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent PDFs */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Your PDFs
              </h2>
              <button 
                className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                onClick={() => (window.location.href = '/app?tab=upload')}
              >
                View all
              </button>
            </div>
            
            {uploadedPDFs.length > 0 ? (
              <div className="space-y-3">
                {uploadedPDFs.slice(0, 5).map((pdf, index) => (
                  <motion.div
                    key={pdf.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                        <FiFileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {pdf.name || 'Untitled Document'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {pdf.uploadedAt || 'Uploaded recently'}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/app?tab=chat&pdf=${pdf.id}`}
                      className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                    >
                      Open
                    </a>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
                  <FiUpload className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No PDFs yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Get started by uploading your first PDF
                </p>
                <button
                  onClick={() => (window.location.href = '/app?tab=upload')}
                  className="inline-flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                >
                  Upload PDF <FiArrowRight className="ml-1.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <RecentActivity activities={allActivities} maxItems={5} />
          
          {/* Usage Stats */}
          <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Your Plan</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Current Plan</span>
                <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium">
                  Free
                </span>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">PDF Storage</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {stats.totalPDFs} of 20 used
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.min((stats.totalPDFs / 20) * 100, 100)}%`
                    }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {20 - stats.totalPDFs} PDFs remaining in your free plan
                </p>
              </div>
              
              <button className="w-full mt-4 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

