from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.migrate import router  # Changed from services.playlist_migration.app.routers.migrate

app = FastAPI(title="Playlist Migration Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/health")
def health():
    return {"status": "ok", "service": "playlist_migration"}