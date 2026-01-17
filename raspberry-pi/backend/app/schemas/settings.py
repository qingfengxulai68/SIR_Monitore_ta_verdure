"""Settings schemas."""

from pydantic import BaseModel, HttpUrl


# Settings Responses
class AlertsResponse(BaseModel):
    """Alerts settings response schema."""

    discord_enabled: bool
    discord_webhook_url: str | None = None
    email_enabled: bool
    receiver_email: str | None = None


class DiscordAlertsUpdateRequest(BaseModel):
    """Update Discord alerts request schema."""

    discord_enabled: bool
    discord_webhook_url: HttpUrl | None = None


class EmailAlertsUpdateRequest(BaseModel):
    """Update Email alerts request schema."""

    email_enabled: bool
    receiver_email: str | None = None
