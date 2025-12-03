import requests
from app.config import settings

class SpotifyClient:
    @staticmethod
    def search(query: str, user_id: str):
        url = f"{settings.spotify_base_url}/music/search"
        headers = {"X-User-Id": user_id}
        params = {"q": query}

        try:
            resp = requests.get(url, headers=headers, params=params)
            resp.raise_for_status()
            raw = resp.json()
        except Exception as e:
            return []

        # NORMALIZE RESULTS
        results = []
        for item in raw.get("tracks", []):
            results.append({
                "source": "spotify",
                "title": item["name"],
                "artist": item["artists"][0]["name"] if item["artists"] else None,
                "trackId": item["id"],
                "thumbnail": item.get("album", {}).get("images", [{}])[0].get("url"),
            })

        return results
