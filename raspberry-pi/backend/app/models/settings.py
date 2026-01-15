"""Global settings model."""

from sqlalchemy import Boolean, CheckConstraint, Column, Integer, String

from app.database import Base

class Settings(Base):
    """Global settings database model (single row, id=1)."""

    __tablename__ = "settings"
    __table_args__ = (CheckConstraint("id = 1", name="check_singleton_id"),)

    id = Column(Integer, primary_key=True, nullable=False, default=1)
    alerts_discord_enabled = Column(Boolean, nullable=False, default=False)
    discord_webhook_url = Column(String, nullable=True, default=None)
    alerts_email_enabled = Column(Boolean, nullable=False, default=False)
    receiver_email = Column(String, nullable=True, default=None)

