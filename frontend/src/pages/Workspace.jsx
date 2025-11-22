import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ValorantTabs from '../components/Valorant/ValorantTabs';
import UploadTab from '../components/Workspace/UploadTab';
import ChatTab from '../components/Workspace/ChatTab';
import PdfEditorTab from '../components/Workspace/PdfEditorTab';
import PdfCreatorTab from '../components/Workspace/PdfCreatorTab';
import HistoryTab from '../components/Workspace/HistoryTab';

/**
 * Workspace - Main workspace with inner tabs
 */
function Workspace() {
  const [activeTab, setActiveTab] = useState('upload');

  const tabs = [
    { id: 'upload', label: 'Upload' },
    { id: 'chat', label: 'Chat with PDFs' },
    { id: 'editor', label: 'PDF Editor' },
    { id: 'creator', label: 'PDF Creator' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="min-h-screen bg-[#050509]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Workspace Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="valorant-title text-4xl mb-2 text-red-400">WORKSPACE</h1>
          <p className="text-slate-400 uppercase tracking-wider text-sm">
            Your PDF Command Center
          </p>
        </motion.div>

        {/* Inner Tabs */}
        <ValorantTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

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
