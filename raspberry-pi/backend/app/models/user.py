"""User model."""

from sqlalchemy import CheckConstraint, Column, Integer, String
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class User(Base):
    """User database model (single row, id=1)"""

    __tablename__ = "users"
    __table_args__ = (CheckConstraint("id = 1", name="check_singleton_id_users"),)

    id = Column(Integer, primary_key=True, nullable=False, default=1)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
