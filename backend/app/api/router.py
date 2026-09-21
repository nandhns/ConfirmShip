from fastapi import APIRouter

from app.api.routes.emails import router as emails_router
from app.api.routes.health import router as health_router
from app.api.routes.process import router as process_router

api_router = APIRouter(prefix="/api")

api_router.include_router(emails_router)
api_router.include_router(health_router)
api_router.include_router(process_router)
