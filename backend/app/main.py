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

# Add middleware to log all requests (before CORS)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"📥 {request.method} {request.url.path} from {request.client.host if request.client else 'unknown'}")
    if request.method == "OPTIONS":
        logger.info(f"   CORS preflight request")
    response = await call_next(request)
    logger.info(f"📤 Response: {response.status_code}")
    return response

# CORS Configuration
# Allow both common frontend ports in development
allowed_origins = [
    settings.frontend_url,
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://[::1]:8080",  # IPv6 localhost
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
    logger.error(f"Validation error for {request.method} {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "error": "validation_error",
            "message": "البيانات المرسلة غير صحيحة",
            "detail": exc.errors(),
            "retryable": False
        }
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
