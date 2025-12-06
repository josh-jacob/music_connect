from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from app.token_storage import load_tokens, save_tokens
import os

def refresh_youtube_token(user_id: str):
    """
    Load this user's stored tokens, refresh if needed, return Credentials.
    """
    stored = load_tokens(user_id)
    if not stored:
        return None

    creds = Credentials(
        token=stored["access_token"],
        refresh_token=stored["refresh_token"],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.getenv("YOUTUBE_CLIENT_ID"),
        client_secret=os.getenv("YOUTUBE_CLIENT_SECRET"),
        scopes=stored["scopes"],
    )

    # If expired and refresh_token is present, refresh and save
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            updated = {
                "access_token": creds.token,
                "refresh_token": stored["refresh_token"],
                "expires_at": creds.expiry.isoformat(),
                "scopes": stored["scopes"],
            }
            save_tokens(user_id, updated)
            return creds
        except Exception as e:
            print("Token refresh failed:", e)
            return None

    return creds