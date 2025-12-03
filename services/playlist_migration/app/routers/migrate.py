from typing import List, Dict, Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.spotify_client import SpotifyClient
from app.services.youtube_client import YouTubeClient
from app.utils.match_scoring import score_match


router = APIRouter(prefix="/migrate", tags=["playlist-migration"])


class SpotifyToYouTubeRequest(BaseModel):
    user_id: str
    source_playlist_id: str      # Spotify playlist ID
    target_youtube_playlist_id: str | None = None  # Optional - will create if not provided
    min_score: float = 70.0      # threshold for match acceptance


class TrackMatchResult(BaseModel):
    source_title: str
    source_artist: str
    matched_video_id: str | None
    matched_title: str | None
    matched_channel: str | None
    score: float
    added: bool


@router.post("/spotify-to-youtube")
def migrate_spotify_to_youtube(body: SpotifyToYouTubeRequest) -> Dict[str, Any]:
    """
    Migration flow:
    1. Fetch tracks from Spotify playlist.
    2. If no target playlist provided, create one on YouTube.
    3. For each track, search YouTube.
    4. Score candidates using fuzzy title/artist match.
    5. If best match >= min_score, add video to target YouTube playlist.
    6. Return summary of what was migrated and what failed.
    """

    # 1. Get Spotify playlist tracks and info
    try:
        # Get playlist info
        playlist_info = SpotifyClient.get_playlist_info(
            user_id=body.user_id,
            playlist_id=body.source_playlist_id
        )
        
        tracks = SpotifyClient.get_playlist_tracks(
            user_id=body.user_id,
            playlist_id=body.source_playlist_id,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error fetching Spotify playlist: {e}")

    if not tracks:
        return {
            "status": "no_tracks",
            "message": "Spotify playlist has no tracks or could not be read.",
            "matches": [],
        }

    # 2. Create YouTube playlist if not provided
    target_playlist_id = body.target_youtube_playlist_id
    created_playlist = False
    
    if not target_playlist_id:
        try:
            playlist_name = playlist_info.get("name", "Migrated Playlist")
            playlist_description = f"Migrated from Spotify playlist: {playlist_name}"
            
            youtube_playlist = YouTubeClient.create_playlist(
                title=playlist_name,
                description=playlist_description,
                privacy="private"
            )
            
            target_playlist_id = youtube_playlist["playlistId"]
            created_playlist = True
            
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Error creating YouTube playlist: {e}")

    results: List[TrackMatchResult] = []

    # 3. For each Spotify track, search & match on YouTube
    for t in tracks:
        source_title = t.get("title") or ""
        source_artist = t.get("artist") or ""

        if not source_title:
            results.append(
                TrackMatchResult(
                    source_title=source_title,
                    source_artist=source_artist,
                    matched_video_id=None,
                    matched_title=None,
                    matched_channel=None,
                    score=0.0,
                    added=False,
                )
            )
            continue

        query = f"{source_title} {source_artist}".strip()

        try:
            candidates = YouTubeClient.search_videos(query)
        except Exception as e:
            # If YouTube search fails for a track, skip it but keep record
            results.append(
                TrackMatchResult(
                    source_title=source_title,
                    source_artist=source_artist,
                    matched_video_id=None,
                    matched_title=None,
                    matched_channel=None,
                    score=0.0,
                    added=False,
                )
            )
            continue

        best_candidate = None
        best_score = -1.0

        for c in candidates:
            cand_title = c.get("title") or ""
            cand_channel = c.get("channel") or ""
            s = score_match(
                source_title=source_title,
                source_artist=source_artist,
                candidate_title=cand_title,
                candidate_channel=cand_channel,
            )
            if s > best_score:
                best_score = s
                best_candidate = c

        if not best_candidate or best_score < body.min_score:
            # No acceptable match
            results.append(
                TrackMatchResult(
                    source_title=source_title,
                    source_artist=source_artist,
                    matched_video_id=None,
                    matched_title=None,
                    matched_channel=None,
                    score=best_score if best_score >= 0 else 0.0,
                    added=False,
                )
            )
            continue

        # 4. Add best candidate to YouTube playlist
        added_ok = False
        video_id = best_candidate.get("videoId")

        if video_id:
            try:
                YouTubeClient.add_to_playlist(
                    playlist_id=target_playlist_id,
                    video_id=video_id,
                )
                added_ok = True
            except Exception:
                added_ok = False

        results.append(
            TrackMatchResult(
                source_title=source_title,
                source_artist=source_artist,
                matched_video_id=video_id,
                matched_title=best_candidate.get("title"),
                matched_channel=best_candidate.get("channel"),
                score=best_score,
                added=added_ok,
            )
        )

    # 5. Summary
    total = len(results)
    added = sum(1 for r in results if r.added)
    failed = total - added

    return {
        "status": "ok",
        "created_new_playlist": created_playlist,
        "target_playlist_id": target_playlist_id,
        "source_playlist_name": playlist_info.get("name"),
        "summary": {
            "total_tracks": total,
            "added": added,
            "failed": failed,
            "min_score": body.min_score,
        },
        "matches": [r.dict() for r in results],
    }