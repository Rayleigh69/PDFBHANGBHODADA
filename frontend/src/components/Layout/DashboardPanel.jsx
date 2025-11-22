import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

/**
 * DashboardPanel - Sidebar dashboard component
 */
function DashboardPanel({ isSidebar = false }) {
  const { user } = useUser();
  const { uploadedPDFs, recentActivity, stats } = useApp();
  const navigate = useNavigate();

  const firstName = user?.firstName || 'Agent';
  const joinedDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
    : 'recently';

  const statCards = [
    {
      label: 'Total PDFs',
      value: stats.totalPDFs || uploadedPDFs.length,
      icon: '📄',
      color: 'red',
    },
    {
      label: 'Chats',
      value: stats.totalChats || recentActivity.filter(a => a.type === 'chat').length,
      icon: '💬',
      color: 'cyan',
    },
    {
      label: 'Edited',
      value: stats.pdfsEdited || recentActivity.filter(a => a.type === 'edit').length,
      icon: '✏️',
      color: 'teal',
    },
    {
      label: 'Created',
      value: stats.customPDFsCreated || recentActivity.filter(a => a.type === 'create').length,
      icon: '✨',
      color: 'red',
    },
  ];

  return (
    <div className="h-full flex flex-col p-6">
      {/* Welcome Section */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Welcome, {firstName}
        </h3>
        <p className="text-gray-600 text-sm">
          Joined: {joinedDate}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          {user?.emailAddresses[0]?.emailAddress}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">{stat.icon}</span>
              <span className="text-xl font-bold text-gray-900">
                {stat.value}
              </span>
            </div>
            <p className="text-xs text-gray-600 font-medium">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Quick Actions
        </h4>
        <div className="space-y-2">
          <button
            onClick={() => navigate('/workspace')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            Open Workspace
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          Recent Activity
        </h4>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-sm">No activity yet</p>
        ) : (
          <div className="space-y-2 overflow-y-auto flex-1">
            {recentActivity.slice(0, 10).map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">{activity.title}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPanel;

