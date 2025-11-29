import requests
from app.config import settings

class YouTubeClient:
    @staticmethod
    def search(query: str, user_id: str):
        url = f"{settings.YOUTUBE_BASE_URL}/youtube/search"
        resp = requests.get(
            url,
            params={"q": query},
            headers={"X-User-Id": user_id}
        )

        if resp.status_code != 200:
            return []

        return resp.json().get("items", [])
