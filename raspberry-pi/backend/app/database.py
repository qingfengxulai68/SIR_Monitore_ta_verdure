"""Database configuration and session management - PostgreSQL Only."""

import os
from collections.abc import Generator
from unittest.mock import Base
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from sqlalchemy.orm import DeclarativeBase


# Create the PostgreSQL engine
engine = create_engine(
    os.environ.get('DATABASE_URL'),
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
class Base(DeclarativeBase):
    pass

# Database utility functions
def create_tables() -> None:
    """Create all database tables."""
    Base.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """Get database session."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def init_admin_user() -> None:
    """Create initial admin user from environment variables if it does not exist."""
    from app.models.user import User
    from app.auth.jwt import hash_password
    
    session = SessionLocal()
    try:
        # Check if any user exists
        existing_user = session.execute(select(User)).scalars().first()
        if existing_user is not None:
            return

        # Create admin user
        admin = User(
            username=os.environ.get('ADMIN_USERNAME'),
            password_hash=hash_password(os.environ.get('ADMIN_PASSWORD')),
        )
        session.add(admin)
        session.commit()
    finally:
        session.close()

def init_settings() -> None:
    """Ensure global settings exist at initialization."""
    from app.models.settings import Settings
    
    session = SessionLocal()
    try:
        if not session.execute(select(Settings)).scalars().first():
            # session.add(Settings(id=1, alerts_enabled=False))
            session.commit()
    finally:
        session.close()

def init_modules() -> None:
    """Initialize sample modules for testing."""
    from app.models.module import Module
    
    session = SessionLocal()
    try:
        # Check if modules already exist
        existing_modules = session.execute(select(Module)).scalars().first()
        if existing_modules is not None:
            return

        # Create sample modules
        sample_modules = [
            Module(id="ESP32-001", coupled=False, last_seen=None),
            Module(id="ESP32-002", coupled=False, last_seen=None),
            Module(id="ESP32-003", coupled=False, last_seen=None),
        ]
        for module in sample_modules:
            session.add(module)
        session.commit()
    finally:
        session.close()