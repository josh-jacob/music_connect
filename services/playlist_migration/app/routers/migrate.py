from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.spotify_client import SpotifyClient
from app.services.youtube_client import YouTubeClient
from app.utils.match_scoring import score_match

router = APIRouter(prefix="/migrate", tags=["playlist-migration"])

# ============================================
# REQUEST MODELS
# ============================================

class YouTubeToSpotifyRequest(BaseModel):
    user_id: str
    source_youtube_playlist_id: str
    target_spotify_playlist_id: str | None = None
    min_score: float = 70.0

class SpotifyToYouTubeRequest(BaseModel):
    user_id: str
    source_playlist_id: str
    target_youtube_playlist_id: str | None = None
    min_score: float = 70.0

class TrackMatchResult(BaseModel):
    source_title: str
    source_channel: str
    matched_track_id: str | None
    matched_title: str | None
    matched_artist: str | None
    score: float
    added: bool

# ============================================
# YOUTUBE → SPOTIFY
# ============================================

@router.post("/youtube-to-spotify")
def migrate_youtube_to_spotify(body: YouTubeToSpotifyRequest) -> Dict[str, Any]:
    """
    Migrate YouTube playlist to Spotify
    """
    
    # 1. Get YouTube playlist videos
    try:
        videos = YouTubeClient.get_playlist_videos(body.source_youtube_playlist_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error fetching YouTube playlist: {e}")
    
    if not videos:
        return {
            "status": "no_videos",
            "message": "YouTube playlist has no videos",
            "matches": []
        }
    
    # 2. Create Spotify playlist if not provided
    target_playlist_id = body.target_spotify_playlist_id
    created_playlist = False
    
    if not target_playlist_id:
        try:
            spotify_playlist = SpotifyClient.create_playlist(
                user_id=body.user_id,
                name="Migrated from YouTube",
                description="Migrated from YouTube playlist",
                public=False
            )
            target_playlist_id = spotify_playlist["id"]
            created_playlist = True
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Error creating Spotify playlist: {e}")
    
    results: List[TrackMatchResult] = []
    
    # 3. For each YouTube video, search and match on Spotify
    for video in videos:
        source_title = video.get("title") or ""
        source_channel = video.get("channel") or ""
        
        if not source_title:
            results.append(TrackMatchResult(
                source_title=source_title,
                source_channel=source_channel,
                matched_track_id=None,
                matched_title=None,
                matched_artist=None,
                score=0.0,
                added=False
            ))
            continue
        
        query = f"{source_title} {source_channel}".strip()
        
        try:
            candidates = SpotifyClient.search_tracks(body.user_id, query)
        except Exception:
            results.append(TrackMatchResult(
                source_title=source_title,
                source_channel=source_channel,
                matched_track_id=None,
                matched_title=None,
                matched_artist=None,
                score=0.0,
                added=False
            ))
            continue
        
        best_candidate = None
        best_score = -1.0
        
        for c in candidates:
            cand_title = c.get("title") or ""
            cand_artist = c.get("artist") or ""
            s = score_match(
                source_title=source_title,
                source_artist=source_channel,
                candidate_title=cand_title,
                candidate_channel=cand_artist
            )
            if s > best_score:
                best_score = s
                best_candidate = c
        
        if not best_candidate or best_score < body.min_score:
            results.append(TrackMatchResult(
                source_title=source_title,
                source_channel=source_channel,
                matched_track_id=None,
                matched_title=None,
                matched_artist=None,
                score=best_score if best_score >= 0 else 0.0,
                added=False
            ))
            continue
        
        # 4. Add to Spotify playlist
        added_ok = False
        track_uri = best_candidate.get("uri")
        
        if track_uri:
            try:
                SpotifyClient.add_tracks_to_playlist(
                    user_id=body.user_id,
                    playlist_id=target_playlist_id,
                    uris=[track_uri]
                )
                added_ok = True
            except Exception:
                added_ok = False
        
        results.append(TrackMatchResult(
            source_title=source_title,
            source_channel=source_channel,
            matched_track_id=best_candidate.get("id"),
            matched_title=best_candidate.get("title"),
            matched_artist=best_candidate.get("artist"),
            score=best_score,
            added=added_ok
        ))
    
    # 5. Summary
    total = len(results)
    added = sum(1 for r in results if r.added)
    failed = total - added
    
    return {
        "status": "ok",
        "created_new_playlist": created_playlist,
        "target_playlist_id": target_playlist_id,
        "summary": {
            "total_tracks": total,
            "added": added,
            "failed": failed,
            "min_score": body.min_score
        },
        "matches": [r.dict() for r in results]
    }

# ============================================
# SPOTIFY → YOUTUBE
# ============================================

@router.post("/spotify-to-youtube")
def migrate_spotify_to_youtube(body: SpotifyToYouTubeRequest) -> Dict[str, Any]:
    """
    Migrate Spotify playlist to YouTube
    """
    
    # 1. Get Spotify tracks
    try:
        playlist_info = SpotifyClient.get_playlist_info(body.user_id, body.source_playlist_id)
        tracks = SpotifyClient.get_playlist_tracks(body.user_id, body.source_playlist_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error fetching Spotify playlist: {e}")
    
    if not tracks:
        return {
            "status": "no_tracks",
            "message": "Spotify playlist has no tracks",
            "matches": []
        }
    
    # 2. Create YouTube playlist if not provided
    target_playlist_id = body.target_youtube_playlist_id
    created_playlist = False
    
    if not target_playlist_id:
        try:
            youtube_playlist = YouTubeClient.create_playlist(
                title=playlist_info.get("name", "Migrated Playlist"),
                description=f"Migrated from Spotify",
                privacy="private"
            )
            target_playlist_id = youtube_playlist["playlistId"]
            created_playlist = True
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Error creating YouTube playlist: {e}")
    
    results: List[TrackMatchResult] = []
    
    # 3. For each Spotify track, search and match on YouTube
    for t in tracks:
        source_title = t.get("title") or ""
        source_artist = t.get("artist") or ""
        
        if not source_title:
            results.append(TrackMatchResult(
                source_title=source_title,
                source_channel=source_artist,
                matched_track_id=None,
                matched_title=None,
                matched_artist=None,
                score=0.0,
                added=False
            ))
            continue
        
        query = f"{source_title} {source_artist}".strip()
        
        try:
            candidates = YouTubeClient.search_videos(query)
        except Exception:
            results.append(TrackMatchResult(
                source_title=source_title,
                source_channel=source_artist,
                matched_track_id=None,
                matched_title=None,
                matched_artist=None,
                score=0.0,
                added=False
            ))
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
                candidate_channel=cand_channel
            )
            if s > best_score:
                best_score = s
                best_candidate = c
        
        if not best_candidate or best_score < body.min_score:
            results.append(TrackMatchResult(
                source_title=source_title,
                source_channel=source_artist,
                matched_track_id=None,
                matched_title=None,
                matched_artist=None,
                score=best_score if best_score >= 0 else 0.0,
                added=False
            ))
            continue
        
        # 4. Add to YouTube playlist
        added_ok = False
        video_id = best_candidate.get("videoId")
        
        if video_id:
            try:
                YouTubeClient.add_to_playlist(target_playlist_id, video_id)
                added_ok = True
            except Exception:
                added_ok = False
        
        results.append(TrackMatchResult(
            source_title=source_title,
            source_channel=source_artist,
            matched_track_id=video_id,
            matched_title=best_candidate.get("title"),
            matched_artist=best_candidate.get("channel"),
            score=best_score,
            added=added_ok
        ))
    
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
            "min_score": body.min_score
        },
        "matches": [r.dict() for r in results]
    }
