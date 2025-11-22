import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadPDFs } from '../../api';
import { useApp } from '../../context/AppContext';
import ValorantButton from '../Valorant/ValorantButton';

/**
 * UploadTab - Upload PDFs (Valorant styled)
 */
function UploadTab() {
  const { uploadedPDFs, setUploadedPDFs, addActivity } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files).filter(
      (file) => file.type === 'application/pdf'
    );
    
    if (files.length === 0) {
      setError('Please select PDF files only');
      return;
    }
    
    await uploadFiles(files);
    e.target.value = ''; // Reset input
  };

  const uploadFiles = async (files) => {
    setIsUploading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await uploadPDFs(files);
      
      setUploadedPDFs([...uploadedPDFs, ...response]);
      setSuccessMessage(`Successfully uploaded ${response.length} PDF(s)`);
      
      response.forEach((pdf) => {
        addActivity({
          type: 'upload',
          title: `Uploaded ${pdf.filename}`,
        });
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-cyan-400 mb-2">
          Upload PDFs
        </h2>
        <p className="text-sm text-slate-400">
          Upload PDF files to chat with, edit, or analyze
        </p>
      </div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/20 border-2 border-red-500/50 p-4 text-red-400"
          >
            {error}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-cyan-500/20 border-2 border-cyan-500/50 p-4 text-cyan-400"
          >
            ✓ {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className={`
          border-2 border-dashed p-12 text-center transition-all
          ${isDragging
            ? 'border-red-500 bg-red-500/10'
            : 'border-red-500/30 hover:border-red-500/50 bg-[#0a0a0f]'
          }
        `}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: isDragging ? 1.05 : 1 }}
          className="space-y-4"
        >
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-bold uppercase tracking-wider text-red-400">
            {isDragging ? 'Drop PDFs Here' : 'Drag & Drop PDFs'}
          </h3>
          <p className="text-slate-400">or</p>
          <label>
            <input
              type="file"
              multiple
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <ValorantButton
              as="span"
              disabled={isUploading}
              className="inline-block cursor-pointer"
            >
              {isUploading ? 'Uploading...' : 'Select PDFs'}
            </ValorantButton>
          </label>
        </motion.div>
      </div>

      {/* Uploaded PDFs List */}
      {uploadedPDFs.length > 0 && (
        <div className="bg-[#0a0a0f] border-2 border-red-500/30 p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">
            Uploaded PDFs ({uploadedPDFs.length})
          </h3>
          <div className="space-y-2">
            {uploadedPDFs.map((pdf) => (
              <motion.div
                key={pdf.pdf_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-[#050509] border border-red-500/20 hover:border-red-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <span className="text-white">{pdf.filename}</span>
                </div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">
                  ID: {pdf.pdf_id.substring(0, 8)}...
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadTab;

