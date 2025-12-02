from typing import Dict, Any
import time

# -------------------------------------------------
# In-memory state + token storage
# (your teammate will replace with DB later)
# -------------------------------------------------

_states: Dict[str, str] = {}        # state → user_id
_tokens: Dict[str, Dict[str, Any]] = {}   # user_id → token payload


# -------------------------------------------------
# STATE MANAGEMENT (OAuth Login Flow)
# -------------------------------------------------

def set_state(state: str, user_id: str):
    """Store temporary OAuth login state."""
    _states[state] = user_id


def pop_state(state: str):
    """Resolve OAuth state → user_id (and delete it)."""
    return _states.pop(state, None)


# -------------------------------------------------
# TOKEN MANAGEMENT
# -------------------------------------------------

def store_tokens(user_id: str, token_payload: dict):
    """
    Save access + refresh tokens.
    token_payload must include:
    {
        "access_token": "...",
        "refresh_token": "...",
        "expires_at": unix_timestamp
    }
    """
    _tokens[user_id] = token_payload


def get_tokens(user_id: str):
    """Retrieve tokens for a user."""
    return _tokens.get(user_id)
