"""Terrarium API - Plant Monitoring System Backend."""

import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.database import create_db_and_tables, init_admin_user, init_modules, init_settings
from app.routers import (
    auth_router,
    ingestion_router,
    modules_router,
    plants_router,
    settings_router,
)
from app.tasks.heartbeat import heartbeat_checker
from app.websocket import websocket_endpoint

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler."""
    # Startup
    logger.info("Starting Terrarium API...")

    # Create database tables
    create_db_and_tables()
    logger.info("Database tables created")

    # Initialize settings
    init_settings()
    logger.info("Settings initialized")

    # Initialize admin user from environment
    init_admin_user()
    logger.info("Admin user initialized")

    # Initialize sample modules
    init_modules()
    logger.info("Sample modules initialized")

    # Start heartbeat checker
    await heartbeat_checker.start()
    logger.info("Heartbeat checker started")

    yield

    # Shutdown
    logger.info("Shutting down Terrarium API...")
    await heartbeat_checker.stop()
    logger.info("Heartbeat checker stopped")


app = FastAPI(
    title=os.environ.get('APP_NAME', 'Terrarium API'),
    description="IoT Plant Monitoring System Backend",
    version="0.1.0",
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
        "name": os.environ.get('APP_NAME', 'Terrarium API'),
        "status": "healthy",
        "version": "0.1.0",
    }
