"""Gemini API wrapper service with error handling and rate limiting."""
import asyncio
import logging
import json
from typing import Dict, Any, Optional, Union, List
from google import genai
from app.config import settings

logger = logging.getLogger(__name__)


class GeminiServiceError(Exception):
    """Custom exception for Gemini service errors."""
    def __init__(self, message: str, retryable: bool = False, original_error: Optional[Exception] = None):
        self.message = message
        self.retryable = retryable
        self.original_error = original_error
        super().__init__(self.message)


class GeminiService:
    """Wrapper for Google Gemini API with error handling and rate limiting."""
    
    def __init__(self):
        """Initialize Gemini client with API key from environment."""
        try:
            self.client = genai.Client(api_key=settings.google_api_key)
            self.model = settings.gemini_model
            logger.info(f"✅ Gemini client initialized: {self.model}")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Gemini: {e}")
            raise GeminiServiceError(
                "Failed to initialize AI service",
                retryable=False,
                original_error=e
            )
    
    async def health_check(self) -> bool:
        """Verify API connectivity."""
        try:
            # Run synchronous call in thread pool to avoid blocking event loop
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model=self.model,
                contents="Say OK",
                config={'max_output_tokens': 10}
            )
            return bool(response.text)
        except Exception as e:
            raise GeminiServiceError("Health check failed", retryable=True, original_error=e)
    
    async def generate_json(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_output_tokens: int = 4096,
        retry_count: int = 0
    ) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Generate JSON response with retry logic.
        
        Args:
            prompt: Complete prompt text
            temperature: Randomness (0.0-1.0)
            max_output_tokens: Max response tokens
            retry_count: Internal retry counter
        
        Returns:
            Parsed JSON dictionary
        """
        try:
            logger.debug(f"Calling Gemini: temp={temperature}, max_tokens={max_output_tokens}")
            logger.debug(f"Prompt preview: {prompt[:100]}...")
            
            # Run synchronous call in thread pool to avoid blocking event loop
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model=self.model,
                contents=prompt,
                config={
                    'temperature': temperature,
                    'max_output_tokens': max_output_tokens,
                    'response_mime_type': 'application/json'
                }
            )
            
            # Validate response exists
            if not response or not hasattr(response, 'text'):
                logger.error("❌ Gemini returned invalid response object")
                raise GeminiServiceError(
                    "AI service returned invalid response",
                    retryable=True,
                    original_error=None
                )
            
            # Check for safety blocks or finish reasons
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                
                # Check finish reason
                if hasattr(candidate, 'finish_reason'):
                    finish_reason = str(candidate.finish_reason)
                    logger.debug(f"Finish reason: {finish_reason}")
                    
                    if 'SAFETY' in finish_reason.upper():
                        logger.error(f"❌ Content blocked by safety filters: {finish_reason}")
                        raise GeminiServiceError(
                            "المحتوى لا يتوافق مع سياسة الاستخدام.",
                            retryable=False,
                            original_error=None
                        )
                    elif 'MAX_TOKENS' in finish_reason.upper() or 'LENGTH' in finish_reason.upper():
                        logger.warning(f"⚠️ Response truncated: {finish_reason}")
                        # Try to extract partial content
                        try:
                            if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                                if candidate.content.parts and hasattr(candidate.content.parts[0], 'text'):
                                    partial_text = candidate.content.parts[0].text
                                    if partial_text and partial_text.strip():
                                        logger.warning(f"⚠️ Extracted {len(partial_text)} chars from truncated response")
                                        # If we already have a high token limit (>= 30000), don't retry
                                        if max_output_tokens >= 30000:
                                            logger.warning("⚠️ Already at max token limit (30000), attempting to parse partial JSON")
                                            # Try to parse what we have
                                            try:
                                                result = json.loads(partial_text)
                                                logger.warning("✅ Successfully parsed truncated JSON")
                                                return result
                                            except json.JSONDecodeError:
                                                logger.error("❌ Truncated JSON is invalid, cannot recover")
                                                raise GeminiServiceError(
                                                    "الاستجابة طويلة جداً. حاول تبسيط فكرة المشروع.",
                                                    retryable=False,
                                                    original_error=None
                                                )
                                        # Only retry if we're below 30000
                                        if retry_count < settings.max_retries and max_output_tokens < 30000:
                                            wait_time = (2 ** retry_count) * 1
                                            new_limit = min(30000, max_output_tokens + 5000)  # Increase by 5k, cap at 30k
                                            logger.warning(f"⏳ Retrying with increased token limit ({new_limit}) in {wait_time}s (attempt {retry_count+1}/{settings.max_retries})")
                                            await asyncio.sleep(wait_time)
                                            return await self.generate_json(prompt, temperature, new_limit, retry_count + 1)
                        except Exception as extract_error:
                            logger.error(f"Failed to extract partial content: {extract_error}")
                    elif finish_reason not in ['STOP', 'FINISH_REASON_STOP', '1', 'FinishReason.STOP']:
                        logger.warning(f"⚠️ Unusual finish reason: {finish_reason}")
            
            # Check if response text is None or empty
            if response.text is None or response.text.strip() == "":
                logger.error("❌ Gemini returned empty response")
                logger.error(f"Response object: {response}")
                
                # Check if it was due to MAX_TOKENS
                if hasattr(response, 'candidates') and response.candidates:
                    candidate = response.candidates[0]
                    if hasattr(candidate, 'finish_reason') and 'MAX_TOKENS' in str(candidate.finish_reason).upper():
                        # MAX_TOKENS with empty content - increase token limit and retry
                        if retry_count < settings.max_retries:
                            wait_time = (2 ** retry_count) * 1  # 1s, 2s, 4s
                            new_token_limit = max_output_tokens + 2048
                            logger.warning(f"⏳ Retrying empty MAX_TOKENS response with {new_token_limit} tokens in {wait_time}s (attempt {retry_count+1}/{settings.max_retries})")
                            await asyncio.sleep(wait_time)
                            return await self.generate_json(prompt, temperature, new_token_limit, retry_count + 1)
                
                # Retry if attempts remaining (for other empty response cases)
                if retry_count < settings.max_retries:
                    wait_time = (2 ** retry_count) * 1  # 1s, 2s, 4s
                    logger.warning(f"⏳ Retrying empty response in {wait_time}s (attempt {retry_count+1}/{settings.max_retries})")
                    await asyncio.sleep(wait_time)
                    # Increase token limit for retry
                    return await self.generate_json(prompt, temperature, max_output_tokens + 1024, retry_count + 1)
                else:
                    raise GeminiServiceError(
                        "AI service returned empty response after retries",
                        retryable=False,
                        original_error=None
                    )
            
            # Parse JSON
            try:
                result = json.loads(response.text)
                logger.debug("✅ JSON response parsed successfully")
                return result
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON response: {response.text[:200]}")
                
                # Retry if attempts remaining
                if retry_count < settings.max_retries:
                    wait_time = (2 ** retry_count) * 1  # 1s, 2s, 4s
                    logger.warning(f"⏳ Retrying invalid JSON in {wait_time}s (attempt {retry_count+1}/{settings.max_retries})")
                    await asyncio.sleep(wait_time)
                    return await self.generate_json(prompt, temperature, max_output_tokens, retry_count + 1)
                else:
                    raise GeminiServiceError(
                        "AI returned invalid JSON after retries",
                        retryable=False,
                        original_error=e
                    )
        
        except Exception as e:
            error_msg = str(e).lower()
            
            # Rate limiting (429)
            if '429' in error_msg or 'rate limit' in error_msg or 'quota' in error_msg:
                if retry_count < settings.max_retries:
                    wait_time = (2 ** retry_count) * 2  # 2s, 4s, 8s
                    logger.warning(f"⏳ Rate limited. Retrying in {wait_time}s (attempt {retry_count+1}/{settings.max_retries})")
                    await asyncio.sleep(wait_time)
                    return await self.generate_json(prompt, temperature, max_output_tokens, retry_count + 1)
                else:
                    raise GeminiServiceError(
                        "خدمة الذكاء الاصطناعي مشغولة. انتظر دقيقة وحاول مرة أخرى.",
                        retryable=True,
                        original_error=e
                    )
            
            # Auth errors (401/403)
            elif '401' in error_msg or '403' in error_msg or 'api key' in error_msg:
                raise GeminiServiceError(
                    "مشكلة في التوثيق. اتصل بالمسؤول.",
                    retryable=False,
                    original_error=e
                )
            
            # Network/timeout
            elif 'timeout' in error_msg or 'connection' in error_msg:
                raise GeminiServiceError(
                    "فشل الاتصال. تحقق من الإنترنت.",
                    retryable=True,
                    original_error=e
                )
            
            # Safety blocks
            elif 'safety' in error_msg or 'blocked' in error_msg:
                raise GeminiServiceError(
                    "المحتوى لا يتوافق مع سياسة الاستخدام.",
                    retryable=False,
                    original_error=e
                )
            
            # Generic error
            else:
                logger.error(f"Unexpected error: {e}")
                raise GeminiServiceError(
                    "فشل في توليد الاستجابة. حاول مرة أخرى.",
                    retryable=True,
                    original_error=e
                )
    
    async def generate_text(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_output_tokens: int = 1000,
        retry_count: int = 0
    ) -> str:
        """Generate plain text response."""
        try:
            # Run synchronous call in thread pool to avoid blocking event loop
            response = await asyncio.to_thread(
                self.client.models.generate_content,
                model=self.model,
                contents=prompt,
                config={
                    'temperature': temperature,
                    'max_output_tokens': max_output_tokens
                }
            )
            
            # Check for MAX_TOKENS finish reason
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, 'finish_reason') and 'MAX_TOKENS' in str(candidate.finish_reason).upper():
                    logger.warning(f"⚠️ Text response truncated: MAX_TOKENS")
                    # If we have partial content, return it, otherwise retry with higher limit
                    if response.text and response.text.strip():
                        logger.warning(f"⚠️ Returning partial response ({len(response.text)} chars)")
                        return response.text.strip()
                    elif retry_count < settings.max_retries:
                        wait_time = (2 ** retry_count) * 1
                        new_token_limit = max_output_tokens + 1024
                        logger.warning(f"⏳ Retrying with {new_token_limit} tokens in {wait_time}s (attempt {retry_count+1}/{settings.max_retries})")
                        await asyncio.sleep(wait_time)
                        return await self.generate_text(prompt, temperature, new_token_limit, retry_count + 1)
            
            # Validate response is not None or empty
            if not response or not hasattr(response, 'text') or response.text is None or response.text.strip() == "":
                logger.error("Gemini returned empty/None text response")
                if retry_count < settings.max_retries:
                    wait_time = (2 ** retry_count) * 1
                    logger.warning(f"⏳ Retrying empty text response in {wait_time}s (attempt {retry_count+1}/{settings.max_retries})")
                    await asyncio.sleep(wait_time)
                    return await self.generate_text(prompt, temperature, max_output_tokens + 1024, retry_count + 1)
                else:
                    raise GeminiServiceError(
                        "AI service returned empty response",
                        retryable=True,
                        original_error=None
                    )
            
            return response.text.strip()
        except Exception as e:
            if retry_count < settings.max_retries:
                wait_time = (2 ** retry_count) * 1
                logger.warning(f"⏳ Retrying text generation error in {wait_time}s (attempt {retry_count+1}/{settings.max_retries})")
                await asyncio.sleep(wait_time)
                return await self.generate_text(prompt, temperature, max_output_tokens + 1024, retry_count + 1)
            raise GeminiServiceError(
                "فشل في توليد النص.",
                retryable=True,
                original_error=e
            )
