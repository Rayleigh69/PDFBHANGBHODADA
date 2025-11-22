import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiChat, chatWithPDF } from '../../api';
import { useApp } from '../../context/AppContext';
import ChatMessage from '../ChatMessage';
import TypingIndicator from '../TypingIndicator';

/**
 * ChatTab - Modern ChatPDF-style chat interface
 */
function ChatTab({ selectedPDF }) {
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
        content: "👋 Hi! I'm your AI assistant. I can help you understand and work with your PDFs.\n\n" +
                 "• Ask questions about your PDF content\n" +
                 "• Summarize documents\n" +
                 "• Extract key information\n" +
                 "• And much more!\n\n" +
                 "Select a PDF from the sidebar to get started."
      }]);
    }
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    if (!selectedPDF) {
      setError('Please select a PDF from the sidebar first');
      return;
    }

    const userMessage = inputValue.trim();
    setInputValue('');
    setError(null);

    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Use chatWithPDF if a PDF is selected, otherwise use aiChat
      let response;
      if (selectedPDF) {
        response = await chatWithPDF(selectedPDF, userMessage);
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: response.answer || 'No answer provided',
            sources: response.sources || []
          }
        ]);
      } else {
        // Fallback to general AI chat
        const context = {
          uploaded_pdfs: uploadedPDFs.map(pdf => ({
            pdf_id: pdf.pdf_id,
            filename: pdf.filename
          }))
        };
        response = await aiChat(
          newMessages.map(m => ({ role: m.role, content: m.content })),
          context
        );
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: response.assistant_message,
            sources: response.sources || [],
            files: response.files || []
          }
        ]);
      }

      // Add activity
      addActivity({
        type: 'chat',
        title: `Chat: ${userMessage.substring(0, 50)}...`,
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
    <div className="flex flex-col h-screen bg-white">
      {/* Chat Header */}
      {selectedPDF && (
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {uploadedPDFs.find(p => p.pdf_id === selectedPDF)?.filename || 'Selected PDF'}
              </p>
              <p className="text-xs text-gray-500">Ready to chat</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start a conversation</h3>
              <p className="text-sm text-gray-500">
                {selectedPDF 
                  ? "Ask questions about your PDF and I'll help you understand it."
                  : "Select a PDF from the sidebar to start chatting."}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg.content}
                  isUser={msg.role === 'user'}
                  sources={msg.sources || []}
                />
              ))}
            </AnimatePresence>
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={selectedPDF ? "Ask a question about your PDF..." : "Select a PDF to start chatting..."}
                rows={1}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm text-gray-900 placeholder-gray-400"
                disabled={isLoading || !selectedPDF}
                style={{ minHeight: '48px', maxHeight: '120px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading || !selectedPDF}
                className="absolute right-2 bottom-2 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {!selectedPDF && (
            <p className="mt-2 text-xs text-gray-500 text-center">
              Please select a PDF from the sidebar to start chatting
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatTab;
