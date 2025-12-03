import requests
from typing import List, Dict, Any
from app.config import settings

class YouTubeClient:
    
    @staticmethod
    def get_playlist_videos(playlist_id: str) -> List[Dict[str, Any]]:
        """Get videos from YouTube playlist"""
        url = f"{settings.YOUTUBE_CONNECTOR_URL}/youtube/playlist/{playlist_id}/items"
        
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            videos = response.json()
            
            if not isinstance(videos, list):
                print(f"Unexpected YouTube response: {videos}")
                return []
            
            return videos
        except Exception as e:
            print(f"Error fetching YouTube playlist: {e}")
            raise Exception(f"Failed to fetch YouTube playlist: {str(e)}")
    
    @staticmethod
    def search_videos(query: str) -> List[Dict[str, Any]]:
        """Search YouTube for videos"""
        url = f"{settings.YOUTUBE_CONNECTOR_URL}/youtube/search"
        params = {"q": query}
        
        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])
        except Exception as e:
            print(f"Error searching YouTube: {e}")
            return []
    
    @staticmethod
    def create_playlist(title: str, description: str = "", privacy: str = "private") -> Dict[str, Any]:
        """Create YouTube playlist"""
        url = f"{settings.YOUTUBE_CONNECTOR_URL}/youtube/playlists/create"
        payload = {
            "title": title,
            "description": description,
            "privacy": privacy
        }
        
        try:
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error creating YouTube playlist: {e}")
            raise Exception(f"Failed to create YouTube playlist: {str(e)}")
    
    @staticmethod
    def add_to_playlist(playlist_id: str, video_id: str):
        """Add video to YouTube playlist"""
        url = f"{settings.YOUTUBE_CONNECTOR_URL}/youtube/playlist/{playlist_id}/add"
        params = {"videoId": video_id}
        
        try:
            response = requests.post(url, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error adding video: {e}")
            raise Exception(f"Failed to add video: {str(e)}")
