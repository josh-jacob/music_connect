from app.config import settings

from typing import Dict, Any, Optional

import psycopg2
from psycopg2.extras import RealDictCursor

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
    """
    Stores OAuth states and tokens in the shared MusicConnect Postgres DB.

    Uses schemas/tables from the new schema:

      - providers.accounts
      - providers.tokens

    And creates (if needed) a lightweight helper table:

      - providers.oauth_states (state -> user_id, provider)

    Expectations:
      - user_id passed is the core user id (core.users.id)
      - PROVIDER_NAME env var identifies this connector ('spotify', 'youtube', etc.)

    """

    def __init__(self):
        self.db_params = {
            "host": settings.MC_PG_HOST,
            "port": settings.MC_PG_PORT,
            "dbname": settings.MC_PG_DB,
            "user": settings.MC_PG_USER,
            "password": settings.MC_PG_PASSWORD,
        }

        missing = [k for k, v in self.db_params.items() if v is None]
        if missing:
            raise RuntimeError(f"Missing Postgres env vars for token manager: {missing}")

        self.provider = settings.PROVIDER_NAME.lower()

        self._ensure_tables()

    def _get_conn(self):
        """
        Open a new connection for each operation (low-traffic service).
        """
        return psycopg2.connect(**self.db_params)

    def _ensure_tables(self):
        """
        Ensure the helper table providers.oauth_states exists.

        The main tables providers.accounts and providers.tokens are created
        by your schema SQL (musiconnect_pgdb_schema_v2.sql) and we assume
        they already exist.
        """
        create_oauth_states = """
        CREATE SCHEMA IF NOT EXISTS providers;

        CREATE TABLE IF NOT EXISTS providers.oauth_states (
            state      TEXT PRIMARY KEY,
            user_id    BIGINT NOT NULL,
            provider   VARCHAR(50) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """

        with self._get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(create_oauth_states)

    # -------------
    # STATE METHODS
    # -------------

    def set_state(self, state: str, user_id: str):
        """
        Persist the temporary OAuth state.
        user_id is the core user id (but we store it as BIGINT).
        """
        # Allow user_id to come in as string; convert to int for DB storage.
        try:
            user_id_int = int(user_id)
        except (ValueError, TypeError):
            raise ValueError(f"user_id must be an integer-compatible value, got {user_id!r}")

        sql = """
        INSERT INTO providers.oauth_states (state, user_id, provider)
        VALUES (%s, %s, %s)
        ON CONFLICT (state)
        DO UPDATE SET
            user_id    = EXCLUDED.user_id,
            provider   = EXCLUDED.provider,
            created_at = NOW();
        """

        with self._get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (state, user_id_int, self.provider))

    def pop_state(self, state: str) -> Optional[str]:
        """
        Atomically fetch + delete the state, returning the user_id (as string) or None.
        """
        with self._get_conn() as conn:
            with conn.cursor() as cur:
                # Lock the row while we inspect it
                cur.execute(
                    """
                    SELECT user_id
                    FROM providers.oauth_states
                    WHERE state = %s AND provider = %s
                    FOR UPDATE
                    """,
                    (state, self.provider),
                )
                row = cur.fetchone()
                if not row:
                    return None

                user_id_int = row[0]
                cur.execute(
                    "DELETE FROM providers.oauth_states WHERE state = %s AND provider = %s",
                    (state, self.provider),
                )
                # Return as string for backwards-compat with MemoryTokenManager
                return str(user_id_int)

    # -------------
    # TOKEN METHODS
    # -------------

    def _ensure_account(self, user_id: int) -> int:
        """
        Ensure there is a row in providers.accounts for (user_id, provider).
        Returns the account_id.

        NOTE:
          - provider_user_id is stubbed as '<provider>:<user_id>' until
            you have the real provider user id from the API.
        """

        # First try to find an existing account
        select_sql = """
        SELECT id
        FROM providers.accounts
        WHERE user_id = %s AND provider = %s
        """

        insert_sql = """
        INSERT INTO providers.accounts (user_id, provider, provider_user_id, display_name)
        VALUES (%s, %s, %s, NULL)
        ON CONFLICT (user_id, provider)
        DO UPDATE SET
            provider_user_id = EXCLUDED.provider_user_id
        RETURNING id;
        """

        with self._get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(select_sql, (user_id, self.provider))
                row = cur.fetchone()
                if row:
                    return row[0]

                # Create a minimal account row with a placeholder provider_user_id
                provider_user_id = f"{self.provider}:{user_id}"
                cur.execute(insert_sql, (user_id, self.provider, provider_user_id))
                account_id = cur.fetchone()[0]
                return account_id

    def store_tokens(self, user_id: str, token_payload: Dict[str, Any]):
        """
        Persist access + refresh tokens for the user.

        token_payload is expected to contain:
          - access_token (str)
          - refresh_token (optional str)
          - expires_at (int, unix epoch seconds)
        """
        access_token = token_payload.get("access_token")
        refresh_token = token_payload.get("refresh_token")
        expires_at = token_payload.get("expires_at")
        scope = token_payload.get("scope")

        if access_token is None or expires_at is None:
            raise ValueError("token_payload must include 'access_token' and 'expires_at'")

        try:
            user_id_int = int(user_id)
        except (ValueError, TypeError):
            raise ValueError(f"user_id must be an integer-compatible value, got {user_id!r}")

        # Ensure providers.accounts row
        account_id = self._ensure_account(user_id_int)

        sql = """
        INSERT INTO providers.tokens (
            account_id,
            access_token,
            refresh_token,
            scope,
            expires_at,
            created_at,
            updated_at
        )
        VALUES (
            %s,
            %s,
            %s,
            %s,
            TO_TIMESTAMP(%s),
            NOW(),
            NOW()
        )
        ON CONFLICT (account_id)
        DO UPDATE SET
            access_token = EXCLUDED.access_token,
            refresh_token = EXCLUDED.refresh_token,
            scope        = EXCLUDED.scope,
            expires_at   = EXCLUDED.expires_at,
            updated_at   = NOW();
        """

        with self._get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (account_id, access_token, refresh_token, scope, int(expires_at)))

    def get_tokens(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve stored tokens for the user, or None if none exist.
        Returns a dict shaped like the in-memory version:
          { "access_token": ..., "refresh_token": ..., "expires_at": ... }
        """
        try:
            user_id_int = int(user_id)
        except (ValueError, TypeError):
            raise ValueError(f"user_id must be an integer-compatible value, got {user_id!r}")

        select_account = """
        SELECT id
        FROM providers.accounts
        WHERE user_id = %s AND provider = %s
        """

        select_tokens = """
        SELECT access_token, refresh_token,
               EXTRACT(EPOCH FROM expires_at) AS expires_at
        FROM providers.tokens
        WHERE account_id = %s
        """

        with self._get_conn() as conn:
            with conn.cursor() as cur:
                # Find account
                cur.execute(select_account, (user_id_int, self.provider))
                row = cur.fetchone()
                if not row:
                    return None
                account_id = row[0]

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(select_tokens, (account_id,))
                token_row = cur.fetchone()
                if not token_row:
                    return None

                return {
                    "access_token": token_row["access_token"],
                    "refresh_token": token_row["refresh_token"],
                    "expires_at": int(token_row["expires_at"]) if token_row["expires_at"] is not None else None,
                }




# -----------------------
# Backend Selector
# -----------------------

def get_token_manager():
    if settings.STORAGE_BACKEND == "postgres":
        return PostgresTokenManager()
    return MemoryTokenManager()


# Global instance used everywhere
token_manager = get_token_manager()
