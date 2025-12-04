# Running the MusiConnect Docker Stack

This document explains how to run the full MusiConnect stack locally using Docker:

- UI (`music_connect_ui`)
- Auth service (`services/auth-service`)
- Unified search (`services/unified_search`)
- Spotify connector (`music_connect/connectors/spotify_connector`)
- YouTube connector (`music_connect/connectors/youtube_connector`)
- Postgres database (`postgres`)

The stack is defined in the root `docker-compose.yml`. :contentReference[oaicite:0]{index=0}

---

## 1. Prerequisites

- **Docker Desktop** (or Docker Engine) installed and running
- **Git** installed
- Cloned MusiConnect repo:

## 2. Environment Files Setup

Each service expects a .env file that is not committed to git. You should:

Copy the .env.example (or template) for each service.
- music_connect_ui/.env, music_connect/connectors/spotify_connector/.env, music_connect/connectors/youtube_connector/.env, services/auth-service/.env, services/unified_search/.env
- Fill in local values (ports, secrets, client IDs, etc.).

## 3. Starting the Stack

From the repo root (where docker-compose.yml lives):
- In the console run 
``docker compose up -d --build``

Checking running containers
``docker compose ps``

View logs for a specific service (e.g., unified search):
``docker compose logs -f unified-search``

## 4. Stopping & Restarting

To stop all containers (keep DB data):
``docker compose down``

To restart after changes:
``docker compose up -d --build``

To rebuild only one service (e.g., auth-service):
``docker compose build auth-service``
``docker compose up -d auth-service``

## 5. Resetting the Database (wiping the volume)

Destroy containers and wipe DB data:
``docker compose down -v``

This removes mc-postgres-data. On the next docker compose up, Postgres will:
- Recreate the musicconnect database
- Re-run musiconnect_pgdb_schema_v2.sql from docs/ at startup (because the volume is empty again)
This is a clean way to reset the DB to a known schema.

## 6. Service URLs: Public vs Private

Both host (public) ports and internal (private) service names can be used to communicate between containers. 

6.1. Public URLs (from your browser / host machine)

These use localhost and the left side of the ports: mappings:

UI
http://localhost:3000

Auth service
http://localhost:3001

Unified search
http://localhost:8004

Spotify connector
http://localhost:8081

YouTube connector
http://localhost:8082

Postgres (DB tools like TablePlus / psql)
- Host: localhost
- Port: 5432
- DB: musicconnect
- User: musiconnect_app
- Password: mc_password

6.2. Private URLs (inside the Docker network)

All services are on the musiconnect-net bridge network and can talk to each other via service names

These can be used inside containers:

Postgres
Host: postgres
Port: 5432

Auth service
http://auth-service:3001

Unified search
http://unified-search:8000

Spotify connector
http://spotify-connector:8000

YouTube connector
http://youtube-connector:8000

Any service connecting to Postgres:
- MC_PG_HOST=postgres
- MC_PG_PORT=5432
- MC_PG_DB=musicconnect
- MC_PG_USER=musiconnect_app
- MC_PG_PASSWORD=mc_password

Rule of thumb:

Browser ↔ services → use http://localhost:PORT.
Service ↔ service (inside Docker) → use http://SERVICE_NAME:PORT.

## 7. Common Docker Development Workflows

7.1. Change code in a service and rebuild just that container, Other services keep running.

7.2. View logs
``docker compose logs -f ui``
``docker compose logs -f auth-service``
``docker compose logs -f unified-search``

7.3. Shell into a running container

For debugging:
``docker exec -it musiconnect-auth /bin/sh`` 
or 
``docker exec -it musiconnect-unified-search /bin/bash``
(Not all images have bash; sh always exists.)

7.4. Recreate everything from scratch

Useful if things get weird:
Stop and delete containers + volumes
``docker compose down -v``

# Rebuild all images and start
``docker compose up --build``