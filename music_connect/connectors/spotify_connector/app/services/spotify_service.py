import time
import base64
from typing import Dict, Any, List

import requests
from fastapi import HTTPException

from app.config import settings
from app.storage.token_manager import token_manager
from app.interfaces.music_service_interface import MusicServiceInterface
from app.utils.logger import get_logger

logger = get_logger(__name__)

AUTH_URL = "https://accounts.spotify.com/authorize"
TOKEN_URL = "https://accounts.spotify.com/api/token"
API_BASE = "https://api.spotify.com/v1"


class SpotifyService(MusicServiceInterface):

    # ----------------------------------------------------
    #  BUILD AUTH URL
    # ----------------------------------------------------
    @classmethod
    def build_auth_url(cls, user_id: str) -> Dict[str, str]:
        import uuid
        from urllib.parse import urlencode

        state = uuid.uuid4().hex

        # ⭐ MUST match TokenManager state system
        token_manager.set_state(state, user_id)

        params = {
            "client_id": settings.SPOTIFY_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
            "scope": settings.SPOTIFY_SCOPES,
            "state": state,
        }

        return {
            "auth_url": f"{AUTH_URL}?{urlencode(params)}",
            "state": state
        }

    # ----------------------------------------------------
    #  CALLBACK HANDLER
    # ----------------------------------------------------
    @classmethod
    def handle_auth_callback(cls, code: str, state: str):
        user_id = token_manager.pop_state(state)
        if not user_id:
            raise HTTPException(400, "Invalid or expired state")

        client_creds = f"{settings.SPOTIFY_CLIENT_ID}:{settings.SPOTIFY_CLIENT_SECRET}"
        b64 = base64.b64encode(client_creds.encode()).decode()

        headers = {
            "Authorization": f"Basic {b64}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
        }

        resp = requests.post(TOKEN_URL, headers=headers, data=data)
        if resp.status_code != 200:
            raise HTTPException(resp.status_code, resp.text)

        payload = resp.json()
        expires_at = int(time.time()) + payload["expires_in"]

        token_manager.store_tokens(user_id, {
            "access_token": payload["access_token"],
            "refresh_token": payload.get("refresh_token"),
            "expires_at": expires_at,
        })

        return {"status": "ok", "user_id": user_id}

    # ----------------------------------------------------
    #  INTERNAL HELPERS
    # ----------------------------------------------------

    def _request_with_backoff(self, method, url, headers=None, params=None, json=None, retries=3):
        """
        Internal wrapper for all Spotify API calls.
        Adds exponential backoff and 429 rate-limit handling.
        QR1 compliant.
        """
        for attempt in range(retries):
            r = requests.request(method, url, headers=headers, params=params, json=json)

            # Handle 429 Rate Limit → Retry-After header
            if r.status_code == 429:
                retry_after = int(r.headers.get("Retry-After", "1"))
                time.sleep(retry_after)
                continue

            # Handle transient 5xx errors
            if r.status_code >= 500 and attempt < retries - 1:
                time.sleep(2 ** attempt)
                continue

            return r

        return r

    def _ensure_token(self):
        tokens = token_manager.get_tokens(self.user_id)
        if not tokens:
            raise HTTPException(401, "Authenticate with /auth/login first")

        # Auto-refresh logic (FR1.2)
        if tokens["expires_at"] < time.time():
            return self._refresh()

        return tokens["access_token"]

    def _refresh(self):
        tokens = token_manager.get_tokens(self.user_id)
        refresh_token = tokens.get("refresh_token")

        if not refresh_token:
            raise HTTPException(401, "Refresh token missing — re-authentication required")

        client_creds = f"{settings.SPOTIFY_CLIENT_ID}:{settings.SPOTIFY_CLIENT_SECRET}"
        b64 = base64.b64encode(client_creds.encode()).decode()

        resp = requests.post(
            TOKEN_URL,
            headers={"Authorization": f"Basic {b64}"},
            data={"grant_type": "refresh_token", "refresh_token": refresh_token},
        )

        if resp.status_code != 200:
            raise HTTPException(401, "Session expired — please re-authenticate")

        payload = resp.json()

        tokens["access_token"] = payload["access_token"]
        tokens["expires_at"] = int(time.time()) + payload["expires_in"]

        # Spotify sometimes sends a new refresh token
        if payload.get("refresh_token"):
            tokens["refresh_token"] = payload["refresh_token"]

        token_manager.store_tokens(self.user_id, tokens)

        return tokens["access_token"]

    def _headers(self):
        token = self._ensure_token()
        return {"Authorization": f"Bearer {token}"}

    # ----------------------------------------------------
    #  SPOTIFY API WRAPPERS (BACKWARD COMPATIBLE)
    # ----------------------------------------------------

    def get_user_profile(self):
        r = self._request_with_backoff("GET", f"{API_BASE}/me", headers=self._headers())
        return r.json()

    def get_playlists(self, limit=20, offset=0):
        r = self._request_with_backoff(
            "GET",
            f"{API_BASE}/me/playlists",
            headers=self._headers(),
            params={"limit": limit, "offset": offset},
        )
        return r.json()

    def get_saved_tracks(self, limit=20, offset=0):
        r = self._request_with_backoff(
            "GET",
            f"{API_BASE}/me/tracks",
            headers=self._headers(),
            params={"limit": limit, "offset": offset},
        )
        return r.json()

    def create_playlist(self, name, description, public):
        user = self.get_user_profile()
        r = self._request_with_backoff(
            "POST",
            f"{API_BASE}/users/{user['id']}/playlists",
            headers=self._headers(),
            json={"name": name, "description": description, "public": public},
        )
        return r.json()

    def add_tracks_to_playlist(self, playlist_id, uris: List[str]):
        r = self._request_with_backoff(
            "POST",
            f"{API_BASE}/playlists/{playlist_id}/tracks",
            headers=self._headers(),
            json={"uris": uris},
        )
        return r.json()

    def remove_tracks_from_playlist(self, playlist_id, uris: List[str]):
        r = self._request_with_backoff(
            "DELETE",
            f"{API_BASE}/playlists/{playlist_id}/tracks",
            headers=self._headers(),
            json={"tracks": [{"uri": u} for u in uris]},
        )
        return r.json()

    def reorder_playlist_tracks(self, playlist_id, range_start, insert_before, range_length):
        r = self._request_with_backoff(
            "PUT",
            f"{API_BASE}/playlists/{playlist_id}/tracks",
            headers=self._headers(),
            json={
                "range_start": range_start,
                "insert_before": insert_before,
                "range_length": range_length,
            },
        )
        return r.json()

    def get_playlist_tracks(self, playlist_id: str):
        url = f"{API_BASE}/playlists/{playlist_id}/tracks"
        all_items = []
        params = {"limit": 100, "offset": 0}

        while True:
            r = self._request_with_backoff(
                "GET",
                url,
                headers=self._headers(),
                params=params,
            )

            if r.status_code != 200:
                raise HTTPException(r.status_code, r.text)

            data = r.json()
            all_items.extend(data.get("items", []))

            if data.get("next") is None:
                break

            params["offset"] += 100

        return {"total": len(all_items), "items": all_items}

    def follow_playlist(self, playlist_id: str):
        r = self._request_with_backoff(
            "PUT",
            f"{API_BASE}/playlists/{playlist_id}/followers",
            headers=self._headers()
        )
        return {"status": r.status_code, "detail": r.text}
