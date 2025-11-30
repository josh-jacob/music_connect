=============================
db-schema-overview.md
=============================

# MusicConnect – Database Schema Overview

Single PostgreSQL instance with multiple logical schemas:

- core
- providers
- search
- migrations
- exports
- trends

Each service uses a subset of these schemas/tables.


## 1. Schema: core

### core.users
- Primary user accounts within MusicConnect.
- Columns (key ones):
  - id (PK, bigserial)
  - email (unique)
  - password_hash
  - display_name
  - created_at, updated_at
  - is_active

### core.user_sessions
- Server-side sessions / long-lived tokens (optional).
- Columns:
  - id (PK)
  - user_id (FK → core.users)
  - session_token (unique)
  - created_at, expires_at
  - ip_address, user_agent

### core.services
- Service registry / metadata for internal microservices.
- Columns:
  - id (PK)
  - name (unique service name)
  - base_url
  - description
  - is_active
  - created_at, updated_at


## 2. Schema: providers  (Spotify + YouTube + future)

### providers.accounts
- Links an MC user to an external provider account.
- Columns:
  - id (PK)
  - user_id (FK → core.users)
  - provider ('spotify', 'youtube', etc.)
  - provider_user_id (ID on that provider)
  - display_name
  - linked_at
- Constraint: UNIQUE (user_id, provider)

### providers.tokens
- OAuth tokens for each provider account (stored encrypted at app layer).
- Columns:
  - id (PK)
  - account_id (FK → providers.accounts)
  - access_token
  - refresh_token
  - scope
  - expires_at
  - created_at, updated_at

### providers.playlist_snapshots
- Cached metadata about provider playlists synced into the system.
- Columns:
  - id (PK)
  - account_id (FK → providers.accounts)
  - provider_playlist_id
  - name
  - track_count
  - last_synced_at
  - created_at
- Constraint: UNIQUE (account_id, provider_playlist_id)


## 3. Schema: search  (Unified Search Service)

### search.queries
- Log of user search queries for analytics and debugging.
- Columns:
  - id (PK)
  - user_id (FK → core.users, nullable)
  - query_text
  - provider_filter ('spotify', 'youtube', 'both', etc.)
  - created_at
  - results_count

### search.pinned_items
- Items a user has pinned from search results.
- Columns:
  - id (PK)
  - user_id (FK → core.users)
  - provider ('spotify', 'youtube')
  - item_type ('track', 'playlist', 'album', etc.)
  - provider_item_id
  - title
  - pinned_at
- Constraint: UNIQUE (user_id, provider, item_type, provider_item_id)


## 4. Schema: migrations  (Playlist Migration Service)

### migrations.jobs
- High-level playlist migration jobs (e.g., “move my playlists from Spotify to YouTube”).
- Columns:
  - id (PK)
  - user_id (FK → core.users)
  - source_provider
  - target_provider
  - status ('pending', 'running', 'completed', 'failed')
  - status_message
  - created_at
  - started_at
  - finished_at

### migrations.playlists
- Per-playlist migrations under a given job.
- Columns:
  - id (PK)
  - job_id (FK → migrations.jobs)
  - source_playlist_id
  - source_name
  - target_playlist_id
  - target_name
  - status ('pending', 'running', 'completed', 'failed')
  - error_message
  - created_at

### migrations.tracks
- Per-track mapping details within each playlist migration.
- Columns:
  - id (PK)
  - playlist_migration_id (FK → migrations.playlists)
  - source_track_id
  - source_title
  - source_artist
  - target_track_id
  - target_title
  - target_artist
  - match_score (0–100)
  - status ('pending', 'matched', 'failed')
  - error_message
  - created_at


## 5. Schema: exports  (Data Exports Service)

### exports.jobs
- Logical export jobs (e.g., “Download my playlists as CSV”).
- Columns:
  - id (PK)
  - user_id (FK → core.users)
  - export_type ('playlists_csv', 'history_json', etc.)
  - status ('pending', 'running', 'completed', 'failed')
  - status_message
  - requested_at
  - started_at
  - completed_at

### exports.files
- Storage details for generated export files (in Object Storage).
- Columns:
  - id (PK)
  - export_job_id (FK → exports.jobs)
  - storage_bucket
  - storage_key   # Path in COS
  - mime_type
  - size_bytes
  - created_at
  - expires_at


## 6. Schema: trends  (User Trends Service + Global Trends Service)

### trends.user_daily
- Per-user daily aggregates.
- Columns:
  - id (PK)
  - user_id (FK → core.users)
  - date
  - provider (nullable => all providers)
  - plays_count
  - unique_tracks
  - unique_artists
  - created_at
  - updated_at
- Constraint: UNIQUE (user_id, date, provider)

### trends.track_daily
- Per-track daily popularity metrics.
- Columns:
  - id (PK)
  - date
  - provider
  - provider_track_id
  - title
  - artist
  - plays_count
  - unique_users
  - created_at
  - updated_at
- Constraint: UNIQUE (date, provider, provider_track_id)

### trends.global_daily
- Global daily summary for dashboards.
- Columns:
  - id (PK)
  - date (UNIQUE)
  - total_users
  - total_plays
  - top_track_ids   # JSON text of top tracks for the day
  - top_artist_ids  # JSON text of top artists for the day
  - created_at
  - updated_at


## 7. Service → table mapping (cheat sheet)

- MusicConnect Core:
  - core.users
  - core.user_sessions
  - core.services
  - reads providers.accounts

- Spotify Core Service:
  - providers.accounts (provider='spotify')
  - providers.tokens
  - providers.playlist_snapshots

- YouTube Core Service:
  - providers.accounts (provider='youtube')
  - providers.tokens
  - providers.playlist_snapshots

- Unified Search Service:
  - search.queries
  - search.pinned_items

- Playlist Migration Service:
  - migrations.jobs
  - migrations.playlists
  - migrations.tracks

- Data Exports Service:
  - exports.jobs
  - exports.files

- User Trends Service:
  - trends.user_daily
  - trends.track_daily

- Global Trends Service:
  - trends.global_daily
  - (also updates trends.track_daily)
