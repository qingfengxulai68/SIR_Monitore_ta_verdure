"""Terrarium API - Plant Monitoring System """

from dotenv import load_dotenv
import tomllib
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.database import create_tables, init_admin_user, init_modules, init_settings
from app.routers import (
    auth_router,
    ingestion_router,
    modules_router,
    plants_router,
    settings_router,
)
from app.tasks.module_heartbeat import module_heartbeat_checker
from app.websocket import websocket_endpoint


# Load project metadata from pyproject.toml
pyproject_path = Path(__file__).parent.parent / "pyproject.toml"
with open(pyproject_path, "rb") as f:
    pyproject_data = tomllib.load(f)

PROJECT_NAME = pyproject_data["project"]["name"]
PROJECT_VERSION = pyproject_data["project"]["version"]
PROJECT_DESCRIPTION = pyproject_data["project"]["description"]

# App lifespan handler
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Create database tables
    create_tables()

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

# Environment configuration
env = os.getenv("ENV", "dev")

# Create FastAPI app
app = FastAPI(
    title=PROJECT_NAME,
    description=PROJECT_DESCRIPTION,
    version=PROJECT_VERSION,
    lifespan=lifespan,
    root_path="/api",
    docs_url="/docs" if env == "dev" else None,
    redoc_url="/redoc" if env == "dev" else None,
    openapi_url="/openapi.json" if env == "dev" else None
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

# API root endpoint
@app.get("/")
async def root() -> dict:
    return {
        "name": app.title,
        "version": app.version,
        "description": app.description,
        "status": "healthy"
    }
