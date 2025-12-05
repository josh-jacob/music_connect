from fastapi import APIRouter, HTTPException
import httpx
from app.config import settings

router = APIRouter(prefix="/playlist", tags=["playlist"])

@router.post("/add")
async def add_to_playlist(payload: dict):
    source = payload.get("source")

    if source == "spotify":
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{settings.SPOTIFY_CONNECTOR_URL}/music/playlist/add", json=payload)
            return res.json()

    elif source == "youtube":
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{settings.YOUTUBE_CONNECTOR_URL}/youtube/playlist/add", json=payload)
            return res.json()

    raise HTTPException(status_code=400, detail="source must be 'spotify' or 'youtube'")
