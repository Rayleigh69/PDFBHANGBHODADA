"""
FastAPI application for PDF Chat + Editor + Creator.
Main entry point with all API routes.
"""
import uuid
from pathlib import Path
from typing import List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from models import (
    PDFUploadResponse,
    PDFChatResponse,
    Source,
    EditPDFResponse,
    CreatePDFResponse,
    HealthResponse,
)
from pdf_utils import (
    generate_pdf_id,
    save_uploaded_pdf,
    add_text_to_pdf,
    add_image_to_pdf,
    create_custom_pdf,
    get_generated_pdf_path,
)
from rag_utils import create_index_for_pdf, answer_question_from_pdf
from ai_orchestrator import chat_with_ai


# Initialize FastAPI app
app = FastAPI(
    title="PDF Genie API",
    description="PDF Chat + Editor + Creator Backend",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Health Check ====================
@app.get("/health", response_model=HealthResponse)
@app.get("/ping", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok")


# ==================== PDF Upload ====================
@app.post("/api/pdf/upload", response_model=List[PDFUploadResponse])
async def upload_pdfs(files: List[UploadFile] = File(...)):
    """
    Upload one or more PDF files.
    
    For each PDF:
    - Saves to data/uploads/{pdf_id}.pdf
    - Generates embeddings and creates FAISS index
    - Returns PDF IDs and filenames
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided"
        )
    
    uploaded_pdfs = []
    
    for file in files:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            continue  # Skip non-PDF files
        
        # Generate PDF ID
        pdf_id = generate_pdf_id()
        
        # Read file content
        content = await file.read()
        
        # Save PDF
        pdf_path = save_uploaded_pdf(content, pdf_id)
        
        # Create index for RAG
        try:
            create_index_for_pdf(pdf_id, pdf_path)
        except Exception as e:
            print(f"Warning: Failed to create index for {pdf_id}: {e}")
            # Continue anyway - index can be created later if needed
        
        uploaded_pdfs.append(
            PDFUploadResponse(
                pdf_id=pdf_id,
                filename=file.filename
            )
        )
    
    if not uploaded_pdfs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid PDF files uploaded"
        )
    
    # Return list directly (frontend expects array)
    # Note: FastAPI will serialize this as JSON array
    return uploaded_pdfs


# ==================== PDF Chat (RAG) ====================
@app.post("/api/pdf/chat", response_model=PDFChatResponse)
async def chat_with_pdf(
    pdf_id: str = Form(...),
    query: str = Form(...),
    max_chunks: int = Form(default=5)
):
    """
    Chat with a PDF using RAG.
    
    Retrieves relevant chunks from the PDF and generates an answer.
    """
    if not query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty"
        )
    
    try:
        answer, sources_data = answer_question_from_pdf(
            pdf_id=pdf_id,
            query=query,
            max_chunks=max_chunks
        )
        
        # Convert sources to Pydantic models
        sources = [
            Source(
                page_number=src['page_number'],
                snippet=src['snippet']
            )
            for src in sources_data
        ]
        
        return PDFChatResponse(
            answer=answer,
            sources=sources
        )
        
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Index not found for PDF {pdf_id}. Please upload the PDF first."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat request: {str(e)}"
        )


# ==================== PDF Editing: Add Text ====================
@app.post("/api/pdf/edit/add-text", response_model=EditPDFResponse)
async def add_text_to_pdf_endpoint(
    pdf_id: str = Form(...),
    page_number: int = Form(...),
    text: str = Form(...),
    x: float = Form(...),
    y: float = Form(...),
    font_size: int = Form(default=12)
):
    """
    Add text to a PDF at specified coordinates.
    """
    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty"
        )
    
    try:
        filename = add_text_to_pdf(
            pdf_id=pdf_id,
            page_number=page_number,
            text=text,
            x=x,
            y=y,
            font_size=font_size
        )
        
        return EditPDFResponse(
            filename=filename,
            message="Text added successfully"
        )
        
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding text: {str(e)}"
        )


# ==================== PDF Editing: Add Image ====================
@app.post("/api/pdf/edit/add-image", response_model=EditPDFResponse)
async def add_image_to_pdf_endpoint(
    pdf_id: str = Form(...),
    page_number: int = Form(...),
    image: UploadFile = File(...),
    x: float = Form(...),
    y: float = Form(...),
    width: float = Form(default=None),
    height: float = Form(default=None)
):
    """
    Add an image to a PDF at specified coordinates.
    """
    # Validate image file
    if not image.content_type or not image.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    try:
        # Read image data
        image_data = await image.read()
        
        filename = add_image_to_pdf(
            pdf_id=pdf_id,
            page_number=page_number,
            image_data=image_data,
            x=x,
            y=y,
            width=width,
            height=height
        )
        
        return EditPDFResponse(
            filename=filename,
            message="Image added successfully"
        )
        
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding image: {str(e)}"
        )


# ==================== Create Custom PDF ====================
@app.post("/api/pdf/create", response_model=CreatePDFResponse)
async def create_pdf(
    title: str = Form(...),
    body_text: str = Form(default=""),
    images: List[UploadFile] = File(default=[])
):
    """
    Create a custom PDF from title, body text, and optional images.
    """
    if not title.strip() and not body_text.strip() and not images:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one of title, body_text, or images must be provided"
        )
    
    try:
        # Read image data
        image_data_list = []
        for img_file in images:
            if img_file.content_type and img_file.content_type.startswith('image/'):
                img_data = await img_file.read()
                image_data_list.append(img_data)
        
        filename = create_custom_pdf(
            title=title,
            body_text=body_text,
            images=image_data_list
        )
        
        return CreatePDFResponse(
            pdf=filename,
            message="PDF created successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating PDF: {str(e)}"
        )


# ==================== AI Chat ====================
@app.post("/api/ai/chat", response_model=AIChatResponse)
async def ai_chat(request: AIChatRequest):
    """
    Main AI chat endpoint with tool calling.
    
    Receives chat history and context, uses LLM with function calling
    to perform PDF operations and analysis, returns structured response.
    """
    try:
        # Convert messages to dict format
        messages = [
            {"role": msg.role, "content": msg.content}
            for msg in request.messages
        ]
        
        # Call AI orchestrator
        result = chat_with_ai(
            messages=messages,
            context=request.context
        )
        
        return AIChatResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI chat error: {str(e)}"
        )


# ==================== Download PDF ====================
@app.get("/api/pdf/download/{filename}")
async def download_pdf(filename: str):
    """
    Download a generated PDF file.
    """
    # Security: Prevent directory traversal
    if '..' in filename or '/' in filename or '\\' in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename"
        )
    
    pdf_path = get_generated_pdf_path(filename)
    
    if not pdf_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"PDF file '{filename}' not found"
        )
    
    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=filename
    )


# ==================== Error Handlers ====================
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Custom 404 handler."""
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Custom 500 handler."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


# ==================== Startup Event ====================
@app.on_event("startup")
async def startup_event():
    """Initialize on startup."""
    print("PDF Genie API starting up...")
    print(f"Upload directory: {settings.UPLOAD_DIR}")
    print(f"Generated directory: {settings.GENERATED_DIR}")
    print(f"Index directory: {settings.INDEX_DIR}")
    print("API ready!")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

