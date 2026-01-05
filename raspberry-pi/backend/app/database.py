"""Database configuration and session management."""

import os
from collections.abc import Generator

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from app.models.module import Module
from app.models.plant import Plant
from app.models.settings import Settings
from app.models.user import Base

# SQLite specific: check_same_thread=False for async
connect_args = {"check_same_thread": False} if "sqlite" in os.environ.get('DATABASE_URL') else {}

engine = create_engine(
    os.environ.get('DATABASE_URL'),
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
            username=os.environ.get('ADMIN_USERNAME'),
            password_hash=hash_password(os.environ.get('ADMIN_PASSWORD')),
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


# Initialize sample plants
def init_plants() -> None:
    session = SessionLocal()
    try:
        # Check if plants already exist
        existing_plants = session.execute(select(Plant)).scalars().first()
        if existing_plants is not None:
            return

        # Create sample plants
        sample_plants = [
            Plant(
                name="Tomato",
                module_id="ESP32-001",
                min_soil_moist=20.0,
                max_soil_moist=60.0,
                min_humidity=40.0,
                max_humidity=70.0,
                min_light=10000.0,
                max_light=30000.0,
                min_temp=15.0,
                max_temp=25.0,
            ),
            Plant(
                name="Lettuce",
                module_id="ESP32-003",
                min_soil_moist=30.0,
                max_soil_moist=70.0,
                min_humidity=50.0,
                max_humidity=80.0,
                min_light=8000.0,
                max_light=25000.0,
                min_temp=10.0,
                max_temp=20.0,
            ),
        ]
        for plant in sample_plants:
            session.add(plant)
            # Update module coupled status
            module = session.execute(select(Module).where(Module.id == plant.module_id)).scalars().first()
            if module:
                module.coupled = True
                session.add(module)
        session.commit()
    finally:
        session.close()
