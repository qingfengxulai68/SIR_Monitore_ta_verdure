"""Settings schemas."""

from pydantic import BaseModel, HttpUrl


# Settings Responses
class AlertsResponse(BaseModel):
    """Alerts settings response schema."""

    enabled: bool
    discordWebhookUrl: str | None = None


# Settings Requests
class AlertsEnableRequest(BaseModel):
    """Enable alerts request schema."""

    discordWebhookUrl: HttpUrl
