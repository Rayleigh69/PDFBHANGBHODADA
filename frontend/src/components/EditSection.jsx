import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addTextToPDF, addImageToPDF, downloadPDF } from '../api';
import AnimatedCard from './AnimatedCard';
import { buttonHover, fadeIn } from '../utils/animations';

/**
 * EditSection - Edit PDFs by adding text or images
 */
function EditSection({ uploadedPDFs }) {
  const [selectedPDF, setSelectedPDF] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [activeTab, setActiveTab] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editedFilename, setEditedFilename] = useState(null);

  // Text editing form state
  const [text, setText] = useState('');
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(50);
  const [fontSize, setFontSize] = useState(12);

  // Image editing form state
  const [imageFile, setImageFile] = useState(null);
  const [imageX, setImageX] = useState(50);
  const [imageY, setImageY] = useState(50);
  const [imageWidth, setImageWidth] = useState(100);
  const [imageHeight, setImageHeight] = useState(100);

  // Handle text addition
  const handleAddText = async (e) => {
    e.preventDefault();
    if (!selectedPDF || !text.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await addTextToPDF(
        selectedPDF,
        pageNumber,
        text,
        textX,
        textY,
        fontSize
      );
      
      setSuccess('Text added successfully!');
      setEditedFilename(response.filename || 'edited.pdf');
      // Reset form
      setText('');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add text');
      console.error('Add text error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image addition
  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!selectedPDF || !imageFile) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await addImageToPDF(
        selectedPDF,
        pageNumber,
        imageFile,
        imageX,
        imageY,
        imageWidth,
        imageHeight
      );
      
      setSuccess('Image added successfully!');
      setEditedFilename(response.filename || 'edited.pdf');
      // Reset form
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add image');
      console.error('Add image error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle PDF download
  const handleDownload = async () => {
    if (!editedFilename) return;

    try {
      const blob = await downloadPDF(editedFilename);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = editedFilename;
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
    <AnimatedCard delay={0.2}>
      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Edit PDF</h2>

      {/* PDF and Page Selection */}
      <div className="mb-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Select PDF:
          </label>
          <select
            value={selectedPDF}
            onChange={(e) => {
              setSelectedPDF(e.target.value);
              setEditedFilename(null);
              setSuccess(null);
            }}
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
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Page Number:
          </label>
          <input
            type="number"
            min="1"
            value={pageNumber}
            onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/60 mb-4">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'text'
              ? 'text-emerald-400 border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Add Text
        </button>
        <button
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === 'image'
              ? 'text-emerald-400 border-b-2 border-emerald-500'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Add Image
        </button>
      </div>

      {/* Error/Success Messages */}
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
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl backdrop-blur-sm"
          >
            ✓ {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Tab */}
      {activeTab === 'text' && (
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleAddText}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Text:
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm transition-all"
              placeholder="Enter text to add..."
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                X Position:
              </label>
              <input
                type="number"
                value={textX}
                onChange={(e) => setTextX(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Y Position:
              </label>
              <input
                type="number"
                value={textY}
                onChange={(e) => setTextY(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Font Size:
              </label>
              <input
                type="number"
                min="1"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm transition-all"
              />
            </div>
          </div>
          <motion.button
            type="submit"
            {...buttonHover}
            disabled={!selectedPDF || !text.trim() || isLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add Text'}
          </motion.button>
        </motion.form>
      )}

      {/* Image Tab */}
      {activeTab === 'image' && (
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleAddImage}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">
              Image:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 backdrop-blur-sm transition-all"
            />
            {imageFile && (
              <p className="mt-2 text-sm text-emerald-400">
                Selected: {imageFile.name}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                X Position:
              </label>
              <input
                type="number"
                value={imageX}
                onChange={(e) => setImageX(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Y Position:
              </label>
              <input
                type="number"
                value={imageY}
                onChange={(e) => setImageY(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Width:
              </label>
              <input
                type="number"
                min="1"
                value={imageWidth}
                onChange={(e) => setImageWidth(parseFloat(e.target.value) || 100)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Height:
              </label>
              <input
                type="number"
                min="1"
                value={imageHeight}
                onChange={(e) => setImageHeight(parseFloat(e.target.value) || 100)}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700/60 rounded-xl text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/60 backdrop-blur-sm transition-all"
              />
            </div>
          </div>
          <motion.button
            type="submit"
            {...buttonHover}
            disabled={!selectedPDF || !imageFile || isLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add Image'}
          </motion.button>
        </motion.form>
      )}

      {/* Download Button */}
      <AnimatePresence>
        {editedFilename && (
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
              Download Edited PDF
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedCard>
  );
}

export default EditSection;
