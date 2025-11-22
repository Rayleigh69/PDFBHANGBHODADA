"""
Configuration settings for the PDF Chat + Editor + Creator backend.
Handles paths, environment variables, and app settings.
"""
import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Base directory (parent of backend folder)
    BASE_DIR: Path = Path(__file__).parent.parent
    
    # Data directories
    UPLOAD_DIR: Path = BASE_DIR / "data" / "uploads"
    GENERATED_DIR: Path = BASE_DIR / "data" / "generated"
    INDEX_DIR: Path = BASE_DIR / "data" / "indexes"
    
    # Embedding model
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # Chunking settings
    CHUNK_SIZE: int = 400  # Characters per chunk
    CHUNK_OVERLAP: int = 50  # Overlap between chunks
    
    # RAG settings
    DEFAULT_MAX_CHUNKS: int = 5
    
    # CORS settings
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # API keys (for future LLM integration)
    OPENAI_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()


def ensure_directories():
    """Create necessary directories if they don't exist."""
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    settings.GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    settings.INDEX_DIR.mkdir(parents=True, exist_ok=True)


# Initialize directories on import
ensure_directories()

