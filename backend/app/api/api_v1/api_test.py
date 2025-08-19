from fastapi import APIRouter
from app.api.api_v1.endpoints.auth_test import router as auth_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
