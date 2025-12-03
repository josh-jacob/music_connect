from fastapi import FastAPI, Request
from dotenv import load_dotenv
load_dotenv()
from fastapi.responses import RedirectResponse
from oauth_handler import get_flow, get_authenticated_service
from token_storage import save_tokens
<<<<<<< HEAD
from pydantic import BaseModel
=======
>>>>>>> main


import os

app = FastAPI()
<<<<<<< HEAD

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow everything (development mode)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Allow all domains
    allow_credentials=True,
    allow_methods=["*"],          # Allow all HTTP methods
    allow_headers=["*"],          # Allow all headers
)

=======
>>>>>>> main
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
<<<<<<< HEAD
=======

>>>>>>> main
    save_tokens(token_data)

    return {"message": "YouTube connected and tokens saved!"}


from refresh_token import refresh_youtube_token
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
<<<<<<< HEAD
            snippet = item["snippet"]

            items.append({
                "title": snippet["title"],
                "videoId": item["contentDetails"]["videoId"],
                "thumbnail": snippet["thumbnails"]["default"]["url"],
                "channel": snippet.get("videoOwnerChannelTitle")  # preferred field
                            or snippet.get("channelTitle")        # fallback for older videos
            })


=======
            items.append({
                "title": snippet["title"],
                "videoId": item["contentDetails"]["videoId"],
                "thumbnail": snippet["thumbnails"]["default"]["url"],
                "channel": snippet.get("videoOwnerChannelTitle")  # preferred field
                            or snippet.get("channelTitle")        # fallback for older videos
            })

>>>>>>> main
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

    while True:
        response = youtube.playlists().list(
            part="snippet,contentDetails",
            mine=True,
            maxResults=50,
            pageToken=next_page_token
        ).execute()

        for p in response["items"]:
            playlists.append({
                "id": p["id"],
                "title": p["snippet"]["title"],
                "thumbnail": p["snippet"]["thumbnails"]["default"]["url"] 
                    if "default" in p["snippet"]["thumbnails"] else None,
                "videoCount": p["contentDetails"]["itemCount"]
            })

        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break

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

<<<<<<< HEAD
    from pydantic import BaseModel

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
    Returns information about the authenticated YouTube user:
    name, channel ID, profile picture, etc.
    """
    credentials = refresh_youtube_token()
    if credentials is None:
        return {"error": "Please login first using /auth/youtube/login"}

    youtube = get_authenticated_service(credentials)

    response = youtube.channels().list(
        part="snippet,contentDetails,statistics",
        mine=True
    ).execute()

    if not response["items"]:
        return {"error": "No YouTube channel found for this user"}

    data = response["items"][0]

    return {
        "channelId": data["id"],
        "title": data["snippet"]["title"],
        "description": data["snippet"].get("description"),
        "profileImage": data["snippet"]["thumbnails"]["default"]["url"],
        "country": data["snippet"].get("country"),
        "viewCount": data["statistics"].get("viewCount"),
        "subscriberCount": data["statistics"].get("subscriberCount"),
        "videoCount": data["statistics"].get("videoCount"),
        "uploadsPlaylistId": data["contentDetails"]["relatedPlaylists"]["uploads"]
    }


=======
>>>>>>> main
