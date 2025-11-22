import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

/**
 * ValorantPanel - Slide-out panel with Valorant styling
 */
function ValorantPanel({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#050509] border-l-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)] z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#050509] border-b-2 border-red-500/30 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold uppercase tracking-wider text-red-400">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-red-400 transition-colors text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ValorantPanel;

