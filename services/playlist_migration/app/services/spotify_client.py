import requests
from typing import List, Dict, Any
from app.config import settings

class SpotifyClient:
    
    @staticmethod
    def get_playlist_info(user_id: str, playlist_id: str) -> Dict[str, Any]:
        """Fetch basic info about a Spotify playlist"""
        url = f"{settings.SPOTIFY_CONNECTOR_URL}/music/playlist/{playlist_id}/tracks"
        headers = {"X-User-Id": user_id}
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        # Extract playlist name from the response or return default
        return {
            "name": "Spotify Playlist",  # The current API doesn't return playlist name
            "description": ""
        }
    
    @staticmethod
    def get_playlist_tracks(user_id: str, playlist_id: str) -> List[Dict[str, Any]]:
        """Fetch tracks from a Spotify playlist"""
        url = f"{settings.SPOTIFY_CONNECTOR_URL}/music/playlist/{playlist_id}/tracks"
        headers = {"X-User-Id": user_id}
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        items = data.get("items", [])
        
        # Normalize to simple format
        tracks = []
        for item in items:
            track = item.get("track", {})
            if track:
                tracks.append({
                    "title": track.get("name", ""),
                    "artist": track["artists"][0]["name"] if track.get("artists") else ""
                })
        
        return tracks