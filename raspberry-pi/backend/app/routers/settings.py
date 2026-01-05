"""Settings router."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.jwt import verify_jwt_user
from app.database import get_session
from app.models.settings import Settings
from app.models.user import User
from app.schemas.settings import AlertsEnableRequest, AlertsResponse

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/alerts", response_model=AlertsResponse)
async def get_alerts(
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> AlertsResponse:
    """Get global alert settings."""
    settings = session.execute(select(Settings)).scalars().first()
    return AlertsResponse(
        enabled=settings.alerts_enabled,
        discordWebhookUrl=settings.discord_webhook_url,
    )


@router.post("/alerts/enable", status_code=status.HTTP_204_NO_CONTENT)
async def enable_alerts(
    request: AlertsEnableRequest,
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> None:
    """Enable alerts with Discord webhook URL."""
    settings = session.execute(select(Settings)).scalars().first()
    settings.discord_webhook_url = str(request.discordWebhookUrl)
    settings.alerts_enabled = True
    session.add(settings)
    session.commit()


@router.post("/alerts/disable", status_code=status.HTTP_204_NO_CONTENT)
async def disable_alerts(
    session: Annotated[Session, Depends(get_session)],
    _current_user: Annotated[User, Depends(verify_jwt_user)],
) -> None:
    """Disable all alerts (Master Switch)."""
    settings = session.execute(select(Settings)).scalars().first()
    settings.alerts_enabled = False
    settings.discord_webhook_url = None
    session.add(settings)
    session.commit()
