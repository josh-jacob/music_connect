from difflib import SequenceMatcher

def score_match(source_title: str, source_artist: str, 
                candidate_title: str, candidate_channel: str) -> float:
    """
    Score how well a YouTube video matches a Spotify track.
    Returns a score from 0-100.
    """
    # Normalize strings
    source_title = source_title.lower().strip()
    source_artist = source_artist.lower().strip()
    candidate_title = candidate_title.lower().strip()
    candidate_channel = candidate_channel.lower().strip()
    
    # Title similarity (60% weight)
    title_score = SequenceMatcher(None, source_title, candidate_title).ratio() * 60
    
    # Artist/Channel similarity (40% weight)
    artist_score = SequenceMatcher(None, source_artist, candidate_channel).ratio() * 40
    
    # Bonus if artist name appears in video title
    if source_artist and source_artist in candidate_title:
        artist_score += 10
    
    # Bonus if track title appears in video title
    if source_title and source_title in candidate_title:
        title_score += 10
    
    total_score = min(title_score + artist_score, 100)
    
    return total_score