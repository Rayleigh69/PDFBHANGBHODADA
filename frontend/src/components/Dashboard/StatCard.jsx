import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, color = 'emerald' }) => {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  };

  const iconBg = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/50',
    blue: 'bg-blue-100 dark:bg-blue-900/50',
    purple: 'bg-purple-100 dark:bg-purple-900/50',
    amber: 'bg-amber-100 dark:bg-amber-900/50',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${iconBg[color]}`}>
          <div className="text-xl">{icon}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
