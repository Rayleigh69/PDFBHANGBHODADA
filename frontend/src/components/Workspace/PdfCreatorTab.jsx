import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createCustomPDF, downloadPDF } from '../../api';
import { useApp } from '../../context/AppContext';
import ValorantButton from '../Valorant/ValorantButton';

/**
 * PdfCreatorTab - Canva-like PDF Creator (Valorant styled)
 */
function PdfCreatorTab() {
  const { addActivity } = useApp();
  const canvasRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Tool panel state
  const [activeTool, setActiveTool] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState('normal');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textAlign, setTextAlign] = useState('left');
  const [imageFile, setImageFile] = useState(null);

  // Canvas dimensions (A4 ratio)
  const canvasWidth = 800;
  const canvasHeight = 1131; // A4 ratio

  const addTextElement = () => {
    if (!textContent.trim()) return;

    const newElement = {
      id: Date.now(),
      type: 'text',
      content: textContent,
      x: 50,
      y: 50,
      fontSize,
      fontWeight,
      color: textColor,
      align: textAlign,
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    setTextContent('');
  };

  const addImageElement = () => {
    if (!imageFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const newElement = {
        id: Date.now(),
        type: 'image',
        src: e.target.result,
        x: 50,
        y: 50,
        width: 200,
        height: 200,
      };

      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
      setImageFile(null);
    };
    reader.readAsDataURL(imageFile);
  };

  const updateElement = (id, updates) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const handleElementClick = (e, elementId) => {
    e.stopPropagation();
    setSelectedElement(elementId);
  };

  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

  const handleDrag = (id, newX, newY) => {
    updateElement(id, { x: newX, y: newY });
  };

  const generatePDF = async () => {
    if (elements.length === 0) {
      setError('Add at least one element to create a PDF');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare PDF data
      const pdfData = {
        elements: elements.map(el => {
          if (el.type === 'text') {
            return {
              type: 'text',
              content: el.content,
              x: el.x,
              y: el.y,
              fontSize: el.fontSize,
              fontWeight: el.fontWeight,
              color: el.color,
              align: el.align,
            };
          } else if (el.type === 'image') {
            return {
              type: 'image',
              src: el.src,
              x: el.x,
              y: el.y,
              width: el.width,
              height: el.height,
            };
          }
          return null;
        }).filter(Boolean),
        width: canvasWidth,
        height: canvasHeight,
      };

      const response = await createCustomPDF(pdfData);
      
      setSuccess('PDF created successfully!');
      
      addActivity({
        type: 'create',
        title: 'Created custom PDF',
      });

      // Download the PDF if filename is provided
      if (response.filename) {
        try {
          const blob = await downloadPDF(response.filename);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = response.filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (err) {
          console.error('Download error:', err);
        }
      } else if (response.blob) {
        // If response is a blob directly
        const url = window.URL.createObjectURL(response.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom-pdf.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-cyan-400">
            Create Your PDF
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Design professional PDFs with text and images
          </p>
        </div>
        <ValorantButton
          onClick={generatePDF}
          disabled={elements.length === 0 || isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate PDF'}
        </ValorantButton>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tool Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tool Selection */}
          <div className="bg-[#0a0a0f] border-2 border-red-500/30 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">
              Tools
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTool('text')}
                className={`w-full px-4 py-3 text-left uppercase tracking-wider text-sm transition-all ${
                  activeTool === 'text'
                    ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                    : 'bg-[#050509] border-2 border-red-500/30 text-slate-400 hover:border-red-500/50'
                }`}
              >
                Text
              </button>
              <button
                onClick={() => setActiveTool('image')}
                className={`w-full px-4 py-3 text-left uppercase tracking-wider text-sm transition-all ${
                  activeTool === 'image'
                    ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                    : 'bg-[#050509] border-2 border-red-500/30 text-slate-400 hover:border-red-500/50'
                }`}
              >
                Image
              </button>
            </div>
          </div>

          {/* Text Tools */}
          {activeTool === 'text' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0a0a0f] border-2 border-red-500/30 p-4 space-y-4"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                Text Options
              </h3>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter text..."
                rows={3}
                className="w-full px-3 py-2 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
              />
              <div className="space-y-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                    Font Size
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value) || 24)}
                    className="w-full px-3 py-2 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                    Font Weight
                  </label>
                  <select
                    value={fontWeight}
                    onChange={(e) => setFontWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 bg-[#050509] border-2 border-red-500/30 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                    Alignment
                  </label>
                  <select
                    value={textAlign}
                    onChange={(e) => setTextAlign(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
              <ValorantButton
                onClick={addTextElement}
                disabled={!textContent.trim()}
                className="w-full"
              >
                Add Text
              </ValorantButton>
            </motion.div>
          )}

          {/* Image Tools */}
          {activeTool === 'image' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0a0a0f] border-2 border-red-500/30 p-4 space-y-4"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                Image Options
              </h3>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0] || null)}
                className="w-full px-3 py-2 bg-[#050509] border-2 border-red-500/30 text-white file:mr-4 file:py-2 file:px-4 file:bg-red-500 file:text-white file:border-0 file:cursor-pointer hover:file:bg-red-400"
              />
              {imageFile && (
                <p className="text-sm text-cyan-400">
                  Selected: {imageFile.name}
                </p>
              )}
              <ValorantButton
                onClick={addImageElement}
                disabled={!imageFile}
                className="w-full"
              >
                Add Image
              </ValorantButton>
            </motion.div>
          )}

          {/* Element Properties */}
          {selectedElementData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0a0a0f] border-2 border-cyan-500/30 p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">
                  Properties
                </h3>
                <button
                  onClick={() => deleteElement(selectedElement)}
                  className="text-red-400 hover:text-red-300 text-sm uppercase"
                >
                  Delete
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                    X Position
                  </label>
                  <input
                    type="number"
                    value={selectedElementData.x}
                    onChange={(e) => updateElement(selectedElement, { x: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                    Y Position
                  </label>
                  <input
                    type="number"
                    value={selectedElementData.y}
                    onChange={(e) => updateElement(selectedElement, { y: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
                {selectedElementData.type === 'image' && (
                  <>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                        Width
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={selectedElementData.width}
                        onChange={(e) => updateElement(selectedElement, { width: parseFloat(e.target.value) || 100 })}
                        className="w-full px-3 py-2 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                        Height
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={selectedElementData.height}
                        onChange={(e) => updateElement(selectedElement, { height: parseFloat(e.target.value) || 100 })}
                        className="w-full px-3 py-2 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}
                {selectedElementData.type === 'text' && (
                  <>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                        Font Size
                      </label>
                      <input
                        type="number"
                        min="8"
                        max="72"
                        value={selectedElementData.fontSize}
                        onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) || 24 })}
                        className="w-full px-3 py-2 bg-[#050509] border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2">
                        Color
                      </label>
                      <input
                        type="color"
                        value={selectedElementData.color}
                        onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                        className="w-full h-10 bg-[#050509] border-2 border-red-500/30 cursor-pointer"
                      />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-3">
          <div className="bg-[#0a0a0f] border-2 border-red-500/30 p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 mb-4">
              Canvas (A4 Size)
            </h3>
            <div
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="relative bg-white mx-auto"
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                maxWidth: '100%',
                maxHeight: '70vh',
              }}
            >
              {elements.map((element) => (
                <DraggableElement
                  key={element.id}
                  element={element}
                  isSelected={selectedElement === element.id}
                  onClick={(e) => handleElementClick(e, element.id)}
                  onDrag={(x, y) => handleDrag(element.id, x, y)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DraggableElement - Element that can be dragged on canvas
 */
function DraggableElement({ element, isSelected, onClick, onDrag }) {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const canvas = document.querySelector('[ref="canvasRef"]') || 
                   document.querySelector('.relative.bg-white') || 
                   document.body;
    const rect = canvas.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - rect.left - offset.x, rect.width));
    const newY = Math.max(0, Math.min(e.clientY - rect.top - offset.y, rect.height));
    onDrag(newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, offset]);

  if (element.type === 'text') {
    return (
      <motion.div
        onClick={onClick}
        onMouseDown={handleMouseDown}
        className={`absolute cursor-move ${
          isSelected ? 'ring-2 ring-cyan-400' : ''
        }`}
        style={{
          left: `${element.x}px`,
          top: `${element.y}px`,
          fontSize: `${element.fontSize}px`,
          fontWeight: element.fontWeight,
          color: element.color,
          textAlign: element.align,
        }}
        whileHover={{ scale: 1.02 }}
      >
        {element.content}
      </motion.div>
    );
  }

  if (element.type === 'image') {
    return (
      <motion.img
        src={element.src}
        onClick={onClick}
        onMouseDown={handleMouseDown}
        className={`absolute cursor-move ${
          isSelected ? 'ring-2 ring-cyan-400' : ''
        }`}
        style={{
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          objectFit: 'contain',
        }}
        whileHover={{ scale: 1.02 }}
        alt="PDF element"
      />
    );
  }

  return null;
}

export default PdfCreatorTab;

