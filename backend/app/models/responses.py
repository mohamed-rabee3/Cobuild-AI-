"""Response models for all API endpoints."""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal


# ===== PROJECT RESPONSES =====

class ProjectInitResponse(BaseModel):
    """Response for POST /api/project/init"""
    project_title: str
    mermaid_chart: str
    tasks: List[str]
    starter_filename: str
    full_solution_code: str


class CodeReviewResponse(BaseModel):
    """Response for POST /api/project/review"""
    review_comment: str
    highlight_line: Optional[int] = None
    severity: Literal["info", "warning", "error"]


class ChatResponse(BaseModel):
    """Response for POST /api/project/chat"""
    response: str
    suggested_reading: Optional[str] = None


# ===== CHALLENGES RESPONSES =====

class TestCase(BaseModel):
    """Single test case."""
    input: str
    expected: str
    hidden: bool


class Challenge(BaseModel):
    """Single challenge."""
    title: str
    description: str
    function_signature: str
    test_cases: List[TestCase]


class ChallengeGenerateResponse(BaseModel):
    """Response for POST /api/challenges/generate"""
    challenges: List[Challenge]


# ===== ERROR RESPONSES =====

class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str
    message: str
    retryable: bool
    details: Optional[str] = None
