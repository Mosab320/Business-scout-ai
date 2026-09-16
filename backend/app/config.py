"""
Application configuration.

All configuration is read from environment variables (see .env.example).
Nothing in this file should ever contain a real secret.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- Core ---
    APP_NAME: str = "Business Scout AI"
    ENV: str = "development"
    DEMO_MODE: bool = True  # When true, no external API keys are required.

    # --- Auth ---
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # --- Database ---
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "business_scout_ai"

    # --- AI ---
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"

    # --- Optional third-party services (mocked when absent) ---
    SEARCH_API_KEY: str = ""
    EMAIL_API_KEY: str = ""
    PAYMENT_API_KEY: str = ""

    # --- CORS ---
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # --- Pricing (config, never hard-coded payment credentials) ---
    PRO_PLAN_PRICE_PKR: int = 999
    ONE_TIME_PLAN_PRICE_PKR: int = 1499
    FREE_PLAN_MONTHLY_SESSIONS: int = 2
    PRO_PLAN_MONTHLY_SESSIONS: int = 30

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def ai_enabled(self) -> bool:
        """Real OpenAI calls only happen when not in demo mode and a key is present."""
        return not self.DEMO_MODE and bool(self.OPENAI_API_KEY)


@lru_cache
def get_settings() -> Settings:
    return Settings()
