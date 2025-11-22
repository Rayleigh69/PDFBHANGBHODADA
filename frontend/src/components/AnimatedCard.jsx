import { motion } from 'framer-motion';
import { fadeInUp, cardHover } from '../utils/animations';

/**
 * AnimatedCard - Reusable glassmorphism card with animations
 */
function AnimatedCard({ children, className = '', delay = 0, ...props }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      transition={{ ...fadeInUp.transition, delay }}
      whileHover={cardHover.whileHover}
      whileTap={cardHover.whileTap}
      className={`
        relative bg-slate-900/70 backdrop-blur-xl
        border border-slate-700/60 rounded-2xl
        shadow-xl shadow-black/20
        p-6
        transition-all duration-300
        hover:border-emerald-500/60 hover:shadow-emerald-500/20
        ${className}
      `}
      {...props}
    >
      {/* Inner gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export default AnimatedCard;

