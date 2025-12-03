from typing import List, Optional
from pydantic import BaseModel

class PlaylistResult(BaseModel):
    source: str              # "spotify", "youtube", etc.
    id: str
    name: str
    description: Optional[str] = None
    url: Optional[str] = None
    thumbnail: Optional[str] = None


class PlaylistSearchResponse(BaseModel):
    query: str
    results: List[PlaylistResult]
