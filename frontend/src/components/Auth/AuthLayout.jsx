import { motion } from 'framer-motion';
import { FiFileText, FiMessageSquare, FiEdit, FiZap } from 'react-icons/fi';

/**
 * AuthLayout - Clean, modern layout for authentication pages
 */
function AuthLayout({ children, title, subtitle }) {
  const features = [
    { 
      icon: <FiMessageSquare className="w-5 h-5 text-cyan-400" />, 
      text: 'Chat with your PDFs using AI' 
    },
    { 
      icon: <FiEdit className="w-5 h-5 text-teal-400" />, 
      text: 'Edit PDFs with text and images' 
    },
    { 
      icon: <FiFileText className="w-5 h-5 text-red-400" />, 
      text: 'Create custom PDFs from scratch' 
    },
    { 
      icon: <FiZap className="w-5 h-5 text-cyan-400" />, 
      text: 'Fast, secure, and easy to use' 
    },
  ];

  return (
    <div className="min-h-screen bg-[#050509] flex flex-col lg:flex-row">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a0a0f] to-[#050509] border-r-2 border-red-500/30 p-12 text-white">
        <div className="max-w-md m-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center mb-6">
              <FiFileText className="w-8 h-8 text-red-400 mr-3" />
              <span className="text-2xl font-black uppercase tracking-widest text-red-400">PDF GENIE</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-wider mb-3 text-red-400">
              {title || 'Welcome to PDF Genie'}
            </h1>
            <p className="text-slate-400 uppercase tracking-wider text-sm">
              {subtitle || 'Your AI-powered PDF companion. Chat, edit, and create with ease.'}
            </p>
          </motion.div>
          
          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="space-y-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="mt-0.5">
                  {feature.icon}
                </div>
                <span className="text-slate-400 uppercase tracking-wider text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-[#050509]">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <FiFileText className="w-8 h-8 text-red-400 mr-2" />
              <span className="text-2xl font-black uppercase tracking-widest text-red-400">PDF GENIE</span>
            </div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-red-400 mb-1">
              {title || 'Welcome back'}
            </h2>
            <p className="text-slate-400 text-sm uppercase tracking-wider">
              {subtitle || 'Sign in to your account'}
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;

