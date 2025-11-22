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
        return 'bg-blue-50 border-blue-200';
      case 'edit':
        return 'bg-green-50 border-green-200';
      case 'create':
        return 'bg-purple-50 border-purple-200';
      case 'upload':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Activity History
        </h2>
        <p className="text-sm text-gray-600">
          Your recent PDF operations
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <div className="text-2xl mb-2">📄</div>
          <div className="text-2xl font-bold text-gray-900">{uploadedPDFs.length}</div>
          <div className="text-xs text-gray-600 font-medium">Total PDFs</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <div className="text-2xl mb-2">💬</div>
          <div className="text-2xl font-bold text-gray-900">
            {recentActivity.filter(a => a.type === 'chat').length}
          </div>
          <div className="text-xs text-gray-600 font-medium">Chats</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <div className="text-2xl mb-2">✏️</div>
          <div className="text-2xl font-bold text-gray-900">
            {recentActivity.filter(a => a.type === 'edit').length}
          </div>
          <div className="text-xs text-gray-600 font-medium">Edited</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <div className="text-2xl mb-2">✨</div>
          <div className="text-2xl font-bold text-gray-900">
            {recentActivity.filter(a => a.type === 'create').length}
          </div>
          <div className="text-xs text-gray-600 font-medium">Created</div>
        </motion.div>
      </div>

      {/* Activity List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        {recentActivity.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-gray-600">No activity yet</p>
            <p className="text-sm mt-2 text-gray-500">Start using the workspace to see your activity here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${getActivityColor(activity.type)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                    <div>
                      <p className="text-gray-900 font-medium">{activity.title}</p>
                      <p className="text-xs text-gray-600 capitalize">
                        {activity.type}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
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

