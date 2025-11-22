import { motion } from 'framer-motion';

/**
 * ValorantTabs - Inner tab navigation with Valorant styling
 */
function ValorantTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-2 mb-6 border-b-2 border-red-500/20 pb-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-6 py-3 font-bold uppercase tracking-wider text-sm
              transition-all duration-200
              ${isActive
                ? 'text-red-400'
                : 'text-slate-400 hover:text-slate-300'
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ValorantTabs;

