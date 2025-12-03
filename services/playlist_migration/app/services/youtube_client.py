import requests
from typing import List, Dict, Any
from app.config import settings

class YouTubeClient:
    
    @staticmethod
    def search_videos(query: str) -> List[Dict[str, Any]]:
        """Search YouTube for videos"""
        url = f"{settings.YOUTUBE_CONNECTOR_URL}/youtube/search"
        params = {"q": query}
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        return data.get("results", [])
    
    @staticmethod
    def create_playlist(title: str, description: str = "", privacy: str = "private") -> Dict[str, Any]:
        """Create a new YouTube playlist"""
        url = f"{settings.YOUTUBE_CONNECTOR_URL}/youtube/playlists/create"
        payload = {
            "title": title,
            "description": description,
            "privacy": privacy
        }
        
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        return response.json()
    
    @staticmethod
    def add_to_playlist(playlist_id: str, video_id: str):
        """Add a video to a YouTube playlist"""
        url = f"{settings.YOUTUBE_CONNECTOR_URL}/youtube/playlist/{playlist_id}/add"
        params = {"videoId": video_id}
        
        response = requests.post(url, params=params)
        response.raise_for_status()
        
        return response.json()