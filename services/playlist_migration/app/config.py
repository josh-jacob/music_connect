from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Base URLs for connectors (can be overridden by env vars in Docker/IBM)
    SPOTIFY_CONNECTOR_URL: str = "http://localhost:8081"
    YOUTUBE_CONNECTOR_URL: str = "http://localhost:8082"

    # CORS
    CORS_ALLOWED_ORIGINS: List[str] = ["*"]
    CORS_ALLOWED_METHODS: List[str] = ["*"]
    CORS_ALLOWED_HEADERS: List[str] = ["*"]

    class Config:
        env_file = ".env"


settings = Settings()
