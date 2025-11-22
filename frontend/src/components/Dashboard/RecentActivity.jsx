import { motion } from 'framer-motion';
import { FiFileText, FiMessageSquare, FiEdit2, FiUpload } from 'react-icons/fi';

const activityIcons = {
  upload: <FiUpload className="w-4 h-4" />,
  chat: <FiMessageSquare className="w-4 h-4" />,
  edit: <FiEdit2 className="w-4 h-4" />,
  create: <FiFileText className="w-4 h-4" />,
};

const activityColors = {
  upload: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  chat: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  edit: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  create: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
};

const getActivityMessage = (activity) => {
  switch (activity.type) {
    case 'upload':
      return `Uploaded ${activity.fileName || 'a PDF'}`;
    case 'chat':
      return `Asked: "${activity.query?.substring(0, 40)}${activity.query?.length > 40 ? '...' : ''}"`;
    case 'edit':
      return `Edited ${activity.fileName || 'a PDF'}`;
    case 'create':
      return 'Created a new PDF';
    default:
      return 'Completed an action';
  }
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return `${interval}y ago`;
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval}mo ago`;
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval}d ago`;
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval}h ago`;
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval}m ago`;
  
  return 'Just now';
};

const ActivityItem = ({ activity, isLast }) => (
  <div className="flex items-start pb-4">
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activityColors[activity.type]}`}>
        {activityIcons[activity.type]}
      </div>
      {!isLast && (
        <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-700 mt-2" />
      )}
    </div>
    <div className="ml-4 flex-1">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {getActivityMessage(activity)}
        </p>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatTimeAgo(activity.timestamp)}
        </span>
      </div>
      {activity.details && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {activity.details}
        </p>
      )}
    </div>
  </div>
);

const RecentActivity = ({ activities = [], maxItems = 5 }) => {
  const recentActivities = activities.slice(0, maxItems);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Recent Activity
        </h3>
        <button className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
          View all
        </button>
      </div>
      
      <div className="space-y-4">
        {recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => (
            <motion.div
              key={activity.id || index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ActivityItem 
                activity={activity} 
                isLast={index === recentActivities.length - 1} 
              />
            </motion.div>
          ))
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
