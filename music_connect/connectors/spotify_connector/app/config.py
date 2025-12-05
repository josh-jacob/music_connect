from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # --- Spotify Credentials ---
    SPOTIFY_CLIENT_ID: str
    SPOTIFY_CLIENT_SECRET: str
    SPOTIFY_REDIRECT_URI: str
    UI_BASE_URL: str = "http://localhost:3000"

    # --- OAuth Scopes ---
    SPOTIFY_SCOPES: str = (
        "user-read-email "
        "playlist-read-private "
        "playlist-modify-private "
        "playlist-modify-public "
        "user-library-read "
        "user-library-modify"
    )

    # --- Storage Backend ---
    STORAGE_BACKEND: str = "memory"

    # --- Postgres Settings ---
    MC_PG_HOST: Optional[str] = None
    MC_PG_PORT: Optional[int] = None
    MC_PG_DB: Optional[str] = None
    MC_PG_USER: Optional[str] = None
    MC_PG_PASSWORD: Optional[str] = None
    MC_PG_SSLMODE: Optional[str] = None

    # --- CORS Settings (FIX) ---
    CORS_ALLOWED_ORIGINS: List[str] = ["*"]
    CORS_ALLOWED_METHODS: List[str] = ["*"]
    CORS_ALLOWED_HEADERS: List[str] = ["*"]

    class Config:
        env_file = ".env"


settings = Settings()
