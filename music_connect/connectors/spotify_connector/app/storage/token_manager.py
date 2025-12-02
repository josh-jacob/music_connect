from app.config import settings


# -----------------------
# Memory-Based Token Manager
# -----------------------

class MemoryTokenManager:
    def __init__(self):
        self.states = {}     # state → user_id
        self.tokens = {}     # user_id → token payload

    # OAuth state
    def set_state(self, state: str, user_id: str):
        self.states[state] = user_id

    def pop_state(self, state: str):
        return self.states.pop(state, None)

    # Token storage
    def store_tokens(self, user_id: str, token_payload: dict):
        self.tokens[user_id] = token_payload

    def get_tokens(self, user_id: str):
        return self.tokens.get(user_id)


# -----------------------
# Postgres-Based Token Manager (future)
# -----------------------

class PostgresTokenManager:
    def __init__(self):
        # Placeholder until DB teammate implements
        raise NotImplementedError("Postgres token storage not implemented yet")

    def set_state(self, state: str, user_id: str):
        raise NotImplementedError

    def pop_state(self, state: str):
        raise NotImplementedError

    def store_tokens(self, user_id: str, token_payload: dict):
        raise NotImplementedError

    def get_tokens(self, user_id: str):
        raise NotImplementedError


# -----------------------
# Backend Selector
# -----------------------

def get_token_manager():
    if settings.STORAGE_BACKEND == "postgres":
        return PostgresTokenManager()
    return MemoryTokenManager()


# Global instance used everywhere
token_manager = get_token_manager()
