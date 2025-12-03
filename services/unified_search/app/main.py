from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers.search import router as search_router
from app.routers.playlist import router as playlist_router

app = FastAPI(title="Unified Search Service")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search_router)
app.include_router(playlist_router)

@app.get("/")
def root():
    return {"status": "unified search running"}
