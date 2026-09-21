"""Configuration settings for AI Processing."""
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # OCR / LLM Provider: 'gemini', 'openai', or 'tesseract'
    OCR_PROVIDER: str = os.getenv("OCR_PROVIDER", "gemini")
    
    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Model Names
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    DATA_DIR: str = os.getenv("DATA_DIR", "challenge/data_v2")
    REVIEW_STORE_PATH: str = os.getenv("REVIEW_STORE_PATH", ".data/reviews.json")
settings = Settings()
