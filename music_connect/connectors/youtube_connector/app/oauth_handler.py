import os
from dotenv import load_dotenv
load_dotenv()
print("DEBUG - YOUTUBE_CLIENT_SECRET_FILE =", os.getenv("YOUTUBE_CLIENT_SECRET_FILE"))

from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build



CLIENT_SECRET_FILE = os.getenv("YOUTUBE_CLIENT_SECRET_FILE")
SCOPES = ["https://www.googleapis.com/auth/youtube",
          "https://www.googleapis.com/auth/youtube.force-ssl",
          "https://www.googleapis.com/auth/youtube.readonly"]

def get_flow():
    return Flow.from_client_secrets_file(
        CLIENT_SECRET_FILE,
        scopes=SCOPES,
        redirect_uri="http://localhost:8000/auth/youtube/callback"
    )

def get_authenticated_service(credentials):
    return build("youtube", "v3", credentials=credentials)
