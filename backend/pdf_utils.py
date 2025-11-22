"""
PDF utility functions for loading, saving, editing, and creating PDFs.
Uses PyMuPDF (fitz) for PDF operations.
"""
import uuid
from pathlib import Path
from typing import List, Tuple, Optional
import fitz  # PyMuPDF
from PIL import Image
import io

from config import settings


def generate_pdf_id() -> str:
    """Generate a unique PDF ID."""
    return str(uuid.uuid4())


def save_uploaded_pdf(file_content: bytes, pdf_id: str) -> Path:
    """
    Save an uploaded PDF file to the uploads directory.
    
    Args:
        file_content: PDF file content as bytes
        pdf_id: Unique identifier for the PDF
        
    Returns:
        Path to the saved PDF file
    """
    file_path = settings.UPLOAD_DIR / f"{pdf_id}.pdf"
    file_path.write_bytes(file_content)
    return file_path


def extract_text_from_pdf(pdf_path: Path) -> List[Tuple[int, str]]:
    """
    Extract text from a PDF, returning a list of (page_number, text) tuples.
    
    Args:
        pdf_path: Path to the PDF file
        
    Returns:
        List of tuples: (page_number (0-indexed), text_content)
    """
    doc = fitz.open(pdf_path)
    pages_text = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        pages_text.append((page_num, text))
    
    doc.close()
    return pages_text


def add_text_to_pdf(
    pdf_id: str,
    page_number: int,
    text: str,
    x: float,
    y: float,
    font_size: int = 12
) -> str:
    """
    Add text to a PDF at specified coordinates.
    
    Args:
        pdf_id: Identifier of the source PDF
        page_number: Page number (0-indexed)
        text: Text to add
        x: X coordinate
        y: Y coordinate
        font_size: Font size (default 12)
        
    Returns:
        Filename of the edited PDF
    """
    # Load original PDF
    source_path = settings.UPLOAD_DIR / f"{pdf_id}.pdf"
    if not source_path.exists():
        raise FileNotFoundError(f"PDF with id {pdf_id} not found")
    
    doc = fitz.open(source_path)
    
    # Validate page number
    if page_number < 0 or page_number >= len(doc):
        doc.close()
        raise ValueError(f"Page number {page_number} is out of range (0-{len(doc)-1})")
    
    # Get the page
    page = doc[page_number]
    
    # Insert text
    # Using default font (helv) and color (black)
    point = fitz.Point(x, y)
    page.insert_text(
        point,
        text,
        fontsize=font_size,
        color=(0, 0, 0)  # Black
    )
    
    # Save edited PDF
    output_filename = f"{pdf_id}_edited_{uuid.uuid4().hex[:8]}.pdf"
    output_path = settings.GENERATED_DIR / output_filename
    doc.save(output_path)
    doc.close()
    
    return output_filename


def add_image_to_pdf(
    pdf_id: str,
    page_number: int,
    image_data: bytes,
    x: float,
    y: float,
    width: Optional[float] = None,
    height: Optional[float] = None
) -> str:
    """
    Add an image to a PDF at specified coordinates.
    
    Args:
        pdf_id: Identifier of the source PDF
        page_number: Page number (0-indexed)
        image_data: Image file content as bytes
        x: X coordinate
        y: Y coordinate
        width: Image width (default 200)
        height: Image height (default 200)
        
    Returns:
        Filename of the edited PDF
    """
    # Load original PDF
    source_path = settings.UPLOAD_DIR / f"{pdf_id}.pdf"
    if not source_path.exists():
        raise FileNotFoundError(f"PDF with id {pdf_id} not found")
    
    doc = fitz.open(source_path)
    
    # Validate page number
    if page_number < 0 or page_number >= len(doc):
        doc.close()
        raise ValueError(f"Page number {page_number} is out of range (0-{len(doc)-1})")
    
    # Get the page
    page = doc[page_number]
    
    # Default dimensions if not provided
    if width is None:
        width = 200.0
    if height is None:
        height = 200.0
    
    # Create image rect
    rect = fitz.Rect(x, y, x + width, y + height)
    
    # Insert image
    # Open image from bytes
    img = Image.open(io.BytesIO(image_data))
    # Convert to RGB if necessary (PyMuPDF doesn't support RGBA directly)
    if img.mode == 'RGBA':
        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
        rgb_img.paste(img, mask=img.split()[3])
        img = rgb_img
    
    # Convert PIL image to bytes for PyMuPDF
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    # Insert image
    page.insert_image(rect, stream=img_bytes.getvalue())
    
    # Save edited PDF
    output_filename = f"{pdf_id}_img_{uuid.uuid4().hex[:8]}.pdf"
    output_path = settings.GENERATED_DIR / output_filename
    doc.save(output_path)
    doc.close()
    
    return output_filename


def create_custom_pdf(
    title: str,
    body_text: str,
    images: List[bytes]
) -> str:
    """
    Create a custom PDF from title, body text, and optional images.
    
    Args:
        title: PDF title
        body_text: Body text content
        images: List of image file contents as bytes
        
    Returns:
        Filename of the created PDF
    """
    doc = fitz.open()  # Create new PDF
    
    # First page: Title + Body text
    page = doc.new_page(width=595, height=842)  # A4 size
    
    # Add title (larger font, centered)
    title_rect = fitz.Rect(50, 50, 545, 150)
    page.insert_textbox(
        title_rect,
        title,
        fontsize=24,
        align=fitz.TEXT_ALIGN_CENTER,
        color=(0, 0, 0)
    )
    
    # Add body text
    body_rect = fitz.Rect(50, 180, 545, 800)
    page.insert_textbox(
        body_rect,
        body_text,
        fontsize=12,
        align=fitz.TEXT_ALIGN_LEFT,
        color=(0, 0, 0)
    )
    
    # Add each image on a new page
    for img_data in images:
        new_page = doc.new_page(width=595, height=842)
        
        # Open and process image
        img = Image.open(io.BytesIO(img_data))
        if img.mode == 'RGBA':
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[3])
            img = rgb_img
        
        # Calculate image dimensions to fit page (maintain aspect ratio)
        img_width, img_height = img.size
        page_width = 545  # 595 - 50 (margins)
        page_height = 792  # 842 - 50 (margins)
        
        # Scale to fit page
        scale_w = page_width / img_width
        scale_h = page_height / img_height
        scale = min(scale_w, scale_h)
        
        new_width = img_width * scale
        new_height = img_height * scale
        
        # Center image
        x = (page_width - new_width) / 2 + 50
        y = (page_height - new_height) / 2 + 50
        
        rect = fitz.Rect(x, y, x + new_width, y + new_height)
        
        # Convert to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        
        new_page.insert_image(rect, stream=img_bytes.getvalue())
    
    # Save PDF
    output_filename = f"custom_{uuid.uuid4().hex[:8]}.pdf"
    output_path = settings.GENERATED_DIR / output_filename
    doc.save(output_path)
    doc.close()
    
    return output_filename


def get_pdf_path(pdf_id: str) -> Optional[Path]:
    """
    Get the path to an uploaded PDF by ID.
    
    Args:
        pdf_id: PDF identifier
        
    Returns:
        Path to PDF file, or None if not found
    """
    pdf_path = settings.UPLOAD_DIR / f"{pdf_id}.pdf"
    if pdf_path.exists():
        return pdf_path
    return None


def get_generated_pdf_path(filename: str) -> Optional[Path]:
    """
    Get the path to a generated PDF by filename.
    
    Args:
        filename: PDF filename
        
    Returns:
        Path to PDF file, or None if not found
    """
    pdf_path = settings.GENERATED_DIR / filename
    if pdf_path.exists():
        return pdf_path
    return None

