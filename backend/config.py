"""
Global configurations (confidence threshold, paths)
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_TITLE: str = "Collegewala Chatbot API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "AI-powered chatbot for Collegewala college information"

    CONFIDENCE_THRESHOLD: float = 0.5
    MIN_CONFIDENCE: float = 0.3
    MAX_CONFIDENCE: float = 1.0

    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    MODELS_DIR: Path = BASE_DIR / "backend" / "models"
    LOGS_DIR: Path = BASE_DIR / "backend" / "logs"
    KNOWLEDGE_BASE_DIR: Path = BASE_DIR / "backend" / "knowledge_base"

    INTENTS_FILE: Path = DATA_DIR / "processed" / "collegewala_intents.json"
    FALLBACK_FILE: Path = KNOWLEDGE_BASE_DIR / "fallback.json"
    INTENT_MODEL_FILE: Path = MODELS_DIR / "intent_model.pkl"
    VECTORIZER_FILE: Path = MODELS_DIR / "vectorizer.pkl"
    LABEL_ENCODER_FILE: Path = MODELS_DIR / "label_encoder.pkl"

    LOG_FILE: Path = LOGS_DIR / "chat_logs.txt"
    LOW_CONFIDENCE_FILE: Path = LOGS_DIR / "low_confidence_queries.json"

    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/backend/college_chatbot.db"

    LOG_LEVEL: str = "INFO"
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True

    def __init__(self, **data):
        super().__init__(**data)
        self._ensure_directories()

    def _ensure_directories(self):
        """Create necessary directories if they don't exist"""
        for dir_path in [self.MODELS_DIR, self.LOGS_DIR, self.DATA_DIR]:
            dir_path.mkdir(parents=True, exist_ok=True)


settings = Settings()
