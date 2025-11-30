from fastapi import FastAPI, Request
from dotenv import load_dotenv
load_dotenv()
from fastapi.responses import RedirectResponse
from oauth_handler import get_flow, get_authenticated_service


import os

app = FastAPI()

@app.get("/auth/youtube/login")
def youtube_login():
    flow = get_flow()
    auth_url, _ = flow.authorization_url(
    prompt="consent",
    access_type="offline",
    include_granted_scopes="true"
    )
    return RedirectResponse(auth_url)

@app.get("/auth/youtube/callback")
def youtube_callback(request: Request):
    code = request.query_params.get("code")
    flow = get_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials
    
    return {
    "access_token": credentials.token,
    "refresh_token": credentials.refresh_token,
    "expires_in": credentials.expiry.isoformat() if credentials.expiry else None,
    "token_type": credentials.token_uri,
    "scopes": credentials.scopes
    }

@app.get("/youtube/playlist/{playlist_id}/items")
def get_playlist_items(request: Request, playlist_id: str):
    code = request.query_params.get("code")

    if not code:
        return {"error": "You must login first using /auth/youtube/login"}

    flow = get_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials

    youtube = get_authenticated_service(credentials)

    items = []
    next_page_token = None

    while True:
        response = youtube.playlistItems().list(
            part="snippet,contentDetails",
            playlistId=playlist_id,
            maxResults=50,
            pageToken=next_page_token
        ).execute()

        for item in response["items"]:
            items.append({
                "title": item["snippet"]["title"],
                "videoId": item["contentDetails"]["videoId"],
                "thumbnail": item["snippet"]["thumbnails"]["default"]["url"]
            })

        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break

    return items
