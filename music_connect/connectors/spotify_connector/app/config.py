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

    # --- Storage Backend ---
    STORAGE_BACKEND: str = "memory"  # memory | postgres

    # --- Postgres ---
    MC_PG_HOST: Optional[str] = None
    MC_PG_PORT: Optional[int] = None
    MC_PG_DB: Optional[str] = None
    MC_PG_USER: Optional[str] = None
    MC_PG_PASSWORD: Optional[str] = None
    MC_PG_SSLMODE: Optional[str] = None

    class Config:
        env_file = ".env"


settings = Settings()
