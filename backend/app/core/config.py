"""Application settings and environment configuration."""

import os
from typing import List


class Settings:
    PROJECT_NAME: str = "Team Recruitment Automation Tool"
    VERSION: str = "0.1.0"
    API_PREFIX: str = ""
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # PostgreSQL Database URL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://recruitment_user:recruitment_pass@localhost:5432/recruitment_db",
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
