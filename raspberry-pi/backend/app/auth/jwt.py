"""JWT utilities for authentication."""

import os
from datetime import UTC, datetime, timedelta, timezone
from typing import Annotated

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_session
from app.models.user import User

security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: int, username: str) -> str:
    """Create a JWT access token."""
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    payload = {
        "sub": str(user_id),
        "username": username,
        "exp": expire,
    }
    return jwt.encode(payload, os.environ.get('JWT_SECRET_KEY'), algorithm='HS256')


def decode_token(token: str) -> dict | None:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(
            token, os.environ.get('JWT_SECRET_KEY'), algorithms=['HS256']
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError as e:
        return None
    except Exception as e:
        return None


async def verify_jwt_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    session: Annotated[Session, Depends(get_session)],
) -> User:
    """Get the current authenticated user from JWT token."""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = session.execute(select(User).where(User.id == user_id)).scalars().first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
