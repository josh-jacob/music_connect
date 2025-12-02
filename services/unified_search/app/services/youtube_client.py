import requests
from app.config import settings

class YouTubeClient:
    @staticmethod
    def search(query: str):
        url = f"{settings.youtube_base_url}/youtube/search"
        params = {"q": query}

        try:
            resp = requests.get(url, params=params)
            resp.raise_for_status()
            raw = resp.json()
        except Exception:
            return []

        results = []
        for item in raw.get("results", []):
            results.append({
                "source": "youtube",
                "title": item["title"],
                "artist": item["channel"],
                "trackId": item["videoId"],
                "thumbnail": item["thumbnail"],
            })

        return results
