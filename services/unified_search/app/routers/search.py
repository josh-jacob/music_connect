from fastapi import APIRouter, Query, Depends

from app.services.spotify_client import SpotifyClient
from app.services.youtube_client import YouTubeClient
from app.dependencies import get_user_id

router = APIRouter(prefix="/search", tags=["Unified Search"])

@router.get("/")
def unified_search(
    q: str = Query(..., description="Search query"),
    user_id: str = Depends(get_user_id)
):
    spotify_results = SpotifyClient.search(q, user_id)
    # youtube_results = YouTubeClient.search(q, user_id)

    return {
        "query": q,
        "spotify_count": len(spotify_results),
        # "youtube_count": len(youtube_results),
        # "total": len(spotify_results) + len(youtube_results),
        "spotify": spotify_results,
        # "youtube": youtube_results
    }
