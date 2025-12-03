import requests
from typing import List, Dict, Any
from app.config import settings

class SpotifyClient:
    
    @staticmethod
    def search_tracks(user_id: str, query: str) -> List[Dict[str, Any]]:
        """Search Spotify for tracks"""
        url = f"{settings.SPOTIFY_CONNECTOR_URL}/music/search"
        headers = {"X-User-Id": user_id}
        params = {"q": query}
        
        try:
            response = requests.get(url, headers=headers, params=params, timeout=30)
            response.raise_for_status()
            tracks = response.json()
            
            # tracks is already a list from the API
            if not isinstance(tracks, list):
                print(f"Unexpected Spotify search response type: {type(tracks)}")
                return []
            
            results = []
            for track in tracks:
                # Get artist name
                artists = track.get("artists", [])
                artist_name = ""
                if artists and len(artists) > 0:
                    artist_name = artists[0].get("name", "")
                
                results.append({
                    "id": track.get("id", ""),
                    "title": track.get("name", ""),
                    "artist": artist_name,
                    "uri": track.get("uri", "")
                })
            
            print(f"Spotify search for '{query}' returned {len(results)} results")
            return results
            
        except Exception as e:
            print(f"Error searching Spotify for '{query}': {e}")
            return []
    
    @staticmethod
    def create_playlist(user_id: str, name: str, description: str = "", public: bool = False) -> Dict[str, Any]:
        """Create a new Spotify playlist"""
        url = f"{settings.SPOTIFY_CONNECTOR_URL}/music/playlists"
        headers = {"X-User-Id": user_id}
        payload = {
            "name": name,
            "description": description,
            "public": public
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Error creating Spotify playlist: {e}")
            raise Exception(f"Failed to create Spotify playlist: {str(e)}")
    
    @staticmethod
    def add_tracks_to_playlist(user_id: str, playlist_id: str, uris: List[str]):
        """Add tracks to Spotify playlist"""
        url = f"{settings.SPOTIFY_CONNECTOR_URL}/music/playlist/{playlist_id}/add"
        headers = {"X-User-Id": user_id}
        payload = {"uris": uris}
        
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            print(f"Successfully added {len(uris)} track(s) to playlist {playlist_id}")
            return response.json()
        except Exception as e:
            print(f"Error adding tracks to Spotify playlist {playlist_id}: {e}")
            raise Exception(f"Failed to add tracks: {str(e)}")
    
    @staticmethod
    def get_playlist_info(user_id: str, playlist_id: str) -> Dict[str, Any]:
        """Get Spotify playlist info"""
        try:
            url = f"{settings.SPOTIFY_CONNECTOR_URL}/music/playlists"
            headers = {"X-User-Id": user_id}
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            items = data.get("items", [])
            
            for playlist in items:
                if playlist.get("id") == playlist_id:
                    return {
                        "name": playlist.get("name", "Migrated Playlist"),
                        "description": playlist.get("description", "")
                    }
        except Exception as e:
            print(f"Error fetching playlist info: {e}")
        
        return {"name": "Migrated Playlist", "description": ""}
    
    @staticmethod
    def get_playlist_tracks(user_id: str, playlist_id: str) -> List[Dict[str, Any]]:
        """Get tracks from Spotify playlist"""
        url = f"{settings.SPOTIFY_CONNECTOR_URL}/music/playlist/{playlist_id}/tracks"
        headers = {"X-User-Id": user_id}
        
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
            items = data.get("items", [])
            
            tracks = []
            for item in items:
                track = item.get("track", {})
                if not track:
                    continue
                artists = track.get("artists", [])
                artist_name = artists[0].get("name", "") if artists else ""
                
                tracks.append({
                    "title": track.get("name", ""),
                    "artist": artist_name,
                    "uri": track.get("uri", "")
                })
            
            return tracks
        except Exception as e:
            print(f"Error fetching Spotify tracks: {e}")
            raise Exception(f"Failed to fetch Spotify playlist: {str(e)}")