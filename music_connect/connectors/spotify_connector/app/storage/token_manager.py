import time
import requests
from threading import Lock
from dataclasses import dataclass
from typing import Dict, Any, Optional

from app.config import SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_TOKEN_URL


@dataclass
class TokenRecord:
    access_token: str
    refresh_token: str
    expires_at: float   # unix timestamp


_tokens: Dict[str, TokenRecord] = {}
_lock = Lock()


def save_tokens(user_id: str, token_json: Dict[str, Any]):
    expires_in = token_json.get("expires_in", 3600)
    expires_at = time.time() + expires_in - 60  # refresh early

    record = TokenRecord(
        access_token=token_json["access_token"],
        refresh_token=token_json["refresh_token"],
        expires_at=expires_at,
    )

    with _lock:
        _tokens[user_id] = record


def _refresh_token(record: TokenRecord) -> TokenRecord:
    """Refresh access token using Spotify refresh_token."""
    data = {
        "grant_type": "refresh_token",
        "refresh_token": record.refresh_token,
        "client_id": SPOTIFY_CLIENT_ID,
        "client_secret": SPOTIFY_CLIENT_SECRET,
    }

    resp = requests.post(SPOTIFY_TOKEN_URL, data=data)
    resp.raise_for_status()
    payload = resp.json()

    new_access_token = payload["access_token"]
    new_refresh_token = payload.get("refresh_token", record.refresh_token)

    expires_in = payload.get("expires_in", 3600)
    expires_at = time.time() + expires_in - 60

    return TokenRecord(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        expires_at=expires_at,
    )


def get_valid_access_token(user_id: str) -> str:
    """Returns an access token; refreshes automatically if expired."""
    with _lock:
        record = _tokens.get(user_id)

    if not record:
        raise RuntimeError(f"No tokens saved for user_id={user_id}")

    # Refresh if expired
    if time.time() >= record.expires_at:
        updated = _refresh_token(record)
        with _lock:
            _tokens[user_id] = updated
        return updated.access_token

    return record.access_token
