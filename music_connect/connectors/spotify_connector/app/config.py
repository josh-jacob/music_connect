from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # --- Spotify Credentials ---
    SPOTIFY_CLIENT_ID: str
    SPOTIFY_CLIENT_SECRET: str
    SPOTIFY_REDIRECT_URI: str

    # --- OAuth Scopes ---
    SPOTIFY_SCOPES: str = (
        "user-read-email "
        "playlist-read-private "
        "playlist-modify-private "
        "playlist-modify-public "
        "user-library-read "
        "user-library-modify"
    )

    # --- Service Basics ---
    BASE_URL: str = "http://localhost:8081"

    # --- Storage Backend ---
    STORAGE_BACKEND: str = "memory"   # memory or database

    # --- Postgres Settings ---
    MC_PG_HOST: str | None = None
    MC_PG_PORT: int | None = None
    MC_PG_DB: str | None = None
    MC_PG_USER: str | None = None
    MC_PG_PASSWORD: str | None = None
    MC_PG_SSLMODE: str | None = None

    # --- ⭐ REQUIRED BY main.py ---
    CORS_ALLOWED_ORIGINS: List[str] = ["*"]
    CORS_ALLOWED_METHODS: List[str] = ["*"]
    CORS_ALLOWED_HEADERS: List[str] = ["*"]

    class Config:
        env_file = ".env"


settings = Settings()
