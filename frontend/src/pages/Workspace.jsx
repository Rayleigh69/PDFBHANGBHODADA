import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatTab from '../components/Workspace/ChatTab';
import { useApp } from '../context/AppContext';
import { uploadPDFs } from '../api';

/**
 * UploadButton - Component for uploading PDFs
 */
function UploadButton() {
  const { setUploadedPDFs, addActivity } = useApp();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files).filter(
      (file) => file.type === 'application/pdf'
    );
    
    if (files.length === 0) return;
    
    setIsUploading(true);
    try {
      const response = await uploadPDFs(files);
      setUploadedPDFs((prev) => [...prev, ...response]);
      response.forEach((pdf) => {
        addActivity({
          type: 'upload',
          title: `Uploaded ${pdf.filename}`,
        });
      });
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload PDFs. Please try again.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <label className="block w-full">
      <input
        type="file"
        multiple
        accept="application/pdf"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />
      <div className={`
        w-full px-4 py-3 bg-blue-600 text-white rounded-lg text-center cursor-pointer 
        hover:bg-blue-700 transition-colors font-medium text-sm
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
        {isUploading ? 'Uploading...' : '+ Upload PDF'}
      </div>
    </label>
  );
}

/**
 * Workspace - Modern ChatPDF-style layout with sidebar and main chat area
 */
function Workspace() {
  const { uploadedPDFs } = useApp();
  const [selectedPDF, setSelectedPDF] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - PDF List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">ChatPDF</h1>
          <p className="text-sm text-gray-500">Upload and chat with your PDFs</p>
        </div>

        {/* Upload Area */}
        <div className="p-4 border-b border-gray-200">
          <UploadButton />
        </div>

        {/* PDF List */}
        <div className="flex-1 overflow-y-auto">
          {uploadedPDFs.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No PDFs uploaded yet</p>
              <p className="text-xs text-gray-400 mt-1">Upload a PDF to get started</p>
            </div>
          ) : (
            <div className="p-2">
              {uploadedPDFs.map((pdf) => (
                <motion.div
                  key={pdf.pdf_id}
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  onClick={() => setSelectedPDF(pdf.pdf_id)}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-colors mb-1
                    ${selectedPDF === pdf.pdf_id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{pdf.filename}</p>
                      <p className="text-xs text-gray-500 mt-0.5">PDF Document</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatTab selectedPDF={selectedPDF} />
      </div>
    </div>
  );
}

export default Workspace;
