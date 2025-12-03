from fastapi import APIRouter, Query, Header
from app.services.spotify_client import SpotifyClient
from app.services.youtube_client import YouTubeClient

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/")
def unified_search(
    q: str = Query(...),
    x_user_id: str = Header(None, alias="X-User-Id")
):
    if not x_user_id:
        return {"error": "Missing X-User-Id header"}

    spotify_results = SpotifyClient.search(q, x_user_id)
    youtube_results = YouTubeClient.search(q)

    return {
        "spotify": spotify_results,
        "youtube": youtube_results,
        "count": len(spotify_results) + len(youtube_results)
    }
