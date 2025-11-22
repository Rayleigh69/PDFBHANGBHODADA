import { motion } from 'framer-motion';

/**
 * ValorantButton - Bold, angular button with Valorant styling
 */
function ValorantButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false,
  type = 'button',
  ...props 
}) {
  const variants = {
    primary: 'bg-red-500 hover:bg-red-400 text-white border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]',
    secondary: 'bg-cyan-500 hover:bg-cyan-400 text-white border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    outline: 'bg-transparent border-2 border-red-500 text-red-400 hover:bg-red-500/10 hover:border-red-400',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`
        px-6 py-3 font-bold uppercase tracking-wider
        border-2 transition-all duration-200
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default ValorantButton;

