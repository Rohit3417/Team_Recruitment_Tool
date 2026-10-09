"""Application settings and environment configuration."""

import os
from typing import List


class Settings:
    PROJECT_NAME: str = "Team Recruitment Automation Tool"
    VERSION: str = "0.1.0"
    API_PREFIX: str = ""
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # PostgreSQL Environment Configuration
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "recruitment_user")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "recruitment_pass")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "recruitment_db")

    # PostgreSQL Connection URLs
    @property
    def DATABASE_URL(self) -> str:
        if "DATABASE_URL" in os.environ and os.environ["DATABASE_URL"]:
            return os.environ["DATABASE_URL"]
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def TEST_DATABASE_URL(self) -> str:
        if "TEST_DATABASE_URL" in os.environ and os.environ["TEST_DATABASE_URL"]:
            return os.environ["TEST_DATABASE_URL"]
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
            f"{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/recruitment_test_db"
        )

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173"
        ).split(",")
        if origin.strip()
    ]

    # External Integration Tokens
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")


settings = Settings()
