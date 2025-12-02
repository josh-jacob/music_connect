from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # These read from .env automatically (SPOTIFY_CONNECTOR_URL=...)
    spotify_base_url: str = Field("http://localhost:8081", alias="SPOTIFY_CONNECTOR_URL")
    youtube_base_url: str = Field("http://localhost:8082", alias="YOUTUBE_CONNECTOR_URL")
    
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"


settings = Settings()
