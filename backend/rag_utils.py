"""
RAG (Retrieval-Augmented Generation) utilities.
Handles embeddings, FAISS indexing, and RAG querying.
"""
import pickle
from pathlib import Path
from typing import List, Dict, Tuple
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

from config import settings
from pdf_utils import extract_text_from_pdf


# Global embedding model (loaded once for performance)
_embedding_model: SentenceTransformer = None


def get_embedding_model() -> SentenceTransformer:
    """
    Get or load the embedding model (singleton pattern).
    
    Returns:
        SentenceTransformer model instance
    """
    global _embedding_model
    if _embedding_model is None:
        print(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        _embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
        print("Embedding model loaded successfully")
    return _embedding_model


def chunk_text(text: str, chunk_size: int = None, overlap: int = None) -> List[str]:
    """
    Split text into chunks with optional overlap.
    
    Args:
        text: Text to chunk
        chunk_size: Size of each chunk in characters (default from settings)
        overlap: Overlap between chunks in characters (default from settings)
        
    Returns:
        List of text chunks
    """
    if chunk_size is None:
        chunk_size = settings.CHUNK_SIZE
    if overlap is None:
        overlap = settings.CHUNK_OVERLAP
    
    if len(text) <= chunk_size:
        return [text]
    
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        
        # Try to break at word boundary if not at end
        if end < len(text):
            # Find last space or newline in the chunk
            last_space = max(
                chunk.rfind(' '),
                chunk.rfind('\n'),
                chunk.rfind('\t')
            )
            if last_space > chunk_size * 0.5:  # Only break if we're not too early
                chunk = chunk[:last_space + 1]
                end = start + last_space + 1
        
        chunks.append(chunk.strip())
        start = end - overlap  # Overlap for context
    
    return chunks


def create_index_for_pdf(pdf_id: str, pdf_path: Path) -> bool:
    """
    Create a FAISS index for a PDF.
    
    Args:
        pdf_id: Unique PDF identifier
        pdf_path: Path to the PDF file
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Extract text from PDF
        pages_text = extract_text_from_pdf(pdf_path)
        
        # Prepare chunks and metadata
        chunks = []
        metadata = []
        
        for page_num, page_text in pages_text:
            if not page_text.strip():
                continue
            
            # Chunk the page text
            page_chunks = chunk_text(page_text)
            
            for chunk in page_chunks:
                if chunk.strip():  # Only add non-empty chunks
                    chunks.append(chunk)
                    metadata.append({
                        'page_number': page_num + 1,  # 1-indexed for display
                        'text_chunk': chunk
                    })
        
        if not chunks:
            print(f"Warning: No text chunks found for PDF {pdf_id}")
            return False
        
        # Get embedding model
        model = get_embedding_model()
        
        # Generate embeddings for all chunks
        print(f"Generating embeddings for {len(chunks)} chunks...")
        embeddings = model.encode(chunks, show_progress_bar=True)
        embeddings = np.array(embeddings).astype('float32')
        
        # Create FAISS index
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)  # L2 distance
        index.add(embeddings)
        
        # Save index and metadata
        index_path = settings.INDEX_DIR / f"{pdf_id}_index.faiss"
        meta_path = settings.INDEX_DIR / f"{pdf_id}_meta.pkl"
        
        faiss.write_index(index, str(index_path))
        
        with open(meta_path, 'wb') as f:
            pickle.dump(metadata, f)
        
        print(f"Index created successfully for PDF {pdf_id}: {len(chunks)} chunks")
        return True
        
    except Exception as e:
        print(f"Error creating index for PDF {pdf_id}: {e}")
        return False


def load_index(pdf_id: str) -> Tuple[faiss.Index, List[Dict]]:
    """
    Load FAISS index and metadata for a PDF.
    
    Args:
        pdf_id: PDF identifier
        
    Returns:
        Tuple of (FAISS index, metadata list)
        
    Raises:
        FileNotFoundError: If index files don't exist
    """
    index_path = settings.INDEX_DIR / f"{pdf_id}_index.faiss"
    meta_path = settings.INDEX_DIR / f"{pdf_id}_meta.pkl"
    
    if not index_path.exists() or not meta_path.exists():
        raise FileNotFoundError(f"Index not found for PDF {pdf_id}")
    
    index = faiss.read_index(str(index_path))
    
    with open(meta_path, 'rb') as f:
        metadata = pickle.load(f)
    
    return index, metadata


def answer_question_from_pdf(
    pdf_id: str,
    query: str,
    max_chunks: int = 5
) -> Tuple[str, List[Dict]]:
    """
    Answer a question about a PDF using RAG.
    
    This function:
    1. Loads the FAISS index for the PDF
    2. Embeds the query
    3. Retrieves top-k relevant chunks
    4. Generates an answer (placeholder implementation)
    
    TODO: Replace the placeholder answer generation with a real LLM call
    (OpenAI, Anthropic, etc.) when ready.
    
    Args:
        pdf_id: PDF identifier
        query: User's question
        max_chunks: Maximum number of chunks to retrieve
        
    Returns:
        Tuple of (answer string, list of source dictionaries)
        
    Raises:
        FileNotFoundError: If index doesn't exist
    """
    # Load index and metadata
    index, metadata = load_index(pdf_id)
    
    # Get embedding model
    model = get_embedding_model()
    
    # Embed the query
    query_embedding = model.encode([query])
    query_embedding = np.array(query_embedding).astype('float32')
    
    # Search for similar chunks
    k = min(max_chunks, len(metadata))
    distances, indices = index.search(query_embedding, k)
    
    # Retrieve relevant chunks
    retrieved_chunks = []
    sources = []
    
    for idx in indices[0]:
        if idx < len(metadata):
            chunk_meta = metadata[idx]
            retrieved_chunks.append(chunk_meta['text_chunk'])
            sources.append({
                'page_number': chunk_meta['page_number'],
                'snippet': chunk_meta['text_chunk'][:200] + '...' if len(chunk_meta['text_chunk']) > 200 else chunk_meta['text_chunk']
            })
    
    # Generate answer (placeholder implementation)
    # TODO: Replace this with a real LLM call (OpenAI, Anthropic, etc.)
    if not retrieved_chunks:
        answer = "I couldn't find relevant information in the PDF to answer your question."
    else:
        # Simple concatenation-based answer (placeholder)
        answer = f"Based on the PDF content:\n\n"
        for i, chunk in enumerate(retrieved_chunks, 1):
            answer += f"{chunk}\n\n"
        answer += "\n[Note: This is a placeholder answer. Real LLM integration coming soon.]"
    
    return answer, sources

