"""Terrarium API - Plant Monitoring System """

from dotenv import load_dotenv

load_dotenv()

import tomllib
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_db_and_tables, init_admin_user, init_modules, init_settings
from app.routers import (
    auth_router,
    ingestion_router,
    modules_router,
    plants_router,
    settings_router,
)
from app.tasks.module_heartbeat import module_heartbeat_checker
from app.websocket import websocket_endpoint


load_dotenv()

# Load project metadata from pyproject.toml
pyproject_path = Path(__file__).parent.parent / "pyproject.toml"
with open(pyproject_path, "rb") as f:
    pyproject_data = tomllib.load(f)

PROJECT_NAME = pyproject_data["project"]["name"]
PROJECT_VERSION = pyproject_data["project"]["version"]
PROJECT_DESCRIPTION = pyproject_data["project"]["description"]

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler."""
    # Create database tables
    create_db_and_tables()

    # Initialize settings
    init_settings()

    # Initialize admin user from environment
    init_admin_user()

    # Initialize sample modules
    init_modules()

    # Start heartbeat checker
    await module_heartbeat_checker.start()

    yield

    # Shutdown
    await module_heartbeat_checker.stop()


app = FastAPI(
    title=PROJECT_NAME,
    description=PROJECT_DESCRIPTION,
    version=PROJECT_VERSION,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(modules_router)
app.include_router(plants_router)
app.include_router(settings_router)
app.include_router(ingestion_router)

# WebSocket endpoint
app.websocket("/ws")(websocket_endpoint)


@app.get("/")
async def root() -> dict:
    """Root endpoint - API health check."""
    return {
        "name": app.title,
        "version": app.version,
        "description": app.description,
        "status": "healthy"
    }
