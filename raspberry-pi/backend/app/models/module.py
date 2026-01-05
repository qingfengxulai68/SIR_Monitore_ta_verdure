"""Module (hardware) model."""

from sqlalchemy import Boolean, Column, DateTime, String
from app.models.user import Base


class Module(Base):
    """Hardware module database model."""

    __tablename__ = "modules"

    id = Column(String(50), primary_key=True)  # e.g., "ESP32-A4B8"
    coupled = Column(Boolean, nullable=False, index=True)
    last_seen = Column(DateTime, index=True, nullable=True, default=None)
