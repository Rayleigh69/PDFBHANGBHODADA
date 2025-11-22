import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ActionCard = ({ title, description, icon, link, color = 'emerald' }) => {
  const colors = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    amber: 'text-amber-600 dark:text-amber-400',
  };

  const iconBg = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    amber: 'bg-amber-100 dark:bg-amber-900/30',
  };

  return (
    <Link to={link}>
      <motion.div
        whileHover={{ y: -2 }}
        className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow transition-all"
      >
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl mb-4 ${iconBg[color]}`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm flex-1 mb-4">
          {description}
        </p>
        <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Get started <FiArrowRight className="ml-1.5" />
        </div>
      </motion.div>
    </Link>
  );
};

export default ActionCard;
