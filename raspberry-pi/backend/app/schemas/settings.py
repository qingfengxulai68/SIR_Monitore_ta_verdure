"""Settings schemas."""

from pydantic import BaseModel, HttpUrl


# Settings Responses
class AlertsResponse(BaseModel):
    """Alerts settings response schema."""

    discord_enabled: bool
    discord_webhook_url: str | None = None
    email_enabled: bool
    receiver_email: str | None = None


# Settings Requests
class AlertsUpdateRequest(BaseModel):
    """Update alerts request schema."""

    discord_enabled: bool
    discord_webhook_url: HttpUrl | None = None
    email_enabled: bool
    receiver_email: str | None = None
