from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import RedirectResponse
from typing import Optional
import base64
import requests
import time

from app.dependencies import get_user_id
from app.services.spotify_service import SpotifyService
from app.storage import token_manager
from app.config import settings

AUTH_URL = "https://accounts.spotify.com/authorize"
TOKEN_URL = "https://accounts.spotify.com/api/token"

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/login")
async def login(user_id: str = Depends(get_user_id)):
    """Step 1: UI calls this → returns Spotify login URL."""
    return SpotifyService.build_auth_url(user_id)


@router.get("/callback")
def callback(
    code: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    error: Optional[str] = Query(default=None),
):

    if error:
        raise HTTPException(status_code=400, detail=f"OAuth error: {error}")

    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing 'code' or 'state'.")

    # Resolve the user from the stored state
    user_id = token_manager.pop_state(state)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid state — no matching user.")

    # Build basic auth for Spotify token exchange
    client_creds = f"{settings.SPOTIFY_CLIENT_ID}:{settings.SPOTIFY_CLIENT_SECRET}"
    b64_creds = base64.b64encode(client_creds.encode()).decode()

    headers = {
        "Authorization": f"Basic {b64_creds}",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
    }

    # Request tokens
    resp = requests.post(TOKEN_URL, data=data, headers=headers)
    if resp.status_code != 200:
        raise HTTPException(resp.status_code, "Failed to exchange code for token.")

    token_payload = resp.json()


    expires_at = int(time.time()) + token_payload["expires_in"]

    # Store properly
    token_manager.store_tokens(user_id, {
        "access_token": token_payload["access_token"],
        "refresh_token": token_payload.get("refresh_token"),
        "expires_at": expires_at,
    })

    # Redirect to UI
    return RedirectResponse("http://localhost:3000/spotify")
