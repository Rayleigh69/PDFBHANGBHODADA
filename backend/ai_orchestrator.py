"""
AI Orchestrator - Handles LLM interactions with tool calling
"""
import json
from typing import List, Dict, Any, Optional
from openai import OpenAI
from config import settings
from ai_tools import TOOLS


# Initialize OpenAI client
client = None
if settings.OPENAI_API_KEY:
    client = OpenAI(api_key=settings.OPENAI_API_KEY)


def get_tool_definitions() -> List[Dict[str, Any]]:
    """Get OpenAI function definitions for all tools."""
    return [
        # PDF Handling Tools
        {
            "type": "function",
            "function": {
                "name": "upload_pdfs",
                "description": "Upload and process PDF files. Returns PDF IDs and page counts.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "files_data": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "filename": {"type": "string"},
                                    "content": {"type": "string", "description": "Base64 encoded PDF content"}
                                }
                            }
                        }
                    },
                    "required": ["files_data"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_pdf_pages",
                "description": "Get page information and previews for a PDF.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pdf_id": {"type": "string", "description": "PDF identifier"}
                    },
                    "required": ["pdf_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "split_pdf",
                "description": "Split a PDF into multiple PDFs by page ranges.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pdf_id": {"type": "string"},
                        "ranges": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "start": {"type": "integer", "description": "Start page (1-indexed)"},
                                    "end": {"type": "integer", "description": "End page (1-indexed)"}
                                }
                            }
                        }
                    },
                    "required": ["pdf_id", "ranges"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "merge_pdfs",
                "description": "Merge multiple PDFs into one.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pdf_ids": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of PDF IDs to merge"
                        }
                    },
                    "required": ["pdf_ids"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "reorder_pages",
                "description": "Rearrange pages in a PDF.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pdf_id": {"type": "string"},
                        "new_order": {
                            "type": "array",
                            "items": {"type": "integer"},
                            "description": "New page order (1-indexed)"
                        }
                    },
                    "required": ["pdf_id", "new_order"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "rotate_pages",
                "description": "Rotate selected pages by 90, 180, or 270 degrees.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pdf_id": {"type": "string"},
                        "pages": {
                            "type": "array",
                            "items": {"type": "integer"},
                            "description": "Page numbers to rotate (1-indexed)"
                        },
                        "angle": {"type": "integer", "enum": [90, 180, 270]}
                    },
                    "required": ["pdf_id", "pages", "angle"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "extract_pages",
                "description": "Extract specific pages into a new PDF.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pdf_id": {"type": "string"},
                        "pages": {
                            "type": "array",
                            "items": {"type": "integer"},
                            "description": "Page numbers to extract (1-indexed)"
                        }
                    },
                    "required": ["pdf_id", "pages"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "extract_text",
                "description": "Extract text from PDF pages.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pdf_id": {"type": "string"},
                        "pages": {
                            "type": "array",
                            "items": {"type": "integer"},
                            "description": "Optional page numbers (1-indexed), omit for all pages"
                        }
                    },
                    "required": ["pdf_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "extract_images",
                "description": "Extract images from PDF pages.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pdf_id": {"type": "string"},
                        "pages": {
                            "type": "array",
                            "items": {"type": "integer"},
                            "description": "Optional page numbers (1-indexed), omit for all pages"
                        }
                    },
                    "required": ["pdf_id"]
                }
            }
        },
        # AI Analysis Tools
        {
            "type": "function",
            "function": {
                "name": "qa_over_pdfs",
                "description": "Answer questions over PDFs using RAG (Retrieval Augmented Generation).",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "The question to answer"},
                        "pdf_ids": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of PDF IDs to search"
                        },
                        "max_chunks": {"type": "integer", "default": 5}
                    },
                    "required": ["query", "pdf_ids"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "summarize_pdf",
                "description": "Summarize a PDF in short, long, or chapter mode.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pdf_id": {"type": "string"},
                        "mode": {
                            "type": "string",
                            "enum": ["short", "long", "chapter"],
                            "description": "Summary mode: short (bullets), long (paragraph), chapter (structured)"
                        }
                    },
                    "required": ["pdf_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "extract_tables",
                "description": "Extract tables from PDF pages.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pdf_id": {"type": "string"},
                        "pages": {
                            "type": "array",
                            "items": {"type": "integer"},
                            "description": "Optional page numbers (1-indexed), omit for all pages"
                        }
                    },
                    "required": ["pdf_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "extract_keywords",
                "description": "Extract key topics/keywords from a PDF.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "pdf_id": {"type": "string"},
                        "top_k": {"type": "integer", "default": 10, "description": "Number of top keywords"}
                    },
                    "required": ["pdf_id"]
                }
            }
        },
    ]


def call_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Call a tool by name with arguments."""
    if tool_name not in TOOLS:
        return {"error": f"Unknown tool: {tool_name}"}
    
    try:
        tool_func = TOOLS[tool_name]
        result = tool_func(**arguments)
        return result
    except Exception as e:
        return {"error": f"Tool execution error: {str(e)}"}


def chat_with_ai(
    messages: List[Dict[str, str]],
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Chat with AI assistant using tool calling.
    
    Args:
        messages: Chat history (list of {"role": "user"/"assistant", "content": "..."})
        context: Optional context (e.g., uploaded PDFs)
    
    Returns:
        Dict with assistant message, actions, sources, files
    """
    if not client:
        # Fallback: simple response without LLM
        return {
            "assistant_message": "AI features require OPENAI_API_KEY to be set in environment variables.",
            "actions": [],
            "sources": [],
            "files": []
        }
    
    # Prepare system message
    system_message = """You are an intelligent PDF assistant. You can:
- Handle PDF operations (upload, split, merge, rotate, extract)
- Answer questions about PDFs using RAG
- Summarize PDFs
- Extract tables, keywords, and data

When users ask you to do something, use the appropriate tools. Always explain what you did in natural language.
If a user mentions PDFs, try to identify which PDFs they're referring to from context."""
    
    if context:
        if context.get('uploaded_pdfs'):
            pdf_list = ', '.join([f"{p['filename']} ({p['pdf_id']})" for p in context['uploaded_pdfs']])
            system_message += f"\n\nAvailable PDFs: {pdf_list}"
    
    # Prepare messages for OpenAI
    openai_messages = [
        {"role": "system", "content": system_message}
    ] + messages
    
    # Call OpenAI with function calling
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # or "gpt-4" for better performance
            messages=openai_messages,
            tools=get_tool_definitions(),
            tool_choice="auto"
        )
        
        assistant_message = response.choices[0].message
        content = assistant_message.content or ""
        tool_calls = assistant_message.tool_calls or []
        
        # Execute tool calls
        actions = []
        tool_results = []
        
        for tool_call in tool_calls:
            tool_name = tool_call.function.name
            try:
                arguments = json.loads(tool_call.function.arguments)
            except:
                arguments = {}
            
            # Call the tool
            result = call_tool(tool_name, arguments)
            tool_results.append({
                "tool_call_id": tool_call.id,
                "role": "tool",
                "name": tool_name,
                "content": json.dumps(result)
            })
            
            # Record action
            actions.append({
                "type": tool_name,
                "tool_call_id": tool_call.id,
                "arguments": arguments,
                "result": result
            })
        
        # If tools were called, get final response
        if tool_results:
            openai_messages.append({
                "role": "assistant",
                "content": content,
                "tool_calls": [{"id": tc.id, "type": "function", "function": {"name": tc.function.name, "arguments": tc.function.arguments}} for tc in tool_calls]
            })
            openai_messages.extend(tool_results)
            
            # Get final response
            final_response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=openai_messages
            )
            content = final_response.choices[0].message.content or content
        
        # Extract sources and files from actions
        sources = []
        files = []
        
        for action in actions:
            result = action.get("result", {})
            
            # Extract sources (from Q&A)
            if "sources" in result:
                sources.extend(result["sources"])
            
            # Extract file references
            if "new_pdf_id" in result:
                files.append({
                    "type": "pdf",
                    "pdf_id": result["new_pdf_id"],
                    "filename": result.get("filename", "unknown.pdf")
                })
            elif "uploaded_pdfs" in result:
                for pdf in result["uploaded_pdfs"]:
                    files.append({
                        "type": "pdf",
                        "pdf_id": pdf["pdf_id"],
                        "filename": pdf["filename"]
                    })
            elif "extracted_images" in result:
                for img in result["extracted_images"]:
                    files.append({
                        "type": "image",
                        "image_id": img["image_id"],
                        "filename": img["filename"],
                        "download_url": img["download_url"]
                    })
        
        return {
            "assistant_message": content,
            "actions": actions,
            "sources": sources,
            "files": files
        }
        
    except Exception as e:
        return {
            "assistant_message": f"I encountered an error: {str(e)}",
            "actions": [],
            "sources": [],
            "files": []
        }

