"""Request models for all API endpoints."""
from pydantic import BaseModel, Field, field_validator
from typing import Literal, List, Optional


# ===== PROJECT ENDPOINTS =====

class ProjectInitRequest(BaseModel):
    """POST /api/project/init - Initialize new project"""
    idea: str = Field(
        ...,
        min_length=10,
        max_length=200,
        description="Project idea description",
        examples=["Number guessing game"]
    )
    language: Literal["python", "javascript", "cpp"]
    level: Literal["beginner", "intermediate", "advanced"]
    
    @field_validator('idea')
    @classmethod
    def validate_idea(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Idea cannot be empty")
        return v


class ProjectContext(BaseModel):
    """Project context for code review."""
    title: str
    tasks: List[str]
    current_task_index: int = Field(..., ge=0)


class CodeReviewRequest(BaseModel):
    """POST /api/project/review - Comprehensive code review with direct feedback"""
    code: str = Field(..., min_length=1, max_length=10000)
    language: Literal["python", "javascript", "cpp"]
    project_context: ProjectContext
    previous_review: Optional[str] = None


class ChatMessage(BaseModel):
    """Single chat message."""
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    """POST /api/project/chat - General programming help"""
    message: str = Field(..., min_length=1, max_length=500)
    language: Literal["python", "javascript", "cpp"]
    project_title: str
    history: List[ChatMessage] = Field(default_factory=list, max_length=10)
    current_code: Optional[str] = Field(None, max_length=10000)


# ===== CHALLENGES ENDPOINTS =====

class ChallengeGenerateRequest(BaseModel):
    """POST /api/challenges/generate - Generate coding challenges"""
    count: int = Field(..., ge=1, le=5)
    difficulty: Literal["easy", "medium", "hard"]
    language: Literal["python", "javascript", "cpp"]
    existing_titles: List[str] = Field(default_factory=list)
