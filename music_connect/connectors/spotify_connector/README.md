
# **README — Spotify Connector Microservice**

## Overview

The Spotify Connector is a microservice in the MusicConnect system.  
It handles all communication with the Spotify Web API, including:

-   OAuth 2.0 login
    
-   Access & refresh token management
    
-   Fetching user profile
    
-   Fetching playlists
    
-   Fetching tracks in a playlist
    
-   Following playlists
    
-   Saving / unsaving tracks
    
-   Searching Spotify
    

Each user is identified by the header:

`X-User-Id: <user_id>`

Tokens are stored in an in-memory `token_manager`.

----------

## Features

-   Full OAuth login flow
    
-   Automatic access token refresh
    
-   Spotify Web API wrappers
    
-   Clean REST endpoints for the UI
    
-   Fully container-ready
    

----------

#  **1. Local Setup**

### **Clone & enter folder**

`git clone https://github.com/josh-jacob/music_connect.git cd music_connect/music_connect/connectors/spotify_connector` 

----------

# **2. Required Environment Variables**

Create a `.env` file inside `spotify_connector/app/`:

`SPOTIFY_CLIENT_ID=your_client_id_here SPOTIFY_CLIENT_SECRET=your_client_secret_here SPOTIFY_REDIRECT_URI=http://127.0.0.1:8081/auth/callback SPOTIFY_SCOPES=user-read-email playlist-read-private playlist-modify-private playlist-modify-public user-library-read user-library-modify` 

----------

#  **3. Run the Microservice**

Inside this microservice folder:

`uvicorn app.main:app --reload --port 8081` 

The service runs at:

`http://localhost:8081` 

----------

# **4. Authentication Flow (OAuth 2.0)**

1.  UI/backend calls:
    

`GET /auth/login  Header: X-User-Id: <user_id>` 

2.  Response contains:
    

`{  "auth_url":  "https://accounts.spotify.com/authorize?...",  "state":  "<random_state>"  }` 

3.  User logs into Spotify → Spotify redirects to:
    

`http://127.0.0.1:8081/auth/callback?code=...&state=...` 

4.  The microservice:
    

-   Exchanges the code for **access + refresh token**
    
-   Stores tokens in `token_manager`
    
-   Redirects user back to the UI
    

----------

#  **5. Endpoints**

## **AUTH**

### GET `/auth/login`

Returns Spotify login URL.

Headers:

`X-User-Id: testuser123` 

----------

### GET `/auth/callback`

Spotify redirects here.

----------

## **MUSIC**

### GET `/music/me`

Returns current user profile from Spotify API.

----------

### GET `/music/playlists`

Fetches **all user playlists**.

----------

### GET `/music/playlist/{playlist_id}/tracks`

Fetches **tracks inside a playlist**.

----------

### PUT `/music/playlist/{playlist_id}/follow`

Follow a playlist.

----------

### POST `/music/playlist/{playlist_id}/add`

Add tracks to playlist.

----------

### POST `/music/playlist/{playlist_id}/remove`

Remove tracks from playlist.

----------

### PUT `/music/playlist/{playlist_id}/reorder`

Reorder tracks.

----------

### GET `/music/saved-tracks`

Fetch saved/user-library tracks.

----------

#  **6. Token Management**

Tokens are stored internally:

`{ "access_token": "...", "refresh_token": "...", "expires_at": 1732859021 }` 

### Auto-refresh

If access token expires:

-   A refresh request is automatically triggered
    
-   Tokens are updated
    
-   The API call continues normally
    
----------

#  **7. Testing Endpoints (PowerShell)**

### Login

``$resp = Invoke-WebRequest ` -Uri  "http://localhost:8081/auth/login" ` -Headers  @{ "X-User-Id" = "testuser123" } $resp.Content`` 

Paste the URL in your browser → log into Spotify.

----------

### Get playlists

``Invoke-WebRequest ` -Uri  "http://localhost:8081/music/playlists" ` -Headers  @{ "X-User-Id" = "testuser123" }`` 

----------

### Get tracks in a playlist

``Invoke-WebRequest ` -Uri  "http://localhost:8081/music/playlist/<playlist_id>/tracks" ` -Headers  @{ "X-User-Id" = "testuser123" }``
