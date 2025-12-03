-- ============================================
-- MusicConnect Minimal Schema (v2)
-- Focused on:
--   - core users & auth
--   - provider accounts & tokens (Spotify / YouTube)
--   - unified search logs
--   - playlist migration jobs
-- ============================================

-- 1. Schemas
CREATE SCHEMA core;
CREATE SCHEMA providers;
CREATE SCHEMA search;
CREATE SCHEMA migrations;

-- ============================================
-- 2. CORE SCHEMA (users + auth)
-- ============================================

-- Core users (owned by auth-service)
CREATE TABLE core.users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- Optional: user sessions / refresh tokens
CREATE TABLE core.sessions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    session_token   VARCHAR(255) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    ip_address      INET,
    user_agent      TEXT
);

CREATE INDEX idx_core_sessions_user ON core.sessions(user_id);

-- Optional: service registry (UI can show status / links)
CREATE TABLE core.services (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,   -- e.g. 'ui', 'spotify-connector'
    base_url        TEXT,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. PROVIDERS SCHEMA (Spotify + YouTube)
-- ============================================

-- Link MusicConnect user to external provider account
CREATE TABLE providers.accounts (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    provider            VARCHAR(50) NOT NULL,     -- 'spotify', 'youtube'
    provider_user_id    VARCHAR(255) NOT NULL,    -- provider-specific user id
    display_name        VARCHAR(255),
    linked_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, provider)
);

CREATE INDEX idx_provider_accounts_provider_user
    ON providers.accounts(provider, provider_user_id);

-- OAuth tokens for provider accounts
-- Connectors + auth-service can both read/write tokens here.
CREATE TABLE providers.tokens (
    id                  BIGSERIAL PRIMARY KEY,
    account_id          BIGINT NOT NULL REFERENCES providers.accounts(id) ON DELETE CASCADE,
    access_token        TEXT NOT NULL,
    refresh_token       TEXT,
    scope               TEXT,
    expires_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_provider_tokens_account_id
    ON providers.tokens(account_id);

-- Optional: light playlist snapshot table (if you want caching later).
-- Keep but don't overuse yet.
CREATE TABLE providers.playlist_snapshots (
    id                      BIGSERIAL PRIMARY KEY,
    account_id              BIGINT NOT NULL REFERENCES providers.accounts(id) ON DELETE CASCADE,
    provider_playlist_id    VARCHAR(255) NOT NULL,
    name                    TEXT,
    track_count             INT,
    last_synced_at          TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (account_id, provider_playlist_id)
);

-- ============================================
-- 4. SEARCH SCHEMA (Unified Search)
-- ============================================

-- Minimal search log table for unified-search service
CREATE TABLE search.queries (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES core.users(id) ON DELETE SET NULL,
    query_text      TEXT NOT NULL,
    provider_filter VARCHAR(50), -- 'spotify', 'youtube', 'both', NULL = all
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    results_count   INT
);

CREATE INDEX idx_search_queries_user_created
    ON search.queries(user_id, created_at DESC);

-- ============================================
-- 5. MIGRATIONS SCHEMA (Playlist Migration)
-- ============================================

-- High-level migration job (e.g., migrate N playlists from Spotify to YouTube)
CREATE TABLE migrations.jobs (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    source_provider     VARCHAR(50) NOT NULL,      -- 'spotify'
    target_provider     VARCHAR(50) NOT NULL,      -- 'youtube'
    status              VARCHAR(20) NOT NULL,      -- 'pending','running','completed','failed'
    status_message      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at          TIMESTAMPTZ,
    finished_at         TIMESTAMPTZ
);

CREATE INDEX idx_migration_jobs_user_created
    ON migrations.jobs(user_id, created_at DESC);

-- Per-playlist migration records inside a job
CREATE TABLE migrations.playlists (
    id                      BIGSERIAL PRIMARY KEY,
    job_id                  BIGINT NOT NULL REFERENCES migrations.jobs(id) ON DELETE CASCADE,
    source_playlist_id      VARCHAR(255) NOT NULL,
    source_name             TEXT,
    target_playlist_id      VARCHAR(255),
    target_name             TEXT,
    status                  VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending','completed','failed'
    error_message           TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_migration_playlists_job
    ON migrations.playlists(job_id);

-- Per-track mapping for each migrated playlist
CREATE TABLE migrations.tracks (
    id                      BIGSERIAL PRIMARY KEY,
    playlist_migration_id   BIGINT NOT NULL REFERENCES migrations.playlists(id) ON DELETE CASCADE,
    source_track_id         VARCHAR(255) NOT NULL,
    source_title            TEXT,
    source_artist           TEXT,
    target_track_id         VARCHAR(255),
    target_title            TEXT,
    target_artist           TEXT,
    match_score             NUMERIC(5,2),
    status                  VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending','matched','failed'
    error_message           TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_migration_tracks_playlist
    ON migrations.tracks(playlist_migration_id);

-- ============================================
-- 6. Permissions for musiconnect_app (DB user)
-- ============================================

-- Adjust this to your actual DB user
GRANT USAGE ON SCHEMA core, providers, search, migrations
  TO musiconnect_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA core       TO musiconnect_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA providers  TO musiconnect_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA search     TO musiconnect_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA migrations TO musiconnect_app;

GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA core       TO musiconnect_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA providers  TO musiconnect_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA search     TO musiconnect_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA migrations TO musiconnect_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA core
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA providers
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA search
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA migrations
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO musiconnect_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA core
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA providers
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA search
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA migrations
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO musiconnect_app;
