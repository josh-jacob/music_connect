from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SPOTIFY_CONNECTOR_URL: str
    YOUTUBE_CONNECTOR_URL: str
    CORS_ALLOWED_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"

settings = Settings()
