"""Settings router."""

from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.jwt import verify_jwt_user
from app.database import get_session
from app.models.settings import Settings
from app.models.user import User
from app.schemas.settings import AlertsResponse, DiscordAlertsUpdateRequest, EmailAlertsUpdateRequest

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/alerts", response_model=AlertsResponse)
async def get_alerts(
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> AlertsResponse:
    """Get global alert settings."""
    settings = session.execute(select(Settings)).scalars().first()
    return AlertsResponse(
        discord_enabled=settings.alerts_discord_enabled,
        discord_webhook_url=settings.discord_webhook_url,
        email_enabled=settings.alerts_email_enabled,
        receiver_email=settings.receiver_email,
    )


@router.put("/alerts/discord", status_code=204)
async def update_discord_alerts(
    request: DiscordAlertsUpdateRequest,
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> None:
    """Update Discord alert settings."""
    settings = session.execute(select(Settings)).scalars().first()
    settings.alerts_discord_enabled = request.discord_enabled
    settings.discord_webhook_url = str(request.discord_webhook_url) if request.discord_webhook_url else None
    session.add(settings)
    session.commit()


@router.put("/alerts/email", status_code=204)
async def update_email_alerts(
    request: EmailAlertsUpdateRequest,
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> None:
    """Update Email alert settings."""
    settings = session.execute(select(Settings)).scalars().first()
    settings.alerts_email_enabled = request.email_enabled
    settings.receiver_email = request.receiver_email
    session.add(settings)
    session.commit()
