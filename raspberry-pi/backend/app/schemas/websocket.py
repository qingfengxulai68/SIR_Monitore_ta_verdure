"""WebSocket event schemas."""

from datetime import datetime
from typing import Literal
from pydantic import BaseModel

from app.schemas.metrics import MetricsResponse

# PlantMetrics WebSocket event schemas
class PlantMetricsPayload(BaseModel):
    """PLANT_METRICS WebSocket event payload."""

    plantId: int
    timestamp: datetime
    metrics: MetricsResponse
    isHealthy: bool


class PlantMetricsMessage(BaseModel):
    """PLANT_METRICS WebSocket message."""

    type: Literal["PLANT_METRICS"] = "PLANT_METRICS"
    payload: PlantMetricsPayload


# ModuleConnectivity WebSocket event schemas
class ModuleConnectivityUpdate(BaseModel):
    """Module connectivity update information."""

    isOnline: bool
    lastSeen: datetime

    
class ModuleConnectivityPayload(BaseModel):
    """MODULE_CONNECTIVITY WebSocket event payload."""

    moduleId: str
    connectivity: ModuleConnectivityUpdate


class ModuleConnectivityMessage(BaseModel):
    """MODULE_CONNECTIVITY WebSocket message."""

    type: Literal["MODULE_CONNECTIVITY"] = "MODULE_CONNECTIVITY"
    payload: ModuleConnectivityPayload


# EntityChange WebSocket event schemas
class EntityChangePayload(BaseModel):
    """ENTITY_CHANGE WebSocket event payload."""

    entity: Literal["plant", "module"]
    action: Literal["create", "update", "delete"]
    id: int | str


class EntityChangeMessage(BaseModel):
    """ENTITY_CHANGE WebSocket message."""

    type: Literal["ENTITY_CHANGE"] = "ENTITY_CHANGE"
    payload: EntityChangePayload
