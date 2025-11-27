"""Application configuration from environment variables."""
from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""
    
    # Gemini API
    google_api_key: str
    gemini_model: str = "gemini-2.5-flash"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    environment: Literal["development", "production"] = "development"
    
    # CORS
    frontend_url: str = "http://localhost:5173"
    
    # API Configuration
    max_retries: int = 3
    request_timeout: int = 30
    rate_limit_per_minute: int = 15
    
    # Limits
    max_chat_history: int = 10
    max_code_length: int = 10000
    max_tokens_estimate: int = 30000
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def is_production(self) -> bool:
        return self.environment == "production"


settings = Settings()
