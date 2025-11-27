"""API router for project-related endpoints."""
from fastapi import APIRouter, HTTPException
from app.models.requests import ProjectInitRequest, CodeReviewRequest, ChatRequest
from app.models.responses import ProjectInitResponse, CodeReviewResponse, ChatResponse
from app.services.gemini_service import GeminiService, GeminiServiceError
from app.prompts.project_prompts import (
    get_project_init_prompt,
    get_code_review_prompt,
    get_chat_prompt
)
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize Gemini service (singleton)
gemini = GeminiService()


@router.post("/init", response_model=ProjectInitResponse)
async def initialize_project(request: ProjectInitRequest):
    """
    POST /api/project/init
    
    Generate complete project plan including:
    - Project title (Arabic)
    - Mermaid flowchart
    - Task checklist
    - Complete solution code
    - Starter filename
    """
    try:
        logger.info(f"Initializing project: {request.idea} ({request.language}, {request.level})")
        
        # Generate prompt
        prompt = get_project_init_prompt(request.idea, request.language, request.level)
        
        # Call Gemini API
        result = await gemini.generate_json(
            prompt=prompt,
            temperature=0.7,
            max_output_tokens=4096
        )
        
        # Validate response structure
        required_keys = ["project_title", "mermaid_chart", "tasks", "full_solution_code", "starter_filename"]
        if not all(key in result for key in required_keys):
            raise ValueError(f"Missing required keys in AI response: {result.keys()}")
        
        logger.info(f"✅ Project initialized: {result['project_title']}")
        return ProjectInitResponse(**result)
    
    except GeminiServiceError as e:
        logger.error(f"Gemini service error: {e.message}")
        raise HTTPException(
            status_code=503 if e.retryable else 500,
            detail={
                "error": "ai_generation_failed",
                "message": e.message,
                "retryable": e.retryable
            }
        )
    except Exception as e:
        logger.error(f"Unexpected error in project init: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "internal_error",
                "message": "فشل في توليد المشروع. حاول مرة أخرى.",
                "retryable": True
            }
        )


@router.post("/review", response_model=CodeReviewResponse)
async def review_code(request: CodeReviewRequest):
    """
    POST /api/project/review
    
    Socratic code review that guides students through questions,
    never providing direct solutions.
    """
    try:
        logger.info(f"Reviewing code for: {request.project_context.title}")
        
        # Generate Socratic review prompt
        prompt = get_code_review_prompt(
            code=request.code,
            language=request.language,
            project_title=request.project_context.title,
            tasks=request.project_context.tasks,
            current_task_index=request.project_context.current_task_index,
            previous_review=request.previous_review
        )
        
        # Call Gemini API
        result = await gemini.generate_json(
            prompt=prompt,
            temperature=0.8,  # Higher for varied questioning
            max_output_tokens=500
        )
        
        return CodeReviewResponse(**result)
    
    except GeminiServiceError as e:
        raise HTTPException(
            status_code=503 if e.retryable else 500,
            detail={
                "error": "review_failed",
                "message": e.message,
                "retryable": e.retryable
            }
        )
    except Exception as e:
        logger.error(f"Error in code review: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "review_failed",
                "message": "فشل تحليل الكود. حاول مرة أخرى.",
                "retryable": True
            }
        )


@router.post("/chat", response_model=ChatResponse)
async def chat_with_mentor(request: ChatRequest):
    """
    POST /api/project/chat
    
    General programming help and question answering.
    Provides educational explanations without solving the project.
    """
    try:
        logger.info(f"Chat request for: {request.project_title}")
        
        # Generate chat prompt
        prompt = get_chat_prompt(
            message=request.message,
            language=request.language,
            project_title=request.project_title,
            history=[msg.dict() for msg in request.history],
            current_code=request.current_code
        )
        
        # Call Gemini API (text mode, not JSON)
        response_text = await gemini.generate_text(
            prompt=prompt,
            temperature=0.7,
            max_output_tokens=800
        )
        
        return ChatResponse(response=response_text, suggested_reading=None)
    
    except GeminiServiceError as e:
        raise HTTPException(
            status_code=503 if e.retryable else 500,
            detail={
                "error": "chat_failed",
                "message": e.message,
                "retryable": e.retryable
            }
        )
    except Exception as e:
        logger.error(f"Error in chat: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "chat_failed",
                "message": "فشل الاتصال بالمساعد الذكي. حاول مرة أخرى.",
                "retryable": True
            }
        )
