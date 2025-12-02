from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from token_storage import load_tokens, save_tokens
import os

def refresh_youtube_token():

    stored = load_tokens()
    if not stored:
        return None

    creds = Credentials(
        token=stored["access_token"],
        refresh_token=stored["refresh_token"],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.getenv("YOUTUBE_CLIENT_ID"),
        client_secret=os.getenv("YOUTUBE_CLIENT_SECRET"),
        scopes=stored["scopes"]
    )

    # If token expired
    if not creds.valid:
        try:
            creds.refresh(Request())

            # Save new tokens
            updated = {
                "access_token": creds.token,
                "refresh_token": stored["refresh_token"],  # refresh_token stays same
                "expires_at": creds.expiry.isoformat(),
                "scopes": stored["scopes"]
            }
            save_tokens(updated)

            return creds
        except Exception as e:
            print("Token refresh failed:", e)
            return None

    return creds
