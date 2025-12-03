import requests
from app.config import settings

class YouTubeClient:
    @staticmethod
    def search(query: str):
        url = f"{settings.YOUTUBE_CONNECTOR_URL}/youtube/search"
        params = {"q": query}

        try:
            resp = requests.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
        except Exception:
            return []

        # YouTube connector returns: { "results": [...] }
        items = data.get("results", [])
        if not isinstance(items, list):
            return []

        normalized = []
        for item in items:
            if not isinstance(item, dict):
                continue

            normalized.append({
                "source": "youtube",
                "title": item.get("title"),
                "channel": item.get("channel"),
                "videoId": item.get("videoId"),
                "thumbnail": item.get("thumbnail"),
            })

        return normalized
