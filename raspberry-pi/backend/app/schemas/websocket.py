"""WebSocket event schemas."""

from datetime import datetime
from typing import Literal
from pydantic import BaseModel

from app.schemas.sensor_values import SensorValuesResponse


# PlantMetrics WebSocket event schemas
class PlantMetricsPayload(BaseModel):
    """PLANT_METRICS WebSocket event payload."""

    plantId: int
    values: SensorValuesResponse
    status: Literal["ok", "alert", "offline"]


class PlantMetricsMessage(BaseModel):
    """PLANT_METRICS WebSocket message."""

    type: Literal["PLANT_METRICS"] = "PLANT_METRICS"
    payload: PlantMetricsPayload


# ModuleConnection WebSocket event schemas
class ModuleConnectionPayload(BaseModel):
    """MODULE_CONNECTION WebSocket event payload."""

    moduleId: str
    isOnline: bool
    coupledPlantId: int | None


class ModuleConnectionMessage(BaseModel):
    """MODULE_CONNECTION WebSocket message."""

    type: Literal["MODULE_CONNECTION"] = "MODULE_CONNECTION"
    payload: ModuleConnectionPayload


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
