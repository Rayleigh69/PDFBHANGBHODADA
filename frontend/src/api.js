import axios from 'axios';

// Centralized API instance pointing to the FastAPI backend
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// TODO: Add Clerk auth token to requests when backend supports it
// Uncomment the following when backend token verification is enabled:
//
// import { useAuth } from '@clerk/clerk-react';
//
// // Add request interceptor to include auth token
// api.interceptors.request.use(async (config) => {
//   const { getToken } = useAuth();
//   const token = await getToken();
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

/**
 * AI Chat - Main chat endpoint with tool calling
 * @param {Array} messages - Chat history [{role: 'user'|'assistant', content: '...'}]
 * @param {Object} context - Optional context (e.g., {uploaded_pdfs: [...]})
 * @returns {Promise<{assistant_message, actions, sources, files}>}
 */
export const aiChat = async (messages, context = null) => {
  const response = await api.post('/api/ai/chat', {
    messages,
    context,
  });
  return response.data;
};

/**
 * Upload one or more PDF files
 * @param {FileList|File[]} files - PDF files to upload
 * @returns {Promise<Array<{pdf_id: string, filename: string}>>}
 */
export const uploadPDFs = async (files) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });
  
  // Create a custom config without Content-Type header for FormData
  const config = {
    headers: {
      ...api.defaults.headers.common,
    },
  };
  // Delete Content-Type to let browser set it with boundary for multipart/form-data
  delete config.headers['Content-Type'];
  
  const response = await api.post('/api/pdf/upload', formData, config);
  return response.data;
};

/**
 * Chat with a PDF using RAG (legacy endpoint, use aiChat instead)
 * @param {string} pdf_id - The PDF ID
 * @param {string} query - The user's question
 * @param {number} max_chunks - Maximum number of chunks to retrieve (optional)
 * @returns {Promise<{answer: string, sources: Array}>}
 */
export const chatWithPDF = async (pdf_id, query, max_chunks = 5) => {
  const formData = new FormData();
  formData.append('pdf_id', pdf_id);
  formData.append('query', query);
  formData.append('max_chunks', max_chunks.toString());
  
  const response = await api.post('/api/pdf/chat', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Add text to a PDF page
 * @param {string} pdf_id - The PDF ID
 * @param {number} page_number - Page number (0-indexed)
 * @param {string} text - Text to add
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} font_size - Font size
 * @returns {Promise<any>}
 */
export const addTextToPDF = async (pdf_id, page_number, text, x, y, font_size) => {
  const formData = new FormData();
  formData.append('pdf_id', pdf_id);
  formData.append('page_number', page_number.toString());
  formData.append('text', text);
  formData.append('x', x.toString());
  formData.append('y', y.toString());
  formData.append('font_size', font_size.toString());
  
  const response = await api.post('/api/pdf/edit/add-text', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Add image to a PDF page
 * @param {string} pdf_id - The PDF ID
 * @param {number} page_number - Page number (0-indexed)
 * @param {File} image - Image file
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} width - Image width (optional)
 * @param {number} height - Image height (optional)
 * @returns {Promise<any>}
 */
export const addImageToPDF = async (pdf_id, page_number, image, x, y, width, height) => {
  const formData = new FormData();
  formData.append('pdf_id', pdf_id);
  formData.append('page_number', page_number.toString());
  formData.append('image', image);
  formData.append('x', x.toString());
  formData.append('y', y.toString());
  if (width) formData.append('width', width.toString());
  if (height) formData.append('height', height.toString());
  
  const response = await api.post('/api/pdf/edit/add-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Create a custom PDF from canvas elements (for PDF Creator)
 * @param {Object} pdfData - PDF data with elements array
 * @returns {Promise<{filename?: string}>}
 */
export const createCustomPDF = async (pdfData) => {
  // For now, adapt to existing endpoint format
  // In a real implementation, you'd send the elements array to a specialized endpoint
  // This is a simplified version that uses the existing create endpoint
  const title = 'Custom PDF';
  const bodyText = pdfData.elements
    .filter(el => el.type === 'text')
    .map(el => el.content)
    .join('\n\n');
  
  const images = pdfData.elements
    .filter(el => el.type === 'image')
    .map(el => {
      // Convert base64 to blob
      const byteString = atob(el.src.split(',')[1]);
      const mimeString = el.src.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mimeString });
    });

  return await createPDF(title, bodyText, images);
};

/**
 * Create a custom PDF
 * @param {string} title - PDF title
 * @param {string} body_text - Body text content
 * @param {File[]} images - Array of image files
 * @returns {Promise<{pdf?: string, filename?: string}>} - Returns filename if JSON, or blob if binary
 */
export const createPDF = async (title, body_text, images = []) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('body_text', body_text);
  images.forEach((image) => {
    formData.append('images', image);
  });
  
  // Try JSON response first (might return {pdf: filename})
  try {
    const response = await api.post('/api/pdf/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // If response is JSON with filename
    if (response.data && typeof response.data === 'object' && !(response.data instanceof Blob)) {
      return response.data;
    }
    
    // If it's a blob, return it
    return { blob: response.data };
  } catch (err) {
    // If JSON fails, try blob response
    const response = await api.post('/api/pdf/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    return { blob: response.data };
  }
};

/**
 * Download a PDF by filename
 * @param {string} filename - The PDF filename
 * @returns {Promise<Blob>}
 */
export const downloadPDF = async (filename) => {
  const response = await api.get(`/api/pdf/download/${filename}`, {
    responseType: 'blob',
  });
  return response.data;
};

export default api;
