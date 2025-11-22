import { motion } from 'framer-motion';

/**
 * ChatMessage - Clean modern chat message display
 */
function ChatMessage({ message, isUser, sources = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex gap-3 max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600' : 'bg-gray-200'
        }`}>
          {isUser ? (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
          <div
            className={`
              rounded-2xl px-4 py-3
              ${isUser
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
              }
            `}
          >
            <p className="whitespace-pre-wrap leading-relaxed text-sm">{message}</p>
          </div>
          
          {/* Sources section for bot messages */}
          {!isUser && sources && sources.length > 0 && (
            <div className="mt-2 space-y-2 w-full">
              <p className="text-xs font-medium text-gray-500 mb-1">Sources:</p>
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium">Page {source.page || source.page_number || 'N/A'}:</span>{' '}
                  <span className="text-gray-500">{source.text?.substring(0, 150) || source.snippet?.substring(0, 150)}...</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ChatMessage;
