"""Authentication router."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.jwt import create_access_token, hash_password, verify_jwt_user, verify_password
from app.database import get_session
from app.models.user import User
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    session: Annotated[Session, Depends(get_session)],
) -> LoginResponse:
    """Authenticate user and return JWT token."""
    # Find user
    user = session.execute(
        select(User).where(User.username == request.username)
    ).scalars().first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Create token
    token = create_access_token(user.id, user.username)

    return LoginResponse(
        token=token,
        user=UserResponse(id=user.id, username=user.username),
    )


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    request: ChangePasswordRequest,
    current_user: Annotated[User, Depends(verify_jwt_user)],
    session: Annotated[Session, Depends(get_session)],
) -> None:
    """Change the current user's password."""
    # Verify current password
    if not verify_password(request.currentPassword, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Current password is incorrect",
        )

    # Update password
    current_user.password_hash = hash_password(request.newPassword)
    session.add(current_user)
    session.commit()

    return None
