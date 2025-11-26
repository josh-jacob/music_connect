from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import JSONResponse

from app.dependencies import get_user_id
from app.services.spotify_service import SpotifyService

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/login")
async def login(user_id: str = Depends(get_user_id)):
    return SpotifyService.build_auth_url(user_id)

@router.get("/callback")
async def callback(code: str = Query(None), state: str = Query(None), error: str = Query(None)):
    if error:
        raise HTTPException(400, error)
    return SpotifyService.handle_auth_callback(code, state)
