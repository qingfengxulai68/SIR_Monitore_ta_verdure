"""Pydantic schemas."""

from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    UserResponse,
)
from app.schemas.module import CoupledPlantResponse, ModuleResponse
from app.schemas.plant import (
    PlantCreateRequest,
    PlantResponse,
    PlantUpdateRequest,
    ThresholdRangeRequest,
    ThresholdRangeResponse,
    ThresholdsRequest,
    ThresholdsResponse,
)
from app.schemas.values import (
    ValuesResponse,
    ValuesAddRequest,

)
from app.schemas.settings import (
    AlertsEnableRequest,
    AlertsResponse,
)
from app.schemas.websocket import (
    EntityChangeMessage,
    EntityChangePayload,
    ModuleConnectionMessage,
    ModuleConnectionPayload,
    PlantMetricsMessage,
    PlantMetricsPayload,
    PlantMetricsValues,
)

__all__ = [
    # Auth
    "LoginRequest",
    "LoginResponse",
    "UserResponse",
    "ChangePasswordRequest",
    # Module
    "ModuleResponse",
    "CoupledPlantResponse",
    # Plant
    "PlantCreateRequest",
    "PlantUpdateRequest",
    "PlantResponse",
    "ThresholdRangeRequest",
    "ThresholdRangeResponse",
    "ThresholdsRequest",
    "ThresholdsResponse",
    # Values
    "ValuesResponse",
    # Sensor
    "ValuesAddRequest",
    # Settings
    "AlertsResponse",
    "AlertsEnableRequest",
    # WebSocket
    "PlantMetricsMessage",
    "PlantMetricsPayload",
    "PlantMetricsValues",
    "ModuleConnectionMessage",
    "ModuleConnectionPayload",
    "EntityChangeMessage",
    "EntityChangePayload",
]
