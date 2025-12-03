from fastapi import APIRouter, Depends, Query, HTTPException

from app.dependencies import get_user_id
from app.services.spotify_service import SpotifyService
import requests
from app.models.music_models import (
    AddTracksRequest,
    RemoveTracksRequest,
    ReorderTracksRequest,
    CreatePlaylistRequest,
)

router = APIRouter(prefix="/music", tags=["music"])

@router.get("/me")
def me(user_id: str = Depends(get_user_id)):
    return SpotifyService(user_id).get_user_profile()

@router.get("/playlists")
def playlists(user_id: str = Depends(get_user_id)):
    return SpotifyService(user_id).get_playlists()

@router.get("/tracks")
def tracks(user_id: str = Depends(get_user_id)):
    return SpotifyService(user_id).get_saved_tracks()

@router.post("/playlists")
def create_playlist(data: CreatePlaylistRequest, user_id: str = Depends(get_user_id)):
    return SpotifyService(user_id).create_playlist(data.name, data.description, data.public)

@router.post("/playlist/{id}/add")
def add(id: str, data: AddTracksRequest, user_id: str = Depends(get_user_id)):
    return SpotifyService(user_id).add_tracks_to_playlist(id, data.uris)

@router.post("/playlist/{id}/remove")
def remove(id: str, data: RemoveTracksRequest, user_id: str = Depends(get_user_id)):
    return SpotifyService(user_id).remove_tracks_from_playlist(id, data.uris)

@router.get("/search")
def search(q: str = Query(...), user_id: str = Depends(get_user_id)):
    service = SpotifyService(user_id=user_id)

    url = "https://api.spotify.com/v1/search"
    params = {"q": q, "type": "track", "limit": 10}

    r = requests.get(url, headers=service._headers(), params=params)

    if r.status_code != 200:
        raise HTTPException(r.status_code, r.text)

    data = r.json()
    return data.get("tracks", {}).get("items", [])

@router.get("/search")
def search(q: str = Query(...), user_id: str = Depends(get_user_id)):
    service = SpotifyService(user_id=user_id)

    url = "https://api.spotify.com/v1/search"
    params = {"q": q, "type": "track", "limit": 10}

    r = requests.get(url, headers=service._headers(), params=params)

    if r.status_code != 200:
        raise HTTPException(r.status_code, r.text)

    data = r.json()
    return data.get("tracks", {}).get("items", [])

@router.get("/playlist/{playlist_id}/tracks")
def get_playlist_tracks(
    playlist_id: str,
    user_id: str = Depends(get_user_id)
):
    """
    Returns all tracks for a given Spotify playlist.
    """
    service = SpotifyService(user_id)
    return service.get_playlist_tracks(playlist_id)

@router.put("/playlist/{playlist_id}/follow")
def follow_playlist(playlist_id: str, user_id: str = Depends(get_user_id)):
    return SpotifyService(user_id).follow_playlist(playlist_id)


@router.get("/email")
def get_email(user_id: str = Depends(get_user_id)):
    """
    Returns the authenticated user's Spotify email address.
    """
    svc = SpotifyService(user_id)
    profile = svc.get_user_profile()

    email = profile.get("email")
    if not email:
        raise HTTPException(404, "Email not available. Make sure scope includes user-read-email.")
    
    return {"email": email}