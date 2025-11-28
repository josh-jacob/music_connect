class TokenManager:
    def __init__(self):
        self.states = {}     # state → user_id
        self.tokens = {}     # user_id → token payload

    # ----------------------------
    # STATE MANAGEMENT (OAuth)
    # ----------------------------
    def set_state(self, state: str, user_id: str):
        """Store the temporary OAuth state."""
        self.states[state] = user_id

    def pop_state(self, state: str):
        """Retrieve and delete the OAuth state."""
        return self.states.pop(state, None)

    # ----------------------------
    # TOKEN STORAGE
    # ----------------------------
    def store_tokens(self, user_id: str, token_payload: dict):
        """Save the access + refresh tokens."""
        self.tokens[user_id] = token_payload

    def get_tokens(self, user_id: str):
        """Return tokens for the given user."""
        return self.tokens.get(user_id)
        

# Create a global instance shared by the whole application
token_manager = TokenManager()
