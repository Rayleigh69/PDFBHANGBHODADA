import { motion } from 'framer-motion';
import { FiFileText, FiMessageSquare, FiEdit, FiZap } from 'react-icons/fi';

/**
 * AuthLayout - Clean, modern layout for authentication pages
 */
function AuthLayout({ children, title, subtitle }) {
  const features = [
    { 
      icon: <FiMessageSquare className="w-5 h-5" />, 
      text: 'Chat with your PDFs using AI' 
    },
    { 
      icon: <FiEdit className="w-5 h-5" />, 
      text: 'Edit PDFs with text and images' 
    },
    { 
      icon: <FiFileText className="w-5 h-5" />, 
      text: 'Create custom PDFs from scratch' 
    },
    { 
      icon: <FiZap className="w-5 h-5" />, 
      text: 'Fast, secure, and easy to use' 
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 p-12 text-white">
        <div className="max-w-md m-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center mb-6">
              <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <span className="text-2xl font-semibold">ChatPDF</span>
            </div>
            <h1 className="text-3xl font-semibold mb-3">
              {title || 'Welcome to ChatPDF'}
            </h1>
            <p className="text-blue-100 text-sm">
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
                <div className="mt-0.5 text-blue-200">
                  {feature.icon}
                </div>
                <span className="text-blue-100 text-sm">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <span className="text-2xl font-semibold text-gray-900">ChatPDF</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {title || 'Welcome back'}
            </h2>
            <p className="text-gray-600 text-sm">
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

