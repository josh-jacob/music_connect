from fastapi import APIRouter, Query, Depends
from app.services.spotify_client import SpotifyClient
from app.services.youtube_client import YouTubeClient
from app.dependencies import get_user_id

router = APIRouter(prefix="/search", tags=["Unified Search"])

@router.get("/")
def unified_search(
    q: str = Query(...),
    user_id: str = Depends(get_user_id)
):
    spotify = SpotifyClient.search(q, user_id)
    youtube = YouTubeClient.search(q)

    total = len(spotify) + len(youtube)

    return {
        "query": q,
        "total_results": total,
        "spotify_count": len(spotify),
        "youtube_count": len(youtube),
        "results": spotify + youtube  # MERGED LIST
    }
