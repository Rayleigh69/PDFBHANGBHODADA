"""
AI Tools - All tools available to the AI assistant for PDF operations
"""
import json
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Any
import fitz  # PyMuPDF
from pypdf import PdfReader, PdfWriter
import io
from PIL import Image

from config import settings
from pdf_utils import (
    get_pdf_path,
    generate_pdf_id,
    save_uploaded_pdf,
    extract_text_from_pdf,
    get_generated_pdf_path,
)
from rag_utils import answer_question_from_pdf, create_index_for_pdf


# ==================== PDF HANDLING TOOLS ====================

def upload_pdfs_tool(files_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Upload and process PDF files.
    
    Args:
        files_data: List of dicts with 'filename' and 'content' (base64 or bytes)
    
    Returns:
        Dict with uploaded PDFs info
    """
    uploaded = []
    for file_data in files_data:
        pdf_id = generate_pdf_id()
        filename = file_data.get('filename', f'{pdf_id}.pdf')
        
        # Handle base64 or bytes
        content = file_data.get('content')
        if isinstance(content, str):
            import base64
            content = base64.b64decode(content)
        
        pdf_path = save_uploaded_pdf(content, pdf_id)
        create_index_for_pdf(pdf_id, pdf_path)
        
        uploaded.append({
            'pdf_id': pdf_id,
            'filename': filename,
            'page_count': len(fitz.open(pdf_path))
        })
    
    return {
        'success': True,
        'uploaded_pdfs': uploaded,
        'message': f'Uploaded {len(uploaded)} PDF(s)'
    }


def get_pdf_pages_tool(pdf_id: str) -> Dict[str, Any]:
    """
    Get page information for a PDF.
    
    Returns:
        Dict with page count and preview info
    """
    pdf_path = get_pdf_path(pdf_id)
    if not pdf_path:
        return {'error': f'PDF {pdf_id} not found'}
    
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    pages_info = []
    
    for page_num in range(total_pages):
        page = doc[page_num]
        text = page.get_text()[:200]  # First 200 chars as preview
        pages_info.append({
            'page_number': page_num + 1,
            'preview_text': text.strip()[:100] if text.strip() else '(No text)',
            'has_images': len(page.get_images()) > 0
        })
    
    doc.close()
    
    return {
        'pdf_id': pdf_id,
        'total_pages': total_pages,
        'pages': pages_info
    }


def split_pdf_tool(pdf_id: str, ranges: List[Dict[str, int]]) -> Dict[str, Any]:
    """
    Split a PDF into multiple PDFs by page ranges.
    
    Args:
        pdf_id: Source PDF ID
        ranges: List of {'start': int, 'end': int} (1-indexed)
    
    Returns:
        Dict with new PDF IDs
    """
    pdf_path = get_pdf_path(pdf_id)
    if not pdf_path:
        return {'error': f'PDF {pdf_id} not found'}
    
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    new_pdfs = []
    
    for i, range_info in enumerate(ranges):
        start = range_info.get('start', 1) - 1  # Convert to 0-indexed
        end = min(range_info.get('end', total_pages), total_pages) - 1
        
        if start < 0 or end < start:
            continue
        
        # Create new PDF with selected pages
        new_doc = fitz.open()
        new_doc.insert_pdf(doc, from_page=start, to_page=end)
        
        new_pdf_id = generate_pdf_id()
        new_path = settings.UPLOAD_DIR / f"{new_pdf_id}.pdf"
        new_doc.save(new_path)
        new_doc.close()
        
        create_index_for_pdf(new_pdf_id, new_path)
        
        new_pdfs.append({
            'pdf_id': new_pdf_id,
            'filename': f'split_{i+1}_{pdf_id[:8]}.pdf',
            'pages': f'{start+1}-{end+1}'
        })
    
    doc.close()
    
    return {
        'success': True,
        'original_pdf_id': pdf_id,
        'new_pdfs': new_pdfs,
        'message': f'Split into {len(new_pdfs)} PDF(s)'
    }


def merge_pdfs_tool(pdf_ids: List[str]) -> Dict[str, Any]:
    """
    Merge multiple PDFs into one.
    
    Args:
        pdf_ids: List of PDF IDs to merge
    
    Returns:
        Dict with merged PDF ID
    """
    pdf_paths = []
    for pdf_id in pdf_ids:
        pdf_path = get_pdf_path(pdf_id)
        if pdf_path:
            pdf_paths.append(pdf_path)
    
    if not pdf_paths:
        return {'error': 'No valid PDFs found to merge'}
    
    # Merge using PyMuPDF
    merged_doc = fitz.open()
    for pdf_path in pdf_paths:
        src_doc = fitz.open(pdf_path)
        merged_doc.insert_pdf(src_doc)
        src_doc.close()
    
    new_pdf_id = generate_pdf_id()
    new_path = settings.UPLOAD_DIR / f"{new_pdf_id}.pdf"
    merged_doc.save(new_path)
    merged_doc.close()
    
    create_index_for_pdf(new_pdf_id, new_path)
    
    return {
        'success': True,
        'merged_pdf_id': new_pdf_id,
        'filename': f'merged_{len(pdf_ids)}_pdfs.pdf',
        'source_pdf_ids': pdf_ids,
        'message': f'Merged {len(pdf_ids)} PDF(s)'
    }


def reorder_pages_tool(pdf_id: str, new_order: List[int]) -> Dict[str, Any]:
    """
    Rearrange pages in a PDF.
    
    Args:
        pdf_id: PDF ID
        new_order: List of page numbers in new order (1-indexed)
    
    Returns:
        Dict with new PDF ID
    """
    pdf_path = get_pdf_path(pdf_id)
    if not pdf_path:
        return {'error': f'PDF {pdf_id} not found'}
    
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    
    # Validate order
    if len(new_order) != total_pages or set(new_order) != set(range(1, total_pages + 1)):
        doc.close()
        return {'error': 'Invalid page order'}
    
    # Create new PDF with reordered pages
    new_doc = fitz.open()
    for page_num in new_order:
        new_doc.insert_pdf(doc, from_page=page_num-1, to_page=page_num-1)
    
    new_pdf_id = generate_pdf_id()
    new_path = settings.UPLOAD_DIR / f"{new_pdf_id}.pdf"
    new_doc.save(new_path)
    new_doc.close()
    doc.close()
    
    create_index_for_pdf(new_pdf_id, new_path)
    
    return {
        'success': True,
        'new_pdf_id': new_pdf_id,
        'filename': f'reordered_{pdf_id[:8]}.pdf',
        'message': 'Pages reordered successfully'
    }


def rotate_pages_tool(pdf_id: str, pages: List[int], angle: int) -> Dict[str, Any]:
    """
    Rotate selected pages by angle.
    
    Args:
        pdf_id: PDF ID
        pages: List of page numbers (1-indexed)
        angle: Rotation angle (90, 180, or 270)
    
    Returns:
        Dict with new PDF ID
    """
    if angle not in [90, 180, 270]:
        return {'error': 'Angle must be 90, 180, or 270'}
    
    pdf_path = get_pdf_path(pdf_id)
    if not pdf_path:
        return {'error': f'PDF {pdf_id} not found'}
    
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    
    # Rotate specified pages
    for page_num in pages:
        if 1 <= page_num <= total_pages:
            doc[page_num - 1].set_rotation(angle)
    
    new_pdf_id = generate_pdf_id()
    new_path = settings.UPLOAD_DIR / f"{new_pdf_id}.pdf"
    doc.save(new_path)
    doc.close()
    
    create_index_for_pdf(new_pdf_id, new_path)
    
    return {
        'success': True,
        'new_pdf_id': new_pdf_id,
        'filename': f'rotated_{pdf_id[:8]}.pdf',
        'rotated_pages': pages,
        'angle': angle,
        'message': f'Rotated {len(pages)} page(s) by {angle}°'
    }


def extract_pages_tool(pdf_id: str, pages: List[int]) -> Dict[str, Any]:
    """
    Extract specific pages into a new PDF.
    
    Args:
        pdf_id: Source PDF ID
        pages: List of page numbers (1-indexed)
    
    Returns:
        Dict with new PDF ID
    """
    pdf_path = get_pdf_path(pdf_id)
    if not pdf_path:
        return {'error': f'PDF {pdf_id} not found'}
    
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    
    # Create new PDF with extracted pages
    new_doc = fitz.open()
    for page_num in sorted(set(pages)):
        if 1 <= page_num <= total_pages:
            new_doc.insert_pdf(doc, from_page=page_num-1, to_page=page_num-1)
    
    new_pdf_id = generate_pdf_id()
    new_path = settings.UPLOAD_DIR / f"{new_pdf_id}.pdf"
    new_doc.save(new_path)
    new_doc.close()
    doc.close()
    
    create_index_for_pdf(new_pdf_id, new_path)
    
    return {
        'success': True,
        'new_pdf_id': new_pdf_id,
        'filename': f'extracted_pages_{pdf_id[:8]}.pdf',
        'extracted_pages': sorted(set(pages)),
        'message': f'Extracted {len(set(pages))} page(s)'
    }


def extract_text_tool(pdf_id: str, pages: Optional[List[int]] = None) -> Dict[str, Any]:
    """
    Extract text from PDF.
    
    Args:
        pdf_id: PDF ID
        pages: Optional list of page numbers (1-indexed), None for all pages
    
    Returns:
        Dict with extracted text
    """
    pdf_path = get_pdf_path(pdf_id)
    if not pdf_path:
        return {'error': f'PDF {pdf_id} not found'}
    
    pages_text = extract_text_from_pdf(pdf_path)
    
    if pages:
        # Filter by requested pages
        pages_text = [(p, t) for p, t in pages_text if p in pages]
    
    result = {
        'pdf_id': pdf_id,
        'pages': []
    }
    
    for page_num, text in pages_text:
        result['pages'].append({
            'page_number': page_num,
            'text': text,
            'char_count': len(text)
        })
    
    result['total_pages'] = len(result['pages'])
    result['total_text'] = '\n\n'.join([t for _, t in pages_text])
    
    return result


def extract_images_tool(pdf_id: str, pages: Optional[List[int]] = None) -> Dict[str, Any]:
    """
    Extract images from PDF.
    
    Args:
        pdf_id: PDF ID
        pages: Optional list of page numbers (1-indexed), None for all pages
    
    Returns:
        Dict with extracted images info
    """
    pdf_path = get_pdf_path(pdf_id)
    if not pdf_path:
        return {'error': f'PDF {pdf_id} not found'}
    
    doc = fitz.open(pdf_path)
    images = []
    
    for page_num in range(len(doc)):
        if pages and (page_num + 1) not in pages:
            continue
        
        page = doc[page_num]
        image_list = page.get_images()
        
        for img_idx, img in enumerate(image_list):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            
            # Save image
            image_id = f"{pdf_id}_p{page_num+1}_i{img_idx}"
            image_path = settings.UPLOAD_DIR / f"{image_id}.png"
            image_path.write_bytes(image_bytes)
            
            images.append({
                'image_id': image_id,
                'page_number': page_num + 1,
                'filename': f"{image_id}.png",
                'size_bytes': len(image_bytes),
                'download_url': f"/api/pdf/download/{image_id}.png"
            })
    
    doc.close()
    
    return {
        'pdf_id': pdf_id,
        'extracted_images': images,
        'total_images': len(images),
        'message': f'Extracted {len(images)} image(s)'
    }


# ==================== AI ANALYSIS TOOLS ====================

def qa_over_pdfs_tool(query: str, pdf_ids: List[str], max_chunks: int = 5) -> Dict[str, Any]:
    """
    Answer questions over multiple PDFs using RAG.
    
    Returns:
        Dict with answer and sources
    """
    all_sources = []
    answers = []
    
    for pdf_id in pdf_ids:
        pdf_path = get_pdf_path(pdf_id)
        if not pdf_path:
            continue
        
        try:
            result = answer_question_from_pdf(pdf_id, query, max_chunks=max_chunks)
            if result:
                answers.append(f"From {pdf_id}: {result.get('answer', '')}")
                sources = result.get('sources', [])
                for src in sources:
                    src['pdf_id'] = pdf_id
                    all_sources.append(src)
        except Exception as e:
            print(f"Error answering question for {pdf_id}: {e}")
    
    combined_answer = '\n\n'.join(answers) if answers else "I couldn't find relevant information in the provided PDFs."
    
    return {
        'answer': combined_answer,
        'sources': all_sources[:max_chunks * len(pdf_ids)],
        'pdf_ids': pdf_ids
    }


def summarize_pdf_tool(pdf_id: str, mode: str = "short") -> Dict[str, Any]:
    """
    Summarize a PDF.
    
    Args:
        pdf_id: PDF ID
        mode: "short", "long", or "chapter"
    
    Returns:
        Dict with summary
    """
    pdf_path = get_pdf_path(pdf_id)
    if not pdf_path:
        return {'error': f'PDF {pdf_id} not found'}
    
    pages_text = extract_text_from_pdf(pdf_path)
    full_text = '\n\n'.join([f"Page {p}:\n{t}" for p, t in pages_text])
    
    # For now, return a basic summary structure
    # In production, this would use an LLM to generate summaries
    word_count = len(full_text.split())
    char_count = len(full_text)
    
    summary = {
        'pdf_id': pdf_id,
        'mode': mode,
        'total_pages': len(pages_text),
        'word_count': word_count,
        'char_count': char_count,
        'summary': f"This PDF contains {len(pages_text)} pages with approximately {word_count} words. " +
                   f"Full text extraction available for detailed analysis."
    }
    
    if mode == "short":
        summary['bullets'] = [
            f"Total pages: {len(pages_text)}",
            f"Approximate word count: {word_count}",
            "Use 'long' mode for detailed summary"
        ]
    elif mode == "long":
        summary['detailed_summary'] = full_text[:2000] + "..." if len(full_text) > 2000 else full_text
    
    return summary


def extract_tables_tool(pdf_id: str, pages: Optional[List[int]] = None) -> Dict[str, Any]:
    """
    Extract tables from PDF.
    
    Returns:
        Dict with extracted tables
    """
    pdf_path = get_pdf_path(pdf_id)
    if not pdf_path:
        return {'error': f'PDF {pdf_id} not found'}
    
    doc = fitz.open(pdf_path)
    tables = []
    
    for page_num in range(len(doc)):
        if pages and (page_num + 1) not in pages:
            continue
        
        page = doc[page_num]
        # PyMuPDF table extraction (basic)
        # In production, use more advanced table extraction
        text = page.get_text()
        
        # Simple table detection (look for tab-separated or structured text)
        lines = text.split('\n')
        potential_tables = []
        
        for line in lines:
            if '\t' in line or '|' in line:
                potential_tables.append(line)
        
        if potential_tables:
            tables.append({
                'page_number': page_num + 1,
                'table_data': potential_tables[:10],  # Limit to first 10 rows
                'row_count': len(potential_tables)
            })
    
    doc.close()
    
    return {
        'pdf_id': pdf_id,
        'tables': tables,
        'total_tables': len(tables),
        'message': f'Found {len(tables)} potential table(s)'
    }


def extract_keywords_tool(pdf_id: str, top_k: int = 10) -> Dict[str, Any]:
    """
    Extract keywords from PDF.
    
    Returns:
        Dict with keywords
    """
    pdf_path = get_pdf_path(pdf_id)
    if not pdf_path:
        return {'error': f'PDF {pdf_id} not found'}
    
    pages_text = extract_text_from_pdf(pdf_path)
    full_text = ' '.join([t for _, t in pages_text])
    
    # Simple keyword extraction (word frequency)
    # In production, use NLP libraries like spaCy or NLTK
    words = full_text.lower().split()
    word_freq = {}
    
    # Filter out common words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'}
    
    for word in words:
        if len(word) > 3 and word not in stop_words:
            word_freq[word] = word_freq.get(word, 0) + 1
    
    # Get top keywords
    sorted_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:top_k]
    
    return {
        'pdf_id': pdf_id,
        'keywords': [{'word': word, 'frequency': freq} for word, freq in sorted_keywords],
        'top_k': top_k
    }


# Tool registry
TOOLS = {
    # PDF Handling
    'upload_pdfs': upload_pdfs_tool,
    'get_pdf_pages': get_pdf_pages_tool,
    'split_pdf': split_pdf_tool,
    'merge_pdfs': merge_pdfs_tool,
    'reorder_pages': reorder_pages_tool,
    'rotate_pages': rotate_pages_tool,
    'extract_pages': extract_pages_tool,
    'extract_text': extract_text_tool,
    'extract_images': extract_images_tool,
    
    # AI Analysis
    'qa_over_pdfs': qa_over_pdfs_tool,
    'summarize_pdf': summarize_pdf_tool,
    'extract_tables': extract_tables_tool,
    'extract_keywords': extract_keywords_tool,
}

