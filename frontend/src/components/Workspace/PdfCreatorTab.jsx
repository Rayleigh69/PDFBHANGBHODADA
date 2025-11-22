import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createCustomPDF, downloadPDF } from '../../api';
import { useApp } from '../../context/AppContext';

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
          <h2 className="text-2xl font-semibold text-gray-900">
            Create Your PDF
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Design professional PDFs with text and images
          </p>
        </div>
        <button
          onClick={generatePDF}
          disabled={elements.length === 0 || isGenerating}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate PDF'}
        </button>
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
            {typeof error === 'string' ? error : String(error)}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
          >
            ✓ {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tool Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Tool Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Tools
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTool('text')}
                className={`w-full px-4 py-3 text-left font-medium text-sm transition-all rounded-lg ${
                  activeTool === 'text'
                    ? 'bg-blue-50 border-2 border-blue-500 text-blue-600'
                    : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                Text
              </button>
              <button
                onClick={() => setActiveTool('image')}
                className={`w-full px-4 py-3 text-left font-medium text-sm transition-all rounded-lg ${
                  activeTool === 'image'
                    ? 'bg-blue-50 border-2 border-blue-500 text-blue-600'
                    : 'bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-gray-300'
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
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-gray-900">
                Text Options
              </h3>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter text..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Font Size
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value) || 24)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Font Weight
                  </label>
                  <select
                    value={fontWeight}
                    onChange={(e) => setFontWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Alignment
                  </label>
                  <select
                    value={textAlign}
                    onChange={(e) => setTextAlign(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
              <button
                onClick={addTextElement}
                disabled={!textContent.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Text
              </button>
            </motion.div>
          )}

          {/* Image Tools */}
          {activeTool === 'image' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-gray-900">
                Image Options
              </h3>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 file:mr-4 file:py-2 file:px-4 file:bg-blue-600 file:text-white file:border-0 file:rounded file:cursor-pointer hover:file:bg-blue-700"
              />
              {imageFile && (
                <p className="text-sm text-gray-600">
                  Selected: {imageFile.name}
                </p>
              )}
              <button
                onClick={addImageElement}
                disabled={!imageFile}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Image
              </button>
            </motion.div>
          )}

          {/* Element Properties */}
          {selectedElementData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Properties
                </h3>
                <button
                  onClick={() => deleteElement(selectedElement)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    X Position
                  </label>
                  <input
                    type="number"
                    value={selectedElementData.x}
                    onChange={(e) => updateElement(selectedElement, { x: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Y Position
                  </label>
                  <input
                    type="number"
                    value={selectedElementData.y}
                    onChange={(e) => updateElement(selectedElement, { y: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                {selectedElementData.type === 'image' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Width
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={selectedElementData.width}
                        onChange={(e) => updateElement(selectedElement, { width: parseFloat(e.target.value) || 100 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Height
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={selectedElementData.height}
                        onChange={(e) => updateElement(selectedElement, { height: parseFloat(e.target.value) || 100 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                  </>
                )}
                {selectedElementData.type === 'text' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Font Size
                      </label>
                      <input
                        type="number"
                        min="8"
                        max="72"
                        value={selectedElementData.fontSize}
                        onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) || 24 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Color
                      </label>
                      <input
                        type="color"
                        value={selectedElementData.color}
                        onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
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
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Canvas (A4 Size)
            </h3>
            <div
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="relative bg-white mx-auto border border-gray-300 rounded shadow-sm"
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
          isSelected ? 'ring-2 ring-blue-500' : ''
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
          isSelected ? 'ring-2 ring-blue-500' : ''
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

