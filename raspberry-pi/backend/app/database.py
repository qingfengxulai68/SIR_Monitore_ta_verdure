"""Database configuration and session management."""

import os
from collections.abc import Generator

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.models.module import Module
from app.models.settings import Settings
from app.models.user import Base

# SQLite specific: check_same_thread=False for async
connect_args = {"check_same_thread": False} if "sqlite" in os.environ.get('DATABASE_URL', 'sqlite:///./terrarium.db') else {}

engine = create_engine(
    os.environ.get('DATABASE_URL', 'sqlite:///./terrarium.db'),
    echo=bool(os.environ.get('DEBUG', 'True').lower() == 'true'),
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_db_and_tables() -> None:
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
    """Create initial admin user from environment variables if not exists."""
    from app.auth.jwt import hash_password
    from app.models.user import User

    session = SessionLocal()
    try:
        # Check if any user exists
        existing_user = session.execute(select(User)).scalars().first()
        if existing_user is not None:
            return

        # Create admin user from environment
        admin = User(
            username=os.environ.get('ADMIN_USERNAME', 'admin'),
            password_hash=hash_password(os.environ.get('ADMIN_PASSWORD', 'demo1234')),
        )
        session.add(admin)
        session.commit()
    finally:
        session.close()


# Ensure settings exist at initialization
def init_settings() -> None:
    session = SessionLocal()
    try:
        if not session.execute(select(Settings)).scalars().first():
            session.add(Settings(id=1, alerts_enabled=False))
            session.commit()
    finally:
        session.close()


# Initialize sample modules
def init_modules() -> None:
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
