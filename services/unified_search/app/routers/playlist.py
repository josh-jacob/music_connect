from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(prefix="/playlist", tags=["playlist"])

SPOTIFY_BASE = "http://localhost:8081"
YOUTUBE_BASE = "http://localhost:8082"

@router.post("/add")
async def add_to_playlist(payload: dict):
    source = payload.get("source")

    if source == "spotify":
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{SPOTIFY_BASE}/music/playlist/add", json=payload)
            return res.json()

    elif source == "youtube":
        async with httpx.AsyncClient() as client:
            res = await client.post(f"{YOUTUBE_BASE}/youtube/playlist/add", json=payload)
            return res.json()

    raise HTTPException(status_code=400, detail="source must be 'spotify' or 'youtube'")
