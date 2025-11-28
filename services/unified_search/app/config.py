from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SPOTIFY_CONNECTOR_URL: str = "http://localhost:8081"
    YOUTUBE_CONNECTOR_URL: str = "http://localhost:8082"
    LOG_LEVEL: str = "INFO"

    class Config:
        # Path is relative to where you run `uvicorn` (unified_search/)
        env_file = ".env"


settings = Settings()
