import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiChat } from '../../api';
import { useApp } from '../../context/AppContext';
import ChatMessage from '../ChatMessage';
import TypingIndicator from '../TypingIndicator';
import ValorantButton from '../Valorant/ValorantButton';

/**
 * ChatTab - AI Assistant Chat (Valorant styled)
 * Main interface for all AI capabilities: PDF handling, Q&A, analysis
 */
function ChatTab() {
  const { uploadedPDFs, addActivity, setUploadedPDFs } = useApp();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "👋 I'm your AI PDF assistant! I can help you:\n\n" +
                 "📄 **PDF Operations**: Upload, split, merge, rotate, extract pages/images\n" +
                 "💬 **Q&A**: Ask questions about your PDFs\n" +
                 "📊 **Analysis**: Summarize, extract tables, keywords, and more\n\n" +
                 "Just tell me what you'd like to do!"
      }]);
    }
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);

    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Prepare context with uploaded PDFs
      const context = {
        uploaded_pdfs: uploadedPDFs.map(pdf => ({
          pdf_id: pdf.pdf_id,
          filename: pdf.filename
        }))
      };

      // Call AI chat endpoint
      const response = await aiChat(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        context
      );

      // Add assistant response
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: response.assistant_message,
          sources: response.sources || [],
          files: response.files || [],
          actions: response.actions || []
        }
      ]);

      // Handle new PDFs from actions (e.g., upload, split, merge)
      if (response.files && response.files.length > 0) {
        const newPDFs = response.files
          .filter(f => f.type === 'pdf' && f.pdf_id)
          .map(f => ({
            pdf_id: f.pdf_id,
            filename: f.filename
          }));
        
        if (newPDFs.length > 0) {
          setUploadedPDFs([...uploadedPDFs, ...newPDFs]);
        }
      }

      // Add activity
      addActivity({
        type: 'chat',
        title: `AI Chat: ${userMessage.substring(0, 50)}...`,
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Chat failed');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-[#0a0a0f] border-2 border-cyan-500/30 p-4">
        <p className="text-sm text-cyan-400 uppercase tracking-wider">
          💡 <strong>Tip:</strong> Ask me to upload PDFs, split/merge them, answer questions, summarize, or extract data!
        </p>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-red-500/20 border-2 border-red-500/50 p-4 text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <div className="bg-[#0a0a0f] border-2 border-red-500/30 h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <p className="text-center uppercase tracking-wider">
                Start a conversation with your AI assistant...
              </p>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <div key={index}>
                    <ChatMessage
                      message={msg.content}
                      isUser={msg.role === 'user'}
                      sources={msg.sources || []}
                    />
                    {/* Show files if any */}
                    {msg.files && msg.files.length > 0 && (
                      <div className="mt-2 ml-4">
                        <div className="bg-[#050509] border border-cyan-500/20 p-3 rounded">
                          <p className="text-xs uppercase tracking-wider text-cyan-400 mb-2">
                            Generated Files:
                          </p>
                          <div className="space-y-1">
                            {msg.files.map((file, idx) => (
                              <div key={idx} className="text-xs text-slate-300">
                                📄 {file.filename}
                                {file.download_url && (
                                  <a
                                    href={`http://localhost:8000${file.download_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 text-cyan-400 hover:text-cyan-300"
                                  >
                                    Download
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </AnimatePresence>
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t-2 border-red-500/30 p-4 flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about PDFs..."
            className="flex-1 px-4 py-3 bg-[#050509] border-2 border-red-500/30 text-white placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 uppercase tracking-wider"
            disabled={isLoading}
          />
          <ValorantButton
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </ValorantButton>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setInputValue('Upload these PDFs and show me page previews')}
          className="bg-[#0a0a0f] border-2 border-red-500/30 p-4 text-left hover:border-red-500/60 transition-colors"
        >
          <div className="text-2xl mb-2">📄</div>
          <div className="text-sm font-bold uppercase tracking-wider text-red-400">
            Upload PDFs
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Upload and preview PDFs
          </div>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setInputValue('Summarize this PDF in short mode')}
          className="bg-[#0a0a0f] border-2 border-cyan-500/30 p-4 text-left hover:border-cyan-500/60 transition-colors"
        >
          <div className="text-2xl mb-2">📊</div>
          <div className="text-sm font-bold uppercase tracking-wider text-cyan-400">
            Summarize
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Get PDF summary
          </div>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setInputValue('Extract all images from this PDF')}
          className="bg-[#0a0a0f] border-2 border-teal-500/30 p-4 text-left hover:border-teal-500/60 transition-colors"
        >
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-sm font-bold uppercase tracking-wider text-teal-400">
            Extract
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Extract images/pages
          </div>
        </motion.button>
      </div>
    </div>
  );
}

export default ChatTab;
