import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithPDF } from '../api';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import AnimatedCard from './AnimatedCard';
import { fadeIn, buttonHover } from '../utils/animations';

/**
 * ChatSection - Chat interface for querying PDFs using RAG
 */
function ChatSection({ uploadedPDFs }) {
  const [selectedPDF, setSelectedPDF] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSend = async () => {
    if (!inputValue.trim() || !selectedPDF || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);

    // Add user message to chat
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);

    setIsLoading(true);

    try {
      const response = await chatWithPDF(selectedPDF, userMessage);
      
      // Add bot response with sources
      setMessages((prev) => [
        ...prev,
        {
          text: response.answer || 'No answer provided',
          isUser: false,
          sources: response.sources || [],
        },
      ]);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Chat failed');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatedCard delay={0.1}>
      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Chat with PDF</h2>

      {/* PDF Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Select PDF:
        </label>
        <select
          value={selectedPDF}
          onChange={(e) => setSelectedPDF(e.target.value)}
          className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm transition-all"
        >
          <option value="" className="bg-slate-800">-- Choose a PDF --</option>
          {uploadedPDFs.map((pdf) => (
            <option key={pdf.pdf_id} value={pdf.pdf_id} className="bg-slate-800">
              {pdf.filename}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className="border border-slate-700/60 rounded-2xl p-4 h-96 overflow-y-auto mb-4 bg-slate-900/40 backdrop-blur-sm">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p className="text-center">Start a conversation by selecting a PDF and asking a question...</p>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg.text}
                  isUser={msg.isUser}
                  sources={msg.sources}
                />
              ))}
            </AnimatePresence>
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question about the PDF..."
          className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-full text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm transition-all"
          disabled={!selectedPDF || isLoading}
        />
        <motion.button
          {...buttonHover}
          onClick={handleSend}
          disabled={!selectedPDF || !inputValue.trim() || isLoading}
          className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </motion.button>
      </div>
    </AnimatedCard>
  );
}

export default ChatSection;
