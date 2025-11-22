# PDF Genie Backend

FastAPI backend for PDF Chat + Editor + Creator application.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server

```bash
# Option 1: Using the run script
python run.py

# Option 2: Using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

### 3. Verify It's Working

Visit `http://localhost:8000/health` in your browser. You should see:
```json
{"status": "ok"}
```

Or check the API docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

- `GET /health` - Health check
- `POST /api/pdf/upload` - Upload PDFs
- `POST /api/pdf/chat` - Chat with PDF
- `POST /api/pdf/edit/add-text` - Add text to PDF
- `POST /api/pdf/edit/add-image` - Add image to PDF
- `POST /api/pdf/create` - Create custom PDF
- `GET /api/pdf/download/{filename}` - Download PDF

## Data Directories

The backend automatically creates:
- `data/uploads/` - Uploaded PDFs
- `data/generated/` - Generated/edited PDFs
- `data/indexes/` - FAISS vector indexes

## CORS Configuration

The backend is configured to accept requests from:
- http://localhost:5173 (Vite)
- http://localhost:3000 (CRA)
- http://127.0.0.1:5173
- http://127.0.0.1:3000

To modify, edit `config.py`.
