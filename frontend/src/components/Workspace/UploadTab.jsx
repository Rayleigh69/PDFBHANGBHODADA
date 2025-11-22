import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadPDFs } from '../../api';
import { useApp } from '../../context/AppContext';

/**
 * UploadTab - Clean modern PDF upload interface
 */
function UploadTab() {
  const { uploadedPDFs, setUploadedPDFs, addActivity } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = useRef(null);

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
      console.log('Uploading files:', files.map(f => f.name));
      const response = await uploadPDFs(files);
      console.log('Upload response:', response);
      
      // Handle both array and object response formats
      let pdfs = [];
      if (Array.isArray(response)) {
        pdfs = response;
      } else if (response && typeof response === 'object') {
        pdfs = response.pdfs || (response.pdf_id ? [response] : []);
      }
      
      // Validate and filter PDFs
      pdfs = pdfs.filter(pdf => pdf && (pdf.pdf_id || pdf.id) && pdf.filename);
      
      if (pdfs.length === 0) {
        setError('No PDFs were uploaded. Please check the file format.');
        setIsUploading(false);
        return;
      }
      
      // Normalize PDF objects to ensure consistent structure
      const normalizedPDFs = pdfs.map(pdf => ({
        pdf_id: pdf.pdf_id || pdf.id || String(Date.now() + Math.random()),
        filename: pdf.filename || 'Unknown PDF'
      }));
      
      // Use functional update to avoid stale state
      setUploadedPDFs((prev) => {
        try {
          return [...prev, ...normalizedPDFs];
        } catch (stateError) {
          console.error('State update error:', stateError);
          return prev; // Return previous state if update fails
        }
      });
      
      setSuccessMessage(`Successfully uploaded ${normalizedPDFs.length} PDF(s)`);
      
      // Add activities safely
      try {
        normalizedPDFs.forEach((pdf) => {
          if (pdf && pdf.filename && addActivity) {
            try {
              addActivity({
                type: 'upload',
                title: `Uploaded ${pdf.filename}`,
              });
            } catch (activityErr) {
              console.warn('Error adding activity for PDF:', pdf.filename, activityErr);
            }
          }
        });
      } catch (activityError) {
        console.warn('Error adding activities:', activityError);
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Upload failed';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Upload PDFs
        </h2>
        <p className="text-sm text-gray-600">
          Upload PDF files to chat with, edit, or analyze
        </p>
      </div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
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
          border-2 border-dashed rounded-xl p-12 text-center transition-all
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 bg-gray-50'
          }
        `}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: isDragging ? 1.02 : 1 }}
          className="space-y-4"
        >
          <div className="flex justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            {isDragging ? 'Drop PDFs Here' : 'Drag & Drop PDFs'}
          </h3>
          <p className="text-sm text-gray-500">or</p>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => {
                if (fileInputRef.current && !isUploading) {
                  fileInputRef.current.click();
                }
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? 'Uploading...' : 'Select PDFs'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Uploaded PDFs List */}
      {uploadedPDFs.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Uploaded PDFs ({uploadedPDFs.length})
          </h3>
          <div className="space-y-2">
            {uploadedPDFs.map((pdf, index) => {
              const pdfId = pdf?.pdf_id || pdf?.id || `pdf-${index}`;
              const filename = pdf?.filename || 'Unknown PDF';
              const displayId = typeof pdfId === 'string' ? pdfId.substring(0, 8) : 'N/A';
              
              return (
                <motion.div
                  key={pdfId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">{filename}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {displayId}...
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadTab;

