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
    auth_url, _ = flow.authorization_url(prompt="consent")
    return RedirectResponse(auth_url)

@app.get("/auth/youtube/callback")
def youtube_callback(request: Request):
    code = request.query_params.get("code")
    flow = get_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials
    
    # Example: get the user's playlists
    youtube = get_authenticated_service(credentials)
    playlists = youtube.playlists().list(
        part="snippet,contentDetails",
        mine=True
    ).execute()

    return playlists
