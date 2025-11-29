import requests
from app.config import settings

class SpotifyClient:

    @staticmethod
    def search(query: str, user_id: str):
        url = f"{settings.spotify_connector_url}/music/search"
        headers = {"X-User-Id": user_id}
        params = {"q": query}

        resp = requests.get(url, headers=headers, params=params)
        resp.raise_for_status()

        data = resp.json()

        # CASE 1: Spotify connector returns {"items": [...]}
        if isinstance(data, dict) and "items" in data:
            return data["items"]

        # CASE 2: Spotify connector returns a bare list [...]
        if isinstance(data, list):
            return data

        # CASE 3: Unexpected format
        return []
