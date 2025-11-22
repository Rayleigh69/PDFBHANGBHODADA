import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPDF, downloadPDF } from '../api';
import AnimatedCard from './AnimatedCard';
import { buttonHover, fadeIn } from '../utils/animations';

/**
 * CreateSection - Create custom PDFs from text and images
 */
function CreateSection() {
  const [title, setTitle] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdFilename, setCreatedFilename] = useState(null);

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  // Remove an image
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle PDF creation
  const handleCreatePDF = async (e) => {
    e.preventDefault();
    if (!title.trim() && !bodyText.trim() && images.length === 0) {
      setError('Please provide at least a title, body text, or images');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCreatedFilename(null);

    try {
      const response = await createPDF(title, bodyText, images);
      
      // Handle different response types
      if (response.filename) {
        setCreatedFilename(response.filename);
      } else if (response.pdf) {
        setCreatedFilename(response.pdf);
      } else if (response.blob) {
        // If we got a blob directly, download it immediately
        const url = window.URL.createObjectURL(response.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setCreatedFilename('custom.pdf');
      } else {
        setCreatedFilename('custom.pdf');
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create PDF');
      console.error('Create PDF error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle PDF download
  const handleDownload = async () => {
    if (!createdFilename) return;

    try {
      const blob = await downloadPDF(createdFilename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = createdFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Download failed');
      console.error('Download error:', err);
    }
  };

  return (
    <AnimatedCard delay={0.3}>
      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Create Custom PDF</h2>

      <form onSubmit={handleCreatePDF} className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Title:
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter PDF title..."
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm transition-all"
          />
        </div>

        {/* Body Text Input */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Body Text:
          </label>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={6}
            placeholder="Enter body text content..."
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm transition-all resize-none"
          />
        </div>

        {/* Images Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Images (optional):
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 backdrop-blur-sm transition-all"
          />
          
          {/* Display selected images */}
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 space-y-2"
            >
              <p className="text-sm text-slate-400">
                Selected images ({images.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group"
                  >
                    <div className="px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center gap-2 backdrop-blur-sm">
                      <span className="text-sm text-slate-300 truncate max-w-xs">
                        {image.name}
                      </span>
                      <motion.button
                        type="button"
                        onClick={() => removeImage(index)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-red-400 hover:text-red-300 text-lg font-bold"
                      >
                        ×
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-3 bg-red-500/20 border border-red-500/40 text-red-300 rounded-xl backdrop-blur-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Button */}
        <motion.button
          type="submit"
          {...buttonHover}
          disabled={isLoading || (!title.trim() && !bodyText.trim() && images.length === 0)}
          className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                ⏳
              </motion.span>
              Creating PDF...
            </span>
          ) : (
            'Create PDF'
          )}
        </motion.button>
      </form>

      {/* Download Button */}
      <AnimatePresence>
        {createdFilename && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-6 pt-4 border-t border-slate-700/60"
          >
            <motion.button
              {...buttonHover}
              onClick={handleDownload}
              className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
            >
              Download Created PDF
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedCard>
  );
}

export default CreateSection;
