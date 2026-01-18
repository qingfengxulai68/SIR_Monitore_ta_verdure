"""API Routers."""

from app.routers.alert import router as alert_router
from app.routers.auth import router as auth_router
from app.routers.ingestion import router as ingestion_router
from app.routers.modules import router as modules_router
from app.routers.plants import router as plants_router
from app.routers.settings import router as settings_router

__all__ = [
    "alert_router",
    "auth_router",
    "modules_router",
    "plants_router",
    "settings_router",
    "ingestion_router",
]
