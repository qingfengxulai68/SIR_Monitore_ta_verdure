"""Authentication schemas."""

from pydantic import BaseModel, Field


# Authentication Requests
class LoginRequest(BaseModel):
    """Login request schema."""

    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=8)


class ChangePasswordRequest(BaseModel):
    """Change password request schema."""

    currentPassword: str = Field(..., min_length=8)
    newPassword: str = Field(..., min_length=8)


# Authentication Responses
class UserResponse(BaseModel):
    """User response schema."""

    id: int
    username: str


class LoginResponse(BaseModel):
    """Login response schema."""

    token: str
    user: UserResponse
