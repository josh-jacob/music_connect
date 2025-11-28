from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import RedirectResponse
from typing import Optional
import base64
import urllib.parse
import requests
from fastapi.responses import RedirectResponse
from typing import Optional
import base64
import urllib.parse
import requests

from app.dependencies import get_user_id
from app.services.spotify_service import SpotifyService
from app.storage import token_manager
from app.config import settings

# Spotify endpoints
AUTH_URL = "https://accounts.spotify.com/authorize"
TOKEN_URL = "https://accounts.spotify.com/api/token"
from app.storage import token_manager
from app.config import settings

# Spotify endpoints
AUTH_URL = "https://accounts.spotify.com/authorize"
TOKEN_URL = "https://accounts.spotify.com/api/token"

router = APIRouter(prefix="/auth", tags=["auth"])



@router.get("/login")
async def login(user_id: str = Depends(get_user_id)):
    """
    Step 1: UI calls this → returns Spotify login URL.
    """
    """
    Step 1: UI calls this → returns Spotify login URL.
    """
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

    # ⭐ Get user_id linked to this state
    user_id = token_manager.pop_state(state)
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid state — no matching user.")

    # Build Basic Auth header
    client_creds = f"{settings.SPOTIFY_CLIENT_ID}:{settings.SPOTIFY_CLIENT_SECRET}"
    b64_client_creds = base64.b64encode(client_creds.encode()).decode()

    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
    }

    headers = {
        "Authorization": f"Basic {b64_client_creds}",
        "Content-Type": "application/x-www-form-urlencoded",
    }

    # Exchange authorization code for tokens
    resp = requests.post(TOKEN_URL, data=data, headers=headers, timeout=20)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="Failed to exchange code for token.")

    token_payload = resp.json()

    # ⭐ Store tokens correctly: key = user_id
    token_manager.store_tokens(user_id, token_payload)

    # Redirect back to UI
    return RedirectResponse("http://localhost:3000/spotify")
