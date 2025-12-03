from pydantic_settings import BaseSettings
from typing import List, Optional

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
    UI_BASE_URL: str = "http://localhost:3000"

    # --- Storage Backend ---
    STORAGE_BACKEND: str = "memory"
    PROVIDER_NAME: str = "spotify" 

    # --- Postgres Settings ---
    MC_PG_HOST: Optional[str] = "host.docker.internal"
    MC_PG_PORT: Optional[int] = 5432
    MC_PG_DB: Optional[str] = "musicconnect"
    MC_PG_USER: Optional[str] = "musiconnect_app"
    MC_PG_PASSWORD: Optional[str] = "mc_password"
    MC_PG_SSLMODE: Optional[str] = "disable"

    # --- CORS Settings (FIX) ---
    CORS_ALLOWED_ORIGINS: List[str] = ["*"]
    CORS_ALLOWED_METHODS: List[str] = ["*"]
    CORS_ALLOWED_HEADERS: List[str] = ["*"]

    class Config:
        env_file = ".env"


settings = Settings()
