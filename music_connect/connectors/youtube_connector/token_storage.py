import json
import os

FILE_PATH = "youtube_tokens.json"

def save_tokens(data):
    with open(FILE_PATH, "w") as f:
        json.dump(data, f, indent=4)

def load_tokens():
    if not os.path.exists(FILE_PATH):
        return None
    with open(FILE_PATH, "r") as f:
        return json.load(f)
