import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadPDFs } from '../../api';
import { useApp } from '../../context/AppContext';
import AnimatedCard from '../AnimatedCard';
import { buttonHover } from '../../utils/animations';

/**
 * UploadPanel - Upload and index PDFs
 */
function UploadPanel() {
  const { uploadedPDFs, setUploadedPDFs, addActivity } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Handle file drop
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'application/pdf'
    );
    
    if (files.length === 0) {
      setError('Please drop PDF files only');
      return;
    }
    
    await uploadFiles(files);
  };

  // Handle file input change
  const handleFileInput = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      await uploadFiles(files);
    }
  };

  // Upload files to backend
  const uploadFiles = async (files) => {
    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await uploadPDFs(files);
      const pdfs = Array.isArray(response) ? response : [response];
      
      if (setUploadedPDFs) {
        setUploadedPDFs((prev) => [...prev, ...pdfs]);
      }
      
      // Add activity
      pdfs.forEach((pdf) => {
        addActivity({
          type: 'upload',
          title: `Uploaded ${pdf.filename}`,
        });
      });
      
      setSuccessMessage(`Successfully uploaded ${pdfs.length} PDF(s)!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatedCard delay={0}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Upload & Index PDFs
        </h2>
        <p className="text-slate-400">
          Upload PDF files to chat with them using AI or edit them later.
        </p>
      </div>
      
      {/* Drag & Drop Area */}
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging 
            ? 'rgba(16, 185, 129, 0.6)' 
            : 'rgba(51, 65, 85, 0.6)',
          backgroundColor: isDragging 
            ? 'rgba(16, 185, 129, 0.1)' 
            : 'rgba(15, 23, 42, 0.3)',
          scale: isDragging ? 1.02 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="border-2 border-dashed border-slate-700/60 rounded-2xl p-12 text-center backdrop-blur-sm"
      >
        <motion.div
          animate={{ scale: isDragging ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{ rotate: isDragging ? [0, 5, -5, 0] : 0 }}
            transition={{ duration: 0.3 }}
            className="text-6xl mb-4"
          >
            📄
          </motion.div>
          <p className="text-slate-300 mb-4 font-medium text-lg">
            Drag & drop PDF files here
          </p>
          <p className="text-slate-500 mb-6 text-sm">
            or click the button below to select files
          </p>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="pdf-upload"
            disabled={isUploading}
          />
          <label htmlFor="pdf-upload">
            <motion.button
              {...buttonHover}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUploading}
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ⏳
                  </motion.span>
                  Uploading...
                </span>
              ) : (
                'Select Files'
              )}
            </motion.button>
          </label>
        </motion.div>
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl backdrop-blur-sm"
          >
            ✓ {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-4 p-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded PDFs List */}
      {uploadedPDFs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <h3 className="text-lg font-semibold text-slate-300 mb-3">
            Uploaded PDFs ({uploadedPDFs.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadedPDFs.map((pdf, index) => (
              <motion.div
                key={pdf.pdf_id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 backdrop-blur-sm hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-white">{pdf.filename}</p>
                  <p className="text-sm text-slate-400">ID: {pdf.pdf_id}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatedCard>
  );
}

export default UploadPanel;

