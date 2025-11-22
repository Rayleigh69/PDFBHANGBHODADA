import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hoverEffect = true,
  padding = 'p-6',
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hoverEffect ? { 
        y: -2,
        transition: { duration: 0.2 }
      } : {}}
      className={`
        bg-white dark:bg-slate-800 
        rounded-xl 
        border border-slate-200 dark:border-slate-700 
        shadow-sm hover:shadow-md 
        transition-all duration-200 
        ${padding} 
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
