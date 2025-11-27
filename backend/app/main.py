"""Main FastAPI application setup."""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.routers import project, challenges
from app.services.gemini_service import GeminiService

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.is_production else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Startup
    logger.info("🚀 Starting Cobuild AI Backend...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Gemini Model: {settings.gemini_model}")
    
    # Initialize Gemini service (validate API key)
    try:
        gemini = GeminiService()
        await gemini.health_check()
        logger.info("✅ Gemini API connection established")
    except Exception as e:
        logger.error(f"❌ Failed to connect to Gemini API: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Cobuild AI Backend...")


# Create FastAPI app
app = FastAPI(
    title="Cobuild AI API",
    description="Backend API for Cobuild AI - Teaching programming through AI-guided projects",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Include Routers
app.include_router(project.router, prefix="/api/project", tags=["Project"])
app.include_router(challenges.router, prefix="/api/challenges", tags=["Challenges"])


# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors (422)."""
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "حدث خطأ غير متوقع. الرجاء المحاولة لاحقاً.",
            "retryable": True
        }
    )


# Health Check Endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "environment": settings.environment,
        "model": settings.gemini_model
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Cobuild AI Backend API",
        "version": "1.0.0",
        "docs": "/docs"
    }
