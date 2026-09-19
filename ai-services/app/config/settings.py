from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Retainly AI Services"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # API
    API_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: List[str] = ["*"]
    REQUIRE_API_KEY: bool = False
    API_KEY: str = ""

    # ML Model paths
    CHURN_MODEL_PATH: str = "trained_models/churn_model.pkl"
    MODEL_THRESHOLD: float = 0.5

    # Database
    DATABASE_URL: str = "sqlite:///./retainly.db"

    # External services
    OPENAI_API_KEY: str = ""
    SENDGRID_API_KEY: str = ""
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # Feature flags
    ENABLE_EXPLANATIONS: bool = True
    ENABLE_RECOMMENDATIONS: bool = True

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
