=============================
env-vars-by-service.md
=============================

# MusicConnect – Environment Variable Conventions

## Global conventions

- All shared infra env vars are prefixed with `MC_`.
- Names are UPPERCASE with `_` separators.
- Provider-specific settings use `MC_SPOTIFY_*` and `MC_YT_*`.

### Common / shared env vars

- MC_ENV                    # 'dev', 'staging', 'prod'
- MC_SERVICE_NAME           # Logical name of the service (e.g. 'unified-search-service')

### PostgreSQL (shared instance)

- MC_PG_HOST                # Postgres hostname
- MC_PG_PORT                # Postgres port (e.g. 31777)
- MC_PG_DB                  # Database name (e.g. 'musicconnect')
- MC_PG_USER                # Application DB user (e.g. 'mc_app')
- MC_PG_PASSWORD            # DB user password
- MC_PG_SSLMODE             # Usually 'require' on IBM Cloud

### Redis (shared instance)

- MC_REDIS_HOST             # Redis hostname
- MC_REDIS_PORT             # Redis port
- MC_REDIS_PASSWORD         # Redis auth password
- MC_REDIS_TLS              # 'true' if TLS is required

### Kafka / Event Streams (optional / later)

- MC_KAFKA_BROKERS          # Comma-separated list of brokers
- MC_KAFKA_API_KEY          # Event Streams API key
- MC_KAFKA_SASL_MECHANISM   # e.g. 'PLAIN'
- MC_KAFKA_SECURITY_PROTOCOL# e.g. 'SASL_SSL'
- MC_KAFKA_TOPIC_USER_EVENTS   # Topic name for user-level events
- MC_KAFKA_TOPIC_GLOBAL_EVENTS  # Topic name for global events

### Object Storage (for exports)

- MC_OSTORE_ENDPOINT        # COS endpoint URL
- MC_OSTORE_BUCKET_EXPORTS  # Bucket for export files
- MC_OSTORE_API_KEY         # IAM API key (if using IBM SDK)
- MC_OSTORE_HMAC_ACCESS_KEY # HMAC access key (if using S3-style SDK)
- MC_OSTORE_HMAC_SECRET_KEY # HMAC secret key

### Provider APIs

- MC_SPOTIFY_CLIENT_ID      # Spotify app client ID
- MC_SPOTIFY_CLIENT_SECRET  # Spotify app client secret
- MC_YT_API_KEY             # YouTube Data API key


# Per-service env var sets

## 1. MusicConnect Core (Portal + Auth + Service Registry)

Required:

- MC_ENV
- MC_SERVICE_NAME

- MC_PG_HOST
- MC_PG_PORT
- MC_PG_DB
- MC_PG_USER
- MC_PG_PASSWORD
- MC_PG_SSLMODE

- MC_REDIS_HOST
- MC_REDIS_PORT
- MC_REDIS_PASSWORD
- MC_REDIS_TLS

- MC_SPOTIFY_CLIENT_ID
- MC_SPOTIFY_CLIENT_SECRET
- MC_YT_API_KEY


## 2. Spotify Core Service

Required:

- MC_ENV
- MC_SERVICE_NAME

- MC_PG_HOST
- MC_PG_PORT
- MC_PG_DB
- MC_PG_USER
- MC_PG_PASSWORD
- MC_PG_SSLMODE

- MC_REDIS_HOST
- MC_REDIS_PORT
- MC_REDIS_PASSWORD
- MC_REDIS_TLS

- MC_SPOTIFY_CLIENT_ID
- MC_SPOTIFY_CLIENT_SECRET

Optional (event-driven later):

- MC_KAFKA_BROKERS
- MC_KAFKA_API_KEY
- MC_KAFKA_SASL_MECHANISM
- MC_KAFKA_SECURITY_PROTOCOL
- MC_KAFKA_TOPIC_USER_EVENTS


## 3. YouTube Core Service

Required:

- MC_ENV
- MC_SERVICE_NAME

- MC_PG_HOST
- MC_PG_PORT
- MC_PG_DB
- MC_PG_USER
- MC_PG_PASSWORD
- MC_PG_SSLMODE

- MC_REDIS_HOST
- MC_REDIS_PORT
- MC_REDIS_PASSWORD
- MC_REDIS_TLS

- MC_YT_API_KEY

Optional (event-driven later):

- MC_KAFKA_BROKERS
- MC_KAFKA_API_KEY
- MC_KAFKA_SASL_MECHANISM
- MC_KAFKA_SECURITY_PROTOCOL
- MC_KAFKA_TOPIC_USER_EVENTS


## 4. Unified Search Service

Required:

- MC_ENV
- MC_SERVICE_NAME

- MC_PG_HOST
- MC_PG_PORT
- MC_PG_DB
- MC_PG_USER
- MC_PG_PASSWORD
- MC_PG_SSLMODE

- MC_REDIS_HOST
- MC_REDIS_PORT
- MC_REDIS_PASSWORD
- MC_REDIS_TLS

Optional (if emitting search events):

- MC_KAFKA_BROKERS
- MC_KAFKA_API_KEY
- MC_KAFKA_SASL_MECHANISM
- MC_KAFKA_SECURITY_PROTOCOL
- MC_KAFKA_TOPIC_USER_EVENTS


## 5. User Trends Service

Required:

- MC_ENV
- MC_SERVICE_NAME

- MC_PG_HOST
- MC_PG_PORT
- MC_PG_DB
- MC_PG_USER
- MC_PG_PASSWORD
- MC_PG_SSLMODE

Optional:

- MC_REDIS_HOST
- MC_REDIS_PORT
- MC_REDIS_PASSWORD
- MC_REDIS_TLS

Expected (consumer of user events):

- MC_KAFKA_BROKERS
- MC_KAFKA_API_KEY
- MC_KAFKA_SASL_MECHANISM
- MC_KAFKA_SECURITY_PROTOCOL
- MC_KAFKA_TOPIC_USER_EVENTS


## 6. Global Trends Service

Required:

- MC_ENV
- MC_SERVICE_NAME

- MC_PG_HOST
- MC_PG_PORT
- MC_PG_DB
- MC_PG_USER
- MC_PG_PASSWORD
- MC_PG_SSLMODE

Optional:

- MC_REDIS_HOST
- MC_REDIS_PORT
- MC_REDIS_PASSWORD
- MC_REDIS_TLS

Expected (consumer of global events):

- MC_KAFKA_BROKERS
- MC_KAFKA_API_KEY
- MC_KAFKA_SASL_MECHANISM
- MC_KAFKA_SECURITY_PROTOCOL
- MC_KAFKA_TOPIC_GLOBAL_EVENTS


## 7. Data Exports Service

Required:

- MC_ENV
- MC_SERVICE_NAME

- MC_PG_HOST
- MC_PG_PORT
- MC_PG_DB
- MC_PG_USER
- MC_PG_PASSWORD
- MC_PG_SSLMODE

Object Storage:

- MC_OSTORE_ENDPOINT
- MC_OSTORE_BUCKET_EXPORTS
- MC_OSTORE_API_KEY           # or HMAC keys if using S3-style library
- MC_OSTORE_HMAC_ACCESS_KEY
- MC_OSTORE_HMAC_SECRET_KEY

Optional:

- MC_REDIS_HOST
- MC_REDIS_PORT
- MC_REDIS_PASSWORD
- MC_REDIS_TLS

- MC_KAFKA_BROKERS
- MC_KAFKA_API_KEY
- MC_KAFKA_SASL_MECHANISM
- MC_KAFKA_SECURITY_PROTOCOL


## 8. Playlist Migration Service

Required:

- MC_ENV
- MC_SERVICE_NAME

- MC_PG_HOST
- MC_PG_PORT
- MC_PG_DB
- MC_PG_USER
- MC_PG_PASSWORD
- MC_PG_SSLMODE

- MC_REDIS_HOST
- MC_REDIS_PORT
- MC_REDIS_PASSWORD
- MC_REDIS_TLS

- MC_SPOTIFY_CLIENT_ID
- MC_SPOTIFY_CLIENT_SECRET
- MC_YT_API_KEY

Optional:

- MC_KAFKA_BROKERS
- MC_KAFKA_API_KEY
- MC_KAFKA_SASL_MECHANISM
- MC_KAFKA_SECURITY_PROTOCOL
- MC_KAFKA_TOPIC_USER_EVENTS
