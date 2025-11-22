import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addTextToPDF, addImageToPDF, downloadPDF } from '../../api';
import { useApp } from '../../context/AppContext';
import ValorantButton from '../Valorant/ValorantButton';

/**
 * PdfEditorTab - Edit PDFs (Valorant styled)
 */
function PdfEditorTab() {
  const { uploadedPDFs, addActivity } = useApp();
  const [selectedPDF, setSelectedPDF] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [activeMode, setActiveMode] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editedFilename, setEditedFilename] = useState(null);

  // Text editing state
  const [text, setText] = useState('');
  const [textX, setTextX] = useState(50);
  const [textY, setTextY] = useState(50);
  const [fontSize, setFontSize] = useState(12);

  // Image editing state
  const [imageFile, setImageFile] = useState(null);
  const [imageX, setImageX] = useState(50);
  const [imageY, setImageY] = useState(50);
  const [imageWidth, setImageWidth] = useState(100);
  const [imageHeight, setImageHeight] = useState(100);

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
      
      const pdfName = uploadedPDFs.find(p => p.pdf_id === selectedPDF)?.filename || 'PDF';
      addActivity({
        type: 'edit',
        title: `Edited ${pdfName} (added text)`,
      });
      
      setText('');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add text');
    } finally {
      setIsLoading(false);
    }
  };

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
      
      const pdfName = uploadedPDFs.find(p => p.pdf_id === selectedPDF)?.filename || 'PDF';
      addActivity({
        type: 'edit',
        title: `Edited ${pdfName} (added image)`,
      });
      
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add image');
    } finally {
      setIsLoading(false);
    }
  };

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
    }
  };

  return (
    <div className="space-y-6">
      {/* PDF & Page Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0a0a0f] border-2 border-red-500/30 p-6">
          <label className="block text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3">
            Select PDF
          </label>
          <select
            value={selectedPDF}
            onChange={(e) => {
              setSelectedPDF(e.target.value);
              setEditedFilename(null);
              setSuccess(null);
            }}
            className="w-full px-4 py-3 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none uppercase"
          >
            <option value="" className="bg-[#050509]">-- Choose a PDF --</option>
            {uploadedPDFs.map((pdf) => (
              <option key={pdf.pdf_id} value={pdf.pdf_id} className="bg-[#050509]">
                {pdf.filename}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-[#0a0a0f] border-2 border-red-500/30 p-6">
          <label className="block text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3">
            Page Number
          </label>
          <input
            type="number"
            min="1"
            value={pageNumber}
            onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 border-b-2 border-red-500/20">
        <button
          onClick={() => setActiveMode('text')}
          className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all ${
            activeMode === 'text'
              ? 'text-red-400 border-b-2 border-red-500'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          Add Text
        </button>
        <button
          onClick={() => setActiveMode('image')}
          className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all ${
            activeMode === 'image'
              ? 'text-red-400 border-b-2 border-red-500'
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/20 border-2 border-red-500/50 p-4 text-red-400"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-cyan-500/20 border-2 border-cyan-500/50 p-4 text-cyan-400"
          >
            ✓ {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Text Mode */}
      {activeMode === 'text' && (
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleAddText}
          className="bg-[#0a0a0f] border-2 border-red-500/30 p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3">
              Text Content
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
              placeholder="Enter text to add..."
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                X Position
              </label>
              <input
                type="number"
                value={textX}
                onChange={(e) => setTextX(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                Y Position
              </label>
              <input
                type="number"
                value={textY}
                onChange={(e) => setTextY(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                Font Size
              </label>
              <input
                type="number"
                min="1"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                className="w-full px-4 py-3 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
          <ValorantButton
            type="submit"
            disabled={!selectedPDF || !text.trim() || isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Text'}
          </ValorantButton>
        </motion.form>
      )}

      {/* Image Mode */}
      {activeMode === 'image' && (
        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleAddImage}
          className="bg-[#0a0a0f] border-2 border-red-500/30 p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-cyan-400 mb-3">
              Image File
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
              className="w-full px-4 py-3 bg-[#050509] border-2 border-red-500/30 text-white file:mr-4 file:py-2 file:px-4 file:bg-red-500 file:text-white file:border-0 file:cursor-pointer hover:file:bg-red-400"
            />
            {imageFile && (
              <p className="mt-2 text-sm text-cyan-400">
                Selected: {imageFile.name}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                X Position
              </label>
              <input
                type="number"
                value={imageX}
                onChange={(e) => setImageX(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                Y Position
              </label>
              <input
                type="number"
                value={imageY}
                onChange={(e) => setImageY(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                Width
              </label>
              <input
                type="number"
                min="1"
                value={imageWidth}
                onChange={(e) => setImageWidth(parseFloat(e.target.value) || 100)}
                className="w-full px-4 py-3 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                Height
              </label>
              <input
                type="number"
                min="1"
                value={imageHeight}
                onChange={(e) => setImageHeight(parseFloat(e.target.value) || 100)}
                className="w-full px-4 py-3 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>
          <ValorantButton
            type="submit"
            disabled={!selectedPDF || !imageFile || isLoading}
          >
            {isLoading ? 'Adding...' : 'Add Image'}
          </ValorantButton>
        </motion.form>
      )}

      {/* Download Button */}
      <AnimatePresence>
        {editedFilename && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-[#0a0a0f] border-2 border-cyan-500/30 p-6"
          >
            <ValorantButton
              variant="secondary"
              onClick={handleDownload}
              className="w-full"
            >
              Download Edited PDF
            </ValorantButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PdfEditorTab;

