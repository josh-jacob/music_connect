-- ============================================
-- MusicConnect Initial Database Schema
-- ============================================

-- 1. Schemas
CREATE SCHEMA core;
CREATE SCHEMA providers;
CREATE SCHEMA search;
CREATE SCHEMA migrations;
CREATE SCHEMA exports;
CREATE SCHEMA trends; 

-- ============================================
-- 2. CORE SCHEMA
-- ============================================

-- Users table
CREATE TABLE core.users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- User sessions (optional)
CREATE TABLE core.user_sessions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    session_token   VARCHAR(255) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    ip_address      INET,
    user_agent      TEXT
);

CREATE INDEX idx_user_sessions_user_id ON core.user_sessions(user_id);

-- Services registry
CREATE TABLE core.services (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,   -- e.g. 'unified-search', 'playlist-migration'
    base_url        TEXT,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. PROVIDERS SCHEMA (Spotify + YouTube + future)
-- ============================================

-- Link MC user to external provider account
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

-- OAuth tokens per provider account
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

CREATE INDEX idx_tokens_account_id ON providers.tokens(account_id);

-- Optional playlist snapshots (per provider account)
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
-- 4. SEARCH SCHEMA (Unified Search Service)
-- ============================================

-- Search queries log
CREATE TABLE search.queries (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT REFERENCES core.users(id) ON DELETE SET NULL,
    query_text      TEXT NOT NULL,
    provider_filter VARCHAR(50), -- 'spotify', 'youtube', 'both'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    results_count   INT
);

CREATE INDEX idx_search_queries_user_id
    ON search.queries(user_id, created_at DESC);

-- Pinned items from search
CREATE TABLE search.pinned_items (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    provider        VARCHAR(50) NOT NULL, -- 'spotify', 'youtube'
    item_type       VARCHAR(50) NOT NULL, -- 'track', 'playlist', etc.
    provider_item_id VARCHAR(255) NOT NULL,
    title           TEXT,
    pinned_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, provider, item_type, provider_item_id)
);

CREATE INDEX idx_pinned_items_user ON search.pinned_items(user_id);

-- ============================================
-- 5. MIGRATIONS SCHEMA (Playlist Migration Service)
-- ============================================

-- Migration jobs
CREATE TABLE migrations.jobs (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    source_provider     VARCHAR(50) NOT NULL,       -- 'spotify'
    target_provider     VARCHAR(50) NOT NULL,       -- 'youtube'
    status              VARCHAR(20) NOT NULL,       -- 'pending', 'running', 'completed', 'failed'
    status_message      TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at          TIMESTAMPTZ,
    finished_at         TIMESTAMPTZ
);

CREATE INDEX idx_migration_jobs_user
    ON migrations.jobs(user_id, created_at DESC);

-- Per-playlist migration records
CREATE TABLE migrations.playlists (
    id                      BIGSERIAL PRIMARY KEY,
    job_id                  BIGINT NOT NULL REFERENCES migrations.jobs(id) ON DELETE CASCADE,
    source_playlist_id      VARCHAR(255) NOT NULL,
    source_name             TEXT,
    target_playlist_id      VARCHAR(255),
    target_name             TEXT,
    status                  VARCHAR(20) NOT NULL DEFAULT 'pending',
    error_message           TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_migration_playlists_job
    ON migrations.playlists(job_id);

-- Per-track mapping in each playlist migration
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
    status                  VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'matched', 'failed'
    error_message           TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_migration_tracks_playlist
    ON migrations.tracks(playlist_migration_id);

-- ============================================
-- 6. EXPORTS SCHEMA (Data Exports Service)
-- ============================================

-- Export jobs
CREATE TABLE exports.jobs (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    export_type     VARCHAR(50) NOT NULL, -- 'playlists_csv', etc.
    status          VARCHAR(20) NOT NULL, -- 'pending', 'running', 'completed', 'failed'
    status_message  TEXT,
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_export_jobs_user
    ON exports.jobs(user_id, requested_at DESC);

-- Export files (stored in Object Storage)
CREATE TABLE exports.files (
    id              BIGSERIAL PRIMARY KEY,
    export_job_id   BIGINT NOT NULL REFERENCES exports.jobs(id) ON DELETE CASCADE,
    storage_bucket  VARCHAR(255) NOT NULL,
    storage_key     TEXT NOT NULL,
    mime_type       VARCHAR(100),
    size_bytes      BIGINT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ
);

CREATE INDEX idx_export_files_job
    ON exports.files(export_job_id);

-- ============================================
-- 7. TRENDS SCHEMA (User + Global Trends Services)
-- ============================================

-- User-level daily aggregates
CREATE TABLE trends.user_daily (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    date            DATE NOT NULL,
    provider        VARCHAR(50),        -- null = all providers
    plays_count     INT NOT NULL DEFAULT 0,
    unique_tracks   INT NOT NULL DEFAULT 0,
    unique_artists  INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, date, provider)
);

CREATE INDEX idx_trends_user_daily_user_date
    ON trends.user_daily(user_id, date);

-- Track-level daily popularity
CREATE TABLE trends.track_daily (
    id                  BIGSERIAL PRIMARY KEY,
    date                DATE NOT NULL,
    provider            VARCHAR(50) NOT NULL,
    provider_track_id   VARCHAR(255) NOT NULL,
    title               TEXT,
    artist              TEXT,
    plays_count         INT NOT NULL DEFAULT 0,
    unique_users        INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (date, provider, provider_track_id)
);

CREATE INDEX idx_trends_track_daily_popularity
    ON trends.track_daily(date, plays_count DESC);

-- Global daily summary
CREATE TABLE trends.global_daily (
    id              BIGSERIAL PRIMARY KEY,
    date            DATE NOT NULL UNIQUE,
    total_users     INT NOT NULL DEFAULT 0,
    total_plays     INT NOT NULL DEFAULT 0,
    top_track_ids   TEXT,   -- JSON text of track IDs
    top_artist_ids  TEXT,   -- JSON text of artist IDs
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 8. Permissions for musiconnect_app
-- ============================================

-- Allow musiconnect_app to use all schemas
GRANT USAGE ON SCHEMA core, providers, search, migrations, exports, trends
  TO musiconnect_app;

-- Current tables: allow full CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA core       TO musiconnect_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA providers  TO musiconnect_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA search     TO musiconnect_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA migrations TO musiconnect_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA exports    TO musiconnect_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA trends     TO musiconnect_app;

-- Sequences behind BIGSERIAL columns
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA core       TO musiconnect_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA providers  TO musiconnect_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA search     TO musiconnect_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA migrations TO musiconnect_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA exports    TO musiconnect_app;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA trends     TO musiconnect_app;

-- Default privileges for future tables/sequences created by the current owner
ALTER DEFAULT PRIVILEGES IN SCHEMA core
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA providers
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA search
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA migrations
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA exports
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA trends
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO musiconnect_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA core
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA providers
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA search
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA migrations
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA exports
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO musiconnect_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA trends
  GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO musiconnect_app;