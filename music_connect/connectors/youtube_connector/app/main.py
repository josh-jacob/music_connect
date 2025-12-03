from fastapi import FastAPI, Request
from dotenv import load_dotenv
load_dotenv()
from fastapi.responses import RedirectResponse
from app.oauth_handler import get_flow, get_authenticated_service
from app.token_storage import save_tokens
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from googleapiclient.errors import HttpError
from app.refresh_token import refresh_youtube_token


import os

app = FastAPI()


app = FastAPI()

# Allow everything (development mode)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Allow all domains
    allow_credentials=True,
    allow_methods=["*"],          # Allow all HTTP methods
    allow_headers=["*"],          # Allow all headers
)

"""
Redirect user to Google's OAuth page.
Requests offline access so we get a refresh token.
"""
@app.get("/auth/youtube/login")
def youtube_login():
    flow = get_flow()
    auth_url, _ = flow.authorization_url(
    prompt="consent",
    access_type="offline",
    include_granted_scopes="true"
    )
    return RedirectResponse(auth_url)

"""
Google redirects here after user logs in.
We exchange the 'code' for access + refresh tokens
and save them locally so the user only logs in once.
"""
@app.get("/auth/youtube/callback")
def youtube_callback(request: Request):
    code = request.query_params.get("code")
    flow = get_flow()
    flow.fetch_token(code=code)
    credentials = flow.credentials
    
    token_data = {
        "access_token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "expires_at": credentials.expiry.isoformat(),
        "scopes": credentials.scopes
    }
    save_tokens(token_data)

    ui_url = os.getenv("YOUTUBE_UI_REDIRECT_URL")

    # If UI redirect is configured → redirect to UI
    if ui_url:
        return RedirectResponse(ui_url)

    # Otherwise return JSON for easier local testing
    return {"message": "YouTube connected and tokens saved!"}

"""
Returns all items/videos inside a specific playlist.
Automatically refreshes token if expired.
"""
@app.get("/youtube/playlist/{playlist_id}/items")
def get_playlist_items(playlist_id: str):

      # Refresh expired token automatically
    credentials = refresh_youtube_token()
    if credentials is None:
        return {"error": "Please login first using /auth/youtube/login"}

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
            snippet = item["snippet"]

            items.append({
                "title": snippet["title"],
                "videoId": item["contentDetails"]["videoId"],
                "thumbnail": snippet["thumbnails"]["default"]["url"],
                "channel": snippet.get("videoOwnerChannelTitle")  # preferred field
                            or snippet.get("channelTitle")        # fallback for older videos
            })


        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break

    return items

"""
Returns all playlists owned by the authenticated user.
Useful for UI playlist selection and migration features.
"""

@app.get("/youtube/playlists")
def get_user_playlists():
    credentials = refresh_youtube_token()
    if credentials is None:
        return {"error": "Please login first using /auth/youtube/login"}

    youtube = get_authenticated_service(credentials)

    playlists = []
    next_page_token = None

    try:
        while True:
            response = youtube.playlists().list(
                part="snippet,contentDetails",
                mine=True,
                maxResults=50,
                pageToken=next_page_token
            ).execute()

            items = response.get("items", [])

            if not items:
                # User has NO playlists or NO channel
                break

            for p in items:
                snippet = p.get("snippet", {})
                thumbnails = snippet.get("thumbnails", {})

                playlists.append({
                    "id": p.get("id"),
                    "title": snippet.get("title"),
                    "thumbnail": thumbnails.get("default", {}).get("url"),
                    "videoCount": p.get("contentDetails", {}).get("itemCount", 0)
                })

            next_page_token = response.get("nextPageToken")
            if not next_page_token:
                break

    except HttpError as e:
        if e.resp.status == 404:
            return []
        raise e

    return playlists




"""
Search YouTube for videos matching a query.
Used for track lookup before adding to a playlist.
"""
@app.get("/youtube/search")
def search_tracks(q: str):
    credentials = refresh_youtube_token()
    if credentials is None:
        return {"error": "Please login first using /auth/youtube/login"}

    youtube = get_authenticated_service(credentials)

    response = youtube.search().list(
        q=q,
        part="snippet",
        maxResults=25,
        type="video"
    ).execute()

    results = []
    for item in response["items"]:
        results.append({
            "videoId": item["id"]["videoId"],
            "title": item["snippet"]["title"],
            "channel": item["snippet"]["channelTitle"],
            "thumbnail": item["snippet"]["thumbnails"]["default"]["url"]
        })

    return {"results": results}

"""
Add a video to a playlist.
"""
@app.post("/youtube/playlist/{playlist_id}/add")
def add_track_to_playlist(playlist_id: str, videoId: str):
    credentials = refresh_youtube_token()
    if credentials is None:
        return {"error": "Please login first using /auth/youtube/login"}

    youtube = get_authenticated_service(credentials)

    request_body = {
        "snippet": {
            "playlistId": playlist_id,
            "resourceId": {
                "kind": "youtube#video",
                "videoId": videoId
            }
        }
    }

    response = youtube.playlistItems().insert(
        part="snippet",
        body=request_body
    ).execute()

    return {
        "status": "added",
        "playlistItemId": response["id"],
        "videoId": videoId
    }

"""
Removes a video from a playlist.
The YouTube API requires a playlistItemId,
so we first search for which playlist item matches the given videoId.
"""
@app.delete("/youtube/playlist/{playlist_id}/remove")
def remove_track_from_playlist(playlist_id: str, videoId: str):
    credentials = refresh_youtube_token()
    if credentials is None:
        return {"error": "Please login first using /auth/youtube/login"}

    youtube = get_authenticated_service(credentials)

    # Step 1 — find playlistItemId
    search = youtube.playlistItems().list(
        part="id,contentDetails",
        playlistId=playlist_id,
        maxResults=50
    ).execute()

    playlist_item_id = None
    for item in search["items"]:
        if item["contentDetails"]["videoId"] == videoId:
            playlist_item_id = item["id"]
            break

    if playlist_item_id is None:
        return {"error": "Track not found in playlist"}

    # Step 2 — remove it
    youtube.playlistItems().delete(id=playlist_item_id).execute()

    return {
        "status": "removed",
        "playlistItemId": playlist_item_id,
        "videoId": videoId
    }

class CreatePlaylistRequest(BaseModel):
    title: str
    description: str | None = ""
    privacy: str | None = "public"   # allowed: public, private, unlisted


@app.post("/youtube/playlists/create")
def create_playlist(body: CreatePlaylistRequest):
    credentials = refresh_youtube_token()
    if credentials is None:
        return {"error": "Please login first using /auth/youtube/login"}

    youtube = get_authenticated_service(credentials)

    playlist_body = {
        "snippet": {
            "title": body.title,
            "description": body.description
        },
        "status": {
            "privacyStatus": body.privacy
        }
    }

    response = youtube.playlists().insert(
        part="snippet,status",
        body=playlist_body
    ).execute()

    return {
        "status": "created",
        "playlistId": response["id"],
        "title": body.title
    }

@app.get("/youtube/me")
def get_user_info():
    """
    Returns basic information about the authenticated YouTube user.
    Safe for all users, even those without channels.
    """
    credentials = refresh_youtube_token()
    if credentials is None:
        return {"error": "Please login first using /auth/youtube/login"}
    
    youtube = get_authenticated_service(credentials)

    response = youtube.channels().list(
        part="snippet,contentDetails",
        mine=True
    ).execute()

    if not response.get("items"):
        return {
            "channelId": None,
            "title": None,
            "description": None,
            "profileImage": None,
            "country": None,
            "uploadsPlaylistId": None
        }

    data = response["items"][0]
    snippet = data.get("snippet", {})
    thumbnails = snippet.get("thumbnails", {})

    return {
        "channelId": data.get("id"),
        "title": snippet.get("title"),
        "description": snippet.get("description"),
        "profileImage": thumbnails.get("default", {}).get("url"),
        "country": snippet.get("country"),
        "uploadsPlaylistId": data.get("contentDetails", {})
                                 .get("relatedPlaylists", {})
                                 .get("uploads")
    }