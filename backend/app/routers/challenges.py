"""API router for challenges generation."""
from fastapi import APIRouter, HTTPException
from app.models.requests import ChallengeGenerateRequest
from app.models.responses import ChallengeGenerateResponse, Challenge
from app.services.gemini_service import GeminiService, GeminiServiceError
from app.prompts.challenge_prompts import get_challenges_prompt
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize Gemini service (singleton)
gemini = GeminiService()


@router.post("/generate", response_model=ChallengeGenerateResponse)
async def generate_challenges(request: ChallengeGenerateRequest):
    """
    POST /api/challenges/generate
    
    Generate function-based coding challenges with test cases.
    Avoids duplicating existing challenge titles.
    """
    try:
        logger.info(f"Generating {request.count} {request.difficulty} challenges for {request.language}")
        
        # Generate prompt with duplicate avoidance
        prompt = get_challenges_prompt(
            count=request.count,
            difficulty=request.difficulty,
            language=request.language,
            existing_titles=request.existing_titles
        )
        
        # Call Gemini API
        result = await gemini.generate_json(
            prompt=prompt,
            temperature=0.9,  # Higher for creativity
            max_output_tokens=16384  # Increased for multiple challenges
        )
        
        # Result should be an array of challenges
        if not isinstance(result, list):
            logger.error(f"❌ AI response is not an array. Type: {type(result)}, Value: {result}")
            raise ValueError(f"AI response is not an array. Got type: {type(result).__name__}")
        
        # Parse challenges
        try:
            challenges = [Challenge(**challenge_data) for challenge_data in result]
        except Exception as parse_error:
            logger.error(f"❌ Failed to parse challenges: {parse_error}")
            logger.error(f"Response data: {result}")
            raise ValueError(f"Failed to parse challenge data: {parse_error}")
        
        logger.info(f"✅ Generated {len(challenges)} challenges")
        return ChallengeGenerateResponse(challenges=challenges)
    
    except GeminiServiceError as e:
        raise HTTPException(
            status_code=503 if e.retryable else 500,
            detail={
                "error": "generation_failed",
                "message": e.message,
                "retryable": e.retryable
            }
        )
    except Exception as e:
        logger.error(f"Error generating challenges: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "generation_failed",
                "message": "فشل توليد التحديات. حاول مرة أخرى.",
                "retryable": True
            }
        )
