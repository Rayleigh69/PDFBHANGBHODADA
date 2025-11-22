"""
Pydantic models for request/response validation.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ==================== Health Check ====================
class HealthResponse(BaseModel):
    status: str = Field(default="ok", description="Health status")


# ==================== PDF Upload ====================
class PDFUploadResponse(BaseModel):
    pdf_id: str = Field(..., description="Unique PDF identifier")
    filename: str = Field(..., description="Original filename")


class PDFUploadListResponse(BaseModel):
    pdfs: List[PDFUploadResponse] = Field(..., description="List of uploaded PDFs")


# ==================== PDF Chat (RAG) ====================
class Source(BaseModel):
    page_number: int = Field(..., description="Page number (1-indexed)")
    snippet: str = Field(..., description="Text snippet from the chunk")


class PDFChatResponse(BaseModel):
    answer: str = Field(..., description="AI-generated answer")
    sources: List[Source] = Field(default_factory=list, description="Source chunks")


# ==================== PDF Editing ====================
class AddTextRequest(BaseModel):
    pdf_id: str
    page_number: int
    text: str
    x: float = 50.0
    y: float = 50.0
    font_size: int = 12


class AddImageRequest(BaseModel):
    pdf_id: str
    page_number: int
    x: float = 50.0
    y: float = 50.0
    width: Optional[float] = None
    height: Optional[float] = None


class EditPDFResponse(BaseModel):
    filename: str = Field(..., description="Generated PDF filename")
    message: str = "PDF edited successfully"


# ==================== PDF Creation ====================
class CreatePDFRequest(BaseModel):
    title: str
    body_text: str = ""
    # images handled as files separately


class CreatePDFResponse(BaseModel):
    pdf: str = Field(..., description="Generated PDF filename")
    message: str = "PDF created successfully"


# ==================== AI Chat ====================
class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class AIChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Chat history")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Optional context (e.g., uploaded PDFs)")


class Action(BaseModel):
    type: str = Field(..., description="Action type (tool name)")
    tool_call_id: Optional[str] = None
    arguments: Dict[str, Any] = Field(default_factory=dict)
    result: Dict[str, Any] = Field(default_factory=dict)


class FileReference(BaseModel):
    type: str = Field(..., description="File type: 'pdf' or 'image'")
    pdf_id: Optional[str] = None
    image_id: Optional[str] = None
    filename: str = Field(..., description="Filename")
    download_url: Optional[str] = None


class AIChatResponse(BaseModel):
    assistant_message: str = Field(..., description="AI assistant's response")
    actions: List[Action] = Field(default_factory=list, description="Actions performed")
    sources: List[Source] = Field(default_factory=list, description="Source references")
    files: List[FileReference] = Field(default_factory=list, description="Generated/referenced files")
