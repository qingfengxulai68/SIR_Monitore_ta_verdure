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
from app.schemas.sensor_values import (
    SensorValuesResponse,
    SensorValuesAddRequest,

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
    # Values
    "SensorValuesResponse",
    # Sensor
    "SensorValuesAddRequest",
    # Settings
    "AlertsResponse",
    "AlertsEnableRequest",
    # WebSocket
    "PlantMetricsMessage",
    "PlantMetricsPayload",
    "ModuleConnectionMessage",
    "ModuleConnectionPayload",
    "EntityChangeMessage",
    "EntityChangePayload",
]
