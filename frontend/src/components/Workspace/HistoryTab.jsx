import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';

/**
 * HistoryTab - Activity history (Valorant styled)
 */
function HistoryTab() {
  const { recentActivity, uploadedPDFs } = useApp();

  const getActivityIcon = (type) => {
    switch (type) {
      case 'chat':
        return '💬';
      case 'edit':
        return '✏️';
      case 'create':
        return '✨';
      case 'upload':
        return '📄';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'chat':
        return 'text-cyan-400 border-cyan-500/30';
      case 'edit':
        return 'text-teal-400 border-teal-500/30';
      case 'create':
        return 'text-red-400 border-red-500/30';
      case 'upload':
        return 'text-yellow-400 border-yellow-500/30';
      default:
        return 'text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-cyan-400 mb-2">
          Activity History
        </h2>
        <p className="text-sm text-slate-400">
          Your recent PDF operations
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0a0a0f] border-2 border-red-500/30 p-4"
        >
          <div className="text-2xl mb-2">📄</div>
          <div className="text-2xl font-bold text-red-400">{uploadedPDFs.length}</div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Total PDFs</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0a0a0f] border-2 border-cyan-500/30 p-4"
        >
          <div className="text-2xl mb-2">💬</div>
          <div className="text-2xl font-bold text-cyan-400">
            {recentActivity.filter(a => a.type === 'chat').length}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Chats</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0a0a0f] border-2 border-teal-500/30 p-4"
        >
          <div className="text-2xl mb-2">✏️</div>
          <div className="text-2xl font-bold text-teal-400">
            {recentActivity.filter(a => a.type === 'edit').length}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Edited</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0a0a0f] border-2 border-red-500/30 p-4"
        >
          <div className="text-2xl mb-2">✨</div>
          <div className="text-2xl font-bold text-red-400">
            {recentActivity.filter(a => a.type === 'create').length}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-wider">Created</div>
        </motion.div>
      </div>

      {/* Activity List */}
      <div className="bg-[#0a0a0f] border-2 border-red-500/30 p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">
          Recent Activity
        </h3>
        {recentActivity.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="uppercase tracking-wider">No activity yet</p>
            <p className="text-xs mt-2">Start using the workspace to see your activity here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border-2 ${getActivityColor(activity.type)} p-4 hover:bg-[#050509] transition-colors`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                    <div>
                      <p className="text-white font-semibold">{activity.title}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        {activity.type}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(activity.timestamp).toLocaleString()}
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

export default HistoryTab;

