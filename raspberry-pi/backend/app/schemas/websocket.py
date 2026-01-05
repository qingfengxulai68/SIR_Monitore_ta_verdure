"""WebSocket event schemas."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel


# WebSocket Message Types (The Holy Trinity)


class PlantMetricsValues(BaseModel):
    """Sensor values for PLANT_METRICS."""

    soilMoist: float
    humidity: float
    light: float
    temp: float
    timestamp: datetime


class PlantMetricsPayload(BaseModel):
    """PLANT_METRICS WebSocket event payload."""

    plantId: int
    values: PlantMetricsValues
    status: Literal["ok", "alert", "offline"]


class PlantMetricsMessage(BaseModel):
    """PLANT_METRICS WebSocket message."""

    type: Literal["PLANT_METRICS"] = "PLANT_METRICS"
    payload: PlantMetricsPayload


class ModuleConnectionPayload(BaseModel):
    """MODULE_CONNECTION WebSocket event payload."""

    moduleId: str
    isOnline: bool
    coupledPlantId: int | None


class ModuleConnectionMessage(BaseModel):
    """MODULE_CONNECTION WebSocket message."""

    type: Literal["MODULE_CONNECTION"] = "MODULE_CONNECTION"
    payload: ModuleConnectionPayload


class EntityChangePayload(BaseModel):
    """ENTITY_CHANGE WebSocket event payload."""

    entity: Literal["plant", "module"]
    action: Literal["create", "update", "delete"]
    id: int | str


class EntityChangeMessage(BaseModel):
    """ENTITY_CHANGE WebSocket message."""

    type: Literal["ENTITY_CHANGE"] = "ENTITY_CHANGE"
    payload: EntityChangePayload
