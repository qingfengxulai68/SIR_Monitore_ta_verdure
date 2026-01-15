"""Pydantic schemas."""

from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    UserResponse,
)
from app.schemas.module import ModuleResponse
from app.schemas.plant import (
    PlantCreateRequest,
    PlantResponse,
    PlantUpdateRequest,
    ThresholdRangeRequest,
    ThresholdRangeResponse,
    ThresholdsRequest,
    ThresholdsResponse,
)
from app.schemas.metrics import (
    MetricsResponse,
    MetricsAddRequest,

)
from app.schemas.settings import (
    AlertsUpdateRequest,
    AlertsResponse,
)
from app.schemas.websocket import (
    EntityChangeMessage,
    EntityChangePayload,
    ModuleConnectivityMessage,
    ModuleConnectivityPayload,
    ModuleConnectivityUpdate,
    PlantMetricsMessage,
    PlantMetricsPayload,
)

__all__ = [
    # Auth
    "LoginRequest",
    "LoginResponse",
    "UserResponse",
    "ChangePasswordRequest",
    # Module
    "ModuleResponse",
    # Plant
    "PlantCreateRequest",
    "PlantUpdateRequest",
    "PlantResponse",
    "ThresholdRangeRequest",
    "ThresholdRangeResponse",
    "ThresholdsRequest",
    "ThresholdsResponse",
    # Metrics
    "MetricsResponse",
    # Metrics
    "MetricsAddRequest",
    # Settings
    "AlertsResponse",
    "AlertsUpdateRequest",
    # WebSocket
    "PlantMetricsMessage",
    "PlantMetricsPayload",
    "ModuleConnectivityMessage",
    "ModuleConnectivityPayload",
    "EntityChangeMessage",
    "EntityChangePayload",
]
