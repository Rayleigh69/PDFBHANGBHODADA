import { motion } from 'framer-motion';

/**
 * ChatMessage - Displays a single chat message (Valorant styled)
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
      <div
        className={`
          max-w-3xl rounded px-4 py-3
          ${isUser
            ? 'bg-red-500/20 border-2 border-red-500/50 text-red-100'
            : 'bg-[#0a0a0f] border-2 border-cyan-500/30 text-cyan-100'
          }
        `}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message}</p>
        
        {/* Sources section for bot messages */}
        {!isUser && sources && sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-cyan-500/20">
            <p className="text-xs uppercase tracking-wider text-cyan-400 mb-2">
              Sources:
            </p>
            <div className="space-y-1">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="text-xs text-slate-400 bg-[#050509] px-2 py-1 border border-cyan-500/20"
                >
                  Page {source.page || 'N/A'}: {source.text?.substring(0, 100)}...
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ChatMessage;
