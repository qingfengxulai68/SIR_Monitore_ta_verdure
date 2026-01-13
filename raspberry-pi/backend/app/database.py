"""Database configuration and session management - PostgreSQL Only."""

import os
from collections.abc import Generator

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

# Ensure these imports match your file structure
from app.models.module import Module
from app.models.settings import Settings
from app.models.user import Base

# Retrieve Database URL.
# The default value is set to match your Docker configuration on the Raspberry Pi.
DATABASE_URL = os.environ.get('DATABASE_URL')

# Create the PostgreSQL engine
# pool_pre_ping=True checks the connection before using it. 
# This is vital to prevent "server has gone away" errors after periods of inactivity.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_db_and_tables() -> None:
    """Create all database tables."""
    # Note: With Postgres, the database itself ('app_db') must be created via Docker
    # before SQLAlchemy can create the tables.
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
    # Local imports to avoid circular dependency issues
    from app.auth.jwt import hash_password
    from app.models.user import User

    session = SessionLocal()
    try:
        # Check if any user exists
        existing_user = session.execute(select(User)).scalars().first()
        if existing_user is not None:
            return

        # Default credentials if environment variables are missing
        username = os.environ.get('ADMIN_USERNAME')
        password = os.environ.get('ADMIN_PASSWORD')

        # Create admin user
        admin = User(
            username=username,
            password_hash=hash_password(password),
        )
        session.add(admin)
        session.commit()
    finally:
        session.close()


def init_settings() -> None:
    """Ensure global settings exist at initialization."""
    session = SessionLocal()
    try:
        if not session.execute(select(Settings)).scalars().first():
            session.add(Settings(id=1, alerts_enabled=False))
            session.commit()
    finally:
        session.close()


def init_modules() -> None:
    """Initialize sample modules for testing."""
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