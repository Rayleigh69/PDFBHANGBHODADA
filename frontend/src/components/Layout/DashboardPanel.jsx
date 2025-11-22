import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import ValorantPanel from '../Valorant/ValorantPanel';
import ValorantButton from '../Valorant/ValorantButton';
import { useNavigate } from 'react-router-dom';

/**
 * DashboardPanel - Dashboard that opens from profile click
 */
function DashboardPanel({ isOpen, onClose }) {
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
    <ValorantPanel isOpen={isOpen} onClose={onClose} title="Dashboard">
      {/* Welcome Section */}
      <div className="mb-8 pb-6 border-b-2 border-red-500/20">
        <h3 className="text-xl font-bold uppercase tracking-wider text-red-400 mb-2">
          Welcome, {firstName}
        </h3>
        <p className="text-slate-400 text-sm">
          Joined: {joinedDate}
        </p>
        <p className="text-slate-500 text-xs mt-1">
          {user?.emailAddresses[0]?.emailAddress}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#0a0a0f] border-2 border-red-500/30 p-4 hover:border-red-500/60 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-2xl font-bold ${
                stat.color === 'red' ? 'text-red-400' :
                stat.color === 'cyan' ? 'text-cyan-400' :
                'text-teal-400'
              }`}>
                {stat.value}
              </span>
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">
          Quick Actions
        </h4>
        <div className="space-y-2">
          <ValorantButton
            variant="primary"
            className="w-full"
            onClick={() => {
              onClose();
              navigate('/workspace');
            }}
          >
            Open Workspace
          </ValorantButton>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">
          Recent Activity
        </h4>
        {recentActivity.length === 0 ? (
          <p className="text-slate-500 text-sm">No activity yet</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentActivity.slice(0, 5).map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#0a0a0f] border border-red-500/20 p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">{activity.title}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ValorantPanel>
  );
}

export default DashboardPanel;

