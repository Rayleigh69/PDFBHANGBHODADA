import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadTab from '../components/Workspace/UploadTab';
import ChatTab from '../components/Workspace/ChatTab';
import PdfEditorTab from '../components/Workspace/PdfEditorTab';
import PdfCreatorTab from '../components/Workspace/PdfCreatorTab';
import HistoryTab from '../components/Workspace/HistoryTab';

/**
 * Workspace - Main workspace with clean modern tabs
 */
function Workspace() {
  const [activeTab, setActiveTab] = useState('upload');

  const tabs = [
    { id: 'upload', label: 'Upload', icon: '📤' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'editor', label: 'Editor', icon: '✏️' },
    { id: 'creator', label: 'Creator', icon: '✨' },
    { id: 'history', label: 'History', icon: '📜' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workspace Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workspace</h1>
          <p className="text-gray-600">
            Manage and interact with your PDFs
          </p>
        </motion.div>

        {/* Modern Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'upload' && <UploadTab />}
            {activeTab === 'chat' && <ChatTab />}
            {activeTab === 'editor' && <PdfEditorTab />}
            {activeTab === 'creator' && <PdfCreatorTab />}
            {activeTab === 'history' && <HistoryTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Workspace;
