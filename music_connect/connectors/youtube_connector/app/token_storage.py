import json
import os

FILE_PATH = "youtube_tokens.json"

def _load_all_tokens() -> dict:
    if not os.path.exists(FILE_PATH):
        return {}
    with open(FILE_PATH, "r") as f:
        return json.load(f)

def _save_all_tokens(all_tokens: dict) -> None:
    with open(FILE_PATH, "w") as f:
        json.dump(all_tokens, f, indent=4)

def save_tokens(user_id: str, data: dict) -> None:
    """
    Store tokens for a specific MusiConnect user.
    """
    all_tokens = _load_all_tokens()
    all_tokens[user_id] = data
    _save_all_tokens(all_tokens)

def load_tokens(user_id: str) -> dict | None:
    """
    Load tokens for a specific MusiConnect user.
    """
    all_tokens = _load_all_tokens()
    return all_tokens.get(user_id)
